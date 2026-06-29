# 📚 Lumina Library Management System

Lumina is a modern, responsive, full-stack **Library Management System** built with **React (Vite)** on the frontend and **Node.js (Express)** on the backend. It features a complete administrative interface for managing book inventories, member registries, book issuance/returns, fine collection, and a personal dashboard for library members.

The application features a unique **hybrid database layer** that runs on **MongoDB** by default, but seamlessly falls back to a **local JSON database** for zero-setup local testing.

---

## 🌟 Key Features

### 👤 Role-Based Access Control (RBAC)
*   **System Administrators**:
    *   Full dashboard analytics (real-time stats on books, active issues, members, and collected/pending fines).
    *   Complete Book Catalog CRUD (Create, Read, Update, Delete) with shelf/rack tracking.
    *   Member Registry Management (add, update, search, delete member accounts).
    *   Issue & Return Workstation (checkout books, return books, calculate/process overdue fines).
*   **Library Members**:
    *   Personal Dashboard (active borrowed books, transaction history, pending/paid fines).
    *   Searchable Book Catalog (check book availability and shelf locations in real-time).

### ⚙️ Architecture & Technical Features
*   **🔌 Hybrid Database Configuration**: Automatically connects to MongoDB, but falls back to a local file-based JSON DB (`backend/data/`) if MongoDB is unavailable or if `USE_MOCK_DB=true` is set.
*   **🔒 Secure Authentication**: JSON Web Token (JWT) based authentication stored in local storage, with hashed passwords using bcrypt.
*   **🎨 Premium UI/UX**: Sleek, modern dark-themed user interface styled with custom CSS variables, custom toast alerts, and responsive layouts.

---

## 🛠️ Tech Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19, Vite, Vanilla CSS, Lucide React (Icons) |
| **Backend** | Node.js, Express.js, JWT, BcryptJS |
| **Database** | MongoDB (Mongoose ORM) / Local JSON File DB (Fallback) |
| **Tooling** | Concurrently, Nodemon, Oxlint |

---

## 📁 Project Directory Structure

```text
library-management-system/
├── backend/                  # Express REST API Server
│   ├── config/               # Database and server config (MongoDB vs JSON DB)
│   ├── controllers/          # Business logic handlers (auth, books, transactions, etc.)
│   ├── data/                 # JSON file fallback storage for local mock DB
│   ├── middleware/           # Route protection & admin verification middleware
│   ├── models/               # MongoDB/Mongoose & Mock database schemas
│   ├── utils/                # Database seeder & Mock DB class implementation
│   ├── .env                  # Backend environment variables
│   ├── server.js             # Main server entrypoint
│   └── package.json          # Backend dependencies
│
├── frontend/                 # React SPA (Vite)
│   ├── src/
│   │   ├── components/       # Common UI elements (Sidebar, Navbar)
│   │   ├── context/          # Global AuthContext & state management
│   │   ├── pages/            # View components (Dashboard, BookMgmt, MemberMgmt, etc.)
│   │   ├── services/         # API fetch wrapper functions
│   │   ├── App.jsx           # Routing & layout setup
│   │   └── index.css         # Modern core theme & global styles
│   ├── vite.config.js        # Vite configuration
│   └── package.json          # Frontend dependencies
│
└── package.json              # Monorepo scripts and concurrency config
```

---

## 🚀 Getting Started

Follow these instructions to get the application running on your local machine.

### 📋 Prerequisites
*   [Node.js](https://nodejs.org/) (v16 or higher recommended)
*   [MongoDB Community Server](https://www.mongodb.com/try/download/community) (Optional - if not installed, the project automatically falls back to the self-contained mock database).

### 🔧 Installation & Setup

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/harshit24nagpal-dotcom/library-management-system.git
    cd library-management-system
    ```

2.  **Install dependencies**:
    Install all frontend and backend dependencies using the root helper script:
    ```bash
    npm run install-all
    ```

3.  **Configure Environment Variables**:
    Create a `.env` file in the `backend/` directory (or modify the existing one):
    ```env
    PORT=5000
    MONGODB_URI=mongodb://127.0.0.1:27017/library-system
    JWT_SECRET=supersecretlibrarykey123
    USE_MOCK_DB=false
    ```
    > [!TIP]
    > To test the system without installing MongoDB, set `USE_MOCK_DB=true`. The backend will read and write data directly to JSON files located in `backend/data/`.

4.  **Seed the Database**:
    Initialize the database with sample administrators, members, book inventory, and borrowing transactions:
    ```bash
    npm run seed --prefix backend
    ```

5.  **Run the Application**:
    Start both the backend server and the frontend client concurrently with a single command from the root directory:
    ```bash
    npm run dev
    ```
    *   **Frontend Client**: `http://localhost:5173`
    *   **Backend API Server**: `http://localhost:5000`

---

## 🔑 Test Credentials

Once you run the seeder, the following users will be available for logging in:

### 🛠️ Administrator Account
*   **Email**: `admin@lumina.com`
*   **Password**: `admin123`

### 👥 Member Accounts
All member accounts share the same password (`password123`).
*   `harshit@lumina.com`
*   `nehal@lumina.com`
*   `kanika@lumina.com`
*   `arpit@lumina.com`
*   `akshat@lumina.com`
*   `prerak@lumina.com`
*   `nishant@lumina.com`

---

## ⚙️ REST API Endpoints Reference

### 🔐 Authentication (`/api/auth`)
*   `POST /register` - Register a new user
*   `POST /login` - Login user & return token
*   `GET /profile` - Retrieve logged-in user profile details (protected)

### 📚 Books (`/api/books`)
*   `GET /` - Retrieve all books (public)
*   `GET /:id` - Retrieve single book details (public)
*   `POST /` - Add a new book (Admin only)
*   `PUT /:id` - Update book details (Admin only)
*   `DELETE /:id` - Remove a book (Admin only)

### 👥 Members (`/api/members`)
*   `GET /` - List all members (Admin only)
*   `GET /:id` - Get specific member details (Admin only)
*   `PUT /:id` - Update member details (Admin only)
*   `DELETE /:id` - Delete member (Admin only)

### 🔄 Transactions (`/api/transactions`)
*   `POST /issue` - Issue a book to a member (Admin only)
*   `POST /return/:id` - Return a borrowed book (Admin only)
*   `POST /pay-fine/:id` - Mark transaction fine as paid (Admin only)
*   `GET /` - List all transaction history (Admin only)
*   `GET /member` - Get current member's personal checkout history (protected)
*   `GET /stats` - Retrieve library-wide statistics (Admin only)
