import React, { useState } from 'react';
import { 
  Link as LinkIcon, 
  Unlink, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Activity, 
  Clock, 
  Key, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { Twitter, Linkedin, Instagram, Facebook, Tiktok, Youtube } from './SocialIcons';
import { useToast } from '../context/ToastContext';

export default function ChannelConnections({ channels, onToggleChannel }) {
  const { addToast } = useToast();
  
  // Modals / Dialogs states
  const [authModal, setAuthModal] = useState(null); // { id, name, type }
  const [editModal, setEditModal] = useState(null); // { id, name, type }
  const [disconnectConfirm, setDisconnectConfirm] = useState(null); // { id, name, type }
  const [testingChannelId, setTestingChannelId] = useState(null);
  
  // Form input inside OAuth simulator
  const [handleInput, setHandleInput] = useState('');
  const [avatarInput, setAvatarInput] = useState('');
  
  // OAuth step tracking
  const [oauthStep, setOauthStep] = useState(0); // 0: Consent, 1: Connecting, 2: Done
  const [oauthLogs, setOauthLogs] = useState([]);
  
  // Diagnostics panel expansion
  const [expandedDiagnostics, setExpandedDiagnostics] = useState({}); // { channelId: boolean }

  const getPlatformIcon = (type, size = 24) => {
    switch (type) {
      case 'twitter':
        return <Twitter size={size} style={{ color: 'var(--text-main)' }} />;
      case 'linkedin':
        return <Linkedin size={size} style={{ color: '#0a66c2' }} />;
      case 'instagram':
        return <Instagram size={size} style={{ color: '#e1306c' }} />;
      case 'facebook':
        return <Facebook size={size} style={{ color: '#1877f2' }} />;
      case 'tiktok':
        return <Tiktok size={size} style={{ color: '#ff0050' }} />;
      case 'youtube':
        return <Youtube size={size} style={{ color: '#ff0000' }} />;
      default:
        return <LinkIcon size={size} />;
    }
  };

  const openAuthModal = (channel) => {
    setAuthModal(channel);
    setHandleInput('');
    setAvatarInput('');
    setOauthStep(0);
    setOauthLogs([]);
  };

  const openEditModal = (channel) => {
    setEditModal(channel);
    setHandleInput(channel.handle || '');
    setAvatarInput(channel.avatar_url || '');
  };

  const handleEditSave = (e) => {
    e.preventDefault();
    if (!handleInput.trim()) return;
    onToggleChannel(editModal.id, true, handleInput.trim(), avatarInput.trim() || null);
    setEditModal(null);
    addToast('Profile updated', 'success');
  };

  // Run Simulated/Real OAuth Handshake sequence
  const startOAuthSequence = (e) => {
    e.preventDefault();
    if (!handleInput.trim()) return;

    const twitterClientId = import.meta.env.VITE_TWITTER_CLIENT_ID;
    const twitterRedirectUri = import.meta.env.VITE_TWITTER_REDIRECT_URI;

    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const googleRedirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;

    const tiktokClientKey = import.meta.env.VITE_TIKTOK_CLIENT_KEY;
    const tiktokRedirectUri = import.meta.env.VITE_TIKTOK_REDIRECT_URI;

    // Real Twitter OAuth redirection
    if (authModal.type === 'twitter' && twitterClientId && twitterRedirectUri) {
      addToast('Redirecting to Twitter...', 'info', 'Handing off to Twitter authentication service');
      
      const authUrl = new URL("https://twitter.com/i/oauth2/authorize");
      authUrl.searchParams.append("response_type", "code");
      authUrl.searchParams.append("client_id", twitterClientId);
      authUrl.searchParams.append("redirect_uri", twitterRedirectUri);
      authUrl.searchParams.append("code_challenge", "challenge");
      authUrl.searchParams.append("code_challenge_method", "plain");
      authUrl.searchParams.append("scope", "tweet.read tweet.write users.read offline.access");
      authUrl.searchParams.append("state", "contra_twitter");

      window.location.href = authUrl.toString();
      return;
    }

    // Real YouTube (Google) OAuth redirection
    if (authModal.type === 'youtube' && googleClientId && googleRedirectUri) {
      addToast('Redirecting to Google...', 'info', 'Handing off to Google authorization service');

      const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      authUrl.searchParams.append("client_id", googleClientId);
      authUrl.searchParams.append("redirect_uri", googleRedirectUri);
      authUrl.searchParams.append("response_type", "code");
      authUrl.searchParams.append("scope", "https://www.googleapis.com/auth/youtube.upload openid profile");
      authUrl.searchParams.append("access_type", "offline");
      authUrl.searchParams.append("prompt", "consent");
      authUrl.searchParams.append("state", "contra_youtube");

      window.location.href = authUrl.toString();
      return;
    }

    // Real TikTok OAuth redirection
    if (authModal.type === 'tiktok' && tiktokClientKey && tiktokRedirectUri) {
      addToast('Redirecting to TikTok...', 'info', 'Handing off to TikTok authorization service');

      const authUrl = new URL("https://www.tiktok.com/v2/auth/authorize/");
      authUrl.searchParams.append("client_key", tiktokClientKey);
      authUrl.searchParams.append("redirect_uri", tiktokRedirectUri);
      authUrl.searchParams.append("response_type", "code");
      authUrl.searchParams.append("scope", "video.publish user.info.basic");
      authUrl.searchParams.append("state", "contra_tiktok");

      window.location.href = authUrl.toString();
      return;
    }


    // Fall back to simulation
    setOauthStep(1);
    const logs = [
      'Redirecting to provider authentication page...',
      'Exchanging authorization code for access token...',
      'Verifying account privileges...',
      'Encrypting API credentials on secure enclave...',
      'Writing persistent credentials to database...'
    ];

    logs.forEach((logText, index) => {
      setTimeout(() => {
        setOauthLogs(prev => [...prev, logText]);
        if (index === logs.length - 1) {
          // Finished all steps
          setTimeout(() => {
            onToggleChannel(authModal.id, true, handleInput.trim(), avatarInput.trim() || null);
            setAuthModal(null);
          }, 800);
        }
      }, (index + 1) * 800);
    });
  };

  const handleDisconnectConfirm = () => {
    onToggleChannel(disconnectConfirm.id, false, null);
    setDisconnectConfirm(null);
  };

  // Diagnostics check simulation
  const testChannelConnection = (channel) => {
    setTestingChannelId(channel.id);
    addToast('Testing connection...', 'info', `Sending API ping to ${channel.name} servers`);
    
    setTimeout(() => {
      setTestingChannelId(null);
      addToast('Status: Healthy', 'success', `Successfully validated OAuth token for ${channel.handle}`);
    }, 1500);
  };

  const toggleDiagnostics = (id) => {
    setExpandedDiagnostics(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="content-container-tight animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Channel Connections</h1>
        <p className="page-subtitle">Link and authorize your social platforms to enable automated publishing pipelines.</p>
      </div>

      {/* Info Banner */}
      <div className="alert-banner alert-banner-info">
        <div className="alert-icon-container">
          <ShieldCheck size={16} />
        </div>
        <div className="alert-content">
          <span className="alert-title">Secure Authentication</span>
          <span className="alert-description">Contra handles connections securely. All OAuth tokens are encrypted in transit.</span>
        </div>
      </div>

      {/* Channels List */}
      <div className="grid-cols-2">
        {channels.map((ch) => {
          const isConnected = ch.connected;
          const isDiagExpanded = !!expandedDiagnostics[ch.id];
          
          return (
            <div key={ch.id} className="panel">
              <div className="panel-body flex align-center justify-between" style={{ padding: '20px' }}>
                <div className="flex gap-16 align-center">
                  <div 
                    style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '8px', 
                      border: '1px solid var(--border-color)', 
                      display: 'grid', 
                      placeContent: 'center',
                      backgroundColor: 'var(--bg-base)'
                    }}
                  >
                    {getPlatformIcon(ch.type)}
                  </div>

                  <div>
                    <div className="flex align-center gap-8">
                      <span style={{ fontWeight: 600, fontSize: '15px' }}>{ch.name}</span>
                      {isConnected && (
                        <span className="badge badge-success" style={{ fontSize: '10px' }}>
                          connected
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {isConnected 
                        ? `Linked account: ${ch.handle}`
                        : `Authorize posting to ${ch.name}`
                      }
                    </p>
                  </div>
                </div>

                {/* Toggle switch control */}
                <div>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={isConnected} 
                      onChange={() => {
                        if (isConnected) {
                          setDisconnectConfirm(ch);
                        } else {
                          openAuthModal(ch);
                        }
                      }}
                    />
                    <span className="switch-slider"></span>
                  </label>
                </div>
              </div>

              {/* Extra tools for connected accounts */}
              {isConnected && (
                <div 
                  style={{ 
                    borderTop: '1px solid var(--border-color)', 
                    padding: '12px 20px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    backgroundColor: 'rgba(0,0,0,0.01)',
                    fontSize: '12px'
                  }}
                >
                  <div className="flex gap-12 align-center">
                    <button
                      onClick={() => testChannelConnection(ch)}
                      className="btn btn-secondary"
                      style={{ height: '24px', padding: '0 8px', fontSize: '11px', gap: '4px' }}
                      disabled={testingChannelId === ch.id}
                    >
                      <RefreshCw size={10} className={testingChannelId === ch.id ? 'spinner' : ''} />
                      {testingChannelId === ch.id ? 'Testing...' : 'Test Connection'}
                    </button>

                    <button
                      onClick={() => openEditModal(ch)}
                      className="btn btn-secondary"
                      style={{ height: '24px', padding: '0 8px', fontSize: '11px', gap: '4px' }}
                    >
                      Edit Profile
                    </button>
                    
                    <button
                      onClick={() => toggleDiagnostics(ch.id)}
                      className="btn btn-secondary"
                      style={{ height: '24px', padding: '0 8px', fontSize: '11px', gap: '4px', border: 'none', background: 'transparent' }}
                    >
                      {isDiagExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      Diagnostics
                    </button>
                  </div>

                  <span className="flex align-center gap-4 text-green" style={{ fontWeight: 500, fontSize: '11px' }}>
                    <Activity size={10} /> Active
                  </span>
                </div>
              )}

              {/* Collapsible Diagnostics Area */}
              {isConnected && isDiagExpanded && (
                <div 
                  style={{ 
                    borderTop: '1px solid var(--border-color)', 
                    padding: '16px 20px', 
                    backgroundColor: 'var(--bg-base)',
                    fontSize: '11px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div className="flex justify-between">
                    <span className="text-secondary flex align-center gap-4"><Key size={10} /> Authorized Scopes:</span>
                    <span className="text-muted" style={{ fontFamily: 'monospace' }}>read:user, write:posts, offline_access</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary flex align-center gap-4"><Clock size={10} /> OAuth Token Expiry:</span>
                    <span className="text-muted">60 days (Auto-refreshes on post)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary flex align-center gap-4"><Activity size={10} /> Daily Rate Limit:</span>
                    <span className="text-muted">184 / 200 API calls remaining</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* OAuth Handshake Simulator Modal */}
      {authModal && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.7)', 
            display: 'grid', 
            placeContent: 'center', 
            zIndex: 99999,
            backdropFilter: 'blur(2px)'
          }}
        >
          <div className="panel" style={{ width: '420px', maxWidth: '90vw' }}>
            <div className="panel-header">
              <span className="panel-title flex align-center gap-8">
                {getPlatformIcon(authModal.type, 18)}
                Connect {authModal.name}
              </span>
              <button 
                onClick={() => setAuthModal(null)} 
                className="btn btn-secondary btn-icon"
                style={{ width: '24px', height: '24px', border: 'none' }}
                disabled={oauthStep === 1}
              >
                <X size={14} />
              </button>
            </div>

            {/* Stage 1: Consent Form */}
            {oauthStep === 0 && (
              <form onSubmit={startOAuthSequence}>
                <div className="panel-body">
                  <div 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '12px', 
                      marginBottom: '20px',
                      padding: '16px',
                      backgroundColor: 'rgba(0,0,0,0.02)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    {/* Contra Icon */}
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary-green)', display: 'grid', placeContent: 'center', fontWeight: 'bold', fontSize: '18px', color: '#000' }}>
                      C
                    </div>
                    <span className="text-muted" style={{ fontSize: '18px' }}>↔</span>
                    {/* Platform Icon */}
                    <div style={{ width: '36px', height: '36px', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'grid', placeContent: 'center', backgroundColor: 'var(--bg-base)' }}>
                      {getPlatformIcon(authModal.type, 20)}
                    </div>
                  </div>

                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.6' }}>
                    <strong>Contra</strong> requests permission to access your <strong>{authModal.name}</strong> account. This enables automatic drafting, queue scheduling, and publishing statistics.
                  </p>

                  <div className="form-group">
                    <label className="form-label">Account Handle / Username</label>
                    <input
                      type="text"
                      required
                      placeholder={authModal.type === 'twitter' ? '@username' : 'username / company name'}
                      value={handleInput}
                      onChange={(e) => setHandleInput(e.target.value)}
                      className="form-input"
                      autoFocus
                    />
                  </div>

                  <div className="form-group" style={{ marginTop: '12px' }}>
                    <label className="form-label">Profile Image URL (Optional)</label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/... or leave blank for default"
                      value={avatarInput}
                      onChange={(e) => setAvatarInput(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="panel-footer">
                  <button 
                    type="button" 
                    onClick={() => setAuthModal(null)} 
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Authorize App
                  </button>
                </div>
              </form>
            )}

            {/* Stage 2: Handshake Logs Spinner */}
            {oauthStep === 1 && (
              <div className="panel-body flex flex-col align-center text-center" style={{ padding: '32px 20px', minHeight: '260px' }}>
                <div className="spinner" style={{ width: '36px', height: '36px', marginBottom: '24px' }} />
                
                <span className="panel-title" style={{ marginBottom: '8px' }}>OAuth Handshake in progress</span>
                <p className="text-secondary" style={{ fontSize: '11px', marginBottom: '20px' }}>Please do not close this window</p>

                <div 
                  style={{ 
                    width: '100%', 
                    backgroundColor: 'var(--bg-base)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '6px', 
                    padding: '12px', 
                    textAlign: 'left',
                    fontFamily: 'monospace',
                    fontSize: '10px',
                    color: 'var(--text-secondary)',
                    minHeight: '110px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  {oauthLogs.map((log, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="text-green">✓</span> {log}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {editModal && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.7)', 
            display: 'grid', 
            placeContent: 'center', 
            zIndex: 99999,
            backdropFilter: 'blur(2px)'
          }}
        >
          <div className="panel" style={{ width: '420px', maxWidth: '90vw' }}>
            <div className="panel-header">
              <span className="panel-title flex align-center gap-8">
                {getPlatformIcon(editModal.type, 18)}
                Edit {editModal.name} Profile
              </span>
              <button 
                onClick={() => setEditModal(null)} 
                className="btn btn-secondary btn-icon"
                style={{ width: '24px', height: '24px', border: 'none' }}
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleEditSave}>
              <div className="panel-body">
                <div className="form-group">
                  <label className="form-label">Account Handle / Username</label>
                  <input
                    type="text"
                    required
                    placeholder={editModal.type === 'twitter' ? '@username' : 'username'}
                    value={handleInput}
                    onChange={(e) => setHandleInput(e.target.value)}
                    className="form-input"
                    autoFocus
                  />
                </div>

                <div className="form-group" style={{ marginTop: '12px' }}>
                  <label className="form-label">Profile Image URL</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/... or leave blank for initials fallback"
                    value={avatarInput}
                    onChange={(e) => setAvatarInput(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="panel-footer">
                <button 
                  type="button" 
                  onClick={() => setEditModal(null)} 
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disconnect Confirmation Modal */}
      {disconnectConfirm && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.7)', 
            display: 'grid', 
            placeContent: 'center', 
            zIndex: 99999,
            backdropFilter: 'blur(2px)'
          }}
        >
          <div className="panel" style={{ width: '360px', maxWidth: '90vw' }}>
            <div className="panel-header">
              <span className="panel-title flex align-center gap-8 text-error">
                <AlertCircle size={16} />
                Disconnect Account?
              </span>
            </div>
            <div className="panel-body">
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Are you sure you want to unlink <strong>{disconnectConfirm.handle}</strong> from your {disconnectConfirm.name} integration? Scheduled posts for this platform will not go live.
              </p>
            </div>
            <div className="panel-footer">
              <button 
                type="button" 
                onClick={() => setDisconnectConfirm(null)} 
                className="btn btn-secondary"
              >
                Keep Connection
              </button>
              <button 
                type="button" 
                onClick={handleDisconnectConfirm} 
                className="btn btn-danger"
              >
                Confirm Unlink
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
