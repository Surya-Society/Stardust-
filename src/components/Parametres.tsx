import { useState } from "react";

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');

.pm-root {
  --bg: #090c10;
  --panel: #0d1117;
  --surface: #161b22;
  --elevated: #1c2330;
  --border: #21262d;
  --border-hi: #30363d;
  --blue: #388bfd;
  --blue-dim: rgba(56,139,253,0.08);
  --blue-border: rgba(56,139,253,0.25);
  --green: #3fb950;
  --green-dim: rgba(63,185,80,0.08);
  --green-border: rgba(63,185,80,0.25);
  --amber: #d29922;
  --amber-dim: rgba(210,153,34,0.08);
  --amber-border: rgba(210,153,34,0.25);
  --red: #f85149;
  --red-dim: rgba(248,81,73,0.08);
  --red-border: rgba(248,81,73,0.25);
  --t1: #e6edf3;
  --t2: #8b949e;
  --t3: #484f58;
  --font: 'IBM Plex Sans', sans-serif;
  --mono: 'IBM Plex Mono', monospace;
  font-family: var(--font);
  font-size: 13px;
  color: var(--t1);
  -webkit-font-smoothing: antialiased;
}
.pm-root * { box-sizing: border-box; margin: 0; padding: 0; }

/* ── LAYOUT ── */
.pm-layout { display: flex; gap: 0; min-height: 600px; }

/* ── SIDEBAR NAV ── */
.pm-nav {
  width: 220px;
  flex-shrink: 0;
  background: var(--panel);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  position: sticky; top: 0;
}
.pm-nav-header {
  padding: 16px 16px 12px;
  border-bottom: 1px solid var(--border);
}
.pm-nav-title {
  font-size: 10px; font-weight: 600; letter-spacing: 1.2px;
  text-transform: uppercase; color: var(--t3);
}
.pm-nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 16px;
  cursor: pointer; transition: all .15s;
  color: var(--t2); font-size: 12.5px; font-weight: 400;
  position: relative; border-bottom: 1px solid transparent;
  user-select: none;
}
.pm-nav-item:hover { background: var(--surface); color: var(--t1); }
.pm-nav-item.active {
  background: var(--surface); color: var(--t1); font-weight: 500;
}
.pm-nav-item.active::before {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0;
  width: 2px; background: var(--blue);
}
.pm-nav-icon { width: 14px; height: 14px; flex-shrink: 0; }
.pm-nav-badge {
  margin-left: auto; font-size: 10px; font-weight: 600;
  padding: 1px 5px; background: var(--red-dim);
  color: var(--red); border: 1px solid var(--red-border);
}
.pm-nav-group {
  padding: 12px 0 4px;
}
.pm-nav-group-label {
  padding: 0 16px 6px;
  font-size: 10px; font-weight: 600; letter-spacing: 1px;
  text-transform: uppercase; color: var(--t3);
}

/* ── MAIN CONTENT ── */
.pm-content { flex: 1; min-width: 0; padding: 24px 28px; }

/* ── PAGE HEADER ── */
.pm-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 24px; padding-bottom: 20px;
  border-bottom: 1px solid var(--border);
}
.pm-header-left {}
.pm-header-title {
  font-size: 18px; font-weight: 600; letter-spacing: -0.4px;
  display: flex; align-items: center; gap: 10px; margin-bottom: 4px;
}
.pm-header-icon {
  width: 30px; height: 30px;
  background: var(--blue-dim); border: 1px solid var(--blue-border);
  display: flex; align-items: center; justify-content: center; color: var(--blue);
}
.pm-header-sub { font-size: 12px; color: var(--t3); font-family: var(--mono); }
.pm-header-actions { display: flex; gap: 8px; }

