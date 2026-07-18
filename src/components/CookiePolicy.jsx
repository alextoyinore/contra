import React from 'react';

export default function CookiePolicy() {
  return (
    <div className="content-container-tight animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Cookie Policy</h1>
        <p className="page-subtitle">Learn how and why we store session preferences and tokens locally in your browser.</p>
      </div>

      <div className="panel" style={{ padding: '24px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.7', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p><strong>Last Updated: July 17, 2026</strong></p>
          
          <p>
            This Cookie Policy explains how Contra uses cookies and local browser storage technologies. By continuing to browse our workspace, you consent to our use of these technologies.
          </p>

          <h4 style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '8px' }}>1. What are Cookies and Local Storage?</h4>
          <p>
            Cookies are small text files stored on your device. Local Storage (Web Storage) is a modern mechanism that allows web apps to save data directly in your browser with no expiration date.
          </p>

          <h4 style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '8px' }}>2. How Contra Uses Local Storage</h4>
          <p>
            Contra does not use cookies for tracking or advertising. We use the browser's **Local Storage** strictly for essential session variables:
          </p>
          <ul style={{ paddingLeft: '20px', listStyleType: 'disc', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li><strong>Theme Preference:</strong> Remembers your selection (Light, Dark, or System mode).</li>
            <li><strong>Authorization Keys:</strong> Saves your Supabase project keys locally if configured, allowing you to access dashboard data between browser reloads.</li>
          </ul>

          <h4 style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '8px' }}>3. How to Clear Local Storage</h4>
          <p>
            You can control or delete Local Storage settings directly in your browser:
          </p>
          <ul style={{ paddingLeft: '20px', listStyleType: 'disc', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>Open your browser Developer Tools (F12 or right-click &gt; Inspect).</li>
            <li>Navigate to the **Application** or **Storage** tab.</li>
            <li>Select **Local Storage** from the left pane.</li>
            <li>Right-click your website URL and click **Clear** or **Delete**.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
