import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BookList = ({ user }) => {
  const [books, setBooks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const isTeacherOrAdmin = user?.role?.toLowerCase() === 'teacher' || user?.role?.toLowerCase() === 'admin';

  const handleDeleteBook = async (book) => {
    if (!window.confirm(`Are you sure you want to delete "${book.title}"?`)) return;
    setDeletingId(book.id);
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://127.0.0.1:8000/api/books/${book.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Book deleted successfully.');
      fetchBooks();
    } catch (err) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/materials/${book.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Book deleted successfully.');
        fetchBooks();
      } catch (fallbackErr) {
        console.error('Delete error:', fallbackErr);
        alert(fallbackErr.response?.data?.message || err.response?.data?.message || 'Failed to delete book.');
      }
    } finally {
      setDeletingId(null);
    }
  };

  // 1. Fetch available subjects for the filter dropdown
  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    axios.get('http://127.0.0.1:8000/api/subjects', { headers })
      .then(res => setSubjects(res.data || []))
      .catch(err => console.error('Error loading subjects:', err));
  }, []);

  // 2. Fetch books whenever selectedSubject changes
  useEffect(() => {
    fetchBooks();
  }, [selectedSubject]);

  const fetchBooks = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const url = selectedSubject
        ? `http://127.0.0.1:8000/api/books?subject_id=${selectedSubject}`
        : 'http://127.0.0.1:8000/api/books';

      const response = await axios.get(url, { headers });
      let bookList = response.data || [];

      // If empty and no subject filter, fallback to materials
      if (bookList.length === 0 && !selectedSubject) {
        try {
          const matRes = await axios.get('http://127.0.0.1:8000/api/materials', { headers });
          const matData = Array.isArray(matRes.data) ? matRes.data : [];
          bookList = matData.filter(item => item.type === 'book' || (!item.url && item.file_path));
        } catch (matErr) {
          console.error('Fallback materials error:', matErr);
        }
      }

      setBooks(bookList);
    } catch (error) {
      console.error('Error fetching books:', error);
      // Try fallback to materials
      try {
        const matRes = await axios.get('http://127.0.0.1:8000/api/materials', { headers });
        const matData = Array.isArray(matRes.data) ? matRes.data : [];
        let filtered = matData.filter(item => item.type === 'book' || (!item.url && item.file_path));
        if (selectedSubject) {
          filtered = filtered.filter(item => String(item.subject_id) === String(selectedSubject));
        }
        setBooks(filtered);
      } catch (fallbackErr) {
        console.error('Fallback failed:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0 }}>Books & eBooks</h2>

        {/* Subject Filter Dropdown */}
        <div>
          <label style={{ marginRight: '8px', fontWeight: 'bold' }}>Filter by Subject:</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc' }}
          >
            <option value="">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name} {subject.code ? `(${subject.code})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading books...</div>
      ) : books.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          No books found for this selection.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
          {books.map((book) => {
            const fileUrl = book.file_path
              ? (book.file_path.startsWith('http') ? book.file_path : `http://127.0.0.1:8000/storage/${book.file_path}`)
              : (book.url ? (book.url.startsWith('http') ? book.url : `https://${book.url}`) : null);

            return (
              <div key={book.id} style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 'bold', backgroundColor: '#eff6ff', padding: '2px 8px', borderRadius: '4px' }}>
                    {book.subject?.name || 'General Course'}
                  </span>
                  <h3 style={{ margin: '10px 0 4px 0', fontSize: '18px', color: '#111827' }}>{book.title}</h3>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 8px 0' }}>
                    Author: {book.author || 'Teacher'}
                  </p>
                  {book.description && (
                    <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: '1.4', margin: '0 0 12px 0' }}>
                      {book.description}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #f3f4f6' }}>
                  {fileUrl ? (
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#2563eb', fontWeight: 'bold', textDecoration: 'none', fontSize: '13px' }}
                    >
                      Read / Download Book →
                    </a>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                      No file link attached
                    </span>
                  )}

                  {isTeacherOrAdmin && (
                    <button
                      onClick={() => handleDeleteBook(book)}
                      disabled={deletingId === book.id}
                      style={{
                        backgroundColor: '#fee2e2',
                        color: '#b91c1c',
                        border: '1px solid #fca5a5',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        cursor: deletingId === book.id ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        fontSize: '12px'
                      }}
                    >
                      {deletingId === book.id ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BookList;