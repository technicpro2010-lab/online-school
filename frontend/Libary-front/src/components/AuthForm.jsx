import React, { useState, useEffect } from 'react';
import axios from 'axios';
import nicsLogo from '../assets/nics_logo.jpg';

/* ─── Responsive styles injected once ─────────────────────────────────── */
const CSS = `
  *, *::before, *::after { box-sizing: border-box; }

  body { margin: 0; }

  .nics-root {
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    background: #f0f4ff;
    color: #0f172a;
    min-height: 100vh;
  }

  /* ── Header ─────────────────────────────────── */
  .nics-header {
    background: linear-gradient(135deg, #0a1628 0%, #1e3a8a 100%);
    color: #fff;
    padding: 14px 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .nics-brand {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .nics-logo-img {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    object-fit: cover;
    border: 2px solid rgba(255,255,255,0.25);
    box-shadow: 0 0 0 3px rgba(59,130,246,0.4);
  }

  .nics-brand-text h1 {
    margin: 0;
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.03em;
    background: linear-gradient(90deg, #ffffff, #93c5fd);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .nics-brand-text span {
    font-size: 11px;
    color: #93c5fd;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .nics-nav {
    display: flex;
    gap: 20px;
    align-items: center;
    flex-wrap: wrap;
  }

  .nics-nav a {
    color: #cbd5e1;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    transition: color 0.2s;
  }
  .nics-nav a:hover { color: #fff; }

  .btn-wa {
    background: #25d366;
    color: #fff !important;
    padding: 8px 18px;
    border-radius: 50px;
    text-decoration: none !important;
    font-weight: bold;
    font-size: 13px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    box-shadow: 0 4px 12px rgba(37,211,102,0.35);
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .btn-wa:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(37,211,102,0.45);
  }

  /* ── Hero ────────────────────────────────────── */
  .nics-hero {
    background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1d4ed8 100%);
    padding: 70px 24px;
    position: relative;
    overflow: hidden;
  }
  .nics-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    pointer-events: none;
  }

  .nics-hero-inner {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    align-items: center;
    position: relative;
    z-index: 1;
  }

  .nics-hero-left h2 {
    font-size: 40px;
    font-weight: 900;
    line-height: 1.15;
    color: #fff;
    margin: 0 0 18px 0;
    letter-spacing: -0.03em;
  }

  .nics-hero-left h2 span {
    background: linear-gradient(90deg, #60a5fa, #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .nics-hero-left p {
    font-size: 16px;
    color: #cbd5e1;
    line-height: 1.7;
    margin: 0 0 28px 0;
  }

  .nics-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(59,130,246,0.2);
    border: 1px solid rgba(96,165,250,0.4);
    color: #93c5fd;
    font-size: 12px;
    font-weight: 700;
    padding: 5px 14px;
    border-radius: 50px;
    margin-bottom: 20px;
    letter-spacing: 0.04em;
  }

  .nics-mini-cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-bottom: 24px;
  }

  .nics-mini-card {
    background: rgba(255,255,255,0.07);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 10px;
    padding: 14px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .nics-mini-card .icon {
    font-size: 22px;
    flex-shrink: 0;
  }

  .nics-mini-card strong {
    font-size: 13px;
    color: #f1f5f9;
    display: block;
    margin-bottom: 2px;
  }

  .nics-mini-card span {
    font-size: 11px;
    color: #94a3b8;
  }

  .nics-wa-strip {
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(37,211,102,0.1);
    border: 1px solid rgba(37,211,102,0.3);
    padding: 12px 16px;
    border-radius: 10px;
  }

  .nics-wa-strip .wa-label {
    font-size: 11px;
    color: #86efac;
    display: block;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .nics-wa-strip a {
    color: #4ade80;
    font-weight: bold;
    text-decoration: none;
    font-size: 16px;
    transition: color 0.2s;
  }
  .nics-wa-strip a:hover { color: #86efac; }

  /* ── Auth Card ───────────────────────────────── */
  .nics-auth-card {
    background: #fff;
    border-radius: 16px;
    padding: 36px;
    box-shadow: 0 25px 60px -10px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.1);
  }

  .nics-auth-card h3 {
    text-align: center;
    font-size: 22px;
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 6px 0;
  }

  .nics-auth-card p.subtitle {
    text-align: center;
    font-size: 13px;
    color: #64748b;
    margin: 0 0 24px 0;
  }

  .nics-field { margin-bottom: 16px; }

  .nics-field label {
    display: block;
    font-size: 12px;
    font-weight: 700;
    color: #334155;
    margin-bottom: 5px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .nics-field input,
  .nics-field select {
    width: 100%;
    padding: 11px 14px;
    border-radius: 8px;
    border: 1.5px solid #e2e8f0;
    font-size: 14px;
    color: #0f172a;
    background: #f8fafc;
    transition: border-color 0.2s, box-shadow 0.2s;
    outline: none;
  }
  .nics-field input:focus,
  .nics-field select:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
    background: #fff;
  }

  .nics-field.danger label { color: #dc2626; }
  .nics-field.danger input { border-color: #dc2626; }
  .nics-field.danger input:focus { box-shadow: 0 0 0 3px rgba(220,38,38,0.12); }

  .btn-submit {
    width: 100%;
    padding: 13px;
    background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%);
    color: #fff;
    border: none;
    border-radius: 8px;
    font-weight: 700;
    font-size: 15px;
    cursor: pointer;
    margin-top: 8px;
    letter-spacing: 0.02em;
    transition: transform 0.15s, box-shadow 0.15s;
    box-shadow: 0 4px 14px rgba(37,99,235,0.35);
  }
  .btn-submit:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(37,99,235,0.45);
  }
  .btn-submit:disabled { opacity: 0.65; cursor: not-allowed; }

  .nics-switch {
    text-align: center;
    margin-top: 20px;
    font-size: 14px;
    color: #64748b;
  }

  .nics-switch span {
    color: #2563eb;
    cursor: pointer;
    font-weight: 700;
    transition: color 0.2s;
  }
  .nics-switch span:hover { color: #1d4ed8; }

  /* ── About / Teaching Section ────────────────── */
  .nics-section {
    padding: 70px 24px;
  }
  .nics-section.gray { background: #f0f4ff; }
  .nics-section.white { background: #fff; }
  .nics-section.dark {
    background: linear-gradient(135deg, #0f172a, #1e3a8a);
    color: #fff;
  }

  .nics-section-inner {
    max-width: 1100px;
    margin: 0 auto;
  }

  .section-header {
    text-align: center;
    margin-bottom: 48px;
  }

  .section-header h2 {
    font-size: 32px;
    font-weight: 800;
    margin: 12px 0 12px 0;
    letter-spacing: -0.02em;
  }

  .section-header p {
    font-size: 16px;
    color: #64748b;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.65;
  }
  .nics-section.dark .section-header p { color: #94a3b8; }
  .nics-section.dark .section-header h2 { color: #fff; }

  .feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 24px;
  }

  .feature-card {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 26px;
    transition: transform 0.2s, box-shadow 0.2s;
    position: relative;
    overflow: hidden;
  }
  .feature-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #2563eb, #7c3aed);
  }
  .feature-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0,0,0,0.1);
  }

  .feature-icon {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    margin-bottom: 16px;
  }

  .feature-card h3 {
    font-size: 16px;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 8px 0;
  }

  .feature-card p {
    font-size: 14px;
    color: #475569;
    line-height: 1.65;
    margin: 0;
  }

  /* ── Admission Steps ─────────────────────────── */
  .steps-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 24px;
    margin-bottom: 36px;
  }

  .step-card {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 12px;
    padding: 24px;
    position: relative;
  }

  .step-number {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #2563eb, #7c3aed);
    color: #fff;
    font-size: 16px;
    font-weight: 900;
    margin-bottom: 14px;
  }

  .step-card h3 {
    font-size: 16px;
    font-weight: 700;
    color: #f1f5f9;
    margin: 0 0 8px 0;
  }

  .step-card p {
    font-size: 13px;
    color: #94a3b8;
    line-height: 1.6;
    margin: 0;
  }

  .admission-cta {
    text-align: center;
    background: rgba(37,211,102,0.1);
    border: 1px solid rgba(37,211,102,0.25);
    border-radius: 14px;
    padding: 32px;
  }

  .admission-cta h4 {
    font-size: 20px;
    font-weight: 800;
    color: #4ade80;
    margin: 0 0 8px 0;
  }

  .admission-cta p {
    font-size: 14px;
    color: #86efac;
    margin: 0 0 20px 0;
  }

  .btn-wa-large {
    background: #25d366;
    color: #fff;
    padding: 14px 32px;
    border-radius: 50px;
    text-decoration: none;
    font-weight: 800;
    font-size: 16px;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 6px 20px rgba(37,211,102,0.4);
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .btn-wa-large:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(37,211,102,0.5);
  }

  /* ── Course Cards ────────────────────────────── */
  .courses-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 24px;
  }

  .course-card {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 28px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .course-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 14px 35px rgba(0,0,0,0.1);
  }

  .course-tag {
    display: inline-block;
    background: linear-gradient(135deg, #dbeafe, #ede9fe);
    color: #1d4ed8;
    font-size: 11px;
    font-weight: 800;
    padding: 4px 10px;
    border-radius: 6px;
    letter-spacing: 0.06em;
    margin-bottom: 14px;
  }

  .course-card h3 {
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 10px 0;
  }

  .course-card p {
    font-size: 13px;
    color: #475569;
    line-height: 1.65;
    flex: 1;
    margin: 0 0 16px 0;
  }

  .course-topics {
    border-top: 1px solid #f1f5f9;
    padding-top: 12px;
    font-size: 12px;
    color: #64748b;
    font-weight: 600;
  }

  /* ── Footer ──────────────────────────────────── */
  .nics-footer {
    background: #070e1f;
    color: #64748b;
    padding: 48px 24px 28px;
    text-align: center;
  }

  .nics-footer-brand {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    margin-bottom: 16px;
  }

  .nics-footer-logo {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    object-fit: cover;
    opacity: 0.85;
  }

  .nics-footer-brand-name {
    font-size: 20px;
    font-weight: 800;
    color: #f1f5f9;
  }

  .nics-footer p {
    font-size: 13px;
    max-width: 480px;
    margin: 0 auto 16px;
    line-height: 1.65;
  }

  .nics-footer-links {
    display: flex;
    justify-content: center;
    gap: 24px;
    flex-wrap: wrap;
    margin-bottom: 20px;
  }

  .nics-footer-links a {
    color: #94a3b8;
    text-decoration: none;
    font-size: 13px;
    transition: color 0.2s;
  }
  .nics-footer-links a:hover { color: #fff; }

  .nics-copyright {
    font-size: 12px;
    color: #334155;
    margin-top: 16px;
  }

  /* ── Responsive ──────────────────────────────── */
  @media (max-width: 900px) {
    .nics-hero-inner {
      grid-template-columns: 1fr;
    }
    .nics-hero-left h2 { font-size: 30px; }
  }

  @media (max-width: 640px) {
    .nics-header { padding: 12px 16px; }
    .nics-nav { gap: 12px; }
    .nics-nav a { display: none; }
    .nics-brand-text h1 { font-size: 17px; }
    .nics-hero { padding: 40px 16px; }
    .nics-hero-left h2 { font-size: 26px; }
    .nics-mini-cards { grid-template-columns: 1fr; }
    .nics-auth-card { padding: 24px 18px; }
    .nics-section { padding: 48px 16px; }
    .section-header h2 { font-size: 24px; }
  }
`;

