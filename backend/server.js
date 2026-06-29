const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const { protect, adminOnly } = require('./middleware/authMiddleware');

const { registerUser, loginUser, getProfile } = require('./controllers/authController');
const { getBooks, getBookById, createBook, updateBook, deleteBook } = require('./controllers/bookController');
const { getMembers, getMemberById, updateMemberProfile, deleteMember } = require('./controllers/memberController');
const {
  issueBook,
  returnBook,
  payFine,
  getTransactions,
  getMemberHistory,
  getDashboardStats
} = require('./controllers/transactionController');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes

// 1. Auth Endpoint
const authRouter = express.Router();
authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);
authRouter.get('/profile', protect, getProfile);
app.use('/api/auth', authRouter);

// 2. Book Catalog Endpoints
const bookRouter = express.Router();
bookRouter.get('/', getBooks);
bookRouter.get('/:id', getBookById);
bookRouter.post('/', protect, adminOnly, createBook);
bookRouter.put('/:id', protect, adminOnly, updateBook);
bookRouter.delete('/:id', protect, adminOnly, deleteBook);
app.use('/api/books', bookRouter);

// 3. Member Accounts Endpoints (Admin Only)
const memberRouter = express.Router();
memberRouter.get('/', protect, adminOnly, getMembers);
memberRouter.get('/:id', protect, adminOnly, getMemberById);
memberRouter.put('/:id', protect, adminOnly, updateMemberProfile);
memberRouter.delete('/:id', protect, adminOnly, deleteMember);
app.use('/api/members', memberRouter);

// 4. Issue, Return and Fine Endpoints
const transRouter = express.Router();
transRouter.post('/issue', protect, adminOnly, issueBook);
transRouter.post('/return/:id', protect, adminOnly, returnBook);
transRouter.post('/pay-fine/:id', protect, adminOnly, payFine);
transRouter.get('/', protect, adminOnly, getTransactions);
transRouter.get('/member', protect, getMemberHistory);
transRouter.get('/stats', protect, getDashboardStats);
app.use('/api/transactions', transRouter);

// Default Route
app.get('/', (req, res) => {
  res.send('Library Management System API is running.');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express Error Handler:', err.stack);
  res.status(500).json({ message: err.message || 'Server Error' });
});

// Start Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to DB (or fallback to Mock JSON DB)
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 [Server] Running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  });
};

startServer();
