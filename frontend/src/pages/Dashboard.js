import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { predictDamage } from '../services/api';
import { generateInspectionReport } from '../services/reportGenerator';
import Sidebar from '../components/Sidebar';
import UploadPanel from '../components/UploadPanel';
import AnalysisResult from '../components/AnalysisResult';
import ScanOverlay from '../components/ScanOverlay';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [status, setStatus] = useState('SYSTEM READY');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  // Heatmap toggle — shown only when a heatmap exists in the result
  const [showHeatmap, setShowHeatmap] = useState(false);
  // Natural image dimensions captured after the <img> loads
  const [imgNaturalDim, setImgNaturalDim] = useState({ width: 640, height: 480 });
  const analysisRef = useRef(null);

  const handleFileSelect = useCallback((file) => {
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    setResult(null);
    setError(null);
    setShowHeatmap(false);
    setStatus('IMAGE LOADED — READY TO SCAN');
  }, []);

  const handleAnalyze = async () => {
    if (!imageFile) return;
    setIsScanning(true);
    setStatus('SCANNING...');
    setError(null);
    setResult(null);
    setShowHeatmap(false);
    setUploadProgress(0);

    try {
      const data = await predictDamage(imageFile, (progressEvent) => {
        const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(pct);
      });
      setResult(data);
      setStatus('ANALYSIS COMPLETE');
      setTimeout(() => {
        analysisRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Unknown error';
      setError(`SCAN FAILED: ${msg}`);
      setStatus('ERROR — RETRY REQUIRED');
    } finally {
      setIsScanning(false);
    }
  };

  const handleReset = () => {
    setImageFile(null);
    setImageUrl(null);
    setResult(null);
    setError(null);
    setShowHeatmap(false);
    setStatus('SYSTEM READY');
    setUploadProgress(0);
  };

  const handleReport = async () => {
    if (!result) return;
    setReportLoading(true);
    try {
      await generateInspectionReport(result, imageFile);
    } catch (e) {
      alert('Report generation failed: ' + e.message);
    } finally {
      setReportLoading(false);
    }
  };

  const statusClass = {
    'SYSTEM READY': 'status-ready',
    'IMAGE LOADED — READY TO SCAN': 'status-loaded',
    'SCANNING...': 'status-scanning',
    'ANALYSIS COMPLETE': 'status-done',
  }[status] || (status.startsWith('ERROR') ? 'status-error' : 'status-ready');

  // bounding_box is null when no defect, array [x,y,w,h] when defect found
  const hasBoundingBox = result && Array.isArray(result.bounding_box) && result.bounding_box.length === 4;
  const hasHeatmap = result && result.heatmap && result.heatmap.length > 0;

  return (
    <div className="dashboard blueprint-bg">
      {/* Top system bar */}
      <div className="dash-topbar">
        <div className="dash-topbar-left">
          <button className="back-btn" onClick={() => navigate('/')}>
            &#8592; MAIN MENU
          </button>
          <div className="dash-topbar-logo">IDDS CONTROL PANEL</div>
        </div>
        <div className={`system-status-indicator ${statusClass}`}>
          <span className="pulse-dot" />
          <span className="status-text">{status}</span>
        </div>
        <div className="dash-topbar-right">
          <span className="topbar-tag-small">NODE: LOCAL</span>
          <span className="topbar-tag-small">GPU: ENABLED</span>
        </div>
      </div>

      <div className="dashboard-body">
        <Sidebar result={result} />

        <div className="main-panel">
          {/* 01 — Image input */}
          <motion.div
            className="section-block"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="section-header">
              <span className="section-header-tag">01</span>
              <span className="section-header-title">IMAGE INPUT MODULE</span>
              <div className="section-header-line" />
            </div>

            <div className="upload-and-preview">
              <UploadPanel
                imageUrl={imageUrl}
                onFileSelect={handleFileSelect}
                isScanning={isScanning}
              />

              {imageUrl && (
                <div className="preview-block">
                  <div className="preview-label-row">
                    <span className="preview-label">LIVE PREVIEW SCREEN</span>
                    {hasHeatmap && (
                      <motion.button
                        className={`heatmap-toggle-btn ${showHeatmap ? 'heatmap-toggle-active' : ''}`}
                        onClick={() => setShowHeatmap(v => !v)}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                      >
                        {showHeatmap ? 'HIDE HEATMAP' : 'TOGGLE HEATMAP'}
                      </motion.button>
                    )}
                  </div>

                  <div className="preview-frame">
                    <div className="corner-tl" /><div className="corner-tr" />
                    <div className="corner-bl" /><div className="corner-br" />

                    {/* Base image */}
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="preview-img"
                      onLoad={(e) => setImgNaturalDim({
                        width: e.target.naturalWidth,
                        height: e.target.naturalHeight,
                      })}
                    />

                    {/* Heatmap overlay */}
                    <AnimatePresence>
                      {showHeatmap && hasHeatmap && (
                        <motion.img
                          key="heatmap"
                          src={`data:image/png;base64,${result.heatmap}`}
                          alt="Heatmap"
                          className="heatmap-overlay"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.55 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.35 }}
                        />
                      )}
                    </AnimatePresence>

                    {/* Scan animation */}
                    <AnimatePresence>
                      {isScanning && <ScanOverlay />}
                    </AnimatePresence>

                    {/* Bounding box — only when bounding_box is non-null */}
                    {!isScanning && hasBoundingBox && result.prediction === 'Damaged' && (
                      <BoundingBoxOverlay
                        bb={result.bounding_box}
                        imgNaturalDim={imgNaturalDim}
                      />
                    )}
                  </div>

                  {isScanning && (
                    <div className="upload-progress-bar">
                      <div className="progress-bar-track" style={{ flex: 1 }}>
                        <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }} />
                      </div>
                      <span className="progress-label">TRANSMITTING {uploadProgress}%</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* 02 — Controls */}
          <motion.div
            className="section-block controls-block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="section-header">
              <span className="section-header-tag">02</span>
              <span className="section-header-title">CONTROL INTERFACE</span>
              <div className="section-header-line" />
            </div>

            <div className="control-buttons">
              <motion.button
                className="btn-industrial btn-primary ctrl-btn"
                onClick={handleAnalyze}
                disabled={!imageFile || isScanning}
                whileHover={{ scale: !imageFile || isScanning ? 1 : 1.03 }}
                whileTap={{ scale: !imageFile || isScanning ? 1 : 0.97 }}
              >
                {isScanning ? (
                  <><span className="spin-icon">&#9679;</span> SCANNING...</>
                ) : (
                  <><span>&#9654;</span> START SCAN</>
                )}
              </motion.button>

              <motion.button
                className="btn-industrial btn-danger ctrl-btn"
                onClick={handleReset}
                disabled={isScanning}
                whileHover={{ scale: isScanning ? 1 : 1.03 }}
                whileTap={{ scale: isScanning ? 1 : 0.97 }}
              >
                <span>&#9632;</span> RESET SYSTEM
              </motion.button>

              <motion.button
                className="btn-industrial btn-success ctrl-btn"
                onClick={handleReport}
                disabled={!result || isScanning || reportLoading}
                whileHover={{ scale: !result || isScanning ? 1 : 1.03 }}
                whileTap={{ scale: !result || isScanning ? 1 : 0.97 }}
              >
                {reportLoading ? 'GENERATING...' : <><span>&#8659;</span> GENERATE REPORT</>}
              </motion.button>
            </div>

            {error && (
              <motion.div
                className="error-banner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span className="error-icon">&#9888;</span>
                {error}
              </motion.div>
            )}
          </motion.div>

          {/* 03 — Analysis output */}
          <div ref={analysisRef}>
            <AnimatePresence>
              {result && (
                <motion.div
                  className="section-block"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="section-header">
                    <span className="section-header-tag">03</span>
                    <span className="section-header-title">ANALYSIS OUTPUT</span>
                    <div className="section-header-line" />
                  </div>
                  <AnalysisResult result={result} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * BoundingBoxOverlay
 * Positions the red defect rectangle relative to the rendered <img> dimensions.
 * bb = [x, y, w, h] in original image pixel coordinates.
 * imgNaturalDim = natural pixel size of the source image.
 */
function BoundingBoxOverlay({ bb, imgNaturalDim }) {
  if (!bb || bb.length !== 4) return null;
  const iw = imgNaturalDim?.width || 640;
  const ih = imgNaturalDim?.height || 480;

  const left   = `${(bb[0] / iw) * 100}%`;
  const top    = `${(bb[1] / ih) * 100}%`;
  const width  = `${(bb[2] / iw) * 100}%`;
  const height = `${(bb[3] / ih) * 100}%`;

  return (
    <motion.div
      className="bounding-box"
      style={{ left, top, width, height }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <span className="bb-label">DEFECT ZONE</span>
    </motion.div>
  );
}
