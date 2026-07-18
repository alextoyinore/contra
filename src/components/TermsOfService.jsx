import React from 'react';

export default function TermsOfService() {
  return (
    <div className="content-container-tight animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Terms of Service</h1>
        <p className="page-subtitle">Read the terms and constraints of our social scheduling platform.</p>
      </div>

      <div className="panel" style={{ padding: '24px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.7', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p><strong>Last Updated: July 17, 2026</strong></p>
          
          <h4 style={{ fontWeight: 600, color: 'var(--text-main)' }}>1. Agreement to Terms</h4>
          <p>
            By accessing or using Contra, you agree to comply with and be bound by these Terms of Service. If you disagree with any part of these terms, you may not connect or authorize accounts to the workspace.
          </p>

          <h4 style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '8px' }}>2. Account Connection & Token Use</h4>
          <p>
            You represent that you own or have authorized management rights to any social media profile or channel you link to Contra. You authorize Contra to send API requests to third-party endpoints to retrieve stats and publish your drafted material.
          </p>

          <h4 style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '8px' }}>3. Acceptable Use Guidelines</h4>
          <p>
            You agree not to use the scheduling features of Contra to distribute spam, coordinate platform abuse, spread malware, or publish content that violates the terms of services of Twitter/X, Google/YouTube, LinkedIn, or TikTok.
          </p>

          <h4 style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '8px' }}>4. Disclaimer of Warranties & Rate Limits</h4>
          <p>
            Contra is provided "as is". We are not responsible for any post failures caused by third-party API outages, rate limit blockages, account suspensions, or token expirations. Users are limited to respective daily quotas (e.g. YouTube insertion quota rules).
          </p>

          <h4 style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '8px' }}>5. Modifications and Service Termination</h4>
          <p>
            We reserve the right to modify these terms at any time. Your continued use of the application following the posting of changes constitutes acceptance of those changes.
          </p>
        </div>
      </div>
    </div>
  );
}
