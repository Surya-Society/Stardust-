"use client";

import { useState, useEffect, useRef } from "react";

// ─── TYPES ────────────────────────────────────────────────────────────────────
type Tab = "overview" | "invest" | "budget" | "tx";
type TxFilter = "all" | "in" | "out" | "pending";

interface Transaction {
  id: string; type: "in" | "out"; status: "completed" | "pending" | "failed";
  label: string; sub: string; amount: number; currency: string;
  date: string; source: string; cat: string;
}
interface Investment {
  name: string; type: string; invested: number; current: number; color: string;
}
interface Budget {
  cat: string; spent: number; limit: number; color: string;
}

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const TRANSACTIONS: Transaction[] = [
  { id:"t1",  type:"in",  status:"completed", label:"Paiement licence",      sub:"Lycée Descartes",        amount:4500,  currency:"XAF", date:"2026-03-09", source:"Mobile Money",  cat:"Licences" },
  { id:"t2",  type:"in",  status:"completed", label:"Abonnement mensuel",    sub:"Collège Saint-Exupéry",  amount:1200,  currency:"XAF", date:"2026-03-08", source:"Mobile Money",  cat:"Abonnements" },
  { id:"t3",  type:"out", status:"completed", label:"Hébergement serveur",   sub:"AWS Europe",             amount:890,   currency:"XAF", date:"2026-03-07", source:"Virement",      cat:"Infrastructure" },
  { id:"t4",  type:"in",  status:"pending",   label:"Paiement en attente",   sub:"École Pasteur",          amount:780,   currency:"XAF", date:"2026-03-07", source:"Mobile Money",  cat:"Licences" },
  { id:"t5",  type:"out", status:"completed", label:"Domaine .com",          sub:"GoDaddy",                amount:220,   currency:"XAF", date:"2026-03-06", source:"Virement",      cat:"Infrastructure" },
  { id:"t6",  type:"in",  status:"completed", label:"Formation premium",     sub:"Lycée Descartes",        amount:3200,  currency:"XAF", date:"2026-03-05", source:"Interne Nova",  cat:"Formations" },
  { id:"t7",  type:"out", status:"failed",    label:"Tentative virement",    sub:"Erreur réseau",          amount:500,   currency:"XAF", date:"2026-03-04", source:"Virement",      cat:"Divers" },
  { id:"t8",  type:"in",  status:"completed", label:"Renouvellement annuel", sub:"Institut Technique",     amount:9600,  currency:"XAF", date:"2026-03-03", source:"Mobile Money",  cat:"Licences" },
  { id:"t9",  type:"out", status:"completed", label:"Salaire Baptiste",      sub:"Virement interne",       amount:1800,  currency:"XAF", date:"2026-03-02", source:"Interne Nova",  cat:"RH" },
  { id:"t10", type:"in",  status:"completed", label:"Module pédagogie",      sub:"Univ. de Brazzaville",   amount:2400,  currency:"XAF", date:"2026-03-01", source:"Mobile Money",  cat:"Modules" },
];

const INVESTMENTS: Investment[] = [
  { name:"MTN Group",         type:"Actions",     invested:800000,  current:952000,  color:"#1D9E75" },
  { name:"Orange Bonds",      type:"Obligations", invested:500000,  current:531000,  color:"#378ADD" },
  { name:"Immo Pointe-Noire", type:"Immobilier",  invested:1500000, current:1680000, color:"#EF9F27" },
  { name:"Bitcoin",           type:"Crypto",      invested:200000,  current:198000,  color:"#D4537E" },
  { name:"Airtel Shares",     type:"Actions",     invested:280500,  current:219500,  color:"#7F77DD" },
];

const BUDGETS: Budget[] = [
  { cat:"Alimentation",  spent:89000,  limit:120000, color:"#1D9E75" },
  { cat:"Transport",     spent:42000,  limit:50000,  color:"#378ADD" },
  { cat:"Infrastructure",spent:111000, limit:100000, color:"#E24B4A" },
  { cat:"RH / Salaires", spent:50000,  limit:120000, color:"#EF9F27" },
  { cat:"Divers",        spent:20000,  limit:60000,  color:"#7F77DD" },
];

