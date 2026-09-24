import React, { useState } from 'react';
import axios from 'axios';

const EditBookModal = ({ book, onClose, onBookUpdated }) => {
  const [formData, setFormData] = useState({
    title: book.title || '',
    author: book.author || '',
    isbn: book.isbn || '',
    description: book.description || '',
    category_id: book.category_id || 1,
    quantity: book.quantity || 1,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.put(`http://127.0.0.1:8000/api/books/${book.id}`, formData)
      .then(res => {
        onBookUpdated(res.data);
        onClose();
      })
      .catch(err => {
        console.error('Update failed:', err);
        alert('Failed to update book.');
      });
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', width: '100%', maxWidth: '450px', fontFamily: 'sans-serif' }}>
        <h3 style={{ margin: '0 0 16px 0' }}>Edit Book</h3>
        <form onSubmit={handleSubmit}>
          <label>Title</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required style={{ width: '100%', padding: '8px', margin: '4px 0 12px 0', boxSizing: 'border-box' }} />

          <label>Author</label>
          <input type="text" name="author" value={formData.author} onChange={handleChange} required style={{ width: '100%', padding: '8px', margin: '4px 0 12px 0', boxSizing: 'border-box' }} />

          <label>ISBN</label>
          <input type="text" name="isbn" value={formData.isbn} onChange={handleChange} style={{ width: '100%', padding: '8px', margin: '4px 0 12px 0', boxSizing: 'border-box' }} />

          <label>Quantity</label>
          <input type="number" name="quantity" min="1" value={formData.quantity} onChange={handleChange} required style={{ width: '100%', padding: '8px', margin: '4px 0 12px 0', boxSizing: 'border-box' }} />

          <label>Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} style={{ width: '100%', padding: '8px', margin: '4px 0 12px 0', height: '60px', boxSizing: 'border-box' }} />

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', background: '#16a34a', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBookModal;