import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Calendar, User as UserIcon } from 'lucide-react';

export const Navbar = ({ title }) => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="glass" style={{
      padding: '1.25rem 2rem',
      borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
      backgroundColor: 'rgba(14, 19, 32, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      margin: '0 2rem',
      marginTop: '1rem',
      borderTop: 'none'
    }}>
      {/* Title */}
      <div>
        <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>
          {title}
        </h2>
      </div>

      {/* Right side info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {/* Date Display */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          padding: '0.5rem 0.85rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)'
        }}>
          <Calendar size={15} style={{ color: 'var(--primary)' }} />
          <span>{today}</span>
        </div>

        {/* Member ID display */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.85rem',
          color: 'var(--text-primary)',
          backgroundColor: 'rgba(95, 85, 250, 0.08)',
          padding: '0.5rem 0.85rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid rgba(95, 85, 250, 0.2)'
        }}>
          <UserIcon size={15} style={{ color: 'var(--accent)' }} />
          <span style={{ fontWeight: 600 }}>{user.memberId}</span>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
