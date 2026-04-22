import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import './Dashboard.css';

interface LinkTree {
  _id: string;
  name: string;
  slug: string;
  description: string;
  brandColor: string;
  createdAt: string;
  updatedAt: string;
}

const Dashboard: React.FC = () => {
  const { token } = useAuth();
  const { request, loading } = useApi(token);
  const [linkTrees, setLinkTrees] = useState<LinkTree[]>([]);
  const [teamId, setTeamId] = useState<string>('');

  useEffect(() => {
    setTeamId(localStorage.getItem('teamId') || 'default-team');
  }, []);

  useEffect(() => {
    if (teamId && token) {
      loadLinkTrees();
    }
  }, [teamId, token]);

  const loadLinkTrees = async () => {
    try {
      const data = await request('GET', `/link-trees/${teamId}`);
      setLinkTrees(data || []);
    } catch (err) {
      console.error('Failed to load link trees', err);
      setLinkTrees([]);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this link tree?')) return;
    try {
      await request('DELETE', `/link-trees/${id}`, {});
      setLinkTrees(linkTrees.filter(lt => lt._id !== id));
    } catch (err) {
      console.error('Failed to delete link tree', err);
    }
  };

  return (
    <div className="link-tree-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Link Tree</h1>
          <p className="subtitle">Create branded landing pages for your resources</p>
        </div>
        <Link to="/link-tree/create" className="btn-primary">
          <Plus size={20} />
          New Link Tree
        </Link>
      </div>

      {loading ? (
        <div className="loading">Loading link trees...</div>
      ) : linkTrees.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🌳</div>
          <h2>No link trees yet</h2>
          <p>Create your first branded landing page</p>
          <Link to="/link-tree/create" className="btn-primary">
            Create Link Tree
          </Link>
        </div>
      ) : (
        <div className="link-trees-grid">
          {linkTrees.map(lt => (
            <div key={lt._id} className="link-tree-card">
              <div className="card-preview" style={{ borderTopColor: lt.brandColor }}></div>
              <div className="card-content">
                <h3>{lt.name}</h3>
                <p className="card-slug">yoursite.com/p/{lt.slug}</p>
                <p className="card-description">{lt.description}</p>
              </div>
              <div className="card-actions">
                <a 
                  href={`/p/${lt.slug}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="action-btn view-btn"
                  title="View"
                >
                  <Eye size={16} />
                </a>
                <Link 
                  to={`/link-tree/edit/${lt._id}`}
                  className="action-btn edit-btn"
                  title="Edit"
                >
                  <Edit2 size={16} />
                </Link>
                <button
                  onClick={() => handleDelete(lt._id)}
                  className="action-btn delete-btn"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
