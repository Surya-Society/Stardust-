// components/FinanceSection.tsx
// Nova – Tableau de bord financier · ECharts edition

import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import {
  FiArrowUpRight, FiArrowDownLeft,
  FiSmartphone, FiRefreshCw, FiEye, FiEyeOff,
  FiDownload, FiFilter, FiClock, FiCheck,
  FiAlertCircle, FiSend, FiActivity, FiLayers,
} from 'react-icons/fi';

// ─── TYPES ─────────────────────────────────────────────────────────────────────
type Language   = 'fr' | 'en';
type TxType     = 'in' | 'out';
type TxStatus   = 'completed' | 'pending' | 'failed';
type FilterMode = 'all' | 'in' | 'out' | 'pending';

interface Transaction {
  id: string; type: TxType; status: TxStatus;
  label: string; sublabel: string; amount: number;
  currency: string; date: string;
  source: 'mobile_money' | 'bank' | 'internal';
  category: string;
}

// ─── TRANSLATIONS ───────────────────────────────────────────────────────────────
const T = {
  fr: {
    eyebrow: 'Finance',
    headline1: 'Votre argent,',
    headline2: 'en temps réel.',
    subtitle: 'Suivez vos flux financiers, solde Mobile Money et transactions en un seul endroit.',
    totalBalance: 'Solde total', mobileMoney: 'Mobile Money',
    income: 'Entrées', expenses: 'Sorties', pending: 'En attente',
    recentActivity: 'Activité récente',
    filterAll: 'Tout', filterIn: 'Entrées', filterOut: 'Sorties', filterPending: 'En attente',
    thisMonth: 'Ce mois', export: 'Exporter',
    source: { mobile_money: 'Mobile Money', bank: 'Virement bancaire', internal: 'Interne Nova' },
    noTx: 'Aucune transaction trouvée.',
    fluxMensuels: 'Flux mensuels · 12 mois',
    repartition: 'Répartition',
    quickActions: 'Actions rapides',
    sendMoney: 'Envoyer', topUp: 'Recharger', withdraw: 'Retirer',
    monthLabels: ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'],
    seriesIn: 'Entrées', seriesOut: 'Sorties',
    balanceEvolution: 'Solde · 30 jours',
  },
  en: {
    eyebrow: 'Finance',
    headline1: 'Your money,',
    headline2: 'in real time.',
    subtitle: 'Track your cash flows, Mobile Money balance and transactions in one place.',
    totalBalance: 'Total balance', mobileMoney: 'Mobile Money',
    income: 'Income', expenses: 'Expenses', pending: 'Pending',
    recentActivity: 'Recent activity',
    filterAll: 'All', filterIn: 'Income', filterOut: 'Expenses', filterPending: 'Pending',
    thisMonth: 'This month', export: 'Export',
    source: { mobile_money: 'Mobile Money', bank: 'Bank transfer', internal: 'Nova internal' },
    noTx: 'No transactions found.',
    fluxMensuels: 'Monthly flows · 12 months',
    repartition: 'Breakdown',
    quickActions: 'Quick actions',
    sendMoney: 'Send', topUp: 'Top up', withdraw: 'Withdraw',
    monthLabels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    seriesIn: 'Income', seriesOut: 'Expenses',
    balanceEvolution: 'Balance · 30 days',
  },
};

