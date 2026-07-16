import React from 'react';
import { 
  Calendar, 
  CheckCircle, 
  Users, 
  ArrowUpRight, 
  Plus, 
  Link, 
  TrendingUp 
} from 'lucide-react';
import { Twitter, Linkedin, Instagram, Facebook } from './SocialIcons';

export default function DashboardOverview({ posts, channels, setActiveTab }) {
  // Compute some dashboard statistics
  const totalScheduled = posts.filter(p => p.status === 'scheduled').length;
  const totalPublished = posts.filter(p => p.status === 'published').length;
  const activeChannels = channels.filter(c => c.connected).length;
  
  // Calculate dynamic reach based on connected channels
  const getDefaultFollowers = (type) => {
    switch (type) {
      case 'twitter': return 12400;
      case 'linkedin': return 8200;
      case 'instagram': return 4200;
      case 'facebook': return 5800;
      default: return 0;
    }
  };

  const totalReach = channels
    .filter(c => c.connected)
    .reduce((sum, c) => {
      const count = (c.followers !== undefined && c.followers !== null && c.followers > 0)
        ? c.followers
        : getDefaultFollowers(c.type);
      return sum + count;
    }, 0);

  const formatReach = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
  };

  // Quick channels lookup
  const getChannelIcon = (type) => {
    switch (type) {
      case 'twitter': return <Twitter size={16} className="text-secondary" />;
      case 'linkedin': return <Linkedin size={16} className="text-secondary" />;
      case 'instagram': return <Instagram size={16} className="text-secondary" />;
      case 'facebook': return <Facebook size={16} className="text-secondary" />;
      default: return <Link size={16} />;
    }
  };

  return (
    <div className="content-container-tight">
      {/* Header bar within tab */}
      <div className="flex align-center justify-between">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back. Here is an overview of your social networks.</p>
        </div>
        <button 
          onClick={() => setActiveTab('scheduler')}
          className="btn btn-primary"
        >
          <Plus size={16} />
          Create Post
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid-cols-4">
        <div className="stat-card">
          <div className="flex align-center justify-between">
            <span className="stat-label">Scheduled Posts</span>
            <Calendar size={16} className="text-muted" />
          </div>
          <span className="stat-value">{totalScheduled}</span>
          <span className="stat-trend up">
            <TrendingUp size={12} />
            Ready in queue
          </span>
        </div>

        <div className="stat-card">
          <div className="flex align-center justify-between">
            <span className="stat-label">Published Posts</span>
            <CheckCircle size={16} className="text-muted" />
          </div>
          <span className="stat-value">{totalPublished}</span>
          <span className="stat-trend up">
            <TrendingUp size={12} />
            +8 this week
          </span>
        </div>

        <div className="stat-card">
          <div className="flex align-center justify-between">
            <span className="stat-label">Active Channels</span>
            <Link size={16} className="text-muted" />
          </div>
          <span className="stat-value">{activeChannels} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/ {channels.length}</span></span>
          <span className="stat-trend" style={{ color: 'var(--text-secondary)' }}>
            Connected networks
          </span>
        </div>

        <div className="stat-card">
          <div className="flex align-center justify-between">
            <span className="stat-label">Total Reach</span>
            <Users size={16} className="text-muted" />
          </div>
          <span className="stat-value">{formatReach(totalReach)}</span>
          <span className="stat-trend up">
            <ArrowUpRight size={12} />
            +14.2% vs last month
          </span>
        </div>
      </div>

      {/* Charts & Bottom Sections */}
      <div className="grid-cols-3" style={{ gridTemplateColumns: '2fr 1fr' }}>
        {/* Weekly reach area chart */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-title">Audience Impressions</span>
              <p className="panel-description">Weekly summary of views and impressions across networks</p>
            </div>
            <div className="badge badge-success">
              Live
            </div>
          </div>
          
          <div className="panel-body flex flex-col align-center justify-center" style={{ minHeight: '260px', position: 'relative' }}>
            {/* Custom SVG Line Area Chart with Gradient */}
            <svg viewBox="0 0 500 200" width="100%" height="220" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary-green)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="var(--primary-green)" stopOpacity="0.00" />
                </linearGradient>
              </defs>
              
              {/* Horizontal Grid lines */}
              <line x1="0" y1="40" x2="500" y2="40" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="90" x2="500" y2="90" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="190" x2="500" y2="190" stroke="var(--border-color)" strokeWidth="1" />
              
              {/* Chart Line Path */}
              <path 
                d="M 0 160 Q 60 140 100 110 T 200 120 T 300 60 T 400 80 T 500 30" 
                fill="none" 
                stroke="var(--primary-green)" 
                strokeWidth="2.5" 
                strokeLinecap="round"
              />
              
              {/* Area path for Gradient Fill */}
              <path 
                d="M 0 160 Q 60 140 100 110 T 200 120 T 300 60 T 400 80 T 500 30 L 500 190 L 0 190 Z" 
                fill="url(#chartGrad)"
              />
              
              {/* Data points */}
              <circle cx="100" cy="110" r="4" fill="var(--bg-panel)" stroke="var(--primary-green)" strokeWidth="2" />
              <circle cx="300" cy="60" r="4" fill="var(--bg-panel)" stroke="var(--primary-green)" strokeWidth="2" />
              <circle cx="500" cy="30" r="4" fill="var(--bg-panel)" stroke="var(--primary-green)" strokeWidth="2" />

              {/* Chart Labels */}
              <text x="0" y="198" fill="var(--text-secondary)" fontSize="10">Mon</text>
              <text x="100" y="198" fill="var(--text-secondary)" fontSize="10">Tue</text>
              <text x="200" y="198" fill="var(--text-secondary)" fontSize="10">Wed</text>
              <text x="300" y="198" fill="var(--text-secondary)" fontSize="10">Thu</text>
              <text x="400" y="198" fill="var(--text-secondary)" fontSize="10">Fri</text>
              <text x="490" y="198" fill="var(--text-secondary)" fontSize="10">Sat</text>
            </svg>
          </div>
        </div>

        {/* Channels Quick-Check Card */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-title">Channels</span>
              <p className="panel-description">Quick status check</p>
            </div>
            <button 
              onClick={() => setActiveTab('channels')}
              className="btn btn-secondary btn-icon"
              style={{ width: '24px', height: '24px', borderRadius: '4px' }}
            >
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="panel-body flex flex-col gap-12" style={{ padding: '12px 16px' }}>
            {channels.map((ch) => (
              <div 
                key={ch.id} 
                className="flex align-center justify-between"
                style={{ 
                  padding: '8px 0', 
                  borderBottom: '1px solid var(--border-color)',
                  opacity: ch.connected ? 1 : 0.6
                }}
              >
                <div className="flex align-center gap-8">
                  {getChannelIcon(ch.type)}
                  <span style={{ fontWeight: 500, fontSize: '13px' }}>{ch.name}</span>
                </div>
                {ch.connected ? (
                  <span className="badge badge-success" style={{ fontSize: '10px' }}>Active</span>
                ) : (
                  <span className="badge badge-default" style={{ fontSize: '10px' }}>Offline</span>
                )}
              </div>
            ))}
          </div>

          <div className="panel-footer" style={{ padding: '8px 16px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Configure networks in Channels tab
            </span>
          </div>
        </div>
      </div>

      {/* Upcoming posts quick view */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <span className="panel-title">Upcoming Queue</span>
            <p className="panel-description">Your next scheduled publications</p>
          </div>
          <button 
            onClick={() => setActiveTab('queue')}
            className="btn btn-secondary btn-primary-light"
            style={{ height: '26px', fontSize: '11px', padding: '0 8px' }}
          >
            View Full Queue
          </button>
        </div>
        <div className="panel-body p-0">
          {posts.filter(p => p.status === 'scheduled').length === 0 ? (
            <div className="text-center" style={{ padding: '32px', color: 'var(--text-muted)' }}>
              No scheduled posts in the queue. Create one to get started!
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Post Content</th>
                    <th>Platforms</th>
                    <th>Scheduled Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {posts
                    .filter(p => p.status === 'scheduled')
                    .slice(0, 3)
                    .map((post) => (
                      <tr key={post.id}>
                        <td>
                          <div className="text-truncate" style={{ maxWidth: '400px' }}>
                            {post.content}
                          </div>
                        </td>
                        <td>
                          <div className="flex gap-4">
                            {post.platforms.map((plat) => (
                              <span 
                                key={plat} 
                                className="badge badge-default" 
                                style={{ fontSize: '10px', padding: '1px 4px' }}
                              >
                                {plat}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <code style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            {new Date(post.scheduled_at).toLocaleString()}
                          </code>
                        </td>
                        <td>
                          <span className="badge badge-warning">Scheduled</span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
