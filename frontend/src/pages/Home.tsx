import React from 'react';
import { Link } from 'react-router-dom';
import { Share2, Link as LinkIcon, Zap } from 'lucide-react';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="home">
      <div className="home-header">
        <h1>Welcome to LS Comms</h1>
        <p>Your all-in-one communications hub for Lake Shore Central School District</p>
      </div>

      <div className="tools-grid">
        <Link to="/social-media" className="tool-card">
          <div className="tool-icon">
            <Share2 size={40} />
          </div>
          <h3>Social Media</h3>
          <p>Schedule and manage posts across all platforms</p>
          <span className="tool-badge">Primary</span>
        </Link>

        <Link to="/link-tree" className="tool-card">
          <div className="tool-icon">
            <LinkIcon size={40} />
          </div>
          <h3>Link Tree</h3>
          <p>Create branded landing pages that drive traffic to your resources</p>
          <span className="tool-badge">New</span>
        </Link>

        <div className="tool-card coming-soon">
          <div className="tool-icon">
            <Zap size={40} />
          </div>
          <h3>Newsletter</h3>
          <p>Create and distribute newsletters</p>
          <span className="tool-badge">Coming Soon</span>
        </div>

        <div className="tool-card coming-soon">
          <div className="tool-icon">
            <Zap size={40} />
          </div>
          <h3>Press Releases</h3>
          <p>Publish and manage press releases</p>
          <span className="tool-badge">Coming Soon</span>
        </div>
      </div>
    </div>
  );
};

export default Home;
