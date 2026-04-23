import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Download, ExternalLink } from 'lucide-react';

import './Public.css';

interface ResourceItem {
  title: string;
  url: string;
  type: 'link' | 'file';
}

interface ResourceCategory {
  name: string;
  items: ResourceItem[];
}

interface ResourceData {
  _id: string;
  name: string;
  slug: string;
  description: string;
  department: string;
  categories: ResourceCategory[];
}

const ResourcesPublic: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [resource, setResource] = useState<ResourceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/resources/public/${slug}`);
        setResource(response.data);
      } catch (err) {
        console.error('Failed to load resource', err);
        setError('Resource library not found');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchResource();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="public-view">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="public-view">
        <div className="error-state">
          <h1>Resource Library Not Found</h1>
          <p>This resource library doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="public-view">
      <div className="resources-container">
        {/* Header */}
        <div className="resources-header">
          <h1>{resource.name}</h1>
          <p className="dept-badge">{resource.department}</p>
          {resource.description && <p className="description">{resource.description}</p>}
        </div>

        {/* Categories */}
        <div className="categories-list">
          {resource.categories?.map((category, idx) => (
            <div key={idx} className="category-section">
              <h2>{category.name}</h2>
              <div className="items-grid">
                {category.items.map((item, itemIdx) => (
                  <a
                    key={itemIdx}
                    href={item.url}
                    target={item.type === 'link' ? '_blank' : undefined}
                    rel={item.type === 'link' ? 'noopener noreferrer' : undefined}
                    className="resource-item"
                  >
                    <div className="item-icon">
                      {item.type === 'file' ? <Download size={24} /> : <ExternalLink size={24} />}
                    </div>
                    <span className="item-title">{item.title}</span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResourcesPublic;