const MONTHLY_LABELS = ["Oct","Nov","Déc","Jan","Fév","Mar"];
const MONTHLY_IN     = [420000, 510000, 480000, 620000, 590000, 620000];
const MONTHLY_OUT    = [280000, 310000, 295000, 350000, 280000, 312000];
const PORTFOLIO_HIST = [3100000,3180000,3240000,3310000,3450000,3580500];
const SPARK_DATA     = [4580,4620,4590,4680,4720,4700,4750,4780,4760,4800,4790,4820,4810,4840,4860,4850,4880,4870,4900,4890,4820];
const DONUT_DATA     = [
  { label:"Liquide",     pct:26, color:"#1D9E75" },
  { label:"Actions",     pct:42, color:"#378ADD" },
  { label:"Immobilier",  pct:24, color:"#EF9F27" },
  { label:"Crypto",      pct:8,  color:"#D4537E" },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmtXAF = (n: number) =>
  new Intl.NumberFormat("fr-FR").format(Math.abs(Math.round(n))) + " XAF";

// ─── INTERACTIVE SVG CHARTS (with hover effects) ───────────────────────────────
function LineChart({
  data, color = "#1D9E75", fill = true, height = 60,
}: { data: number[]; color?: string; fill?: boolean; height?: number }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const W = 300; const H = height;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 8) - 4;
    return { x, y, value: v };
  });
  const polyline = pts.map(p => `${p.x},${p.y}`).join(" ");
  const area = `${pts[0].x},${H} ${polyline} ${pts[pts.length - 1].x},${H}`;

  return (
    <div className="relative w-full" style={{ height }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} preserveAspectRatio="none">
        {fill && <polygon points={area} fill={color} fillOpacity={0.12} />}
        <polyline points={polyline} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={p.x} cy={p.y}
            r={hoverIndex === i ? 5 : 0}
            fill={color}
            className="transition-all duration-200"
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex(null)}
          />
        ))}
      </svg>
      {hoverIndex !== null && (
        <div
          className="absolute bg-[#1c2330] text-white text-[10px] px-2 py-1 border border-[#30363d] pointer-events-none z-10 whitespace-nowrap"
          style={{ left: pts[hoverIndex].x, top: pts[hoverIndex].y - 25 }}
        >
          {pts[hoverIndex].value}
        </div>
      )}
    </div>
  );
}

function BarChart({
  inData, outData, labels, height = 160,
}: { inData: number[]; outData: number[]; labels: string[]; height?: number }) {
  const [hoverBar, setHoverBar] = useState<{ index: number; type: 'in' | 'out' } | null>(null);
  const max = Math.max(...inData, ...outData);
  const W = 400; const H = height; const barW = 18; const gap = W / inData.length;

  return (
    <div className="relative w-full" style={{ height: H + 30 }}>
      <svg viewBox={`0 0 ${W} ${H + 30}`} className="w-full" preserveAspectRatio="none">
        {inData.map((v, i) => {
          const x = i * gap + gap / 2 - barW - 2;
          const bh = (v / max) * H;
          return (
            <rect
              key={`in-${i}`}
              x={x} y={H - bh} width={barW} height={bh}
              fill="#1D9E75" fillOpacity={hoverBar?.index === i && hoverBar?.type === 'in' ? 0.9 : 0.7}
              className="transition-all duration-200 cursor-pointer"
              onMouseEnter={() => setHoverBar({ index: i, type: 'in' })}
              onMouseLeave={() => setHoverBar(null)}
            />
          );
        })}
        {outData.map((v, i) => {
          const x = i * gap + gap / 2 + 2;
          const bh = (v / max) * H;
          return (
            <rect
              key={`out-${i}`}
              x={x} y={H - bh} width={barW} height={bh}
              fill="#E24B4A" fillOpacity={hoverBar?.index === i && hoverBar?.type === 'out' ? 0.9 : 0.6}
              className="transition-all duration-200 cursor-pointer"
              onMouseEnter={() => setHoverBar({ index: i, type: 'out' })}
              onMouseLeave={() => setHoverBar(null)}
            />
          );
        })}
        {labels.map((l, i) => (
          <text key={l} x={i * gap + gap / 2} y={H + 20} textAnchor="middle" fontSize={10} fill="#888">{l}</text>
        ))}
      </svg>
      {hoverBar && (
        <div
          className="absolute bg-[#1c2330] text-white text-[10px] px-2 py-1 border border-[#30363d] pointer-events-none z-10 whitespace-nowrap"
          style={{
            left: hoverBar.index * gap + gap / 2,
            top: H - 10
          }}
        >
          {hoverBar.type === 'in' ? 'Entrées: ' : 'Sorties: '}
          {hoverBar.type === 'in' ? inData[hoverBar.index] : outData[hoverBar.index]} XAF
        </div>
      )}
    </div>
  );
}

