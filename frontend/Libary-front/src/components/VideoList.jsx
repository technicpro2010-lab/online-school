import React, { useState, useEffect } from 'react';
import axios from 'axios';

function VideoList({ user }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = 'http://127.0.0.1:8000/api';

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);

        // Fetch enrollment-filtered materials (videos from enrolled subjects)
        const myRes = await axios.get(`${API_BASE}/my-materials`);
        let list = processVideos(myRes.data);

        // Also fetch from /api/videos (filtered on the backend by enrollment for students)
        try {
          const videosRes = await axios.get(`${API_BASE}/videos`);
          const extraVideos = Array.isArray(videosRes.data) ? videosRes.data : [];
          // Merge, avoiding duplicates by id
          const existingIds = new Set(list.map(v => v.id));
          for (const v of extraVideos) {
            if (!existingIds.has(v.id)) {
              list.push(v);
            }
          }
        } catch (_) {
          // /api/videos may not exist or fail; that's OK
        }

        setVideos(list);
      } catch (err) {
        console.error("Error fetching videos:", err);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const processVideos = (data) => {
    let items = [];
    if (Array.isArray(data)) {
      items = data;
    } else if (data && typeof data === 'object') {
      items = data.videos || data.materials || Object.values(data).flat();
    }

    // Filter strictly for video items or video URLs
    return items.filter(
      (item) =>
        item &&
        (item.type === 'video' ||
          item.url ||
          (item.file_path && item.file_path.match(/\.(mp4|webm|mkv)$/i)))
    );
  };

  // Helper function to turn regular URLs into embeddable <iframe> URLs
  const getEmbedUrl = (url) => {
    if (!url) return null;

    // 1. YouTube Match (handles watch links, shorts, embed links, short links)
    const ytMatch = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
    );
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }

    // 2. Vimeo Match
    const vimeoMatch = url.match(
      /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/\d+\/video\/|video\/|)(\d+)/
    );
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    // 3. Loom Match
    const loomMatch = url.match(/loom\.com\/(?:share|embed)\/([\w-]+)/);
    if (loomMatch && loomMatch[1]) {
      return `https://www.loom.com/embed/${loomMatch[1]}`;
    }

    return null;
  };

  if (loading) return <div style={{ padding: '16px' }}>Loading video lessons...</div>;

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Video Lessons</h2>

      {videos.length === 0 ? (
        <p style={{ color: '#6b7280', backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px' }}>
          No video lessons available.
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {videos.map((video, index) => {
            const rawUrl = video.url || video.file_path || '';
            const embedUrl = getEmbedUrl(rawUrl);
            const isLocalFile =
              rawUrl.endsWith('.mp4') ||
              rawUrl.endsWith('.webm') ||
              rawUrl.includes('storage/');

            return (
              <div
                key={video.id || index}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '16px',
                  backgroundColor: '#fff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
              >
                {video.subject && (
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#2563eb',
                      fontWeight: 'bold',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    {video.subject.name}
                  </span>
                )}
                
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: '#111827' }}>
                  {video.title}
                </h3>

                {/* Video Player Box */}
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '16 / 9',
                    backgroundColor: '#000',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {embedUrl ? (
                    /* Embedded <iframe> Player for YouTube, Vimeo, Loom */
                    <iframe
                      src={embedUrl}
                      title={video.title || 'Video Player'}
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : isLocalFile ? (
                    /* HTML5 <video> Player for locally stored MP4 files */
                    <video controls style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
                      <source
                        src={
                          rawUrl.startsWith('http')
                            ? rawUrl
                            : `http://127.0.0.1:8000/storage/${rawUrl}`
                        }
                        type="video/mp4"
                      />
                      Your browser does not support playing this video.
                    </video>
                  ) : rawUrl ? (
                    /* Direct <iframe> Fallback */
                    <iframe
                      src={rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`}
                      title={video.title || 'Video Player'}
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      allowFullScreen
                    />
                  ) : (
                    <p style={{ color: '#9ca3af', fontSize: '12px' }}>No video link provided</p>
                  )}
                </div>

                {video.description && (
                  <p style={{ fontSize: '14px', color: '#4b5563', marginTop: '8px' }}>
                    {video.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default VideoList;