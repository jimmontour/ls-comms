import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Settings, Trash2, Share2, Calendar } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import './Dashboard.css';

interface NewsClipping {
  _id: string;
  title: string;
  source: string;
  url: string;
  summary: string;
  publishedAt: string;
  savedAt: string;
  matchedKeywords: string[];
}

const Dashboard: React.FC = () => {
  const { token } = useAuth();
  const { request, loading } = useApi(token);
  const [clippings, setClippings] = useState<NewsClipping[]>([]);
  const [teamId, setTeamId] = useState<string>('');
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    setTeamId(localStorage.getItem('teamId') || 'default-team');
  }, []);

  useEffect(() => {
    if (teamId && token) {
      loadClippings();
    }
  }, [teamId, token]);

  const loadClippings = async () => {
    try {
      const data = await request('GET', `/news/${teamId}`);
      setClippings(data || []);
    } catch (err) {
      console.error('Failed to load clippings', err);
    }
  };

  const handleScan = async () => {
    setScanning(true);
    try {
      const data = await request('POST', '/news/scan', { teamId });
      setClippings(data || []);
    } catch (err) {
      console.error('Failed to scan news', err);
    } finally {
      setScanning(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await request('DELETE', `/news/${id}`, {});
      setClippings(clippings.filter(c => c._id !== id));
    } catch (err) {
      console.error('Failed to delete clipping', err);
    }
  };

  return (
    <div className="news-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>News Monitor</h1>
          <p className="subtitle">Find Lake Shore mentions in the news</p>
        </div>
        <div className="header-actions">
          <Link to="/news/settings" className="btn-secondary">
            <Settings size={20} />
            Settings
          </Link>
          <button
            onClick={handleScan}
            disabled={scanning || loading}
            className="btn-primary"
          >
            <Search size={20} />
            {scanning ? 'Scanning...' : 'Scan News'}
          </button>
        </div>
      </div>

      {clippings.length === 0 ? (
        <div className="empty-state">
          <Newspaper size={48} />
          <h2>No news found yet</h2>
          <p>Click "Scan News" to search for mentions of your keywords</p>
        </div>
      ) : (
        <div className="clippings-list">
          {clippings.map(clip => (
            <div key={clip._id} className="clipping-card">
              <div className="clipping-header">
                <div>
                  <h3>{clip.title}</h3>
                  <p className="source">{clip.source}</p>
                </div>
                <div className="clipping-date">
                  <Calendar size={16} />
                  <span>{new Date(clip.publishedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <p className="summary">{clip.summary}</p>

              <div className="clipping-footer">
                <div className="keywords">
                  {clip.matchedKeywords.map(kw => (
                    <span key={kw} className="keyword-badge">{kw}</span>
                  ))}
                </div>
                <div className="clipping-actions">
                  <a
                    href={clip.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-link"
                  >
                    Read Full Article →
                  </a>
                  <button
                    onClick={() => handleDelete(clip._id)}
                    className="delete-btn"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Newspaper = ({ size }: { size: number }) => (
  <div style={{ fontSize: `${size}px` }}>📰</div>
);

export default Dashboard;
