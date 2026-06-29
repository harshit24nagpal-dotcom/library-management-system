const { getModel } = require('../config/db');

const userSchemaDefinition = {
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'member'], default: 'member' },
  memberId: { type: String, unique: true },
  phone: { type: String }
};

module.exports = getModel('User', userSchemaDefinition);
