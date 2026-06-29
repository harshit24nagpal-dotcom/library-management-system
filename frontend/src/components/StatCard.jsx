import React from 'react';

export const StatCard = ({ title, value, icon, color = 'var(--primary)', description }) => {
  // Map color names to glow styles
  const getGlowColor = () => {
    if (color.startsWith('#')) return color + '20';
    return color;
  };

  return (
    <div className="glass glass-interactive" style={{
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Glow effect on the left border */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '4px',
        backgroundColor: color
      }}></div>

      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        <div style={{
          backgroundColor: `rgba(${color === 'var(--primary)' ? '95, 85, 250' : color === 'var(--accent)' ? '0, 229, 255' : color === 'var(--success)' ? '16, 185, 129' : color === 'var(--warning)' ? '245, 158, 11' : '239, 68, 68'}, 0.12)`,
          color: color,
          width: '42px',
          height: '42px',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </div>
      </div>

      <div className="stat-card-value" style={{ color: '#fff' }}>
        {value}
      </div>

      {description && (
        <div style={{
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          marginTop: '0.5rem',
          fontWeight: 500
        }}>
          {description}
        </div>
      )}
    </div>
  );
};
export default StatCard;
