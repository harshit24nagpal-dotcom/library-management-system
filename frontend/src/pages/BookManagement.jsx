import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  BookOpen, 
  Info,
  Layers,
  X
} from 'lucide-react';

export const BookManagement = ({ showToast }) => {
  const { user } = useContext(AuthContext);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentBookId, setCurrentBookId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    genre: '',
    copies: 1,
    rackLocation: ''
  });

  // Info Modal (Reservation Details)
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  const isAdmin = user.role === 'admin';

  const fetchBooks = async () => {
    try {
      const query = [];
      if (search) query.push(`search=${encodeURIComponent(search)}`);
      if (genre) query.push(`genre=${encodeURIComponent(genre)}`);
      
      const queryString = query.length > 0 ? `?${query.join('&')}` : '';
      const data = await api.get(`/books${queryString}`);
      setBooks(data);
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to fetch catalog books', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [search, genre]);

  const handleOpenAddModal = () => {
    setIsEdit(false);
    setFormData({
      title: '',
      author: '',
      isbn: '',
      genre: '',
      copies: 1,
      rackLocation: ''
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (book) => {
    setIsEdit(true);
    setCurrentBookId(book._id);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      genre: book.genre,
      copies: book.copies,
      rackLocation: book.rackLocation || ''
    });
    setModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await api.put(`/books/${currentBookId}`, formData);
        showToast('Book updated successfully!', 'success');
      } else {
        await api.post('/books', formData);
        showToast('Book added to inventory!', 'success');
      }
      setModalOpen(false);
      fetchBooks();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Error processing book details', 'error');
    }
  };

  const handleDeleteBook = async (id) => {
    if (window.confirm('Are you sure you want to delete this book? This will permanently remove it from inventory.')) {
      try {
        await api.delete(`/books/${id}`);
        showToast('Book deleted successfully', 'success');
        fetchBooks();
      } catch (err) {
        console.error(err);
        showToast(err.message || 'Failed to delete book', 'error');
      }
    }
  };

  const handleRequestBook = (book) => {
    setSelectedBook(book);
    setInfoModalOpen(true);
  };

  // Get unique genres in current catalog for filter list
  const genresList = ['Fiction', 'Non-Fiction', 'Science', 'History', 'Biography', 'Fantasy', 'Mystery', 'Technology'];

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1>{isAdmin ? 'Catalog Inventory' : 'Book Catalog'}</h1>
          <p>{isAdmin ? 'Add, edit and monitor library books stock.' : 'Find books, check rack shelfs, and check checkout availability.'}</p>
        </div>

        {isAdmin && (
          <button onClick={handleOpenAddModal} className="btn btn-primary">
            <Plus size={18} /> Add New Book
          </button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="glass" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
        <div className="filter-bar">
          <div className="search-input-wrapper">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search by title, author, ISBN..."
              className="form-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <select
              className="form-input form-select"
              style={{ width: '180px' }}
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            >
              <option value="">All Genres</option>
              {genresList.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            {(search || genre) && (
              <button 
                onClick={() => { setSearch(''); setGenre(''); }} 
                className="btn btn-secondary btn-sm"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Book Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Loading Catalog Books...</p>
        </div>
      ) : books.length === 0 ? (
        <div className="glass" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
          <BookOpen size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
          <h3>No Books Found</h3>
          <p>No titles matched your search. Try resetting filters or updating search query.</p>
        </div>
      ) : (
        <div className="catalog-grid">
          {books.map((book) => {
            const isAvailable = book.availableCopies > 0;
            return (
              <div key={book._id} className="glass book-card">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className="book-tag">{book.genre}</span>
                    <span className={`badge ${isAvailable ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                      {isAvailable ? `${book.availableCopies} available` : 'out of stock'}
                    </span>
                  </div>

                  <h3 className="book-title">{book.title}</h3>
                  <p className="book-author">by {book.author}</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                    <div className="book-info-row">
                      <span>ISBN</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{book.isbn}</span>
                    </div>
                    {book.rackLocation && (
                      <div className="book-info-row">
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <MapPin size={13} /> Shelf Rack
                        </span>
                        <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{book.rackLocation}</span>
                      </div>
                    )}
                    {isAdmin && (
                      <div className="book-info-row">
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Layers size={13} /> Stock Copies
                        </span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{book.copies} total</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="book-actions">
                  {isAdmin ? (
                    <>
                      <button 
                        onClick={() => handleOpenEditModal(book)} 
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1, gap: '0.25rem' }}
                      >
                        <Edit size={14} /> Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteBook(book._id)} 
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.5rem', width: '38px', height: '34px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => handleRequestBook(book)} 
                      className="btn btn-primary btn-sm"
                      style={{ width: '100%', gap: '0.25rem' }}
                    >
                      <Info size={14} /> Request / Reserve
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ margin: 0, color: '#fff' }}>{isEdit ? 'Modify Book Details' : 'Add New Catalog Book'}</h3>
              <button onClick={() => setModalOpen(false)} className="close-btn">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleModalSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="modal-title">Book Title</label>
                  <input
                    type="text"
                    id="modal-title"
                    required
                    placeholder="e.g. The Pragmatic Programmer"
                    className="form-input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="modal-author">Author Name</label>
                  <input
                    type="text"
                    id="modal-author"
                    required
                    placeholder="e.g. Andy Hunt, Dave Thomas"
                    className="form-input"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label" htmlFor="modal-isbn">ISBN Code</label>
                    <input
                      type="text"
                      id="modal-isbn"
                      required
                      placeholder="e.g. 978-0135957059"
                      className="form-input"
                      value={formData.isbn}
                      onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="form-label" htmlFor="modal-genre">Genre</label>
                    <select
                      id="modal-genre"
                      required
                      className="form-input form-select"
                      value={formData.genre}
                      onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    >
                      <option value="">Select Genre</option>
                      {genresList.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label" htmlFor="modal-copies">Stock Copies</label>
                    <input
                      type="number"
                      id="modal-copies"
                      min="1"
                      required
                      className="form-input"
                      value={formData.copies}
                      onChange={(e) => setFormData({ ...formData, copies: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="form-label" htmlFor="modal-rack">Rack Location</label>
                    <input
                      type="text"
                      id="modal-rack"
                      placeholder="e.g. A-3, Shelf C"
                      className="form-input"
                      value={formData.rackLocation}
                      onChange={(e) => setFormData({ ...formData, rackLocation: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {isEdit ? 'Save Changes' : 'Add Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Info/Reservation Modal for Members */}
      {infoModalOpen && selectedBook && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, color: '#fff' }}>Reservation Details</h3>
              <button onClick={() => setInfoModalOpen(false)} className="close-btn">
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
              <div className="flex-center" style={{
                margin: '0 auto 1rem auto',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 229, 255, 0.12)',
                color: 'var(--accent)'
              }}>
                <Info size={24} />
              </div>
              
              <h4 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.5rem' }}>{selectedBook.title}</h4>
              <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>by {selectedBook.author}</p>
              
              <div className="glass" style={{ padding: '1rem', textAlign: 'left', backgroundColor: 'rgba(255,255,255,0.015)' }}>
                {selectedBook.availableCopies > 0 ? (
                  <>
                    <p style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                      ✓ Book is currently in stock!
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Location: <strong style={{ color: 'var(--accent)' }}>Shelf {selectedBook.rackLocation || 'Not Assigned'}</strong>.
                      <br /><br />
                      To borrow this book, please write down the ISBN (<strong style={{ color: '#fff' }}>{selectedBook.isbn}</strong>) and present it with your library card (<strong style={{ color: '#fff' }}>{user.memberId}</strong>) at the front desk.
                    </p>
                  </>
                ) : (
                  <>
                    <p style={{ color: 'var(--danger)', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                      ✗ Book is currently out of stock!
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      All copies are currently issued. To request a reservation or place a hold, please visit the librarian desk and request checkout queuing for ISBN: <strong style={{ color: '#fff' }}>{selectedBook.isbn}</strong>.
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setInfoModalOpen(false)} className="btn btn-primary" style={{ width: '100%' }}>
                Got it, Thanks
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default BookManagement;
