import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';
import { StatCard } from '../components/StatCard';
import { IssueTrendsChart, GenreDistributionChart } from '../components/Charts';
import { 
  Book, 
  Users, 
  BookCopy, 
  AlertTriangle, 
  DollarSign,
  ArrowRight,
  Plus,
  RotateCcw,
  Calendar,
  CheckCircle2
} from 'lucide-react';

export const Dashboard = ({ showToast, setCurrentView }) => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [memberHistory, setMemberHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user.role === 'admin';

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const data = await api.get('/transactions/stats');
        setStats(data);
      } else {
        const data = await api.get('/transactions/member');
        setMemberHistory(data);
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to fetch dashboard statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '50vh' }}>
        <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>Loading Dashboard Intel...</p>
      </div>
    );
  }

  // --- ADMIN VIEW ---
  if (isAdmin && stats) {
    const { summary, genreDistribution, issueTrends, recentActivities } = stats;

    return (
      <div className="page-container">
        <div style={{ marginBottom: '2rem' }}>
          <h1>System Overview</h1>
          <p>Real-time analytics and activity for Lumina Library operations.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid-cols-4">
          <StatCard
            title="Book Catalog"
            value={summary.totalTitles}
            icon={<Book size={22} />}
            color="var(--primary)"
            description={`${summary.totalCopies} total registered copies`}
          />
          <StatCard
            title="Active Members"
            value={summary.totalMembers}
            icon={<Users size={22} />}
            color="var(--accent)"
            description="Registered borrowers"
          />
          <StatCard
            title="Active Checkouts"
            value={summary.activeBorrows}
            icon={<BookCopy size={22} />}
            color="var(--warning)"
            description={`${summary.totalAvailable} available on shelves`}
          />
          <StatCard
            title="Pending Fines"
            value={`$${summary.pendingFines}`}
            icon={<DollarSign size={22} />}
            color="var(--danger)"
            description={`$${summary.collectedFines} total collected`}
          />
        </div>

        {/* Charts & Actions Row */}
        <div className="grid-main" style={{ marginBottom: '1.5rem' }}>
          {/* Left Column: Line Chart */}
          <div className="glass" style={{ padding: '1.75rem' }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#fff' }}>Monthly Borrow Trends</h3>
            <IssueTrendsChart data={issueTrends} />
          </div>

          {/* Right Column: Genre distribution & Quick Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass" style={{ padding: '1.5rem', flex: 1 }}>
              <h3 style={{ marginBottom: '1rem', color: '#fff' }}>Popular Genres</h3>
              <GenreDistributionChart data={genreDistribution} />
            </div>
            
            <div className="glass" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', color: '#fff' }}>Quick Management</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button 
                  onClick={() => setCurrentView('issue-return')} 
                  className="btn btn-primary btn-sm" 
                  style={{ width: '100%', justifyContent: 'space-between' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={16} /> Issue a Book
                  </span>
                  <ArrowRight size={14} />
                </button>
                <button 
                  onClick={() => setCurrentView('books')} 
                  className="btn btn-secondary btn-sm" 
                  style={{ width: '100%', justifyContent: 'space-between' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Book size={16} /> Catalog Inventory
                  </span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Checkout Activities */}
        <div className="glass" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: '#fff' }}>Recent Checkout Activities</h3>
            <button 
              onClick={() => setCurrentView('issue-return')} 
              style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              Manage all transactions <ArrowRight size={14} />
            </button>
          </div>

          <div className="table-container">
            {recentActivities.length === 0 ? (
              <p style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>No recent activities found.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Book</th>
                    <th>Borrower</th>
                    <th>Checkout Date</th>
                    <th>Due Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivities.map((act) => {
                    const statusClass = act.status === 'returned' ? 'badge-success' : act.status === 'overdue' ? 'badge-danger' : 'badge-warning';
                    return (
                      <tr key={act._id}>
                        <td>
                          <div style={{ fontWeight: 600, color: '#fff' }}>{act.bookId?.title || 'Unknown Book'}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{act.bookId?.author}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{act.memberId?.name || 'Unknown Member'}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ID: {act.memberId?.memberId}</div>
                        </td>
                        <td>{new Date(act.issueDate).toLocaleDateString()}</td>
                        <td>{new Date(act.dueDate).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge ${statusClass}`}>
                            {act.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- MEMBER VIEW ---
  // Count active/overdue borrows for the member
  const activeBorrows = memberHistory.filter(t => t.status === 'issued' || t.status === 'overdue');
  const overdueCount = memberHistory.filter(t => t.status === 'overdue').length;
  const unpaidFines = memberHistory
    .filter(t => t.fineAmount > 0 && !t.finePaid)
    .reduce((sum, t) => sum + t.fineAmount, 0);

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1>Welcome, {user.name}</h1>
        <p>Manage your borrow logs, catalog reservation requests, and outstanding fees.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
        <StatCard
          title="Books Borrowed"
          value={activeBorrows.length}
          icon={<BookCopy size={22} />}
          color="var(--primary)"
          description="Currently in your possession"
        />
        <StatCard
          title="Overdue Notices"
          value={overdueCount}
          icon={<AlertTriangle size={22} />}
          color={overdueCount > 0 ? 'var(--danger)' : 'var(--success)'}
          description="Action required immediately"
        />
        <StatCard
          title="Outstanding Fines"
          value={`$${unpaidFines}`}
          icon={<DollarSign size={22} />}
          color={unpaidFines > 0 ? 'var(--danger)' : 'var(--success)'}
          description="Late checkout fees"
        />
        <StatCard
          title="Library Identifier"
          value={user.memberId}
          icon={<Users size={22} />}
          color="var(--accent)"
          description="Use at desk checkouts"
        />
      </div>

      {/* Main Grid: Checked out Books and Past History */}
      <div className="grid-main">
        {/* Left Column: Active Checkouts */}
        <div className="glass" style={{ padding: '1.75rem' }}>
          <h3 style={{ marginBottom: '1.25rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookCopy size={20} style={{ color: 'var(--primary)' }} />
            Active Book Checkouts
          </h3>

          {activeBorrows.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={40} style={{ color: 'var(--success)', marginBottom: '1rem', opacity: 0.7 }} />
              <p>No active checkouts. Explore the catalog to borrow your next read!</p>
              <button 
                onClick={() => setCurrentView('books')} 
                className="btn btn-secondary btn-sm" 
                style={{ marginTop: '1rem' }}
              >
                Browse Book Catalog
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {activeBorrows.map(item => {
                const isOverdue = item.status === 'overdue';
                const dueDate = new Date(item.dueDate);
                const today = new Date();
                const diffTime = dueDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                return (
                  <div key={item._id} className="glass" style={{
                    padding: '1.25rem',
                    border: `1px solid ${isOverdue ? 'rgba(239, 68, 68, 0.25)' : 'var(--border-color)'}`,
                    backgroundColor: isOverdue ? 'rgba(239, 68, 68, 0.02)' : 'rgba(255, 255, 255, 0.01)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                        {item.bookId?.genre}
                      </div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
                        {item.bookId?.title}
                      </h4>
                      <p style={{ fontSize: '0.85rem' }}>by {item.bookId?.author}</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                      {/* Due date countdown */}
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Due Date</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: isOverdue ? 'var(--danger)' : '#fff' }}>
                          {dueDate.toLocaleDateString()}
                        </div>
                        {isOverdue ? (
                          <div style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600 }}>
                            Overdue! Fine: ${item.fineAmount}
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.75rem', color: diffDays <= 3 ? 'var(--warning)' : 'var(--success)', fontWeight: 600 }}>
                            {diffDays} days left
                          </div>
                        )}
                      </div>

                      <span className={`badge ${isOverdue ? 'badge-danger' : 'badge-warning'}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Complete Borrowing logs */}
        <div className="glass" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.25rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RotateCcw size={20} style={{ color: 'var(--accent)' }} />
            History Log
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto' }}>
            {memberHistory.filter(t => t.status === 'returned').length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
                No past transactions recorded.
              </p>
            ) : (
              memberHistory.filter(t => t.status === 'returned').map(item => (
                <div key={item._id} style={{
                  padding: '0.75rem',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ overflow: 'hidden', paddingRight: '0.5rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.bookId?.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Returned: {new Date(item.returnDate).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                    returned
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
