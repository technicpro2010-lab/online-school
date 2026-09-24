import React, { useState } from 'react';
import axios from 'axios';

const JoinClassModal = ({ isOpen, onClose, classData }) => {
  const [isLogging, setIsLogging] = useState(false);

  if (!isOpen || !classData) return null;

  const handleConfirmJoin = async () => {
    setIsLogging(true);

    try {
      // 1. Log attendance in Laravel backend
      await axios.post(
        'http://127.0.0.1:8000/api/attendance/log',
        {
          subject_id: classData.subject_id,
          class_session_id: classData.id || null,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
    } catch (error) {
      console.error('Attendance logging failed:', error);
      // We continue opening the meeting even if attendance logging fails
    } finally {
      setIsLogging(false);
    }

    // 2. Safely redirect/open Google Meet in a new tab
    window.open(classData.meeting_link, '_blank', 'noopener,noreferrer');

    // 3. Close modal
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 text-gray-800 animate-fade-in">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b">
          <h3 className="text-xl font-bold text-gray-900">Join Live Classroom</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="my-5 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎥</span>
            <div>
              <h4 className="font-semibold text-lg text-blue-600">{classData.subject_name}</h4>
              <p className="text-sm text-gray-500">Instructor: {classData.teacher_name || 'Subject Teacher'}</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
            <strong>Note:</strong> Clicking <strong>"Launch Class"</strong> will record your attendance and redirect you to Google Meet in a new browser tab.
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          
          <button
            onClick={handleConfirmJoin}
            disabled={isLogging}
            className="px-5 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isLogging ? (
              <span>Logging in...</span>
            ) : (
              <>
                <span>Launch Class</span>
                <span>→</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default JoinClassModal;