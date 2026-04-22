import React, { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import Layout from '../components/Layout';

interface TeamAnalytics {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  byPlatform: any;
}

const Analytics: React.FC = () => {
  const { token } = useAuth();
  const { request, loading } = useApi(token);
  const [analytics, setAnalytics] = useState<TeamAnalytics | null>(null);
  const [teamId, setTeamId] = useState(localStorage.getItem('teamId') || '');

  useEffect(() => {
    if (teamId && token) {
      loadAnalytics();
    }
  }, [teamId, token]);

  const loadAnalytics = async () => {
    try {
      const data = await request('GET', `/analytics/team/${teamId}`);
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics', err);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <BarChart3 size={32} className="text-emerald-400" />
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
        </div>

        {loading ? (
          <div className="text-gray-400">Loading analytics...</div>
        ) : analytics ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="text-gray-400 text-sm font-medium mb-2">Total Posts</div>
              <div className="text-3xl font-bold text-white">{analytics.totalPosts}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="text-gray-400 text-sm font-medium mb-2">Total Likes</div>
              <div className="text-3xl font-bold text-emerald-400">{analytics.totalLikes}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="text-gray-400 text-sm font-medium mb-2">Total Comments</div>
              <div className="text-3xl font-bold text-emerald-400">{analytics.totalComments}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="text-gray-400 text-sm font-medium mb-2">Total Shares</div>
              <div className="text-3xl font-bold text-emerald-400">{analytics.totalShares}</div>
            </div>
          </div>
        ) : (
          <div className="text-gray-400">No analytics available yet.</div>
        )}
      </div>
    </Layout>
  );
};

export default Analytics;
