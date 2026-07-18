import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="content-container-tight animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Privacy Policy</h1>
        <p className="page-subtitle">Understand how we collect, store, and manage authorization keys and profile data.</p>
      </div>

      <div className="panel" style={{ padding: '24px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.7', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p><strong>Last Updated: July 17, 2026</strong></p>
          <p>
            At Contra, accessible from our application workspace, one of our main priorities is the privacy of our visitors and users. This Privacy Policy document contains types of information that is collected and recorded by Contra and how we use it.
          </p>
          
          <h4 style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '8px' }}>1. Information We Collect</h4>
          <p>
            If you link third-party accounts (Twitter, LinkedIn, Instagram, Facebook, TikTok, YouTube) to Contra, we receive authorization credentials (access tokens and refresh tokens) and basic profile information (handles, profile names, follower metrics, and avatars) to display on your dashboard.
          </p>
          <p>
            We do not read or collect personal feed items or private messages. The integration is strictly write-only to draft and publish posts you explicitly request to schedule.
          </p>

          <h4 style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '8px' }}>2. How We Use Your Information</h4>
          <p>We use the information we collect in various ways, including to:</p>
          <ul style={{ paddingLeft: '20px', listStyleType: 'disc', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>Provide, operate, and maintain our social publishing workspace.</li>
            <li>Improve, personalize, and expand the dashboard features.</li>
            <li>Refreshen authorization tokens automatically to keep publishing pipelines active.</li>
            <li>Audit daily API rate usage limits.</li>
          </ul>

          <h4 style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '8px' }}>3. Data Storage and Security</h4>
          <p>
            Your OAuth credentials are encrypted in transit and at rest. They are stored inside your private schema on Supabase and are only queried during publishing executions by secure, server-side Edge Functions.
          </p>

          <h4 style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '8px' }}>4. Third-Party Policy Alignments</h4>
          <p>
            Contra's integration utilizes official APIs. By connecting your accounts, you also agree to be bound by the respective policies:
          </p>
          <ul style={{ paddingLeft: '20px', listStyleType: 'disc', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>YouTube integration operates under Google API Services User Data Policy.</li>
            <li>TikTok integration complies with the TikTok Developer Terms of Service.</li>
            <li>X/Twitter integration aligns with Twitter Developer Agreement rules.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
