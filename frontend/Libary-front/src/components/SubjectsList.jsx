import React, { useEffect, useState } from 'react';
import axios from 'axios';

function SubjectsList({ user }) {
  const [subjects, setSubjects] = useState([]);
  const [userEnrollments, setUserEnrollments] = useState({});
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const isStudent = user?.role?.toLowerCase() === 'student';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const authHeaders = token ? { Headers: { Authorization: `Bearer ${token}` } } : {};

    // 1. Fetch Subjects from backend
    axios.get('http://127.0.0.1:8000/api/subjects', authHeaders)
      .then((res) => {
        setSubjects(res.data || []);
        
        // 2. Fetch Enrollments separately if student is logged in
        if (isStudent && token) {
          axios.get('http://127.0.0.1:8000/api/my-enrollments', authHeaders)
            .then((enrRes) => {
              const map = {};
              if (Array.isArray(enrRes.data)) {
                enrRes.data.forEach(item => {
                  map[item.subject_id] = item.status;
                });
              }
              setUserEnrollments(map);
            })
            .catch((err) => {
              console.warn('Could not load enrollment status:', err);
            });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('API Fetch Error:', err);
        setErrorMessage(err.response?.data?.message || 'Failed to connect to backend server.');
        setLoading(false);
      });
  }, [isStudent]);

  const handleEnroll = (subjectId) => {
    const token = localStorage.getItem('token');
    axios.post(
      `http://127.0.0.1:8000/api/subjects/${subjectId}/enroll`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then(() => {
      setUserEnrollments(prev => ({ ...prev, [subjectId]: 'pending' }));
    })
    .catch((err) => {
      console.error('Enrollment error:', err);
      alert('Could not submit enrollment request.');
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
        Loading subjects catalog...
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: '#dc2626', backgroundColor: '#fef2f2', borderRadius: '8px', margin: '20px auto', maxWidth: '600px' }}>
        <strong>Backend Error:</strong> {errorMessage}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', color: '#0f172a', marginBottom: '8px', fontWeight: '700' }}>
          National Institute of Computer Science
        </h2>
        <p style={{ color: '#64748b', fontSize: '15px' }}>
          Select a subject to request student enrollment and access course resources.
        </p>
      </div>

      {subjects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          No subjects found in the database.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {subjects.map((subject) => {
            const status = userEnrollments[subject.id];

            return (
              <div 
                key={subject.id} 
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '24px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ backgroundColor: '#eff6ff', color: '#2563eb', fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '20px' }}>
                      {subject.code || 'CS-COURSE'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '18px', color: '#1e293b', margin: '0 0 10px 0', fontWeight: '600' }}>
                    {subject.name}
                  </h3>

                  <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.5', margin: 0 }}>
                    {subject.description || 'No description available for this course.'}
                  </p>
                </div>

                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {isStudent && (
                    status ? (
                      <span style={{ 
                        fontSize: '13px', 
                        fontWeight: 'bold', 
                        color: status === 'approved' ? '#16a34a' : '#d97706',
                        backgroundColor: status === 'approved' ? '#f0fdf4' : '#fffbeb',
                        padding: '6px 12px',
                        borderRadius: '6px'
                      }}>
                        {status === 'approved' ? '✓ Enrolled' : '⏳ Pending Approval'}
                      </span>
                    ) : (
                      <button 
                        onClick={() => handleEnroll(subject.id)}
                        style={{ 
                          backgroundColor: '#2563eb', 
                          color: '#fff', 
                          border: 'none', 
                          padding: '8px 16px', 
                          borderRadius: '6px', 
                          fontWeight: 'bold', 
                          cursor: 'pointer' 
                        }}
                      >
                        Request Enrollment
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SubjectsList;