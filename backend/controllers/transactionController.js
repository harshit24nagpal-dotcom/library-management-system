const Transaction = require('../models/Transaction');
const Book = require('../models/Book');
const User = require('../models/User');

// Helper to update overdue transactions status dynamically
const updateOverdueStatus = async () => {
  try {
    const today = new Date();
    const activeTransactions = await Transaction.find({ status: 'issued' });
    
    for (const trans of activeTransactions) {
      if (new Date(trans.dueDate) < today) {
        // Calculate late days
        const diffTime = Math.abs(today - new Date(trans.dueDate));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const fineAmount = diffDays * 1; // $1 or 1 unit per day

        await Transaction.findByIdAndUpdate(trans._id, {
          status: 'overdue',
          fineAmount
        });
      }
    }
  } catch (error) {
    console.error('Error updating overdue statuses:', error);
  }
};

// @desc    Issue a book to a member
// @route   POST /api/transactions/issue
// @access  Private/Admin
const issueBook = async (req, res) => {
  const { bookId, memberId, durationDays } = req.body;

  if (!bookId || !memberId) {
    return res.status(400).json({ message: 'Please provide bookId and memberId' });
  }

  try {
    // Check if book exists and is available
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    if (book.availableCopies <= 0) {
      return res.status(400).json({ message: 'Book is out of stock' });
    }

    // Check if member exists
    const member = await User.findById(memberId);
    if (!member || member.role !== 'member') {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Calculate due date
    const days = Number(durationDays) || 14;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);

    // Create transaction
    const transaction = await Transaction.create({
      bookId,
      memberId,
      dueDate,
      issuedBy: req.user._id,
      status: 'issued'
    });

    // Decrement book available copies
    await Book.findByIdAndUpdate(bookId, {
      $inc: { availableCopies: -1 }
    });

    // Populate and return transaction
    const populated = await Transaction.findById(transaction._id)
      .populate('bookId')
      .populate('memberId');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Return a book
// @route   POST /api/transactions/return/:id
// @access  Private/Admin
const returnBook = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    if (transaction.status === 'returned') {
      return res.status(400).json({ message: 'Book already returned' });
    }

    const today = new Date();
    let fineAmount = 0;
    
    // Calculate fine if returned late
    if (today > new Date(transaction.dueDate)) {
      const diffTime = Math.abs(today - new Date(transaction.dueDate));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      fineAmount = diffDays * 1; // $1 per day
    }

    // Update transaction
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      {
        returnDate: today,
        status: 'returned',
        fineAmount
      },
      { new: true }
    );

    // Increment book available copies
    await Book.findByIdAndUpdate(transaction.bookId, {
      $inc: { availableCopies: 1 }
    });

    res.json(updatedTransaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear / Pay transaction fine
// @route   POST /api/transactions/pay-fine/:id
// @access  Private/Admin
const payFine = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const updated = await Transaction.findByIdAndUpdate(
      req.params.id,
      { finePaid: true },
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private/Admin
const getTransactions = async (req, res) => {
  try {
    await updateOverdueStatus(); // Sync overdue status
    
    const { status } = req.query;
    let query = {};
    if (status) {
      query.status = status;
    }

    const list = await Transaction.find(query)
      .populate('bookId')
      .populate('memberId')
      .sort({ issueDate: -1 });

    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get member borrow history
// @route   GET /api/transactions/member
// @access  Private
const getMemberHistory = async (req, res) => {
  try {
    await updateOverdueStatus();
    
    const history = await Transaction.find({ memberId: req.user._id })
      .populate('bookId')
      .sort({ issueDate: -1 });
      
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard analytics
// @route   GET /api/transactions/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    await updateOverdueStatus();

    // Fetch collections
    const books = await Book.find({});
    const members = await User.find({ role: 'member' });
    const transactions = await Transaction.find({});

    // 1. Basic Stats
    const totalTitles = books.length;
    const totalCopies = books.reduce((sum, b) => sum + (b.copies || 0), 0);
    const totalAvailable = books.reduce((sum, b) => sum + (b.availableCopies || 0), 0);
    
    const totalMembers = members.length;
    const activeBorrows = transactions.filter(t => t.status === 'issued' || t.status === 'overdue').length;
    const overdueBorrows = transactions.filter(t => t.status === 'overdue').length;

    // Fines
    const pendingFines = transactions
      .filter(t => t.fineAmount > 0 && !t.finePaid)
      .reduce((sum, t) => sum + t.fineAmount, 0);
      
    const collectedFines = transactions
      .filter(t => t.fineAmount > 0 && t.finePaid)
      .reduce((sum, t) => sum + t.fineAmount, 0);

    // 2. Genre Distribution (for SVG Chart)
    const genreMap = {};
    books.forEach(b => {
      genreMap[b.genre] = (genreMap[b.genre] || 0) + b.copies;
    });
    const genreDistribution = Object.keys(genreMap).map(name => ({
      name,
      value: genreMap[name]
    })).sort((a, b) => b.value - a.value).slice(0, 5); // top 5

    // 3. Issue Trends over time (last 7 months/weeks)
    // We can count issues grouped by Month Name
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendMap = {};
    
    // Seed last 6 months
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const mName = months[d.getMonth()];
      trendMap[mName] = 0;
    }

    transactions.forEach(t => {
      const issueDate = new Date(t.issueDate);
      const mName = months[issueDate.getMonth()];
      if (trendMap[mName] !== undefined) {
        trendMap[mName]++;
      }
    });

    const issueTrends = Object.keys(trendMap).map(month => ({
      name: month,
      issues: trendMap[month]
    }));

    // 4. Recent Activities
    const populatedTrans = await Transaction.find({})
      .populate('bookId')
      .populate('memberId')
      .sort({ issueDate: -1 });
    const recentActivities = populatedTrans.slice(0, 5);

    res.json({
      summary: {
        totalTitles,
        totalCopies,
        totalAvailable,
        totalMembers,
        activeBorrows,
        overdueBorrows,
        pendingFines,
        collectedFines
      },
      genreDistribution,
      issueTrends,
      recentActivities
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  issueBook,
  returnBook,
  payFine,
  getTransactions,
  getMemberHistory,
  getDashboardStats
};
