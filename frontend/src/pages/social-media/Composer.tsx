import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Calendar } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import './Composer.css';

const Composer: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { request, loading, error } = useApi(token);

  const [content, setContent] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('12:00');
  const [platforms, setPlatforms] = useState({
    facebook: false,
    instagram: false,
    twitter: false,
    linkedin: false
  });
  const [teamId, setTeamId] = useState(localStorage.getItem('teamId') || 'default-team');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  }, []);

  const handlePlatformToggle = (platform: keyof typeof platforms) => {
    setPlatforms(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      alert('Please enter some content');
      return;
    }

    if (!Object.values(platforms).some(p => p)) {
      alert('Please select at least one platform');
      return;
    }

    setSubmitting(true);
    try {
      const scheduledFor = new Date(`${selectedDate}T${selectedTime}`);
      const accounts = Object.entries(platforms)
        .filter(([_, selected]) => selected)
        .map(([platform]) => ({ platform, accountId: '' }));

      await request('POST', '/posts', {
        teamId,
        content,
        scheduledFor,
        accounts
      });

      navigate('/social-media');
    } catch (err) {
      console.error('Failed to create post', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="composer">
      <div className="composer-header">
        <h1>Create Post</h1>
        <p className="subtitle">Schedule a new post across platforms</p>
      </div>

      {error && (
        <div className="error-alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="composer-form">
        {/* Content */}
        <div className="form-section">
          <label htmlFor="content" className="form-label">Post Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="form-textarea"
            rows={8}
          />
          <div className="char-count">
            {content.length} characters
          </div>
        </div>

        {/* Platforms */}
        <div className="form-section">
          <label className="form-label">Platforms</label>
          <div className="platforms-grid">
            {(['facebook', 'instagram', 'twitter', 'linkedin'] as const).map(platform => {
              const displayName = platform === 'twitter' ? 'X' : platform.charAt(0).toUpperCase() + platform.slice(1);
              return (
                <label key={platform} className="platform-checkbox">
                  <input
                    type="checkbox"
                    checked={platforms[platform]}
                    onChange={() => handlePlatformToggle(platform)}
                  />
                  <span className="platform-name">{displayName}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Schedule */}
        <div className="form-section">
          <label className="form-label flex-gap">
            <Calendar size={18} />
            Schedule
          </label>
          <div className="schedule-grid">
            <div>
              <label htmlFor="date" className="form-small-label">Date</label>
              <input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="time" className="form-small-label">Time</label>
              <input
                id="time"
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || submitting}
          className="btn-primary btn-large"
        >
          <Send size={20} />
          {submitting ? 'Scheduling...' : 'Schedule Post'}
        </button>
      </form>
    </div>
  );
};

export default Composer;
