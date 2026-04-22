import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Plus, X, Save } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import './Settings.css';

interface SearchKeyword {
  id: string;
  keyword: string;
}

const Settings: React.FC = () => {
  const { token } = useAuth();
  const { request, loading } = useApi(token);
  const [teamId, setTeamId] = useState(localStorage.getItem('teamId') || 'default-team');
  const [keywords, setKeywords] = useState<SearchKeyword[]>([
    { id: '1', keyword: 'Lake Shore' },
    { id: '2', keyword: 'Angola' },
  ]);
  const [newKeyword, setNewKeyword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTeamId(localStorage.getItem('teamId') || 'default-team');
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await request('GET', `/news/settings/${teamId}`);
      if (data?.keywords) {
        setKeywords(data.keywords);
      }
    } catch (err) {
      console.error('Failed to load settings', err);
    }
  };

  const addKeyword = () => {
    if (!newKeyword.trim()) return;
    setKeywords([
      ...keywords,
      { id: Date.now().toString(), keyword: newKeyword }
    ]);
    setNewKeyword('');
  };

  const removeKeyword = (id: string) => {
    setKeywords(keywords.filter(k => k.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await request('POST', `/news/settings/${teamId}`, { keywords });
      alert('Settings saved!');
    } catch (err) {
      console.error('Failed to save settings', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="news-settings">
      <div className="settings-header">
        <SettingsIcon size={32} />
        <h1>News Monitor Settings</h1>
      </div>

      <div className="settings-card">
        <h2>Search Keywords</h2>
        <p className="description">
          Scan the news for mentions of these terms. Add your school names, locations, and relevant keywords.
        </p>

        <div className="keywords-list">
          {keywords.map(kw => (
            <div key={kw.id} className="keyword-item">
              <span>{kw.keyword}</span>
              <button
                onClick={() => removeKeyword(kw.id)}
                className="remove-btn"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="add-keyword">
          <input
            type="text"
            placeholder="Add new keyword"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
          />
          <button onClick={addKeyword} className="add-btn">
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      <div className="settings-card">
        <h2>Data Sources</h2>
        <p className="description">
          Currently scanning: Google News, RSS feeds
        </p>
        <div className="sources-list">
          <div className="source-item">
            <span>📰 Google News</span>
            <span className="badge">Active</span>
          </div>
          <div className="source-item">
            <span>🔗 RSS Feeds</span>
            <span className="badge">Active</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={loading || saving}
        className="btn-primary btn-large"
      >
        <Save size={20} />
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
};

export default Settings;
