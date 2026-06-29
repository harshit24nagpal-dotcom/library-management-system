const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const { connectDB, isMock } = require('../config/db');

// Import models
const User = require('../models/User');
const Book = require('../models/Book');
const Transaction = require('../models/Transaction');

const seedDatabase = async () => {
  try {
    console.log('⚡ [Seeder] Connecting to database...');
    await connectDB();
    const mockDbActive = isMock();

    console.log(`⚡ [Seeder] Database connection established. Mock DB Active: ${mockDbActive}`);

    // 1. Clear database
    if (mockDbActive) {
      console.log('⚡ [Seeder] Clearing local JSON database files...');
      const DATA_DIR = path.join(__dirname, '..', 'data');
      fs.writeFileSync(path.join(DATA_DIR, 'users.json'), JSON.stringify([], null, 2));
      fs.writeFileSync(path.join(DATA_DIR, 'books.json'), JSON.stringify([], null, 2));
      fs.writeFileSync(path.join(DATA_DIR, 'transactions.json'), JSON.stringify([], null, 2));
    } else {
      console.log('⚡ [Seeder] Clearing MongoDB collections...');
      await User.deleteMany({});
      await Book.deleteMany({});
      await Transaction.deleteMany({});
    }
    console.log('✅ [Seeder] Database cleared successfully.');

    // 2. Prepare passwords
    console.log('⚡ [Seeder] Hashing passwords...');
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const memberPassword = await bcrypt.hash('password123', salt);

    // 3. Create Admin User
    console.log('⚡ [Seeder] Creating Admin user...');
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@lumina.com',
      password: adminPassword,
      role: 'admin',
      memberId: 'LIB-1000',
      phone: '+1 (555) 010-0000'
    });
    console.log(`✅ [Seeder] Admin created: ${admin.email}`);

    // 4. Create Library Members (Harshit, Nehal, Kanika, Arpit, Akshat, Prerak, Nishant)
    console.log('⚡ [Seeder] Creating Library Members...');
    const memberNames = ['Harshit', 'Nehal', 'Kanika', 'Arpit', 'Akshat', 'Prerak', 'Nishant'];
    const members = [];

    for (let i = 0; i < memberNames.length; i++) {
      const name = memberNames[i];
      const email = `${name.toLowerCase()}@lumina.com`;
      const memberId = `LIB-${1000 + i + 1}`;
      
      const member = await User.create({
        name,
        email,
        password: memberPassword,
        role: 'member',
        memberId,
        phone: `+1 (555) 010-000${i + 1}`
      });
      members.push(member);
      console.log(`   - Created Member: ${name} (${memberId})`);
    }

    // 5. Create Sample Books
    console.log('⚡ [Seeder] Creating Books...');
    const booksData = [
      {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        isbn: '978-0132350884',
        genre: 'Software Engineering',
        copies: 5,
        availableCopies: 4, // 1 is issued to Harshit
        rackLocation: 'A1'
      },
      {
        title: 'The Pragmatic Programmer',
        author: 'Andrew Hunt & David Thomas',
        isbn: '978-0135957059',
        genre: 'Software Engineering',
        copies: 4,
        availableCopies: 4, // 1 was issued and returned by Nehal
        rackLocation: 'A2'
      },
      {
        title: 'Design Patterns',
        author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
        isbn: '978-0201633610',
        genre: 'Software Engineering',
        copies: 3,
        availableCopies: 2, // 1 is issued (overdue) to Kanika
        rackLocation: 'A3'
      },
      {
        title: "You Don't Know JS Yet",
        author: 'Kyle Simpson',
        isbn: '978-1491904244',
        genre: 'JavaScript',
        copies: 6,
        availableCopies: 5, // 1 is issued to Arpit
        rackLocation: 'B1'
      },
      {
        title: 'Introduction to Algorithms',
        author: 'Thomas H. Cormen',
        isbn: '978-0262033848',
        genre: 'Computer Science',
        copies: 3,
        availableCopies: 3,
        rackLocation: 'C1'
      },
      {
        title: 'The Lean Startup',
        author: 'Eric Ries',
        isbn: '978-0307887894',
        genre: 'Business',
        copies: 5,
        availableCopies: 5,
        rackLocation: 'D1'
      }
    ];

    const books = [];
    for (const bookData of booksData) {
      const book = await Book.create(bookData);
      books.push(book);
      console.log(`   - Created Book: "${book.title}"`);
    }

    // Helper map of members and books by index
    // Harshit = members[0], Nehal = members[1], Kanika = members[2], Arpit = members[3]
    // Clean Code = books[0], Pragmatic Programmer = books[1], Design Patterns = books[2], YDKJS = books[3]

    // 6. Create Sample Transactions
    console.log('⚡ [Seeder] Creating Transactions...');

    // A. Harshit checked out "Clean Code" (Active)
    const t1 = await Transaction.create({
      bookId: books[0]._id,
      memberId: members[0]._id,
      issueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),  // 9 days left
      status: 'issued',
      issuedBy: admin._id
    });

    // B. Nehal checked out "The Pragmatic Programmer" and returned it
    const t2 = await Transaction.create({
      bookId: books[1]._id,
      memberId: members[1]._id,
      issueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),  // 1 day ago
      returnDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Returned 2 days ago (on time)
      status: 'returned',
      issuedBy: admin._id
    });

    // C. Kanika checked out "Design Patterns" and is overdue (fine accrued)
    const t3 = await Transaction.create({
      bookId: books[2]._id,
      memberId: members[2]._id,
      issueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
      dueDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),   // 6 days ago (14 day checkout period)
      status: 'overdue',
      fineAmount: 60, // e.g. $10 per day overdue
      finePaid: false,
      issuedBy: admin._id
    });

    // D. Arpit checked out "You Don't Know JS Yet" (Active)
    const t4 = await Transaction.create({
      bookId: books[3]._id,
      memberId: members[3]._id,
      issueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days left
      status: 'issued',
      issuedBy: admin._id
    });

    console.log('✅ [Seeder] Transactions created successfully.');
    console.log('✨ [Seeder] Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ [Seeder] Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
