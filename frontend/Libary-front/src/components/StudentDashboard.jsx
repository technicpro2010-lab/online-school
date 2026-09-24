import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JoinClassModal from './JoinClassModal';

const StudentDashboard = () => {
  const [materials, setMaterials] = useState({
    enrolled_subjects: [],
    books: [],
    videos: [],
    class_sessions: [], // Added array for scheduled/live meet sessions
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    const fetchStudentMaterials = async () => {
      const token = localStorage.getItem('token');

      try {
        const response = await axios.get('http://127.0.0.1:8000/api/my-materials', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        console.log('Backend response:', response.data);

        const data = response.data;

        // Case 1: Backend returns object { enrolled_subjects: [], books: [], videos: [], class_sessions: [] }
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          let extractedSubjects = data.enrolled_subjects || data.subjects || [];
          let extractedBooks = data.books || [];
          let extractedVideos = data.videos || [];
          let extractedSessions = data.class_sessions || data.sessions || [];

          // Flatten nested elements if stored directly under subjects
          if (extractedSubjects.length > 0) {
            extractedSubjects.forEach((sub) => {
              const subjectObj = sub.subject || sub;
              if (extractedBooks.length === 0 && subjectObj.books) {
                extractedBooks.push(...subjectObj.books);
              }
              if (extractedVideos.length === 0 && subjectObj.videos) {
                extractedVideos.push(...subjectObj.videos);
              }
              if (extractedSessions.length === 0 && subjectObj.class_sessions) {
                extractedSessions.push(...subjectObj.class_sessions);
              }
            });
          }

          setMaterials({
            enrolled_subjects: extractedSubjects.map((s) => s.subject || s),
            books: extractedBooks,
            videos: extractedVideos,
            class_sessions: extractedSessions,
          });
        } 
        // Case 2: Backend returns a raw array of enrollments/subjects
        else if (Array.isArray(data)) {
          const subjects = data.map((item) => item.subject || item);
          const books = data.flatMap((item) => item.subject?.books || item.books || []);
          const videos = data.flatMap((item) => item.subject?.videos || item.videos || []);
          const sessions = data.flatMap((item) => item.subject?.class_sessions || item.class_sessions || []);

          setMaterials({
            enrolled_subjects: subjects,
            books: books,
            videos: videos,
            class_sessions: sessions,
          });
        }
      } catch (err) {
        console.error('Error fetching student materials:', err.response?.data || err.message);
        setError('Failed to load course materials. Please try logging in again.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentMaterials();
  }, []);

  // Helper to open Join Class Modal
  const handleOpenJoinModal = (sessionOrSubject) => {
    setSelectedClass({
      id: sessionOrSubject.id,
      subject_id: sessionOrSubject.subject_id || sessionOrSubject.id,
      subject_name: sessionOrSubject.title || sessionOrSubject.name || 'Live Class',
      teacher_name: sessionOrSubject.teacher_name || sessionOrSubject.teacher?.name || 'Subject Teacher',
      meeting_link: sessionOrSubject.meet_link || sessionOrSubject.meeting_link,
      start_time: sessionOrSubject.start_time,
      end_time: sessionOrSubject.end_time,
    });
    setIsModalOpen(true);
  };

  if (loading) return <div className="p-6 text-center text-gray-600 font-medium">Loading your enrolled courses...</div>;
  if (error) return <div className="p-6 text-center text-red-500 font-semibold">{error}</div>;

  const enrolledSubjects = materials?.enrolled_subjects || [];
  const books = materials?.books || [];
  const videos = materials?.videos || [];
  const classSessions = materials?.class_sessions || [];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 border-b pb-4">Student Learning Portal</h1>

      {/* 1. Enrolled Courses Summary */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2">
          <span>📚</span> My Enrolled Courses
        </h2>
        {enrolledSubjects.length === 0 ? (
          <p className="text-gray-500 bg-gray-50 p-4 rounded-lg border border-gray-200">
            You are not enrolled in any active courses yet. Please contact the Enrollment Department.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrolledSubjects.map((subject, index) => {
              const activeMeetLink = subject.meeting_link || subject.meet_link;
              return (
                <div 
                  key={subject.id || index} 
                  className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-200">
                      {subject.code || 'COURSE'}
                    </span>
                    <h3 className="font-bold text-lg text-gray-900 mt-2">{subject.name || 'Unnamed Course'}</h3>
                    <p className="text-sm text-gray-500">Instructor: {subject.teacher?.name || 'Assigned Instructor'}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t">
                    {activeMeetLink ? (
                      <button
                        onClick={() => handleOpenJoinModal(subject)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition"
                      >
                        <span>🎥</span> Join Live Session
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400 block text-center py-1">No meeting scheduled</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 2. Scheduled Live Meetings / Google Meet Sessions */}
      {classSessions.length > 0 && (
        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <span>🎥</span> Upcoming Live Classes (Google Meet)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classSessions.map((session, index) => (
              <div key={session.id || index} className="bg-white border rounded-lg p-4 shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-900">{session.title || 'Live Class Session'}</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {session.start_time ? new Date(session.start_time).toLocaleString() : 'Scheduled Class'}
                  </p>
                </div>
                <button
                  onClick={() => handleOpenJoinModal(session)}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
                >
                  Join Class ↗
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Course Books Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2">
          <span>📖</span> Course Books
        </h2>
        {books.length === 0 ? (
          <p className="text-gray-500 bg-gray-50 p-4 rounded-lg border border-gray-200">
            No books available for your enrolled courses.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map((book, index) => {
              const fileUrl = book.file_path
                ? (book.file_path.startsWith('http') ? book.file_path : `http://127.0.0.1:8000/storage/${book.file_path}`)
                : (book.url ? (book.url.startsWith('http') ? book.url : `https://${book.url}`) : null);

              return (
                <div key={book.id || index} className="border p-4 rounded-xl shadow-sm bg-white flex flex-col justify-between">
                  <div>
                    {book.subject && (
                      <span className="text-xs font-semibold text-blue-600 block mb-1">
                        {book.subject.name} {book.subject.code ? `(${book.subject.code})` : ''}
                      </span>
                    )}
                    <h3 className="font-bold text-lg text-gray-900">{book.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">Author: {book.author || 'Teacher'}</p>
                    {book.description && (
                      <p className="text-sm text-gray-500 mb-3">{book.description}</p>
                    )}
                  </div>
                  <div className="mt-2 pt-3 border-t">
                    {fileUrl ? (
                      <a 
                        href={fileUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-block w-full text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition"
                      >
                        Read / Download Book ↗
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400 block text-center">No file attached</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Video Lessons Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2">
          <span>🎬</span> Video Lessons
        </h2>
        {videos.length === 0 ? (
          <p className="text-gray-500 bg-gray-50 p-4 rounded-lg border border-gray-200">
            No video lessons uploaded for your enrolled courses.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videos.map((video, index) => {
              const videoSrc = video.url || video.file_path || '';
              
              const getYouTubeEmbedUrl = (url) => {
                if (!url) return null;
                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                const match = url.match(regExp);
                return (match && match[2].length === 11) 
                  ? `https://www.youtube.com/embed/${match[2]}` 
                  : null;
              };

              const embedUrl = getYouTubeEmbedUrl(videoSrc);
              const isLocalFile = videoSrc.endsWith('.mp4') || videoSrc.endsWith('.webm') || videoSrc.includes('storage/');

              return (
                <div key={video.id || index} className="border p-4 rounded-xl shadow-sm bg-white flex flex-col justify-between">
                  <div>
                    {video.subject && (
                      <span className="text-xs font-semibold text-blue-600 block mb-1">
                        {video.subject.name}
                      </span>
                    )}
                    <h3 className="font-bold text-lg mb-3 text-gray-900">{video.title}</h3>
                  </div>

                  {/* Player Container */}
                  <div className="w-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center my-2">
                    {embedUrl ? (
                      <iframe
                        src={embedUrl}
                        title={video.title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : isLocalFile ? (
                      <video controls className="w-full h-full object-cover">
                        <source 
                          src={videoSrc.startsWith('http') ? videoSrc : `http://127.0.0.1:8000/storage/${videoSrc}`} 
                          type="video/mp4" 
                        />
                        Your browser does not support playing this video.
                      </video>
                    ) : videoSrc ? (
                      <a 
                        href={videoSrc.startsWith('http') ? videoSrc : `https://${videoSrc}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition cursor-pointer"
                      >
                        Watch External Video ↗
                      </a>
                    ) : (
                      <p className="text-xs text-gray-400">No playable video URL available</p>
                    )}
                  </div>

                  {video.description && (
                    <p className="text-sm text-gray-600 mt-2">{video.description}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Join Class Modal */}
      <JoinClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        classData={selectedClass}
      />
    </div>
  );
};

export default StudentDashboard;