import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, BarChart3, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-64 bg-gray-900 border-r border-gray-800 p-6 flex flex-col">
        <h1 className="text-2xl font-bold text-white mb-8">SocialHub</h1>
        
        <nav className="space-y-2 flex-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-2 rounded text-gray-300 hover:bg-gray-800 hover:text-white transition"
          >
            <Calendar size={20} />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/analytics"
            className="flex items-center gap-3 px-4 py-2 rounded text-gray-300 hover:bg-gray-800 hover:text-white transition"
          >
            <BarChart3 size={20} />
            <span>Analytics</span>
          </Link>
          <Link
            to="/settings"
            className="flex items-center gap-3 px-4 py-2 rounded text-gray-300 hover:bg-gray-800 hover:text-white transition"
          >
            <Settings size={20} />
            <span>Settings</span>
          </Link>
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 rounded text-gray-300 hover:bg-red-900/30 hover:text-red-300 transition w-full"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {children}
      </div>
    </div>
  );
};

export default Layout;
