const User = require('../models/User');
const Transaction = require('../models/Transaction');

// @desc    Get all members
// @route   GET /api/members
// @access  Private/Admin
const getMembers = async (req, res) => {
  try {
    const { search } = req.query;
    let members = await User.find({ role: 'member' });

    if (search) {
      const searchLower = search.toLowerCase();
      members = members.filter(member => 
        member.name.toLowerCase().includes(searchLower) ||
        member.email.toLowerCase().includes(searchLower) ||
        member.memberId.toLowerCase().includes(searchLower)
      );
    }

    // Strip passwords before sending
    members = members.map(m => {
      const cloned = { ...m };
      delete cloned.password;
      return cloned;
    });

    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get member details & transaction history
// @route   GET /api/members/:id
// @access  Private/Admin
const getMemberById = async (req, res) => {
  try {
    const member = await User.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const clonedMember = { ...member };
    delete clonedMember.password;

    // Get borrow history
    const history = await Transaction.find({ memberId: req.params.id })
      .populate('bookId')
      .sort({ issueDate: -1 });

    res.json({
      member: clonedMember,
      history
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update member profile (Admin)
// @route   PUT /api/members/:id
// @access  Private/Admin
const updateMemberProfile = async (req, res) => {
  const { name, email, phone } = req.body;

  try {
    const member = await User.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Check if email already exists on another user
    if (email && email !== member.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email is already taken' });
      }
    }

    const updatedMember = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: name || member.name,
        email: email || member.email,
        phone: phone !== undefined ? phone : member.phone
      },
      { new: true }
    );

    const cloned = { ...updatedMember };
    delete cloned.password;

    res.json(cloned);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete member
// @route   DELETE /api/members/:id
// @access  Private/Admin
const deleteMember = async (req, res) => {
  try {
    const member = await User.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Check if member has active borrows
    const activeBorrows = await Transaction.countDocuments({
      memberId: req.params.id,
      status: 'issued'
    });

    if (activeBorrows > 0) {
      return res.status(400).json({
        message: 'Cannot delete member with active book checkouts'
      });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Member account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMembers, getMemberById, updateMemberProfile, deleteMember };
