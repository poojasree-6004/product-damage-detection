import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './Sidebar.css';

const NAV_ITEMS = [
  { id: 'upload', label: 'INPUT', icon: '⬆', desc: 'Image Upload' },
  { id: 'scan', label: 'SCAN', icon: '◉', desc: 'Run Analysis' },
  { id: 'result', label: 'OUTPUT', icon: '◈', desc: 'View Results' },
  { id: 'report', label: 'REPORT', icon: '☰', desc: 'PDF Export' },
];

export default function Sidebar({ result }) {
  const [time, setTime] = useState(new Date());
  const [activeNav, setActiveNav] = useState('upload');

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (result) setActiveNav('result');
  }, [result]);

  const formatTime = (d) =>
    d.toTimeString().slice(0, 8);
  const formatDate = (d) =>
    d.toISOString().slice(0, 10);

  const systemMetrics = [
    { label: 'CPU LOAD', value: '24%', color: 'var(--neon-green)' },
    { label: 'GPU VRAM', value: '2.1 GB', color: 'var(--neon-blue)' },
    { label: 'INFERENCE', value: '12 ms', color: 'var(--neon-blue)' },
    { label: 'MODEL ACC', value: '94.3%', color: 'var(--neon-green)' },
  ];

  return (
    <aside className="sidebar">
      {/* System clock */}
      <div className="sidebar-clock">
        <div className="clock-time">{formatTime(time)}</div>
        <div className="clock-date">{formatDate(time)}</div>
      </div>

      <div className="sidebar-divider" />

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item, i) => (
          <motion.div
            key={item.id}
            className={`nav-item ${activeNav === item.id ? 'nav-active' : ''}`}
            onClick={() => setActiveNav(item.id)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ x: 4 }}
          >
            <span className="nav-icon">{item.icon}</span>
            <div className="nav-text">
              <span className="nav-label">{item.label}</span>
              <span className="nav-desc">{item.desc}</span>
            </div>
            {activeNav === item.id && <div className="nav-active-bar" />}
          </motion.div>
        ))}
      </nav>

      <div className="sidebar-divider" />

      {/* System metrics */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">SYSTEM METRICS</div>
        {systemMetrics.map((m) => (
          <div key={m.label} className="sidebar-metric">
            <span className="sidebar-metric-label">{m.label}</span>
            <span className="sidebar-metric-value" style={{ color: m.color }}>{m.value}</span>
          </div>
        ))}
      </div>

      <div className="sidebar-divider" />

      {/* Scan history badge */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">LAST SCAN</div>
        {result ? (
          <div className="last-scan-card">
            <div className={`last-scan-status ${result.prediction === 'Damaged' ? 'scan-damaged' : 'scan-ok'}`}>
              {result.prediction === 'Damaged' ? 'DAMAGED' : 'SAFE'}
            </div>
            <div className="last-scan-meta">
              <span>CONF: {typeof result.confidence === 'number' ? result.confidence.toFixed(1) : '0.0'}%</span>
              <span>SEV: {result.severity}</span>
            </div>
            <div className="last-scan-id">{result.scan_id}</div>
          </div>
        ) : (
          <div className="no-scan-text">NO RECENT SCAN</div>
        )}
      </div>

      {/* Bottom nodes indicator */}
      <div className="sidebar-bottom">
        <div className="node-row">
          <span className="node-dot green" />
          <span className="node-label">AI ENGINE</span>
          <span className="node-status">ONLINE</span>
        </div>
        <div className="node-row">
          <span className="node-dot blue" />
          <span className="node-label">API SERVER</span>
          <span className="node-status">ACTIVE</span>
        </div>
        <div className="node-row">
          <span className="node-dot green" />
          <span className="node-label">DATABASE</span>
          <span className="node-status">READY</span>
        </div>
      </div>
    </aside>
  );
}
