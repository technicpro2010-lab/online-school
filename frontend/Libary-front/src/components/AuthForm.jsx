import React, { useState } from 'react';
import axios from 'axios';

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = isLogin 
      ? 'http://127.0.0.1:8000/api/login' 
      : 'http://127.0.0.1:8000/api/register';

    axios.post(endpoint, formData, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        const { user, access_token } = res.data;
        const cleanToken = access_token?.trim();
        
        localStorage.setItem('token', cleanToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${cleanToken}`;
        axios.defaults.headers.common['Accept'] = 'application/json';
        
        onLoginSuccess(user);
      })
      .catch(err => {
        console.error('Auth Full Error:', err.response);
        const responseData = err.response?.data;
        if (responseData?.errors) {
          const firstErrorField = Object.keys(responseData.errors)[0];
          alert(responseData.errors[firstErrorField][0]);
        } else if (responseData?.message) {
          alert(responseData.message);
        } else {
          alert('Authentication failed. Please check your network or server logs.');
        }
      })
      .finally(() => setLoading(false));
  };

  const isPrivilegedRole = formData.role === 'teacher' || formData.role === 'admin' || formData.role === 'enroll_dept';

  const WHATSAPP_NUMBER = '+1-712-335-9066';
  const WHATSAPP_LINK = 'https://wa.me/17123359066?text=Hello,%20I%20would%20like%20to%20inquire%20about%20admission%20and%20enrollment%20in%20the%20Computer%20Science%20program.';

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f8fafc', color: '#0f172a', minHeight: '100vh' }}>
      
      {/* 1. TOP HEADER & NAVBAR */}
      <header style={{ backgroundColor: '#1e293b', color: '#fff', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ backgroundColor: '#2563eb', color: '#fff', width: '38px', height: '38px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px' }}>
            💻
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', letterSpacing: '-0.02em' }}>School Online Academy</h1>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Computer Science &amp; Digital Learning Portal</span>
          </div>
        </div>

        <nav style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <a href="#about" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Teaching Method</a>
          <a href="#admissions" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Admissions Guide</a>
          <a href="#courses" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>CS Catalog</a>
          <a 
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            style={{ backgroundColor: '#25d366', color: '#fff', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <span>💬</span> WhatsApp Us
          </a>
        </nav>
      </header>

      {/* 2. HERO SECTION (Dual Column: Intro Text Left + Auth Card Right) */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '40px', alignItems: 'center' }}>
        
        {/* Left Column: School Value Proposition */}
        <div>
          <span style={{ backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', fontSize: '12px', fontWeight: 'bold', padding: '4px 12px', borderRadius: '20px', display: 'inline-block', marginBottom: '16px' }}>
            🚀 Professional Computer Science Education
          </span>
          <h2 style={{ fontSize: '36px', fontWeight: '800', lineHeight: '1.2', color: '#0f172a', marginBottom: '16px' }}>
            Master Modern Computer Science with Live Mentorship
          </h2>
          <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.6', marginBottom: '24px' }}>
            Welcome to our specialized Online Learning Platform. We train students professionally through live interactive classes, hands-on coding projects, and comprehensive digital library resources.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
            <div style={{ backgroundColor: '#fff', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>🎥</div>
              <strong style={{ fontSize: '14px', display: 'block', color: '#1e293b' }}>Live Interactive Classes</strong>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Scheduled Google Meet &amp; Q&amp;A</span>
            </div>

            <div style={{ backgroundColor: '#fff', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>📖</div>
              <strong style={{ fontSize: '14px', display: 'block', color: '#1e293b' }}>Digital Library Access</strong>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Books, Video Lessons &amp; Papers</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#f1f5f9', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <span style={{ fontSize: '24px' }}>📞</span>
            <div>
              <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Admission &amp; Inquiry WhatsApp:</span>
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" style={{ color: '#059669', fontWeight: 'bold', textDecoration: 'none', fontSize: '15px' }}>
                {WHATSAPP_NUMBER} ↗
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Card */}
        <div style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '6px', fontSize: '22px', fontWeight: 'bold', color: '#0f172a' }}>
            {isLogin ? 'Welcome Back' : 'Student & Teacher Registration'}
          </h3>
          <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
            {isLogin ? 'Sign in to access your live classes & course materials' : 'Fill in your details to create an account'}
          </p>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', fontWeight: '600', color: '#334155' }}>Full Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. John Doe"
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '14px' }}
                />
              </div>
            )}

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', fontWeight: '600', color: '#334155' }}>Email Address</label>
              <input 
                type="email" 
                required 
                placeholder="name@example.com"
                value={formData.email} 
                onChange={e => setFormData({ ...formData, email: e.target.value })} 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '14px' }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', fontWeight: '600', color: '#334155' }}>Password</label>
              <input 
                type="password" 
                required 
                placeholder="••••••••"
                value={formData.password} 
                onChange={e => setFormData({ ...formData, password: e.target.value })} 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '14px' }}
              />
            </div>

            {!isLogin && (
              <>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', fontWeight: '600', color: '#334155' }}>Confirm Password</label>
                  <input 
                    type="password" 
                    required 
                    placeholder="••••••••"
                    value={formData.password_confirmation} 
                    onChange={e => setFormData({ ...formData, password_confirmation: e.target.value })} 
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '14px' }}
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', fontWeight: '600', color: '#334155' }}>Account Role</label>
                  <select 
                    value={formData.role} 
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', backgroundColor: '#fff', fontSize: '14px' }}
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="enroll_dept">Enrollment Department</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {isPrivilegedRole && (
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', fontWeight: '600', color: '#dc2626' }}>
                      Secret Authorization Passkey
                    </label>
                    <input 
                      type="password" 
                      required 
                      placeholder="Enter role passkey"
                      value={formData.invite_code} 
                      onChange={e => setFormData({ ...formData, invite_code: e.target.value })} 
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #dc2626', boxSizing: 'border-box', fontSize: '14px' }}
                    />
                  </div>
                )}
              </>
            )}

            <button 
              type="submit" 
              disabled={loading}
              style={{ width: '100%', padding: '12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '15px', marginTop: '8px' }}
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In to Account' : 'Complete Registration')}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#64748b' }}>
            {isLogin ? "New to our academy? " : "Already have an account? "}
            <span 
              onClick={() => setIsLogin(!isLogin)} 
              style={{ color: '#2563eb', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {isLogin ? 'Create Account' : 'Sign In'}
            </span>
          </p>
        </div>
      </section>

      {/* 3. SECTION: HOW WE TEACH STUDENTS PROFESSIONALLY */}
      <section id="about" style={{ backgroundColor: '#fff', padding: '60px 24px', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a', marginBottom: '10px' }}>
              How We Teach Students Professionally
            </h2>
            <p style={{ color: '#64748b', fontSize: '16px', maxWidth: '650px', margin: '0 auto' }}>
              Our methodology combines live interactive instruction, real-world software engineering practices, and structured learning paths.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            
            {/* Feature 1 */}
            <div style={{ padding: '24px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ width: '44px', height: '44px', backgroundColor: '#dbeafe', color: '#1d4ed8', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '16px' }}>
                🎥
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>
                1. Scheduled Live Classes
              </h3>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                Teachers schedule live video lectures on Google Meet. Students join directly from their dashboard with automated attendance logging.
              </p>
            </div>

            {/* Feature 2 */}
            <div style={{ padding: '24px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ width: '44px', height: '44px', backgroundColor: '#dcfce7', color: '#15803d', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '16px' }}>
                💻
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>
                2. Hands-On Practical Coding
              </h3>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                Students practice real software development, writing clean code in Python, C++, MySQL, JavaScript, and Laravel framework.
              </p>
            </div>

            {/* Feature 3 */}
            <div style={{ padding: '24px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ width: '44px', height: '44px', backgroundColor: '#fef3c7', color: '#b45309', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '16px' }}>
                📖
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>
                3. Curated Library Resources
              </h3>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                Enrolled students get instant access to PDF course books, video lessons, technical guides, and articles uploaded by instructors.
              </p>
            </div>

            {/* Feature 4 */}
            <div style={{ padding: '24px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ width: '44px', height: '44px', backgroundColor: '#f3e8ff', color: '#6b21a8', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '16px' }}>
                👨‍🏫
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>
                4. Dedicated Mentorship
              </h3>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                Our experienced computer science faculty provides personalized feedback, answering student questions during and after live classes.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. SECTION: ADMISSION GUIDELINES & WHATSAPP PROCESS */}
      <section id="admissions" style={{ padding: '60px 24px', backgroundColor: '#f8fafc' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '40px 32px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span style={{ backgroundColor: '#dcfce7', color: '#15803d', fontSize: '12px', fontWeight: 'bold', padding: '4px 12px', borderRadius: '20px', display: 'inline-block', marginBottom: '12px' }}>
              📋 Admission Guidelines
            </span>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>
              How to Enroll in Classes
            </h2>
            <p style={{ color: '#64748b', fontSize: '15px' }}>
              Follow our simple step-by-step admission guidelines to get enrolled.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            
            {/* Step 1 */}
            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', position: 'relative' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#2563eb', backgroundColor: '#dbeafe', padding: '2px 8px', borderRadius: '4px' }}>
                STEP 1
              </span>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', marginTop: '10px', marginBottom: '6px' }}>
                Contact via WhatsApp
              </h3>
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5', margin: 0 }}>
                First, talk directly with our enrollment department via WhatsApp at <strong>{WHATSAPP_NUMBER}</strong> to discuss your background and course goals.
              </p>
            </div>

            {/* Step 2 */}
            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#2563eb', backgroundColor: '#dbeafe', padding: '2px 8px', borderRadius: '4px' }}>
                STEP 2
              </span>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', marginTop: '10px', marginBottom: '6px' }}>
                Course Selection &amp; Approval
              </h3>
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5', margin: 0 }}>
                Select your Computer Science subject(s). Our department approves your enrollment and assigns your student portal access.
              </p>
            </div>

            {/* Step 3 */}
            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#2563eb', backgroundColor: '#dbeafe', padding: '2px 8px', borderRadius: '4px' }}>
                STEP 3
              </span>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', marginTop: '10px', marginBottom: '6px' }}>
                Access Learning Portal
              </h3>
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5', margin: 0 }}>
                Log in to your Student Dashboard to join live Google Meet classes, read course books, and watch video lessons.
              </p>
            </div>

          </div>

          {/* Call To Action Box */}
          <div style={{ textAlign: 'center', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '24px', borderRadius: '10px' }}>
            <h4 style={{ fontSize: '18px', fontWeight: 'bold', color: '#166534', margin: '0 0 8px 0' }}>
              Ready to Begin Your Admission?
            </h4>
            <p style={{ fontSize: '14px', color: '#15803d', margin: '0 0 16px 0' }}>
              Reach out to our enrollment team on WhatsApp to confirm your courses today.
            </p>
            <a 
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              style={{ backgroundColor: '#25d366', color: '#fff', padding: '12px 28px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
            >
              <span>💬</span> Chat on WhatsApp ({WHATSAPP_NUMBER}) ↗
            </a>
          </div>

        </div>
      </section>

      {/* 5. SECTION: COMPUTER SCIENCE COURSE CATALOG */}
      <section id="courses" style={{ backgroundColor: '#fff', padding: '60px 24px', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ backgroundColor: '#eff6ff', color: '#2563eb', fontSize: '12px', fontWeight: 'bold', padding: '4px 12px', borderRadius: '20px', display: 'inline-block', marginBottom: '12px' }}>
              💻 Core Curriculum
            </span>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>
              Computer Science Course Catalog
            </h2>
            <p style={{ color: '#64748b', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
              We focus heavily on Computer Science subjects to equip students with core software engineering skills.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            
            {/* Course 1 */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '24px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div>
                <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', fontSize: '11px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px' }}>
                  CS-101
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', marginTop: '12px', marginBottom: '8px' }}>
                  Fundamentals of Programming
                </h3>
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', marginBottom: '16px' }}>
                  Master core programming concepts including variables, control structures, functions, pseudo-code, and algorithm design.
                </p>
              </div>
              <div style={{ paddingTop: '12px', borderTop: '1px solid #f1f5f9', fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                Key Topics: Logic Gates, Control Flow, Python/C++
              </div>
            </div>

            {/* Course 2 */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '24px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div>
                <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', fontSize: '11px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px' }}>
                  CS-201
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', marginTop: '12px', marginBottom: '8px' }}>
                  Relational Database Systems
                </h3>
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', marginBottom: '16px' }}>
                  Learn relational database design, Primary vs Foreign keys, SQL queries, normalization, and MySQL data storage.
                </p>
              </div>
              <div style={{ paddingTop: '12px', borderTop: '1px solid #f1f5f9', fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                Key Topics: MySQL, Normalization, SQL Queries
              </div>
            </div>

            {/* Course 3 */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '24px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div>
                <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', fontSize: '11px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px' }}>
                  CS-301
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', marginTop: '12px', marginBottom: '8px' }}>
                  Web Application Development
                </h3>
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', marginBottom: '16px' }}>
                  Build full-stack web applications using modern React frontend UI components and Laravel RESTful backend APIs.
                </p>
              </div>
              <div style={{ paddingTop: '12px', borderTop: '1px solid #f1f5f9', fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                Key Topics: React, Laravel, REST API, JavaScript
              </div>
            </div>

            {/* Course 4 */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '24px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div>
                <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', fontSize: '11px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px' }}>
                  CS-401
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', marginTop: '12px', marginBottom: '8px' }}>
                  Computer Science Theory
                </h3>
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', marginBottom: '16px' }}>
                  Understand computing theory, hardware architecture, Boolean algebra, computer networks, and examination prep.
                </p>
              </div>
              <div style={{ paddingTop: '12px', borderTop: '1px solid #f1f5f9', fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                Key Topics: Boolean Algebra, Hardware, Networks
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer style={{ backgroundColor: '#0f172a', color: '#94a3b8', padding: '40px 24px', borderTop: '1px solid #1e293b', textAlign: 'center', fontSize: '14px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f8fafc' }}>
            💻 School Online Library &amp; Learning Academy
          </div>
          <p style={{ margin: 0, fontSize: '13px', maxWidth: '500px' }}>
            Empowering students with quality Computer Science education, live virtual classrooms, and comprehensive academic digital resources.
          </p>
          <div style={{ fontSize: '13px', color: '#cbd5e1' }}>
            Enrollment Support WhatsApp: <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" style={{ color: '#25d366', fontWeight: 'bold', textDecoration: 'none' }}>{WHATSAPP_NUMBER}</a>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '12px' }}>
            &copy; {new Date().getFullYear()} School Online Academy. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default AuthForm;