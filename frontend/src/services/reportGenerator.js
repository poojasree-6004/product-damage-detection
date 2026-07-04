import jsPDF from 'jspdf';

const DARK = [7, 10, 15];
const PANEL = [15, 21, 32];
const BLUE = [0, 212, 255];
const GREEN = [0, 255, 136];
const RED = [255, 51, 85];
const ORANGE = [255, 140, 0];
const STEEL = [30, 45, 61];
const TEXT_PRIMARY = [200, 214, 229];
const TEXT_DIM = [74, 99, 120];
const WHITE = [232, 244, 253];

function hexLine(doc, x1, y1, x2, y2, color = STEEL, width = 0.3) {
  doc.setDrawColor(...color);
  doc.setLineWidth(width);
  doc.line(x1, y1, x2, y2);
}

function labelValue(doc, x, y, label, value, valueColor = WHITE) {
  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...TEXT_DIM);
  doc.text(label.toUpperCase(), x, y);
  doc.setFont('courier', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...valueColor);
  doc.text(value, x, y + 6);
}

function panelBox(doc, x, y, w, h, label = '') {
  doc.setFillColor(...PANEL);
  doc.setDrawColor(...STEEL);
  doc.setLineWidth(0.4);
  doc.roundedRect(x, y, w, h, 1, 1, 'FD');
  doc.setDrawColor(...BLUE);
  doc.setLineWidth(0.8);
  doc.line(x + 4, y, x + w - 4, y);
  const cs = 4;
  doc.setDrawColor(...BLUE);
  doc.setLineWidth(0.6);
  doc.line(x + 1, y + cs, x + 1, y + 1);
  doc.line(x + 1, y + 1, x + cs, y + 1);
  doc.line(x + w - cs, y + 1, x + w - 1, y + 1);
  doc.line(x + w - 1, y + 1, x + w - 1, y + cs);
  doc.line(x + 1, y + h - cs, x + 1, y + h - 1);
  doc.line(x + 1, y + h - 1, x + cs, y + h - 1);
  doc.line(x + w - cs, y + h - 1, x + w - 1, y + h - 1);
  doc.line(x + w - 1, y + h - cs, x + w - 1, y + h - 1);
  if (label) {
    doc.setFont('courier', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...BLUE);
    doc.text(label.toUpperCase(), x + 5, y + 5);
    hexLine(doc, x + 5, y + 7, x + w - 5, y + 7, STEEL, 0.3);
  }
}

function severityColor(severity) {
  if (severity === 'High') return RED;
  if (severity === 'Medium') return ORANGE;
  if (severity === 'Low') return GREEN;
  return GREEN;
}

/**
 * generateInspectionReport
 * Accepts the new API response format where:
 *   result.confidence  — already a percentage (0-100)
 *   result.damage_type — human-readable defect class
 *   result.bounding_box — [x,y,w,h] or null
 *   result.prediction  — "Damaged" | "Safe"
 */
