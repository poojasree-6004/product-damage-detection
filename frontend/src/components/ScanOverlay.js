import React from 'react';
import { motion } from 'framer-motion';
import './ScanOverlay.css';

export default function ScanOverlay() {
  return (
    <motion.div
      className="scan-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Scanline beam */}
      <motion.div
        className="scan-beam"
        initial={{ top: '0%' }}
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
      />

      {/* Grid overlay */}
      <div className="scan-grid" />

      {/* Corner crosshairs */}
      <div className="scan-corner tl" />
      <div className="scan-corner tr" />
      <div className="scan-corner bl" />
      <div className="scan-corner br" />

      {/* Center reticle */}
      <div className="scan-reticle">
        <motion.div
          className="reticle-ring outer"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="reticle-ring inner"
          animate={{ rotate: -360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
        />
        <div className="reticle-dot" />
      </div>

      {/* Status text */}
      <div className="scan-status-text">
        <motion.span
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          SCANNING IN PROGRESS
        </motion.span>
      </div>

      {/* Fake data readout */}
      <div className="scan-readout">
        {['RGB CHAN: ACTIVE', 'EDGE DETECT: ON', 'DEFECT ALGO: RUNNING', 'CONV LAYER: 32x32'].map((t, i) => (
          <motion.div
            key={t}
            className="readout-line"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
          >
            {t}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
