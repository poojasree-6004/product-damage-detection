import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './LandingPage.css';

const BOOT_LINES = [
  'BIOS v4.2.1 ... OK',
  'Initializing neural core processors ...',
  'Loading damage detection model weights ...',
  'Calibrating optical scan array ...',
  'Connecting to inference engine ...',
  'Validating system integrity checks ...',
  'Mounting image processing pipeline ...',
  'System health: ALL MODULES NOMINAL',
  'READY FOR OPERATION',
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [bootLines, setBootLines] = useState([]);
  const [bootDone, setBootDone] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < BOOT_LINES.length) {
        setBootLines(prev => [...prev, BOOT_LINES[i]]);
        setProgress(Math.round(((i + 1) / BOOT_LINES.length) * 100));
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setBootDone(true), 500);
      }
    }, 320);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="landing blueprint-bg">
      {/* Animated corner accents */}
      <div className="landing-corner tl" />
      <div className="landing-corner tr" />
      <div className="landing-corner bl" />
      <div className="landing-corner br" />

      {/* Top status bar */}
      <div className="landing-topbar">
        <div className="topbar-left">
          <span className="topbar-tag">SYS</span>
          <span className="topbar-dot" style={{ background: bootDone ? 'var(--neon-green)' : 'var(--neon-orange)' }} />
          <span className="topbar-status">{bootDone ? 'SYSTEM READY' : 'INITIALIZING'}</span>
        </div>
        <div className="topbar-center">IDDS — INDUSTRIAL DAMAGE DETECTION SYSTEM</div>
        <div className="topbar-right">
          <span className="topbar-tag">VER 1.0.0</span>
        </div>
      </div>

      <div className="landing-content">
        {/* Left: Gear / visual panel */}
        <motion.div
          className="landing-visual"
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="gear-container">
            <svg className="gear gear-large" viewBox="0 0 100 100">
              <path d="M50 15 L54 5 L58 15 L68 12 L65 22 L75 25 L68 33 L78 38 L68 43 L75 53 L65 54 L65 64 L55 62 L54 73 L50 65 L46 73 L45 62 L35 64 L35 54 L25 53 L32 43 L22 38 L32 33 L25 25 L35 22 L32 12 L42 15 Z" fill="none" stroke="var(--border-accent)" strokeWidth="1.5"/>
              <circle cx="50" cy="50" r="12" fill="none" stroke="var(--neon-blue)" strokeWidth="1.5"/>
              <circle cx="50" cy="50" r="4" fill="var(--neon-blue)" opacity="0.6"/>
            </svg>
            <svg className="gear gear-small" viewBox="0 0 100 100">
              <path d="M50 20 L53 12 L56 20 L64 17 L62 25 L70 28 L64 34 L72 38 L64 42 L70 48 L62 49 L62 57 L55 55 L54 64 L50 57 L46 64 L45 55 L38 57 L38 49 L30 48 L36 42 L28 38 L36 34 L30 28 L38 25 L36 17 Z" fill="none" stroke="var(--border-steel)" strokeWidth="1"/>
              <circle cx="50" cy="50" r="8" fill="none" stroke="var(--neon-blue-dim)" strokeWidth="1"/>
            </svg>

            <div className="scan-ring-outer" />
            <div className="scan-ring-inner" />
            <div className="center-eye">
              <div className="eye-dot" />
            </div>
          </div>

          <div className="visual-metrics">
            {['OPTICS', 'NEURAL', 'THERMAL', 'LASER'].map((m, i) => (
              <div key={m} className="metric-row">
                <span className="metric-name">{m}</span>
                <div className="metric-bar-track">
                  <motion.div
                    className="metric-bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: bootDone ? `${[95, 88, 92, 97][i]}%` : '0%' }}
                    transition={{ duration: 1, delay: 0.5 + i * 0.15 }}
                  />
                </div>
                <span className="metric-val">{[95, 88, 92, 97][i]}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right: boot console + CTA */}
        <motion.div
          className="landing-main"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="landing-title-block">
            <div className="landing-subtitle-top">AI-POWERED QUALITY CONTROL ENGINE</div>
            <h1 className="landing-title">
              Industrial<br />
              <span className="title-accent">Damage Detection</span><br />
              System
            </h1>
            <div className="landing-divider" />
            <p className="landing-desc">
              Real-time structural defect identification using deep learning inference.
              Designed for manufacturing, logistics, and industrial quality assurance workflows.
            </p>
          </div>

          {/* Boot console */}
          <div className="boot-console">
            <div className="console-header">
              <span className="console-dot" style={{ background: '#ff5f56' }} />
              <span className="console-dot" style={{ background: '#ffbd2e' }} />
              <span className="console-dot" style={{ background: '#27c93f' }} />
              <span className="console-title">SYSTEM BOOT LOG</span>
            </div>
            <div className="console-body">
              {bootLines.map((line, i) => (
                <motion.div
                  key={i}
                  className="console-line"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="console-prompt">&gt;</span>
                  <span className={i === bootLines.length - 1 && bootDone ? 'line-done' : ''}>{line}</span>
                  {i === bootLines.length - 1 && !bootDone && <span className="blink"> _</span>}
                </motion.div>
              ))}
            </div>
            <div className="console-progress">
              <div className="progress-bar-track" style={{ flex: 1 }}>
                <motion.div
                  className="progress-bar-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="progress-pct">{progress}%</span>
            </div>
          </div>

          {/* CTA */}
          <AnimatePresence>
            {bootDone && (
              <motion.div
                className="cta-block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.button
                  className="btn-enter"
                  onClick={() => navigate('/dashboard')}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="btn-enter-icon">&#9654;</span>
                  ENTER CONTROL PANEL
                </motion.button>
                <div className="cta-hint">All systems nominal. Authorization confirmed.</div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Bottom bar */}
      <div className="landing-bottombar">
        <span>IDDS v1.0.0</span>
        <span>CLASSIFICATION: INDUSTRIAL USE</span>
        <span>ALL RIGHTS RESERVED</span>
      </div>
    </div>
  );
}