/* ─── Component ────────────────────────────────────────────────────────── */
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

  /* Inject CSS once */
  useEffect(() => {
    const id = 'nics-styles';
    if (!document.getElementById(id)) {
      const tag = document.createElement('style');
      tag.id = id;
      tag.textContent = CSS;
      document.head.appendChild(tag);
    }
    return () => {};
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = isLogin
      ? 'http://127.0.0.1:8000/api/login'
      : 'http://127.0.0.1:8000/api/register';

    axios
      .post(endpoint, formData, {
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      })
      .then((res) => {
        const { user, access_token } = res.data;
        const cleanToken = access_token?.trim();
        localStorage.setItem('token', cleanToken);
        localStorage.setItem('user', JSON.stringify(user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${cleanToken}`;
        axios.defaults.headers.common['Accept'] = 'application/json';
        onLoginSuccess(user);
      })
      .catch((err) => {
        const data = err.response?.data;
        if (data?.errors) {
          const first = Object.keys(data.errors)[0];
          alert(data.errors[first][0]);
        } else if (data?.message) {
          alert(data.message);
        } else {
          alert('Authentication failed. Please check your credentials or server.');
        }
      })
      .finally(() => setLoading(false));
  };

  const isPrivileged = ['teacher', 'admin', 'enroll_dept'].includes(formData.role);

  const WA_NUM = '+1-712-335-9066';
  const WA_LINK =
    'https://wa.me/17123359066?text=Hello,%20I%20would%20like%20to%20inquire%20about%20admission%20and%20enrollment%20in%20the%20Computer%20Science%20program.';

  return (
    <div className="nics-root">

      {/* ══ HEADER ══════════════════════════════════════════════════════ */}
      <header className="nics-header">
        <div className="nics-brand">
          <img src={nicsLogo} alt="NICS Logo" className="nics-logo-img" />
          <div className="nics-brand-text">
            <h1>NICS</h1>
            <span>National Institute of Computer Science</span>
          </div>
        </div>

        <nav className="nics-nav">
          <a href="#about">Teaching Method</a>
          <a href="#admissions">Admissions</a>
          <a href="#courses">CS Catalog</a>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="btn-wa">
            💬 WhatsApp Us
          </a>
        </nav>
      </header>

      {/* ══ HERO ════════════════════════════════════════════════════════ */}
      <section className="nics-hero">
        <div className="nics-hero-inner">

          {/* Left — Value Proposition */}
          <div className="nics-hero-left">
            <div className="nics-badge">🚀 Professional Computer Science Education</div>

            <h2>
              Master Modern CS with{' '}
              <span>Live Expert Mentorship</span>
            </h2>

            <p>
              Welcome to <strong style={{ color: '#93c5fd' }}>NICS</strong> — the National Institute
              of Computer Science. We train students through live interactive classes, hands-on
              coding projects, and a comprehensive digital library.
            </p>

            <div className="nics-mini-cards">
              <div className="nics-mini-card">
                <span className="icon">🎥</span>
                <div>
                  <strong>Live Classes</strong>
                  <span>Google Meet &amp; Q&amp;A</span>
                </div>
              </div>
              <div className="nics-mini-card">
                <span className="icon">📖</span>
                <div>
                  <strong>Digital Library</strong>
                  <span>Books, Videos &amp; Papers</span>
                </div>
              </div>
              <div className="nics-mini-card">
                <span className="icon">💻</span>
                <div>
                  <strong>Hands-on Coding</strong>
                  <span>Python, C++, JS, Laravel</span>
                </div>
              </div>
              <div className="nics-mini-card">
                <span className="icon">🎓</span>
                <div>
                  <strong>Certified Faculty</strong>
                  <span>CS Expert Instructors</span>
                </div>
              </div>
            </div>

            <div className="nics-wa-strip">
              <span style={{ fontSize: '26px' }}>💬</span>
              <div>
                <span className="wa-label">Admission &amp; Inquiry WhatsApp</span>
                <a href={WA_LINK} target="_blank" rel="noopener noreferrer">
                  {WA_NUM} ↗
                </a>
              </div>
            </div>
          </div>

          {/* Right — Auth Card */}
          <div className="nics-auth-card">
            <h3>{isLogin ? '👋 Welcome Back' : '📝 Create Account'}</h3>
            <p className="subtitle">
              {isLogin
                ? 'Sign in to access your live classes & course materials'
                : 'Fill in your details to register with NICS'}
            </p>

            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="nics-field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ahmad Karimi"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              )}

              <div className="nics-field">
                <label>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="nics-field">
                <label>Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              {!isLogin && (
                <>
                  <div className="nics-field">
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={formData.password_confirmation}
                      onChange={(e) =>
                        setFormData({ ...formData, password_confirmation: e.target.value })
                      }
                    />
                  </div>

                  <div className="nics-field">
                    <label>Account Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="enroll_dept">Enrollment Department</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {isPrivileged && (
                    <div className="nics-field danger">
                      <label>🔑 Secret Authorization Passkey</label>
                      <input
                        type="password"
                        required
                        placeholder="Enter role passkey"
                        value={formData.invite_code}
                        onChange={(e) =>
                          setFormData({ ...formData, invite_code: e.target.value })
                        }
                      />
                    </div>
                  )}
                </>
              )}

              <button type="submit" disabled={loading} className="btn-submit">
                {loading ? '⏳ Processing...' : isLogin ? 'Sign In to NICS Portal' : 'Complete Registration'}
              </button>
            </form>

            <div className="nics-switch">
              {isLogin ? 'New to NICS? ' : 'Already have an account? '}
              <span onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? 'Create Account' : 'Sign In'}
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* ══ HOW WE TEACH ════════════════════════════════════════════════ */}
      <section id="about" className="nics-section white">
        <div className="nics-section-inner">
          <div className="section-header">
            <div className="nics-badge" style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', marginBottom: '10px' }}>
              🏫 Our Teaching Methodology
            </div>
            <h2 style={{ color: '#0f172a' }}>How We Teach Students Professionally</h2>
            <p>
              Our methodology combines live interactive instruction, real-world software engineering
              practices, and structured learning paths tailored to each student's level.
            </p>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon" style={{ background: '#dbeafe' }}>🎥</div>
              <h3>1. Scheduled Live Classes</h3>
              <p>
                Teachers schedule live video lectures on Google Meet. Students join directly from
                their dashboard with automated attendance logging and real-time Q&amp;A.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ background: '#dcfce7' }}>💻</div>
              <h3>2. Hands-On Practical Coding</h3>
              <p>
                Students write clean, professional code in Python, C++, MySQL, JavaScript, and
                Laravel — building real-world applications from day one.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ background: '#fef3c7' }}>📖</div>
              <h3>3. Curated Digital Library</h3>
              <p>
                Enrolled students get instant access to PDF course books, video lessons, technical
                guides, and research articles uploaded by certified instructors.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ background: '#f3e8ff' }}>👨‍🏫</div>
              <h3>4. Dedicated Expert Mentorship</h3>
              <p>
                Our experienced computer science faculty provide personalized feedback, answering
                student questions during and after every live session.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ ADMISSION GUIDELINES ════════════════════════════════════════ */}
      <section id="admissions" className="nics-section dark">
        <div className="nics-section-inner">
          <div className="section-header">
            <div className="nics-badge" style={{ background: 'rgba(37,211,102,0.15)', border: '1px solid rgba(37,211,102,0.3)', color: '#4ade80', marginBottom: '10px' }}>
              📋 Admission Guidelines
            </div>
            <h2>How to Enroll at NICS</h2>
            <p style={{ color: '#94a3b8' }}>
              Follow our simple step-by-step admission process to begin your Computer Science journey.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Contact via WhatsApp</h3>
              <p>
                First, speak directly with our enrollment team on WhatsApp at{' '}
                <strong style={{ color: '#4ade80' }}>{WA_NUM}</strong> to discuss your background,
                goals, and the courses that best suit you.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Course Selection &amp; Approval</h3>
              <p>
                Choose your Computer Science subject(s). Our department approves your enrollment,
                sets up your student portal account, and assigns your subjects.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Access Your Learning Portal</h3>
              <p>
                Log in to your NICS Student Dashboard to join live Google Meet classes, read
                course books, watch video lessons, and track your progress.
              </p>
            </div>
          </div>

          <div className="admission-cta">
            <h4>🎓 Ready to Begin Your Journey?</h4>
            <p>Reach out to our enrollment team on WhatsApp to confirm your courses today.</p>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="btn-wa-large">
              💬 Chat on WhatsApp — {WA_NUM}
            </a>
          </div>
        </div>
      </section>

      {/* ══ COURSE CATALOG ══════════════════════════════════════════════ */}
      <section id="courses" className="nics-section gray">
        <div className="nics-section-inner">
          <div className="section-header">
            <div className="nics-badge" style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', marginBottom: '10px' }}>
              💻 Core Curriculum
            </div>
            <h2 style={{ color: '#0f172a' }}>Computer Science Course Catalog</h2>
            <p>
              NICS focuses on Computer Science subjects to equip students with real software
              engineering skills for today's digital world.
            </p>
          </div>

          <div className="courses-grid">
            <div className="course-card">
              <span className="course-tag">CS-101</span>
              <h3>Fundamentals of Programming</h3>
              <p>
                Master core programming concepts — variables, control structures, functions,
                pseudo-code, and algorithm design to build a strong foundation.
              </p>
              <div className="course-topics">🔑 Logic Gates · Control Flow · Python / C++</div>
            </div>

            <div className="course-card">
              <span className="course-tag">CS-201</span>
              <h3>Relational Database Systems</h3>
              <p>
                Learn relational database design, Primary &amp; Foreign keys, SQL queries,
                normalization forms, and professional MySQL data storage.
              </p>
              <div className="course-topics">🔑 MySQL · Normalization · SQL Queries</div>
            </div>

            <div className="course-card">
              <span className="course-tag">CS-301</span>
              <h3>Web Application Development</h3>
              <p>
                Build full-stack web applications using modern React UI components and Laravel
                RESTful backend APIs with industry-standard patterns.
              </p>
              <div className="course-topics">🔑 React · Laravel · REST API · JavaScript</div>
            </div>

            <div className="course-card">
              <span className="course-tag">CS-401</span>
              <h3>Computer Science Theory</h3>
              <p>
                Understand computing theory, hardware architecture, Boolean algebra, computer
                networks, operating systems, and university exam preparation.
              </p>
              <div className="course-topics">🔑 Boolean Algebra · Hardware · Networks</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══════════════════════════════════════════════════════ */}
      <footer className="nics-footer">
        <div className="nics-footer-brand">
          <img src={nicsLogo} alt="NICS" className="nics-footer-logo" />
          <span className="nics-footer-brand-name">NICS</span>
        </div>

        <p>
          Empowering students with quality Computer Science education, live virtual classrooms,
          and comprehensive academic digital resources.
        </p>

        <div className="nics-footer-links">
          <a href="#about">Teaching Method</a>
          <a href="#admissions">Admissions</a>
          <a href="#courses">CS Catalog</a>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" style={{ color: '#4ade80' }}>
            💬 {WA_NUM}
          </a>
        </div>

        <div className="nics-copyright">
          © {new Date().getFullYear()} NICS — National Institute of Computer Science. All rights reserved.
        </div>
      </footer>

    </div>
  );
};

export default AuthForm;