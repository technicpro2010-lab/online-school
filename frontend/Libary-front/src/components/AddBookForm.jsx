import React, { useState } from 'react';
import axios from 'axios';

const AddBookForm = ({ onBookAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    description: '',
    category_id: '1', // Default to initial Programming category ID
    quantity: 1,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://127.0.0.1:8000/api/books', formData)
      .then(response => {
        onBookAdded(response.data);
        setFormData({ title: '', author: '', isbn: '', description: '', category_id: '1', quantity: 1 });
      })
      .catch(err => {
        console.error('Error adding book:', err);
        alert('Failed to add book. Make sure all fields are valid.');
      });
  };

  const formStyle = {
    maxWidth: '500px',
    margin: '0 auto 30px auto',
    padding: '20px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: '#fff',
    fontFamily: 'sans-serif',
  };

  const inputStyle = {
    width: '100%',
    padding: '8px',
    margin: '6px 0 16px 0',
    borderRadius: '4px',
    border: '1px solid #ccc',
    boxSizing: 'border-box',
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <h3 style={{ margin: '0 0 16px 0', color: '#1a202c' }}>Add New Book</h3>
      
      <label>Title *</label>
      <input type="text" name="title" value={formData.title} onChange={handleChange} required style={inputStyle} />

      <label>Author *</label>
      <input type="text" name="author" value={formData.author} onChange={handleChange} required style={inputStyle} />

      <label>ISBN</label>
      <input type="text" name="isbn" value={formData.isbn} onChange={handleChange} style={inputStyle} />

      <label>Quantity *</label>
      <input type="number" name="quantity" min="1" value={formData.quantity} onChange={handleChange} required style={inputStyle} />

      <label>Description</label>
      <textarea name="description" value={formData.description} onChange={handleChange} style={{ ...inputStyle, height: '60px' }} />

      <button type="submit" style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '4px', cursor: 'pointer', width: '100%', fontWeight: 'bold' }}>
        Add Book
      </button>
    </form>
  );
};

export default AddBookForm;