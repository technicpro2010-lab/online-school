import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000/api';

function ArticlesList({ user }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // /api/materials is enrollment-filtered on the backend for students
        const res = await axios.get(`${API_BASE}/materials`, { headers });
        const all = Array.isArray(res.data) ? res.data : [];

        // Keep only article-type materials
        const articleItems = all.filter(
          (item) => item.type === 'article' || item.type === 'Article'
        );
        setArticles(articleItems);
      } catch (err) {
        console.error('Error fetching articles:', err);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  if (loading) {
    return <div style={{ padding: '16px', color: '#6b7280' }}>Loading articles...</div>;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '26px', color: '#0f172a', margin: '0 0 8px 0' }}>
          Articles &amp; Knowledge Base
        </h2>
        <p style={{ color: '#64748b', fontSize: '15px' }}>
          Educational insights, study guides, and papers published by teachers — visible only to enrolled students.
        </p>
      </div>

      {articles.length === 0 ? (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: '#9ca3af',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          border: '1px dashed #d1d5db',
        }}>
          No articles available for your enrolled subjects yet.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {articles.map((article) => {
            const isExpanded = expandedId === article.id;
            const fileUrl = article.file_path
              ? (article.file_path.startsWith('http')
                  ? article.file_path
                  : `http://127.0.0.1:8000/storage/${article.file_path}`)
              : (article.url || null);

            return (
              <div
                key={article.id}
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                {/* Subject badge + date */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                  {article.subject && (
                    <span style={{
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      fontSize: '12px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: 'bold',
                    }}>
                      {article.subject.name}
                    </span>
                  )}
                  <span style={{
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    fontSize: '12px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                  }}>
                    Article
                  </span>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {formatDate(article.created_at)}
                  </span>
                </div>

                {/* Title */}
                <h3 style={{ fontSize: '18px', color: '#1e293b', margin: '0 0 8px 0' }}>
                  {article.title}
                </h3>

                {/* Description / excerpt */}
                {article.description && (
                  <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.6', margin: '0 0 12px 0' }}>
                    {article.description}
                  </p>
                )}

                {/* Footer: author + actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#64748b', flexWrap: 'wrap', gap: '8px' }}>
                  <span>
                    By <strong>{article.author_name || article.author || 'Teacher'}</strong>
                  </span>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {fileUrl && (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          backgroundColor: '#2563eb',
                          color: '#fff',
                          padding: '6px 14px',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          fontWeight: 'bold',
                          fontSize: '13px',
                        }}
                      >
                        Download / View ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ArticlesList;