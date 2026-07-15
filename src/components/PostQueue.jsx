import React, { useState } from 'react';
import { 
  Search, 
  Trash2, 
  Send, 
  ExternalLink, 
  FileText, 
  Image as ImageIcon,
  Plus
} from 'lucide-react';

export default function PostQueue({ posts, onDeletePost, onPublishPost, setActiveTab }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    const matchesPlatform = platformFilter === 'all' || post.platforms.includes(platformFilter);
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  return (
    <div className="content-container-tight">
      {/* Page Header */}
      <div className="flex align-center justify-between">
        <div className="page-header">
          <h1 className="page-title">Posts Queue</h1>
          <p className="page-subtitle">Manage, review, and adjust your social scheduling pipeline.</p>
        </div>
        <button 
          onClick={() => setActiveTab('scheduler')}
          className="btn btn-primary"
        >
          <Plus size={16} />
          New Post
        </button>
      </div>

      {/* Table Editor Header / Filters */}
      <div className="panel" style={{ marginBottom: '16px' }}>
        <div 
          className="flex align-center justify-between gap-12"
          style={{ padding: '12px 16px', flexWrap: 'wrap' }}
        >
          {/* Left: Filters */}
          <div className="flex align-center gap-12" style={{ flex: 1, minWidth: '300px' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '280px' }}>
              <Search 
                size={14} 
                className="text-muted" 
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} 
              />
              <input
                type="text"
                placeholder="Search post content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '28px' }}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
              style={{ width: 'auto', minWidth: '120px' }}
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
            </select>

            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="form-select"
              style={{ width: 'auto', minWidth: '120px' }}
            >
              <option value="all">All Platforms</option>
              <option value="twitter">Twitter</option>
              <option value="linkedin">LinkedIn</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
            </select>
          </div>

          {/* Right: Counter */}
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Showing {filteredPosts.length} of {posts.length} entries
          </span>
        </div>

        {/* Data Table */}
        <div className="panel-body p-0">
          {filteredPosts.length === 0 ? (
            <div className="text-center" style={{ padding: '48px', color: 'var(--text-muted)' }}>
              <FileText size={32} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
              <p style={{ fontWeight: 500, color: 'var(--text-main)' }}>No matching posts found</p>
              <p style={{ fontSize: '12px' }}>Try adjusting your search filters or write a new post.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>ID</th>
                    <th>Status</th>
                    <th>Content</th>
                    <th>Media</th>
                    <th>Channels</th>
                    <th>Publication Date</th>
                    <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.map((post) => {
                    const isScheduled = post.status === 'scheduled';
                    const isPublished = post.status === 'published';
                    
                    return (
                      <tr key={post.id}>
                        {/* Short code ID */}
                        <td>
                          <code style={{ color: 'var(--text-muted)' }}>
                            #{post.id.slice(-6)}
                          </code>
                        </td>
                        
                        {/* Status Badge */}
                        <td>
                          <span className={`badge ${
                            isScheduled ? 'badge-warning' : 'badge-success'
                          }`}>
                            {post.status}
                          </span>
                        </td>
                        
                        {/* Content text */}
                        <td>
                          <div 
                            className="text-truncate" 
                            style={{ maxWidth: '300px' }} 
                            title={post.content}
                          >
                            {post.content || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Media Only</span>}
                          </div>
                        </td>
                        
                        {/* Media Preview Thumbnail */}
                        <td>
                          {post.media_url ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <img 
                                src={post.media_url} 
                                alt="Post thumbnail" 
                                style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                              />
                              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Image</span>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>None</span>
                          )}
                        </td>
                        
                        {/* Target Channels */}
                        <td>
                          <div className="flex gap-4">
                            {post.platforms.map((plat) => (
                              <span 
                                key={plat} 
                                className="badge badge-default" 
                                style={{ fontSize: '11px', textTransform: 'capitalize' }}
                              >
                                {plat}
                              </span>
                            ))}
                          </div>
                        </td>
                        
                        {/* Scheduled / Publication Time */}
                        <td>
                          <code style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {new Date(post.scheduled_at).toLocaleString()}
                          </code>
                        </td>
                        
                        {/* Action buttons */}
                        <td>
                          <div className="flex gap-8 justify-between" style={{ justifyContent: 'flex-end' }}>
                            {isScheduled && (
                              <button
                                onClick={() => onPublishPost(post.id)}
                                className="btn btn-secondary btn-icon"
                                style={{ width: '28px', height: '28px' }}
                                title="Publish Immediately"
                              >
                                <Send size={12} />
                              </button>
                            )}
                            <button
                              onClick={() => onDeletePost(post.id)}
                              className="btn btn-danger btn-icon"
                              style={{ width: '28px', height: '28px' }}
                              title="Delete Post"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
