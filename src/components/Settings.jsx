import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="content-container-tight">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Customize the appearance of your workspace.</p>
      </div>

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
    </div>
  );
}
