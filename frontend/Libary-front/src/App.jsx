import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthForm from './components/AuthForm';
import BookList from './components/BookList';
import VideoList from './components/VideoList';
import SubjectsList from './components/SubjectsList';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import EnrollmentDashboard from './components/EnrollmentDashboard';
import ArticleList from './components/ArticleList';

function App() {
  const [activeTab, setActiveTab] = useState('subjects');
  const [user, setUser] = useState(null);

  // Normalize role string to handle capitalization variations (e.g. 'Teacher' vs 'teacher')
  const userRole = user?.role ? user.role.toLowerCase() : '';

  // Configure initial tab based on user role
  const setInitialTabByRole = (role) => {
    const normalizedRole = role ? role.toLowerCase() : '';

    if (normalizedRole === 'student') {
      setActiveTab('student_dashboard');
    } else if (normalizedRole === 'teacher') {
      setActiveTab('teacher');
    } else if (normalizedRole === 'admin' || normalizedRole === 'enroll_dept') {
      setActiveTab('enrollment');
    } else {
      setActiveTab('subjects');
    }
  };

  // Check for existing token and user on initial load
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setInitialTabByRole(parsedUser.role);
      
      // Set Global Axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      axios.defaults.headers.common['Accept'] = 'application/json';
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setInitialTabByRole(userData.role);

    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.defaults.headers.common['Accept'] = 'application/json';
    }
  };

  const handleLogout = () => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.post('http://127.0.0.1:8000/api/logout')
        .catch(err => console.error('Logout error:', err));
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  if (!user) {
    return <AuthForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Top Header */}
      <header style={{ backgroundColor: '#1e293b', color: '#fff', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px' }}>School Online Library</h1>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            Logged in as: <strong>{user.name}</strong> ({user.role?.toUpperCase()})
          </span>
        </div>
        <button 
          onClick={handleLogout} 
          style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Logout
        </button>
      </header>

      {/* Navigation Bar */}
      <nav style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb', padding: '12px 24px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Admin / Enroll Dept Tab */}
        {(userRole === 'admin' || userRole === 'enroll_dept') && (
          <button 
            onClick={() => setActiveTab('enrollment')} 
            style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', background: activeTab === 'enrollment' ? '#2563eb' : '#e5e7eb', color: activeTab === 'enrollment' ? '#fff' : '#374151', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Enrollment Manager
          </button>
        )}

        {/* Student Enrolled Portal (Only visible to Students) */}
        {userRole === 'student' && (
          <button 
            onClick={() => setActiveTab('student_dashboard')} 
            style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', background: activeTab === 'student_dashboard' ? '#2563eb' : '#e5e7eb', color: activeTab === 'student_dashboard' ? '#fff' : '#374151', cursor: 'pointer', fontWeight: 'bold' }}
          >
            My Enrolled Courses
          </button>
        )}

        <button 
          onClick={() => setActiveTab('subjects')} 
          style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', background: activeTab === 'subjects' ? '#2563eb' : '#e5e7eb', color: activeTab === 'subjects' ? '#fff' : '#374151', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Subjects & Programs
        </button>
        <button 
          onClick={() => setActiveTab('books')} 
          style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', background: activeTab === 'books' ? '#2563eb' : '#e5e7eb', color: activeTab === 'books' ? '#fff' : '#374151', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Books & eBooks
        </button>
        <button 
          onClick={() => setActiveTab('videos')} 
          style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', background: activeTab === 'videos' ? '#2563eb' : '#e5e7eb', color: activeTab === 'videos' ? '#fff' : '#374151', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Video Lessons
        </button>
        <button 
          onClick={() => setActiveTab('articles')} 
          style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', background: activeTab === 'articles' ? '#2563eb' : '#e5e7eb', color: activeTab === 'articles' ? '#fff' : '#374151', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Articles
        </button>

        {/* Teacher Materials Tab (Only visible to Teachers) */}
        {userRole === 'teacher' && (
          <button 
            onClick={() => setActiveTab('teacher')}
            style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', background: activeTab === 'teacher' ? '#2563eb' : '#e5e7eb', color: activeTab === 'teacher' ? '#fff' : '#374151', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Teacher Materials
          </button>
        )}

        {/* Pending Approvals Tab for Admin */}
        {userRole === 'admin' && (
          <button 
            onClick={() => setActiveTab('approvals')}
            style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', background: activeTab === 'approvals' ? '#2563eb' : '#e5e7eb', color: activeTab === 'approvals' ? '#fff' : '#374151', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Pending Approvals
          </button>
        )}
      </nav>

      {/* Main Content View */}
      <main style={{ padding: '24px' }}>
        {activeTab === 'enrollment' && <EnrollmentDashboard />}
        {activeTab === 'student_dashboard' && <StudentDashboard />}
        {activeTab === 'subjects' && <SubjectsList user={user} />}
        {activeTab === 'books' && <BookList user={user} />}
        {activeTab === 'videos' && <VideoList user={user} />}
        {activeTab === 'articles' && <ArticleList user={user} />}
        {activeTab === 'teacher' && userRole === 'teacher' && <TeacherDashboard />}
      </main>
    </div>
  );
}

export default App;