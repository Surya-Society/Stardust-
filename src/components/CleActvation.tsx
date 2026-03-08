import { useState } from "react";

// Types
interface ActivationKey {
  id: number;
  key: string;
  school: string;
  plan: "Basic" | "Premium" | "Enterprise";
  status: "active" | "expired" | "suspended" | "revoked";
  created: string;
  expires: string;
  uses: number;
  maxUses: number;
  hwLock: boolean;
  twoFa: boolean;
  ipRestrict: boolean;
  fingerprint: string;
  lastUsed: string;
  city: string;
  secScore: number;
  revocations: number;
  hash: string;
  activationMethod: "online" | "usb" | "file";
  events: Array<{
    dot: string;
    event: string;
    time: string;
  }>;
}

interface Toast {
  msg: string;
  type: "green" | "red" | "amber" | "blue";
}

interface FormData {
  school: string;
  plan: "Basic" | "Premium" | "Enterprise";
  expires: string;
  maxUses: string;
  hwLock: boolean;
  twoFa: boolean;
  ipRestrict: boolean;
  autoRevoke: boolean;
  activationMethod: "online" | "usb" | "file";
  note: string;
}

interface SecurityOption {
  key: keyof Pick<FormData, "hwLock" | "twoFa" | "ipRestrict" | "autoRevoke">;
  icon: string;
  name: string;
  desc: string;
}

interface BadgeProps {
  status: ActivationKey["status"];
}

interface SecurityScoreProps {
  score: number;
}

interface ToggleProps {
  on: boolean;
  onChange: () => void;
}

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
}

interface KeyCardProps {
  k: ActivationKey;
  selected: boolean;
  onSelect: () => void;
  onDetail: (key: ActivationKey) => void;
  onCopy: (key: string) => void;
  onSuspend: (id: number) => void;
  onReactivate: (id: number) => void;
  onRevoke: (key: ActivationKey) => void;
}

interface IcoProps {
  d: string;
  s?: number;
  sw?: number;
}

interface StatItem {
  label: string;
  val: number;
  color: string;
}

interface AuditItem {
  label: string;
  val: string;
  color: string;
}

