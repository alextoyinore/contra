import React, { useState, useRef, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  X, 
  Clock, 
  Send,
  Eye
} from 'lucide-react';
import { Twitter, Linkedin, Instagram, Facebook, Tiktok, Youtube } from './SocialIcons';
import { useToast } from '../context/ToastContext';

export default function PostScheduler({ onAddPost, channels = [] }) {
  const twitterChannel = channels.find(c => c.type === 'twitter');
  const linkedinChannel = channels.find(c => c.type === 'linkedin');
  const instagramChannel = channels.find(c => c.type === 'instagram');
  const facebookChannel = channels.find(c => c.type === 'facebook');
  const tiktokChannel = channels.find(c => c.type === 'tiktok');
  const youtubeChannel = channels.find(c => c.type === 'youtube');

  const getChannelData = (channel, defaultHandle, defaultName) => {
    const handle = channel?.handle || defaultHandle;
    const name = handle.startsWith('@') ? handle.slice(1) : (channel?.name || defaultName);
    const initials = name.slice(0, 2).toUpperCase();
    const avatar = channel?.avatar_url;
    return { handle, name, initials, avatar, followers: channel?.followers };
  };

  const twitter = getChannelData(twitterChannel, '@yourhandle', 'Twitter / X');
  const linkedin = getChannelData(linkedinChannel, 'Your Page', 'LinkedIn Page');
  const instagram = getChannelData(instagramChannel, 'instagram_hq', 'Instagram');
  const facebook = getChannelData(facebookChannel, 'Your Page', 'Facebook Page');
  const tiktok = getChannelData(tiktokChannel, '@tiktok_hq', 'TikTok');
  const youtube = getChannelData(youtubeChannel, 'Your Channel', 'YouTube');

  const { handle: twitterHandle, name: twitterName, initials: twitterInitials, avatar: twitterAvatar } = twitter;
  const { handle: linkedinHandle, name: linkedinName, initials: linkedinInitials, avatar: linkedinAvatar } = linkedin;
  const { handle: instagramHandle, name: instagramName, initials: instagramInitials, avatar: instagramAvatar } = instagram;
  const { handle: facebookHandle, name: facebookName, initials: facebookInitials, avatar: facebookAvatar } = facebook;
  const { handle: tiktokHandle, name: tiktokName, initials: tiktokInitials, avatar: tiktokAvatar } = tiktok;
  const { handle: youtubeHandle, name: youtubeName, initials: youtubeInitials, avatar: youtubeAvatar } = youtube;

  const { addToast } = useToast();
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState(['twitter']);
  const [scheduledDate, setScheduledDate] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewPlatform, setPreviewPlatform] = useState('twitter');
  
  const fileInputRef = useRef(null);

  // Character limits
  const CHAR_LIMITS = {
    twitter: 280,
    linkedin: 3000,
    instagram: 2200,
    facebook: 5000
  };

  // Set default scheduled date to 1 hour from now
  useEffect(() => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    
    // Format to YYYY-MM-DDThh:mm
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    setScheduledDate(`${year}-${month}-${day}T${hours}:${minutes}`);
  }, []);

  const handlePlatformToggle = (platform) => {
    const channel = channels.find(c => c.type === platform);
    if (channel && !channel.connected) {
      addToast(
        `${platform} not connected`,
        'error',
        `Go to Channels to link your ${platform} account first.`
      );
      return;
    }

    if (selectedPlatforms.includes(platform)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };

  // Automatically update preview platform if the current preview tab is unchecked
  useEffect(() => {
    if (!selectedPlatforms.includes(previewPlatform) && selectedPlatforms.length > 0) {
      setPreviewPlatform(selectedPlatforms[0]);
    }
  }, [selectedPlatforms]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setIsUploading(true);
    setUploadProgress(10);

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || localStorage.getItem('cloudinary-cloud');
    const preset    = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || localStorage.getItem('cloudinary-preset');

    if (cloudName && preset) {
      try {
        setUploadProgress(30);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', preset);

        setUploadProgress(60);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData
        });
        
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error?.message || 'Failed to upload to Cloudinary');
        }

        const data = await res.json();
        setUploadProgress(100);
        setIsUploading(false);
        if (data.secure_url) {
          setImageUrl(data.secure_url);
        } else {
          throw new Error('No URL returned from Cloudinary');
        }
      } catch (err) {
        console.error('Cloudinary Upload Error:', err);
        addToast('Upload failed', 'error', err.message + ' — using local preview.');
        setImageUrl(URL.createObjectURL(file));
        setIsUploading(false);
      }
    } else {
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            setImageUrl(URL.createObjectURL(file));
            return 100;
          }
          return prev + 30;
        });
      }, 200);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImageUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e, publishImmediately = false) => {
    e.preventDefault();
    if (!content.trim() && !imageUrl) {
      addToast('Nothing to post', 'error', 'Add a message or attach an image.');
      return;
    }

    for (const plat of selectedPlatforms) {
      if (content.length > CHAR_LIMITS[plat]) {
        addToast('Message too long', 'error', `Over the ${CHAR_LIMITS[plat]}-char limit for ${plat}.`);
        return;
      }
    }

    const newPost = {
      id: Date.now().toString(),
      content: content,
      platforms: selectedPlatforms,
      media_url: imageUrl || null,
      status: publishImmediately ? 'published' : 'scheduled',
      scheduled_at: publishImmediately ? new Date().toISOString() : new Date(scheduledDate).toISOString(),
      created_at: new Date().toISOString(),
      publishImmediately, // signal to App.jsx to call the Edge Function
    };

    onAddPost(newPost);

    // Reset form
    setContent('');
    setImageFile(null);
    setImageUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (!publishImmediately) {
      addToast('Scheduled!', 'success', `Goes live at ${new Date(scheduledDate).toLocaleString()}.`);
    }
    // For publishImmediately, App.jsx handles the toast after the API call
  };

  // Find character limit of current platform in preview
  const currentLimit = CHAR_LIMITS[previewPlatform] || 280;
  const isOverLimit = content.length > currentLimit;

  return (
    <div className="content-container-tight">
      <div className="page-header">
        <h1 className="page-title">Scheduler</h1>
        <p className="page-subtitle">Draft and schedule posts across your active social channels.</p>
      </div>

      <div className="grid-cols-2 scheduler-grid" style={{ gridTemplateColumns: '1.2fr 0.8fr' }}>
        {/* Editor Form Panel */}
        <form onSubmit={(e) => handleSubmit(e, false)} className="panel">
          <div className="panel-header">
            <span className="panel-title">Composer</span>
            <span className="badge badge-default" style={{ textTransform: 'none' }}>
              {content.length} / {currentLimit} characters
            </span>
          </div>

          <div className="panel-body">
            {/* Platform Selection */}
            <div className="form-group">
              <label className="form-label">Publish to:</label>
              <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
                {channels.map((ch) => {
                  const Icon = ch.type === 'twitter' ? Twitter : 
                               ch.type === 'linkedin' ? Linkedin : 
                               ch.type === 'instagram' ? Instagram : 
                               ch.type === 'facebook' ? Facebook : 
                               ch.type === 'tiktok' ? Tiktok : Youtube;
                  
                  const isSelected = selectedPlatforms.includes(ch.type);
                  const isConnected = ch.connected;
                  
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => handlePlatformToggle(ch.type)}
                      className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ 
                        opacity: isConnected ? 1 : 0.4,
                        position: 'relative'
                      }}
                      title={isConnected ? `Post to ${ch.name}` : `${ch.name} (Disconnected)`}
                    >
                      <Icon size={16} />
                      <span style={{ fontSize: '12px' }}>{ch.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content Field */}
            <div className="form-group">
              <label className="form-label">Post Message</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What do you want to share? Add links, text, and descriptions..."
                className="form-textarea"
                style={{ 
                  minHeight: '130px',
                  borderColor: isOverLimit ? 'var(--error)' : undefined,
                  boxShadow: isOverLimit ? '0 0 0 2px var(--error-bg)' : undefined
                }}
              />
              {isOverLimit && (
                <span style={{ color: 'var(--error)', fontSize: '11px', fontWeight: 500 }}>
                  Message is too long for {previewPlatform}. Limit is {currentLimit} characters.
                </span>
              )}
            </div>

            {/* Media Upload */}
            <div className="form-group">
              <label className="form-label">Media Attachment</label>
              
              {!imageUrl ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '1px dashed var(--border-color)',
                    borderRadius: '6px',
                    padding: '24px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: 'rgba(0,0,0,0.015)'
                  }}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  {isUploading ? (
                    <div className="flex flex-col align-center gap-8">
                      <div className="spinner" style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid var(--border-color)',
                        borderTopColor: 'var(--primary-green)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}/>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Uploading file ({uploadProgress}%)
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col align-center gap-4" style={{ color: 'var(--text-secondary)' }}>
                      <ImageIcon size={20} className="text-muted" style={{ margin: '0 auto' }} />
                      <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)' }}>Click to upload media</span>
                      <span style={{ fontSize: '11px' }}>PNG, JPG, GIF up to 10MB</span>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ position: 'relative', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  <img 
                    src={imageUrl} 
                    alt="Upload Preview" 
                    style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', display: 'block' }} 
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="btn btn-secondary btn-icon"
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      color: '#ffffff',
                      border: 'none'
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>

            {/* Date-time Picker */}
            <div className="form-group">
              <label className="form-label">Schedule Publication Date</label>
              <div className="flex align-center gap-8">
                <Clock size={16} className="text-muted" />
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

          <div className="panel-footer">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={isOverLimit}
              className="btn btn-secondary"
            >
              <Send size={14} />
              Publish Now
            </button>
            <button
              type="submit"
              disabled={isOverLimit}
              className="btn btn-primary"
            >
              <Clock size={14} />
              Schedule Post
            </button>
          </div>
        </form>

        {/* Live Preview Panel */}
        <div className="panel">
          <div className="panel-header">
            <div className="flex align-center gap-8">
              <Eye size={16} className="text-muted" />
              <span className="panel-title">Post Preview</span>
            </div>
            {/* Preview Platform Selection Tabs */}
            <div className="theme-picker" style={{ padding: '1px' }}>
              {selectedPlatforms.map((plat) => (
                <button
                  key={plat}
                  type="button"
                  onClick={() => setPreviewPlatform(plat)}
                  className={`theme-picker-btn ${previewPlatform === plat ? 'active' : ''}`}
                  style={{ fontSize: '11px', padding: '2px 6px', textTransform: 'capitalize' }}
                >
                  {plat}
                </button>
              ))}
            </div>
          </div>

          <div className="panel-body flex flex-col justify-center align-center" style={{ backgroundColor: 'var(--bg-base)', minHeight: '300px', padding: '20px' }}>
            {previewPlatform === 'twitter' && (
              <div 
                style={{ 
                  backgroundColor: 'var(--bg-panel)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '12px', 
                  padding: '12px',
                  width: '100%',
                  maxWidth: '340px'
                }}
              >
                {/* Header Profile */}
                <div className="flex gap-8" style={{ marginBottom: '8px' }}>
                  {twitterAvatar ? (
                    <img 
                      src={twitterAvatar} 
                      alt={twitterName} 
                      style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }} 
                    />
                  ) : (
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary-green-light)', border: '1px solid var(--primary-green)', display: 'grid', placeContent: 'center', fontWeight: 'bold', fontSize: '12px', color: 'var(--text-green)' }}>
                      {twitterInitials}
                    </div>
                  )}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontWeight: 600, fontSize: '13px' }}>{twitterName}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{twitterHandle}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Just now</span>
                  </div>
                </div>
                {/* Post body */}
                <div style={{ fontSize: '13px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginBottom: '8px' }}>
                  {content || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Your post message will appear here...</span>}
                </div>
                {/* Image */}
                {imageUrl && (
                  <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', marginTop: '8px' }}>
                    <img src={imageUrl} alt="Preview Attachment" style={{ width: '100%', display: 'block' }} />
                  </div>
                )}
                {/* Actions */}
                <div className="flex justify-between" style={{ color: 'var(--text-muted)', marginTop: '12px', fontSize: '11px', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                  <span>💬 0</span>
                  <span>🔁 0</span>
                  <span>❤️ 0</span>
                  <span>📊 0</span>
                </div>
              </div>
            )}

            {previewPlatform === 'linkedin' && (
              <div 
                style={{ 
                  backgroundColor: 'var(--bg-panel)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '8px', 
                  padding: '16px',
                  width: '100%',
                  maxWidth: '340px'
                }}
              >
                {/* Header Profile */}
                <div className="flex gap-8" style={{ marginBottom: '12px' }}>
                  {linkedinAvatar ? (
                    <img 
                      src={linkedinAvatar} 
                      alt={linkedinName} 
                      style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover', border: '1px solid var(--border-color)' }} 
                    />
                  ) : (
                    <div style={{ width: '40px', height: '40px', borderRadius: '4px', backgroundColor: 'var(--primary-green-light)', border: '1px solid var(--primary-green)', display: 'grid', placeContent: 'center', fontWeight: 'bold', fontSize: '14px', color: 'var(--text-green)' }}>
                      {linkedinInitials}
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{linkedinName}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{linkedinChannel?.followers ? `${linkedinChannel.followers.toLocaleString()} followers` : 'LinkedIn Page'}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Just now • 🌐</div>
                  </div>
                </div>
                {/* Post body */}
                <div style={{ fontSize: '13px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginBottom: '12px' }}>
                  {content || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Your post message will appear here...</span>}
                </div>
                {/* Image */}
                {imageUrl && (
                  <div style={{ border: '1px solid var(--border-color)', margin: '0 -16px 12px -16px' }}>
                    <img src={imageUrl} alt="Preview Attachment" style={{ width: '100%', display: 'block' }} />
                  </div>
                )}
                {/* Actions */}
                <div className="flex justify-between" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '10px', fontSize: '12px' }}>
                  <span>👍 Like</span>
                  <span>💬 Comment</span>
                  <span>🔁 Repost</span>
                  <span>📤 Send</span>
                </div>
              </div>
            )}

            {previewPlatform === 'instagram' && (
              <div 
                style={{ 
                  backgroundColor: 'var(--bg-panel)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '12px', 
                  padding: '0',
                  overflow: 'hidden',
                  width: '100%',
                  maxWidth: '340px'
                }}
              >
                {/* Header */}
                <div className="flex gap-8 align-center" style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>
                  {instagramAvatar ? (
                    <img 
                      src={instagramAvatar} 
                      alt={instagramName} 
                      style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }} 
                    />
                  ) : (
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-green-light)', border: '1px solid var(--primary-green)', display: 'grid', placeContent: 'center', fontWeight: 'bold', fontSize: '11px', color: 'var(--text-green)' }}>
                      {instagramInitials}
                    </div>
                  )}
                  <span style={{ fontWeight: 600, fontSize: '13px' }}>{instagramHandle}</span>
                </div>
                {/* Image / Content Frame */}
                <div style={{ aspectRatio: '1/1', backgroundColor: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {imageUrl ? (
                    <img src={imageUrl} alt="Instagram Feed Image" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ color: '#666', fontSize: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      📸 [Instagram Photo Preview]
                    </span>
                  )}
                </div>
                {/* Actions */}
                <div className="flex gap-16" style={{ padding: '12px 12px 6px 12px', fontSize: '18px' }}>
                  <span>❤️</span>
                  <span>💬</span>
                  <span>📤</span>
                </div>
                {/* Captions */}
                <div style={{ padding: '0 12px 12px 12px', fontSize: '12px', lineHeight: '1.4' }}>
                  <span style={{ fontWeight: 600, marginRight: '6px' }}>{instagramHandle}</span>
                  <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {content || 'Your caption will appear here...'}
                  </span>
                </div>
              </div>
            )}

            {previewPlatform === 'facebook' && (
              <div 
                style={{ 
                  backgroundColor: 'var(--bg-panel)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '8px', 
                  padding: '16px',
                  width: '100%',
                  maxWidth: '340px'
                }}
              >
                {/* Header Profile */}
                <div className="flex gap-8" style={{ marginBottom: '12px' }}>
                  {facebookAvatar ? (
                    <img 
                      src={facebookAvatar} 
                      alt={facebookName} 
                      style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }} 
                    />
                  ) : (
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary-green-light)', border: '1px solid var(--primary-green)', display: 'grid', placeContent: 'center', fontWeight: 'bold', fontSize: '12px', color: 'var(--text-green)' }}>
                      {facebookInitials}
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{facebookName}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Just now • 👥</div>
                  </div>
                </div>
                {/* Post body */}
                <div style={{ fontSize: '13px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginBottom: '12px' }}>
                  {content || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Your post message will appear here...</span>}
                </div>
                {/* Image */}
                {imageUrl && (
                  <div style={{ border: '1px solid var(--border-color)', margin: '0 -16px 12px -16px' }}>
                    <img src={imageUrl} alt="Facebook Attachment" style={{ width: '100%', display: 'block' }} />
                  </div>
                )}
                {/* Actions */}
                <div className="flex justify-between" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '10px', fontSize: '12px', textAlign: 'center' }}>
                  <span style={{ flex: 1 }}>👍 Like</span>
                  <span style={{ flex: 1 }}>💬 Comment</span>
                  <span style={{ flex: 1 }}>📤 Share</span>
                </div>
              </div>
            )}

            {previewPlatform === 'tiktok' && (
              <div 
                style={{ 
                  backgroundColor: '#010101', 
                  color: '#ffffff',
                  border: '1px solid var(--border-color)', 
                  borderRadius: '16px', 
                  padding: '16px',
                  width: '100%',
                  maxWidth: '340px',
                  position: 'relative',
                  overflow: 'hidden',
                  aspectRatio: '9/16',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end'
                }}
              >
                {/* Video / Background Image Preview */}
                {imageUrl ? (
                  <img src={imageUrl} alt="TikTok Video" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
                ) : (
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#121212', display: 'grid', placeContent: 'center', opacity: 0.7 }}>
                    <span style={{ fontSize: '11px', color: '#666' }}>[TikTok Video Preview]</span>
                  </div>
                )}

                {/* Sidebar overlay elements (Heart, Comment, etc.) */}
                <div style={{ position: 'absolute', right: '12px', bottom: '100px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', zIndex: 10 }}>
                  <div style={{ position: 'relative', marginBottom: '8px' }}>
                    {tiktokAvatar ? (
                      <img src={tiktokAvatar} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #ffffff' }} />
                    ) : (
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#2f2f2f', border: '2px solid #ffffff', display: 'grid', placeContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>{tiktokInitials}</div>
                    )}
                    <span style={{ position: 'absolute', bottom: '-4px', left: '12px', backgroundColor: '#fe2c55', color: '#fff', borderRadius: '50%', width: '14px', height: '14px', fontSize: '10px', display: 'grid', placeContent: 'center', fontWeight: 'bold' }}>+</span>
                  </div>
                  <div className="flex flex-col align-center" style={{ gap: '2px' }}>
                    <span style={{ fontSize: '20px' }}>❤️</span>
                    <span style={{ fontSize: '10px', color: '#fff', fontWeight: 600 }}>0</span>
                  </div>
                  <div className="flex flex-col align-center" style={{ gap: '2px' }}>
                    <span style={{ fontSize: '20px' }}>💬</span>
                    <span style={{ fontSize: '10px', color: '#fff', fontWeight: 600 }}>0</span>
                  </div>
                  <div className="flex flex-col align-center" style={{ gap: '2px' }}>
                    <span style={{ fontSize: '20px' }}>🔖</span>
                    <span style={{ fontSize: '10px', color: '#fff', fontWeight: 600 }}>0</span>
                  </div>
                </div>

                {/* Bottom Overlay Content */}
                <div style={{ zIndex: 10, textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>{tiktokHandle}</div>
                  <div style={{ fontSize: '12px', maxHeight: '60px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', marginBottom: '8px' }}>
                    {content || 'Your video description goes here...'}
                  </div>
                  <div style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.9 }}>
                    <span>🎵</span>
                    <marquee scrollamount="3" style={{ width: '150px' }}>original sound - {tiktokHandle}</marquee>
                  </div>
                </div>
              </div>
            )}

            {previewPlatform === 'youtube' && (
              <div 
                style={{ 
                  backgroundColor: 'var(--bg-panel)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '12px', 
                  padding: '0',
                  overflow: 'hidden',
                  width: '100%',
                  maxWidth: '340px'
                }}
              >
                {/* Video Frame */}
                <div style={{ aspectRatio: '16/9', backgroundColor: '#000', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {imageUrl ? (
                    <img src={imageUrl} alt="YouTube Video Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ color: '#666', fontSize: '12px' }}>📺 [YouTube Video Thumbnail]</span>
                  )}
                  <span style={{ position: 'absolute', bottom: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.8)', color: '#fff', fontSize: '10px', padding: '2px 4px', borderRadius: '2px' }}>0:00</span>
                </div>

                {/* Channel Details */}
                <div className="flex gap-8" style={{ padding: '12px' }}>
                  {youtubeAvatar ? (
                    <img 
                      src={youtubeAvatar} 
                      alt={youtubeName} 
                      style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }} 
                    />
                  ) : (
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary-green-light)', border: '1px solid var(--primary-green)', display: 'grid', placeContent: 'center', fontWeight: 'bold', fontSize: '12px', color: 'var(--text-green)' }}>
                      {youtubeInitials}
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', lineHeight: '1.4', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {content || 'Your video title and description details will display here...'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {youtubeName} • 0 views • Just now
                    </div>
                  </div>
                </div>
              </div>
            )}

            {previewPlatform !== 'twitter' && previewPlatform !== 'linkedin' && previewPlatform !== 'instagram' && previewPlatform !== 'facebook' && previewPlatform !== 'tiktok' && previewPlatform !== 'youtube' && (
              <div style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '12px' }}>
                Preview not available for {previewPlatform}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
