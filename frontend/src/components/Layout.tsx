import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, BarChart3, Settings, LogOut, Plus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-title">LS Comms</h1>
        </div>

        <nav className="sidebar-nav">
          <Link
            to="/"
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            <Calendar size={20} />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/compose"
            className={`nav-link ${isActive('/compose') ? 'active' : ''}`}
          >
            <Plus size={20} />
            <span>New Post</span>
          </Link>

          <Link
            to="/analytics"
            className={`nav-link ${isActive('/analytics') ? 'active' : ''}`}
          >
            <BarChart3 size={20} />
            <span>Analytics</span>
          </Link>

          <Link
            to="/settings"
            className={`nav-link ${isActive('/settings') ? 'active' : ''}`}
          >
            <Settings size={20} />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
