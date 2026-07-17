import React, { useState } from 'react';
import { 
  Info, 
  HelpCircle, 
  Shield, 
  FileText,
  ChevronDown,
  ChevronUp,
  Cpu,
  Database,
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function Resources() {
  const [activeSubTab, setActiveSubTab] = useState('about');
  const [openFaq, setOpenFaq] = useState({});

  const toggleFaq = (index) => {
    setOpenFaq(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const faqs = [
    {
      q: "How do I connect my social media accounts?",
      a: "Go to the 'Channels' page and turn on the toggle switch for the platform you want to connect. If API credentials (Client IDs) are configured in the workspace configuration, you will be redirected to the provider's official OAuth page to grant permission. If credentials are empty, the app operates in a secure simulation mode so you can preview actions."
    },
    {
      q: "Are my OAuth tokens and credentials safe?",
      a: "Yes. All access tokens and refresh tokens are encrypted and stored in a private database schema (`oauth_tokens`) in Supabase. Only authenticated requests processed via encrypted Edge Functions can query or retrieve these tokens to post on your behalf."
    },
    {
      q: "What happens if a token expires?",
      a: "The publishing edge function automatically requests a new access token using your refresh token right before sending your post live. You do not need to manually reconnect unless you revoke access from your social account provider settings."
    },
    {
      q: "What media file formats are supported?",
      a: "For images, we support PNG, JPG, JPEG, and GIF up to 10MB. For video publishing (YouTube and TikTok), we support MP4 and MOV formats up to 100MB."
    },
    {
      q: "How does the scheduler manage publication times?",
      a: "When you schedule a post, it is stored in the `posts` table with a `scheduled` status. A automated backend daemon (or cron triggers on Supabase) checks for due posts, runs the publishing edge function, and marks them as `published`."
    }
  ];

  return (
    <div className="content-container-tight animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Resources & Legal</h1>
        <p className="page-subtitle">Learn more about Contra, read documentation, or review our legal policies.</p>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="theme-picker" style={{ alignSelf: 'flex-start', marginBottom: '24px', padding: '4px' }}>
        <button
          type="button"
          onClick={() => setActiveSubTab('about')}
          className={`theme-picker-btn ${activeSubTab === 'about' ? 'active' : ''}`}
          style={{ gap: '6px', padding: '8px 16px', fontSize: '13px' }}
        >
          <Info size={14} />
          About
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('help')}
          className={`theme-picker-btn ${activeSubTab === 'help' ? 'active' : ''}`}
          style={{ gap: '6px', padding: '8px 16px', fontSize: '13px' }}
        >
          <HelpCircle size={14} />
          Help & FAQ
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('privacy')}
          className={`theme-picker-btn ${activeSubTab === 'privacy' ? 'active' : ''}`}
          style={{ gap: '6px', padding: '8px 16px', fontSize: '13px' }}
        >
          <Shield size={14} />
          Privacy Policy
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('terms')}
          className={`theme-picker-btn ${activeSubTab === 'terms' ? 'active' : ''}`}
          style={{ gap: '6px', padding: '8px 16px', fontSize: '13px' }}
        >
          <FileText size={14} />
          Terms of Service
        </button>
      </div>

      {/* ─── ABOUT TAB ──────────────────────────────────────────────────────── */}
      {activeSubTab === 'about' && (
        <div className="flex flex-col gap-24">
          <div className="panel" style={{ padding: '24px' }}>
            <div className="flex align-center gap-12" style={{ marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary-green)', display: 'grid', placeContent: 'center', fontWeight: 'bold', fontSize: '20px', color: '#000' }}>
                C
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Contra Social Hub</h3>
                <span className="text-secondary" style={{ fontSize: '12px' }}>Version 1.2.0 • Release Build</span>
              </div>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
              Contra is a modern, unified social media management dashboard designed for creators and organizations. It simplifies content creation, queues, scheduling, and channel authorization, enabling teams to operate across Twitter, LinkedIn, Facebook, Instagram, TikTok, and YouTube from a single, secure environment.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '24px' }}>
              <div className="panel" style={{ padding: '16px', backgroundColor: 'var(--bg-base)' }}>
                <Cpu size={20} className="text-green" style={{ marginBottom: '8px' }} />
                <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Fast Engine</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Powered by Vite + React for near-instant rendering and page switching.</p>
              </div>
              <div className="panel" style={{ padding: '16px', backgroundColor: 'var(--bg-base)' }}>
                <Database size={20} className="text-green" style={{ marginBottom: '8px' }} />
                <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Secure Enclave</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Supabase backend keeps all tokens encrypted using service-role policies.</p>
              </div>
              <div className="panel" style={{ padding: '16px', backgroundColor: 'var(--bg-base)' }}>
                <Layers size={20} className="text-green" style={{ marginBottom: '8px' }} />
                <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Platform APIs</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Fully integrated with the latest REST API v2 endpoints for posting.</p>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">System & Developers Information</span>
            </div>
            <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div className="flex justify-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                <span className="text-secondary">Host Environment</span>
                <span className="text-main" style={{ fontWeight: 500 }}>Vite Local Dev Mode</span>
              </div>
              <div className="flex justify-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                <span className="text-secondary">Active Integrations</span>
                <span className="text-main" style={{ fontWeight: 500 }}>6 channels (Twitter, LinkedIn, Instagram, Facebook, TikTok, YouTube)</span>
              </div>
              <div className="flex justify-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                <span className="text-secondary">Security Protocol</span>
                <span className="text-main" style={{ fontWeight: 500 }}>OAuth 2.0 PKCE / Authorization Code</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Documentation & Code</span>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="flex align-center gap-4 text-green" style={{ fontWeight: 500 }}>
                  GitHub Repository <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── HELP & FAQ TAB ─────────────────────────────────────────────────── */}
      {activeSubTab === 'help' && (
        <div className="flex flex-col gap-16">
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Frequently Asked Questions</span>
            </div>
            <div className="panel-body p-0">
              {faqs.map((faq, index) => {
                const isOpen = !!openFaq[index];
                return (
                  <div 
                    key={index} 
                    style={{ 
                      borderBottom: index === faqs.length - 1 ? 'none' : '1px solid var(--border-color)',
                      padding: '16px 20px'
                    }}
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="flex align-center justify-between"
                      style={{ 
                        width: '100%', 
                        background: 'none', 
                        border: 'none', 
                        padding: 0, 
                        textAlign: 'left',
                        cursor: 'pointer',
                        color: 'var(--text-main)',
                        fontWeight: 600,
                        fontSize: '14px'
                      }}
                    >
                      <span>{faq.q}</span>
                      {isOpen ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
                    </button>
                    {isOpen && (
                      <p style={{ marginTop: '10px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="panel" style={{ padding: '20px', backgroundColor: 'rgba(var(--primary-green-rgb), 0.04)', border: '1px dashed var(--primary-green)' }}>
            <h4 style={{ fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>Need Developer Assistance?</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '12px' }}>
              If you are deploying Contra to your own server or experiencing issues authenticating developer API keys on Google Cloud or TikTok Developer portals, refer to our configuration guidelines inside `.env.example`.
            </p>
            <button className="btn btn-secondary" style={{ fontSize: '12px' }}>
              Download Setup Log
            </button>
          </div>
        </div>
      )}

      {/* ─── PRIVACY POLICY TAB ─────────────────────────────────────────────── */}
      {activeSubTab === 'privacy' && (
        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Privacy Policy</h3>
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
      )}

      {/* ─── TERMS OF SERVICE TAB ───────────────────────────────────────────── */}
      {activeSubTab === 'terms' && (
        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Terms of Service</h3>
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
      )}
    </div>
  );
}