// ─── MOCK DATA ──────────────────────────────────────────────────────────────────
const MOCK_TRANSACTIONS: Transaction[] = [
  { id:'t1',  type:'in',  status:'completed', label:'Paiement licence',      sublabel:'Lycée Descartes',          amount:4500,  currency:'XAF', date:'2026-03-09T10:22:00Z', source:'mobile_money', category:'Licences' },
  { id:'t2',  type:'in',  status:'completed', label:'Abonnement mensuel',    sublabel:'Collège Saint-Exupéry',    amount:1200,  currency:'XAF', date:'2026-03-08T09:15:00Z', source:'mobile_money', category:'Abonnements' },
  { id:'t3',  type:'out', status:'completed', label:'Hébergement serveur',   sublabel:'AWS Europe',               amount:-890,  currency:'XAF', date:'2026-03-07T14:00:00Z', source:'bank',         category:'Infrastructure' },
  { id:'t4',  type:'in',  status:'pending',   label:'Paiement en attente',   sublabel:'École primaire Pasteur',   amount:780,   currency:'XAF', date:'2026-03-07T11:45:00Z', source:'mobile_money', category:'Licences' },
  { id:'t5',  type:'out', status:'completed', label:'Domaine .com',          sublabel:'GoDaddy',                  amount:-220,  currency:'XAF', date:'2026-03-06T16:30:00Z', source:'bank',         category:'Infrastructure' },
  { id:'t6',  type:'in',  status:'completed', label:'Formation premium',     sublabel:'Lycée Descartes',          amount:3200,  currency:'XAF', date:'2026-03-05T08:00:00Z', source:'internal',     category:'Formations' },
  { id:'t7',  type:'out', status:'failed',    label:'Tentative virement',    sublabel:'Erreur réseau',            amount:-500,  currency:'XAF', date:'2026-03-04T13:10:00Z', source:'bank',         category:'Divers' },
  { id:'t8',  type:'in',  status:'completed', label:'Renouvellement annuel', sublabel:'Institut Technique',       amount:9600,  currency:'XAF', date:'2026-03-03T10:00:00Z', source:'mobile_money', category:'Licences' },
  { id:'t9',  type:'out', status:'completed', label:'Salaire Baptiste',      sublabel:'Virement interne',         amount:-1800, currency:'XAF', date:'2026-03-02T09:00:00Z', source:'internal',     category:'RH' },
  { id:'t10', type:'in',  status:'completed', label:'Module pédagogie',      sublabel:'Université de Brazzaville',amount:2400,  currency:'XAF', date:'2026-03-01T15:20:00Z', source:'mobile_money', category:'Modules' },
];

const SPARKLINE   = [12200,13400,12800,14200,13900,15600,15100,16800,16200,17500,17000,18200,17800,19100,18700,20400,20100,21300,20800,22100,21600,23000,22500,24200,23800,25100,24600,26200,25800,27400];
const MONTHLY_IN  = [6200, 8400, 7800, 9200, 11600,14400,10200,15800,18100,13600,20200,23400];
const MONTHLY_OUT = [2000, 3200, 2800, 4000,  5200, 6000, 4800, 7200, 8300, 5800, 9400,10800];

// ─── UTILS ─────────────────────────────────────────────────────────────────────
const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay=0, className='' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once:true, margin:'-40px' });
  return (
    <motion.div 
      ref={ref} 
      initial={{opacity:0, y:18}} 
      animate={inView ? {opacity:1, y:0} : {}}
      transition={{duration:0.6, delay, ease:[0.22,1,0.36,1]}} 
      className={className}
    >
      {children}
    </motion.div>
  );
};

const SectionLabel: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color='#9AAEFF' }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="w-1 h-5 rounded-full" style={{background:color}}/>
    <span className="text-xs font-light tracking-[0.3em] uppercase" style={{color}}>{children}</span>
  </div>
);

const fmt = (n: number, currency='XAF') =>
  new Intl.NumberFormat('fr-FR',{style:'currency', currency, maximumFractionDigits:0}).format(Math.abs(n));

