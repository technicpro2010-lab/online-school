import React, { useEffect, useState } from 'react';
import axios from 'axios';

function EnrollmentDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchPendingRequests = () => {
    const token = localStorage.getItem('token');
    axios.get('http://127.0.0.1:8000/api/admin/pending-enrollments', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setRequests(res.data || []);
      setLoading(false);
    })
    .catch(err => {
      console.error('Error fetching enrollments:', err.response?.data || err.message);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const handleAction = (enrollmentId, status) => {
    const token = localStorage.getItem('token');
    
    // Explicitly target the ID to avoid malformed URL routes
    const cleanId = String(enrollmentId).trim();

    axios.put(`http://127.0.0.1:8000/api/admin/enrollments/${cleanId}`, 
      { status }, 
      { 
        headers: { 
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json'
        } 
      }
    )
    .then(res => {
      setMessage(`Request successfully ${status}!`);
      fetchPendingRequests();
      setTimeout(() => setMessage(''), 3000);
    })
    .catch(err => {
      console.error('Status update error detailed:', err.response?.data || err);
      const serverError = err.response?.data?.message || 'Failed to update request status.';
      alert(`Error: ${serverError}`);
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
        Loading pending enrollment requests...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', color: '#0f172a', marginBottom: '8px', fontWeight: '700' }}>
          Enrollment Dashboard — National Institute of Computer Science
        </h2>
        <p style={{ color: '#64748b', fontSize: '15px' }}>
          Review and approve pending student course enrollment requests.
        </p>
      </div>

      {message && (
        <div style={{ padding: '12px 16px', backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '6px', marginBottom: '16px', fontWeight: 'bold' }}>
          {message}
        </div>
      )}

      {requests.length === 0 ? (
        <div style={{ padding: '40px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
          No pending enrollment requests found.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left', fontSize: '14px', color: '#475569' }}>
                <th style={{ padding: '12px 16px' }}>Student Name</th>
                <th style={{ padding: '12px 16px' }}>Email</th>
                <th style={{ padding: '12px 16px' }}>Requested Subject</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px' }}>
                  <td style={{ padding: '14px 16px', fontWeight: '600', color: '#1e293b' }}>
                    {item.student?.name || 'N/A'}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#64748b' }}>
                    {item.student?.email || 'N/A'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', marginRight: '8px' }}>
                      {item.subject?.code || 'CODE'}
                    </span>
                    <span style={{ fontWeight: '500', color: '#334155' }}>
                      {item.subject?.name || item.subject_name || 'N/A'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleAction(item.id, 'approved')}
                      style={{ backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', marginRight: '8px' }}
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleAction(item.id, 'rejected')}
                      style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default EnrollmentDashboard;