import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import './Dashboard.css';

interface ResourceLibrary {
  _id: string;
  name: string;
  slug: string;
  description: string;
  department: string;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const { token } = useAuth();
  const { request, loading } = useApi(token);
  const [resources, setResources] = useState<ResourceLibrary[]>([]);
  const [teamId, setTeamId] = useState<string>('');

  useEffect(() => {
    setTeamId(localStorage.getItem('teamId') || 'default-team');
  }, []);

  useEffect(() => {
    if (teamId && token) {
      loadResources();
    }
  }, [teamId, token]);

  const loadResources = async () => {
    try {
      const data = await request('GET', `/resources/${teamId}`);
      setResources(data || []);
    } catch (err) {
      console.error('Failed to load resources', err);
      setResources([]);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this resource library?')) return;
    try {
      await request('DELETE', `/resources/${id}`, {});
      setResources(resources.filter(r => r._id !== id));
    } catch (err) {
      console.error('Failed to delete resource', err);
    }
  };

  return (
    <div className="resources-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Resources</h1>
          <p className="subtitle">Create branded resource libraries for your departments</p>
        </div>
        <Link to="/resources/create" className="btn-primary">
          <Plus size={20} />
          New Resource Library
        </Link>
      </div>

      {loading ? (
        <div className="loading">Loading resources...</div>
      ) : resources.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h2>No resource libraries yet</h2>
          <p>Create your first resource library for a school or department</p>
          <Link to="/resources/create" className="btn-primary">
            Create Library
          </Link>
        </div>
      ) : (
        <div className="resources-grid">
          {resources.map(resource => (
            <div key={resource._id} className="resource-card">
              <div className="card-header">
                <h3>{resource.name}</h3>
                <span className="department-badge">{resource.department}</span>
              </div>
              <p className="card-slug">yoursite.com/r/{resource.slug}</p>
              <p className="card-description">{resource.description}</p>
              <div className="card-actions">
                <a 
                  href={`/r/${resource.slug}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="action-btn view-btn"
                  title="View"
                >
                  <Eye size={16} />
                </a>
                <Link 
                  to={`/resources/edit/${resource._id}`}
                  className="action-btn edit-btn"
                  title="Edit"
                >
                  <Edit2 size={16} />
                </Link>
                <button
                  onClick={() => handleDelete(resource._id)}
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
