import React, { useState } from 'react';
import { 
  Home, 
  Calendar, 
  Table, 
  Share2, 
  Settings, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'scheduler', label: 'Scheduler', icon: Calendar },
    { id: 'queue', label: 'Posts Queue', icon: Table },
    { id: 'channels', label: 'Channels', icon: Share2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          {/* Contra "C" lettermark */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="24" height="24" rx="6" fill="var(--primary-green)" />
            <text
              x="12"
              y="17.5"
              fontFamily="'Inter', 'Helvetica Neue', Arial, sans-serif"
              fontSize="15"
              fontWeight="700"
              fill="#000000"
              textAnchor="middle"
            >C</text>
          </svg>
        </div>
        <span className="sidebar-brand-name">Contra</span>
      </div>

      {/* Sidebar Navigation Menu */}
      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`sidebar-menu-item ${isActive ? 'active' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon size={18} className="sidebar-item-icon" />
              <span className="sidebar-menu-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Sidebar Collapse Toggle */}
      <div className="sidebar-footer">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="sidebar-collapse-btn"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
}
