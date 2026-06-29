const mongoose = require('mongoose');
const { MockModel } = require('../utils/mockDb');

let isMock = false;

const connectDB = async () => {
  if (process.env.USE_MOCK_DB === 'true') {
    console.log('⚠️ [Database] USE_MOCK_DB is set to true. Using local JSON database.');
    isMock = true;
    return;
  }
  
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/library-system', {
      serverSelectionTimeoutMS: 2500 // Quick timeout to fall back fast
    });
    console.log(`🔌 [Database] MongoDB Connected: ${conn.connection.host}`);
    isMock = false;
  } catch (error) {
    console.warn(`⚠️ [Database] MongoDB connection failed: ${error.message}`);
    console.warn('⚠️ [Database] Falling back to local JSON database for self-contained testing.');
    isMock = true;
  }
};

const getModel = (name, schemaDefinition) => {
  let mongooseModel = null;
  let mockModel = null;

  const getTargetModel = () => {
    if (isMock) {
      if (!mockModel) {
        mockModel = new MockModel(name);
      }
      return mockModel;
    } else {
      if (!mongooseModel) {
        mongooseModel = mongoose.models[name] || mongoose.model(name, new mongoose.Schema(schemaDefinition, { timestamps: true }));
      }
      return mongooseModel;
    }
  };

  return new Proxy({}, {
    get(target, prop, receiver) {
      const model = getTargetModel();
      const value = model[prop];
      if (typeof value === 'function') {
        return value.bind(model);
      }
      return value;
    },
    construct(target, args, newTarget) {
      const model = getTargetModel();
      return Reflect.construct(model, args, newTarget);
    }
  });
};

module.exports = { connectDB, getModel, isMock: () => isMock };
