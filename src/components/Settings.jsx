import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Moon, 
  Monitor, 
  Save, 
  Database, 
  Cloud,
  CheckCircle,
  Key,
  FileCode,
  Info
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Twitter } from './SocialIcons';

export default function Settings({ onSaveCredentials }) {
  const { theme, setTheme } = useTheme();

  // Credentials State
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [cloudinaryCloud, setCloudinaryCloud] = useState('');
  const [cloudinaryPreset, setCloudinaryPreset] = useState('');
  const [twitterClientId, setTwitterClientId] = useState('');
  const [twitterRedirectUri, setTwitterRedirectUri] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showSchema, setShowSchema] = useState(false);

  // Detect which fields are locked by environment variables
  const envSource = {
    supabaseUrl:      !!import.meta.env.VITE_SUPABASE_URL,
    supabaseKey:      !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    cloudinaryCloud:  !!import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
    cloudinaryPreset: !!import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
    twitterClientId:  !!import.meta.env.VITE_TWITTER_CLIENT_ID,
    twitterRedirectUri: !!import.meta.env.VITE_TWITTER_REDIRECT_URI,
  };

  // Load saved credentials on mount — env vars take priority
  useEffect(() => {
    setSupabaseUrl(import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('supabase-url') || '');
    setSupabaseKey(import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('supabase-key') || '');
    setCloudinaryCloud(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || localStorage.getItem('cloudinary-cloud') || '');
    setCloudinaryPreset(import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || localStorage.getItem('cloudinary-preset') || '');
    setTwitterClientId(import.meta.env.VITE_TWITTER_CLIENT_ID || localStorage.getItem('twitter-client-id') || '');
    setTwitterRedirectUri(import.meta.env.VITE_TWITTER_REDIRECT_URI || localStorage.getItem('twitter-redirect-uri') || '');
  }, []);

  const handleSave = (e) => {
    e.preventDefault();

    localStorage.setItem('supabase-url', supabaseUrl);
    localStorage.setItem('supabase-key', supabaseKey);
    localStorage.setItem('cloudinary-cloud', cloudinaryCloud);
    localStorage.setItem('cloudinary-preset', cloudinaryPreset);
    localStorage.setItem('twitter-client-id', twitterClientId);
    localStorage.setItem('twitter-redirect-uri', twitterRedirectUri);

    onSaveCredentials({
      supabaseUrl,
      supabaseKey,
      cloudinaryCloud,
      cloudinaryPreset,
      twitterClientId,
      twitterRedirectUri
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="content-container-tight">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Configure theme preferences and backend integrations.</p>
      </div>

      {saveSuccess && (
        <div className="alert-banner alert-banner-info">
          <div className="alert-icon-container">
            <CheckCircle size={16} />
          </div>
          <div className="alert-content">
            <span className="alert-title">Settings Saved</span>
            <span className="alert-description">Your integrations and preferences have been updated successfully.</span>
          </div>
        </div>
      )}

      {/* Theme Settings Panel */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <span className="panel-title">Theme Settings</span>
            <p className="panel-description">Customize the appearance of your workspace</p>
          </div>
        </div>

        <div className="panel-body">
          <div className="form-group">
            <label className="form-label" style={{ marginBottom: '8px' }}>Interface Theme</label>
            <div className="theme-picker" style={{ alignSelf: 'flex-start', padding: '4px' }}>
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`theme-picker-btn ${theme === 'light' ? 'active' : ''}`}
                style={{ gap: '8px', padding: '6px 12px', fontSize: '13px' }}
              >
                <Sun size={14} />
                Light
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`theme-picker-btn ${theme === 'dark' ? 'active' : ''}`}
                style={{ gap: '8px', padding: '6px 12px', fontSize: '13px' }}
              >
                <Moon size={14} />
                Dark
              </button>
              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`theme-picker-btn ${theme === 'system' ? 'active' : ''}`}
                style={{ gap: '8px', padding: '6px 12px', fontSize: '13px' }}
              >
                <Monitor size={14} />
                System
              </button>
            </div>
            <span className="input-help" style={{ marginTop: '8px' }}>
              Automatically adapt to your device's operating system colors if "System" is selected.
            </span>
          </div>
        </div>
      </div>

      {/* Integration settings form */}
      <form onSubmit={handleSave} className="panel">
        <div className="panel-header">
          <div className="flex align-center gap-8">
            <Database size={16} className="text-muted" />
            <span className="panel-title">Supabase Credentials</span>
          </div>
          <span className="badge badge-default">Backend Database</span>
        </div>

        <div className="panel-body">
          <div className="form-group">
            <label className="form-label">
              Supabase API URL
              {envSource.supabaseUrl && <span className="badge badge-info" style={{ marginLeft: '8px', fontSize: '10px' }}>from .env</span>}
            </label>
            <input
              type="url"
              placeholder="https://your-project-id.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="form-input"
              readOnly={envSource.supabaseUrl}
              style={envSource.supabaseUrl ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Supabase Anon Key</label>
            <div style={{ position: 'relative' }}>
              <Key size={14} className="text-muted" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '32px', ...(envSource.supabaseKey ? { opacity: 0.6, cursor: 'not-allowed' } : {}) }}
                readOnly={envSource.supabaseKey}
              />
            </div>
            <span className="input-help">
              {envSource.supabaseUrl
                ? 'Credentials are loaded from your .env file. Edit VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY to change.'
                : 'Found in your Supabase project → Settings → API.'}
            </span>
          </div>
        </div>

        <div className="panel-header" style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex align-center gap-8">
            <Cloud size={16} className="text-muted" />
            <span className="panel-title">Cloudinary Credentials</span>
          </div>
          <span className="badge badge-default">Media Storage</span>
        </div>

        <div className="panel-body">
          <div className="form-group">
            <label className="form-label">
              Cloud Name
              {envSource.cloudinaryCloud && <span className="badge badge-info" style={{ marginLeft: '8px', fontSize: '10px' }}>from .env</span>}
            </label>
            <input
              type="text"
              placeholder="e.g. dsupabaseimg"
              value={cloudinaryCloud}
              onChange={(e) => setCloudinaryCloud(e.target.value)}
              className="form-input"
              readOnly={envSource.cloudinaryCloud}
              style={envSource.cloudinaryCloud ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Upload Preset
              {envSource.cloudinaryPreset && <span className="badge badge-info" style={{ marginLeft: '8px', fontSize: '10px' }}>from .env</span>}
            </label>
            <input
              type="text"
              placeholder="e.g. social_preset_unsigned"
              value={cloudinaryPreset}
              onChange={(e) => setCloudinaryPreset(e.target.value)}
              className="form-input"
              readOnly={envSource.cloudinaryPreset}
              style={envSource.cloudinaryPreset ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
            />
            <span className="input-help">
              {envSource.cloudinaryPreset
                ? 'Loaded from .env. Edit VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_UPLOAD_PRESET to change.'
                : 'Create an Unsigned upload preset in Cloudinary → Settings → Upload.'}
            </span>
          </div>
        </div>

        <div className="panel-header" style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex align-center gap-8">
            <Twitter size={16} className="text-muted" />
            <span className="panel-title">Twitter OAuth Configuration</span>
          </div>
          <span className="badge badge-default">Social Publishing</span>
        </div>

        <div className="panel-body">
          <div className="form-group">
            <label className="form-label">
              Twitter Client ID
              {envSource.twitterClientId && <span className="badge badge-info" style={{ marginLeft: '8px', fontSize: '10px' }}>from .env</span>}
            </label>
            <input
              type="text"
              placeholder="e.g. UTFOVTd5YzhjWTR2cTVyX2dMNEQ6MTpjaQ"
              value={twitterClientId}
              onChange={(e) => setTwitterClientId(e.target.value)}
              className="form-input"
              readOnly={envSource.twitterClientId}
              style={envSource.twitterClientId ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              OAuth Redirect URI
              {envSource.twitterRedirectUri && <span className="badge badge-info" style={{ marginLeft: '8px', fontSize: '10px' }}>from .env</span>}
            </label>
            <input
              type="text"
              placeholder="https://your-project-id.supabase.co/functions/v1/twitter-oauth"
              value={twitterRedirectUri}
              onChange={(e) => setTwitterRedirectUri(e.target.value)}
              className="form-input"
              readOnly={envSource.twitterRedirectUri}
              style={envSource.twitterRedirectUri ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
            />
            <span className="input-help">
              Set this exact URL as the Callback/Redirect URI in your Twitter Developer Portal under User Authentication settings (OAuth 2.0 Client Type).
            </span>
          </div>
        </div>

        <div className="panel-footer">
          <button type="submit" className="btn btn-primary">
            <Save size={14} />
            Save Changes
          </button>
        </div>
      </form>

      {/* SQL Schema Panel */}
      <div className="panel">
        <div
          className="panel-header pointer"
          onClick={() => setShowSchema(s => !s)}
          style={{ userSelect: 'none' }}
        >
          <div className="flex align-center gap-8">
            <FileCode size={16} className="text-muted" />
            <span className="panel-title">Database Schema</span>
            <span className="badge badge-default" style={{ fontSize: '10px' }}>SQL</span>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {showSchema ? 'Hide' : 'Show'} setup SQL →
          </span>
        </div>

        {showSchema && (
          <div className="panel-body" style={{ padding: 0 }}>
            <div className="alert-banner alert-banner-info" style={{ margin: '12px 16px 0' }}>
              <div className="alert-icon-container"><Info size={14} /></div>
              <div className="alert-content">
                <span className="alert-title">One-time setup</span>
                <span className="alert-description">Run this SQL in your Supabase project → SQL Editor. Only needed once.</span>
              </div>
            </div>
            <pre style={{
              margin: '12px 16px 16px',
              padding: '12px',
              backgroundColor: 'var(--bg-base)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              fontSize: '11px',
              lineHeight: '1.6',
              overflowX: 'auto',
              color: 'var(--text-secondary)'
            }}>
{`-- channels table
CREATE TABLE IF NOT EXISTS channels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  connected BOOLEAN DEFAULT false,
  handle TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- posts table
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  platforms TEXT[] NOT NULL,
  media_url TEXT,
  status TEXT DEFAULT 'scheduled'
    CHECK (status IN ('scheduled','published')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- oauth_tokens table (for secure API tokens)
CREATE TABLE IF NOT EXISTS oauth_tokens (
  channel_type TEXT PRIMARY KEY,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_tokens ENABLE ROW LEVEL SECURITY;

-- Allow anon access (for dev/testing)
CREATE POLICY "anon_channels"     ON channels     FOR ALL TO anon USING (true);
CREATE POLICY "anon_posts"        ON posts        FOR ALL TO anon USING (true);
CREATE POLICY "anon_oauth_tokens" ON oauth_tokens FOR ALL TO anon USING (true);`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
