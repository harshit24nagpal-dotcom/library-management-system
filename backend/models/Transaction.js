const mongoose = require('mongoose');
const { getModel } = require('../config/db');

const transactionSchemaDefinition = {
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issueDate: { type: Date, required: true, default: Date.now },
  dueDate: { type: Date, required: true },
  returnDate: { type: Date },
  status: { type: String, enum: ['issued', 'returned', 'overdue'], default: 'issued' },
  fineAmount: { type: Number, default: 0 },
  finePaid: { type: Boolean, default: false },
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
};

module.exports = getModel('Transaction', transactionSchemaDefinition);
