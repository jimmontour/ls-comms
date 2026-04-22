import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, BarChart3, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import Layout from '../components/Layout';

interface ScheduledPost {
  _id: string;
  content: string;
  scheduledFor: string;
  status: 'draft' | 'scheduled' | 'published';
  accounts: any[];
}

const Dashboard: React.FC = () => {
  const { token, logout } = useAuth();
  const { request, loading } = useApi(token);
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [teamId, setTeamId] = useState<string>('');

  useEffect(() => {
    // In a real app, fetch the user's teams and default to first one
    setTeamId(localStorage.getItem('teamId') || '');
  }, []);

  useEffect(() => {
    if (teamId && token) {
      loadPosts();
    }
  }, [teamId, token]);

  const loadPosts = async () => {
    try {
      const data = await request('GET', `/posts/${teamId}`);
      setPosts(data);
    } catch (err) {
      console.error('Failed to load posts', err);
    }
  };

  const upcomingPosts = posts.filter(p => p.status === 'scheduled')
    .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime());

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 mt-1">Manage your scheduled posts</p>
          </div>
          <Link
            to="/compose"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded font-medium transition"
          >
            <Plus size={20} /> New Post
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="text-gray-400 text-sm font-medium mb-2">Total Posts</div>
            <div className="text-3xl font-bold text-white">{posts.length}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="text-gray-400 text-sm font-medium mb-2">Scheduled</div>
            <div className="text-3xl font-bold text-emerald-400">{upcomingPosts.length}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="text-gray-400 text-sm font-medium mb-2">Published</div>
            <div className="text-3xl font-bold text-white">
              {posts.filter(p => p.status === 'published').length}
            </div>
          </div>
        </div>

        {/* Upcoming Posts */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Upcoming Posts</h2>
          
          {loading ? (
            <div className="text-gray-400">Loading posts...</div>
          ) : upcomingPosts.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              <Calendar size={32} className="mx-auto mb-2 opacity-50" />
              <p>No upcoming posts. Create one to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingPosts.map(post => (
                <div key={post._id} className="border border-gray-700 rounded p-4 hover:border-emerald-500/30 transition">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-white line-clamp-2">{post.content}</p>
                    <span className="px-2 py-1 bg-emerald-900/30 text-emerald-300 text-xs rounded whitespace-nowrap">
                      {post.status}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    {new Date(post.scheduledFor).toLocaleString()}
                  </p>
                  <div className="mt-2 flex gap-2">
                    {post.accounts.map((acc, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded">
                        {acc.platform}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