// ─── ECHARTS: SPARKLINE AREA ────────────────────────────────────────────────────
const SparkAreaChart: React.FC<{ data: number[]; color?: string; label: string }> = ({ data, color='#34D399', label }) => {
  const option = useMemo(()=>({
    backgroundColor: 'transparent',
    grid: { top:6, right:4, bottom:4, left:4, containLabel:false },
    xAxis: { type:'category', data:data.map((_,i)=>i+1), show:false, boundaryGap:false },
    yAxis: { type:'value', show:false, min:(val:{min:number})=>Math.floor(val.min*0.97) },
    tooltip: {
      trigger:'axis',
      backgroundColor:'#1A1F2E',
      borderColor:`${color}30`,
      borderWidth:1,
      padding:[6,10],
      textStyle:{color:'#fff',fontSize:11,fontWeight:300},
      formatter:(params:any[])=>`<span style="color:${color};font-size:9px;text-transform:uppercase;letter-spacing:.15em;">${label} · Jour ${params[0].dataIndex+1}</span><br/><b style="color:#fff;font-size:13px;">${fmt(params[0].value,'XAF')}</b>`,
      axisPointer:{type:'line',lineStyle:{color:`${color}40`,width:1,type:'dashed'}},
    },
    series:[{
      type:'line',
      data,
      smooth:0.55,
      symbol:'none',
      lineStyle:{color, width:2, shadowColor:`${color}40`, shadowBlur:10},
      areaStyle:{
        color:{type:'linear',x:0,y:0,x2:0,y2:1,
          colorStops:[{offset:0,color:`${color}28`},{offset:1,color:`${color}00`}]},
      },
    }],
    animation:true, animationDuration:1400, animationEasing:'cubicOut',
  }),[data,color,label]);

  return <ReactECharts option={option} style={{height:72,width:'100%'}} opts={{renderer:'svg'}} notMerge/>;
};

// ─── ECHARTS: DUAL CURVE MONTHLY ───────────────────────────────────────────────
const MonthlyFlowChart: React.FC<{ inData:number[]; outData:number[]; labels:string[]; seriesIn:string; seriesOut:string }> = ({
  inData, outData, labels, seriesIn, seriesOut,
}) => {
  const option = useMemo(()=>({
    backgroundColor:'transparent',
    grid:{top:32,right:16,bottom:32,left:52,containLabel:false},
    legend:{
      data:[seriesIn,seriesOut], top:0, right:0,
      textStyle:{color:'rgba(255,255,255,0.2)',fontSize:10,fontWeight:300},
      icon:'circle', itemWidth:6, itemHeight:6,
    },
    xAxis:{
      type:'category', data:labels, boundaryGap:false,
      axisLine:{lineStyle:{color:'rgba(255,255,255,0.05)'}},
      axisTick:{show:false},
      axisLabel:{color:'rgba(255,255,255,0.15)',fontSize:10,fontWeight:300},
      splitLine:{show:false},
    },
    yAxis:{
      type:'value',
      axisLine:{show:false}, axisTick:{show:false},
      axisLabel:{
        color:'rgba(255,255,255,0.12)',fontSize:9,fontWeight:300,
        formatter:(v:number)=>v>=1000?`${(v/1000).toFixed(0)}k`:String(v),
      },
      splitLine:{lineStyle:{color:'rgba(255,255,255,0.035)',type:'dashed'}},
    },
    tooltip:{
      trigger:'axis',
      backgroundColor:'#1A1F2E',
      borderColor:'rgba(154,174,255,0.15)',
      borderWidth:1,
      padding:[10,16],
      textStyle:{color:'#fff',fontSize:11,fontWeight:300},
      formatter:(params:any[])=>{
        const lines = params.map(p=>
          `<div style="display:flex;align-items:center;gap:8px;margin:3px 0;">
            <span style="width:6px;height:6px;border-radius:50%;background:${p.color};flex-shrink:0;display:inline-block;"></span>
            <span style="color:rgba(255,255,255,0.35);font-size:10px;flex:1;">${p.seriesName}</span>
            <b style="color:#fff;font-size:11px;">${fmt(p.value,'XAF')}</b>
          </div>`
        ).join('');
        return `<div style="min-width:200px;">
          <div style="color:rgba(255,255,255,0.18);font-size:9px;margin-bottom:8px;text-transform:uppercase;letter-spacing:.2em;">${params[0].axisValue}</div>
          ${lines}
        </div>`;
      },
      axisPointer:{type:'cross',crossStyle:{color:'rgba(255,255,255,0.04)'},label:{show:false}},
    },
    series:[
      {
        name:seriesIn, type:'line', data:inData,
        smooth:0.5,
        symbol:'circle', symbolSize:5, showSymbol:false,
        emphasis:{scale:true, symbolSize:8},
        lineStyle:{color:'#34D399',width:2.5,shadowColor:'rgba(52,211,153,0.4)',shadowBlur:14},
        itemStyle:{color:'#34D399',borderColor:'#1A1F2E',borderWidth:2},
        areaStyle:{
          color:{type:'linear',x:0,y:0,x2:0,y2:1,
            colorStops:[{offset:0,color:'rgba(52,211,153,0.2)'},{offset:1,color:'rgba(52,211,153,0.0)'}]},
        },
      },
      {
        name:seriesOut, type:'line', data:outData,
        smooth:0.5,
        symbol:'circle', symbolSize:4, showSymbol:false,
        emphasis:{scale:true, symbolSize:7},
        lineStyle:{color:'#F87171',width:2,type:'dashed',shadowColor:'rgba(248,113,113,0.35)',shadowBlur:8},
        itemStyle:{color:'#F87171',borderColor:'#1A1F2E',borderWidth:2},
        areaStyle:{
          color:{type:'linear',x:0,y:0,x2:0,y2:1,
            colorStops:[{offset:0,color:'rgba(248,113,113,0.12)'},{offset:1,color:'rgba(248,113,113,0.0)'}]},
        },
      },
    ],
    animation:true, animationDuration:1500, animationEasing:'cubicOut',
    animationDelay:(idx:number)=>idx*25,
  }),[inData,outData,labels,seriesIn,seriesOut]);

  return <ReactECharts option={option} style={{height:248,width:'100%'}} opts={{renderer:'svg'}} notMerge/>;
};

