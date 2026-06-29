import React, { useState, useContext, useEffect } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { BookManagement } from './pages/BookManagement';
import { MemberManagement } from './pages/MemberManagement';
import { IssueReturn } from './pages/IssueReturn';

const AppContent = ({ toasts, showToast }) => {
  const { user, loading } = useContext(AuthContext);
  const [currentView, setCurrentView] = useState('dashboard');

  // Page titles lookup
  const pageTitles = {
    dashboard: 'Dashboard Overview',
    books: user?.role === 'admin' ? 'Inventory Catalog' : 'Available Library Books',
    members: 'Member Registry Records',
    'issue-return': 'Borrow Workstation'
  };

  // If role changes or logout happens, verify views
  useEffect(() => {
    if (user) {
      const isAdmin = user.role === 'admin';
      const allowedViews = isAdmin 
        ? ['dashboard', 'books', 'members', 'issue-return']
        : ['dashboard', 'books'];
      
      if (!allowedViews.includes(currentView)) {
        setCurrentView('dashboard');
      }
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '100vh', width: '100vw', backgroundColor: 'var(--bg-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(95, 85, 250, 0.2)',
            borderTop: '3px solid var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1.5rem auto'
          }}></div>
          <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Loading Session...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Auth Guard
  if (!user) {
    return <Login showToast={showToast} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard showToast={showToast} setCurrentView={setCurrentView} />;
      case 'books':
        return <BookManagement showToast={showToast} />;
      case 'members':
        return <MemberManagement showToast={showToast} />;
      case 'issue-return':
        return <IssueReturn showToast={showToast} />;
      default:
        return <Dashboard showToast={showToast} setCurrentView={setCurrentView} />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />

      {/* Main Panel */}
      <div className="main-content">
        <Navbar title={pageTitles[currentView]} />
        <main style={{ flex: 1 }}>
          {renderView()}
        </main>
      </div>

      {/* Floating Notifications List */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`toast toast-${toast.type}`}
          >
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const App = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  return (
    <AuthProvider>
      <AppContent toasts={toasts} showToast={showToast} />
    </AuthProvider>
  );
};

export default App;
