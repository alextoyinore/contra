import React from 'react';
import { Cpu, Database, Layers, ExternalLink } from 'lucide-react';

export default function About() {
  return (
    <div className="content-container-tight animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">About Contra</h1>
        <p className="page-subtitle">Learn more about the application workspace and its architecture.</p>
      </div>

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
    </div>
  );
}
