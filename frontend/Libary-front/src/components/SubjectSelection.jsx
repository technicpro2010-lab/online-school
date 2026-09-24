import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SubjectSelection = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = () => {
    const token = localStorage.getItem('token');

    // If there is no token yet, stop the API call to avoid 401 alert
    if (!token) {
      setLoading(false);
      return;
    }

    axios.get('http://127.0.0.1:8000/api/subjects', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })
      .then(res => {
        setSubjects(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch Subjects Error:', err.response?.data);
        setLoading(false);
      });
  };

  const handleEnroll = (subjectId) => {
    const token = localStorage.getItem('token');
    
    axios.post(`http://127.0.0.1:8000/api/subjects/${subjectId}/enroll`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })
      .then(() => {
        alert('Enrolled successfully!');
        fetchSubjects();
      })
      .catch(() => alert('Failed to enroll in subject.'));
  };

  if (loading) return <p style={{ textAlign: 'center', padding: '20px' }}>Loading available programs...</p>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h2>Available Subjects & Programs</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Select the subjects you want to study. Enrolling gives you access to class videos and materials.
      </p>

      {subjects.length === 0 ? (
        <div style={{ padding: '20px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
          <p>No subjects found.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {subjects.map(subject => (
            <div key={subject.id} style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#2563eb', backgroundColor: '#eff6ff', padding: '2px 8px', borderRadius: '4px' }}>
                  {subject.code}
                </span>
                <h3 style={{ margin: '10px 0 6px 0', fontSize: '18px' }}>{subject.name}</h3>
                <p style={{ fontSize: '14px', color: '#4b5563', margin: '0 0 16px 0' }}>{subject.description}</p>
              </div>

              {subject.is_enrolled ? (
                <button disabled style={{ width: '100%', padding: '8px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'default', fontWeight: 'bold' }}>
                  ✓ Enrolled
                </button>
              ) : (
                <button onClick={() => handleEnroll(subject.id)} style={{ width: '100%', padding: '8px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Enroll Now
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubjectSelection;