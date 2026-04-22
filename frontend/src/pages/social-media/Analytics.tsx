import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import './Analytics.css';

const Analytics: React.FC = () => {
  const { token } = useAuth();
  const { request, loading } = useApi(token);
  const [stats, setStats] = useState<any>(null);
  const [teamId, setTeamId] = useState(localStorage.getItem('teamId') || 'default-team');

  useEffect(() => {
    if (teamId && token) {
      loadAnalytics();
    }
  }, [teamId, token]);

  const loadAnalytics = async () => {
    try {
      const data = await request('GET', `/analytics/${teamId}`);
      setStats(data);
    } catch (err) {
      console.error('Failed to load analytics', err);
    }
  };

  return (
    <div className="analytics">
      <div className="analytics-header">
        <div>
          <h1>Analytics</h1>
          <p className="subtitle">Track engagement across all platforms</p>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading analytics...</div>
      ) : (
        <>
          {/* Platform Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Engagement</div>
              <div className="stat-value accent">1,245</div>
              <div className="stat-change positive">↑ 12% from last month</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Followers</div>
              <div className="stat-value">8,392</div>
              <div className="stat-change positive">↑ 3% from last month</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Average Reach</div>
              <div className="stat-value">2,841</div>
              <div className="stat-change positive">↑ 8% from last month</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Avg. Engagement Rate</div>
              <div className="stat-value">4.2%</div>
              <div className="stat-change positive">↑ 1.2% from last month</div>
            </div>
          </div>

          {/* Platform Breakdown */}
          <div className="card">
            <h2>By Platform</h2>
            <div className="platform-stats">
              {[
                { platform: 'Facebook', engagement: 450, followers: 3200, reach: 1200 },
                { platform: 'Instagram', engagement: 520, followers: 2800, reach: 890 },
                { platform: 'X', engagement: 185, followers: 1500, reach: 420 },
                { platform: 'LinkedIn', engagement: 90, followers: 892, reach: 331 }
              ].map(p => (
                <div key={p.platform} className="platform-row">
                  <div className="platform-name">{p.platform}</div>
                  <div className="platform-metrics">
                    <div className="metric">
                      <span className="metric-label">Engagement</span>
                      <span className="metric-value">{p.engagement}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Followers</span>
                      <span className="metric-value">{p.followers}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Reach</span>
                      <span className="metric-value">{p.reach}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performers */}
          <div className="card">
            <h2>
              <TrendingUp size={20} />
              Top Performing Posts
            </h2>
            <div className="top-posts">
              {[
                { title: 'Spring sports season kicks off!', engagement: 342, platform: 'Facebook' },
                { title: 'New scholarship opportunities', engagement: 288, platform: 'LinkedIn' },
                { title: 'graduation countdown', engagement: 215, platform: 'Instagram' }
              ].map((post, i) => (
                <div key={i} className="top-post">
                  <div className="post-rank">#{i + 1}</div>
                  <div className="post-info">
                    <p className="post-title">{post.title}</p>
                    <span className="post-platform">{post.platform}</span>
                  </div>
                  <div className="post-engagement">{post.engagement} engagements</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
