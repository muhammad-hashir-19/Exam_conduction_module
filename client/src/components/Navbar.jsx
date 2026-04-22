import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, LayoutDashboard, ScrollText, LogOut, LogIn } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, logout, user } = useAppContext();
  
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="nav-brand">
          <GraduationCap style={{ color: 'var(--primary)' }} size={28} />
          <span>SkillCertify</span>
        </Link>
        <div className="nav-links">
          <Link to="/" className={`nav-link ${isActive('/')}`}>Home</Link>
          <Link to="/exams" className={`nav-link ${isActive('/exams')}`}>
            <ScrollText size={18} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
            Exams
          </Link>
          <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>
            <LayoutDashboard size={18} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
            Dashboard
          </Link>
          {token ? (
            <div className="flex items-center gap-4">
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{user?.name}</span>
              <button onClick={logout} className="btn btn-secondary" style={{ padding: '0.4rem 1rem' }}>
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ padding: '0.4rem 1rem' }}>
              <LogIn size={16} />
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