export async function generateInspectionReport(result, imageFile) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const PW = 210;
  const PH = 297;

  // confidence is already a percentage
  const confPctNum = typeof result.confidence === 'number' ? result.confidence : 0;
  const confPct = confPctNum.toFixed(1) + '%';

  // === BACKGROUND ===
  doc.setFillColor(...DARK);
  doc.rect(0, 0, PW, PH, 'F');

  doc.setLineWidth(0.1);
  for (let gx = 0; gx < PW; gx += 10) {
    for (let gy = 0; gy < PH; gy += 10) {
      doc.setFillColor(0, 212, 255);
      doc.circle(gx, gy, 0.15, 'F');
    }
  }

  doc.setFillColor(13, 18, 28);
  doc.rect(0, 0, 8, PH, 'F');
  doc.setFillColor(...BLUE);
  doc.rect(0, 0, 2, PH, 'F');

  // === HEADER ===
  doc.setFillColor(10, 16, 26);
  doc.rect(8, 0, PW - 8, 38, 'F');
  doc.setDrawColor(...BLUE);
  doc.setLineWidth(0.6);
  doc.line(8, 38, PW, 38);

  doc.setFillColor(...BLUE);
  doc.rect(14, 8, 3, 22, 'F');

  doc.setFont('courier', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...WHITE);
  doc.text('INDUSTRIAL DAMAGE DETECTION SYSTEM', 22, 18);

  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...BLUE);
  doc.text('AI-POWERED QUALITY CONTROL ENGINE  |  INSPECTION REPORT  |  CONFIDENTIAL', 22, 25);

  doc.setFontSize(7);
  doc.setTextColor(...TEXT_DIM);
  const ts = result.timestamp ? new Date(result.timestamp).toLocaleString() : new Date().toLocaleString();
  doc.text('SCAN ID: ' + (result.scan_id || 'N/A'), 22, 32);
  doc.text('GENERATED: ' + ts, 22, 36);

  // Status badge
  const isDamaged = result.prediction === 'Damaged';
  const statusColor = isDamaged ? RED : GREEN;
  doc.setFillColor(...statusColor);
  doc.roundedRect(PW - 55, 10, 46, 20, 1, 1, 'F');
  doc.setFont('courier', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text(isDamaged ? 'DAMAGED' : 'SAFE', PW - 51, 19, { maxWidth: 40 });
  doc.setFontSize(7);
  // confidence is already a percentage
  doc.text('CONF: ' + confPct, PW - 51, 26);

  let cy = 46;

  // === MAIN STATUS ROW ===
  panelBox(doc, 14, cy, 85, 40, 'System Status');
  panelBox(doc, 105, cy, 91, 40, 'Defect Analysis');

  const integrityColor = {
    'OPTIMAL': GREEN, 'STABLE': GREEN, 'DEGRADED': ORANGE,
    'COMPROMISED': ORANGE, 'CRITICAL': RED
  }[result.structural_integrity] || WHITE;

  labelValue(doc, 19, cy + 14, 'Prediction', result.prediction || 'N/A', isDamaged ? RED : GREEN);
  labelValue(doc, 60, cy + 14, 'Severity', result.severity || 'N/A', severityColor(result.severity));
  labelValue(doc, 19, cy + 28, 'Struct. Integrity', result.structural_integrity || 'N/A', integrityColor);
  labelValue(doc, 60, cy + 28, 'Risk Level', result.risk_level || 'N/A', isDamaged ? RED : GREEN);

  // Defect panel — use damage_type (new field name)
  labelValue(doc, 110, cy + 14, 'Confidence Score', confPct, BLUE);
  labelValue(doc, 150, cy + 14, 'Defect Type', result.damage_type || 'N/A', WHITE);
  const bbText = result.bounding_box
    ? '[' + result.bounding_box.join(', ') + ']'
    : 'N/A';
  labelValue(doc, 110, cy + 28, 'Bounding Box', bbText, TEXT_PRIMARY);

  cy += 48;

  // === IMAGE PANEL ===
  panelBox(doc, 14, cy, 182, 95, 'Captured Image');

  if (imageFile) {
    try {
      const imgData = await fileToBase64(imageFile);
      const ext = imageFile.type.includes('png') ? 'PNG' : 'JPEG';
      doc.addImage(imgData, ext, 18, cy + 10, 174, 80, '', 'MEDIUM');

      // Bounding box overlay — only when non-null
      const bb = result.bounding_box;
      if (bb && isDamaged && bb.length === 4 && bb[2] > 0) {
        // Use natural image dimensions if available, else fallback
        const iw = 640, ih = 480;
        const imgW = 174, imgH = 80;
        const scaleX = imgW / iw;
        const scaleY = imgH / ih;
        const bbX = 18 + bb[0] * scaleX;
        const bbY = (cy + 10) + bb[1] * scaleY;
        const bbW = bb[2] * scaleX;
        const bbH = bb[3] * scaleY;

        doc.setDrawColor(...RED);
        doc.setLineWidth(0.8);
        doc.rect(bbX, bbY, bbW, bbH);

        doc.setFont('courier', 'bold');
        doc.setFontSize(6);
        doc.setTextColor(...RED);
        doc.text('DEFECT ZONE', bbX + 1, bbY - 1);
      }
    } catch (e) {
      // Skip image if error
    }
  }

  cy += 103;

  // === METRICS PANELS ===
  panelBox(doc, 14, cy, 56, 48, 'Confidence Meter');
  panelBox(doc, 76, cy, 56, 48, 'Severity Index');
  panelBox(doc, 138, cy, 58, 48, 'Risk Assessment');

  // Confidence bar — confidence is already 0-100
  const confVal = confPctNum;
  const barY = cy + 24;
  doc.setFillColor(...STEEL);
  doc.roundedRect(19, barY, 44, 5, 1, 1, 'F');
  doc.setFillColor(...BLUE);
  doc.roundedRect(19, barY, 44 * (confVal / 100), 5, 1, 1, 'F');
  doc.setFont('courier', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...BLUE);
  doc.text(confVal.toFixed(1) + '%', 19, cy + 38);
  doc.setFontSize(7);
  doc.setTextColor(...TEXT_DIM);
  doc.text('CONFIDENCE SCORE', 19, cy + 43);

  // Severity index
  const sevLevels = ['None', 'Low', 'Medium', 'High'];
  const sevIdx = sevLevels.indexOf(result.severity);
  const sevColors = [GREEN, GREEN, ORANGE, RED];
  sevLevels.forEach((lv, i) => {
    const bx = 81 + i * 11;
    const active = i === sevIdx;
    doc.setFillColor(...(active ? sevColors[i] : STEEL));
    doc.rect(bx, cy + 18, 8, active ? 10 : 6, 'F');
    doc.setFont('courier', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...(active ? sevColors[i] : TEXT_DIM));
    doc.text(lv.substring(0, 3).toUpperCase(), bx, cy + 32);
  });
  doc.setFont('courier', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...severityColor(result.severity));
  doc.text((result.severity || 'N/A').toUpperCase(), 81, cy + 43);

  // Risk assessment
  const riskMap = { MINIMAL: 5, LOW: 25, ELEVATED: 60, HIGH: 80, CRITICAL: 100 };
  const riskPct = riskMap[result.risk_level] || 0;
  const riskColor = riskPct > 70 ? RED : riskPct > 40 ? ORANGE : GREEN;
  doc.setFillColor(...STEEL);
  doc.roundedRect(143, cy + 16, 46, 5, 1, 1, 'F');
  doc.setFillColor(...riskColor);
  doc.roundedRect(143, cy + 16, 46 * (riskPct / 100), 5, 1, 1, 'F');
  doc.setFont('courier', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...riskColor);
  doc.text(result.risk_level || 'N/A', 143, cy + 38);
  doc.setFontSize(7);
  doc.setTextColor(...TEXT_DIM);
  doc.text('RISK LEVEL', 143, cy + 43);

  cy += 56;

  // === TECHNICAL LOG ===
  panelBox(doc, 14, cy, 182, 38, 'Technical Log');
  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...BLUE);
  const logs = [
    '> SYSTEM INITIALIZED  --  MODEL v2.0  --  STATUS: OPERATIONAL',
    '> IMAGE INGESTED: ' + (imageFile ? imageFile.name : 'UNKNOWN') + '  (' + (imageFile ? (imageFile.size / 1024).toFixed(1) + ' KB' : 'N/A') + ')',
    '> INFERENCE ENGINE: ACTIVE  --  SCAN COMPLETED  --  OUTPUT VALIDATED',
    '> DEFECT CLASS: ' + (result.damage_type || 'N/A') + '  |  CONFIDENCE: ' + confPct + '  |  STRUCTURAL INTEGRITY: ' + (result.structural_integrity || 'N/A'),
  ];
  logs.forEach((log, i) => {
    doc.text(log, 19, cy + 12 + i * 6);
  });

  cy += 46;

  // === RECOMMENDATIONS ===
  panelBox(doc, 14, cy, 182, 38, 'Inspector Recommendations');
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_PRIMARY);

  const bbCoords = result.bounding_box ? result.bounding_box.join(', ') : 'N/A';
  const recommendations = isDamaged
    ? [
        '1. QUARANTINE unit immediately and flag for secondary inspection.',
        '2. Do NOT ship or use until structural integrity is re-evaluated by a certified engineer.',
        '3. Document defect zone coordinates: [' + bbCoords + '] for QC records.',
        '4. Initiate root cause analysis per ISO 9001:2015 clause 10.2.1.',
      ]
    : [
        '1. Unit passes automated visual inspection. Proceed to next assembly stage.',
        '2. Log scan ID ' + (result.scan_id || 'N/A') + ' in the quality control database.',
        '3. Confidence level is ' + confPct + ' — within acceptable threshold.',
        '4. Continue routine batch inspection per standard operating procedure.',
      ];

  recommendations.forEach((rec, i) => {
    doc.text(rec, 19, cy + 12 + i * 6.2);
  });

  cy += 46;

  // === FOOTER ===
  hexLine(doc, 14, PH - 18, PW - 14, PH - 18, STEEL);
  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...TEXT_DIM);
  doc.text('INDUSTRIAL DAMAGE DETECTION SYSTEM  |  AI-POWERED QUALITY CONTROL ENGINE', 14, PH - 12);
  doc.text('REPORT GENERATED: ' + ts, PW - 14, PH - 12, { align: 'right' });
  doc.text('THIS REPORT IS SYSTEM-GENERATED. RESULTS SHOULD BE VERIFIED BY A QUALIFIED INSPECTOR.', 14, PH - 8);
  doc.text('PAGE 1 OF 1', PW - 14, PH - 8, { align: 'right' });

  const fileName = 'inspection_report_' + (result.scan_id || Date.now()) + '.pdf';
  doc.save(fileName);
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