// ─── ECHARTS: DONUT ────────────────────────────────────────────────────────────
const DonutChart: React.FC<{ language: Language }> = ({ language }) => {
  const isFr = language === 'fr';
  const data = [
    {value:18900, name:isFr?'Licences':'Licenses',      itemStyle:{color:'#9AAEFF'}},
    {value:5600,  name:isFr?'Abonnements':'Subscriptions', itemStyle:{color:'#34D399'}},
    {value:3200,  name:isFr?'Formations':'Training',    itemStyle:{color:'#C084FC'}},
    {value:2400,  name:'Modules',                        itemStyle:{color:'#F59E0B'}},
    {value:1110,  name:'Infrastructure',                 itemStyle:{color:'#F87171'}},
  ];

  const option = useMemo(()=>({
    backgroundColor:'transparent',
    tooltip:{
      trigger:'item',
      backgroundColor:'#1A1F2E',
      borderColor:'rgba(154,174,255,0.15)',
      borderWidth:1,
      padding:[8,14],
      textStyle:{color:'#fff',fontSize:11,fontWeight:300},
      formatter:(p:any)=>`
        <div>
          <span style="color:${p.color};font-size:10px;">●</span>
          <span style="color:rgba(255,255,255,0.35);font-size:10px;margin-left:4px;">${p.name}</span><br/>
          <b style="color:#fff;font-size:14px;">${fmt(p.value,'XAF')}</b><br/>
          <span style="color:rgba(255,255,255,0.18);font-size:9px;">${p.percent.toFixed(1)}%</span>
        </div>`,
    },
    legend:{
      orient:'vertical', right:0, top:'middle',
      textStyle:{color:'rgba(255,255,255,0.25)',fontSize:10,fontWeight:300},
      icon:'circle', itemWidth:6, itemHeight:6, itemGap:8,
    },
    series:[{
      type:'pie',
      radius:['52%','82%'],
      center:['38%','50%'],
      avoidLabelOverlap:false,
      padAngle:3,
      itemStyle:{borderRadius:5,borderColor:'#1A1F2E',borderWidth:2},
      label:{
        show:true, position:'center',
        formatter:()=>`{t|${fmt(31210,'XAF')}}\n{s|total}`,
        rich:{
          t:{color:'#fff',fontSize:13,fontWeight:300,lineHeight:20},
          s:{color:'rgba(255,255,255,0.18)',fontSize:8,lineHeight:14,letterSpacing:3},
        },
      },
      emphasis:{
        label:{show:true},
        itemStyle:{shadowBlur:20,shadowOffsetX:0,shadowColor:'rgba(0,0,0,0.5)'},
        scale:true, scaleSize:4,
      },
      data,
    }],
    animation:true, animationType:'scale', animationDuration:1000, animationEasing:'cubicOut',
  }),[data]);

  return <ReactECharts option={option} style={{height:200,width:'100%'}} opts={{renderer:'svg'}} notMerge/>;
};

