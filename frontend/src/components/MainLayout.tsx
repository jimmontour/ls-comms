import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Share2, LogOut, Menu, X, Link as LinkIcon, Folder, Newspaper } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import './MainLayout.css';
import { useState } from 'react';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="main-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-title">LS Comms</h1>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {/* Main */}
          <div className="nav-section">
            <Link to="/" className={`nav-link ${isActive('/') && location.pathname === '/' ? 'active' : ''}`}>
              <Home size={20} />
              <span>Home</span>
            </Link>
          </div>

          {/* Communications */}
          <div className="nav-section">
            <div className="nav-section-label">Communications</div>
            <Link
              to="/social-media"
              className={`nav-link ${isActive('/social-media') ? 'active' : ''}`}
            >
              <Share2 size={20} />
              <span>Social Media</span>
            </Link>
            <Link
              to="/link-tree"
              className={`nav-link ${isActive('/link-tree') ? 'active' : ''}`}
            >
              <LinkIcon size={20} />
              <span>Link Tree</span>
            </Link>
            <Link
              to="/resources"
              className={`nav-link ${isActive('/resources') ? 'active' : ''}`}
            >
              <Folder size={20} />
              <span>Resources</span>
            </Link>
            <Link
              to="/news"
              className={`nav-link ${isActive('/news') ? 'active' : ''}`}
            >
              <Newspaper size={20} />
              <span>News Monitor</span>
            </Link>
          </div>
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

export default MainLayout;
