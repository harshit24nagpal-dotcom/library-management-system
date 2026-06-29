import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { 
  Plus, 
  Search, 
  Book, 
  User, 
  Calendar, 
  Clock, 
  CheckCircle,
  RotateCcw,
  BookCopy,
  DollarSign
} from 'lucide-react';

export const IssueReturn = ({ showToast }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('active'); // 'active', 'issued', 'overdue', 'returned', 'all'
  
  // Issue Form Autocomplete states
  const [bookQuery, setBookQuery] = useState('');
  const [bookSuggestions, setBookSuggestions] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showBookDropdown, setShowBookDropdown] = useState(false);
  
  const [memberQuery, setMemberQuery] = useState('');
  const [memberSuggestions, setMemberSuggestions] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  
  const [duration, setDuration] = useState(14);
  const [submitting, setSubmitting] = useState(false);

  const bookRef = useRef();
  const memberRef = useRef();

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      // Query parameters
      let endpoint = '/transactions';
      if (filterStatus !== 'all' && filterStatus !== 'active') {
        endpoint += `?status=${filterStatus}`;
      }
      
      let data = await api.get(endpoint);

      // If 'active', filter client-side for issued & overdue
      if (filterStatus === 'active') {
        data = data.filter(t => t.status === 'issued' || t.status === 'overdue');
      }

      setTransactions(data);
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to fetch transactions logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filterStatus]);

  // Click outside to close autocompletes
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (bookRef.current && !bookRef.current.contains(e.target)) {
        setShowBookDropdown(false);
      }
      if (memberRef.current && !memberRef.current.contains(e.target)) {
        setShowMemberDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Book Autocomplete Lookup
  useEffect(() => {
    if (bookQuery.length < 2 || selectedBook) {
      setBookSuggestions([]);
      return;
    }
    
    const delayDebounce = setTimeout(async () => {
      try {
        const data = await api.get(`/books?search=${encodeURIComponent(bookQuery)}`);
        // Filter out books with 0 available copies for checkouts
        setBookSuggestions(data);
        setShowBookDropdown(true);
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [bookQuery, selectedBook]);

  // Member Autocomplete Lookup
  useEffect(() => {
    if (memberQuery.length < 2 || selectedMember) {
      setMemberSuggestions([]);
      return;
    }
    
    const delayDebounce = setTimeout(async () => {
      try {
        const data = await api.get(`/members?search=${encodeURIComponent(memberQuery)}`);
        setMemberSuggestions(data);
        setShowMemberDropdown(true);
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [memberQuery, selectedMember]);

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBook || !selectedMember) {
      showToast('Please select a valid book and member from dropdowns', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/transactions/issue', {
        bookId: selectedBook._id,
        memberId: selectedMember._id,
        durationDays: duration
      });
      
      showToast('Book checkout successful!', 'success');
      
      // Reset Form
      setSelectedBook(null);
      setBookQuery('');
      setSelectedMember(null);
      setMemberQuery('');
      setDuration(14);
      
      fetchTransactions();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Checkout operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturn = async (id) => {
    try {
      await api.post(`/transactions/return/${id}`);
      showToast('Book returned successfully!', 'success');
      fetchTransactions();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Return operation failed', 'error');
    }
  };

  const handleClearFine = async (id) => {
    try {
      await api.post(`/transactions/pay-fine/${id}`);
      showToast('Fine marked as paid!', 'success');
      fetchTransactions();
    } catch (err) {
      console.error(err);
      showToast('Failed to clear fine details', 'error');
    }
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1>Checkouts & Returns</h1>
        <p>Issue books to registered members, process returns, and settle fines.</p>
      </div>

      <div className="grid-main">
        {/* Left Column: Issue Book Panel */}
        <div className="glass" style={{ padding: '1.75rem', height: 'fit-content' }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookCopy size={20} style={{ color: 'var(--primary)' }} />
            New Book Issue
          </h3>

          <form onSubmit={handleIssueSubmit}>
            {/* Book Selection Autocomplete */}
            <div className="form-group autocomplete-container" ref={bookRef}>
              <label className="form-label" htmlFor="book-lookup">Select Book (ISBN or Title)</label>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  id="book-lookup"
                  placeholder="Type title or ISBN..."
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  value={selectedBook ? `${selectedBook.title} (${selectedBook.isbn})` : bookQuery}
                  onChange={(e) => {
                    setBookQuery(e.target.value);
                    if (selectedBook) setSelectedBook(null);
                  }}
                  required
                  autoComplete="off"
                />
                {selectedBook && (
                  <button
                    type="button"
                    onClick={() => { setSelectedBook(null); setBookQuery(''); }}
                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', outline: 'none' }}
                  >
                    Clear
                  </button>
                )}
              </div>

              {showBookDropdown && bookSuggestions.length > 0 && (
                <div className="autocomplete-dropdown">
                  {bookSuggestions.map((book) => {
                    const disabled = book.availableCopies <= 0;
                    return (
                      <div
                        key={book._id}
                        onClick={() => {
                          if (!disabled) {
                            setSelectedBook(book);
                            setShowBookDropdown(false);
                          }
                        }}
                        className="autocomplete-item"
                        style={{
                          opacity: disabled ? 0.5 : 1,
                          cursor: disabled ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{book.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>by {book.author} | ISBN: {book.isbn}</div>
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: disabled ? 'var(--danger)' : 'var(--success)' }}>
                          {disabled ? 'Out of stock' : `${book.availableCopies} left`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Member Selection Autocomplete */}
            <div className="form-group autocomplete-container" ref={memberRef}>
              <label className="form-label" htmlFor="member-lookup">Select Borrower (ID or Name)</label>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  id="member-lookup"
                  placeholder="Type ID or member name..."
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  value={selectedMember ? `${selectedMember.name} (${selectedMember.memberId})` : memberQuery}
                  onChange={(e) => {
                    setMemberQuery(e.target.value);
                    if (selectedMember) setSelectedMember(null);
                  }}
                  required
                  autoComplete="off"
                />
                {selectedMember && (
                  <button
                    type="button"
                    onClick={() => { setSelectedMember(null); setMemberQuery(''); }}
                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', outline: 'none' }}
                  >
                    Clear
                  </button>
                )}
              </div>

              {showMemberDropdown && memberSuggestions.length > 0 && (
                <div className="autocomplete-dropdown">
                  {memberSuggestions.map((member) => (
                    <div
                      key={member._id}
                      onClick={() => {
                        setSelectedMember(member);
                        setShowMemberDropdown(false);
                      }}
                      className="autocomplete-item"
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{member.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{member.email}</div>
                      </div>
                      <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>{member.memberId}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Duration selection */}
            <div className="form-group">
              <label className="form-label" htmlFor="checkout-duration">Borrow Duration</label>
              <select
                id="checkout-duration"
                className="form-input form-select"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              >
                <option value={7}>7 Days (1 Week)</option>
                <option value={14}>14 Days (2 Weeks)</option>
                <option value={30}>30 Days (1 Month)</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ width: '100%', marginTop: '1rem', height: '44px' }}
            >
              {submitting ? 'Issuing...' : 'Issue Book'}
            </button>
          </form>
        </div>

        {/* Right Column: Active Loans Ledger */}
        <div className="glass" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h3 style={{ margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} style={{ color: 'var(--accent)' }} />
              Checkout Log
            </h3>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {['active', 'returned', 'all'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`btn ${filterStatus === status ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  style={{ textTransform: 'capitalize', fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="table-container" style={{ maxHeight: '420px' }}>
            {loading ? (
              <p style={{ textAlign: 'center', padding: '2rem' }}>Loading loans...</p>
            ) : transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
                <CheckCircle size={32} style={{ color: 'var(--success)', margin: '0 auto 1rem auto', opacity: 0.7 }} />
                <p>No transactions match filters.</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Book Details</th>
                    <th>Borrower</th>
                    <th>Dates</th>
                    <th>Fine</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((trans) => {
                    const isIssued = trans.status === 'issued';
                    const isOverdue = trans.status === 'overdue';
                    const isActive = isIssued || isOverdue;

                    return (
                      <tr key={trans._id}>
                        <td>
                          <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem' }}>{trans.bookId?.title || 'Unknown Title'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ISBN: {trans.bookId?.isbn}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{trans.memberId?.name || 'Unknown Borrower'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>ID: {trans.memberId?.memberId}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            <span>Out: {new Date(trans.issueDate).toLocaleDateString()}</span>
                            <span>Due: {new Date(trans.dueDate).toLocaleDateString()}</span>
                            {trans.returnDate && (
                              <span style={{ color: 'var(--success)' }}>
                                Ret: {new Date(trans.returnDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          {trans.fineAmount > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              <span style={{ fontWeight: 700, color: trans.finePaid ? 'var(--success)' : 'var(--danger)', fontSize: '0.85rem' }}>
                                ${trans.fineAmount}
                              </span>
                              {trans.finePaid ? (
                                <span style={{ fontSize: '0.65rem', color: 'var(--success)' }}>Paid</span>
                              ) : (
                                <button 
                                  onClick={() => handleClearFine(trans._id)} 
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '0.15rem 0.4rem', fontSize: '0.65rem', gap: '0.1rem' }}
                                >
                                  <DollarSign size={9} /> Collect
                                </button>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>None</span>
                          )}
                        </td>
                        <td>
                          {isActive ? (
                            <button
                              onClick={() => handleReturn(trans._id)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', gap: '0.2rem', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(95, 85, 250, 0.08)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              <RotateCcw size={11} /> Return
                            </button>
                          ) : (
                            <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                              returned
                            </span>
                          )}
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
    </div>
  );
};
export default IssueReturn;
