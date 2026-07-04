import React, { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import './UploadPanel.css';

const ACCEPTED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/bmp'];

export default function UploadPanel({ imageUrl, onFileSelect, isScanning }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);

  const handleFile = useCallback((file) => {
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      alert('Unsupported file type. Please use JPEG, PNG, WEBP, or BMP.');
      return;
    }
    setFileInfo({ name: file.name, size: (file.size / 1024).toFixed(1) + ' KB', type: file.type });
    onFileSelect(file);
  }, [onFileSelect]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onInputChange = (e) => handleFile(e.target.files[0]);

  return (
    <div className="upload-panel-wrapper">
      <motion.div
        className={`upload-zone ${dragging ? 'upload-dragging' : ''} ${imageUrl ? 'upload-loaded' : ''} ${isScanning ? 'upload-scanning' : ''}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => !isScanning && inputRef.current?.click()}
        whileHover={!isScanning ? { borderColor: 'rgba(0,212,255,0.5)' } : {}}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(',')}
          onChange={onInputChange}
          style={{ display: 'none' }}
          disabled={isScanning}
        />

        {!imageUrl ? (
          <div className="upload-empty">
            <div className="upload-icon-ring">
              <div className="upload-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
              </div>
            </div>
            <div className="upload-title">DROP IMAGE HERE</div>
            <div className="upload-subtitle">or click to open file browser</div>
            <div className="upload-formats">SUPPORTED: JPEG / PNG / WEBP / BMP</div>
          </div>
        ) : (
          <div className="upload-loaded-state">
            <div className="upload-check">&#10003;</div>
            <div className="upload-file-name">{fileInfo?.name}</div>
            <div className="upload-file-meta">{fileInfo?.size} &bull; {fileInfo?.type}</div>
            <div className="upload-replace">Click to replace</div>
          </div>
        )}

        {dragging && (
          <div className="drop-overlay">
            <div className="drop-text">RELEASE TO LOAD</div>
          </div>
        )}
      </motion.div>

      {/* Crosshair decorations */}
      <div className="crosshair tl" />
      <div className="crosshair tr" />
      <div className="crosshair bl" />
      <div className="crosshair br" />
    </div>
  );
}
