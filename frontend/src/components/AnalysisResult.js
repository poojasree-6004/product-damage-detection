import React from 'react';
import { motion } from 'framer-motion';
import './AnalysisResult.css';

function SeverityBar({ severity }) {
  const levels = ['Low', 'Medium', 'High'];
  const idx = levels.indexOf(severity);
  const colors = ['var(--neon-green)', 'var(--neon-orange)', 'var(--neon-red)'];

  return (
    <div className="severity-bar-container">
      {levels.map((lv, i) => (
        <div
          key={lv}
          className={`severity-segment ${i <= idx && severity !== 'None' ? 'seg-active' : ''}`}
          style={{ '--seg-color': colors[i] }}
        >
          <div className="seg-fill" />
          <span className="seg-label">{lv}</span>
        </div>
      ))}
    </div>
  );
}

// confidence is now a percentage (0–100)
function ConfidenceArc({ confidence }) {
  const pct = Math.round(confidence);
  const fraction = Math.min(confidence / 100, 1);
  const radius = 36;
  const circ = 2 * Math.PI * radius;
  const dashOffset = circ * (1 - fraction);

  return (
    <div className="conf-arc-wrapper">
      <svg className="conf-arc-svg" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--border-steel)" strokeWidth="6" />
        <motion.circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke="var(--neon-blue)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
            filter: 'drop-shadow(0 0 4px var(--neon-blue))',
          }}
        />
        <text x="50" y="46" textAnchor="middle" fill="var(--neon-blue)" fontSize="16" fontFamily="Share Tech Mono">
          {pct}
        </text>
        <text x="50" y="58" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="Share Tech Mono">
          PERCENT
        </text>
      </svg>
    </div>
  );
}

const INTEGRITY_COLORS = {
  OPTIMAL: 'var(--neon-green)',
  STABLE: 'var(--neon-green)',
  DEGRADED: 'var(--neon-orange)',
  COMPROMISED: 'var(--neon-orange)',
  CRITICAL: 'var(--neon-red)',
};
const RISK_COLORS = {
  MINIMAL: 'var(--neon-green)',
  LOW: 'var(--neon-green)',
  ELEVATED: 'var(--neon-orange)',
  HIGH: 'var(--neon-red)',
  CRITICAL: 'var(--neon-red)',
};

// confidence arrives as percentage (0–100)
export default function AnalysisResult({ result }) {
  const isDamaged = result.prediction === 'Damaged';
  const confidencePct = typeof result.confidence === 'number' ? result.confidence : 0;

  return (
    <div className="analysis-result">
      {/* Main verdict banner */}
      <motion.div
        className={`verdict-banner ${isDamaged ? 'verdict-damaged' : 'verdict-safe'}`}
        initial={{ opacity: 0, scaleX: 0.8 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="verdict-left">
          <div className="verdict-icon">{isDamaged ? '▲' : '✓'}</div>
          <div>
            <div className="verdict-title">
              STATUS: {isDamaged ? 'DEFECT DETECTED' : 'NO DEFECT'}
            </div>
            <div className="verdict-sub">
              {isDamaged
                ? `${result.damage_type} — Requires immediate inspection`
                : 'Product integrity confirmed — Safe to proceed'}
            </div>
          </div>
        </div>
        <div className="verdict-scan-id">
          <div className="data-label">SCAN ID</div>
          <div className="data-value">{result.scan_id}</div>
        </div>
      </motion.div>

      {/* Metrics grid */}
      <div className="result-grid">
        {/* Card 1: Confidence */}
        <motion.div
          className="result-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="result-card-header">CONFIDENCE LEVEL</div>
          <ConfidenceArc confidence={confidencePct} />
          <div className="result-card-sub">{confidencePct.toFixed(2)}% CERTAINTY</div>
        </motion.div>

        {/* Card 2: Severity */}
        <motion.div
          className="result-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="result-card-header">DAMAGE SEVERITY</div>
          <div className="severity-display">
            <div
              className="severity-value"
              style={{
                color:
                  result.severity === 'High'
                    ? 'var(--neon-red)'
                    : result.severity === 'Medium'
                    ? 'var(--neon-orange)'
                    : 'var(--neon-green)',
              }}
            >
              {result.severity?.toUpperCase() || 'NONE'}
            </div>
          </div>
          <SeverityBar severity={result.severity} />
        </motion.div>

        {/* Card 3: Structural integrity */}
        <motion.div
          className="result-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="result-card-header">STRUCTURAL INTEGRITY</div>
          <div className="integrity-display">
            <motion.div
              className="integrity-value"
              style={{ color: INTEGRITY_COLORS[result.structural_integrity] || 'white' }}
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {result.structural_integrity}
            </motion.div>
          </div>
          <div className="result-card-sub" style={{ color: RISK_COLORS[result.risk_level] }}>
            RISK: {result.risk_level}
          </div>
        </motion.div>

        {/* Card 4: Defect intelligence */}
        <motion.div
          className="result-card result-card-wide"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="result-card-header">DEFECT INTELLIGENCE</div>
          <div className="defect-details-grid">
            <div className="defect-field">
              <span className="data-label">DEFECT CLASS</span>
              <span className="data-value defect-val">{result.damage_type || 'N/A'}</span>
            </div>
            <div className="defect-field">
              <span className="data-label">PREDICTION</span>
              <span
                className="data-value"
                style={{ color: isDamaged ? 'var(--neon-red)' : 'var(--neon-green)' }}
              >
                {result.prediction?.toUpperCase()}
              </span>
            </div>
            <div className="defect-field">
              <span className="data-label">BOUNDING BOX</span>
              <span className="data-value bb-val">
                {result.bounding_box ? `[${result.bounding_box.join(', ')}]` : 'N/A'}
              </span>
            </div>
            <div className="defect-field">
              <span className="data-label">TIMESTAMP</span>
              <span className="data-value ts-val">
                {result.timestamp ? new Date(result.timestamp).toLocaleString() : 'N/A'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Machine output log */}
      <motion.div
        className="machine-log"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="machine-log-header">
          <span className="pulse-dot" style={{ background: 'var(--neon-green)' }} />
          SYSTEM OUTPUT LOG
        </div>
        <div className="machine-log-body">
          {[
            `[INFO] Inference engine completed scan — ID: ${result.scan_id}`,
            `[RESULT] Prediction: ${result.prediction} | Confidence: ${confidencePct.toFixed(2)}%`,
            `[RESULT] Severity index: ${result.severity} | Risk level: ${result.risk_level}`,
            `[RESULT] Structural integrity: ${result.structural_integrity}`,
            isDamaged
              ? `[ALERT] Defect class "${result.damage_type}" detected at zone [${result.bounding_box?.join(', ') ?? 'N/A'}]`
              : `[PASS] No structural defects identified. Unit cleared for next stage.`,
          ].map((line, i) => (
            <motion.div
              key={i}
              className="log-line"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.08 }}
            >
              <span
                className={`log-prefix ${
                  line.startsWith('[ALERT]')
                    ? 'log-alert'
                    : line.startsWith('[PASS]')
                    ? 'log-pass'
                    : ''
                }`}
              >
                {line.startsWith('[ALERT]') ? '!' : '>'}
              </span>
              {line}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
