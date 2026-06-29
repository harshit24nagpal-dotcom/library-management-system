import React from 'react';

// Custom SVG Bar Chart for Issue Trends
export const IssueTrendsChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        No data available
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d => d.issues || 0), 5);
  const height = 200;
  const width = 500;
  const paddingLeft = 30;
  const paddingBottom = 25;
  const chartHeight = height - paddingBottom;
  const chartWidth = width - paddingLeft;
  
  const barWidth = Math.floor(chartWidth / data.length) - 20;

  return (
    <div style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.2" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Y Axis Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = chartHeight - (chartHeight - 20) * ratio;
          const label = Math.round(maxVal * ratio);
          return (
            <g key={idx}>
              <line 
                x1={paddingLeft} 
                y1={y} 
                x2={width} 
                y2={y} 
                stroke="var(--border-color)" 
                strokeWidth="1" 
                strokeDasharray="4 4" 
              />
              <text 
                x={paddingLeft - 8} 
                y={y + 4} 
                fill="var(--text-muted)" 
                fontSize="10" 
                textAnchor="end"
                fontWeight="600"
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((item, idx) => {
          const ratio = (item.issues || 0) / maxVal;
          const barHeight = (chartHeight - 20) * ratio;
          const x = paddingLeft + idx * (chartWidth / data.length) + 10;
          const y = chartHeight - barHeight;

          return (
            <g key={idx} style={{ cursor: 'pointer' }}>
              {/* Tooltip text visible on hover in modern browsers via standard title */}
              <title>{`${item.name}: ${item.issues} checkouts`}</title>

              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 2)}
                fill="url(#barGrad)"
                rx="4"
                style={{
                  transition: 'all 0.3s ease',
                }}
              />
              {/* Highlight Dot/Top */}
              {barHeight > 0 && (
                <rect 
                  x={x}
                  y={y}
                  width={barWidth}
                  height="3"
                  fill="var(--accent)"
                  rx="1"
                  filter="url(#glow)"
                />
              )}
              
              {/* Bar Value Label */}
              <text
                x={x + barWidth / 2}
                y={y - 6}
                fill="var(--text-primary)"
                fontSize="10"
                fontWeight="700"
                textAnchor="middle"
              >
                {item.issues || 0}
              </text>

              {/* X Axis Label */}
              <text
                x={x + barWidth / 2}
                y={height - 6}
                fill="var(--text-secondary)"
                fontSize="11"
                fontWeight="600"
                textAnchor="middle"
              >
                {item.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// Custom Progress List for Genre Distribution
export const GenreDistributionChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        No genre data available
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.5rem 0' }}>
      {data.map((item, idx) => {
        const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
        
        // Dynamic colors for genres
        const colors = ['var(--primary)', 'var(--accent)', 'var(--success)', 'var(--warning)', 'var(--danger)'];
        const barColor = colors[idx % colors.length];

        return (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600 }}>
              <span style={{ color: 'var(--text-primary)' }}>{item.name}</span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {item.value} books <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '0.25rem' }}>({percentage}%)</span>
              </span>
            </div>
            
            {/* Progress bar container */}
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: 'rgba(255,255,255,0.03)',
              borderRadius: '9999px',
              overflow: 'hidden',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{
                width: `${percentage}%`,
                height: '100%',
                backgroundColor: barColor,
                borderRadius: '9999px',
                boxShadow: `0 0 8px ${barColor}50`,
                transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
              }}></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default { IssueTrendsChart, GenreDistributionChart };
