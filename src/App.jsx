import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

const GOOGLE_FONTS = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;0,9..144,700;1,9..144,300&family=DM+Sans:wght@300;400;500&display=swap');`;

const css = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --ink:#0f0e0c; --cream:#f5f0e8; --warm:#e8e0d0; --accent:#c8401a;
    --accent2:#2a5c45; --muted:#8a8070; --card:#faf7f2; --border:#d8d0c0;
  }
  html { overflow-x:hidden; }
  html.modal-open { overflow:hidden; }
  body { overflow-x:hidden; max-width:100vw; background:var(--cream); color:var(--ink); font-family:'DM Sans',sans-serif; -webkit-text-size-adjust:100%; position:relative; }
  body.modal-open { overflow:hidden; touch-action:none; }
  .app { min-height:100vh; width:100%; max-width:100vw; overflow-x:hidden; background:var(--cream);
    background-image: radial-gradient(ellipse at 10% 20%,rgba(200,64,26,.06) 0%,transparent 50%),
      radial-gradient(ellipse at 90% 80%,rgba(42,92,69,.06) 0%,transparent 50%); }

  .nav { display:flex; align-items:center; padding:1rem 1.25rem; border-bottom:1px solid var(--border);
    background:rgba(245,240,232,.95); backdrop-filter:blur(10px); position:sticky; top:0; z-index:100; }
  .nav-logo { font-family:'Fraunces',serif; font-size:1.35rem; font-weight:700; color:var(--ink); letter-spacing:-.02em; }
  .nav-logo span { color:var(--accent); }
  .nav-version { font-size:.68rem; color:var(--muted); margin-left:.5rem; background:var(--warm);
    border:1px solid var(--border); border-radius:20px; padding:.15rem .55rem; }
  .nav-by { font-size:.65rem; color:var(--muted); margin-left:auto; letter-spacing:.03em; }
  .nav-by em { font-style:italic; color:var(--accent); }

  .onboard { width:100%; max-width:520px; margin:0 auto; padding:2.5rem 1.25rem 4rem; animation:fadeUp .5s ease both; }
  .eyebrow { font-size:.7rem; letter-spacing:.12em; text-transform:uppercase; color:var(--accent); font-weight:500; margin-bottom:.5rem; }
  .version-pill { display:inline-block; font-size:.68rem; color:var(--muted); background:var(--warm);
    border:1px solid var(--border); border-radius:20px; padding:.18rem .65rem; margin-bottom:.9rem; }
  .hero-title { font-family:'Fraunces',serif; font-size:clamp(1.9rem,7vw,2.7rem); font-weight:600; line-height:1.15; margin-bottom:.75rem; }
  .hero-title em { font-style:italic; color:var(--accent); }
  .hero-sub { color:var(--muted); font-size:.93rem; line-height:1.65; margin-bottom:2rem; }

  .form-card { background:var(--card); border:1px solid var(--border); border-radius:16px;
    padding:1.4rem; display:flex; flex-direction:column; gap:1.1rem; box-shadow:0 4px 24px rgba(0,0,0,.06); }
  .field { display:flex; flex-direction:column; gap:.35rem; }
  .field-label { font-size:.72rem; font-weight:500; color:var(--muted); text-transform:uppercase; letter-spacing:.07em; }
  .exam-name { font-size:.86rem; font-weight:500; flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .two-col { display:grid; grid-template-columns:1fr 1fr; gap:.9rem; }
  @media(max-width:440px){ .two-col { grid-template-columns:1fr; } }
  .inp { background:var(--cream); border:1px solid var(--border); border-radius:9px;
    padding:.72rem .9rem; font-family:'DM Sans',sans-serif; font-size:.9rem;
    color:var(--ink); outline:none; transition:border-color .18s; width:100%; -webkit-appearance:none; }
  .inp:focus { border-color:var(--accent); }
  textarea.inp { resize:vertical; min-height:76px; }

  .chip-wrap { display:flex; flex-wrap:wrap; gap:.45rem; margin-top:.2rem; align-items:center; }
  .chip { padding:.32rem .85rem; border-radius:20px; border:1.5px solid var(--border);
    font-size:.78rem; font-weight:500; cursor:pointer; background:var(--cream);
    color:var(--muted); transition:all .15s; -webkit-tap-highlight-color:transparent; }
  .chip.on { border-color:var(--accent); background:rgba(200,64,26,.08); color:var(--accent); }
  .chip-add-btn { width:28px; height:28px; border-radius:50%; border:1.5px solid var(--border);
    background:var(--cream); color:var(--muted); font-size:1.2rem; line-height:1;
    display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0;
    transition:all .15s; padding:0; -webkit-tap-highlight-color:transparent; }
  .chip-add-btn:hover { border-color:var(--accent); color:var(--accent); background:rgba(200,64,26,.06); }
  .custom-inp-row { display:flex; align-items:center; gap:.4rem; margin-top:.3rem; animation:fadeUp .15s ease both; width:100%; }
  .custom-inp { flex:1; background:var(--cream); border:1.5px solid var(--accent);
    border-radius:20px; padding:.3rem .85rem; font-family:'DM Sans',sans-serif;
    font-size:.78rem; font-weight:500; color:var(--ink); outline:none; min-width:0; }
  .custom-inp-ok { padding:.3rem .75rem; border-radius:20px; border:none;
    background:var(--accent); color:#fff; font-size:.78rem; font-weight:500; cursor:pointer; white-space:nowrap; flex-shrink:0; }
  .custom-inp-cancel { padding:.3rem .6rem; border-radius:20px; border:1.5px solid var(--border);
    background:var(--cream); color:var(--muted); font-size:.78rem; cursor:pointer; flex-shrink:0; }

  /* TOPIC CHIPS per subject */
  .topics-section { display:flex; flex-direction:column; gap:.6rem; margin-top:.2rem; }
  .topic-subj-block { background:var(--cream); border:1px solid var(--border); border-radius:10px; padding:.7rem .9rem; overflow:visible; }
  .topic-subj-name { font-size:.8rem; font-weight:600; color:var(--ink); margin-bottom:.45rem; }

  /* Importance stars */
  .importance-row { display:flex; align-items:center; gap:.5rem; margin-top:.55rem; padding-top:.55rem; border-top:1px solid var(--border); }
  .importance-lbl { font-size:.68rem; color:var(--muted); text-transform:uppercase; letter-spacing:.06em; flex-shrink:0; }
  .stars { display:flex; gap:3px; }
  .star { font-size:1rem; cursor:pointer; color:var(--border); transition:color .1s; line-height:1; -webkit-tap-highlight-color:transparent; }
  .star.on { color:#e8a020; }
  .importance-hint { font-size:.67rem; color:var(--muted); margin-left:.3rem; }
  .topic-chip-wrap { display:flex; flex-wrap:wrap; gap:.35rem; align-items:center; }
  .topic-chip { padding:.22rem .65rem; border-radius:20px; border:1.5px solid var(--accent);
    font-size:.72rem; font-weight:500; background:rgba(200,64,26,.07); color:var(--accent);
    cursor:pointer; transition:all .15s; -webkit-tap-highlight-color:transparent; }
  .topic-chip:hover { background:rgba(200,64,26,.15); }
  .topic-add-btn { width:24px; height:24px; border-radius:50%; border:1.5px solid var(--border);
    background:var(--cream); color:var(--muted); font-size:1rem; line-height:1;
    display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0;
    transition:all .15s; padding:0; }
  .topic-add-btn:hover { border-color:var(--accent); color:var(--accent); }
  .topic-inp-row { display:flex; align-items:center; gap:.35rem; margin-top:.35rem; width:100%; }
  .topic-inp { flex:1; background:var(--cream); border:1.5px solid var(--accent);
    border-radius:20px; padding:.25rem .75rem; font-family:'DM Sans',sans-serif;
    font-size:.72rem; font-weight:500; color:var(--ink); outline:none; min-width:0; }
  .topic-inp-ok { padding:.25rem .65rem; border-radius:20px; border:none;
    background:var(--accent); color:#fff; font-size:.72rem; font-weight:500; cursor:pointer; flex-shrink:0; }
  .topic-inp-cancel { padding:.25rem .5rem; border-radius:20px; border:1.5px solid var(--border);
    background:var(--cream); color:var(--muted); font-size:.72rem; cursor:pointer; flex-shrink:0; }
  .exam-row { display:flex; align-items:center; gap:.7rem; background:var(--cream);
    border:1px solid var(--border); border-radius:10px; padding:.65rem .9rem; min-width:0; }

  .dp-wrap { position:relative; flex-shrink:0; }
  .dp-btn { display:flex; align-items:center; gap:.4rem; padding:.38rem .7rem;
    background:var(--warm); border-radius:7px; cursor:pointer; font-size:.8rem;
    font-weight:500; color:var(--ink); white-space:nowrap; user-select:none;
    border:1.5px solid transparent; transition:all .15s; -webkit-tap-highlight-color:transparent; }
  .dp-btn:hover { border-color:var(--accent); }
  .dp-btn.picked { background:rgba(200,64,26,.09); color:var(--accent); border-color:rgba(200,64,26,.25); }
  .dp-btn svg { width:13px; height:13px; flex-shrink:0; }
  .dp-popup { position:fixed; z-index:9000; background:var(--card); border:1px solid var(--border);
    border-radius:14px; box-shadow:0 10px 40px rgba(0,0,0,.18); padding:1rem; width:268px; animation:fadeUp .15s ease both; }
  .dp-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:.75rem; }
  .dp-month { font-family:'Fraunces',serif; font-size:.95rem; font-weight:600; }
  .dp-nav { background:var(--warm); border:none; border-radius:7px; width:26px; height:26px;
    cursor:pointer; display:flex; align-items:center; justify-content:center;
    font-size:.95rem; color:var(--ink); transition:background .15s; }
  .dp-nav:hover { background:var(--border); }
  .dp-dow { display:grid; grid-template-columns:repeat(7,1fr); gap:1px; margin-bottom:3px; }
  .dp-dow span { font-size:.64rem; text-align:center; color:var(--muted); font-weight:500; padding:2px 0; }
  .dp-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:1px; }
  .dp-cell { aspect-ratio:1; display:flex; align-items:center; justify-content:center;
    border-radius:6px; font-size:.78rem; cursor:pointer; border:none;
    background:transparent; font-family:'DM Sans',sans-serif; transition:background .1s; }
  .dp-cell:hover:not(.dp-past):not(.dp-empty) { background:var(--warm); }
  .dp-cell.dp-today { font-weight:700; color:var(--accent); }
  .dp-cell.dp-sel { background:var(--accent)!important; color:#fff; font-weight:600; }
  .dp-cell.dp-past { color:var(--border); cursor:not-allowed; }
  .dp-cell.dp-empty { cursor:default; }

  .btn-main { background:var(--ink); color:var(--cream); border:none; border-radius:10px;
    padding:.88rem; font-family:'DM Sans',sans-serif; font-size:.93rem; font-weight:500;
    cursor:pointer; transition:all .2s; display:flex; align-items:center; justify-content:center; gap:.5rem; width:100%;
    -webkit-tap-highlight-color:transparent; }
  .btn-main:hover:not(:disabled) { background:var(--accent); transform:translateY(-1px); box-shadow:0 6px 20px rgba(200,64,26,.25); }
  .btn-main:disabled { opacity:.45; cursor:not-allowed; }

  .loading { display:flex; flex-direction:column; align-items:center; justify-content:center;
    min-height:80vh; gap:1.4rem; padding:2rem; text-align:center; animation:fadeIn .3s ease; }
  .spinner { width:52px; height:52px; border-radius:50%; border:3px solid var(--border); border-top-color:var(--accent); animation:spin .8s linear infinite; }
  .loading-h { font-family:'Fraunces',serif; font-size:1.25rem; color:var(--ink); }
  .loading-s { font-size:.82rem; color:var(--muted); animation:pulse 2s ease infinite; }

  .dash { width:100%; max-width:820px; margin:0 auto; padding:1.75rem 1.25rem 3rem; animation:fadeUp .4s ease both; }
  .dash-hi { font-family:'Fraunces',serif; font-size:clamp(1.4rem,5vw,1.9rem); font-weight:600; }
  .dash-sub { color:var(--muted); font-size:.88rem; margin-top:.3rem; margin-bottom:1.4rem; line-height:1.55; }

  .stats { display:grid; grid-template-columns:repeat(3,1fr); gap:.65rem; margin-bottom:1.4rem; }
  @media(max-width:400px){ .stats { grid-template-columns:1fr 1fr; } .stats>div:last-child { grid-column:span 2; } }
  .stat { background:var(--card); border:1px solid var(--border); border-radius:12px; padding:.9rem 1rem; }
  .stat-lbl { font-size:.68rem; text-transform:uppercase; letter-spacing:.08em; color:var(--muted); margin-bottom:.25rem; }
  .stat-val { font-family:'Fraunces',serif; font-size:1.7rem; font-weight:600; line-height:1; }
  .stat-unit { font-size:.75rem; color:var(--muted); margin-left:.15rem; }
  .sec-title { font-family:'Fraunces',serif; font-size:1rem; font-weight:600; margin-bottom:.7rem; }

  .today { background:var(--ink); color:var(--cream); border-radius:14px; padding:1.3rem 1.4rem; margin-bottom:1.4rem; position:relative; overflow:hidden; }
  .today::before { content:''; position:absolute; top:-35px; right:-35px; width:120px; height:120px; border-radius:50%; background:rgba(200,64,26,.18); pointer-events:none; }
  .today-lbl { font-size:.68rem; letter-spacing:.1em; text-transform:uppercase; color:rgba(245,240,232,.45); margin-bottom:.15rem; }
  .today-date { font-size:.78rem; color:rgba(245,240,232,.5); margin-bottom:.6rem; }
  .today-entries { display:flex; flex-direction:column; gap:.5rem; }
  .today-entry { display:flex; align-items:baseline; gap:.5rem; flex-wrap:wrap; }
  .today-subj { font-family:'Fraunces',serif; font-size:1.05rem; font-weight:600; }
  .today-topic { font-size:.8rem; color:rgba(245,240,232,.6); }
  .today-dur { font-size:.72rem; color:rgba(245,240,232,.38); margin-left:auto; white-space:nowrap; }
  .today-next-label { font-size:.72rem; color:rgba(245,240,232,.35); text-transform:uppercase; letter-spacing:.06em; margin-top:.7rem; margin-bottom:.2rem; padding-top:.7rem; border-top:1px solid rgba(245,240,232,.1); }

  .subj-grid { display:grid; grid-template-columns:1fr 1fr; gap:.65rem; margin-bottom:1.4rem; }
  @media(max-width:440px){ .subj-grid { grid-template-columns:1fr; } }
  .subj-card { background:var(--card); border:1px solid var(--border); border-radius:12px; padding:1rem 1.1rem; }
  .subj-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:.6rem; gap:.5rem; }
  .subj-name { font-weight:600; font-size:.9rem; }
  .subj-date { font-size:.7rem; color:var(--muted); margin-top:.12rem; }
  .subj-days { font-family:'Fraunces',serif; font-size:1.3rem; font-weight:600; color:var(--accent); flex-shrink:0; }
  .prog { height:4px; background:var(--warm); border-radius:3px; overflow:hidden; }
  .prog-fill { height:100%; border-radius:3px; background:var(--accent2); }

  .cal-wrap { margin-bottom:1.4rem; }
  .cal-scroll { overflow-x:auto; -webkit-overflow-scrolling:touch; padding-bottom:4px; }
  .cal-inner { min-width:460px; }
  .cal-header { display:grid; grid-template-columns:40px repeat(7,1fr); gap:3px; margin-bottom:3px; }
  .cal-header span { font-size:.62rem; text-align:center; color:var(--muted); font-weight:500; }
  .cal-week { display:grid; grid-template-columns:40px repeat(7,1fr); gap:3px; margin-bottom:3px; align-items:start; }
  .cal-lbl { font-size:.6rem; color:var(--muted); text-align:right; padding-right:4px; padding-top:5px; }
  .cal-cell { border-radius:8px; padding:4px; min-height:56px; border:1px solid var(--border);
    background:var(--card); overflow:hidden; cursor:pointer; transition:all .15s; }
  .cal-cell:hover:not(.cal-wknd) { border-color:var(--accent); transform:translateY(-1px); box-shadow:0 2px 8px rgba(0,0,0,.08); }
  .cal-cell.cal-today { border-color:var(--accent); background:rgba(200,64,26,.04); }
  .cal-cell.cal-exam { border-color:var(--accent2); background:rgba(42,92,69,.07); }
  .cal-cell.cal-wknd { background:rgba(232,224,208,.5); cursor:default; }
  .cal-num { font-size:.62rem; font-weight:500; color:var(--muted); margin-bottom:2px; }
  .cal-num.is-today { color:var(--accent); font-weight:700; }
  .cal-tag { display:block; font-size:.56rem; padding:2px 4px; border-radius:3px; font-weight:500;
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:1px; line-height:1.35; }
  .cal-more { font-size:.54rem; color:var(--muted); margin-top:1px; }
  .t-math{background:rgba(200,64,26,.13);color:#952f10}
  .t-german{background:rgba(42,92,69,.14);color:#1a4a30}
  .t-english{background:rgba(180,140,30,.14);color:#7a5200}
  .t-bio{background:rgba(50,120,200,.13);color:#1a3a80}
  .t-history{background:rgba(140,60,160,.13);color:#6a1a80}
  .t-physics{background:rgba(30,160,160,.13);color:#0a5a5a}
  .t-chem{background:rgba(200,100,30,.13);color:#7a2a00}
  .t-latin{background:rgba(100,80,160,.13);color:#3a1a70}
  .t-custom{background:rgba(100,100,100,.12);color:#333}
  .t-exam{background:rgba(42,92,69,.2);color:#1a4a30;font-weight:700}
  .cal-hint { font-size:.67rem; color:var(--muted); margin-top:4px; text-align:right; }

  .modal-overlay { position:fixed; top:0; left:0; width:100%; height:100%;
    background:rgba(15,14,12,.6); z-index:9999;
    display:flex; align-items:flex-end; justify-content:center; animation:fadeIn .2s ease; }
  @media(min-width:520px){ .modal-overlay { align-items:center; padding:1rem; } }
  .modal { background:var(--card); border-radius:20px 20px 0 0; width:100%; max-width:480px;
    padding:1.5rem 1.4rem 2rem; animation:slideUp .25s ease; max-height:85vh; overflow-y:auto; }
  @media(min-width:520px){ .modal { border-radius:20px; } }
  .modal-drag { width:40px; height:4px; background:var(--border); border-radius:2px; margin:0 auto 1.2rem; }
  @media(min-width:520px){ .modal-drag { display:none; } }
  .modal-date { font-size:.72rem; text-transform:uppercase; letter-spacing:.08em; color:var(--muted); margin-bottom:.4rem; }
  .modal-title { font-family:'Fraunces',serif; font-size:1.3rem; font-weight:600; margin-bottom:1.2rem; }
  .modal-entries { display:flex; flex-direction:column; gap:.7rem; }
  .modal-entry { background:var(--cream); border:1px solid var(--border); border-radius:11px; padding:.9rem 1rem; }
  .modal-entry-subj { font-weight:600; font-size:.88rem; margin-bottom:.25rem; display:flex; align-items:center; gap:.5rem; }
  .modal-entry-topic { font-size:.85rem; color:var(--muted); line-height:1.4; margin-bottom:.3rem; }
  .modal-entry-dur { font-size:.75rem; color:var(--accent2); font-weight:500; }
  .modal-total { font-size:.75rem; color:var(--muted); margin-top:.8rem; text-align:right; }
  .modal-exam-banner { background:rgba(42,92,69,.1); border:1px solid rgba(42,92,69,.25); border-radius:11px; padding:.9rem 1rem; }
  .modal-exam-banner span { font-size:.88rem; color:var(--accent2); font-weight:600; }
  .modal-close { margin-top:1.2rem; width:100%; padding:.75rem; background:var(--warm); border:none;
    border-radius:10px; font-family:'DM Sans',sans-serif; font-size:.88rem; font-weight:500;
    cursor:pointer; color:var(--ink); transition:background .15s; }
  .modal-close:hover { background:var(--border); }

  .subj-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
  .dot-math{background:#c8401a} .dot-german{background:#2a5c45} .dot-english{background:#b88c1e}
  .dot-bio{background:#3278c8} .dot-history{background:#8c3ca0} .dot-physics{background:#1ea0a0}
  .dot-chem{background:#c8641e} .dot-latin{background:#6450a0} .dot-custom{background:#666}

  .err { background:rgba(200,64,26,.08); border:1px solid rgba(200,64,26,.25); border-radius:10px; padding:.75rem 1rem; font-size:.82rem; color:var(--accent); margin-bottom:1rem; }

  @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
  @keyframes spin    { to{transform:rotate(360deg)} }
  @keyframes pulse   { 0%,100%{opacity:.5} 50%{opacity:1} }
`;

const VERSION    = "v2.2";
const SUBJECTS   = ["Mathematik","Deutsch","Englisch","Biologie","Geschichte","Physik","Chemie","Latein"];
const SUBJ_COLOR = { Mathematik:"math",Deutsch:"german",Englisch:"english",Biologie:"bio",Geschichte:"history",Physik:"physics",Chemie:"chem",Latein:"latin" };
const MONTHS_DE  = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
const DAYS_DE    = ["Mo","Di","Mi","Do","Fr","Sa","So"];
const LOAD_MSGS  = ["Analysiere Prüfungstermine…","Berechne Lernverteilung…","Erstelle Tagesplan…","Priorisiere Themen…","Finalisiere deinen Plan…"];
const DAYS_DE_FULL = ["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"];

function localStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function toStr(y,m,d) {
  return `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
}
function fmtDate(s) {
  if (!s) return "—";
  return new Date(s+"T12:00:00").toLocaleDateString("de-DE",{day:"numeric",month:"short",year:"numeric"});
}
function fmtDateLong(s) {
  if (!s) return "";
  const d = new Date(s+"T12:00:00");
  return `${DAYS_DE_FULL[d.getDay()]}, ${d.getDate()}. ${MONTHS_DE[d.getMonth()]} ${d.getFullYear()}`;
}
function daysUntil(s) {
  if (!s) return null;
  return Math.max(0, Math.ceil((new Date(s+"T12:00:00") - new Date()) / 86400000));
}
function subjColor(name) { return SUBJ_COLOR[name] || "custom"; }
function fmtMin(m) {
  if (!m) return "";
  if (m < 60) return `${m} min`;
  const h = Math.floor(m/60), rm = m%60;
  return rm === 0 ? `${h} Std.` : `${h} Std. ${rm} min`;
}

// ── DatePicker ─────────────────────────────────────────────
function DatePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [popupStyle, setPopupStyle] = useState({});
  const today    = new Date();
  const todayStr = localStr(today);
  const init     = value ? new Date(value+"T12:00:00") : today;
  const [vy, setVy] = useState(init.getFullYear());
  const [vm, setVm] = useState(init.getMonth());
  const btnRef  = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    function close(e) { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", close);
    document.addEventListener("touchstart", close);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("touchstart", close); };
  }, []);

  function openPicker() {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const popupW = 268;
      const spaceRight = window.innerWidth - r.right - 8;
      const spaceBelow = window.innerHeight - r.bottom - 8;

      if (spaceRight >= popupW && window.innerWidth >= 600) {
        // Place to the right, vertically centered on button
        setPopupStyle({ position:"fixed", left: r.right + 8, top: r.top + r.height/2, transform:"translateY(-50%)" });
      } else {
        // Place below, right-aligned to button but clamped to viewport
        let left = r.right - popupW;
        if (left < 8) left = 8;
        if (left + popupW > window.innerWidth - 8) left = window.innerWidth - popupW - 8;
        setPopupStyle({ position:"fixed", left, top: r.bottom + 6 });
      }
    }
    setOpen(o => !o);
  }

  const firstDow = new Date(vy, vm, 1).getDay();
  let off = firstDow - 1; if (off < 0) off = 6;
  const dim   = new Date(vy, vm+1, 0).getDate();
  const cells = [...Array(off).fill(null), ...Array.from({length:dim},(_,i)=>i+1)];

  return (
    <div className="dp-wrap" ref={wrapRef}>
      <div ref={btnRef} className={`dp-btn ${value?"picked":""}`} onClick={openPicker}>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="1" y="2" width="14" height="13" rx="2"/><path d="M1 6h14M5 1v2M11 1v2"/>
        </svg>
        {value ? fmtDate(value) : "Datum wählen"}
      </div>
      {open && (
        <div className="dp-popup" style={popupStyle}>
          <div className="dp-head">
            <button className="dp-nav" onClick={()=>vm===0?(setVm(11),setVy(y=>y-1)):setVm(m=>m-1)}>‹</button>
            <div className="dp-month">{MONTHS_DE[vm]} {vy}</div>
            <button className="dp-nav" onClick={()=>vm===11?(setVm(0),setVy(y=>y+1)):setVm(m=>m+1)}>›</button>
          </div>
          <div className="dp-dow">{DAYS_DE.map(d=><span key={d}>{d}</span>)}</div>
          <div className="dp-grid">
            {cells.map((d,i)=>{
              if (!d) return <div key={i} className="dp-cell dp-empty"/>;
              const s = toStr(vy,vm,d);
              const past = s < todayStr;
              return (
                <button key={i}
                  className={`dp-cell ${past?"dp-past":""} ${s===todayStr&&s!==value?"dp-today":""} ${s===value?"dp-sel":""}`}
                  onClick={()=>{ if(!past){onChange(s);setOpen(false);} }}
                >{d}</button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Day Modal ──────────────────────────────────────────────
function DayModal({ dateStr, entries, examName, onClose }) {
  useEffect(() => {
    document.body.classList.add("modal-open");
    document.documentElement.classList.add("modal-open");
    function onKey(e) { if (e.key==="Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("modal-open");
      document.documentElement.classList.remove("modal-open");
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const totalMin = entries.reduce((a,e)=>a+(e.durationMinutes||0),0);

  return createPortal(
    <div className="modal-overlay" onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-drag"/>
        <div className="modal-date">{fmtDateLong(dateStr)}</div>
        <div className="modal-title">
          {examName ? `🎯 Prüfungstag: ${examName}` : entries.length > 0 ? "Lerneinheiten" : "Freier Tag"}
        </div>
        {examName && (
          <div className="modal-exam-banner">
            <span>✓ Prüfung: {examName} — viel Erfolg!</span>
          </div>
        )}
        {entries.length > 0 && (
          <>
            <div className="modal-entries">
              {entries.map((e,i) => (
                <div key={i} className="modal-entry">
                  <div className="modal-entry-subj">
                    <div className={`subj-dot dot-${subjColor(e.subject)}`}/>
                    {e.subject}
                  </div>
                  <div className="modal-entry-topic">{e.topic}</div>
                  {e.durationMinutes && <div className="modal-entry-dur">⏱ {fmtMin(e.durationMinutes)}</div>}
                </div>
              ))}
            </div>
            {totalMin > 0 && <div className="modal-total">Gesamt: {fmtMin(totalMin)}</div>}
          </>
        )}
        {!examName && entries.length === 0 && (
          <div style={{color:"var(--muted)",fontSize:".88rem"}}>Kein Lerninhalt für diesen Tag.</div>
        )}
        <button className="modal-close" onClick={onClose}>Schließen</button>
      </div>
    </div>,
    document.body
  );
}

// ── CalendarView ───────────────────────────────────────────
function CalendarView({ dailyPlan, subjects }) {
  const [modal, setModal] = useState(null);
  const today    = new Date();
  const todayStr = localStr(today);

  const byDate = {};
  (dailyPlan||[]).forEach(e => {
    if (!byDate[e.date]) byDate[e.date] = [];
    byDate[e.date].push(e);
  });

  const examByDate = {};
  (subjects||[]).forEach(s => { if (s.examDate) examByDate[s.examDate] = s.name; });

  const monday = new Date(today);
  const dow = today.getDay();
  monday.setDate(today.getDate() - (dow===0?6:dow-1));

  const weeks = Array.from({length:4},(_,wi) =>
    Array.from({length:7},(_,di) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + wi*7 + di);
      return d;
    })
  );

  function openDay(date) {
    const ds = localStr(date);
    const entries = byDate[ds] || [];
    const examName = examByDate[ds] || null;
    if (entries.length > 0 || examName) setModal({ dateStr:ds, entries, examName });
  }

  return (
    <>
      <div className="cal-wrap">
        <div className="cal-scroll">
          <div className="cal-inner">
            <div className="cal-header">
              <span/>
              {["Mo","Di","Mi","Do","Fr","Sa","So"].map(d=><span key={d}>{d}</span>)}
            </div>
            {weeks.map((week,wi)=>(
              <div key={wi} className="cal-week">
                <div className="cal-lbl">W{wi+1}</div>
                {week.map((date,di)=>{
                  const ds      = localStr(date);
                  const entries = byDate[ds] || [];
                  const exam    = examByDate[ds];
                  const isToday = ds === todayStr;
                  const isWknd  = di >= 5;
                  const hasData = entries.length > 0 || exam;
                  return (
                    <div key={di}
                      className={`cal-cell ${isToday?"cal-today":""} ${exam?"cal-exam":""} ${isWknd&&!isToday&&!exam?"cal-wknd":""} ${hasData?"cal-has-entries":""}`}
                      onClick={()=>!isWknd && openDay(date)}
                    >
                      <div className={`cal-num ${isToday?"is-today":""}`}>{date.getDate()}</div>
                      {exam && <span className="cal-tag t-exam">🎯 {exam.substring(0,7)}</span>}
                      {!exam && entries.slice(0,2).map((e,i)=>(
                        <span key={i} className={`cal-tag t-${subjColor(e.subject)}`}>
                          {e.topic?.length>12 ? e.topic.substring(0,11)+"…" : e.topic}
                        </span>
                      ))}
                      {!exam && entries.length > 2 && (
                        <div className="cal-more">+{entries.length-2} mehr</div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="cal-hint">Tipp: Auf einen Tag tippen für Details · ← scrollen</div>
      </div>
      {modal && (
        <DayModal
          dateStr={modal.dateStr}
          entries={modal.entries}
          examName={modal.examName}
          onClose={()=>setModal(null)}
        />
      )}
    </>
  );
}

// ── App ────────────────────────────────────────────────────
export default function App() {
  const [screen,   setScreen]   = useState("onboard");
  const [name,     setName]     = useState("");
  const [hours,    setHours]    = useState("2");
  const [selected, setSelected] = useState([]);
  const [dates,    setDates]    = useState({});
  const [plan,     setPlan]     = useState(null);
  const [loadMsg,  setLoadMsg]  = useState("");
  const [error,    setError]    = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [customVal,  setCustomVal]  = useState("");
  const [topics,     setTopics]     = useState({});
  const [topicInput, setTopicInput] = useState({});
  const [showTopicInput, setShowTopicInput] = useState({});
  const [importance, setImportance] = useState({}); // { subjectName: 1-5 }, default 3
  const customRef = useRef(null);
  const timerRef  = useRef(null);
  const todayStr  = localStr(new Date());

  function toggleSubj(s) {
    setSelected(p => p.includes(s) ? p.filter(x=>x!==s) : [...p,s]);
  }

  function addCustom() {
    const v = customVal.trim();
    if (!v) { setShowCustom(false); return; }
    if (!selected.includes(v)) setSelected(p => [...p, v]);
    setCustomVal(""); setShowCustom(false);
  }

  function addTopic(subj) {
    const v = (topicInput[subj]||"").trim();
    if (!v) { setShowTopicInput(p=>({...p,[subj]:false})); return; }
    setTopics(p=>({...p,[subj]:[...(p[subj]||[]),v]}));
    setTopicInput(p=>({...p,[subj]:""}));
    setShowTopicInput(p=>({...p,[subj]:false}));
  }
  function removeTopic(subj, idx) {
    setTopics(p=>({...p,[subj]:(p[subj]||[]).filter((_,i)=>i!==idx)}));
  }

  useEffect(() => { if (showCustom) customRef.current?.focus(); }, [showCustom]);

  const missingDates = selected.filter(s => !dates[s]);
  const canGenerate  = name && selected.length > 0 && missingDates.length === 0;

  async function generate() {
    if (!canGenerate) return;
    setError(""); setScreen("loading");
    let i = 0;
    timerRef.current = setInterval(()=>setLoadMsg(LOAD_MSGS[i++%LOAD_MSGS.length]), 1400);
    try {
      const subjects = selected.map(s=>({name:s, examDate:dates[s]||"", topics:topics[s]||[], importance:importance[s]||3}));
      const res = await fetch("/api/generate-plan",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({studentData:{name,hoursPerDay:hours,subjects}})
      });
      clearInterval(timerRef.current);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPlan({...data, subjects});
      setScreen("dashboard");
    } catch {
      clearInterval(timerRef.current);
      setError("Generierung fehlgeschlagen. Bitte nochmal versuchen.");
      setScreen("onboard");
    }
  }

  // ── "Nächste Sessions" Logik ──────────────────────────────
  // Find the next TWO distinct learning days from today onwards
  const nextSessions = (() => {
    if (!plan?.dailyPlan) return [];
    const futureDates = [...new Set(
      plan.dailyPlan
        .filter(e => e.date >= todayStr)
        .map(e => e.date)
    )].sort().slice(0, 2);

    return futureDates.map(date => ({
      date,
      entries: plan.dailyPlan.filter(e => e.date === date)
    }));
  })();

  if (screen==="loading") return (
    <div className="app">
      <style>{GOOGLE_FONTS}{css}</style>
      <div className="loading">
        <div className="spinner"/>
        <div className="loading-h">KI erstellt deinen Plan…</div>
        <div className="loading-s">{loadMsg}</div>
      </div>
    </div>
  );

  if (screen==="onboard") return (
    <div className="app">
      <style>{GOOGLE_FONTS}{css}</style>
      <div className="onboard">
        <div className="eyebrow">Lernplan</div>
        <div className="version-pill">{VERSION}</div>
        <h1 className="hero-title">Dein <em>smarter</em> Lernplan — von KI erstellt</h1>
        <p className="hero-sub">Gib deine Fächer und Prüfungstermine ein. Die KI erstellt in Sekunden einen personalisierten Lernplan.</p>
        <p style={{fontSize:".72rem",color:"var(--muted)",marginTop:"-.5rem",marginBottom:"1.5rem"}}>by <em style={{fontStyle:"italic",color:"var(--accent)"}}>Eduardo</em></p>
        {error && <div className="err">⚠ {error}</div>}
        <div className="form-card">
          <div className="two-col">
            <div className="field">
              <div className="field-label">Dein Name</div>
              <input className="inp" placeholder="z.B. Lena" value={name} onChange={e=>setName(e.target.value)}/>
            </div>
            <div className="field">
              <div className="field-label">Stunden pro Tag</div>
              <select className="inp" value={hours} onChange={e=>setHours(e.target.value)}>
                {["1","1.5","2","3","4","5"].map(h=><option key={h} value={h}>{h} Std.</option>)}
              </select>
            </div>
          </div>

          <div className="field">
            <div className="field-label">Fächer auswählen</div>
            <div className="chip-wrap">
              {SUBJECTS.map(s=>(
                <button key={s} className={`chip ${selected.includes(s)?"on":""}`} onClick={()=>toggleSubj(s)}>{s}</button>
              ))}
              {selected.filter(s=>!SUBJECTS.includes(s)).map(s=>(
                <button key={s} className="chip on" onClick={()=>toggleSubj(s)}>{s} ×</button>
              ))}
              {!showCustom && (
                <button className="chip-add-btn" onClick={()=>setShowCustom(true)} title="Eigenes Fach">+</button>
              )}
            </div>
            {showCustom && (
              <div className="custom-inp-row">
                <input ref={customRef} className="custom-inp" placeholder="Fachname…"
                  value={customVal} onChange={e=>setCustomVal(e.target.value)}
                  onKeyDown={e=>{ if(e.key==="Enter") addCustom(); if(e.key==="Escape"){setShowCustom(false);setCustomVal("");} }}/>
                <button className="custom-inp-ok" onClick={addCustom}>Hinzufügen</button>
                <button className="custom-inp-cancel" onClick={()=>{setShowCustom(false);setCustomVal("");}}>✕</button>
              </div>
            )}
          </div>

          {selected.length > 0 && (
            <div className="field">
              <div className="field-label">Prüfungstermine & Themen</div>
              <div className="topics-section">
                {selected.map(s=>(
                  <div key={s} className="topic-subj-block">
                    {/* Subject name + date picker row */}
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:".5rem"}}>
                      <div className="topic-subj-name">{s}</div>
                      <DatePicker value={dates[s]||""} onChange={d=>setDates(p=>({...p,[s]:d}))}/>
                    </div>
                    {/* Topics chips */}
                    <div className="topic-chip-wrap">
                      {(topics[s]||[]).map((t,i)=>(
                        <span key={i} className="topic-chip" onClick={()=>removeTopic(s,i)}>{t} ×</span>
                      ))}
                      {!showTopicInput[s] && (
                        <button className="topic-add-btn" onClick={()=>setShowTopicInput(p=>({...p,[s]:true}))} title="Thema hinzufügen">+</button>
                      )}
                    </div>
                    {showTopicInput[s] && (
                      <div className="topic-inp-row">
                        <input
                          autoFocus
                          className="topic-inp"
                          placeholder="Thema eingeben…"
                          value={topicInput[s]||""}
                          onChange={e=>setTopicInput(p=>({...p,[s]:e.target.value}))}
                          onKeyDown={e=>{
                            if(e.key==="Enter") addTopic(s);
                            if(e.key==="Escape") setShowTopicInput(p=>({...p,[s]:false}));
                          }}
                        />
                        <button className="topic-inp-ok" onClick={()=>addTopic(s)}>+</button>
                        <button className="topic-inp-cancel" onClick={()=>setShowTopicInput(p=>({...p,[s]:false}))}>✕</button>
                      </div>
                    )}
                    {/* Importance stars */}
                    <div className="importance-row">
                      <div className="importance-lbl">Wichtigkeit</div>
                      <div className="stars">
                        {[1,2,3,4,5].map(n=>(
                          <span key={n} className={`star ${(importance[s]||3)>=n?"on":""}`}
                            onClick={()=>setImportance(p=>({...p,[s]:n}))}>★</span>
                        ))}
                      </div>
                      <div className="importance-hint">
                        {(importance[s]||3)===1?"wenig Zeit":(importance[s]||3)===2?"etwas weniger":(importance[s]||3)===3?"normal":(importance[s]||3)===4?"mehr Zeit":"maximale Zeit"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button className="btn-main" onClick={generate} disabled={!canGenerate}>
            <span>✦</span> KI-Lernplan generieren
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app">
      <style>{GOOGLE_FONTS}{css}</style>
      <nav className="nav">
        <div className="nav-logo">Lern<span>.</span>Plan <span className="nav-version">{VERSION}</span></div>
        <div className="nav-by">by <em>Eduardo</em></div>
      </nav>
      <div className="dash">
        <div className="dash-hi">Hallo, {name} 👋</div>
        <div className="dash-sub">{plan.planSummary}</div>

        <div className="stats">
          <div className="stat">
            <div className="stat-lbl">Fächer</div>
            <div className="stat-val">{plan.subjects?.length}<span className="stat-unit"> aktiv</span></div>
          </div>
          <div className="stat">
            <div className="stat-lbl">Lerntage</div>
            <div className="stat-val">{[...new Set(plan.dailyPlan?.map(e=>e.date)||[])].length}<span className="stat-unit"> Tage</span></div>
          </div>
          <div className="stat">
            <div className="stat-lbl">Nächste Prüfung</div>
            <div className="stat-val">
              {(()=>{
                const ws = plan.subjects?.filter(s=>s.examDate).sort((a,b)=>new Date(a.examDate)-new Date(b.examDate));
                const d = ws?.length ? daysUntil(ws[0].examDate) : null;
                return d !== null ? d : "—";
              })()}
              <span className="stat-unit"> Tage</span>
            </div>
          </div>
        </div>

        {nextSessions.length > 0 && (
          <div className="today">
            <div className="today-lbl">
              {nextSessions[0].date === todayStr ? "Heute & Morgen" : "Nächste Sessions"}
            </div>
            {nextSessions.map((day, di) => (
              <div key={di}>
                <div className="today-date">
                  {day.date === todayStr ? "Heute" : day.date === (() => { const t=new Date(); t.setDate(t.getDate()+1); return localStr(t); })() ? "Morgen" : fmtDate(day.date)} — {fmtDate(day.date)}
                </div>
                <div className="today-entries">
                  {day.entries.map((e,i)=>(
                    <div key={i} className="today-entry">
                      <div className="today-subj">{e.subject}</div>
                      <div className="today-topic">— {e.topic}</div>
                      {e.durationMinutes && <div className="today-dur">⏱ {fmtMin(e.durationMinutes)}</div>}
                    </div>
                  ))}
                </div>
                {di === 0 && nextSessions.length > 1 && (
                  <div className="today-next-label">Danach</div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="sec-title">Deine Fächer</div>
        <div className="subj-grid">
          {plan.subjects?.map((s,i)=>{
            const d = daysUntil(s.examDate);
            return (
              <div key={i} className="subj-card">
                <div className="subj-header">
                  <div>
                    <div className="subj-name">{s.name}</div>
                    <div className="subj-date">{s.examDate ? `Prüfung: ${fmtDate(s.examDate)}` : "Kein Datum"}</div>
                  </div>
                  {d!==null && <div className="subj-days">{d}d</div>}
                </div>
                <div className="prog">
                  <div className="prog-fill" style={{width:`${d!==null?Math.min(90,Math.max(5,100-d*1.5)):10}%`}}/>
                </div>
              </div>
            );
          })}
        </div>

        <div className="sec-title">28-Tage Lernkalender</div>
        <CalendarView dailyPlan={plan.dailyPlan||[]} subjects={plan.subjects||[]}/>
      </div>
    </div>
  );
}

