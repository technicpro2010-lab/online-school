import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function TeacherDashboard() {
  const [subjects, setSubjects] = useState([]);
  
  // Material Upload State
  const [title, setTitle] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [materialType, setMaterialType] = useState('book');
  const [fileUrl, setFileUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [myUploads, setMyUploads] = useState([]);
  const [loadingUploads, setLoadingUploads] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const fileInputRef = useRef(null);

  // Live Class Scheduling State
  const [scheduleSubject, setScheduleSubject] = useState('');
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [meetLink, setMeetLink] = useState('');
  const [submittingSchedule, setSubmittingSchedule] = useState(false);
  const [scheduleError, setScheduleError] = useState('');
  const [scheduledSessions, setScheduledSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [deletingSessionId, setDeletingSessionId] = useState(null);

  const API_BASE = 'http://127.0.0.1:8000/api';

  const fetchMyUploads = () => {
    const token = localStorage.getItem('token');
    setLoadingUploads(true);
    axios.get(`${API_BASE}/teacher/materials`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setMyUploads(Array.isArray(res.data) ? res.data : []);
    })
    .catch(err => console.error("Error fetching teacher uploads:", err))
    .finally(() => setLoadingUploads(false));
  };

  const fetchScheduledSessions = () => {
    const token = localStorage.getItem('token');
    setLoadingSessions(true);
    axios.get(`${API_BASE}/teacher/class-sessions`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setScheduledSessions(Array.isArray(res.data) ? res.data : []);
    })
    .catch(err => console.error("Error fetching scheduled sessions:", err))
    .finally(() => setLoadingSessions(false));
  };

  useEffect(() => {
    axios.get(`${API_BASE}/subjects`)
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data.subjects || []);
        setSubjects(data);
        if (data.length > 0) {
          setSelectedSubject(data[0].id);
          setScheduleSubject(data[0].id);
        }
      })
      .catch(err => console.error("Error fetching subjects:", err));

    fetchMyUploads();
    fetchScheduledSessions();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploadError('');

    if (!selectedSubject) {
      setUploadError('Please select a subject.');
      return;
    }

    if (materialType !== 'video' && !selectedFile && !fileUrl) {
      setUploadError('Please select a PDF/document file to upload OR provide an external web link.');
      return;
    }

    setSubmitting(true);
    const token = localStorage.getItem('token');
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('subject_id', selectedSubject);
    formData.append('type', materialType);
    formData.append('description', description || '');

    if (materialType === 'video') {
      formData.append('url', fileUrl);
    } else {
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      if (fileUrl) {
        formData.append('url', fileUrl);
      }
    }

    try {
      await axios.post(`${API_BASE}/materials`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      alert(`${materialType.toUpperCase()} uploaded successfully!`);
      setTitle('');
      setFileUrl('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setDescription('');
      setUploadError('');
      fetchMyUploads();
    } catch (error) {
      console.error("Upload Error:", error.response?.data || error);
      const serverMsg = error.response?.data?.message 
        || (error.response?.data?.errors ? Object.values(error.response.data.errors).flat().join(', ') : null);
      const finalMsg = serverMsg || 'Upload failed. Please verify your file format (PDF, DOCX) and size (Max 50MB).';
      setUploadError(finalMsg);
      alert(`Upload Failed: ${finalMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, itemTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${itemTitle}"? This will permanently remove the file.`)) {
      return;
    }

    setDeletingId(id);
    const token = localStorage.getItem('token');

    try {
      await axios.delete(`${API_BASE}/materials/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('File deleted successfully.');
      fetchMyUploads();
    } catch (err) {
      console.error('Delete error:', err);
      alert(err.response?.data?.message || 'Failed to delete file.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleScheduleClass = async (e) => {
    e.preventDefault();
    setSubmittingSchedule(true);
    setScheduleError('');

    if (!scheduleSubject) {
      setScheduleError('Please select a subject.');
      setSubmittingSchedule(false);
      return;
    }

    const token = localStorage.getItem('token');
    try {
      await axios.post(`${API_BASE}/class-sessions`, {
        subject_id: scheduleSubject,
        title: scheduleTitle,
        start_time: startTime,
        end_time: endTime,
        meet_link: meetLink,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        }
      });

      alert('Live Class scheduled successfully for enrolled students!');
      setScheduleTitle('');
      setStartTime('');
      setEndTime('');
      setMeetLink('');
      setScheduleError('');
      fetchScheduledSessions();
    } catch (err) {
      console.error("Schedule error:", err.response?.data || err);
      const msg = err.response?.data?.message 
        || (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(', ') : 'Failed to schedule class.');
      setScheduleError(msg);
      alert(`Scheduling Failed: ${msg}`);
    } finally {
      setSubmittingSchedule(false);
    }
  };

  const handleDeleteSession = async (id, sessionTitle) => {
    if (!window.confirm(`Are you sure you want to cancel/delete live class "${sessionTitle}"?`)) {
      return;
    }

    setDeletingSessionId(id);
    const token = localStorage.getItem('token');

    try {
      await axios.delete(`${API_BASE}/class-sessions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Live class cancelled successfully.');
      fetchScheduledSessions();
    } catch (err) {
      console.error('Delete session error:', err);
      alert(err.response?.data?.message || 'Failed to delete class session.');
    } finally {
      setDeletingSessionId(null);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* SECTION 1: SCHEDULE LIVE CLASS */}
      <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px', color: '#111827' }}>
          📅 Schedule a Live Class for Enrolled Students
        </h2>
        <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
          Create a scheduled live video session (Google Meet, Zoom, Jitsi). Enrolled students will see this session in their dashboard to join.
        </p>

        {scheduleError && (
          <div style={{ padding: '10px 14px', backgroundColor: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '13px', marginBottom: '14px' }}>
            ⚠️ {scheduleError}
          </div>
        )}

        <form onSubmit={handleScheduleClass} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Subject Selection */}
          <div>
            <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#374151' }}>Course / Subject:</label>
            <select 
              value={scheduleSubject} 
              onChange={(e) => setScheduleSubject(e.target.value)}
              style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #d1d5db' }}
              required
            >
              <option value="">-- Select Course --</option>
              {subjects.map((sub)=> (
                <option key={sub.id} value={sub.id}>{sub.name} ({sub.code || 'Code'})</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#374151' }}>Session Title:</label>
            <input 
              type="text" 
              placeholder="e.g. Chapter 3 Live Discussion & Q&A"
              value={scheduleTitle} 
              onChange={(e) => setScheduleTitle(e.target.value)} 
              style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} 
              required 
            />
          </div>

          {/* Start and End Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#374151' }}>Start Date &amp; Time:</label>
              <input 
                type="datetime-local" 
                value={startTime} 
                onChange={(e) => setStartTime(e.target.value)} 
                style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} 
                required 
              />
            </div>
            <div>
              <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#374151' }}>End Date &amp; Time:</label>
              <input 
                type="datetime-local" 
                value={endTime} 
                onChange={(e) => setEndTime(e.target.value)} 
                style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} 
                required 
              />
            </div>
          </div>

          {/* Meeting Link */}
          <div>
            <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#374151' }}>Meeting Link (Google Meet / Zoom URL):</label>
            <input 
              type="url" 
              placeholder="https://meet.google.com/abc-defg-hij"
              value={meetLink} 
              onChange={(e) => setMeetLink(e.target.value)} 
              style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} 
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={submittingSchedule}
            style={{ 
              backgroundColor: submittingSchedule ? '#9ca3af' : '#059669', 
              color: '#fff', 
              padding: '12px', 
              border: 'none', 
              borderRadius: '6px',
              cursor: submittingSchedule ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '15px'
            }}
          >
            {submittingSchedule ? 'Scheduling...' : '📅 Schedule Live Class'}
          </button>
        </form>
      </div>

      {/* SECTION 2: MY SCHEDULED CLASSES TABLE */}
      <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#111827' }}>My Scheduled Live Classes</h2>
          <span style={{ fontSize: '13px', color: '#6b7280', backgroundColor: '#f3f4f6', padding: '4px 10px', borderRadius: '20px', fontWeight: '500' }}>
            {scheduledSessions.length} session(s)
          </span>
        </div>

        {loadingSessions ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>Loading scheduled sessions...</div>
        ) : scheduledSessions.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#9ca3af', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px dashed #d1d5db' }}>
            No live classes scheduled yet. Use the form above to schedule a session for your students.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left', color: '#4b5563', backgroundColor: '#f9fafb' }}>
                  <th style={{ padding: '12px 10px' }}>Course</th>
                  <th style={{ padding: '12px 10px' }}>Session Title</th>
                  <th style={{ padding: '12px 10px' }}>Start Time</th>
                  <th style={{ padding: '12px 10px' }}>Meeting Link</th>
                  <th style={{ padding: '12px 10px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {scheduledSessions.map((session) => (
                  <tr key={session.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 10px', fontWeight: 'bold', color: '#2563eb' }}>
                      {session.subject?.name || 'Subject'}
                    </td>
                    <td style={{ padding: '12px 10px', fontWeight: '500', color: '#111827' }}>
                      {session.title}
                    </td>
                    <td style={{ padding: '12px 10px', color: '#4b5563', fontSize: '13px' }}>
                      {session.start_time ? new Date(session.start_time).toLocaleString() : 'N/A'}
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      {session.meet_link ? (
                        <a 
                          href={session.meet_link} 
                          target="_blank" 
                          rel="noreferrer" 
                          style={{ color: '#059669', fontWeight: 'bold', textDecoration: 'none' }}
                        >
                          Join Link ↗
                        </a>
                      ) : (
                        <span style={{ color: '#9ca3af', fontSize: '12px' }}>No link</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteSession(session.id, session.title)}
                        disabled={deletingSessionId === session.id}
                        style={{
                          backgroundColor: '#fee2e2',
                          color: '#b91c1c',
                          border: '1px solid #fca5a5',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: deletingSessionId === session.id ? 'not-allowed' : 'pointer',
                          fontWeight: 'bold',
                          fontSize: '12px'
                        }}
                      >
                        {deletingSessionId === session.id ? 'Cancelling...' : 'Cancel Class'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 3: UPLOAD MATERIAL CARD */}
      <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px', color: '#111827' }}>Upload Course Material / Books</h2>
        <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
          Upload PDF books, documents, or video links for your enrolled students.
        </p>

        {uploadError && (
          <div style={{ padding: '10px 14px', backgroundColor: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '13px', marginBottom: '14px' }}>
            ⚠️ {uploadError}
          </div>
        )}
        
        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Subject */}
          <div>
            <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#374151' }}>Subject / Course:</label>
            <select 
              value={selectedSubject} 
              onChange={(e) => setSelectedSubject(e.target.value)}
              style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #d1d5db' }}
              required
            >
              <option value="">-- Select Subject --</option>
              {subjects.map((sub)=> (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>

          {/* Type selection */}
          <div>
            <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#374151' }}>Material Type:</label>
            <select 
              value={materialType} 
              onChange={(e) => setMaterialType(e.target.value)}
              style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #d1d5db' }}
            >
              <option value="book">Book / eBook (PDF / DOCX)</option>
              <option value="video">Video Lesson (YouTube / Vimeo URL)</option>
              <option value="article">Article / Paper</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#374151' }}>Title:</label>
            <input 
              type="text" 
              placeholder="e.g. Fundamentals of Programming (PDF)"
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} 
              required 
            />
          </div>

          {/* Conditional File or URL Input */}
          {materialType === 'video' ? (
            <div>
              <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#374151' }}>Video URL:</label>
              <input 
                type="url" 
                value={fileUrl} 
                onChange={(e) => setFileUrl(e.target.value)} 
                placeholder="https://www.youtube.com/watch?v=..."
                style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} 
                required 
              />
            </div>
          ) : (
            <div>
              <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#374151' }}>Upload PDF / Document from Computer:</label>
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".pdf,.doc,.docx,.epub,.txt"
                onChange={(e) => setSelectedFile(e.target.files[0])} 
                style={{ width: '100%', padding: '8px', marginTop: '6px' }} 
              />
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '6px 0 2px 0' }}>Or provide an external web link:</p>
              <input 
                type="url" 
                value={fileUrl} 
                onChange={(e) => setFileUrl(e.target.value)} 
                placeholder="https://example.com/book.pdf"
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} 
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#374151' }}>Description:</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              rows={3}
              placeholder="Brief summary or instructions..."
              style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} 
            />
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            style={{ 
              backgroundColor: submitting ? '#9ca3af' : '#2563eb', 
              color: '#fff', 
              padding: '12px', 
              border: 'none', 
              borderRadius: '6px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '15px'
            }}
          >
            {submitting ? 'Uploading...' : 'Save Material'}
          </button>
        </form>
      </div>

      {/* SECTION 4: MY UPLOADED MATERIALS TABLE */}
      <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#111827' }}>My Uploaded Files &amp; Materials</h2>
          <span style={{ fontSize: '13px', color: '#6b7280', backgroundColor: '#f3f4f6', padding: '4px 10px', borderRadius: '20px', fontWeight: '500' }}>
            {myUploads.length} item(s)
          </span>
        </div>

        {loadingUploads ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>Loading your uploaded files...</div>
        ) : myUploads.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#9ca3af', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px dashed #d1d5db' }}>
            You have not uploaded any materials yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left', color: '#4b5563', backgroundColor: '#f9fafb' }}>
                  <th style={{ padding: '12px 10px' }}>Type</th>
                  <th style={{ padding: '12px 10px' }}>Title</th>
                  <th style={{ padding: '12px 10px' }}>Subject</th>
                  <th style={{ padding: '12px 10px' }}>Resource Link</th>
                  <th style={{ padding: '12px 10px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {myUploads.map((item) => {
                  const fileUrl = item.file_path
                    ? (item.file_path.startsWith('http') ? item.file_path : `http://127.0.0.1:8000/storage/${item.file_path}`)
                    : (item.url ? (item.url.startsWith('http') ? item.url : `https://${item.url}`) : null);

                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px 10px' }}>
                        <span style={{ 
                          textTransform: 'uppercase', 
                          fontSize: '11px', 
                          fontWeight: 'bold', 
                          padding: '3px 8px', 
                          borderRadius: '4px',
                          backgroundColor: item.type === 'book' ? '#eff6ff' : item.type === 'video' ? '#fef2f2' : '#f0fdf4',
                          color: item.type === 'book' ? '#1d4ed8' : item.type === 'video' ? '#b91c1c' : '#15803d'
                        }}>
                          {item.type || 'file'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px', fontWeight: '500', color: '#111827' }}>
                        {item.title}
                        {item.description && (
                          <span style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                            {item.description}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 10px', color: '#4b5563' }}>
                        {item.subject?.name || 'General'}
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        {fileUrl ? (
                          <a 
                            href={fileUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            style={{ color: '#2563eb', fontWeight: '500', textDecoration: 'none' }}
                          >
                            View / Download ↗
                          </a>
                        ) : (
                          <span style={{ color: '#9ca3af', fontSize: '12px' }}>No link</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleDelete(item.id, item.title)}
                          disabled={deletingId === item.id}
                          style={{
                            backgroundColor: '#fee2e2',
                            color: '#b91c1c',
                            border: '1px solid #fca5a5',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: deletingId === item.id ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold',
                            fontSize: '12px'
                          }}
                        >
                          {deletingId === item.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

export default TeacherDashboard;