// ─── KPI CARD ──────────────────────────────────────────────────────────────────
const KpiCard: React.FC<{
  label:string; value:string; sub?:string;
  accent:string; icon:React.ElementType; trend?:number; delay?:number;
}> = ({label,value,sub,accent,icon:Icon,trend,delay=0}) => (
  <Reveal delay={delay}>
    <div className="rounded-2xl border border-white/5 overflow-hidden bg-white/[0.015]">
      <div className="h-[2px]" style={{background:`linear-gradient(90deg,${accent},transparent)`}}/>
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{background:`${accent}12`, border:`1px solid ${accent}20`}}>
            <Icon size={13} style={{color:accent}}/>
          </div>
          {trend !== undefined && (
            <div className="flex items-center gap-1 text-[10px] font-light px-2 py-0.5 rounded-lg"
              style={{
                background: trend >= 0 ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)',
                color: trend >= 0 ? '#34D399' : '#F87171'
              }}>
              {trend >= 0 ? <FiArrowUpRight size={10}/> : <FiArrowDownLeft size={10}/>}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div className="text-[9px] uppercase tracking-[0.25em] text-white/20 font-light mb-1">{label}</div>
        <div className="text-2xl font-extralight text-white tracking-tight">{value}</div>
        {sub && <div className="text-[10px] text-white/20 font-light mt-1">{sub}</div>}
      </div>
    </div>
  </Reveal>
);

