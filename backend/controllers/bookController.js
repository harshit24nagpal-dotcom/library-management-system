const Book = require('../models/Book');

// @desc    Get all books
// @route   GET /api/books
// @access  Public
const getBooks = async (req, res) => {
  try {
    const { search, genre } = req.query;
    let query = {};

    if (genre) {
      query.genre = genre;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } },
        { genre: { $regex: search, $options: 'i' } }
      ];
    }

    // Since mock database might not support complex $or queries directly, 
    // let's handle search filtering programmatically for consistency 
    // or keep query clean. Let's retrieve all books and filter programmatically 
    // if search is present, to ensure 100% compatibility with mockDb.
    let books = await Book.find(genre ? { genre } : {});

    if (search) {
      const searchLower = search.toLowerCase();
      books = books.filter(book => 
        book.title.toLowerCase().includes(searchLower) ||
        book.author.toLowerCase().includes(searchLower) ||
        book.isbn.toLowerCase().includes(searchLower) ||
        book.genre.toLowerCase().includes(searchLower)
      );
    }

    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get book by ID
// @route   GET /api/books/:id
// @access  Public
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (book) {
      res.json(book);
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new book
// @route   POST /api/books
// @access  Private/Admin
const createBook = async (req, res) => {
  const { title, author, isbn, genre, copies, rackLocation } = req.body;

  if (!title || !author || !isbn || !genre) {
    return res.status(400).json({ message: 'Please provide title, author, isbn and genre' });
  }

  try {
    const bookExists = await Book.findOne({ isbn });
    if (bookExists) {
      return res.status(400).json({ message: 'Book with this ISBN already exists' });
    }

    const book = await Book.create({
      title,
      author,
      isbn,
      genre,
      copies: Number(copies) || 1,
      availableCopies: Number(copies) || 1,
      rackLocation: rackLocation || ''
    });

    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Private/Admin
const updateBook = async (req, res) => {
  const { title, author, isbn, genre, copies, rackLocation } = req.body;

  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // If copies is changing, adjust availableCopies
    let availableCopies = book.availableCopies;
    if (copies !== undefined) {
      const copiesDiff = Number(copies) - book.copies;
      availableCopies = Math.max(0, book.availableCopies + copiesDiff);
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      {
        title: title || book.title,
        author: author || book.author,
        isbn: isbn || book.isbn,
        genre: genre || book.genre,
        copies: copies !== undefined ? Number(copies) : book.copies,
        availableCopies,
        rackLocation: rackLocation !== undefined ? rackLocation : book.rackLocation
      },
      { new: true }
    );

    res.json(updatedBook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Private/Admin
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBooks, getBookById, createBook, updateBook, deleteBook };
