import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, 
  CheckCircle, 
  Users, 
  ArrowUpRight, 
  Plus, 
  Link, 
  TrendingUp,
  Clock,
  Image as ImageIcon
} from 'lucide-react';
import { Twitter, Linkedin, Instagram, Facebook } from './SocialIcons';

// ─── Relative time helper ────────────────────────────────────────────────────
function relativeTime(dateStr) {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = then - now;
  const diffMins = Math.round(diffMs / 60000);
  const diffHrs = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  if (diffMs < 0) {
    const ago = Math.abs(diffMins);
    if (ago < 60) return `${ago}m ago`;
    if (Math.abs(diffHrs) < 24) return `${Math.abs(diffHrs)}h ago`;
    return `${Math.abs(diffDays)}d ago`;
  }
  if (diffMins < 60) return `in ${diffMins}m`;
  if (diffHrs < 24) return `in ${diffHrs}h`;
  if (diffDays === 1) return 'Tomorrow';
  return `in ${diffDays}d`;
}

// ─── Dynamic SVG Area Chart ──────────────────────────────────────────────────
function ImpressionsChart({ posts }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [width, setWidth] = useState(500);
  const containerRef = useRef(null);

  // Monitor element resize to adapt chart viewport width dynamically
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        // Use padding box or content box width
        const w = entry.contentRect.width;
        if (w > 0) {
          setWidth(w);
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Build last-7-days buckets (today is index 6)
  const now = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  // Count published posts per day
  const counts = days.map(dayStart => {
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);
    return posts.filter(p => {
      if (p.status !== 'published') return false;
      const d = new Date(p.scheduled_at);
      return d >= dayStart && d <= dayEnd;
    }).length;
  });

  // Also count scheduled posts per day (as a secondary line)
  const scheduledCounts = days.map(dayStart => {
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);
    return posts.filter(p => {
      if (p.status !== 'scheduled') return false;
      const d = new Date(p.scheduled_at);
      return d >= dayStart && d <= dayEnd;
    }).length;
  });

  const dayLabels = days.map(d =>
    d.toLocaleDateString('en-US', { weekday: 'short' })
  );

  // SVG dimensions — use live measured width for W
  const W = width;
  const H = 180;
  const PAD_Y = 20;
  const LEFT_PAD = 28; // minimal offset to keep labels aligned
  const RIGHT_PAD = 8;  // small pad so last point isn't clipped
  const chartW = Math.max(W - LEFT_PAD - RIGHT_PAD, 10);
  const chartH = H - PAD_Y;
  const maxVal = Math.max(...counts, ...scheduledCounts, 1);

  // Map value → Y (inverted) and index → X, chart area starts at LEFT_PAD
  const toY = v => PAD_Y + chartH - (v / maxVal) * chartH;
  const toX = i => LEFT_PAD + (i / 6) * chartW;

  // Build smooth SVG path using catmull-rom spline
  const buildPath = (values) => {
    const pts = values.map((v, i) => [toX(i), toY(v)]);
    if (pts.length === 0) return '';
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const cp1x = pts[i][0] + (pts[i + 1][0] - (i > 0 ? pts[i - 1][0] : pts[i][0])) / 6;
      const cp1y = pts[i][1] + (pts[i + 1][1] - (i > 0 ? pts[i - 1][1] : pts[i][1])) / 6;
      const cp2x = pts[i + 1][0] - (i < pts.length - 2 ? pts[i + 2][0] - pts[i][0] : pts[i + 1][0] - pts[i][0]) / 6;
      const cp2y = pts[i + 1][1] - (i < pts.length - 2 ? pts[i + 2][1] - pts[i][1] : pts[i + 1][1] - pts[i][1]) / 6;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pts[i + 1][0]} ${pts[i + 1][1]}`;
    }
    return d;
  };

  const linePath = buildPath(counts);
  const schedLinePath = buildPath(scheduledCounts);

  // Area path = line + close to baseline
  const areaPath = linePath
    ? `${linePath} L ${toX(6)} ${H} L ${toX(0)} ${H} Z`
    : '';

  const hasAnyData = counts.some(c => c > 0) || scheduledCounts.some(c => c > 0);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
      <svg
        viewBox={`0 0 ${W} ${H + 14}`}
        width="100%"
        height={220}
        style={{ overflow: 'visible', display: 'block' }}
      >
        <defs>
          <linearGradient id="chartGradPublished" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary-green)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--primary-green)" stopOpacity="0.00" />
          </linearGradient>
          <linearGradient id="chartGradScheduled" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.00" />
          </linearGradient>
        </defs>

        {/* Y-axis labels — rendered inside SVG at left edge */}
        {[maxVal, Math.ceil(maxVal / 2), 0].map((v, i) => {
          const yPos = i === 0 ? PAD_Y : i === 1 ? PAD_Y + chartH / 2 : PAD_Y + chartH;
          return (
            <text key={i} x={LEFT_PAD - 6} y={yPos + 3} textAnchor="end"
              fontSize="9" fill="var(--text-muted)">
              {v}
            </text>
          );
        })}

        {/* Horizontal grid lines — start from LEFT_PAD */}
        {[0, 0.33, 0.66, 1].map((t, i) => (
          <line
            key={i}
            x1={LEFT_PAD} y1={PAD_Y + chartH * (1 - t)}
            x2={W - RIGHT_PAD} y2={PAD_Y + chartH * (1 - t)}
            stroke="var(--border-color)"
            strokeWidth="1"
            strokeDasharray={i === 0 ? 'none' : '4 4'}
          />
        ))}

        {/* Vertical column hover zones */}
        {days.map((_, i) => (
          <rect
            key={i}
            x={toX(i) - (chartW / 6) / 2}
            y={0}
            width={chartW / 6}
            height={H}
            fill="transparent"
            style={{ cursor: 'crosshair' }}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
          />
        ))}

        {/* Scheduled area + dashed line */}
        {schedLinePath && scheduledCounts.some(c => c > 0) && (
          <>
            <path
              d={`${schedLinePath} L ${toX(6)} ${H} L ${toX(0)} ${H} Z`}
              fill="url(#chartGradScheduled)"
            />
            <path
              d={schedLinePath}
              fill="none"
              stroke="#6366f1"
              strokeWidth="1.5"
              strokeDasharray="5 3"
              strokeLinecap="round"
            />
          </>
        )}

        {/* Published area fill */}
        {areaPath && <path d={areaPath} fill="url(#chartGradPublished)" />}

        {/* Published line */}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="var(--primary-green)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Data points + hover tooltips */}
        {counts.map((v, i) => {
          const x = toX(i);
          const y = toY(v);
          const isHovered = hoveredIdx === i;
          // clamp tooltip so it never goes off the left edge
          const ttX = Math.max(x, LEFT_PAD + 38);
          // clamp tooltip on the right edge too
          const finalTtX = Math.min(ttX, W - 38);
          return (
            <g key={i}>
              {isHovered && (
                <>
                  <line x1={x} y1={PAD_Y} x2={x} y2={H}
                    stroke="var(--primary-green)" strokeWidth="1"
                    strokeDasharray="3 3" strokeOpacity="0.5" />
                  <rect x={finalTtX - 38} y={Math.max(y - 38, 2)} width={76} height={28}
                    rx={4} fill="var(--bg-panel)" stroke="var(--border-color)"
                    strokeWidth="1" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))" />
                  <text x={finalTtX} y={Math.max(y - 19, 19)} textAnchor="middle"
                    fontSize="10" fontWeight="600" fill="var(--primary-green)">
                    {v} published
                  </text>
                  <text x={finalTtX} y={Math.max(y - 8, 30)} textAnchor="middle"
                    fontSize="9" fill="var(--text-muted)">
                    {scheduledCounts[i]} scheduled
                  </text>
                </>
              )}
              {v > 0 && (
                <circle cx={x} cy={y} r={isHovered ? 5 : 3.5}
                  fill="var(--bg-panel)" stroke="var(--primary-green)" strokeWidth="2"
                  style={{ transition: 'r 0.15s ease' }}
                />
              )}
            </g>
          );
        })}

        {/* Day labels along the bottom */}
        {dayLabels.map((label, i) => (
          <text key={i}
            x={toX(i)} y={H + 13}
            textAnchor="middle"
            fill={hoveredIdx === i ? 'var(--primary-green)' : 'var(--text-muted)'}
            fontSize="10" fontWeight={hoveredIdx === i ? '600' : '400'}
            style={{ transition: 'fill 0.15s ease' }}
          >
            {label}
          </text>
        ))}
      </svg>

      {/* Legend — left-aligned with chart area */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '4px', paddingLeft: `${LEFT_PAD}px` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-secondary)' }}>
          <div style={{ width: '12px', height: '2px', backgroundColor: 'var(--primary-green)', borderRadius: '1px' }} />
          Published
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-secondary)' }}>
          <div style={{ width: '12px', height: '2px', background: 'repeating-linear-gradient(90deg, #6366f1 0, #6366f1 4px, transparent 4px, transparent 7px)', borderRadius: '1px' }} />
          Scheduled
        </div>
      </div>


      {/* Empty state overlay */}
      {!hasAnyData && (
        <div style={{
          position: 'absolute', inset: '0 0 24px 0',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '6px', pointerEvents: 'none'
        }}>
          <TrendingUp size={24} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No activity in the last 7 days</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', opacity: 0.7 }}>Schedule or publish posts to see data here</span>
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function DashboardOverview({ posts, channels, setActiveTab }) {
  const totalScheduled = posts.filter(p => p.status === 'scheduled').length;
  const totalPublished = posts.filter(p => p.status === 'published').length;
  const activeChannels = channels.filter(c => c.connected).length;

  // ── Dynamic growth helpers ─────────────────────────────────────────────────
  const now = new Date();
  const msPerDay = 86400000;
  const weekStart = new Date(now - 7 * msPerDay);
  const prevWeekStart = new Date(now - 14 * msPerDay);

  const publishedThisWeek = posts.filter(p => {
    const d = new Date(p.scheduled_at);
    return p.status === 'published' && d >= weekStart && d <= now;
  }).length;

  const publishedLastWeek = posts.filter(p => {
    const d = new Date(p.scheduled_at);
    return p.status === 'published' && d >= prevWeekStart && d < weekStart;
  }).length;

  const publishedGrowthLabel = (() => {
    if (publishedLastWeek === 0) {
      return publishedThisWeek > 0 ? `+${publishedThisWeek} this week` : 'None this week';
    }
    const pct = Math.round(((publishedThisWeek - publishedLastWeek) / publishedLastWeek) * 100);
    const sign = pct >= 0 ? '+' : '';
    return `${sign}${pct}% vs last week`;
  })();

  const publishedTrendUp = publishedThisWeek >= publishedLastWeek;

  const scheduledSoon = posts.filter(p => {
    const d = new Date(p.scheduled_at);
    return p.status === 'scheduled' && d >= now && d <= new Date(+now + 7 * msPerDay);
  }).length;

  const scheduledQueueLabel = totalScheduled === 0
    ? 'Queue is empty'
    : scheduledSoon > 0
      ? `${scheduledSoon} due this week`
      : `${totalScheduled} in queue`;

  const connectedCount = channels.filter(c => c.connected).length;
  const totalChannels = channels.length;

  const getDefaultFollowers = (type) => {
    switch (type) {
      case 'twitter': return 12400;
      case 'linkedin': return 8200;
      case 'instagram': return 4200;
      case 'facebook': return 5800;
      default: return 0;
    }
  };

  const totalReach = channels
    .filter(c => c.connected)
    .reduce((sum, c) => {
      const count = (c.followers !== undefined && c.followers !== null && c.followers > 0)
        ? c.followers
        : getDefaultFollowers(c.type);
      return sum + count;
    }, 0);

  const formatReach = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toString();
  };

  const reachLabel = connectedCount === 0
    ? 'No channels connected'
    : `Across ${connectedCount} of ${totalChannels} channels`;

  const getChannelIcon = (type) => {
    switch (type) {
      case 'twitter':   return <Twitter size={16} className="text-secondary" />;
      case 'linkedin':  return <Linkedin size={16} className="text-secondary" />;
      case 'instagram': return <Instagram size={16} className="text-secondary" />;
      case 'facebook':  return <Facebook size={16} className="text-secondary" />;
      default:          return <Link size={16} />;
    }
  };

  // ── Upcoming Queue — sorted soonest-first ──────────────────────────────────
  const upcomingPosts = posts
    .filter(p => p.status === 'scheduled')
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
    .slice(0, 5);

  return (
    <div className="content-container-tight">
      {/* Header */}
      <div className="flex align-center justify-between">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back. Here is an overview of your social networks.</p>
        </div>
        <button onClick={() => setActiveTab('scheduler')} className="btn btn-primary">
          <Plus size={16} />
          Create Post
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid-cols-4">
        <div className="stat-card">
          <div className="flex align-center justify-between">
            <span className="stat-label">Scheduled Posts</span>
            <Calendar size={16} className="text-muted" />
          </div>
          <span className="stat-value">{totalScheduled}</span>
          <span className={`stat-trend ${totalScheduled > 0 ? 'up' : ''}`}>
            <TrendingUp size={12} />
            {scheduledQueueLabel}
          </span>
        </div>

        <div className="stat-card">
          <div className="flex align-center justify-between">
            <span className="stat-label">Published Posts</span>
            <CheckCircle size={16} className="text-muted" />
          </div>
          <span className="stat-value">{totalPublished}</span>
          <span className={`stat-trend ${publishedTrendUp ? 'up' : 'down'}`}>
            <TrendingUp size={12} />
            {publishedGrowthLabel}
          </span>
        </div>

        <div className="stat-card">
          <div className="flex align-center justify-between">
            <span className="stat-label">Active Channels</span>
            <Link size={16} className="text-muted" />
          </div>
          <span className="stat-value">
            {activeChannels} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/ {channels.length}</span>
          </span>
          <span className="stat-trend" style={{ color: 'var(--text-secondary)' }}>
            Connected networks
          </span>
        </div>

        <div className="stat-card">
          <div className="flex align-center justify-between">
            <span className="stat-label">Total Reach</span>
            <Users size={16} className="text-muted" />
          </div>
          <span className="stat-value">{formatReach(totalReach)}</span>
          <span className="stat-trend up">
            <ArrowUpRight size={12} />
            {reachLabel}
          </span>
        </div>
      </div>

      {/* Charts & Channels */}
      <div className="grid-cols-3" style={{ gridTemplateColumns: '2fr 1fr' }}>
        {/* Dynamic Impressions Chart */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-title">Audience Impressions</span>
              <p className="panel-description">Posts published vs scheduled — last 7 days</p>
            </div>
            <div className="badge badge-success">Live</div>
          </div>
          <div className="panel-body p-0" style={{ minHeight: '260px', paddingTop: '12px', paddingBottom: '12px' }}>
            <ImpressionsChart posts={posts} />
          </div>
        </div>

        {/* Channels Quick-Check */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-title">Channels</span>
              <p className="panel-description">Quick status check</p>
            </div>
            <button
              onClick={() => setActiveTab('channels')}
              className="btn btn-secondary btn-icon"
              style={{ width: '24px', height: '24px', borderRadius: '4px' }}
            >
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="panel-body flex flex-col gap-12" style={{ padding: '12px 16px' }}>
            {channels.map((ch) => (
              <div
                key={ch.id}
                className="flex align-center justify-between"
                style={{
                  padding: '8px 0',
                  borderBottom: '1px solid var(--border-color)',
                  opacity: ch.connected ? 1 : 0.55
                }}
              >
                <div className="flex align-center gap-8">
                  {getChannelIcon(ch.type)}
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '13px' }}>{ch.name}</div>
                    {ch.connected && ch.followers > 0 && (
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {ch.followers.toLocaleString()} followers
                      </div>
                    )}
                  </div>
                </div>
                {ch.connected ? (
                  <span className="badge badge-success" style={{ fontSize: '10px' }}>Active</span>
                ) : (
                  <span className="badge badge-default" style={{ fontSize: '10px' }}>Offline</span>
                )}
              </div>
            ))}
          </div>

          <div className="panel-footer" style={{ padding: '8px 16px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Configure networks in Channels tab
            </span>
          </div>
        </div>
      </div>

      {/* Upcoming Queue */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <span className="panel-title">Upcoming Queue</span>
            <p className="panel-description">
              {upcomingPosts.length > 0
                ? `Next ${upcomingPosts.length} scheduled publication${upcomingPosts.length > 1 ? 's' : ''} — sorted soonest first`
                : 'Your next scheduled publications'}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('queue')}
            className="btn btn-secondary"
            style={{ height: '26px', fontSize: '11px', padding: '0 10px' }}
          >
            View All
          </button>
        </div>

        <div className="panel-body p-0">
          {upcomingPosts.length === 0 ? (
            <div style={{
              padding: '40px 24px',
              textAlign: 'center',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'
            }}>
              <Calendar size={28} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
              <span style={{ fontWeight: 500, color: 'var(--text-main)', fontSize: '13px' }}>No posts scheduled</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Create your first post to see it here.
              </span>
              <button
                onClick={() => setActiveTab('scheduler')}
                className="btn btn-primary"
                style={{ marginTop: '4px', height: '28px', fontSize: '12px' }}
              >
                <Plus size={13} /> Create Post
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '36px' }}></th>
                    <th>Post Content</th>
                    <th>Platforms</th>
                    <th>Scheduled For</th>
                    <th>Due</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingPosts.map((post) => {
                    const isDueSoon = new Date(post.scheduled_at) - now < 3600000 * 2; // within 2 hours
                    return (
                      <tr key={post.id}>
                        {/* Thumbnail or placeholder */}
                        <td style={{ padding: '8px 8px 8px 12px' }}>
                          {post.media_url ? (
                            <img
                              src={post.media_url}
                              alt=""
                              style={{
                                width: '28px', height: '28px',
                                borderRadius: '4px', objectFit: 'cover',
                                border: '1px solid var(--border-color)',
                                display: 'block'
                              }}
                            />
                          ) : (
                            <div style={{
                              width: '28px', height: '28px', borderRadius: '4px',
                              backgroundColor: 'var(--bg-base)',
                              border: '1px solid var(--border-color)',
                              display: 'grid', placeContent: 'center'
                            }}>
                              <ImageIcon size={12} style={{ color: 'var(--text-muted)' }} />
                            </div>
                          )}
                        </td>

                        {/* Content */}
                        <td>
                          <div
                            className="text-truncate"
                            style={{ maxWidth: '380px', fontSize: '13px' }}
                            title={post.content}
                          >
                            {post.content || (
                              <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Media only</span>
                            )}
                          </div>
                        </td>

                        {/* Platforms */}
                        <td>
                          <div className="flex gap-4">
                            {post.platforms.map(plat => (
                              <span
                                key={plat}
                                className="badge badge-default"
                                style={{ fontSize: '10px', padding: '1px 5px', textTransform: 'capitalize' }}
                              >
                                {plat}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Absolute datetime */}
                        <td>
                          <code style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            {new Date(post.scheduled_at).toLocaleString(undefined, {
                              month: 'short', day: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </code>
                        </td>

                        {/* Relative "due in" time */}
                        <td>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            fontSize: '11px', fontWeight: 500,
                            color: isDueSoon ? 'var(--warning)' : 'var(--text-secondary)',
                          }}>
                            <Clock size={10} />
                            {relativeTime(post.scheduled_at)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
