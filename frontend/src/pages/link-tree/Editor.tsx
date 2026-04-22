import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Plus, Trash2, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import './Editor.css';

interface SocialLink {
  platform: string;
  url: string;
}

interface QuickLink {
  title: string;
  url: string;
}

interface LinkTreeSection {
  id: string;
  title: string;
  type: 'socials' | 'links' | 'news' | 'newsletter' | 'custom';
  enabled: boolean;
  order: number;
  data?: {
    socials?: SocialLink[];
    links?: QuickLink[];
    newsletterEmail?: string;
  };
}

const Editor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { request, loading } = useApi(token);
  const [teamId, setTeamId] = useState(localStorage.getItem('teamId') || 'default-team');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    brandColor: '#34d399',
  });

  const [sections, setSections] = useState<LinkTreeSection[]>([
    { id: '1', title: 'Follow Us', type: 'socials', enabled: true, order: 1, data: { socials: [] } },
    { id: '2', title: 'Quick Links', type: 'links', enabled: true, order: 2, data: { links: [] } },
    { id: '3', title: 'In the News', type: 'news', enabled: false, order: 3, data: { links: [] } },
    { id: '4', title: 'Newsletter', type: 'newsletter', enabled: false, order: 4, data: { newsletterEmail: '' } },
  ]);

  const [expandedSection, setExpandedSection] = useState<string | null>(null);

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
        sections,
      };

      if (id) {
        await request('PUT', `/link-trees/${id}`, payload);
      } else {
        await request('POST', '/link-trees', payload);
      }

      navigate('/link-tree');
    } catch (err) {
      console.error('Failed to save link tree', err);
    }
  };

  const toggleSection = (id: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const updateSectionData = (id: string, newData: any) => {
    setSections(sections.map(s => 
      s.id === id ? { ...s, data: { ...s.data, ...newData } } : s
    ));
  };

  const addSocialLink = (sectionId: string) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        const socials = s.data?.socials || [];
        return {
          ...s,
          data: { ...s.data, socials: [...socials, { platform: 'facebook', url: '' }] }
        };
      }
      return s;
    }));
  };

  const removeSocialLink = (sectionId: string, index: number) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        const socials = s.data?.socials || [];
        return {
          ...s,
          data: { ...s.data, socials: socials.filter((_, i) => i !== index) }
        };
      }
      return s;
    }));
  };

  const updateSocialLink = (sectionId: string, index: number, field: string, value: string) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        const socials = s.data?.socials || [];
        socials[index] = { ...socials[index], [field]: value };
        return {
          ...s,
          data: { ...s.data, socials }
        };
      }
      return s;
    }));
  };

  const addQuickLink = (sectionId: string) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        const links = s.data?.links || [];
        return {
          ...s,
          data: { ...s.data, links: [...links, { title: '', url: '' }] }
        };
      }
      return s;
    }));
  };

  const removeQuickLink = (sectionId: string, index: number) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        const links = s.data?.links || [];
        return {
          ...s,
          data: { ...s.data, links: links.filter((_, i) => i !== index) }
        };
      }
      return s;
    }));
  };

  const updateQuickLink = (sectionId: string, index: number, field: string, value: string) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        const links = s.data?.links || [];
        links[index] = { ...links[index], [field]: value };
        return {
          ...s,
          data: { ...s.data, links }
        };
      }
      return s;
    }));
  };

  return (
    <div className="editor">
      <div className="editor-header">
        <h1>{id ? 'Edit Link Tree' : 'Create Link Tree'}</h1>
        <p className="subtitle">Design your branded landing page</p>
      </div>

      <div className="editor-container">
        {/* Left: Form */}
        <form onSubmit={handleSubmit} className="editor-form">
          {/* Basic Info */}
          <div className="form-section">
            <h2>Basic Info</h2>

            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                placeholder="e.g., District Home"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Slug</label>
              <div className="slug-input">
                <span>yoursite.com/p/</span>
                <input
                  type="text"
                  placeholder="district"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                placeholder="Brief description of this link tree"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Brand Color</label>
              <div className="color-picker">
                <input
                  type="color"
                  value={formData.brandColor}
                  onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                />
                <span>{formData.brandColor}</span>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="form-section">
            <h2>Sections</h2>
            <div className="sections-accordion">
              {sections.map(section => (
                <div key={section.id} className="accordion-item">
                  <div
                    className="accordion-header"
                    onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                  >
                    <input
                      type="checkbox"
                      checked={section.enabled}
                      onChange={() => toggleSection(section.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="header-info">
                      <span className="section-title">{section.title}</span>
                      <span className="section-type">{section.type}</span>
                    </div>
                    <span className={`arrow ${expandedSection === section.id ? 'open' : ''}`}>▼</span>
                  </div>

                  {expandedSection === section.id && section.enabled && (
                    <div className="accordion-content">
                      {section.type === 'socials' && (
                        <div className="section-config">
                          <h4>Social Media Links</h4>
                          {section.data?.socials?.map((social, idx) => (
                            <div key={idx} className="config-row">
                              <select
                                value={social.platform}
                                onChange={(e) => updateSocialLink(section.id, idx, 'platform', e.target.value)}
                              >
                                <option value="facebook">Facebook</option>
                                <option value="instagram">Instagram</option>
                                <option value="twitter">X / Twitter</option>
                                <option value="linkedin">LinkedIn</option>
                              </select>
                              <input
                                type="url"
                                placeholder="https://..."
                                value={social.url}
                                onChange={(e) => updateSocialLink(section.id, idx, 'url', e.target.value)}
                              />
                              <button
                                type="button"
                                onClick={() => removeSocialLink(section.id, idx)}
                                className="remove-btn"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addSocialLink(section.id)}
                            className="add-btn"
                          >
                            <Plus size={16} /> Add Social Link
                          </button>
                        </div>
                      )}

                      {section.type === 'links' && (
                        <div className="section-config">
                          <h4>Quick Links</h4>
                          {section.data?.links?.map((link, idx) => (
                            <div key={idx} className="config-row">
                              <input
                                type="text"
                                placeholder="Link title"
                                value={link.title}
                                onChange={(e) => updateQuickLink(section.id, idx, 'title', e.target.value)}
                              />
                              <input
                                type="url"
                                placeholder="https://..."
                                value={link.url}
                                onChange={(e) => updateQuickLink(section.id, idx, 'url', e.target.value)}
                              />
                              <button
                                type="button"
                                onClick={() => removeQuickLink(section.id, idx)}
                                className="remove-btn"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addQuickLink(section.id)}
                            className="add-btn"
                          >
                            <Plus size={16} /> Add Link
                          </button>
                        </div>
                      )}

                      {section.type === 'news' && (
                        <div className="section-config">
                          <h4>News Articles</h4>
                          {section.data?.links?.map((link, idx) => (
                            <div key={idx} className="config-row">
                              <input
                                type="text"
                                placeholder="Article title"
                                value={link.title}
                                onChange={(e) => updateQuickLink(section.id, idx, 'title', e.target.value)}
                              />
                              <input
                                type="url"
                                placeholder="https://..."
                                value={link.url}
                                onChange={(e) => updateQuickLink(section.id, idx, 'url', e.target.value)}
                              />
                              <button
                                type="button"
                                onClick={() => removeQuickLink(section.id, idx)}
                                className="remove-btn"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addQuickLink(section.id)}
                            className="add-btn"
                          >
                            <Plus size={16} /> Add Article
                          </button>
                        </div>
                      )}

                      {section.type === 'newsletter' && (
                        <div className="section-config">
                          <h4>Newsletter Settings</h4>
                          <div className="form-group">
                            <label>Submission Email</label>
                            <input
                              type="email"
                              placeholder="newsletter@example.com"
                              value={section.data?.newsletterEmail || ''}
                              onChange={(e) => updateSectionData(section.id, { newsletterEmail: e.target.value })}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} className="btn-primary btn-large">
            <Save size={20} />
            {loading ? 'Saving...' : 'Save Link Tree'}
          </button>
        </form>

        {/* Right: Preview */}
        <div className="editor-preview">
          <div className="preview-card" style={{ borderTopColor: formData.brandColor }}>
            <div className="preview-header">
              <h2>{formData.name || 'Link Tree Name'}</h2>
              <p>{formData.description || 'Your description will appear here'}</p>
            </div>

            <div className="preview-sections">
              {sections.filter(s => s.enabled).map(section => (
                <div key={section.id} className="preview-section">
                  <h3>{section.title}</h3>
                  <div className="preview-content">
                    {section.type === 'socials' && (
                      section.data?.socials && section.data.socials.length > 0 ? (
                        <div className="preview-socials">
                          {section.data.socials.map((s, i) => (
                            <span key={i} className="preview-badge">{s.platform}</span>
                          ))}
                        </div>
                      ) : (
                        <div className="preview-placeholder">🔗 Add social links</div>
                      )
                    )}
                    {section.type === 'links' && !section.data?.links?.length && (
                      <div className="preview-placeholder">🔗 Add quick links</div>
                    )}
                    {section.type === 'links' && section.data?.links && section.data.links.length > 0 && (
                      <div className="preview-links">
                        {section.data.links.map((l, i) => (
                          <div key={i} className="preview-link">{l.title || 'Link'}</div>
                        ))}
                      </div>
                    )}
                    {section.type === 'news' && section.data?.links && section.data.links.length > 0 && (
                      <div className="preview-links">
                        {section.data.links.map((l, i) => (
                          <div key={i} className="preview-link">{l.title || 'Article'}</div>
                        ))}
                      </div>
                    )}
                    {section.type === 'newsletter' && (
                      <div className="preview-placeholder">📧 Newsletter Signup</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
