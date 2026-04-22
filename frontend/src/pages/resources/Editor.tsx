import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Plus, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import './Editor.css';

interface ResourceItem {
  id: string;
  title: string;
  url: string;
  type: 'link' | 'file';
}

interface ResourceCategory {
  id: string;
  name: string;
  items: ResourceItem[];
}

const Editor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { request, loading } = useApi(token);
  const [teamId, setTeamId] = useState(localStorage.getItem('teamId') || 'default-team');

  const departments = [
    'District',
    'High School',
    'Middle School',
    'Elementary Schools',
    'Athletics',
    'Communications',
    'Technology'
  ];

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    department: 'District'
  });

  const [categories, setCategories] = useState<ResourceCategory[]>([
    { id: '1', name: 'Letterhead & Templates', items: [] },
    { id: '2', name: 'Logos & Branding', items: [] },
    { id: '3', name: 'Guidelines', items: [] },
    { id: '4', name: 'Forms', items: [] }
  ]);

  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    setTeamId(localStorage.getItem('teamId') || 'default-team');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.slug.trim()) {
      alert('Please fill in name and slug');
      return;
    }

    try {
      const payload = {
        teamId,
        ...formData,
        categories
      };

      if (id) {
        await request('PUT', `/resources/${id}`, payload);
      } else {
        await request('POST', '/resources', payload);
      }

      navigate('/resources');
    } catch (err) {
      console.error('Failed to save resource', err);
    }
  };

  const addItem = (categoryId: string) => {
    setCategories(categories.map(cat =>
      cat.id === categoryId
        ? { ...cat, items: [...cat.items, { id: Date.now().toString(), title: '', url: '', type: 'link' as const }] }
        : cat
    ));
  };

  const removeItem = (categoryId: string, itemId: string) => {
    setCategories(categories.map(cat =>
      cat.id === categoryId
        ? { ...cat, items: cat.items.filter(item => item.id !== itemId) }
        : cat
    ));
  };

  const updateItem = (categoryId: string, itemId: string, field: string, value: string) => {
    setCategories(categories.map(cat =>
      cat.id === categoryId
        ? {
          ...cat,
          items: cat.items.map(item =>
            item.id === itemId ? { ...item, [field]: value } : item
          )
        }
        : cat
    ));
  };

  return (
    <div className="editor">
      <div className="editor-header">
        <h1>{id ? 'Edit Resource Library' : 'Create Resource Library'}</h1>
        <p className="subtitle">Build a branded asset library for your department</p>
      </div>

      <div className="editor-container">
        {/* Left: Form */}
        <form onSubmit={handleSubmit} className="editor-form">
          {/* Basic Info */}
          <div className="form-section">
            <h2>Basic Info</h2>

            <div className="form-group">
              <label>Library Name</label>
              <input
                type="text"
                placeholder="e.g., High School Communications"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Slug</label>
              <div className="slug-input">
                <span>yoursite.com/r/</span>
                <input
                  type="text"
                  placeholder="high-school"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                placeholder="What resources are available in this library?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          {/* Categories */}
          <div className="form-section">
            <h2>Categories & Resources</h2>
            <div className="categories-accordion">
              {categories.map(category => (
                <div key={category.id} className="accordion-item">
                  <div
                    className="accordion-header"
                    onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                  >
                    <div className="header-info">
                      <span className="category-name">{category.name}</span>
                      <span className="item-count">{category.items.length} items</span>
                    </div>
                    <span className={`arrow ${expandedCategory === category.id ? 'open' : ''}`}>▼</span>
                  </div>

                  {expandedCategory === category.id && (
                    <div className="accordion-content">
                      <div className="items-list">
                        {category.items.map((item, idx) => (
                          <div key={item.id} className="item-row">
                            <input
                              type="text"
                              placeholder="Resource title"
                              value={item.title}
                              onChange={(e) => updateItem(category.id, item.id, 'title', e.target.value)}
                            />
                            <input
                              type="url"
                              placeholder="https://... or /file.pdf"
                              value={item.url}
                              onChange={(e) => updateItem(category.id, item.id, 'url', e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={() => removeItem(category.id, item.id)}
                              className="remove-btn"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => addItem(category.id)}
                        className="add-btn"
                      >
                        <Plus size={16} /> Add Resource
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} className="btn-primary btn-large">
            <Save size={20} />
            {loading ? 'Saving...' : 'Save Library'}
          </button>
        </form>

        {/* Right: Preview */}
        <div className="editor-preview">
          <div className="preview-card">
            <div className="preview-header">
              <h2>{formData.name || 'Library Name'}</h2>
              <p className="preview-dept">{formData.department}</p>
              <p className="preview-desc">{formData.description || 'Description will appear here'}</p>
            </div>

            <div className="preview-categories">
              {categories
                .filter(cat => cat.items.length > 0)
                .map(category => (
                  <div key={category.id} className="preview-category">
                    <h3>{category.name}</h3>
                    <div className="preview-items">
                      {category.items.map(item => (
                        <div key={item.id} className="preview-item">
                          {item.title || 'Resource'}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              {categories.every(cat => cat.items.length === 0) && (
                <div className="preview-empty">Add resources to see preview</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
