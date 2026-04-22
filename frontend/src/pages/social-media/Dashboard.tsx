import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, Trash2, Send, Edit2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import './Dashboard.css';

interface ScheduledPost {
  _id: string;
  content: string;
  scheduledFor: string;
  status: 'draft' | 'scheduled' | 'published';
  accounts: any[];
}

const Dashboard: React.FC = () => {
  const { token } = useAuth();
  const { request, loading } = useApi(token);
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [teamId, setTeamId] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    setTeamId(localStorage.getItem('teamId') || 'default-team');
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

  const handlePublishNow = async (postId: string) => {
    try {
      await request('POST', `/posts/${postId}/publish`, {});
      setPosts(posts.map(p => p._id === postId ? { ...p, status: 'published' } : p));
    } catch (err) {
      console.error('Failed to publish post', err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await request('DELETE', `/posts/${postId}`, {});
      setPosts(posts.filter(p => p._id !== postId));
    } catch (err) {
      console.error('Failed to delete post', err);
    }
  };

  const upcomingPosts = posts.filter(p => p.status === 'scheduled')
    .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime());

  // Calendar logic
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  const getPostsForDay = (day: number) => {
    const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      .toISOString().split('T')[0];
    return posts.filter(p => p.scheduledFor.startsWith(dateStr));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Social Media</h1>
          <p className="subtitle">Schedule posts across all platforms</p>
        </div>
        <Link to="/social-media/compose" className="btn-primary">
          <Plus size={20} />
          New Post
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Posts</div>
          <div className="stat-value">{posts.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Scheduled</div>
          <div className="stat-value accent">{upcomingPosts.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Published</div>
          <div className="stat-value">{posts.filter(p => p.status === 'published').length}</div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="view-toggle">
        <button
          className={`toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
          onClick={() => setViewMode('calendar')}
        >
          <Calendar size={18} />
          Calendar
        </button>
        <button
          className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => setViewMode('list')}
        >
          List View
        </button>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="card calendar-card">
          <div className="calendar-header">
            <button onClick={prevMonth} className="nav-btn">&lt;</button>
            <h2>{monthName}</h2>
            <button onClick={nextMonth} className="nav-btn">&gt;</button>
          </div>

          <div className="calendar-weekdays">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="weekday">{day}</div>
            ))}
          </div>

          <div className="calendar-grid">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="calendar-day empty"></div>
            ))}
            {daysArray.map(day => {
              const dayPosts = getPostsForDay(day);
              return (
                <div key={day} className="calendar-day">
                  <div className="day-number">{day}</div>
                  <div className="day-posts">
                    {dayPosts.slice(0, 2).map(post => (
                      <div key={post._id} className="day-post-dot" title={post.content.substring(0, 30)}></div>
                    ))}
                    {dayPosts.length > 2 && <span className="more-posts">+{dayPosts.length - 2}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="card">
          <h2>Upcoming Posts</h2>
          
          {loading ? (
            <div className="loading">Loading posts...</div>
          ) : upcomingPosts.length === 0 ? (
            <div className="empty-state">
              <Calendar size={48} />
              <p>No upcoming posts</p>
              <p className="text-muted">Create one to get started!</p>
              <Link to="/social-media/compose" className="btn-primary">
                Create Post
              </Link>
            </div>
          ) : (
            <div className="posts-list">
              {upcomingPosts.map(post => (
                <div key={post._id} className="post-item">
                  <div className="post-content">
                    <p className="post-text">{post.content}</p>
                    <p className="post-time">
                      {new Date(post.scheduledFor).toLocaleString()}
                    </p>
                  </div>
                  <div className="post-meta">
                    <span className="status-badge">{post.status}</span>
                    <div className="platforms">
                      {post.accounts.map((acc, i) => (
                        <span key={i} className="platform-tag">
                          {acc.platform}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="post-actions">
                    <button
                      onClick={() => handlePublishNow(post._id)}
                      className="action-btn publish-btn"
                      title="Publish now"
                    >
                      <Send size={16} />
                    </button>
                    <button className="action-btn" title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeletePost(post._id)}
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
      )}
    </div>
  );
};

export default Dashboard;
