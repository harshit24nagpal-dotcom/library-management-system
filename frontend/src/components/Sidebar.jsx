import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  BookOpen,
  Users,
  BarChart3,
  ArrowLeftRight,
  LogOut,
  Library
} from 'lucide-react';

export const Sidebar = ({ currentView, setCurrentView }) => {
  const { user, logout } = useContext(AuthContext);

  if (!user) return null;

  const isAdmin = user.role === 'admin';

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <BarChart3 size={20} />,
      roles: ['admin', 'member']
    },
    {
      id: 'books',
      label: isAdmin ? 'Book Management' : 'Book Catalog',
      icon: <BookOpen size={20} />,
      roles: ['admin', 'member']
    },
    {
      id: 'members',
      label: 'Member Registry',
      icon: <Users size={20} />,
      roles: ['admin']
    },
    {
      id: 'issue-return',
      label: 'Checkouts / Returns',
      icon: <ArrowLeftRight size={20} />,
      roles: ['admin']
    }
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <aside className="sidebar glass" style={{
      width: '280px',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      borderRadius: '0 var(--radius-xl) var(--radius-xl) 0',
      borderLeft: 'none',
      backgroundColor: 'var(--bg-sidebar)',
      zIndex: 100
    }}>
      {/* Brand logo */}
      <div style={{
        padding: '2rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
          color: '#fff',
          width: '40px',
          height: '40px',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <Library size={22} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.2rem', tracking: '0.05em', color: '#fff' }}>Lumina</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Library System</div>
        </div>
      </div>

      {/* User Quick Info */}
      <div style={{
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(255,255,255,0.01)'
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          backgroundColor: isAdmin ? 'rgba(95, 85, 250, 0.15)' : 'rgba(0, 229, 255, 0.15)',
          border: `1px solid ${isAdmin ? 'rgba(95, 85, 250, 0.3)' : 'rgba(0, 229, 255, 0.3)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          color: isAdmin ? 'var(--primary)' : 'var(--accent)'
        }}>
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {user.name}
          </div>
          <div style={{ display: 'inline-block', marginTop: '0.2rem' }}>
            <span className={`badge ${isAdmin ? 'badge-danger' : 'badge-success'}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
              {user.role}
            </span>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav style={{
        flex: 1,
        padding: '1.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        {filteredItems.map(item => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                backgroundColor: isActive ? 'rgba(95, 85, 250, 0.12)' : 'transparent',
                borderLeft: `3px solid ${isActive ? 'var(--primary)' : 'transparent'}`,
                color: isActive ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: isActive ? 600 : 500,
                textAlign: 'left',
                transition: 'all var(--transition-fast)'
              }}
              className={!isActive ? 'sidebar-btn-hover' : ''}
              onMouseEnter={(e) => {
                if(!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if(!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <span style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}>
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{
        padding: '1.5rem',
        borderTop: '1px solid var(--border-color)'
      }}>
        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            width: '100%',
            padding: '0.85rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            backgroundColor: 'rgba(239, 68, 68, 0.05)',
            color: 'var(--danger)',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.95rem',
            transition: 'all var(--transition-fast)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--danger)';
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.boxShadow = '0 4px 12px -2px rgba(239, 68, 68, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.05)';
            e.currentTarget.style.color = 'var(--danger)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;
