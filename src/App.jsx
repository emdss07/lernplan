import { useState, useRef, useEffect } from "react";

const GOOGLE_FONTS = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;0,9..144,700;1,9..144,300&family=DM+Sans:wght@300;400;500&display=swap');`;

const css = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --ink:#0f0e0c; --cream:#f5f0e8; --warm:#e8e0d0; --accent:#c8401a;
    --accent2:#2a5c45; --muted:#8a8070; --card:#faf7f2; --border:#d8d0c0;
  }
  html { overflow-x:hidden; }
  body { overflow-x:hidden; background:var(--cream); color:var(--ink); font-family:'DM Sans',sans-serif; -webkit-text-size-adjust:100%; }
  .app { min-height:100vh; width:100%; max-width:100vw; overflow-x:hidden; background:var(--cream);
    background-image: radial-gradient(ellipse at 10% 20%,rgba(200,64,26,.06) 0%,transparent 50%),
      radial-gradient(ellipse at 90% 80%,rgba(42,92,69,.06) 0%,transparent 50%); }

  /* NAV */
  .nav { display:flex; align-items:center; padding:1rem 1.25rem; border-bottom:1px solid var(--border);
    background:rgba(245,240,232,.95); backdrop-filter:blur(10px); position:sticky; top:0; z-index:100; }
  .nav-logo { font-family:'Fraunces',serif; font-size:1.35rem; font-weight:700; color:var(--ink); letter-spacing:-.02em; }
  .nav-logo span { color:var(--accent); }
  .nav-version { font-size:.7rem; color:var(--muted); margin-left:.6rem; }

  /* ONBOARD */
  .onboard { width:100%; max-width:520px; margin:0 auto; padding:2.5rem 1.25rem 4rem; animation:fadeUp .5s ease both; }
  .eyebrow { font-size:.7rem; letter-spacing:.12em; text-transform:uppercase; color:var(--accent); font-weight:500; margin-bottom:.75rem; }
  .hero-title { font-family:'Fraunces',serif; font-size:clamp(1.9rem,7vw,2.7rem); font-weight:600; line-height:1.15; margin-bottom:.75rem; }
  .hero-title em { font-style:italic; color:var(--accent); }
  .hero-sub { color:var(--muted); font-size:.93rem; line-height:1.65; margin-bottom:2rem; }

  /* FORM */
  .form-card { background:var(--card); border:1px solid var(--border); border-radius:16px;
    padding:1.4rem; display:flex; flex-direction:column; gap:1.1rem; box-shadow:0 4px 24px rgba(0,0,0,.06); }
  .field { display:flex; flex-direction:column; gap:.35rem; }
  .field-label { font-size:.72rem; font-weight:500; color:var(--muted); text-transform:uppercase; letter-spacing:.07em; }
  .two-col { display:grid; grid-template-columns:1fr 1fr; gap:.9rem; }
  @media(max-width:440px){ .two-col { grid-template-columns:1fr; } }
  .inp { background:var(--cream); border:1px solid var(--border); border-radius:9px;
    padding:.72rem .9rem; font-family:'DM Sans',sans-serif; font-size:.9rem;
    color:var(--ink); outline:none; transition:border-color .18s; width:100%; -webkit-appearance:none; }
  .inp:focus { border-color:var(--accent); }
  textarea.inp { resize:vertical; min-height:76px; }

  /* CHIPS */
  .chip-wrap { display:flex; flex-wrap:wrap; gap:.45rem; margin-top:.2rem; }
  .chip { padding:.32rem .85rem; border-radius:20px; border:1.5px solid var(--border);
    font-size:.78rem; font-weight:500; cursor:pointer; background:var(--cream);
    color:var(--muted); transition:all .15s; -webkit-tap-highlight-color:transparent; }
  .chip.on { border-color:var(--accent); background:rgba(200,64,26,.08); color:var(--accent); }

  /* EXAM ROWS */
  .exam-rows { display:flex; flex-direction:column; gap:.5rem; margin-top:.2rem; }
  .exam-row { display:flex; align-items:center; gap:.7rem; background:var(--cream);
    border:1px solid var(--border); border-radius:10px; padding:.65rem .9rem; min-width:0; }
  .exam-name { font-size:.86rem; font-weight:500; flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

  /* DATE PICKER */
  .dp-wrap { position:relative; flex-shrink:0; }
  .dp-btn { display:flex; align-items:center; gap:.4rem; padding:.38rem .7rem;
    background:var(--warm); border-radius:7px; cursor:pointer; font-size:.8rem;
    font-weight:500; color:var(--ink); white-space:nowrap; user-select:none;
    border:1.5px solid transparent; transition:all .15s; -webkit-tap-highlight-color:transparent; }
  .dp-btn:hover { border-color:var(--accent); }
  .dp-btn.picked { background:rgba(200,64,26,.09); color:var(--accent); border-color:rgba(200,64,26,.25); }
  .dp-btn svg { width:13px; height:13px; flex-shrink:0; }
  .dp-popup { position:fixed; z-index:600; background:var(--card); border:1px solid var(--border);
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

  /* BUTTON */
  .btn-main { background:var(--ink); color:var(--cream); border:none; border-radius:10px;
    padding:.88rem; font-family:'DM Sans',sans-serif; font-size:.93rem; font-weight:500;
    cursor:pointer; transition:all .2s; display:flex; align-items:center; justify-content:center; gap:.5rem; width:100%;
    -webkit-tap-highlight-color:transparent; }
  .btn-main:hover:not(:disabled) { background:var(--accent); transform:translateY(-1px); box-shadow:0 6px 20px rgba(200,64,26,.25); }
  .btn-main:disabled { opacity:.45; cursor:not-allowed; }

  /* LOADING */
  .loading { display:flex; flex-direction:column; align-items:center; justify-content:center;
    min-height:80vh; gap:1.4rem; padding:2rem; text-align:center; animation:fadeIn .3s ease; }
  .spinner { width:52px; height:52px; border-radius:50%; border:3px solid var(--border); border-top-color:var(--accent); animation:spin .8s linear infinite; }
  .loading-h { font-family:'Fraunces',serif; font-size:1.25rem; color:var(--ink); }
  .loading-s { font-size:.82rem; color:var(--muted); animation:pulse 2s ease infinite; }

  /* DASHBOARD */
  .dash { width:100%; max-width:820px; margin:0 auto; padding:1.75rem 1.25rem 3rem; animation:fadeUp .4s ease both; }
  .dash-hi { font-family:'Fraunces',serif; font-size:clamp(1.4rem,5vw,1.9rem); font-weight:600; }
  .dash-sub { color:var(--muted); font-size:.88rem; margin-top:.3rem; margin-bottom:1.4rem; line-height:1.55; }

  /* STATS */
  .stats { display:grid; grid-template-columns:repeat(3,1fr); gap:.65rem; margin-bottom:1.4rem; }
  @media(max-width:400px){ .stats { grid-template-columns:1fr 1fr; } .stats>div:last-child { grid-column:span 2; } }
  .stat { background:var(--card); border:1px solid var(--border); border-radius:12px; padding:.9rem 1rem; }
  .stat-lbl { font-size:.68rem; text-transform:uppercase; letter-spacing:.08em; color:var(--muted); margin-bottom:.25rem; }
  .stat-val { font-family:'Fraunces',serif; font-size:1.7rem; font-weight:600; line-height:1; }
  .stat-unit { font-size:.75rem; color:var(--muted); margin-left:.15rem; }
  .sec-title { font-family:'Fraunces',serif; font-size:1rem; font-weight:600; margin-bottom:.7rem; }

  /* TODAY */
  .today { background:var(--ink); color:var(--cream); border-radius:14px; padding:1.3rem 1.4rem; margin-bottom:1.4rem; position:relative; overflow:hidden; }
  .today::before { content:''; position:absolute; top:-35px; right:-35px; width:120px; height:120px; border-radius:50%; background:rgba(200,64,26,.18); pointer-events:none; }
  .today-lbl { font-size:.68rem; letter-spacing:.1em; text-transform:uppercase; color:rgba(245,240,232,.45); margin-bottom:.35rem; }
  .today-entries { display:flex; flex-direction:column; gap:.5rem; }
  .today-entry { display:flex; align-items:baseline; gap:.5rem; }
  .today-subj { font-family:'Fraunces',serif; font-size:1.15rem; font-weight:600; }
  .today-topic { font-size:.82rem; color:rgba(245,240,232,.6); }

  /* SUBJECT CARDS */
  .subj-grid { display:grid; grid-template-columns:1fr 1fr; gap:.65rem; margin-bottom:1.4rem; }
  @media(max-width:440px){ .subj-grid { grid-template-columns:1fr; } }
  .subj-card { background:var(--card); border:1px solid var(--border); border-radius:12px; padding:1rem 1.1rem; }
  .subj-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:.6rem; gap:.5rem; }
  .subj-name { font-weight:600; font-size:.9rem; }
  .subj-date { font-size:.7rem; color:var(--muted); margin-top:.12rem; }
  .subj-days { font-family:'Fraunces',serif; font-size:1.3rem; font-weight:600; color:var(--accent); flex-shrink:0; }
  .prog { height:4px; background:var(--warm); border-radius:3px; overflow:hidden; }
  .prog-fill { height:100%; border-radius:3px; background:var(--accent2); }

  /* CALENDAR */
  .cal-wrap { margin-bottom:1.4rem; }
  .cal-scroll { overflow-x:auto; -webkit-overflow-scrolling:touch; padding-bottom:4px; }
  .cal-inner { min-width:460px; }
  .cal-header { display:grid; grid-template-columns:40px repeat(7,1fr); gap:3px; margin-bottom:3px; }
  .cal-header span { font-size:.62rem; text-align:center; color:var(--muted); font-weight:500; }
  .cal-week { display:grid; grid-template-columns:40px repeat(7,1fr); gap:3px; margin-bottom:3px; align-items:start; }
  .cal-lbl { font-size:.6rem; color:var(--muted); text-align:right; padding-right:4px; padding-top:5px; }
  .cal-cell { border-radius:8px; padding:4px; min-height:56px; border:1px solid var(--border);
    background:var(--card); overflow:hidden; cursor:pointer; transition:all .15s; position:relative; }
  .cal-cell:hover:not(.cal-wknd) { border-color:var(--accent); transform:translateY(-1px); box-shadow:0 2px 8px rgba(0,0,0,.08); }
  .cal-cell.cal-today { border-color:var(--accent); background:rgba(200,64,26,.04); }
  .cal-cell.cal-exam { border-color:var(--accent2); background:rgba(42,92,69,.07); }
  .cal-cell.cal-wknd { background:rgba(232,224,208,.5); cursor:default; }
  .cal-cell.cal-has-entries { cursor:pointer; }
  .cal-num { font-size:.62rem; font-weight:500; color:var(--muted); margin-bottom:2px; }
  .cal-num.is-today { color:var(--accent); font-weight:700; }
  .cal-tag { display:block; font-size:.56rem; padding:2px 4px; border-radius:3px; font-weight:500;
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:1px; line-height:1.35; }
  .cal-more { font-size:.54rem; color:var(--muted); margin-top:1px; }
  .t-math    { background:rgba(200,64,26,.13); color:#952f10; }
  .t-german  { background:rgba(42,92,69,.14); color:#1a4a30; }
  .t-english { background:rgba(180,140,30,.14); color:#7a5200; }
  .t-bio     { background:rgba(50,120,200,.13); color:#1a3a80; }
  .t-history { background:rgba(140,60,160,.13); color:#6a1a80; }
  .t-physics { background:rgba(30,160,160,.13); color:#0a5a5a; }
  .t-chem    { background:rgba(200,100,30,.13); color:#7a2a00; }
  .t-latin   { background:rgba(100,80,160,.13); color:#3a1a70; }
  .t-exam    { background:rgba(42,92,69,.2); color:#1a4a30; font-weight:700; }
  .cal-hint  { font-size:.67rem; color:var(--muted); margin-top:4px; text-align:right; }

  /* DAY MODAL */
  .modal-overlay { position:fixed; inset:0; background:rgba(15,14,12,.45); z-index:800;
    display:flex; align-items:flex-end; justify-content:center;
    animation:fadeIn .2s ease; padding:0; }
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
  .modal-entry-subj { font-weight:600; font-size:.88rem; margin-bottom:.2rem; display:flex; align-items:center; gap:.5rem; }
  .modal-entry-topic { font-size:.85rem; color:var(--muted); line-height:1.4; }
  .modal-exam-banner { background:rgba(42,92,69,.1); border:1px solid rgba(42,92,69,.25); border-radius:11px;
    padding:.9rem 1rem; display:flex; align-items:center; gap:.6rem; }
  .modal-exam-banner span { font-size:.88rem; color:var(--accent2); font-weight:600; }
  .modal-close { margin-top:1.2rem; width:100%; padding:.75rem; background:var(--warm); border:none;
    border-radius:10px; font-family:'DM Sans',sans-serif; font-size:.88rem; font-weight:500;
    cursor:pointer; color:var(--ink); transition:background .15s; }
  .modal-close:hover { background:var(--border); }

  .subj-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
  .dot-math    { background:#c8401a; }
  .dot-german  { background:#2a5c45; }
  .dot-english { background:#b88c1e; }
  .dot-bio     { background:#3278c8; }
  .dot-history { background:#8c3ca0; }
  .dot-physics { background:#1ea0a0; }
  .dot-chem    { background:#c8641e; }
  .dot-latin   { background:#6450a0; }

  .err { background:rgba(200,64,26,.08); border:1px solid rgba(200,64,26,.25); border-radius:10px; padding:.75rem 1rem; font-size:.82rem; color:var(--accent); margin-bottom:1rem; }

  @keyframes fadeUp   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
  @keyframes slideUp  { from{transform:translateY(100%)} to{transform:translateY(0)} }
  @keyframes spin     { to{transform:rotate(360deg)} }
  @keyframes pulse    { 0%,100%{opacity:.5} 50%{opacity:1} }
`;

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
  const d = new Date(s+"T12:00:00");
  return d.toLocaleDateString("de-DE",{day:"numeric",month:"short",year:"numeric"});
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

// ── DatePicker ─────────────────────────────────────────────
function DatePicker({ value, onChange }) {
  const [open, setOpen]   = useState(false);
  const [pos, setPos]     = useState({top:0,left:0});
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
      let left = r.right - 268; if (left < 8) left = 8;
      setPos({ top: r.bottom + 6 + window.scrollY, left });
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
        <div className="dp-popup" style={{top:pos.top, left:pos.left, position:"fixed"}}>
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
    function onKey(e) { if (e.key==="Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-drag"/>
        <div className="modal-date">{fmtDateLong(dateStr)}</div>
        <div className="modal-title">
          {examName ? `🎯 Prüfungstag: ${examName}` : entries.length > 0 ? "Heutige Lerneinheiten" : "Freier Tag"}
        </div>
        {examName && (
          <div className="modal-exam-banner">
            <span>✓ Prüfung für {examName} — viel Erfolg!</span>
          </div>
        )}
        {entries.length > 0 && (
          <div className="modal-entries">
            {entries.map((e,i) => (
              <div key={i} className="modal-entry">
                <div className="modal-entry-subj">
                  <div className={`subj-dot dot-${SUBJ_COLOR[e.subject]||"math"}`}/>
                  {e.subject}
                </div>
                <div className="modal-entry-topic">{e.topic}</div>
              </div>
            ))}
          </div>
        )}
        {!examName && entries.length === 0 && (
          <div style={{color:"var(--muted)",fontSize:".88rem"}}>Kein Lerninhalt für diesen Tag.</div>
        )}
        <button className="modal-close" onClick={onClose}>Schließen</button>
      </div>
    </div>
  );
}

// ── CalendarView ───────────────────────────────────────────
function CalendarView({ dailyPlan, subjects }) {
  const [modal, setModal] = useState(null); // {dateStr, entries, examName}
  const today    = new Date();
  const todayStr = localStr(today);

  // Group entries by date (multiple per day)
  const byDate = {};
  (dailyPlan||[]).forEach(e => {
    if (!byDate[e.date]) byDate[e.date] = [];
    byDate[e.date].push(e);
  });

  const examByDate = {};
  (subjects||[]).forEach(s => { if (s.examDate) examByDate[s.examDate] = s.name; });

  // Start from Monday of current week
  const monday = new Date(today);
  const dow = today.getDay();
  monday.setDate(today.getDate() - (dow===0 ? 6 : dow-1));

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
                  const ds       = localStr(date);
                  const entries  = byDate[ds] || [];
                  const exam     = examByDate[ds];
                  const isToday  = ds === todayStr;
                  const isWknd   = di >= 5;
                  const hasData  = entries.length > 0 || exam;
                  return (
                    <div key={di}
                      className={`cal-cell ${isToday?"cal-today":""} ${exam?"cal-exam":""} ${isWknd&&!isToday&&!exam?"cal-wknd":""} ${hasData?"cal-has-entries":""}`}
                      onClick={()=>!isWknd && openDay(date)}
                    >
                      <div className={`cal-num ${isToday?"is-today":""}`}>{date.getDate()}</div>
                      {exam && <span className="cal-tag t-exam">🎯 {exam.substring(0,7)}</span>}
                      {!exam && entries.slice(0,2).map((e,i)=>(
                        <span key={i} className={`cal-tag t-${SUBJ_COLOR[e.subject]||"math"}`}>
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
  const [screen,    setScreen]    = useState("onboard");
  const [name,      setName]      = useState("");
  const [hours,     setHours]     = useState("2");
  const [weakness,  setWeakness]  = useState("");
  const [selected,  setSelected]  = useState([]);
  const [dates,     setDates]     = useState({});
  const [plan,      setPlan]      = useState(null);
  const [loadMsg,   setLoadMsg]   = useState("");
  const [error,     setError]     = useState("");
  const timerRef = useRef(null);

  const todayStr = localStr(new Date());

  function toggleSubj(s) {
    setSelected(p => p.includes(s) ? p.filter(x=>x!==s) : [...p,s]);
  }

  async function generate() {
    if (!name || selected.length===0) return;
    setError(""); setScreen("loading");
    let i = 0;
    timerRef.current = setInterval(()=>setLoadMsg(LOAD_MSGS[i++%LOAD_MSGS.length]), 1400);
    try {
      const subjects = selected.map(s=>({name:s, examDate:dates[s]||""}));
      const res = await fetch("/api/generate-plan",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({studentData:{name,hoursPerDay:hours,weaknesses:weakness,subjects}})
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

  // Today's entries (multiple)
  const todayEntries = plan?.dailyPlan?.filter(e=>e.date===todayStr) || [];
  const nextEntries  = todayEntries.length===0
    ? plan?.dailyPlan?.filter(e=>e.date>todayStr).slice(0,2) || []
    : [];

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
        <div className="eyebrow">Abitur Lernplan</div>
        <h1 className="hero-title">Dein <em>smarter</em> Lernplan — von KI erstellt</h1>
        <p className="hero-sub">Gib deine Fächer und Prüfungstermine ein. Die KI erstellt in Sekunden einen personalisierten Lernplan.</p>
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
            </div>
          </div>
          {selected.length > 0 && (
            <div className="field">
              <div className="field-label">Prüfungstermine</div>
              <div className="exam-rows">
                {selected.map(s=>(
                  <div key={s} className="exam-row">
                    <div className="exam-name">{s}</div>
                    <DatePicker value={dates[s]||""} onChange={d=>setDates(p=>({...p,[s]:d}))}/>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="field">
            <div className="field-label">Schwächen / Wünsche (optional)</div>
            <textarea className="inp" placeholder="z.B. Integralrechnung fällt mir schwer…" value={weakness} onChange={e=>setWeakness(e.target.value)}/>
          </div>
          <button className="btn-main" onClick={generate} disabled={!name||selected.length===0}>
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
        <div className="nav-logo">Lern<span>.</span>Plan <span className="nav-version">v1.1</span></div>
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
              {(()=>{ const ws=plan.subjects?.filter(s=>s.examDate).sort((a,b)=>new Date(a.examDate)-new Date(b.examDate)); const d=ws?.length?daysUntil(ws[0].examDate):null; return d!==null?d:"—"; })()}
              <span className="stat-unit"> Tage</span>
            </div>
          </div>
        </div>

        {(todayEntries.length > 0 || nextEntries.length > 0) && (
          <div className="today">
            <div className="today-lbl">{todayEntries.length>0?"Heute lernen":"Nächste Sessions"}</div>
            <div className="today-entries">
              {(todayEntries.length>0 ? todayEntries : nextEntries).map((e,i)=>(
                <div key={i} className="today-entry">
                  <div className="today-subj">{e.subject}</div>
                  <div className="today-topic">— {e.topic}</div>
                </div>
              ))}
            </div>
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
                    <div className="subj-date">{s.examDate?`Prüfung: ${fmtDate(s.examDate)}`:"Kein Datum"}</div>
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