/* ── BTN ── */
.pm-btn {
  display: inline-flex; align-items: center; gap: 6px;
  height: 32px; padding: 0 13px;
  font-family: var(--font); font-size: 12px; font-weight: 500;
  cursor: pointer; transition: all .15s; border: none; white-space: nowrap;
}
.pm-btn-primary { background: var(--blue); color: #fff; }
.pm-btn-primary:hover { background: #58a6ff; }
.pm-btn-ghost { background: transparent; border: 1px solid var(--border); color: var(--t2); }
.pm-btn-ghost:hover { border-color: var(--border-hi); color: var(--t1); background: var(--surface); }
.pm-btn-danger { background: var(--red-dim); border: 1px solid var(--red-border); color: var(--red); }
.pm-btn-danger:hover { background: rgba(248,81,73,.15); }
.pm-btn-sm { height: 28px; padding: 0 10px; font-size: 11px; }
.pm-btn:disabled { opacity: .4; cursor: not-allowed; }

/* ── SECTION CARD ── */
.pm-card {
  background: var(--panel);
  border: 1px solid var(--border);
  margin-bottom: 1px;
}
.pm-card-header {
  padding: 14px 20px;
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
}
.pm-card-title {
  font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 8px;
}
.pm-card-sub { font-size: 11px; color: var(--t3); margin-top: 2px; }
.pm-card-body { padding: 0; }

/* ── FIELD ROW ── */
.pm-field {
  display: grid; grid-template-columns: 220px 1fr;
  padding: 13px 20px;
  border-bottom: 1px solid var(--border);
  align-items: center; gap: 20px;
}
.pm-field:last-child { border-bottom: none; }
.pm-field-label {
  font-size: 12.5px; font-weight: 500; color: var(--t2);
}
.pm-field-desc { font-size: 11px; color: var(--t3); margin-top: 2px; }
.pm-field-control { display: flex; align-items: center; gap: 8px; }

/* ── INPUTS ── */
.pm-input, .pm-select, .pm-textarea {
  background: var(--bg); border: 1px solid var(--border);
  padding: 7px 11px; color: var(--t1);
  font-family: var(--font); font-size: 13px; outline: none;
  transition: border-color .15s; width: 100%;
}
.pm-input:focus, .pm-select:focus, .pm-textarea:focus { border-color: var(--blue); }
.pm-input::placeholder { color: var(--t3); }
.pm-select { cursor: pointer; appearance: none; }
.pm-select option { background: var(--panel); }
.pm-textarea { resize: vertical; min-height: 64px; }
.pm-input-w300 { max-width: 300px; }
.pm-input-w200 { max-width: 200px; }
.pm-input-mono { font-family: var(--mono); font-size: 12px; }

/* ── TOGGLE ── */
.pm-toggle {
  width: 34px; height: 19px;
  background: var(--elevated); border: 1px solid var(--border);
  position: relative; cursor: pointer; flex-shrink: 0;
  transition: background .2s, border-color .2s;
}
.pm-toggle.on { background: var(--blue); border-color: var(--blue); }
.pm-toggle-knob {
  position: absolute; top: 2px; left: 2px;
  width: 13px; height: 13px; background: var(--t2);
  transition: transform .2s, background .2s;
}
.pm-toggle.on .pm-toggle-knob { transform: translateX(15px); background: #fff; }
.pm-toggle-label { font-size: 12.5px; color: var(--t1); user-select: none; }

/* ── INFO BANNER ── */
.pm-info {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 12px 16px; margin: 0 20px 16px;
  border-left: 2px solid;
}
.pm-info-blue { background: var(--blue-dim); border-color: var(--blue); }
.pm-info-amber { background: var(--amber-dim); border-color: var(--amber); }
.pm-info-green { background: var(--green-dim); border-color: var(--green); }
.pm-info-red { background: var(--red-dim); border-color: var(--red); }
.pm-info-title { font-size: 12px; font-weight: 600; margin-bottom: 2px; }
.pm-info-blue .pm-info-title { color: var(--blue); }
.pm-info-amber .pm-info-title { color: var(--amber); }
.pm-info-green .pm-info-title { color: var(--green); }
.pm-info-red .pm-info-title { color: var(--red); }
.pm-info-text { font-size: 12px; color: var(--t2); }

/* ── BADGE ── */
.pm-badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 2px 8px; font-size: 11px; font-weight: 500;
}
.pm-badge-green { background: var(--green-dim); color: var(--green); border: 1px solid var(--green-border); }
.pm-badge-amber { background: var(--amber-dim); color: var(--amber); border: 1px solid var(--amber-border); }
.pm-badge-red   { background: var(--red-dim);   color: var(--red);   border: 1px solid var(--red-border); }
.pm-badge-blue  { background: var(--blue-dim);  color: var(--blue);  border: 1px solid var(--blue-border); }
.pm-badge-gray  { background: var(--surface); color: var(--t3); border: 1px solid var(--border); }

/* ── LIST ITEM ── */
.pm-list-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 11px 20px; border-bottom: 1px solid var(--border);
  transition: background .1s;
}
.pm-list-item:last-child { border-bottom: none; }
.pm-list-item:hover { background: var(--surface); }
.pm-list-item-left { display: flex; align-items: center; gap: 12px; }
.pm-list-item-icon {
  width: 28px; height: 28px;
  background: var(--surface); border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center; color: var(--t2); flex-shrink: 0;
}
.pm-list-item-name { font-size: 13px; font-weight: 500; }
.pm-list-item-sub { font-size: 11px; color: var(--t3); margin-top: 2px; font-family: var(--mono); }
.pm-list-item-actions { display: flex; gap: 6px; }

/* ── LOG CONSOLE ── */
.pm-console {
  background: var(--bg); padding: 14px 20px;
  font-family: var(--mono); font-size: 11.5px; line-height: 1.8;
  max-height: 220px; overflow-y: auto;
  border-top: 1px solid var(--border);
}
.pm-log-info   { color: var(--t2); }
.pm-log-warn   { color: var(--amber); }
.pm-log-error  { color: var(--red); }
.pm-log-ts     { color: var(--t3); margin-right: 8px; }

/* ── STAT ROW ── */
.pm-stats-row {
  display: grid; grid-template-columns: repeat(3, 1fr);
  border-bottom: 1px solid var(--border);
}
.pm-stat-cell {
  padding: 16px 20px; border-right: 1px solid var(--border);
}
.pm-stat-cell:last-child { border-right: none; }
.pm-stat-label { font-size: 10px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: var(--t3); margin-bottom: 6px; }
.pm-stat-val { font-size: 22px; font-weight: 300; letter-spacing: -0.5px; }

/* ── SECTION ACTIONS ── */
.pm-section-actions {
  padding: 14px 20px;
  border-top: 1px solid var(--border);
  display: flex; gap: 8px; justify-content: flex-end;
  background: var(--bg);
}

/* ── IP LIST ── */
.pm-ip-list { padding: 14px 20px; display: flex; flex-wrap: wrap; gap: 6px; border-bottom: 1px solid var(--border); }
.pm-ip-chip {
  display: flex; align-items: center; gap: 6px;
  background: var(--surface); border: 1px solid var(--border);
  padding: 4px 10px; font-family: var(--mono); font-size: 12px; color: var(--t2);
}
.pm-ip-chip button {
  background: none; border: none; color: var(--t3); cursor: pointer;
  display: flex; align-items: center; transition: color .15s;
}
.pm-ip-chip button:hover { color: var(--red); }
.pm-ip-add { display: flex; gap: 8px; padding: 12px 20px; border-bottom: 1px solid var(--border); }

/* ── COLOR PICKER ── */
.pm-color-row { display: flex; align-items: center; gap: 10px; }
.pm-color-swatch {
  width: 28px; height: 28px;
  border: 1px solid var(--border); cursor: pointer;
  position: relative;
}
.pm-color-swatch input[type=color] {
  position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%;
}

/* ── SYNC NETWORK OPTS ── */
.pm-network-opts { display: flex; gap: 6px; }
.pm-network-opt {
  flex: 1; padding: 8px 10px;
  background: var(--surface); border: 1px solid var(--border);
  color: var(--t2); font-size: 12px; text-align: center;
  cursor: pointer; transition: all .15s;
}
.pm-network-opt:hover { border-color: var(--border-hi); color: var(--t1); }
.pm-network-opt.active { background: var(--blue-dim); border-color: var(--blue-border); color: var(--blue); }

/* ── ANIM ── */
@keyframes pmEnter { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.pm-enter { animation: pmEnter .25s cubic-bezier(.4,0,.2,1) both; }

/* ── RESPONSIVE ── */
@media (max-width: 768px) {
  .pm-layout { flex-direction: column; }
  .pm-nav { width: 100%; flex-direction: row; overflow-x: auto; border-right: none; border-bottom: 1px solid var(--border); position: static; }
  .pm-nav-group { display: flex; padding: 0; }
  .pm-nav-group-label { display: none; }
  .pm-nav-item { white-space: nowrap; padding: 12px 14px; }
  .pm-field { grid-template-columns: 1fr; gap: 8px; }
}
`;

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Ico = ({ d, s = 14, sw = 1.5, fill = "none", stroke = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const I = {
  settings:  "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  shield:    "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  bell:      "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
  palette:   "M12 2a10 10 0 0 1 10 10 4 4 0 0 1-4 4h-2.1a2 2 0 0 0-1.49.66l-.81.9a2 2 0 0 1-3 0L9.7 16.66A2 2 0 0 0 8.2 16H6a4 4 0 0 1-4-4A10 10 0 0 1 12 2z",
  card:      "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3z",
  api:       "M8 9l3 3-3 3M13 15h3M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  sync:      "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
  backup:    "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  log:       "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  terminal:  "M4 17l6-6-6-6M12 19h8",
  key:       "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4",
  globe:     "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
  package:   "M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12",
  users:     "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  save:      "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8",
  upload:    "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 0-2-2v-4M17 8l-5-5-5 5M12 3v12",
  download:  "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 0-2-2v-4M7 10l5 5 5-5M12 15V3",
  refresh:   "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
  plus:      "M12 5v14M5 12h14",
  close:     "M18 6L6 18M6 6l12 12",
  check:     "M20 6L9 17l-5-5",
  warn:      "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
  info:      "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-4M12 8h.01",
  lock:      "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4",
  usb:       "M6 2l2 2-4 4v4h4v-3l2 2h3v3h2v-3h3l2-2-4-4 2-2H6z",
  server:    "M2 3h20v6H2zM2 15h20v6H2zM6 6h.01M6 18h.01",
  harddrive: "M22 12H2M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11zM6 16h.01M10 16h.01",
  wifi:      "M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01",
  wifioff:   "M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.56 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01",
  mail:      "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  trash:     "M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
  zap:       "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  award:     "M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM8.21 13.89L7 23l5-3 5 3-1.21-9.12",
  activity:  "M22 12h-4l-3 9L9 3l-3 9H2",
  link:      "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function Toggle({ on, onChange, label = "" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div className={`pm-toggle ${on ? "on" : ""}`} onClick={onChange}>
        <div className="pm-toggle-knob" />
      </div>
      {label && <span className="pm-toggle-label">{label}</span>}
    </div>
  );
}

function Field({ label, desc = "", children }) {
  return (
    <div className="pm-field">
      <div>
        <div className="pm-field-label">{label}</div>
        {desc && <div className="pm-field-desc">{desc}</div>}
      </div>
      <div className="pm-field-control">{children}</div>
    </div>
  );
}

function Card({ title, icon, sub = "", children, actions = null }) {
  return (
    <div className="pm-card pm-enter" style={{ marginBottom: 16 }}>
      <div className="pm-card-header">
        <div>
          <div className="pm-card-title">
            {icon && <Ico d={icon} s={14} />}
            {title}
          </div>
          {sub && <div className="pm-card-sub">{sub}</div>}
        </div>
        {actions}
      </div>
      <div className="pm-card-body">{children}</div>
    </div>
  );
}

function InfoBanner({ type = "blue", title, text }) {
  const ico = { blue: I.info, amber: I.warn, green: I.check, red: I.warn }[type];
  return (
    <div className={`pm-info pm-info-${type}`} style={{ margin: "12px 20px" }}>
      <Ico d={ico} s={14} stroke={`var(--${type === "amber" ? "amber" : type === "green" ? "green" : type === "red" ? "red" : "blue"})`} />
      <div>
        {title && <div className="pm-info-title">{title}</div>}
        <div className="pm-info-text">{text}</div>
      </div>
    </div>
  );
}

// ─── TABS ─────────────────────────────────────────────────────────────────────
const NAV = [
  { group: "Plateforme", items: [
    { id: "general",       label: "Général",             icon: I.settings },
    { id: "appearance",    label: "Apparence",           icon: I.palette },
    { id: "notifications", label: "Notifications",       icon: I.bell, badge: "3" },
  ]},
  { group: "Sécurité & Accès", items: [
    { id: "security",      label: "Sécurité",            icon: I.shield },
    { id: "roles",         label: "Rôles & Permissions", icon: I.users },
    { id: "api",           label: "API & Webhooks",      icon: I.api },
  ]},
  { group: "Système", items: [
    { id: "sync",          label: "Synchronisation",     icon: I.sync },
    { id: "backup",        label: "Sauvegardes",         icon: I.harddrive },
    { id: "billing",       label: "Facturation",         icon: I.card },
    { id: "logs",          label: "Logs & Diagnostic",   icon: I.log },
    { id: "advanced",      label: "Avancé",              icon: I.terminal },
  ]},
];

const ICONS_BY_ID = {};
NAV.forEach(g => g.items.forEach(i => { ICONS_BY_ID[i.id] = i.icon; }));

// ─── TABS CONTENT ─────────────────────────────────────────────────────────────

function TabGeneral({ s, set, notify }) {
  return (
    <>
      <Card title="Informations générales" icon={I.settings}>
        <Field label="Nom de la plateforme"><input className="pm-input pm-input-w300" value={s.platformName} onChange={e => set("platformName", e.target.value)} /></Field>
        <Field label="Email de contact"><input className="pm-input pm-input-w300" type="email" value={s.contactEmail} onChange={e => set("contactEmail", e.target.value)} /></Field>
        <Field label="Email support"><input className="pm-input pm-input-w300" type="email" value={s.supportEmail} onChange={e => set("supportEmail", e.target.value)} /></Field>
      </Card>
      <Card title="Localisation" icon={I.globe}>
        <Field label="Fuseau horaire">
          <select className="pm-select pm-input-w300" value={s.timezone} onChange={e => set("timezone", e.target.value)}>
            {["Europe/Paris","Europe/London","America/New_York","America/Los_Angeles","Asia/Tokyo"].map(tz => <option key={tz}>{tz}</option>)}
          </select>
        </Field>
        <Field label="Langue">
          <select className="pm-select pm-input-w300" value={s.language} onChange={e => set("language", e.target.value)}>
            <option value="fr">Français</option><option value="en">English</option><option value="es">Español</option>
          </select>
        </Field>
        <Field label="Format de date">
          <select className="pm-select pm-input-w300" value={s.dateFormat} onChange={e => set("dateFormat", e.target.value)}>
            {["DD/MM/YYYY","MM/DD/YYYY","YYYY-MM-DD"].map(f => <option key={f}>{f}</option>)}
          </select>
        </Field>
        <div className="pm-section-actions">
          <button className="pm-btn pm-btn-ghost" onClick={() => notify("Annulé", "amber")}>Annuler</button>
          <button className="pm-btn pm-btn-primary" onClick={() => notify("Paramètres généraux sauvegardés", "green")}><Ico d={I.save} s={12} /> Sauvegarder</button>
        </div>
      </Card>
    </>
  );
}

function TabAppearance({ s, set, notify }) {
  return (
    <>
      <Card title="Thème et affichage" icon={I.palette}>
        <Field label="Thème" desc="Apparence globale de l'interface">
          <select className="pm-select pm-input-w300" value={s.theme} onChange={e => set("theme", e.target.value)}>
            <option value="dark">Sombre</option><option value="light">Clair</option><option value="system">Système</option>
          </select>
        </Field>
        <Field label="Couleur d'accentuation" desc="Teinte principale des éléments actifs">
          <div className="pm-color-row">
            <div className="pm-color-swatch" style={{ background: s.accentColor }}>
              <input type="color" value={s.accentColor} onChange={e => set("accentColor", e.target.value)} />
            </div>
            <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--t2)" }}>{s.accentColor}</span>
          </div>
        </Field>
        <Field label="Mode compact" desc="Réduit l'espacement des éléments">
          <Toggle on={s.compactMode} onChange={() => set("compactMode", !s.compactMode)} label={s.compactMode ? "Activé" : "Désactivé"} />
        </Field>
        <Field label="Afficher les avatars" desc="Initiales ou photos de profil">
          <Toggle on={s.showAvatars} onChange={() => set("showAvatars", !s.showAvatars)} label={s.showAvatars ? "Activé" : "Désactivé"} />
        </Field>
        <div className="pm-section-actions">
          <button className="pm-btn pm-btn-primary" onClick={() => notify("Apparence mise à jour", "green")}><Ico d={I.save} s={12} /> Sauvegarder</button>
        </div>
      </Card>
    </>
  );
}

function TabNotifications({ s, set, notify }) {
  return (
    <>
      <Card title="Canaux de notification" icon={I.bell}>
        <Field label="Notifications email" desc="Alertes envoyées par email">
          <Toggle on={s.emailNotifications} onChange={() => set("emailNotifications", !s.emailNotifications)} label={s.emailNotifications ? "Activé" : "Désactivé"} />
        </Field>
        <Field label="Webhook Slack" desc="URL d'intégration Slack">
          <input className="pm-input pm-input-w300 pm-input-mono" placeholder="https://hooks.slack.com/services/…" value={s.slackWebhook} onChange={e => set("slackWebhook", e.target.value)} />
        </Field>
        <Field label="Webhook Discord" desc="URL d'intégration Discord">
          <input className="pm-input pm-input-w300 pm-input-mono" placeholder="https://discord.com/api/webhooks/…" value={s.discordWebhook} onChange={e => set("discordWebhook", e.target.value)} />
        </Field>
      </Card>
      <Card title="Événements déclencheurs" icon={I.zap}>
        <Field label="Paiement reçu"><Toggle on={s.notifyPayment} onChange={() => set("notifyPayment", !s.notifyPayment)} label={s.notifyPayment ? "Activé" : "Désactivé"} /></Field>
        <Field label="Nouvelle inscription"><Toggle on={s.notifySignup} onChange={() => set("notifySignup", !s.notifySignup)} label={s.notifySignup ? "Activé" : "Désactivé"} /></Field>
        <Field label="Anomalie système"><Toggle on={s.notifySystem} onChange={() => set("notifySystem", !s.notifySystem)} label={s.notifySystem ? "Activé" : "Désactivé"} /></Field>
        <Field label="Expiration de licence" desc="Alerte 30 jours avant expiration"><Toggle on={s.notifyExpiry} onChange={() => set("notifyExpiry", !s.notifyExpiry)} label={s.notifyExpiry ? "Activé" : "Désactivé"} /></Field>
        <div className="pm-section-actions">
          <button className="pm-btn pm-btn-ghost" onClick={() => notify("Test envoyé sur Slack", "blue")}><Ico d={I.zap} s={12} /> Tester</button>
          <button className="pm-btn pm-btn-primary" onClick={() => notify("Notifications sauvegardées", "green")}><Ico d={I.save} s={12} /> Sauvegarder</button>
        </div>
      </Card>
    </>
  );
}

function TabSecurity({ s, set, notify }) {
  const [ipInput, setIpInput] = useState("");
  const [ips, setIps] = useState(["192.168.1.0/24", "10.0.0.1"]);

  return (
    <>
      <Card title="Authentification" icon={I.shield}>
        <Field label="Double authentification (2FA)" desc="TOTP requis à chaque connexion">
          <Toggle on={s.twoFactorAuth} onChange={() => set("twoFactorAuth", !s.twoFactorAuth)} label={s.twoFactorAuth ? "Activé" : "Désactivé"} />
        </Field>
        <Field label="Durée de session" desc="Déconnexion automatique après inactivité">
          <select className="pm-select pm-input-w200" value={s.sessionTimeout} onChange={e => set("sessionTimeout", e.target.value)}>
            {["2","4","8","12","24"].map(h => <option key={h} value={h}>{h} heures</option>)}
          </select>
        </Field>
        <Field label="Politique mot de passe" desc="Complexité minimale exigée">
          <select className="pm-select pm-input-w200" value={s.passwordPolicy} onChange={e => set("passwordPolicy", e.target.value)}>
            <option value="basic">Basique (6 car.)</option>
            <option value="medium">Moyen (8 car. + chiffre)</option>
            <option value="strong">Fort (12 car. + symboles)</option>
          </select>
        </Field>
        <Field label="Tentatives max de connexion" desc="Avant blocage du compte">
          <input className="pm-input pm-input-w200" type="number" min="3" max="20" value={s.maxLoginAttempts} onChange={e => set("maxLoginAttempts", e.target.value)} />
        </Field>
      </Card>

      <Card title="Restriction d'accès IP" icon={I.lock} sub="Seules ces plages IP peuvent accéder au dashboard">
        <div className="pm-ip-list">
          {ips.map(ip => (
            <div className="pm-ip-chip" key={ip}>
              {ip}
              <button onClick={() => setIps(ips.filter(i => i !== ip))}><Ico d={I.close} s={10} /></button>
            </div>
          ))}
          {ips.length === 0 && <span style={{ fontSize: 12, color: "var(--t3)" }}>Aucune restriction — accès depuis toutes les IP</span>}
        </div>
        <div className="pm-ip-add">
          <input className="pm-input pm-input-mono" style={{ maxWidth: 220 }} placeholder="192.168.1.0/24" value={ipInput} onChange={e => setIpInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && ipInput) { setIps([...ips, ipInput]); setIpInput(""); }}} />
          <button className="pm-btn pm-btn-ghost" onClick={() => { if (ipInput) { setIps([...ips, ipInput]); setIpInput(""); }}}>
            <Ico d={I.plus} s={12} /> Ajouter
          </button>
        </div>
        <div className="pm-section-actions">
          <button className="pm-btn pm-btn-primary" onClick={() => notify("Paramètres sécurité sauvegardés", "green")}><Ico d={I.save} s={12} /> Sauvegarder</button>
        </div>
      </Card>

      <Card title="Clés USB autorisées" icon={I.usb} sub="Authentification matérielle par clé USB">
        {[
          { id: "USB-A3F2B1", name: "Clé Licence Principale", last: "Aujourd'hui 14:23" },
          { id: "USB-D7E5F3", name: "Clé Admin Backup", last: "15 Jan 2026" },
        ].map(usb => (
          <div className="pm-list-item" key={usb.id}>
            <div className="pm-list-item-left">
              <div className="pm-list-item-icon"><Ico d={I.usb} s={14} /></div>
              <div>
                <div className="pm-list-item-name">{usb.name}</div>
                <div className="pm-list-item-sub">ID: {usb.id} · Dernière utilis. : {usb.last}</div>
              </div>
            </div>
            <div className="pm-list-item-actions">
              <button className="pm-btn pm-btn-danger pm-btn-sm" onClick={() => notify("Clé USB révoquée", "red")}><Ico d={I.trash} s={11} /> Révoquer</button>
            </div>
          </div>
        ))}
        <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)" }}>
          <button className="pm-btn pm-btn-ghost" onClick={() => notify("Branchez une clé USB pour l'enregistrer", "blue")}><Ico d={I.plus} s={12} /> Enregistrer une clé USB</button>
        </div>
      </Card>
    </>
  );
}

function TabRoles({ notify }) {
  const roles = [
    { name: "Super Admin", users: 1, permissions: "Accès total", color: "#f85149" },
    { name: "Administrateur", users: 3, permissions: "Tout sauf paramètres critiques", color: "#d29922" },
    { name: "Gestionnaire", users: 8, permissions: "Clients, abonnements, clés", color: "#388bfd" },
    { name: "Support", users: 5, permissions: "Lecture seule + commentaires", color: "#3fb950" },
    { name: "Lecture seule", users: 2, permissions: "Consultation uniquement", color: "#8b949e" },
  ];
  return (
    <Card title="Rôles & Permissions" icon={I.users} sub="Gestion des droits d'accès par rôle">
      {roles.map(r => (
        <div className="pm-list-item" key={r.name}>
          <div className="pm-list-item-left">
            <div className="pm-list-item-icon" style={{ borderColor: r.color + "40", color: r.color }}>
              <Ico d={I.users} s={13} stroke={r.color} />
            </div>
            <div>
              <div className="pm-list-item-name">{r.name}</div>
              <div className="pm-list-item-sub">{r.permissions} · {r.users} utilisateur{r.users > 1 ? "s" : ""}</div>
            </div>
          </div>
          <div className="pm-list-item-actions">
            <button className="pm-btn pm-btn-ghost pm-btn-sm" onClick={() => notify(`Édition du rôle ${r.name}`, "blue")}>Éditer</button>
          </div>
        </div>
      ))}
      <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)" }}>
        <button className="pm-btn pm-btn-ghost" onClick={() => notify("Créer un nouveau rôle", "blue")}><Ico d={I.plus} s={12} /> Créer un rôle</button>
      </div>
    </Card>
  );
}

function TabApi({ s, set, notify }) {
  const [showKey, setShowKey] = useState(false);
  return (
    <>
      <Card title="Configuration API" icon={I.api}>
        <Field label="API activée" desc="Active ou désactive l'accès API global">
          <Toggle on={s.apiEnabled} onChange={() => set("apiEnabled", !s.apiEnabled)} label={s.apiEnabled ? "Activée" : "Désactivée"} />
        </Field>
        <Field label="Rate limit" desc="Requêtes max par minute par clé">
          <input className="pm-input pm-input-w200" type="number" value={s.rateLimit} onChange={e => set("rateLimit", e.target.value)} />
        </Field>
        <Field label="Autoriser CORS" desc="Cross-Origin Resource Sharing">
          <Toggle on={s.allowCors} onChange={() => set("allowCors", !s.allowCors)} label={s.allowCors ? "Activé" : "Désactivé"} />
        </Field>
        <Field label="URL Webhook globale" desc="Recevra tous les événements plateforme">
          <input className="pm-input pm-input-w300 pm-input-mono" placeholder="https://…" value={s.webhookUrl} onChange={e => set("webhookUrl", e.target.value)} />
        </Field>
      </Card>
      <Card title="Clé API maître" icon={I.key} sub="Clé d'accès super-admin pour intégrations critiques">
        <InfoBanner type="amber" title="Attention" text="Cette clé dispose d'un accès complet en lecture/écriture. Ne la divulguez jamais." />
        <Field label="Clé secrète">
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input className="pm-input pm-input-mono" style={{ maxWidth: 280 }}
              type={showKey ? "text" : "password"} readOnly value="sk_live_xK9mP2...4rQwBz8s" />
            <button className="pm-btn pm-btn-ghost pm-btn-sm" onClick={() => setShowKey(!showKey)}>
              {showKey ? "Masquer" : "Afficher"}
            </button>
            <button className="pm-btn pm-btn-ghost pm-btn-sm" onClick={() => { navigator.clipboard?.writeText("sk_live_xK9mP2...4rQwBz8s"); notify("Clé copiée", "green"); }}>
              Copier
            </button>
          </div>
        </Field>
        <div className="pm-section-actions">
          <button className="pm-btn pm-btn-danger" onClick={() => notify("Clé régénérée — ancienne clé invalidée", "red")}><Ico d={I.refresh} s={12} /> Régénérer</button>
          <button className="pm-btn pm-btn-primary" onClick={() => notify("Config API sauvegardée", "green")}><Ico d={I.save} s={12} /> Sauvegarder</button>
        </div>
      </Card>
    </>
  );
}

function TabSync({ s, set, notify }) {
  const [syncing, setSyncing] = useState(false);
  const [network, setNetwork] = useState("wifi");

  return (
    <>
      <Card title="Configuration de synchronisation" icon={I.sync}>
        <Field label="Sync. automatique" desc="Synchronise les données en arrière-plan">
          <Toggle on={s.autoSync} onChange={() => set("autoSync", !s.autoSync)} label={s.autoSync ? "Activée" : "Désactivée"} />
        </Field>
        <Field label="Réseau autorisé" desc="Conditions réseau pour la synchronisation">
          <div className="pm-network-opts">
            {[["always","Toujours"],["wifi","Wi-Fi uniquement"],["manual","Manuel"]].map(([v,l]) => (
              <div key={v} className={`pm-network-opt ${network === v ? "active" : ""}`} onClick={() => setNetwork(v)}>{l}</div>
            ))}
          </div>
        </Field>
        <Field label="Bande passante max" desc="Limite de débit en KB/s (0 = illimité)">
          <input className="pm-input pm-input-w200 pm-input-mono" type="number" defaultValue="0" placeholder="KB/s" />
        </Field>
        <Field label="Résolution de conflits" desc="Stratégie en cas de modification simultanée">
          <select className="pm-select pm-input-w200">
            <option>Automatique (LWW)</option>
            <option>Manuel</option>
            <option>Règles personnalisées</option>
          </select>
        </Field>
      </Card>

      <Card title="Synchronisation manuelle" icon={I.zap}
        actions={syncing ? <span style={{ fontSize: 11, color: "var(--blue)", fontFamily: "var(--mono)" }}>Sync en cours…</span> : null}>
        <div style={{ padding: "14px 20px", display: "flex", gap: 8 }}>
          <button className="pm-btn pm-btn-primary" disabled={syncing} onClick={() => { setSyncing(true); setTimeout(() => { setSyncing(false); notify("Synchronisation terminée — 245 enregistrements", "green"); }, 2500); }}>
            <Ico d={I.sync} s={12} /> Synchroniser maintenant
          </button>
          <button className="pm-btn pm-btn-ghost" onClick={() => notify("Dry-run : 89 enregistrements seraient synchronisés", "blue")}>
            <Ico d={I.zap} s={12} /> Test à blanc (dry-run)
          </button>
        </div>
      </Card>

      <Card title="Journal de synchronisation" icon={I.activity}>
        <div className="pm-console">
          {[
            { t: "pm-log-info",  ts: "2026-03-08 14:32", msg: "Synchronisation démarrée — 245 enregistrements" },
            { t: "pm-log-info",  ts: "2026-03-08 14:32", msg: "Synchronisation terminée en 1.4s" },
            { t: "pm-log-warn",  ts: "2026-03-08 09:10", msg: "3 conflits résolus automatiquement (LWW)" },
            { t: "pm-log-info",  ts: "2026-03-07 14:35", msg: "Synchronisation démarrée — 89 enregistrements" },
            { t: "pm-log-info",  ts: "2026-03-07 14:35", msg: "Synchronisation terminée en 0.8s" },
          ].map((l, i) => (
            <div key={i} className={l.t}><span className="pm-log-ts">[{l.ts}]</span>{l.msg}</div>
          ))}
        </div>
      </Card>
    </>
  );
}

function TabBackup({ notify }) {
  return (
    <>
      <Card title="Sauvegarde rapide" icon={I.harddrive}>
        <div style={{ padding: "16px 20px", display: "flex", gap: 8 }}>
          <button className="pm-btn pm-btn-primary" onClick={() => notify("Export complet en cours…", "blue")}><Ico d={I.download} s={12} /> Export complet</button>
          <button className="pm-btn pm-btn-ghost" onClick={() => notify("Export incrémental en cours…", "blue")}><Ico d={I.download} s={12} /> Export incrémental</button>
          <button className="pm-btn pm-btn-ghost" onClick={() => notify("Export SQL en cours…", "blue")}><Ico d={I.download} s={12} /> Export SQL</button>
        </div>
      </Card>

      <Card title="Planification automatique" icon={I.activity}>
        <Field label="Sauvegardes automatiques"><Toggle on={true} onChange={() => {}} label="Activées" /></Field>
        <Field label="Fréquence">
          <select className="pm-select pm-input-w200">
            <option>Quotidien</option><option>Hebdomadaire</option><option>Mensuel</option>
          </select>
        </Field>
        <Field label="Heure d'exécution">
          <input className="pm-input pm-input-w200 pm-input-mono" type="time" defaultValue="02:00" />
        </Field>
        <Field label="Rétention" desc="Nombre de sauvegardes conservées">
          <input className="pm-input pm-input-w200 pm-input-mono" type="number" defaultValue="30" />
        </Field>
        <div className="pm-section-actions">
          <button className="pm-btn pm-btn-primary" onClick={() => notify("Planification sauvegardée", "green")}><Ico d={I.save} s={12} /> Sauvegarder</button>
        </div>
      </Card>

      <Card title="Emplacements de sauvegarde" icon={I.server}>
        {[
          { path: "C:\\Backups\\Scolarys", last: "08 Mar 2026 · 02:00", size: "2.3 GB" },
          { path: "D:\\Archives\\Scolarys", last: "07 Mar 2026 · 02:00", size: "2.1 GB" },
        ].map(loc => (
          <div className="pm-list-item" key={loc.path}>
            <div className="pm-list-item-left">
              <div className="pm-list-item-icon"><Ico d={I.harddrive} s={13} /></div>
              <div>
                <div className="pm-list-item-name" style={{ fontFamily: "var(--mono)", fontSize: 12 }}>{loc.path}</div>
                <div className="pm-list-item-sub">{loc.last} · {loc.size}</div>
              </div>
            </div>
            <button className="pm-btn pm-btn-danger pm-btn-sm"><Ico d={I.trash} s={11} /></button>
          </div>
        ))}
        <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)" }}>
          <button className="pm-btn pm-btn-ghost" onClick={() => notify("Sélectionner un emplacement", "blue")}><Ico d={I.plus} s={12} /> Ajouter un emplacement</button>
        </div>
      </Card>
    </>
  );
}

function TabBilling({ s, set, notify }) {
  return (
    <>
      <Card title="Informations de facturation" icon={I.card}>
        <Field label="Nom de l'entreprise"><input className="pm-input pm-input-w300" value={s.companyName} onChange={e => set("companyName", e.target.value)} /></Field>
        <Field label="Numéro de TVA"><input className="pm-input pm-input-w300 pm-input-mono" value={s.vatNumber} onChange={e => set("vatNumber", e.target.value)} /></Field>
        <Field label="Adresse de facturation">
          <textarea className="pm-textarea pm-input-w300" value={s.address} onChange={e => set("address", e.target.value)} />
        </Field>
        <Field label="Email de facturation"><input className="pm-input pm-input-w300" type="email" value={s.billingEmail} onChange={e => set("billingEmail", e.target.value)} /></Field>
        <Field label="Facturation automatique" desc="Génère et envoie les factures automatiquement">
          <Toggle on={s.autoInvoice} onChange={() => set("autoInvoice", !s.autoInvoice)} label={s.autoInvoice ? "Activée" : "Désactivée"} />
        </Field>
        <div className="pm-section-actions">
          <button className="pm-btn pm-btn-ghost" onClick={() => notify("Facture de test envoyée", "blue")}><Ico d={I.mail} s={12} /> Tester</button>
          <button className="pm-btn pm-btn-primary" onClick={() => notify("Facturation sauvegardée", "green")}><Ico d={I.save} s={12} /> Sauvegarder</button>
        </div>
      </Card>
    </>
  );
}

function TabLogs({ notify }) {
  const logs = [
    { t: "pm-log-info",  ts: "2026-03-08 14:32:15", msg: "Application démarrée" },
    { t: "pm-log-info",  ts: "2026-03-08 14:32:16", msg: "Base de données connectée" },
    { t: "pm-log-info",  ts: "2026-03-08 14:35:22", msg: "Synchronisation démarrée" },
    { t: "pm-log-info",  ts: "2026-03-08 14:35:45", msg: "245 enregistrements synchronisés" },
    { t: "pm-log-warn",  ts: "2026-03-08 14:35:46", msg: "3 conflits résolus automatiquement" },
    { t: "pm-log-error", ts: "2026-03-08 15:12:03", msg: "Tentative de connexion échouée — IP: 185.234.12.8" },
    { t: "pm-log-warn",  ts: "2026-03-08 16:00:00", msg: "Licence expirée détectée — Lycée Pasteur" },
  ];
  return (
    <>
      <Card title="Journaux système" icon={I.log}
        actions={
          <div style={{ display: "flex", gap: 6 }}>
            <button className="pm-btn pm-btn-ghost pm-btn-sm" onClick={() => notify("Logs exportés", "green")}><Ico d={I.download} s={12} /> Exporter</button>
            <button className="pm-btn pm-btn-ghost pm-btn-sm" onClick={() => notify("Logs envoyés au support", "blue")}><Ico d={I.upload} s={12} /> Envoyer au support</button>
          </div>
        }
      >
        <Field label="Niveau de détail">
          <div style={{ display: "flex", gap: 6 }}>
            {["Info","Warn","Debug","Error"].map(l => (
              <div key={l} className={`pm-network-opt ${l === "Info" ? "active" : ""}`} style={{ flex: "none", padding: "6px 14px" }}>{l}</div>
            ))}
          </div>
        </Field>
        <div className="pm-console">
          {logs.map((l, i) => (
            <div key={i} className={l.t}><span className="pm-log-ts">[{l.ts}]</span>{l.msg}</div>
          ))}
        </div>
      </Card>

      <Card title="Informations de diagnostic" icon={I.activity}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 1, background: "var(--border)" }}>
          {[
            ["Version application", "v2.4.1"],
            ["Schéma base de données", "v1.8"],
            ["Dernière synchronisation", "Il y a 2 heures"],
            ["Espace disque", "12.4 GB / 50 GB"],
            ["Uptime", "18j 04h 22min"],
            ["Node.js", "v20.11.0"],
          ].map(([k, v]) => (
            <div key={k} style={{ background: "var(--panel)", padding: "12px 20px" }}>
              <div className="pm-stat-label">{k}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--t1)", marginTop: 4 }}>{v}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Confidentialité & Télémétrie" icon={I.shield}>
        <Field label="Télémétrie anonymisée" desc="Aide à améliorer le produit sans données personnelles">
          <Toggle on={false} onChange={() => {}} label="Désactivée" />
        </Field>
        <div style={{ padding: "12px 20px", display: "flex", gap: 8 }}>
          <button className="pm-btn pm-btn-ghost" onClick={() => notify("Export RGPD en cours", "blue")}><Ico d={I.download} s={12} /> Exporter mes données (RGPD)</button>
          <button className="pm-btn pm-btn-danger" onClick={() => notify("Purge planifiée", "red")}><Ico d={I.trash} s={12} /> Purger les données</button>
        </div>
      </Card>
    </>
  );
}

function TabAdvanced({ notify }) {
  return (
    <>
      <InfoBanner type="amber" title="Mode Expert"
        text="Ces paramètres sont réservés aux utilisateurs avancés. Une mauvaise configuration peut affecter le fonctionnement de la plateforme." />
      <Card title="Cryptographie" icon={I.lock}>
        <Field label="Algorithme de chiffrement" desc="Chiffrement des données locales">
          <select className="pm-select pm-input-w200">
            <option>AES-256-GCM</option>
            <option>ChaCha20-Poly1305</option>
          </select>
        </Field>
        <Field label="Algorithme de signature" desc="Vérification des licences et clés">
          <select className="pm-select pm-input-w200">
            <option>Ed25519</option>
            <option>RSA-4096</option>
          </select>
        </Field>
        <div className="pm-section-actions">
          <button className="pm-btn pm-btn-primary" onClick={() => notify("Paramètres crypto sauvegardés", "green")}><Ico d={I.save} s={12} /> Sauvegarder</button>
        </div>
      </Card>
      <Card title="Débogage & Reset" icon={I.terminal}>
        <div style={{ padding: "14px 20px", display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button className="pm-btn pm-btn-ghost" onClick={() => notify("Change-log affiché", "blue")}><Ico d={I.activity} s={12} /> Afficher le change-log</button>
          <button className="pm-btn pm-btn-ghost" onClick={() => notify("Conflits résolus", "amber")}><Ico d={I.zap} s={12} /> Forcer résolution conflits</button>
          <button className="pm-btn pm-btn-ghost" onClick={() => notify("Import SQL en cours", "blue")}><Ico d={I.upload} s={12} /> Importer SQL</button>
          <button className="pm-btn pm-btn-ghost" onClick={() => notify("Export SQL en cours", "blue")}><Ico d={I.download} s={12} /> Exporter SQL</button>
          <button className="pm-btn pm-btn-danger" onClick={() => notify("Historique sync réinitialisé", "red")}><Ico d={I.trash} s={12} /> Reset historique sync</button>
        </div>
      </Card>
    </>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
const INIT = {
  platformName: "Scolarys Admin", contactEmail: "admin@scolarys.fr", supportEmail: "support@scolarys.fr",
  timezone: "Europe/Paris", language: "fr", dateFormat: "DD/MM/YYYY",
  twoFactorAuth: true, sessionTimeout: "8", passwordPolicy: "strong", maxLoginAttempts: 5,
  emailNotifications: true, slackWebhook: "https://hooks.slack.com/services/xxx", discordWebhook: "",
  notifyPayment: true, notifySignup: true, notifySystem: true, notifyExpiry: true,
  theme: "dark", accentColor: "#388bfd", compactMode: false, showAvatars: true,
  companyName: "Scolarys SAS", vatNumber: "FR123456789",
  address: "123 rue de l'Innovation, 75001 Paris", billingEmail: "billing@scolarys.fr", autoInvoice: true,
  apiEnabled: true, rateLimit: 1000, webhookUrl: "https://api.scolarys.fr/webhook", allowCors: true,
  autoSync: true,
};

export default function Parametres({ onNotify }) {
  const notify = onNotify || ((m, t) => console.log(m, t));
  const [tab, setTab] = useState("general");
  const [s, setS] = useState(INIT);

  function set(k, v) { setS(p => ({ ...p, [k]: v })); }

  const TITLE_MAP = {};
  NAV.forEach(g => g.items.forEach(i => { TITLE_MAP[i.id] = i.label; }));

  const renderTab = () => {
    switch (tab) {
      case "general":       return <TabGeneral s={s} set={set} notify={notify} />;
      case "appearance":    return <TabAppearance s={s} set={set} notify={notify} />;
      case "notifications": return <TabNotifications s={s} set={set} notify={notify} />;
      case "security":      return <TabSecurity s={s} set={set} notify={notify} />;
      case "roles":         return <TabRoles notify={notify} />;
      case "api":           return <TabApi s={s} set={set} notify={notify} />;
      case "sync":          return <TabSync s={s} set={set} notify={notify} />;
      case "backup":        return <TabBackup notify={notify} />;
      case "billing":       return <TabBilling s={s} set={set} notify={notify} />;
      case "logs":          return <TabLogs notify={notify} />;
      case "advanced":      return <TabAdvanced notify={notify} />;
      default: return null;
    }
  };

  return (
    <div className="pm-root">
      <style>{CSS}</style>

      {/* ── TOPBAR ── */}
      <div className="pm-header">
        <div className="pm-header-left">
          <div className="pm-header-title">
            <div className="pm-header-icon"><Ico d={I.settings} s={15} /></div>
            Paramètres
          </div>
          <div className="pm-header-sub">Configuration de la plateforme Scolarys</div>
        </div>
        <div className="pm-header-actions">
          <button className="pm-btn pm-btn-ghost" onClick={() => { setS(INIT); notify("Paramètres réinitialisés", "amber"); }}><Ico d={I.refresh} s={12} /> Réinitialiser</button>
          <button className="pm-btn pm-btn-ghost" onClick={() => notify("Configuration exportée en JSON", "green")}><Ico d={I.download} s={12} /> Exporter</button>
          <button className="pm-btn pm-btn-primary" onClick={() => notify("Tous les paramètres sauvegardés", "green")}><Ico d={I.save} s={12} /> Tout sauvegarder</button>
        </div>
      </div>

      {/* ── LAYOUT ── */}
      <div className="pm-layout">

        {/* ── SIDEBAR ── */}
        <nav className="pm-nav">
          {NAV.map(group => (
            <div className="pm-nav-group" key={group.group}>
              <div className="pm-nav-group-label">{group.group}</div>
              {group.items.map(item => (
                <div key={item.id}
                  className={`pm-nav-item ${tab === item.id ? "active" : ""}`}
                  onClick={() => setTab(item.id)}>
                  <Ico d={item.icon} s={13} />
                  {item.label}
                  {item.badge && <span className="pm-nav-badge">{item.badge}</span>}
                </div>
              ))}
            </div>
          ))}
        </nav>

        {/* ── CONTENT ── */}
        <div className="pm-content">
          <div key={tab} className="pm-enter">
            {renderTab()}
          </div>
        </div>
      </div>
    </div>
  );
}