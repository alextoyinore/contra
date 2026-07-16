import React, { useState } from 'react';
import { 
  Search, 
  Trash2, 
  Send, 
  FileText, 
  Plus,
  Pencil,
  X,
  Clock,
  Save
} from 'lucide-react';
import { Twitter, Linkedin, Instagram, Facebook } from './SocialIcons';

const PLATFORM_ICONS = { twitter: Twitter, linkedin: Linkedin, instagram: Instagram, facebook: Facebook };
const CHAR_LIMITS = { twitter: 280, linkedin: 3000, instagram: 2200, facebook: 5000 };

// ─── Edit Modal ──────────────────────────────────────────────────────────────
function EditPostModal({ post, channels, onSave, onClose }) {
  const [content, setContent] = useState(post.content || '');
  const [selectedPlatforms, setSelectedPlatforms] = useState(post.platforms || []);
  const [scheduledDate, setScheduledDate] = useState(() => {
    // Convert ISO string → datetime-local format
    const d = new Date(post.scheduled_at);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });

  const togglePlatform = (plat) => {
    setSelectedPlatforms(prev =>
      prev.includes(plat)
        ? prev.length > 1 ? prev.filter(p => p !== plat) : prev
        : [...prev, plat]
    );
  };

  const maxLimit = Math.min(...selectedPlatforms.map(p => CHAR_LIMITS[p] || 280));
  const isOverLimit = content.length > maxLimit;

  const handleSave = () => {
    if (!content.trim()) return;
    onSave(post.id, {
      content,
      platforms: selectedPlatforms,
      scheduled_at: new Date(scheduledDate).toISOString(),
    });
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        backgroundColor: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.15s ease'
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-panel)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '560px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp 0.2s ease'
        }}
      >
        {/* Modal Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Pencil size={15} style={{ color: 'var(--primary-green)' }} />
            <span style={{ fontWeight: 600, fontSize: '14px' }}>Edit Scheduled Post</span>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-icon"
            style={{ width: '28px', height: '28px', borderRadius: '6px' }}
          >
            <X size={13} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Platform Selection */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Publish to:</label>
            <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
              {channels.map((ch) => {
                const Icon = PLATFORM_ICONS[ch.type] || Twitter;
                const isSelected = selectedPlatforms.includes(ch.type);
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => togglePlatform(ch.type)}
                    className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ opacity: ch.connected ? 1 : 0.4, fontSize: '12px' }}
                    title={ch.connected ? ch.name : `${ch.name} (Disconnected)`}
                  >
                    <Icon size={14} />
                    {ch.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Post Message</label>
              <span style={{
                fontSize: '11px',
                color: isOverLimit ? 'var(--error)' : 'var(--text-secondary)',
                fontWeight: isOverLimit ? 600 : 400
              }}>
                {content.length} / {maxLimit}
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="form-textarea"
              style={{
                minHeight: '120px',
                borderColor: isOverLimit ? 'var(--error)' : undefined,
                boxShadow: isOverLimit ? '0 0 0 2px var(--error-bg)' : undefined
              }}
            />
            {isOverLimit && (
              <span style={{ color: 'var(--error)', fontSize: '11px', fontWeight: 500 }}>
                Message exceeds the {maxLimit}-character limit.
              </span>
            )}
          </div>

          {/* Date Picker */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Scheduled Date</label>
            <div className="flex align-center gap-8">
              <Clock size={15} className="text-muted" />
              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="form-input"
                style={{ width: 'auto' }}
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px',
          padding: '14px 20px',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-base)'
        }}>
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button
            onClick={handleSave}
            disabled={isOverLimit || !content.trim()}
            className="btn btn-primary"
          >
            <Save size={13} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main PostQueue ───────────────────────────────────────────────────────────
export default function PostQueue({ posts, channels = [], onDeletePost, onPublishPost, onEditPost, setActiveTab }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [editingPost, setEditingPost] = useState(null);

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    const matchesPlatform = platformFilter === 'all' || post.platforms.includes(platformFilter);
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  return (
    <div className="content-container-tight">
      {/* Edit Modal */}
      {editingPost && (
        <EditPostModal
          post={editingPost}
          channels={channels}
          onSave={onEditPost}
          onClose={() => setEditingPost(null)}
        />
      )}

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
                    <th style={{ width: '140px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.map((post) => {
                    const isScheduled = post.status === 'scheduled';
                    
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
                          <span className={`badge ${isScheduled ? 'badge-warning' : 'badge-success'}`}>
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
                          <div className="flex gap-8" style={{ justifyContent: 'flex-end' }}>
                            {/* Edit — only for scheduled posts */}
                            {isScheduled && (
                              <button
                                onClick={() => setEditingPost(post)}
                                className="btn btn-secondary btn-icon"
                                style={{ width: '28px', height: '28px' }}
                                title="Edit Post"
                              >
                                <Pencil size={12} />
                              </button>
                            )}
                            {/* Publish Now */}
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
                            {/* Delete */}
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
