import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Search, 
  User, 
  Trash2, 
  Edit, 
  History, 
  DollarSign, 
  Mail, 
  Phone, 
  Calendar,
  X
} from 'lucide-react';

export const MemberManagement = ({ showToast }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedHistory, setSelectedHistory] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const fetchMembers = async () => {
    try {
      const queryString = search ? `?search=${encodeURIComponent(search)}` : '';
      const data = await api.get(`/members${queryString}`);
      setMembers(data);
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to retrieve library members', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [search]);

  const handleOpenEdit = (member) => {
    setSelectedMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone || ''
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/members/${selectedMember._id}`, formData);
      showToast('Member profile updated successfully', 'success');
      setEditModalOpen(false);
      fetchMembers();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to update member profile', 'error');
    }
  };

  const handleDeleteMember = async (id) => {
    if (window.confirm('Are you sure you want to delete this member account? This action is permanent.')) {
      try {
        await api.delete(`/members/${id}`);
        showToast('Member account deleted successfully', 'success');
        fetchMembers();
      } catch (err) {
        console.error(err);
        showToast(err.message || 'Cannot delete member (ensure no active checkouts)', 'error');
      }
    }
  };

  const handleOpenHistory = async (member) => {
    setSelectedMember(member);
    setHistoryModalOpen(true);
    try {
      const data = await api.get(`/members/${member._id}`);
      // The backend /members/:id returns { member, history }
      setSelectedHistory(data.history || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load borrowing history', 'error');
    }
  };

  const handlePayFine = async (transactionId) => {
    try {
      await api.post(`/transactions/pay-fine/${transactionId}`);
      showToast('Fine payment cleared successfully!', 'success');
      
      // Refresh History modal
      const data = await api.get(`/members/${selectedMember._id}`);
      setSelectedHistory(data.history || []);
      
      // Refresh stats
      fetchMembers();
    } catch (err) {
      console.error(err);
      showToast('Failed to process fine payment', 'error');
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1>Member Registry</h1>
        <p>Monitor library borrowers, access checkout history, and collect fines.</p>
      </div>

      {/* Filter / Search Bar */}
      <div className="glass" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
        <div className="filter-bar">
          <div className="search-input-wrapper">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, email, Member ID..."
              className="form-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Members Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Loading Registered Members...</p>
        </div>
      ) : members.length === 0 ? (
        <div className="glass" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
          <User size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
          <h3>No Members Registered</h3>
          <p>Create a member account from the Sign Up screen or adjust filters.</p>
        </div>
      ) : (
        <div className="glass table-container">
          <table>
            <thead>
              <tr>
                <th>Member Name</th>
                <th>Member ID</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(95, 85, 250, 0.15)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.85rem'
                      }}>
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, color: '#fff' }}>{member.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-success" style={{ fontStyle: 'normal', fontWeight: 700 }}>
                      {member.memberId}
                    </span>
                  </td>
                  <td>{member.email}</td>
                  <td>{member.phone || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => handleOpenHistory(member)} 
                        className="btn btn-secondary btn-sm"
                        style={{ gap: '0.25rem' }}
                      >
                        <History size={13} /> History
                      </button>
                      <button 
                        onClick={() => handleOpenEdit(member)} 
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.5rem', width: '34px', height: '34px' }}
                      >
                        <Edit size={13} />
                      </button>
                      <button 
                        onClick={() => handleDeleteMember(member._id)} 
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.5rem', width: '34px', height: '34px' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && selectedMember && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ margin: 0, color: '#fff' }}>Edit Member Profile</h3>
              <button onClick={() => setEditModalOpen(false)} className="close-btn">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="member-name">Full Name</label>
                  <input
                    type="text"
                    id="member-name"
                    required
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="member-email">Email Address</label>
                  <input
                    type="email"
                    id="member-email"
                    required
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="member-phone">Phone Number</label>
                  <input
                    type="tel"
                    id="member-phone"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setEditModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History & Fine Settlement Modal */}
      {historyModalOpen && selectedMember && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '750px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0, color: '#fff' }}>Borrow History: {selectedMember.name}</h3>
                <span className="badge badge-success" style={{ marginTop: '0.25rem' }}>{selectedMember.memberId}</span>
              </div>
              <button onClick={() => setHistoryModalOpen(false)} className="close-btn">
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body" style={{ padding: '1.5rem 0' }}>
              <div style={{ padding: '0 1.5rem', marginBottom: '1.25rem', display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Mail size={14} style={{ color: 'var(--primary)' }} /> {selectedMember.email}
                </span>
                {selectedMember.phone && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Phone size={14} style={{ color: 'var(--accent)' }} /> {selectedMember.phone}
                  </span>
                )}
              </div>

              <div className="table-container" style={{ borderRadius: 0, maxHeight: '350px', overflowY: 'auto' }}>
                {selectedHistory.length === 0 ? (
                  <p style={{ padding: '2rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No checkouts recorded for this member.
                  </p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Book Title</th>
                        <th>Dates</th>
                        <th>Status</th>
                        <th>Fine Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedHistory.map((h) => {
                        const isOverdue = h.status === 'overdue';
                        const statusClass = h.status === 'returned' ? 'badge-success' : isOverdue ? 'badge-danger' : 'badge-warning';
                        return (
                          <tr key={h._id}>
                            <td>
                              <div style={{ fontWeight: 600, color: '#fff' }}>{h.bookId?.title || 'Unknown Title'}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ISBN: {h.bookId?.isbn}</div>
                            </td>
                            <td>
                              <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <Calendar size={12} style={{ color: 'var(--success)' }} /> Out: {new Date(h.issueDate).toLocaleDateString()}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <Calendar size={12} style={{ color: 'var(--danger)' }} /> Due: {new Date(h.dueDate).toLocaleDateString()}
                                </span>
                              </div>
                            </td>
                            <td>
                              <span className={`badge ${statusClass}`}>{h.status}</span>
                            </td>
                            <td>
                              {h.fineAmount > 0 ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span style={{ fontWeight: 700, color: h.finePaid ? 'var(--success)' : 'var(--danger)' }}>
                                    ${h.fineAmount}
                                  </span>
                                  {h.finePaid ? (
                                    <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>Cleared</span>
                                  ) : (
                                    <button 
                                      onClick={() => handlePayFine(h._id)} 
                                      className="btn btn-primary btn-sm"
                                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', gap: '0.2rem' }}
                                    >
                                      <DollarSign size={11} /> Collect
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None</span>
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

            <div className="modal-footer">
              <button onClick={() => setHistoryModalOpen(false)} className="btn btn-primary" style={{ width: '100%' }}>
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default MemberManagement;
