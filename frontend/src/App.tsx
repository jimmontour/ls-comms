import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

import Login from './pages/Login';
import MainLayout from './components/MainLayout';
import Home from './pages/Home';

// Social Media routes
import SocialMediaDashboard from './pages/social-media/Dashboard';
import SocialMediaComposer from './pages/social-media/Composer';
import SocialMediaSettings from './pages/social-media/Settings';
import SocialMediaAnalytics from './pages/social-media/Analytics';

// Link Tree routes
import LinkTreeDashboard from './pages/link-tree/Dashboard';
import LinkTreeEditor from './pages/link-tree/Editor';
import LinkTreeSettings from './pages/link-tree/Settings';
import LinkTreePublic from './pages/link-tree/Public';

// Resources routes
import ResourcesDashboard from './pages/resources/Dashboard';
import ResourcesEditor from './pages/resources/Editor';
import ResourcesPublic from './pages/resources/Public';

// News Monitor routes
import NewsDashboard from './pages/news/Dashboard';
import NewsSettings from './pages/news/Settings';

const App: React.FC = () => {
  const { token } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Public routes (no auth required) */}
        <Route path="/p/:slug" element={<LinkTreePublic />} />
        <Route path="/r/:slug" element={<ResourcesPublic />} />
        
        {!token ? (
          // Login
          <Route path="*" element={<Login />} />
        ) : (
          // Authenticated routes
          <>
            <Route path="/" element={<MainLayout><Home /></MainLayout>} />
            
            {/* Social Media */}
            <Route path="/social-media" element={<MainLayout><SocialMediaDashboard /></MainLayout>} />
            <Route path="/social-media/compose" element={<MainLayout><SocialMediaComposer /></MainLayout>} />
            <Route path="/social-media/analytics" element={<MainLayout><SocialMediaAnalytics /></MainLayout>} />
            <Route path="/social-media/settings" element={<MainLayout><SocialMediaSettings /></MainLayout>} />
            
            {/* Link Tree */}
            <Route path="/link-tree" element={<MainLayout><LinkTreeDashboard /></MainLayout>} />
            <Route path="/link-tree/create" element={<MainLayout><LinkTreeEditor /></MainLayout>} />
            <Route path="/link-tree/edit/:id" element={<MainLayout><LinkTreeEditor /></MainLayout>} />
            <Route path="/link-tree/settings" element={<MainLayout><LinkTreeSettings /></MainLayout>} />
            
            {/* Resources */}
            <Route path="/resources" element={<MainLayout><ResourcesDashboard /></MainLayout>} />
            <Route path="/resources/create" element={<MainLayout><ResourcesEditor /></MainLayout>} />
            <Route path="/resources/edit/:id" element={<MainLayout><ResourcesEditor /></MainLayout>} />
            
            {/* News Monitor */}
            <Route path="/news" element={<MainLayout><NewsDashboard /></MainLayout>} />
            <Route path="/news/settings" element={<MainLayout><NewsSettings /></MainLayout>} />
            
            <Route path="/login" element={<Home />} />
          </>
        )}
      </Routes>
    </Router>
  );
};

export default App;
