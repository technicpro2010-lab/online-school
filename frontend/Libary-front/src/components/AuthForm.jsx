import React, { useState } from 'react';
import axios from 'axios';

const AuthForm = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'student',
    invite_code: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = isLogin 
      ? 'http://127.0.0.1:8000/api/login' 
      : 'http://127.0.0.1:8000/api/register';

    axios.post(endpoint, formData, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        const { user, access_token } = res.data;
        const cleanToken = access_token?.trim();
        
        localStorage.setItem('token', cleanToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${cleanToken}`;
        axios.defaults.headers.common['Accept'] = 'application/json';
        
        onLoginSuccess(user);
      })
      .catch(err => {
        console.error('Auth Full Error:', err.response);
        const responseData = err.response?.data;
        if (responseData?.errors) {
          const firstErrorField = Object.keys(responseData.errors)[0];
          alert(responseData.errors[firstErrorField][0]);
        } else if (responseData?.message) {
          alert(responseData.message);
        } else {
          alert('Authentication failed. Please check your network or server logs.');
        }
      })
      .finally(() => setLoading(false));
  };

  const isPrivilegedRole = formData.role === 'teacher' || formData.role === 'admin' || formData.role === 'enroll_dept';

  return (
    <div style={{ maxWidth: '400px', margin: '60px auto', padding: '24px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>{isLogin ? 'Login to Online School' : 'Create an Account'}</h2>
      
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', fontWeight: 'bold' }}>Full Name</label>
            <input 
              type="text" 
              required 
              value={formData.name} 
              onChange={e => setFormData({ ...formData, name: e.target.value })} 
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>
        )}

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', fontWeight: 'bold' }}>Email Address</label>
          <input 
            type="email" 
            required 
            value={formData.email} 
            onChange={e => setFormData({ ...formData, email: e.target.value })} 
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', fontWeight: 'bold' }}>Password</label>
          <input 
            type="password" 
            required 
            value={formData.password} 
            onChange={e => setFormData({ ...formData, password: e.target.value })} 
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        {!isLogin && (
          <>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', fontWeight: 'bold' }}>Confirm Password</label>
              <input 
                type="password" 
                required 
                value={formData.password_confirmation} 
                onChange={e => setFormData({ ...formData, password_confirmation: e.target.value })} 
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', fontWeight: 'bold' }}>Account Role</label>
              <select 
                value={formData.role} 
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', backgroundColor: '#fff' }}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="enroll_dept">Enrollment Department</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {isPrivilegedRole && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', fontWeight: 'bold', color: '#dc2626' }}>
                  Secret Authorization Passkey
                </label>
                <input 
                  type="password" 
                  required 
                  placeholder="Enter role passkey"
                  value={formData.invite_code} 
                  onChange={e => setFormData({ ...formData, invite_code: e.target.value })} 
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #dc2626', boxSizing: 'border-box' }}
                />
              </div>
            )}
          </>
        )}

        <button 
          type="submit" 
          disabled={loading}
          style={{ width: '100%', padding: '10px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}
        >
          {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px' }}>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <span 
          onClick={() => setIsLogin(!isLogin)} 
          style={{ color: '#2563eb', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {isLogin ? 'Register here' : 'Login here'}
        </span>
      </p>
    </div>
  );
};

export default AuthForm;