import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Image, Calendar } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import Layout from '../components/Layout';

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
    x: false,
    linkedin: false
  });
  const [teamId, setTeamId] = useState(localStorage.getItem('teamId') || '');

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

    try {
      const scheduledFor = new Date(`${selectedDate}T${selectedTime}`);
      const accounts = Object.entries(platforms)
        .filter(([_, selected]) => selected)
        .map(([platform]) => ({ platform, accountId: '' })); // accountId would come from user selection

      await request('POST', '/posts', {
        teamId,
        content,
        scheduledFor,
        accounts
      });

      navigate('/');
    } catch (err) {
      console.error('Failed to create post', err);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Create Post</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-500/30 rounded text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Content */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Post Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 resize-none"
              rows={6}
            />
            <div className="mt-2 text-gray-400 text-sm">
              {content.length} characters
            </div>
          </div>

          {/* Platforms */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <label className="block text-sm font-medium text-gray-300 mb-4">Platforms</label>
            <div className="grid grid-cols-2 gap-4">
              {(['facebook', 'instagram', 'x', 'linkedin'] as const).map(platform => (
                <label key={platform} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={platforms[platform]}
                    onChange={() => handlePlatformToggle(platform)}
                    className="w-4 h-4 bg-gray-800 border border-gray-700 rounded accent-emerald-600"
                  />
                  <span className="text-gray-300 capitalize">{platform}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <Calendar size={16} />
              Schedule
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Time</label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white font-medium py-3 rounded transition flex items-center justify-center gap-2"
          >
            <Send size={20} />
            {loading ? 'Scheduling...' : 'Schedule Post'}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default Composer;
