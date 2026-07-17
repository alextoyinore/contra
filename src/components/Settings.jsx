import React from 'react';
import { Sun, Moon, Monitor, HelpCircle, Shield, FileText, Info } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Settings({ setActiveTab }) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="content-container-tight">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Customize the appearance of your workspace.</p>
      </div>

      <div className="flex flex-col gap-24">
        {/* Theme Settings Panel */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-title">Theme Settings</span>
              <p className="panel-description">Choose how Contra looks for you</p>
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
                  style={{ gap: '8px', padding: '6px 16px', fontSize: '13px' }}
                >
                  <Sun size={14} />
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`theme-picker-btn ${theme === 'dark' ? 'active' : ''}`}
                  style={{ gap: '8px', padding: '6px 16px', fontSize: '13px' }}
                >
                  <Moon size={14} />
                  Dark
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('system')}
                  className={`theme-picker-btn ${theme === 'system' ? 'active' : ''}`}
                  style={{ gap: '8px', padding: '6px 16px', fontSize: '13px' }}
                >
                  <Monitor size={14} />
                  System
                </button>
              </div>
              <span className="input-help" style={{ marginTop: '8px' }}>
                Automatically adapts to your device's OS color scheme when "System" is selected.
              </span>
            </div>
          </div>
        </div>

        {/* Legal & Resources Shortcut Panel */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-title">Legal & Resources</span>
              <p className="panel-description">Access FAQ, privacy policies, and terms documentation</p>
            </div>
          </div>

          <div className="panel-body">
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '20px' }}>
              We keep comprehensive records of our terms, privacy commitments, and a helpful knowledge base to assist in setting up OAuth credentials.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <button 
                onClick={() => setActiveTab('resources')}
                className="btn btn-secondary flex align-center gap-8"
                style={{ padding: '12px', justifyContent: 'center' }}
              >
                <Info size={14} />
                About Project
              </button>
              
              <button 
                onClick={() => setActiveTab('resources')}
                className="btn btn-secondary flex align-center gap-8"
                style={{ padding: '12px', justifyContent: 'center' }}
              >
                <HelpCircle size={14} />
                View FAQ & Help
              </button>

              <button 
                onClick={() => setActiveTab('resources')}
                className="btn btn-secondary flex align-center gap-8"
                style={{ padding: '12px', justifyContent: 'center' }}
              >
                <Shield size={14} />
                Privacy Policy
              </button>

              <button 
                onClick={() => setActiveTab('resources')}
                className="btn btn-secondary flex align-center gap-8"
                style={{ padding: '12px', justifyContent: 'center' }}
              >
                <FileText size={14} />
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
