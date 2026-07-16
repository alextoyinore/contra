import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Calendar, 
  Table, 
  Share2, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on tab change
  const handleTabChange = (id) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setMobileOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'scheduler', label: 'Scheduler', icon: Calendar },
    { id: 'queue', label: 'Posts Queue', icon: Table },
    { id: 'channels', label: 'Channels', icon: Share2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const navContent = (
    <>
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="12" fill="var(--primary-green)" />
            <text
              x="12" y="17.5"
              fontFamily="'Inter', 'Helvetica Neue', Arial, sans-serif"
              fontSize="15" fontWeight="700" fill="#000000" textAnchor="middle"
            >C</text>
          </svg>
        </div>
        <span className="sidebar-brand-name">Contra</span>

        {/* Close button — mobile only */}
        <button
          className="sidebar-mobile-close"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav Menu */}
      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`sidebar-menu-item ${isActive ? 'active' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon size={18} className="sidebar-item-icon" />
              <span className="sidebar-menu-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Collapse toggle — desktop only */}
      <div className="sidebar-footer">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="sidebar-collapse-btn"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ── Desktop sidebar ──────────────────────────────────────────────────── */}
      <aside className={`sidebar sidebar-desktop ${isCollapsed ? 'collapsed' : ''}`}>
        {navContent}
      </aside>

      {/* ── Mobile hamburger button (in header bar via portal-free approach) ── */}
      <button
        className="sidebar-hamburger"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* ── Mobile drawer backdrop ────────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile drawer ─────────────────────────────────────────────────────── */}
      <aside className={`sidebar sidebar-mobile ${mobileOpen ? 'open' : ''}`}>
        {navContent}
      </aside>
    </>
  );
}