// ─── TRANSACTION ROW ───────────────────────────────────────────────────────────
const TxRow: React.FC<{tx:Transaction; t:typeof T['fr']; index:number}> = ({tx,t,index}) => {
  const isIn = tx.type === 'in';
  const isPending = tx.status === 'pending';
  const isFailed = tx.status === 'failed';
  
  const ICONS = {
    mobile_money: FiSmartphone,
    bank: FiActivity,
    internal: FiLayers
  };
  
  const Icon = ICONS[tx.source];
  const ACCENT = isIn ? '#34D399' : isFailed ? '#F87171' : '#F59E0B';
  const amtColor = isFailed ? '#F87171' : isIn ? '#34D399' : 'rgba(255,255,255,0.4)';
  
  const d = new Date(tx.date);
  const ds = `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')} · ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;

  return (
    <Reveal delay={0.03 * index}>
      <motion.div 
        whileHover={{x:3}} 
        transition={{duration:0.18}}
        className="flex items-center gap-4 py-4 border-b border-white/5 last:border-0 cursor-default"
      >
        <div 
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: `${ACCENT}10`,
            border: `1px solid ${ACCENT}20`
          }}
        >
          <Icon size={13} style={{color: ACCENT}}/>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-extralight text-white truncate">{tx.label}</span>
            {isPending && (
              <span 
                className="text-[9px] px-2 py-0.5 rounded font-light tracking-widest uppercase"
                style={{
                  background: 'rgba(245,158,11,0.1)',
                  color: '#F59E0B',
                  border: '1px solid rgba(245,158,11,0.2)'
                }}
              >
                {t.pending}
              </span>
            )}
            {isFailed && <FiAlertCircle size={11} className="text-[#F87171] shrink-0"/>}
          </div>
          <p className="text-[10px] text-white/20 font-light">{tx.sublabel} · {t.source[tx.source]}</p>
        </div>
        
        <span className="text-[10px] text-white/15 font-light shrink-0 hidden sm:block">{ds}</span>
        
        <div className="text-right shrink-0">
          <div className="text-sm font-extralight" style={{color: amtColor}}>
            {isIn ? '+' : isFailed ? '' : '−'}{fmt(tx.amount, tx.currency)}
          </div>
          <div className="text-[9px] text-white/15 font-light">{tx.category}</div>
        </div>
      </motion.div>
    </Reveal>
  );
};

// ─── MAIN ──────────────────────────────────────────────────────────────────────
const FinanceSection: React.FC<{language?: Language; onNavigate?: (s:string)=>void}> = ({language='fr'}) => {
  const t = T[language];
  const [hidden, setHidden] = useState(false);
  const [filter, setFilter] = useState<FilterMode>('all');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1400);
  };

  const filtered = useMemo(() => {
    if (filter === 'all') return MOCK_TRANSACTIONS;
    if (filter === 'in') return MOCK_TRANSACTIONS.filter(tx => tx.type === 'in' && tx.status !== 'pending');
    if (filter === 'out') return MOCK_TRANSACTIONS.filter(tx => tx.type === 'out');
    return MOCK_TRANSACTIONS.filter(tx => tx.status === 'pending');
  }, [filter]);

  const totalBalance = 27400;
  const mobileBalance = 18600;
  
  const monthIncome = MOCK_TRANSACTIONS
    .filter(tx => tx.type === 'in' && tx.status === 'completed')
    .reduce((a, tx) => a + tx.amount, 0);
    
  const monthExpense = Math.abs(MOCK_TRANSACTIONS
    .filter(tx => tx.type === 'out' && tx.status === 'completed')
    .reduce((a, tx) => a + tx.amount, 0));
    
  const pendingCount = MOCK_TRANSACTIONS.filter(tx => tx.status === 'pending').length;
  const pendingAmt = MOCK_TRANSACTIONS.filter(tx => tx.status === 'pending').reduce((a, tx) => a + tx.amount, 0);
  
  const mask = (v: string) => hidden ? '••••••' : v;

  const FILTERS: {id: FilterMode; label: string}[] = [
    {id: 'all', label: t.filterAll},
    {id: 'in', label: t.filterIn},
    {id: 'out', label: t.filterOut},
    {id: 'pending', label: t.filterPending},
  ];

  return (
    <div className="w-full bg-[#1A1F2E] text-white">
      {/* HERO SECTION */}
      <section className="relative pt-32 pb-16 px-6 sm:px-12 lg:px-20 border-b border-white/5">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(52,211,153,0.05) 0%, transparent 65%)',
              transform: 'translate(25%, -25%)'
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-end">
            {/* Left column - Text */}
            <div>
              <Reveal>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1 h-8 rounded-full bg-[#34D399]"/>
                  <span className="text-[#34D399] text-xs font-light tracking-[0.3em] uppercase">
                    {t.eyebrow}
                  </span>
                </div>
              </Reveal>
              
              <Reveal delay={0.08}>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extralight leading-[1.05] tracking-tight mb-4">
                  {t.headline1}<br/><span className="text-[#34D399]">{t.headline2}</span>
                </h1>
              </Reveal>
              
              <Reveal delay={0.15}>
                <p className="text-[#98A2B3] font-light text-base max-w-md leading-relaxed">
                  {t.subtitle}
                </p>
              </Reveal>
            </div>

            {/* Right column - Balance Card */}
            <Reveal delay={0.2}>
              <div className="rounded-2xl border border-white/5 overflow-hidden bg-white/[0.015] relative">
                <div 
                  className="h-[2px]" 
                  style={{background: 'linear-gradient(90deg, #34D399, #9AAEFF, transparent)'}}
                />
                <div 
                  className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(52,211,153,0.07), transparent)',
                    transform: 'translate(30%, -30%)'
                  }}
                />
                
                <div className="p-8 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.3em] text-white/20 font-light mb-1">
                        {t.totalBalance}
                      </div>
                      <AnimatePresence mode="wait">
                        <motion.span 
                          key={hidden ? 'h' : 's'} 
                          initial={{opacity:0, y:6}} 
                          animate={{opacity:1, y:0}}
                          exit={{opacity:0, y:-6}} 
                          transition={{duration:0.25}}
                          className="text-4xl font-extralight tracking-tight text-white block"
                        >
                          {mask(fmt(totalBalance, 'XAF'))}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setHidden(h => !h)}
                        className="w-8 h-8 flex items-center justify-center rounded-xl border border-white/10 text-white/30 hover:text-white/60 hover:border-white/20 transition-all"
                      >
                        {hidden ? <FiEye size={13}/> : <FiEyeOff size={13}/>}
                      </button>
                      
                      <motion.button 
                        onClick={handleRefresh}
                        animate={refreshing ? {rotate: 360} : {rotate: 0}} 
                        transition={{duration: 1, ease: 'linear'}}
                        className="w-8 h-8 flex items-center justify-center rounded-xl border border-white/10 text-white/30 hover:text-white/60 hover:border-white/20 transition-all"
                      >
                        <FiRefreshCw size={13}/>
                      </motion.button>
                    </div>
                  </div>

                  {/* Sparkline */}
                  <div className="-mx-1">
                    <SparkAreaChart data={SPARKLINE} color="#34D399" label={t.balanceEvolution}/>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20">
                        <FiSmartphone size={12} className="text-[#F59E0B]"/>
                      </div>
                      <div>
                        <div className="text-[9px] uppercase tracking-widest text-white/20 font-light">
                          {t.mobileMoney}
                        </div>
                        <div className="text-sm font-extralight text-white">
                          {mask(fmt(mobileBalance, 'XAF'))}
                        </div>
                      </div>
                    </div>
                    <div 
                      className="text-[10px] font-light px-2.5 py-1 rounded-lg"
                      style={{
                        background: 'rgba(52,211,153,0.08)',
                        color: '#34D399',
                        border: '1px solid rgba(52,211,153,0.2)'
                      }}
                    >
                      +{((mobileBalance / totalBalance) * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* KPI SECTION */}
      <section className="py-12 px-6 sm:px-12 lg:px-20 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard 
              label={t.income} 
              value={mask(fmt(monthIncome, 'XAF'))}   
              accent="#34D399" 
              icon={FiArrowUpRight}  
              trend={18} 
              delay={0}    
              sub={t.thisMonth}
            />
            <KpiCard 
              label={t.expenses}    
              value={mask(fmt(monthExpense, 'XAF'))}  
              accent="#F87171" 
              icon={FiArrowDownLeft} 
              trend={-6}  
              delay={0.05} 
              sub={t.thisMonth}
            />
            <KpiCard 
              label={t.mobileMoney} 
              value={mask(fmt(mobileBalance, 'XAF'))} 
              accent="#F59E0B" 
              icon={FiSmartphone}   
              trend={9}  
              delay={0.1}
            />
            <KpiCard 
              label={t.pending}     
              value={`${pendingCount}`}               
              accent="#C084FC" 
              icon={FiClock}         
              delay={0.15} 
              sub={mask(fmt(pendingAmt, 'XAF'))}
            />
          </div>
        </div>
      </section>

      {/* CHARTS SECTION */}
      <section className="py-12 px-6 sm:px-12 lg:px-20 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Monthly Flow Chart */}
            <div className="lg:col-span-8">
              <Reveal>
                <div className="rounded-2xl border border-white/5 overflow-hidden bg-white/[0.01]">
                  <div 
                    className="h-[2px]" 
                    style={{background: 'linear-gradient(90deg, #9AAEFF, transparent)'}}
                  />
                  <div className="p-7">
                    <SectionLabel>{t.fluxMensuels}</SectionLabel>
                    <MonthlyFlowChart 
                      inData={MONTHLY_IN} 
                      outData={MONTHLY_OUT} 
                      labels={t.monthLabels} 
                      seriesIn={t.seriesIn} 
                      seriesOut={t.seriesOut}
                    />
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Donut + Quick Actions */}
            <div className="lg:col-span-4">
              <div className="flex flex-col gap-5">
                <Reveal delay={0.08}>
                  <div className="rounded-2xl border border-white/5 overflow-hidden bg-white/[0.01]">
                    <div 
                      className="h-[2px]" 
                      style={{background: 'linear-gradient(90deg, #C084FC, transparent)'}}
                    />
                    <div className="p-6">
                      <SectionLabel color="#C084FC">{t.repartition}</SectionLabel>
                      <DonutChart language={language}/>
                    </div>
                  </div>
                </Reveal>

                <Reveal delay={0.14}>
                  <div className="rounded-2xl border border-white/5 overflow-hidden bg-white/[0.01]">
                    <div 
                      className="h-[2px]" 
                      style={{background: 'linear-gradient(90deg, #F59E0B, transparent)'}}
                    />
                    <div className="p-6">
                      <SectionLabel color="#F59E0B">{t.quickActions}</SectionLabel>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          {label: t.sendMoney, icon: FiSend, accent: '#9AAEFF'},
                          {label: t.topUp, icon: FiArrowUpRight, accent: '#34D399'},
                          {label: t.withdraw, icon: FiArrowDownLeft, accent: '#F59E0B'},
                          {label: t.export, icon: FiDownload, accent: '#C084FC'},
                        ].map((a, i) => (
                          <motion.button 
                            key={i} 
                            whileHover={{scale: 1.04, y: -1}} 
                            whileTap={{scale: 0.97}}
                            className="flex flex-col items-center gap-2 px-3 py-4 rounded-xl border border-white/5 group hover:border-white/10 transition-all"
                            style={{background: `${a.accent}05`}}
                          >
                            <div 
                              className="w-8 h-8 flex items-center justify-center rounded-xl"
                              style={{
                                background: `${a.accent}12`,
                                border: `1px solid ${a.accent}20`
                              }}
                            >
                              <a.icon size={13} style={{color: a.accent}}/>
                            </div>
                            <span className="text-[10px] font-light text-white/35 group-hover:text-white/70 transition-colors">
                              {a.label}
                            </span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRANSACTIONS SECTION */}
      <section className="py-12 px-6 sm:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
              <SectionLabel>{t.recentActivity}</SectionLabel>
              <div className="flex items-center gap-2 flex-wrap">
                {FILTERS.map(f => (
                  <button 
                    key={f.id} 
                    onClick={() => setFilter(f.id)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-light tracking-wide transition-all duration-150"
                    style={filter === f.id
                      ? {
                          background: 'rgba(154,174,255,0.12)',
                          color: '#9AAEFF',
                          border: '1px solid rgba(154,174,255,0.25)'
                        }
                      : {
                          background: 'transparent',
                          color: 'rgba(255,255,255,0.25)',
                          border: '1px solid rgba(255,255,255,0.06)'
                        }
                    }
                  >
                    {f.label}
                  </button>
                ))}
                <button className="w-8 h-8 flex items-center justify-center rounded-xl border border-white/10 text-white/30 hover:text-white/60 transition-all ml-1">
                  <FiFilter size={12}/>
                </button>
              </div>
            </div>
          </Reveal>

          <div className="rounded-2xl border border-white/5 overflow-hidden bg-white/[0.01]">
            <div 
              className="h-[2px]" 
              style={{background: 'linear-gradient(90deg, #34D399, #9AAEFF, transparent)'}}
            />
            <div className="px-7 py-3">
              <AnimatePresence mode="wait">
                {filtered.length === 0 ? (
                  <motion.div 
                    key="empty" 
                    initial={{opacity: 0}} 
                    animate={{opacity: 1}} 
                    exit={{opacity: 0}} 
                    className="py-16 text-center"
                  >
                    <FiActivity size={24} className="mx-auto text-white/10 mb-3"/>
                    <p className="text-sm font-light text-white/20">{t.noTx}</p>
                  </motion.div>
                ) : (
                  <motion.div 
                    key={filter} 
                    initial={{opacity: 0}} 
                    animate={{opacity: 1}} 
                    exit={{opacity: 0}} 
                    transition={{duration: 0.2}}
                  >
                    {filtered.map((tx, i) => (
                      <TxRow key={tx.id} tx={tx} t={t} index={i}/>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <Reveal delay={0.1}>
            <div className="mt-6 flex items-center justify-between text-[10px] text-white/20 font-light">
              <div className="flex items-center gap-2">
                <FiCheck size={10} className="text-[#34D399]/40"/>
                <span>
                  {language === 'fr' 
                    ? 'Données synchronisées en temps réel' 
                    : 'Real-time synchronized data'}
                </span>
              </div>
              <span>
                Nova Finance · {new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
              </span>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
};

export default FinanceSection;