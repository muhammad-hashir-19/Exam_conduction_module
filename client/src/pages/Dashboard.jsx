import React from 'react';
import { Target, Award, Clock, Activity, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import AdminTools from '../components/AdminTools';

const Dashboard = () => {
  const { userStats, user, token, logout } = useAppContext();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'ADMIN';

  if (!token) {
    return (
      <div className="container animate-fade-in text-center mt-8">
        <AlertCircle size={48} style={{ color: 'var(--warning)', marginBottom: '1rem' }} />
        <h2>Authentication Required</h2>
        <p>Please login to view your progress.</p>
        <button onClick={() => navigate('/login')} className="btn btn-primary mt-4">Go to Login</button>
      </div>
    );
  }

  if (!userStats) {
    return (
      <div className="container text-center mt-8">
        <div className="animate-pulse" style={{ marginBottom: '1rem' }}>Loading your secure dashboard...</div>
        <button onClick={() => logout()} className="btn btn-secondary mt-4">Reset Session</button>
      </div>
    );
  }

  const recentAttempts = user.testAttempts || [];
  const certifications = user.certifications || [];

  return (
    <div className="container animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2>Welcome back, {user.name}</h2>
          <p style={{ marginBottom: 0 }}>Here is your recent performance summary</p>
        </div>
        <button onClick={() => navigate('/exams')} className="btn btn-primary">
          Take a New Exam
        </button>
      </div>

      {isAdmin && <AdminTools />}

      <div className="grid grid-cols-4 stagger-1 mb-8">
        <div className="card glass-panel">
          <div className="flex justify-between items-center mb-2">
            <span className="form-label mb-0">Total Exams</span>
            <Activity size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <h1 style={{ marginBottom: 0 }}>{userStats.totalAttempts}</h1>
        </div>
        
        <div className="card glass-panel">
          <div className="flex justify-between items-center mb-2">
            <span className="form-label mb-0">Passed</span>
            <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />
          </div>
          <h1 style={{ marginBottom: 0 }}>{userStats.passedAttempts}</h1>
        </div>

        <div className="card glass-panel">
          <div className="flex justify-between items-center mb-2">
            <span className="form-label mb-0">Certificates</span>
            <Award size={20} style={{ color: 'var(--secondary)' }} />
          </div>
          <h1 style={{ marginBottom: 0 }}>{userStats.certificationCount}</h1>
        </div>

        <div className="card glass-panel">
          <div className="flex justify-between items-center mb-2">
            <span className="form-label mb-0">Badges earned</span>
            <Target size={20} style={{ color: 'var(--warning)' }} />
          </div>
          <h1 style={{ marginBottom: 0 }}>{userStats.badgeCount}</h1>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 stagger-2">
        <div className="card glass-panel" style={{ padding: '1.5rem' }}>
          <h3 className="mb-4">Recent Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentAttempts.length > 0 ? recentAttempts.map(attempt => (
              <div key={attempt.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem' }}>{attempt.exam?.title}</h4>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} /> {new Date(attempt.attemptDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-right">
                  <div className={`badge ${attempt.status === 'PASSED' ? 'badge-success' : 'badge-danger'}`} style={{ marginBottom: '4px', background: attempt.status === 'FAILED' ? 'rgba(239, 68, 68, 0.2)' : undefined, color: attempt.status === 'FAILED' ? '#fca5a5' : undefined }}>
                    {attempt.status}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700 }}>{attempt.score} pts</div>
                </div>
              </div>
            )) : (
              <p className="text-center" style={{ color: 'var(--text-muted)' }}>No exam attempts yet.</p>
            )}
          </div>
        </div>

        <div className="card glass-panel" style={{ padding: '1.5rem' }}>
          <h3 className="mb-4">My Certifications</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {certifications.length > 0 ? certifications.map(cert => (
              <div key={cert.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', padding: '0.75rem', borderRadius: '12px' }}>
                  <Award size={24} color="white" />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0 }}>{cert.exam?.title || 'Skill Certificate'}</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>ID: CERT-{cert.id.split('-')[0].toUpperCase()}</p>
                </div>
                <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Download</button>
              </div>
            )) : (
              <div className="text-center" style={{ padding: '2rem 0' }}>
                <p>No certifications earned yet. Complete an exam to get certified!</p>
                <button onClick={() => navigate('/exams')} className="btn btn-secondary mt-2">Browse Exams</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