interface CleActivationProps {
  onNotify?: (message: string, type: string) => void;
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');

.ka-root {
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
.ka-root * { box-sizing: border-box; margin: 0; padding: 0; }

.ka-topbar { display:flex; align-items:center; justify-content:space-between; padding:16px 0 20px; border-bottom:1px solid var(--border); margin-bottom:24px; }
.ka-title-row { display:flex; align-items:center; gap:12px; }
.ka-title-icon { width:32px; height:32px; background:var(--blue-dim); border:1px solid var(--blue-border); display:flex; align-items:center; justify-content:center; color:var(--blue); }
.ka-title { font-size:18px; font-weight:600; letter-spacing:-0.4px; }
.ka-subtitle { font-size:12px; color:var(--t3); margin-top:2px; font-family:var(--mono); }
.ka-topbar-actions { display:flex; gap:8px; align-items:center; }

.ka-stats { display:grid; grid-template-columns:repeat(5,1fr); border:1px solid var(--border); margin-bottom:20px; }
.ka-stat { padding:16px 20px; background:var(--panel); border-right:1px solid var(--border); position:relative; transition:background .15s; }
.ka-stat:last-child { border-right:none; }
.ka-stat:hover { background:var(--surface); }
.ka-stat-label { font-size:10px; font-weight:600; letter-spacing:1px; text-transform:uppercase; color:var(--t3); margin-bottom:8px; }
.ka-stat-val { font-size:26px; font-weight:300; letter-spacing:-1px; }
.ka-stat-bar { position:absolute; bottom:0; left:0; right:0; height:2px; }

.ka-toolbar { display:flex; gap:8px; margin-bottom:20px; align-items:center; flex-wrap:wrap; }
.ka-search { display:flex; align-items:center; gap:8px; background:var(--panel); border:1px solid var(--border); padding:0 12px; height:34px; flex:1; max-width:380px; transition:border-color .15s; }
.ka-search:focus-within { border-color:var(--blue); }
.ka-search input { background:none; border:none; outline:none; color:var(--t1); font-family:var(--font); font-size:13px; flex:1; }
.ka-search input::placeholder { color:var(--t3); }
.ka-filter-select { height:34px; background:var(--panel); border:1px solid var(--border); color:var(--t2); font-family:var(--font); font-size:12px; padding:0 10px; cursor:pointer; outline:none; appearance:none; transition:border-color .15s; }
.ka-filter-select:focus { border-color:var(--blue); color:var(--t1); }
.ka-toolbar-spacer { flex:1; }

.ka-btn { display:inline-flex; align-items:center; gap:6px; height:34px; padding:0 14px; font-family:var(--font); font-size:12px; font-weight:500; cursor:pointer; transition:all .15s; border:none; white-space:nowrap; }
.ka-btn-primary { background:var(--blue); color:#fff; }
.ka-btn-primary:hover { background:#58a6ff; }
.ka-btn-ghost { background:transparent; border:1px solid var(--border); color:var(--t2); }
.ka-btn-ghost:hover { border-color:var(--border-hi); color:var(--t1); background:var(--surface); }
.ka-btn-danger { background:var(--red-dim); border:1px solid var(--red-border); color:var(--red); }
.ka-btn-danger:hover { background:rgba(248,81,73,.15); }
.ka-btn-sm { height:28px; padding:0 10px; font-size:11px; }
.ka-btn-icon { width:28px; height:28px; padding:0; justify-content:center; }
.ka-btn:disabled { opacity:.4; cursor:not-allowed; }

.ka-bulk-bar { display:flex; align-items:center; gap:12px; padding:10px 16px; background:var(--blue-dim); border:1px solid var(--blue-border); margin-bottom:16px; font-size:12px; }
.ka-bulk-count { color:var(--blue); font-weight:600; }
.ka-bulk-sep { width:1px; height:16px; background:var(--blue-border); }

/* ── CARD GRID ── */
.ka-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:1px; background:var(--border); }

.ka-card { background:var(--panel); display:flex; flex-direction:column; transition:background .15s; cursor:pointer; position:relative; }
.ka-card:hover { background:var(--surface); }
.ka-card.selected { background:var(--blue-dim); }
.ka-card-accent { height:2px; width:100%; flex-shrink:0; }

.ka-card-head { padding:14px 16px 12px; display:flex; align-items:flex-start; justify-content:space-between; border-bottom:1px solid var(--border); }
.ka-card-head-left { display:flex; flex-direction:column; gap:4px; min-width:0; flex:1; }
.ka-card-school { font-size:13px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ka-card-city { font-size:11px; color:var(--t3); }
.ka-card-head-right { display:flex; align-items:center; gap:6px; flex-shrink:0; margin-left:10px; }

.ka-card-key-row { padding:9px 16px; display:flex; align-items:center; gap:8px; border-bottom:1px solid var(--border); background:var(--bg); }
.ka-card-key { font-family:var(--mono); font-size:11px; color:var(--t2); letter-spacing:0.3px; flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ka-copy-btn { background:none; border:none; color:var(--t3); cursor:pointer; display:flex; align-items:center; transition:color .15s; flex-shrink:0; padding:0; }
.ka-copy-btn:hover { color:var(--blue); }

.ka-card-meta { padding:10px 16px; display:grid; grid-template-columns:1fr 1fr; gap:10px 16px; border-bottom:1px solid var(--border); }
.ka-meta-label { font-size:10px; font-weight:600; letter-spacing:0.8px; text-transform:uppercase; color:var(--t3); margin-bottom:3px; }
.ka-meta-val { font-size:11.5px; color:var(--t2); font-family:var(--mono); }

.ka-usage-wrap { display:flex; align-items:center; gap:8px; }
.ka-usage-track { flex:1; height:2px; background:var(--elevated); }
.ka-usage-fill { height:100%; transition:width .4s; }
.ka-usage-txt { font-size:10px; color:var(--t3); font-family:var(--mono); min-width:28px; text-align:right; }

.ka-card-foot { padding:9px 16px; display:flex; align-items:center; justify-content:space-between; }
.ka-card-foot-left { display:flex; align-items:center; gap:8px; }
.ka-card-actions { display:flex; gap:4px; }

.ka-sec-row { display:flex; align-items:center; gap:4px; }
.ka-sec-ico { display:flex; align-items:center; opacity:.2; }
.ka-sec-ico.on { opacity:1; }

.ka-score-wrap { display:flex; align-items:center; gap:5px; }
.ka-score-bar { width:36px; height:2px; background:var(--elevated); }
.ka-score-fill { height:100%; }
.ka-score-num { font-size:11px; font-family:var(--mono); min-width:20px; }

.ka-method { font-size:10px; font-family:var(--mono); display:flex; align-items:center; gap:4px; }
.ka-method-dot { width:5px; height:5px; flex-shrink:0; }

.ka-hash { font-family:var(--mono); font-size:10px; color:var(--t3); background:var(--bg); padding:2px 6px; border:1px solid var(--border); }

.ka-badge { display:inline-flex; align-items:center; gap:4px; padding:2px 8px; font-size:11px; font-weight:500; }
.ka-badge-dot { width:5px; height:5px; flex-shrink:0; }
.ka-badge-green { background:var(--green-dim); color:var(--green); border:1px solid var(--green-border); }
.ka-badge-amber { background:var(--amber-dim); color:var(--amber); border:1px solid var(--amber-border); }
.ka-badge-red   { background:var(--red-dim);   color:var(--red);   border:1px solid var(--red-border); }
.ka-badge-blue  { background:var(--blue-dim);  color:var(--blue);  border:1px solid var(--blue-border); }
.ka-badge-gray  { background:var(--surface); color:var(--t3); border:1px solid var(--border); }

.ka-empty { padding:56px 0; text-align:center; color:var(--t3); background:var(--panel); border:1px solid var(--border); }
.ka-empty-title { font-size:14px; margin-top:12px; color:var(--t2); }
.ka-empty-sub { font-size:12px; margin-top:4px; }

.ka-pagination { display:flex; align-items:center; justify-content:space-between; padding:14px 0; border-top:1px solid var(--border); margin-top:1px; }
.ka-pag-info { font-size:12px; color:var(--t3); font-family:var(--mono); }
.ka-pag-btns { display:flex; gap:4px; }
.ka-pag-btn { width:28px; height:28px; background:var(--surface); border:1px solid var(--border); color:var(--t2); font-size:12px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .15s; }
.ka-pag-btn:hover { border-color:var(--border-hi); color:var(--t1); }
.ka-pag-btn.active { background:var(--blue); border-color:var(--blue); color:#fff; }
.ka-pag-btn:disabled { opacity:.3; cursor:not-allowed; }

.ka-checkbox { width:14px; height:14px; background:var(--bg); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; transition:all .15s; }
.ka-checkbox.checked { background:var(--blue); border-color:var(--blue); }

.ka-detail { position:fixed; right:0; top:0; bottom:0; width:380px; background:var(--panel); border-left:1px solid var(--border); z-index:200; animation:kaSlideRight .25s cubic-bezier(.4,0,.2,1); display:flex; flex-direction:column; overflow:hidden; }
@keyframes kaSlideRight { from{transform:translateX(100%)} to{transform:translateX(0)} }
.ka-detail-head { padding:16px 20px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; flex-shrink:0; }
.ka-detail-body { flex:1; overflow-y:auto; padding:20px; }
.ka-detail-section { margin-bottom:20px; }
.ka-detail-section-title { font-size:10px; font-weight:600; letter-spacing:1px; text-transform:uppercase; color:var(--t3); margin-bottom:10px; padding-bottom:6px; border-bottom:1px solid var(--border); }
.ka-detail-row { display:flex; align-items:flex-start; justify-content:space-between; padding:7px 0; border-bottom:1px solid var(--border); }
.ka-detail-row:last-child { border-bottom:none; }
.ka-detail-key { font-size:11px; color:var(--t3); flex-shrink:0; width:120px; }
.ka-detail-val { font-size:12px; color:var(--t1); text-align:right; font-family:var(--mono); }

.ka-timeline { display:flex; flex-direction:column; }
.ka-tl-item { display:flex; gap:10px; padding:6px 0; }
.ka-tl-line { display:flex; flex-direction:column; align-items:center; }
.ka-tl-dot { width:7px; height:7px; flex-shrink:0; margin-top:3px; }
.ka-tl-connector { width:1px; flex:1; background:var(--border); margin-top:4px; }
.ka-tl-item:last-child .ka-tl-connector { display:none; }
.ka-tl-content { padding-bottom:10px; }
.ka-tl-event { font-size:12px; color:var(--t2); }
.ka-tl-time { font-size:10px; color:var(--t3); margin-top:2px; font-family:var(--mono); }

.ka-audit-row { display:flex; align-items:center; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border); }
.ka-audit-row:last-child { border-bottom:none; }
.ka-audit-check { display:flex; align-items:center; gap:8px; font-size:12px; color:var(--t2); }

.ka-overlay { position:fixed; inset:0; background:rgba(0,0,0,.75); display:flex; align-items:center; justify-content:center; z-index:1000; padding:20px; animation:kaFadeIn .2s; }
@keyframes kaFadeIn { from{opacity:0} to{opacity:1} }
.ka-modal { background:var(--panel); border:1px solid var(--border-hi); width:100%; max-width:540px; animation:kaSlideUp .25s cubic-bezier(.4,0,.2,1); }
@keyframes kaSlideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
.ka-modal-head { padding:20px 24px 16px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; }
.ka-modal-title { font-size:14px; font-weight:600; }
.ka-modal-body { padding:20px 24px; max-height:70vh; overflow-y:auto; }
.ka-modal-foot { padding:16px 24px; border-top:1px solid var(--border); display:flex; justify-content:flex-end; gap:8px; }
.ka-close { width:24px; height:24px; background:none; border:none; color:var(--t3); cursor:pointer; display:flex; align-items:center; justify-content:center; transition:color .15s; }
.ka-close:hover { color:var(--t1); }

.ka-field { margin-bottom:14px; }
.ka-label { display:flex; align-items:center; gap:6px; font-size:11px; font-weight:600; letter-spacing:0.6px; text-transform:uppercase; color:var(--t3); margin-bottom:6px; }
.ka-input,.ka-select { width:100%; background:var(--bg); border:1px solid var(--border); padding:8px 11px; color:var(--t1); font-family:var(--font); font-size:13px; outline:none; transition:border-color .15s; }
.ka-input:focus,.ka-select:focus { border-color:var(--blue); }
.ka-input::placeholder { color:var(--t3); }
.ka-select { cursor:pointer; appearance:none; }
.ka-select option { background:var(--panel); }
.ka-textarea { width:100%; background:var(--bg); border:1px solid var(--border); padding:8px 11px; color:var(--t1); font-family:var(--font); font-size:13px; outline:none; resize:vertical; min-height:56px; transition:border-color .15s; }
.ka-textarea:focus { border-color:var(--blue); }
.ka-field-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.ka-key-preview-box { background:var(--bg); border:1px solid var(--border); padding:10px 14px; display:flex; align-items:center; justify-content:space-between; margin-top:6px; }
.ka-key-preview-val { font-family:var(--mono); font-size:12px; color:var(--blue); letter-spacing:0.5px; }
.ka-key-preview-refresh { background:none; border:none; color:var(--t3); cursor:pointer; display:flex; align-items:center; transition:color .15s; }
.ka-key-preview-refresh:hover { color:var(--blue); }
.ka-sec-opts { display:flex; flex-direction:column; gap:6px; margin-top:4px; }
.ka-sec-opt { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; background:var(--bg); border:1px solid var(--border); cursor:pointer; transition:border-color .15s; user-select:none; }
.ka-sec-opt:hover { border-color:var(--border-hi); }
.ka-sec-opt.enabled { border-color:var(--blue-border); background:var(--blue-dim); }
.ka-sec-opt-left { display:flex; align-items:center; gap:10px; }
.ka-sec-opt-icon { width:28px; height:28px; display:flex; align-items:center; justify-content:center; color:var(--t2); }
.ka-sec-opt.enabled .ka-sec-opt-icon { color:var(--blue); }
.ka-sec-opt-name { font-size:12px; font-weight:500; }
.ka-sec-opt-desc { font-size:11px; color:var(--t3); margin-top:1px; }
.ka-toggle { width:32px; height:18px; background:var(--elevated); border:1px solid var(--border); position:relative; transition:all .2s; cursor:pointer; flex-shrink:0; }
.ka-toggle.on { background:var(--blue); border-color:var(--blue); }
.ka-toggle-knob { position:absolute; top:2px; left:2px; width:12px; height:12px; background:var(--t2); transition:transform .2s,background .2s; }
.ka-toggle.on .ka-toggle-knob { transform:translateX(14px); background:#fff; }

.ka-toast { position:fixed; bottom:24px; right:24px; background:var(--elevated); border:1px solid var(--border-hi); padding:10px 16px; display:flex; align-items:center; gap:10px; z-index:9999; font-size:12px; min-width:280px; animation:kaSlideUp .25s cubic-bezier(.4,0,.2,1); }
.ka-toast-dot { width:6px; height:6px; flex-shrink:0; }

@keyframes kaEnter { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
.ka-enter { animation:kaEnter .3s cubic-bezier(.4,0,.2,1) both; }
.ka-d1 { animation-delay:.05s; }
.ka-d2 { animation-delay:.10s; }
.ka-d3 { animation-delay:.15s; }

@media(max-width:900px) { .ka-stats{grid-template-columns:repeat(3,1fr)} .ka-grid{grid-template-columns:1fr} .ka-detail{width:100%} }
@media(max-width:640px) { .ka-stats{grid-template-columns:repeat(2,1fr)} .ka-toolbar{flex-wrap:wrap} .ka-search{max-width:100%;flex:1 1 100%} }
`;

const Ico = ({ d, s = 14, sw = 1.5 }: IcoProps) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const I = {
  key:     "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4",
  plus:    "M12 5v14M5 12h14",
  copy:    "M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-4-4H8zM14 4v4h4",
  search:  "M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z",
  close:   "M18 6L6 18M6 6l12 12",
  check:   "M20 6L9 17l-5-5",
  refresh: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
  shield:  "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  ban:     "M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636",
  lock:    "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4",
  eye:     "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  warn:    "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
  clock:   "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  download:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 0-2-2v-4M7 10l5 5 5-5M12 15V3",
  trash:   "M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
  export:  "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12",
  chip:    "M9 3H5a2 2 0 0 0-2 2v4m6-6h6m-6 0v18m6-18h4a2 2 0 0 1 2 2v4m-6-6v18m0 0H9m6 0h4a2 2 0 0 0 2-2v-4M3 9v6m18-6v6M3 15h2m14 0h2M3 9h2m14 0h2",
  fingerp: "M12 10c-1.1 0-2 .9-2 2M18 10c0 4.4-1.8 8-6 8s-6-3.6-6-8a6 6 0 0 1 12 0zM12 2a8 8 0 0 0-8 8",
  globe:   "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
  network: "M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18",
  hash:    "M4 9h16M4 15h16M10 3L8 21M16 3l-2 18",
  filter:  "M22 3H2l8 9.46V19l4 2v-8.54L22 3",
};

const KEYS_DATA: ActivationKey[] = [
  { id:1, key:"SCO-2025-ABCD-1234", school:"Lycée Victor Hugo", plan:"Enterprise", status:"active", created:"12 Jan 2025", expires:"12 Jan 2026", uses:48, maxUses:150, hwLock:true, twoFa:true, ipRestrict:false, fingerprint:"a3f2b1c9", lastUsed:"Il y a 2h", city:"Paris, FR", secScore:92, revocations:0, hash:"sha256:8f4a", activationMethod:"online", events:[{dot:"#3fb950",event:"Activation en ligne réussie",time:"12 Jan 2025 · 14:23"},{dot:"#388bfd",event:"Renouvellement automatique configuré",time:"12 Jan 2025 · 14:25"},{dot:"#388bfd",event:"48 nouvelles sessions actives",time:"Hier · 09:00"}] },
  { id:2, key:"SCO-2025-EFGH-5678", school:"Collège Jean Moulin", plan:"Enterprise", status:"active", created:"03 Fév 2025", expires:"03 Fév 2026", uses:120, maxUses:200, hwLock:true, twoFa:true, ipRestrict:true, fingerprint:"d7e5f3a2", lastUsed:"Il y a 15min", city:"Lyon, FR", secScore:98, revocations:0, hash:"sha256:2c9e", activationMethod:"usb", events:[{dot:"#3fb950",event:"Activation USB (Ed25519 validé)",time:"03 Fév 2025 · 11:05"},{dot:"#d29922",event:"Restriction IP activée",time:"03 Fév 2025 · 11:10"}] },
  { id:3, key:"SCO-2024-IJKL-9012", school:"École Primaire Pasteur", plan:"Basic", status:"expired", created:"15 Nov 2023", expires:"15 Nov 2024", uses:30, maxUses:50, hwLock:false, twoFa:false, ipRestrict:false, fingerprint:"b1c4d8e0", lastUsed:"Il y a 45j", city:"Bordeaux, FR", secScore:34, revocations:0, hash:"sha256:5f1b", activationMethod:"file", events:[{dot:"#3fb950",event:"Activation via fichier .licpkg",time:"15 Nov 2023 · 09:00"},{dot:"#f85149",event:"Licence expirée — accès bloqué",time:"15 Nov 2024 · 00:00"}] },
  { id:4, key:"SCO-2025-MNOP-3456", school:"Lycée Technique Rodin", plan:"Premium", status:"suspended", created:"22 Mar 2025", expires:"22 Mar 2026", uses:0, maxUses:100, hwLock:false, twoFa:false, ipRestrict:false, fingerprint:"f9a2c7b5", lastUsed:"Jamais", city:"Marseille, FR", secScore:15, revocations:1, hash:"sha256:3d8c", activationMethod:"online", events:[{dot:"#f85149",event:"Suspension administrative (impayé)",time:"22 Mar 2025 · 16:00"},{dot:"#d29922",event:"Tentative d'accès bloquée",time:"24 Mar 2025 · 10:42"}] },
  { id:5, key:"SCO-2025-QRST-7890", school:"IUT de Bordeaux", plan:"Enterprise", status:"active", created:"01 Avr 2025", expires:"01 Avr 2026", uses:89, maxUses:250, hwLock:true, twoFa:true, ipRestrict:true, fingerprint:"e4d3c2b1", lastUsed:"Il y a 5min", city:"Bordeaux, FR", secScore:100, revocations:0, hash:"sha256:7a2f", activationMethod:"usb", events:[{dot:"#3fb950",event:"Activation USB + Hardware lock",time:"01 Avr 2025 · 08:00"},{dot:"#3fb950",event:"2FA configuré",time:"01 Avr 2025 · 08:05"}] },
  { id:6, key:"SCO-2025-UVWX-4321", school:"Lycée Carnot", plan:"Premium", status:"active", created:"10 Fév 2025", expires:"10 Fév 2026", uses:67, maxUses:120, hwLock:true, twoFa:false, ipRestrict:false, fingerprint:"c3b2a1d0", lastUsed:"Il y a 1h", city:"Dijon, FR", secScore:61, revocations:0, hash:"sha256:1a3c", activationMethod:"online", events:[{dot:"#3fb950",event:"Activation en ligne réussie",time:"10 Fév 2025 · 10:00"}] },
];

const METHOD_LABELS: Record<ActivationKey["activationMethod"], string> = { online:"En ligne", usb:"Clé USB", file:"Fichier .licpkg" };
const METHOD_COLORS: Record<ActivationKey["activationMethod"], string> = { online:"#3fb950", usb:"#388bfd", file:"#d29922" };
const STATUS_ACCENT: Record<ActivationKey["status"], string> = { active:"#3fb950", expired:"#d29922", suspended:"#f85149", revoked:"#f85149" };

function seg(): string { return Math.random().toString(36).substring(2,6).toUpperCase(); }
function genKey(): string { return `SCO-2025-${seg()}-${seg()}`; }

function Badge({ status }: BadgeProps) {
  const M: Record<ActivationKey["status"], [string, string]> = {
    active: ["ka-badge-green","Actif"],
    expired: ["ka-badge-amber","Expiré"],
    suspended: ["ka-badge-red","Suspendu"],
    revoked: ["ka-badge-red","Révoqué"]
  };
  const [cls, lbl] = M[status] || ["ka-badge-gray",status];
  const dotColors: Record<string, string> = {
    "ka-badge-green": "#3fb950",
    "ka-badge-amber": "#d29922",
    "ka-badge-red": "#f85149",
    "ka-badge-gray": "#484f58"
  };
  const dotColor = dotColors[cls];
  return <span className={`ka-badge ${cls}`}><span className="ka-badge-dot" style={{background:dotColor}}/>{lbl}</span>;
}

function SecurityScore({ score }: SecurityScoreProps) {
  const color = score >= 80 ? "#3fb950" : score >= 50 ? "#d29922" : "#f85149";
  return (
    <div className="ka-score-wrap">
      <span className="ka-score-num" style={{color}}>{score}</span>
      <div className="ka-score-bar"><div className="ka-score-fill" style={{width:`${score}%`,background:color}}/></div>
    </div>
  );
}

function Toggle({ on, onChange }: ToggleProps) {
  return <div className={`ka-toggle ${on?"on":""}`} onClick={onChange}><div className="ka-toggle-knob"/></div>;
}

function Checkbox({ checked, onChange }: CheckboxProps) {
  return (
    <div className={`ka-checkbox ${checked?"checked":""}`} onClick={(e) => { e.stopPropagation(); onChange(); }}>
      {checked && <Ico d={I.check} s={10} sw={2.5}/>}
    </div>
  );
}

function KeyCard({ k, selected, onSelect, onDetail, onCopy, onSuspend, onReactivate, onRevoke }: KeyCardProps) {
  const pct = Math.min(k.uses/k.maxUses*100,100);
  const usageColor = pct>85?"#f85149":pct>60?"#d29922":"#388bfd";
  const planCls = k.plan==="Enterprise"?"ka-badge-blue":k.plan==="Premium"?"ka-badge-green":"ka-badge-gray";

  return (
    <div className={`ka-card ${selected?"selected":""}`} onClick={() => onDetail(k)}>
      <div className="ka-card-accent" style={{background:STATUS_ACCENT[k.status]||"#484f58"}}/>

      <div className="ka-card-head">
        <div className="ka-card-head-left">
          <div className="ka-card-school">{k.school}</div>
          <div className="ka-card-city">{k.city}</div>
        </div>
        <div className="ka-card-head-right">
          <Badge status={k.status}/>
          <Checkbox checked={selected} onChange={onSelect}/>
        </div>
      </div>

      <div className="ka-card-key-row">
        <Ico d={I.key} s={11}/>
        <span className="ka-card-key">{k.key}</span>
        <button className="ka-copy-btn" onClick={(e) => { e.stopPropagation(); onCopy(k.key); }} title="Copier"><Ico d={I.copy} s={12}/></button>
      </div>

      <div className="ka-card-meta">
        <div>
          <div className="ka-meta-label">Plan</div>
          <span className={`ka-badge ${planCls}`} style={{fontSize:10}}>{k.plan}</span>
        </div>
        <div>
          <div className="ka-meta-label">Expiration</div>
          <div className="ka-meta-val">{k.expires}</div>
        </div>
        <div>
          <div className="ka-meta-label">Méthode</div>
          <div className="ka-method">
            <span className="ka-method-dot" style={{background:METHOD_COLORS[k.activationMethod]}}/>
            <span style={{color:METHOD_COLORS[k.activationMethod]}}>{METHOD_LABELS[k.activationMethod]}</span>
          </div>
        </div>
        <div>
          <div className="ka-meta-label">Dernier accès</div>
          <div className="ka-meta-val">{k.lastUsed}</div>
        </div>
        <div style={{gridColumn:"1 / -1"}}>
          <div className="ka-meta-label">Utilisation — {k.uses}/{k.maxUses}</div>
          <div className="ka-usage-wrap">
            <div className="ka-usage-track"><div className="ka-usage-fill" style={{width:`${pct}%`,background:usageColor}}/></div>
            <span className="ka-usage-txt">{Math.round(pct)}%</span>
          </div>
        </div>
      </div>

      <div className="ka-card-foot">
        <div className="ka-card-foot-left">
          <div className="ka-sec-row">
            <span className={`ka-sec-ico ${k.hwLock?"on":""}`} title="Hardware Lock" style={{color:"#388bfd"}}><Ico d={I.chip} s={11}/></span>
            <span className={`ka-sec-ico ${k.twoFa?"on":""}`} title="2FA" style={{color:"#3fb950"}}><Ico d={I.fingerp} s={11}/></span>
            <span className={`ka-sec-ico ${k.ipRestrict?"on":""}`} title="IP Restrict" style={{color:"#d29922"}}><Ico d={I.lock} s={11}/></span>
          </div>
          <SecurityScore score={k.secScore}/>
          <span className="ka-hash">{k.fingerprint}</span>
        </div>
        <div className="ka-card-actions" onClick={e => e.stopPropagation()}>
          {k.status==="active" && <button className="ka-btn ka-btn-ghost ka-btn-icon ka-btn-sm" title="Suspendre" onClick={() => onSuspend(k.id)}><Ico d={I.ban} s={11}/></button>}
          {k.status==="suspended" && <button className="ka-btn ka-btn-ghost ka-btn-icon ka-btn-sm" title="Réactiver" onClick={() => onReactivate(k.id)}><Ico d={I.check} s={11}/></button>}
          <button className="ka-btn ka-btn-danger ka-btn-icon ka-btn-sm" title="Révoquer" onClick={() => onRevoke(k)}><Ico d={I.trash} s={11}/></button>
        </div>
      </div>
    </div>
  );
}

export default function CleActivation({ onNotify }: CleActivationProps) {
  const notify = onNotify || ((message: string, type: string) => console.log(message, type));
  const [keys, setKeys] = useState<ActivationKey[]>(KEYS_DATA);
  const [search, setSearch] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPlan, setFilterPlan] = useState<string>("all");
  const [filterMethod, setFilterMethod] = useState<string>("all");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [detailKey, setDetailKey] = useState<ActivationKey | null>(null);
  const [modal, setModal] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [previewKey, setPreviewKey] = useState<string>(genKey());
  const [toast, setToast] = useState<Toast | null>(null);
  const [form, setForm] = useState<FormData>({
    school: "",
    plan: "Enterprise",
    expires: "",
    maxUses: "150",
    hwLock: true,
    twoFa: true,
    ipRestrict: false,
    autoRevoke: false,
    activationMethod: "online",
    note: ""
  });

  const PER_PAGE = 9;

  function showToast(msg: string, type: Toast["type"] = "green"): void {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
    notify(msg, type);
  }

  const filtered = keys.filter(k => {
    const q = search.toLowerCase();
    return (!q || k.school.toLowerCase().includes(q) || k.key.toLowerCase().includes(q) || k.fingerprint.includes(q))
      && (filterStatus === "all" || k.status === filterStatus)
      && (filterPlan === "all" || k.plan === filterPlan)
      && (filterMethod === "all" || k.activationMethod === filterMethod);
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function toggleSelect(id: number): void {
    setSelected(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function handleGenerate(): void {
    const newKey: ActivationKey = {
      id: Date.now(),
      key: previewKey,
      school: form.school || "—",
      plan: form.plan,
      status: "active",
      created: new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }),
      expires: form.expires || "—",
      uses: 0,
      maxUses: parseInt(form.maxUses) || 150,
      hwLock: form.hwLock,
      twoFa: form.twoFa,
      ipRestrict: form.ipRestrict,
      fingerprint: Math.random().toString(16).substring(2, 10),
      lastUsed: "Jamais",
      city: "—",
      secScore: (form.hwLock ? 30 : 0) + (form.twoFa ? 30 : 0) + (form.ipRestrict ? 20 : 0) + 20,
      revocations: 0,
      hash: "sha256:" + Math.random().toString(16).substring(2, 6),
      activationMethod: form.activationMethod,
      events: [{
        dot: "#3fb950",
        event: `Générée — ${METHOD_LABELS[form.activationMethod]}`,
        time: "À l'instant"
      }]
    };
    setKeys(k => [newKey, ...k]);
    setModal(null);
    showToast("Clé générée avec succès", "green");
  }

  function handleSuspend(id: number): void {
    setKeys(k => k.map(x => x.id === id ? { ...x, status: "suspended" } : x));
    showToast("Clé suspendue", "amber");
    if (detailKey?.id === id) setDetailKey(p => p ? { ...p, status: "suspended" } : null);
  }

  function handleReactivate(id: number): void {
    setKeys(k => k.map(x => x.id === id ? { ...x, status: "active" } : x));
    showToast("Clé réactivée", "green");
    if (detailKey?.id === id) setDetailKey(p => p ? { ...p, status: "active" } : null);
  }

  function handleRevoke(target: number | ActivationKey): void {
    if (typeof target === "number") {
      setKeys(k => k.map(x => x.id === target ? { ...x, status: "revoked" } : x));
    } else {
      setDetailKey(target);
      setModal("revoke");
    }
  }

  function confirmRevoke(): void {
    if (detailKey) {
      setKeys(k => k.map(x => x.id === detailKey.id ? { ...x, status: "revoked" } : x));
      showToast("Clé révoquée", "red");
      setModal(null);
      setDetailKey(null);
    }
  }

  function handleCopy(key: string): void {
    navigator.clipboard?.writeText(key);
    showToast("Clé copiée", "green");
  }

  const stats = {
    total: keys.length,
    active: keys.filter(k => k.status === "active").length,
    expired: keys.filter(k => k.status === "expired").length,
    suspended: keys.filter(k => k.status === "suspended" || k.status === "revoked").length,
    secAvg: Math.round(keys.reduce((s, k) => s + k.secScore, 0) / keys.length)
  };

  const securityOptions: SecurityOption[] = [
    { key: "hwLock", icon: I.chip, name: "Hardware Lock", desc: "Lie la clé à l'empreinte BIOS/UUID" },
    { key: "twoFa", icon: I.fingerp, name: "2FA TOTP", desc: "Authentification obligatoire à chaque activation" },
    { key: "ipRestrict", icon: I.network, name: "Restriction IP", desc: "Limite l'accès à une plage IP définie" },
    { key: "autoRevoke", icon: I.warn, name: "Révocation auto", desc: "Révoque si détection de clonage ou anomalie" }
  ];

  const statItems: StatItem[] = [
    { label: "Total", val: stats.total, color: "#8b949e" },
    { label: "Actives", val: stats.active, color: "#3fb950" },
    { label: "Expirées", val: stats.expired, color: "#d29922" },
    { label: "Suspendues", val: stats.suspended, color: "#f85149" },
    { label: "Score sécu. moy.", val: stats.secAvg, color: stats.secAvg >= 80 ? "#3fb950" : stats.secAvg >= 50 ? "#d29922" : "#f85149" }
  ];

  const auditItems: AuditItem[] = [
    { label: "Score global", val: `${stats.secAvg}/100`, color: stats.secAvg >= 80 ? "#3fb950" : "#d29922" },
    { label: "HW Lock actif", val: `${keys.filter(k => k.hwLock).length}/${keys.length}`, color: "#388bfd" },
    { label: "2FA actif", val: `${keys.filter(k => k.twoFa).length}/${keys.length}`, color: "#3fb950" }
  ];

  return (
    <div className="ka-root">
      <style>{CSS}</style>

      {/* TOPBAR */}
      <div className="ka-topbar ka-enter">
        <div className="ka-title-row">
          <div className="ka-title-icon"><Ico d={I.key} s={16}/></div>
          <div>
            <div className="ka-title">Clés d'Activation</div>
            <div className="ka-subtitle">{keys.length} clés enregistrées · {stats.active} actives</div>
          </div>
        </div>
        <div className="ka-topbar-actions">
          <button className="ka-btn ka-btn-ghost" onClick={() => setModal("audit")}><Ico d={I.shield} s={13}/> Audit sécurité</button>
          <button className="ka-btn ka-btn-ghost" onClick={() => showToast("Export CSV…", "blue")}><Ico d={I.export} s={13}/> Exporter</button>
          <button className="ka-btn ka-btn-primary" onClick={() => { setPreviewKey(genKey()); setModal("generate"); }}><Ico d={I.plus} s={13}/> Générer une clé</button>
        </div>
      </div>

      {/* STATS */}
      <div className="ka-stats ka-enter ka-d1">
        {statItems.map((s, i) => (
          <div className="ka-stat" key={i}>
            <div className="ka-stat-label">{s.label}</div>
            <div className="ka-stat-val" style={{ color: s.color }}>{s.val}</div>
            <div className="ka-stat-bar" style={{ background: s.color }}/>
          </div>
        ))}
      </div>

      {/* TOOLBAR */}
      <div className="ka-toolbar ka-enter ka-d2">
        <div className="ka-search">
          <Ico d={I.search} s={13}/>
          <input placeholder="Rechercher clé, établissement, fingerprint…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}/>
        </div>
        <select className="ka-filter-select" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
          <option value="all">Tous statuts</option><option value="active">Actives</option><option value="expired">Expirées</option><option value="suspended">Suspendues</option>
        </select>
        <select className="ka-filter-select" value={filterPlan} onChange={e => { setFilterPlan(e.target.value); setPage(1); }}>
          <option value="all">Tous plans</option><option value="Basic">Basic</option><option value="Premium">Premium</option><option value="Enterprise">Enterprise</option>
        </select>
        <select className="ka-filter-select" value={filterMethod} onChange={e => { setFilterMethod(e.target.value); setPage(1); }}>
          <option value="all">Toutes méthodes</option><option value="online">En ligne</option><option value="usb">Clé USB</option><option value="file">Fichier</option>
        </select>
        <div className="ka-toolbar-spacer"/>
        <span style={{ fontSize: 11, color: "var(--t3)", fontFamily: "var(--mono)" }}>{filtered.length} résultat{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* BULK BAR */}
      {selected.size > 0 && (
        <div className="ka-bulk-bar">
          <span className="ka-bulk-count">{selected.size} sélectionné{selected.size > 1 ? "s" : ""}</span>
          <div className="ka-bulk-sep"/>
          <button className="ka-btn ka-btn-ghost ka-btn-sm" onClick={() => { selected.forEach(id => handleSuspend(id)); setSelected(new Set()); }}><Ico d={I.ban} s={12}/> Suspendre</button>
          <button className="ka-btn ka-btn-danger ka-btn-sm" onClick={() => { selected.forEach(id => setKeys(k => k.map(x => x.id === id ? { ...x, status: "revoked" } : x))); showToast(`${selected.size} clé(s) révoquées`, "red"); setSelected(new Set()); }}><Ico d={I.trash} s={12}/> Révoquer</button>
          <button className="ka-btn ka-btn-ghost ka-btn-sm" onClick={() => showToast("Export sélection…", "blue")}><Ico d={I.export} s={12}/> Exporter</button>
          <div className="ka-toolbar-spacer"/>
          <button className="ka-btn ka-btn-ghost ka-btn-sm" onClick={() => setSelected(new Set())}><Ico d={I.close} s={12}/> Désélectionner</button>
        </div>
      )}

      {/* CARD GRID */}
      <div className="ka-enter ka-d3">
        {paginated.length === 0 ? (
          <div className="ka-empty">
            <Ico d={I.search} s={32}/>
            <div className="ka-empty-title">Aucune clé trouvée</div>
            <div className="ka-empty-sub">Modifiez vos filtres ou générez une nouvelle clé</div>
          </div>
        ) : (
          <div className="ka-grid">
            {paginated.map(k => (
              <KeyCard
                key={k.id}
                k={k}
                selected={selected.has(k.id)}
                onSelect={() => toggleSelect(k.id)}
                onDetail={setDetailKey}
                onCopy={handleCopy}
                onSuspend={handleSuspend}
                onReactivate={handleReactivate}
                onRevoke={handleRevoke}
              />
            ))}
          </div>
        )}
        {totalPages > 1 && (
          <div className="ka-pagination">
            <span className="ka-pag-info">{(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} sur {filtered.length}</span>
            <div className="ka-pag-btns">
              <button className="ka-pag-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} className={`ka-pag-btn ${page === i + 1 ? "active" : ""}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
              ))}
              <button className="ka-pag-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL PANEL */}
      {detailKey && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 199 }} onClick={() => setDetailKey(null)}/>
          <div className="ka-detail">
            <div className="ka-detail-head">
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{detailKey.school}</div>
                <div style={{ fontSize: 11, color: "var(--t3)", fontFamily: "var(--mono)", marginTop: 2 }}>{detailKey.key}</div>
              </div>
              <button className="ka-close" onClick={() => setDetailKey(null)}><Ico d={I.close} s={14}/></button>
            </div>
            <div className="ka-detail-body">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, padding: "12px 14px", background: "var(--surface)", border: "1px solid var(--border)" }}>
                <Badge status={detailKey.status}/>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: "var(--t3)", marginBottom: 4, letterSpacing: "0.8px", textTransform: "uppercase" }}>Score sécurité</div>
                  <SecurityScore score={detailKey.secScore}/>
                </div>
              </div>
              <div className="ka-detail-section">
                <div className="ka-detail-section-title">Informations</div>
                {[
                  ["Plan", detailKey.plan],
                  ["Créée le", detailKey.created],
                  ["Expiration", detailKey.expires],
                  ["Utilisation", `${detailKey.uses} / ${detailKey.maxUses}`],
                  ["Dernier accès", detailKey.lastUsed],
                  ["Localisation", detailKey.city],
                  ["Méthode", METHOD_LABELS[detailKey.activationMethod]],
                  ["Fingerprint", detailKey.fingerprint],
                  ["Hash", detailKey.hash],
                  ["Révocations", detailKey.revocations]
                ].map(([k, v]) => (
                  <div className="ka-detail-row" key={k}><span className="ka-detail-key">{k}</span><span className="ka-detail-val">{v}</span></div>
                ))}
              </div>
              <div className="ka-detail-section">
                <div className="ka-detail-section-title">Protections actives</div>
                {[
                  { icon: I.chip, label: "Hardware Lock", on: detailKey.hwLock },
                  { icon: I.fingerp, label: "2FA TOTP", on: detailKey.twoFa },
                  { icon: I.network, label: "Restriction IP", on: detailKey.ipRestrict }
                ].map(p => (
                  <div className="ka-audit-row" key={p.label}>
                    <div className="ka-audit-check"><Ico d={p.icon} s={13}/><span style={{ color: p.on ? "var(--t1)" : "var(--t3)" }}>{p.label}</span></div>
                    <span className={`ka-badge ${p.on ? "ka-badge-green" : "ka-badge-gray"}`}>{p.on ? "Actif" : "Inactif"}</span>
                  </div>
                ))}
              </div>
              <div className="ka-detail-section">
                <div className="ka-detail-section-title">Historique d'activité</div>
                <div className="ka-timeline">
                  {detailKey.events.map((e, i) => (
                    <div className="ka-tl-item" key={i}>
                      <div className="ka-tl-line"><div className="ka-tl-dot" style={{ background: e.dot }}/><div className="ka-tl-connector"/></div>
                      <div className="ka-tl-content"><div className="ka-tl-event">{e.event}</div><div className="ka-tl-time">{e.time}</div></div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {detailKey.status === "active" && <button className="ka-btn ka-btn-ghost" style={{ width: "100%", justifyContent: "center" }} onClick={() => { handleSuspend(detailKey.id); setDetailKey(null); }}><Ico d={I.ban} s={13}/> Suspendre</button>}
                {detailKey.status === "suspended" && <button className="ka-btn ka-btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => { handleReactivate(detailKey.id); setDetailKey(null); }}><Ico d={I.check} s={13}/> Réactiver</button>}
                <button className="ka-btn ka-btn-ghost" style={{ width: "100%", justifyContent: "center" }} onClick={() => handleCopy(detailKey.key)}><Ico d={I.copy} s={13}/> Copier la clé</button>
                <button className="ka-btn ka-btn-danger" style={{ width: "100%", justifyContent: "center" }} onClick={() => setModal("revoke")}><Ico d={I.trash} s={13}/> Révoquer définitivement</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* MODAL GÉNÉRER */}
      {modal === "generate" && (
        <div className="ka-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="ka-modal">
            <div className="ka-modal-head">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, background: "var(--blue-dim)", border: "1px solid var(--blue-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--blue)" }}><Ico d={I.key} s={14}/></div>
                <span className="ka-modal-title">Générer une clé d'activation</span>
              </div>
              <button className="ka-close" onClick={() => setModal(null)}><Ico d={I.close} s={14}/></button>
            </div>
            <div className="ka-modal-body">
              <div className="ka-field">
                <div className="ka-label"><Ico d={I.globe} s={11}/> Établissement</div>
                <input className="ka-input" placeholder="Nom de l'établissement" value={form.school} onChange={e => setForm({ ...form, school: e.target.value })}/>
              </div>
              <div className="ka-field-row">
                <div className="ka-field">
                  <div className="ka-label">Plan</div>
                  <select className="ka-select" value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value as FormData["plan"] })}>
                    <option value="Basic">Basic — 99€/mois</option><option value="Premium">Premium — 299€/mois</option><option value="Enterprise">Enterprise — 599€/mois</option>
                  </select>
                </div>
                <div className="ka-field">
                  <div className="ka-label">Max utilisateurs</div>
                  <input className="ka-input" type="number" value={form.maxUses} onChange={e => setForm({ ...form, maxUses: e.target.value })}/>
                </div>
              </div>
              <div className="ka-field-row">
                <div className="ka-field">
                  <div className="ka-label"><Ico d={I.clock} s={11}/> Expiration</div>
                  <input className="ka-input" type="date" value={form.expires} onChange={e => setForm({ ...form, expires: e.target.value })}/>
                </div>
                <div className="ka-field">
                  <div className="ka-label">Méthode d'activation</div>
                  <select className="ka-select" value={form.activationMethod} onChange={e => setForm({ ...form, activationMethod: e.target.value as FormData["activationMethod"] })}>
                    <option value="online">En ligne</option><option value="usb">Clé USB</option><option value="file">Fichier .licpkg</option>
                  </select>
                </div>
              </div>
              <div className="ka-field">
                <div className="ka-label"><Ico d={I.shield} s={11}/> Sécurité avancée</div>
                <div className="ka-sec-opts">
                  {securityOptions.map(opt => (
                    <div
                      key={opt.key}
                      className={`ka-sec-opt ${form[opt.key] ? "enabled" : ""}`}
                      onClick={() => setForm(f => ({ ...f, [opt.key]: !f[opt.key] }))}
                    >
                      <div className="ka-sec-opt-left">
                        <div className="ka-sec-opt-icon"><Ico d={opt.icon} s={14}/></div>
                        <div><div className="ka-sec-opt-name">{opt.name}</div><div className="ka-sec-opt-desc">{opt.desc}</div></div>
                      </div>
                      <Toggle on={form[opt.key]} onChange={() => {}}/>
                    </div>
                  ))}
                </div>
              </div>
              <div className="ka-field">
                <div className="ka-label"><Ico d={I.hash} s={11}/> Aperçu de la clé</div>
                <div className="ka-key-preview-box">
                  <span className="ka-key-preview-val">{previewKey}</span>
                  <button className="ka-key-preview-refresh" onClick={() => setPreviewKey(genKey())}><Ico d={I.refresh} s={14}/></button>
                </div>
              </div>
              <div className="ka-field">
                <div className="ka-label">Note interne (optionnel)</div>
                <textarea className="ka-textarea" rows={2} placeholder="Remarque, contexte, référence commande…" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })}/>
              </div>
            </div>
            <div className="ka-modal-foot">
              <button className="ka-btn ka-btn-ghost" onClick={() => setModal(null)}>Annuler</button>
              <button className="ka-btn ka-btn-primary" onClick={handleGenerate} disabled={!form.school}><Ico d={I.check} s={13}/> Générer et envoyer</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL RÉVOQUER */}
      {modal === "revoke" && (
        <div className="ka-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="ka-modal" style={{ maxWidth: 420 }}>
            <div className="ka-modal-head">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, background: "var(--red-dim)", border: "1px solid var(--red-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--red)" }}><Ico d={I.warn} s={14}/></div>
                <span className="ka-modal-title">Confirmer la révocation</span>
              </div>
              <button className="ka-close" onClick={() => setModal(null)}><Ico d={I.close} s={14}/></button>
            </div>
            <div className="ka-modal-body">
              <div style={{ padding: "12px 14px", background: "var(--red-dim)", border: "1px solid var(--red-border)", marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "var(--red)", fontWeight: 500, marginBottom: 4 }}>Action irréversible</div>
                <div style={{ fontSize: 12, color: "var(--t2)" }}>La clé <span style={{ fontFamily: "var(--mono)" }}>{detailKey?.key}</span> sera révoquée. L'établissement {detailKey?.school} sera déconnecté immédiatement.</div>
              </div>
              <div className="ka-field">
                <div className="ka-label">Raison de la révocation</div>
                <select className="ka-select">
                  <option>Non-paiement</option>
                  <option>Abus détecté</option>
                  <option>Clé compromise</option>
                  <option>Résiliation client</option>
                  <option>Autre</option>
                </select>
              </div>
            </div>
            <div className="ka-modal-foot">
              <button className="ka-btn ka-btn-ghost" onClick={() => setModal(null)}>Annuler</button>
              <button className="ka-btn ka-btn-danger" onClick={confirmRevoke}><Ico d={I.trash} s={13}/> Révoquer définitivement</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AUDIT */}
      {modal === "audit" && (
        <div className="ka-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="ka-modal">
            <div className="ka-modal-head">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, background: "var(--green-dim)", border: "1px solid var(--green-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--green)" }}><Ico d={I.shield} s={14}/></div>
                <span className="ka-modal-title">Rapport d'audit sécurité</span>
              </div>
              <button className="ka-close" onClick={() => setModal(null)}><Ico d={I.close} s={14}/></button>
            </div>
            <div className="ka-modal-body">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "var(--border)", border: "1px solid var(--border)", marginBottom: 20 }}>
                {auditItems.map(s => (
                  <div key={s.label} style={{ background: "var(--panel)", padding: "14px 16px" }}>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--t3)", marginBottom: 6 }}>{s.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 300, color: s.color }}>{s.val}</div>
                  </div>
                ))}
              </div>
              <div style={{ border: "1px solid var(--border)" }}>
                {keys.map((k, i) => (
                  <div key={k.id} style={{ display: "flex", alignItems: "center", padding: "10px 14px", borderBottom: i < keys.length - 1 ? "1px solid var(--border)" : "none", background: "var(--panel)", gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{k.school}</div>
                      <div style={{ fontSize: 10, color: "var(--t3)", fontFamily: "var(--mono)" }}>{k.key}</div>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <span style={{ opacity: k.hwLock ? 1 : 0.2 }}><Ico d={I.chip} s={12}/></span>
                      <span style={{ opacity: k.twoFa ? 1 : 0.2 }}><Ico d={I.fingerp} s={12}/></span>
                      <span style={{ opacity: k.ipRestrict ? 1 : 0.2 }}><Ico d={I.lock} s={12}/></span>
                    </div>
                    <SecurityScore score={k.secScore}/>
                  </div>
                ))}
              </div>
              {keys.some(k => k.secScore < 50) && (
                <div style={{ marginTop: 16, padding: "12px 14px", background: "var(--amber-dim)", border: "1px solid var(--amber-border)" }}>
                  <div style={{ fontSize: 12, color: "var(--amber)", fontWeight: 500, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}><Ico d={I.warn} s={13}/> {keys.filter(k => k.secScore < 50).length} clé(s) à risque</div>
                  <div style={{ fontSize: 12, color: "var(--t2)" }}>Activez le Hardware Lock et le 2FA pour les clés dont le score est inférieur à 50.</div>
                </div>
              )}
            </div>
            <div className="ka-modal-foot">
              <button className="ka-btn ka-btn-ghost" onClick={() => setModal(null)}>Fermer</button>
              <button className="ka-btn ka-btn-primary" onClick={() => { showToast("Rapport exporté", "green"); setModal(null); }}><Ico d={I.download} s={13}/> Exporter le rapport</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="ka-toast">
          <div className="ka-toast-dot" style={{
            background: toast.type === "green" ? "#3fb950" :
                        toast.type === "red" ? "#f85149" :
                        toast.type === "amber" ? "#d29922" : "#388bfd"
          }}/>
          {toast.msg}
        </div>
      )}
    </div>
  );
}