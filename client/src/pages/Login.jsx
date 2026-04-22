import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Invalid credentials');
    }
  };

  return (
    <div className="container animate-fade-in flex justify-center items-center" style={{ minHeight: '70vh' }}>
      <div className="card glass-panel" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="text-center mb-8">
          <LogIn size={48} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
          <h2>Welcome Back</h2>
          <p>Login to access your skill assessments</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}
          
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              placeholder="name@example.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Login
          </button>
        </form>
        
        <p className="text-center mt-4" style={{ fontSize: '0.85rem' }}>
          Don't have an account? <span style={{ color: 'var(--primary)', cursor: 'pointer' }}>Register here</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
