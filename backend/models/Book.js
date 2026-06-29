const { getModel } = require('../config/db');

const bookSchemaDefinition = {
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, required: true, unique: true },
  genre: { type: String, required: true },
  copies: { type: Number, required: true, default: 1 },
  availableCopies: { type: Number, required: true, default: 1 },
  rackLocation: { type: String }
};

module.exports = getModel('Book', bookSchemaDefinition);