function DonutChart({ data }: { data: typeof DONUT_DATA }) {
  const [hoverSlice, setHoverSlice] = useState<number | null>(null);
  const R = 40; const CX = 55; const CY = 55; const stroke = 16;
  let cumulative = 0;
  const arcs = data.map((d, idx) => {
    const start = cumulative;
    cumulative += d.pct;
    const startAngle = (start / 100) * 2 * Math.PI - Math.PI / 2;
    const endAngle = (cumulative / 100) * 2 * Math.PI - Math.PI / 2;
    const x1 = CX + R * Math.cos(startAngle);
    const y1 = CY + R * Math.sin(startAngle);
    const x2 = CX + R * Math.cos(endAngle);
    const y2 = CY + R * Math.sin(endAngle);
    const large = d.pct > 50 ? 1 : 0;
    return { ...d, idx, d: `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2}` };
  });
  return (
    <div className="relative">
      <svg viewBox="0 0 110 110" width={110} height={110}>
        {arcs.map((a) => (
          <path
            key={a.label}
            d={a.d}
            fill="none"
            stroke={a.color}
            strokeWidth={hoverSlice === a.idx ? stroke + 2 : stroke}
            strokeLinecap="butt"
            className="transition-all duration-200 cursor-pointer"
            onMouseEnter={() => setHoverSlice(a.idx)}
            onMouseLeave={() => setHoverSlice(null)}
          />
        ))}
        <text x={CX} y={CY - 4} textAnchor="middle" fontSize={9} fill="#888">Total</text>
        <text x={CX} y={CY + 8} textAnchor="middle" fontSize={10} fontWeight="500" fill="#ccc">4,8M</text>
      </svg>
      {hoverSlice !== null && (
        <div className="absolute bg-[#1c2330] text-white text-[10px] px-2 py-1 border border-[#30363d] pointer-events-none z-10 whitespace-nowrap" style={{ top: -30, left: 20 }}>
          {arcs[hoverSlice].label}: {arcs[hoverSlice].pct}%
        </div>
      )}
    </div>
  );
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────
function MetricCard({
  label, value, delta, deltaUp, hidden,
}: { label: string; value: string; delta?: string; deltaUp?: boolean; hidden: boolean }) {
  return (
    <div className="bg-white dark:bg-[#0d1117] p-4 flex flex-col gap-1 border-b border-[#21262d]">
      <div className="text-[11px] text-[#484f58] uppercase tracking-wide">{label}</div>
      <div className={`text-xl font-medium tracking-tight text-gray-900 dark:text-gray-100 transition-all ${hidden ? "blur-md select-none" : ""}`}>
        {value}
      </div>
      {delta && (
        <div className={`text-[11px] ${deltaUp ? "text-green-700 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
          {delta}
        </div>
      )}
    </div>
  );
}

function TxRow({ tx, hidden }: { tx: Transaction; hidden: boolean }) {
  const isIn = tx.type === "in";
  const isPending = tx.status === "pending";
  const isFailed = tx.status === "failed";
  const amtColor = isFailed
    ? "text-red-500" : isIn
    ? "text-green-600 dark:text-green-400"
    : "text-gray-700 dark:text-gray-300";
  const iconBg = isIn
    ? "bg-green-50 dark:bg-green-900/20 text-green-600"
    : isFailed
    ? "bg-red-50 dark:bg-red-900/20 text-red-500"
    : "bg-gray-100 dark:bg-gray-800 text-gray-500";
  const icon = isIn ? "↙" : isFailed ? "✕" : "↗";
  const prefix = isIn ? "+" : isFailed ? "" : "−";

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer">
      <div className={`w-8 h-8 flex items-center justify-center text-sm flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-gray-900 dark:text-gray-100 truncate">{tx.label}</span>
          {isPending && (
            <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 flex-shrink-0">
              En attente
            </span>
          )}
          {isFailed && (
            <span className="text-[10px] px-1.5 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-600 flex-shrink-0">
              Échoué
            </span>
          )}
        </div>
        <div className="text-[11px] text-gray-400">{tx.sub} · {tx.source}</div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className={`text-[13px] font-medium ${amtColor} ${hidden ? "blur-md" : ""}`}>
          {prefix}{fmtXAF(tx.amount)}
        </div>
        <div className="text-[10px] text-gray-400">{tx.date}</div>
      </div>
    </div>
  );
}

function BudgetRow({ b }: { b: Budget }) {
  const pct = Math.round((b.spent / b.limit) * 100);
  const over = pct > 100;
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer">
      <div className="w-2 h-2 flex-shrink-0" style={{ background: b.color }} />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-[12px] text-gray-800 dark:text-gray-200">{b.cat}</span>
          <span className={`text-[12px] font-medium ${over ? "text-red-500" : "text-gray-800 dark:text-gray-200"}`}>
            {fmtXAF(b.spent)}{" "}
            <span className="text-gray-400 font-normal">/ {fmtXAF(b.limit)}</span>
          </span>
        </div>
        <div className="h-1 bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <div
            className="h-full transition-all duration-500 hover:opacity-80"
            style={{ width: `${Math.min(pct, 100)}%`, background: over ? "#E24B4A" : b.color }}
          />
        </div>
      </div>
      <span className="text-[11px] text-gray-400 flex-shrink-0 w-8 text-right">{pct}%</span>
    </div>
  );
}

function InvestmentRow({ inv, hidden }: { inv: Investment; hidden: boolean }) {
  const [hover, setHover] = useState(false);
  const roi = ((inv.current - inv.invested) / inv.invested * 100).toFixed(1);
  const gain = inv.current - inv.invested;
  const isUp = gain >= 0;
  return (
    <div
      className={`flex items-center gap-3 p-3 border border-gray-100 dark:border-gray-800 transition-all duration-200 cursor-pointer ${hover ? "bg-gray-50 dark:bg-gray-800/50 -translate-y-0.5 shadow-md" : ""}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="w-2 h-2 flex-shrink-0" style={{ background: inv.color }} />
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-gray-900 dark:text-gray-100">{inv.name}</div>
        <div className="text-[11px] text-gray-400">{inv.type} · Investi: {fmtXAF(inv.invested)}</div>
      </div>
      <div className={`text-right ${hidden ? "blur-md" : ""}`}>
        <div className="text-[13px] font-medium text-gray-900 dark:text-gray-100">{fmtXAF(inv.current)}</div>
        <div className={`text-[11px] ${isUp ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
          {isUp ? "↑" : "↓"} {isUp ? "+" : ""}{roi}% ({isUp ? "+" : ""}{fmtXAF(gain)})
        </div>
      </div>
    </div>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
function Modal({ type, onClose }: { type: string; onClose: () => void }) {
  const titles: Record<string, string> = {
    send: "Envoyer de l'argent", receive: "Recevoir", invest: "Nouvel investissement", withdraw: "Retirer",
  };
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center animate-[fadeIn_0.2s_ease]" onClick={onClose}>
      <div className="bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-gray-700 w-80 max-w-[90vw] p-6 animate-[slideUp_0.25s_ease]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="text-[14px] font-medium text-gray-900 dark:text-gray-100">{titles[type] ?? type}</div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-[11px] text-gray-400 block mb-1">Montant (XAF)</label>
            <input type="number" placeholder="0" className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-[13px] text-gray-900 dark:text-gray-100 outline-none focus:border-green-500" />
          </div>
          <div>
            <label className="text-[11px] text-gray-400 block mb-1">Description</label>
            <input type="text" placeholder="Ex: paiement freelance" className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-[13px] text-gray-900 dark:text-gray-100 outline-none focus:border-green-500" />
          </div>
          <button onClick={onClose} className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white text-[13px] font-medium mt-1 transition-colors">
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function FinanceSection() {
  const [tab, setTab] = useState<Tab>("overview");
  const [hidden, setHidden] = useState(false);
  const [txFilter, setTxFilter] = useState<TxFilter>("all");
  const [txFilterAll, setTxFilterAll] = useState<TxFilter>("all");
  const [modal, setModal] = useState<string | null>(null);

  const filterTx = (data: Transaction[], f: TxFilter) => {
    if (f === "in")      return data.filter((t) => t.type === "in" && t.status !== "pending");
    if (f === "out")     return data.filter((t) => t.type === "out");
    if (f === "pending") return data.filter((t) => t.status === "pending");
    return data;
  };

  const totalInvested = INVESTMENTS.reduce((s, i) => s + i.invested, 0);
  const totalCurrent  = INVESTMENTS.reduce((s, i) => s + i.current, 0);
  const totalGain     = totalCurrent - totalInvested;
  const totalRoi      = ((totalGain / totalInvested) * 100).toFixed(1);

  const FilterBar = ({ value, onChange }: { value: TxFilter; onChange: (f: TxFilter) => void }) => (
    <div className="flex gap-1 flex-wrap">
      {(["all","in","out","pending"] as TxFilter[]).map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`text-[11px] px-3 py-1 border transition-colors ${
            value === f
              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
              : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-200"
          }`}
        >
          {{ all:"Tout", in:"Entrées", out:"Sorties", pending:"En attente" }[f]}
        </button>
      ))}
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-white dark:bg-[#090c10] text-gray-900 dark:text-gray-100 font-sans">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* ── TOP BAR ── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex-wrap gap-2">
        <div className="flex items-center gap-4">
          <div className="text-[15px] font-medium tracking-tight">
            Nova <span className="text-green-600">Finance</span>
          </div>
          <div className="hidden sm:flex gap-0.5">
            {(["overview","invest","budget","tx"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`text-[12px] px-3 py-1.5 transition-colors ${
                  tab === t
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
              >
                {{ overview:"Vue d'ensemble", invest:"Investissements", budget:"Budget", tx:"Transactions" }[t]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium">
            ● Synchronisé
          </span>
          <button
            onClick={() => setHidden((h) => !h)}
            className="w-8 h-8 flex items-center justify-center border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-[13px]"
          >
            {hidden ? "🔒" : "👁"}
          </button>
          <button className="w-8 h-8 flex items-center justify-center border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-[13px]">
            ↓
          </button>
        </div>
      </div>

      {/* ── TAB: OVERVIEW ── */}
      {tab === "overview" && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-gray-100 dark:border-gray-800">
            <MetricCard label="Patrimoine net"   value="4 820 500 XAF" delta="↑ +12,4% ce mois"           deltaUp hidden={hidden} />
            <MetricCard label="Solde liquide"    value="1 240 000 XAF" delta="↑ +8,1% vs mois dernier"    deltaUp hidden={hidden} />
            <MetricCard label="Investissements"  value="3 580 500 XAF" delta="↑ +24 200 XAF ce mois"      deltaUp hidden={hidden} />
            <MetricCard label="Dépenses ce mois" value="312 000 XAF"   delta="↑ +6,2% vs budget"          deltaUp={false} hidden={hidden} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 border-b border-gray-100 dark:border-gray-800">
            <div className="lg:col-span-2 p-5 border-b lg:border-b-0 border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">Flux mensuels — 6 mois</div>
                <div className="flex items-center gap-4 text-[11px] text-gray-400">
                  <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-0.5 bg-green-500" />Entrées</span>
                  <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-0.5 bg-red-400" />Sorties</span>
                </div>
              </div>
              <BarChart inData={MONTHLY_IN} outData={MONTHLY_OUT} labels={MONTHLY_LABELS} height={160} />
              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="text-[11px] text-gray-400 uppercase tracking-wider font-medium mb-2">Évolution du patrimoine — 30 jours</div>
                <LineChart data={SPARK_DATA} height={52} />
              </div>
            </div>

            <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
              <div className="p-5">
                <div className="text-[11px] text-gray-400 uppercase tracking-wider font-medium mb-3">Actions rapides</div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label:"Envoyer",  icon:"↗", type:"send"     },
                    { label:"Recevoir", icon:"↙", type:"receive"  },
                    { label:"Investir", icon:"📈", type:"invest"   },
                    { label:"Retirer",  icon:"🏧", type:"withdraw" },
                  ].map((a) => (
                    <button
                      key={a.type}
                      onClick={() => setModal(a.type)}
                      className="flex flex-col items-center gap-1.5 p-3 border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <span className="text-base">{a.icon}</span>
                      <span className="text-[11px] text-gray-500">{a.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-5 flex-1">
                <div className="text-[11px] text-gray-400 uppercase tracking-wider font-medium mb-3">Répartition</div>
                <div className="flex items-center gap-4">
                  <DonutChart data={DONUT_DATA} />
                  <div className="flex flex-col gap-2">
                    {DONUT_DATA.map((d) => (
                      <div key={d.label} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-block w-2 h-2" style={{ background: d.color }} />
                          <span className="text-[11px] text-gray-500">{d.label}</span>
                        </div>
                        <span className="text-[11px] font-medium text-gray-800 dark:text-gray-200">{d.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-5 border-b lg:border-b-0 border-r-0 lg:border-r border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">Transactions récentes</div>
                <FilterBar value={txFilter} onChange={setTxFilter} />
              </div>
              <div>
                {filterTx(TRANSACTIONS, txFilter).slice(0, 6).map((tx) => (
                  <TxRow key={tx.id} tx={tx} hidden={hidden} />
                ))}
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">Budget mensuel</div>
                <button className="text-[11px] px-2.5 py-1 border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  + Ajouter
                </button>
              </div>
              {BUDGETS.map((b) => <BudgetRow key={b.cat} b={b} />)}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="text-[11px] text-gray-400 mb-1">Total dépensé ce mois</div>
                <div className={`text-xl font-medium tracking-tight ${hidden ? "blur-md" : ""}`}>312 000 XAF</div>
                <div className="text-[11px] text-gray-400 mt-0.5">sur 450 000 XAF budgétisés</div>
                <div className="h-1 bg-gray-100 dark:bg-gray-800 mt-2 overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: "69%" }} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── TAB: INVESTMENTS ── */}
      {tab === "invest" && (
        <>
          <div className="p-5 border-b border-gray-100 dark:border-gray-800">
            <div className={`text-3xl font-medium tracking-tight mb-1 ${hidden ? "blur-md" : ""}`}>
              {fmtXAF(totalCurrent)}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[12px] text-gray-400">Valeur totale du portefeuille</span>
              <span className={`text-[12px] px-2 py-0.5 ${totalGain >= 0 ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400" : "bg-red-50 text-red-600"}`}>
                {totalGain >= 0 ? "↑" : "↓"} {totalGain >= 0 ? "+" : ""}{fmtXAF(totalGain)} ({totalGain >= 0 ? "+" : ""}{totalRoi}%)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-2 p-5 border-b lg:border-b-0 border-r-0 lg:border-r border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">Mes investissements</div>
                <button className="text-[11px] px-2.5 py-1 border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  + Ajouter
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {INVESTMENTS.map((inv) => (
                  <InvestmentRow key={inv.name} inv={inv} hidden={hidden} />
                ))}
              </div>
            </div>

            <div className="p-5">
              <div className="text-[11px] text-gray-400 uppercase tracking-wider font-medium mb-3">Performance — 6 mois</div>
              <LineChart data={PORTFOLIO_HIST.map((v) => Math.round(v / 1000))} color="#1D9E75" height={120} />
              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2.5">
                <div>
                  <div className="text-[11px] text-gray-400 mb-0.5">Retour total</div>
                  <div className={`text-2xl font-medium ${totalGain >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
                    {totalGain >= 0 ? "+" : ""}{totalRoi}%
                  </div>
                </div>
                {[
                  { l:"Investi",        v: fmtXAF(totalInvested) },
                  { l:"Valeur actuelle",v: fmtXAF(totalCurrent) },
                  { l:"Gain net",       v: (totalGain >= 0 ? "+" : "") + fmtXAF(totalGain), color: totalGain >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500" },
                ].map((r) => (
                  <div key={r.l} className="flex justify-between text-[12px]">
                    <span className="text-gray-400">{r.l}</span>
                    <span className={`font-medium ${r.color ?? "text-gray-900 dark:text-gray-100"} ${hidden ? "blur-md" : ""}`}>{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── TAB: BUDGET ── */}
      {tab === "budget" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-gray-100 dark:border-gray-800">
            <MetricCard label="Revenus ce mois"  value="620 000 XAF"  delta="↑ +18% vs mois précédent" deltaUp hidden={hidden} />
            <MetricCard label="Dépenses ce mois" value="312 000 XAF"  delta="↑ +6% vs budget"          deltaUp={false} hidden={hidden} />
            <MetricCard label="Épargne nette"    value="308 000 XAF"  delta="taux d'épargne 49,7%"      deltaUp hidden={hidden} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-5 border-b lg:border-b-0 border-r-0 lg:border-r border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">Catégories de dépenses</div>
                <button className="text-[11px] px-2.5 py-1 border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  + Catégorie
                </button>
              </div>
              {BUDGETS.map((b) => <BudgetRow key={b.cat} b={b} />)}
            </div>
            <div className="p-5">
              <div className="text-[11px] text-gray-400 uppercase tracking-wider font-medium mb-4">Dépenses vs budget</div>
              <BarChart
                inData={BUDGETS.map((b) => b.spent)}
                outData={BUDGETS.map((b) => b.limit)}
                labels={BUDGETS.map((b) => b.cat.slice(0, 6))}
                height={180}
              />
              <div className="flex items-center gap-4 mt-3 text-[11px] text-gray-400">
                <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-0.5 bg-green-500" />Dépensé</span>
                <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-0.5 bg-gray-300" />Budget</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── TAB: TRANSACTIONS ── */}
      {tab === "tx" && (
        <div className="p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">Toutes les transactions</div>
            <div className="flex items-center gap-2">
              <FilterBar value={txFilterAll} onChange={setTxFilterAll} />
              <button className="text-[11px] px-2.5 py-1 border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                + Ajouter
              </button>
            </div>
          </div>
          {filterTx(TRANSACTIONS, txFilterAll).map((tx) => (
            <TxRow key={tx.id} tx={tx} hidden={hidden} />
          ))}
        </div>
      )}

      {/* ── MODAL ── */}
      {modal && <Modal type={modal} onClose={() => setModal(null)} />}

      {/* ── FOOTER ── */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-400">
        <span>✓ Données synchronisées en temps réel</span>
        <span>Nova Finance · {new Date().toLocaleDateString("fr-FR")}</span>
      </div>
    </div>
  );
}