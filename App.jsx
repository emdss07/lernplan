import { useState, useRef, useEffect } from "react";

const GOOGLE_FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;0,9..144,700;1,9..144,300&family=DM+Sans:wght@300;400;500&display=swap');
`;

const styles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --ink: #0f0e0c; --cream: #f5f0e8; --warm: #e8e0d0; --accent: #c8401a;
    --accent2: #2a5c45; --gold: #d4a843; --muted: #8a8070; --card: #faf7f2; --border: #d8d0c0;
  }
  html, body { overflow-x: hidden; width: 100%; }
  body { background: var(--cream); color: var(--ink); font-family: 'DM Sans', sans-serif; }
  .app { min-height: 100vh; width: 100%; overflow-x: hidden; background: var(--cream);
    background-image: radial-gradient(ellipse at 10% 20%, rgba(200,64,26,0.06) 0%, transparent 50%),
      radial-gradient(ellipse at 90% 80%, rgba(42,92,69,0.06) 0%, transparent 50%); }

  /* NAV */
  .nav { display:flex; align-items:center; justify-content:space-between; padding:1rem 1.5rem;
    border-bottom:1px solid var(--border); background:rgba(245,240,232,0.92);
    backdrop-filter:blur(10px); position:sticky; top:0; z-index:100; width:100%; }
  .nav-logo { font-family:'Fraunces',serif; font-size:1.4rem; font-weight:700; color:var(--ink); letter-spacing:-0.02em; }
  .nav-logo span { color:var(--accent); }

  /* ONBOARD */
  .onboard { max-width:560px; margin:0 auto; padding:3rem 1.25rem 4rem; animation:fadeUp 0.5s ease both; width:100%; }
  .onboard-eyebrow { font-size:0.72rem; letter-spacing:0.12em; text-transform:uppercase; color:var(--accent); font-weight:500; margin-bottom:0.8rem; }
  .onboard-title { font-family:'Fraunces',serif; font-size:clamp(2rem,6vw,2.8rem); font-weight:600; line-height:1.15; color:var(--ink); margin-bottom:0.8rem; }
  .onboard-title em { font-style:italic; color:var(--accent); }
  .onboard-sub { color:var(--muted); font-size:0.95rem; line-height:1.6; margin-bottom:2rem; }

  /* FORM */
  .form-card { background:var(--card); border:1px solid var(--border); border-radius:16px; padding:1.5rem;
    display:flex; flex-direction:column; gap:1.2rem; box-shadow:0 4px 24px rgba(0,0,0,0.06); width:100%; }
  .form-row { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
  @media(max-width:480px) { .form-row { grid-template-columns:1fr; } }
  .field { display:flex; flex-direction:column; gap:0.4rem; }
  .field label { font-size:0.75rem; font-weight:500; color:var(--muted); text-transform:uppercase; letter-spacing:0.06em; }
  .field input, .field select, .field textarea { background:var(--cream); border:1px solid var(--border);
    border-radius:9px; padding:0.75rem 1rem; font-family:'DM Sans',sans-serif; font-size:0.92rem;
    color:var(--ink); outline:none; transition:border-color 0.2s; width:100%; }
  .field input:focus, .field select:focus, .field textarea:focus { border-color:var(--accent); }
  .field textarea { resize:vertical; min-height:80px; }

  /* SUBJECT TAGS */
  .subject-tags { display:flex; flex-wrap:wrap; gap:0.5rem; margin-top:0.3rem; }
  .subject-tag { padding:0.35rem 0.85rem; border-radius:20px; border:1.5px solid var(--border);
    font-size:0.8rem; font-weight:500; cursor:pointer; background:var(--cream); color:var(--muted); transition:all 0.15s; }
  .subject-tag.selected { border-color:var(--accent); background:rgba(200,64,26,0.08); color:var(--accent); }

  /* EXAM ROWS */
  .exam-rows { display:flex; flex-direction:column; gap:0.6rem; margin-top:0.3rem; }
  .exam-row { display:flex; align-items:center; gap:0.8rem; background:var(--cream);
    border:1px solid var(--border); border-radius:10px; padding:0.7rem 1rem; transition:border-color 0.2s; }
  .exam-row:focus-within { border-color:var(--accent); }
  .exam-row-name { font-size:0.88rem; font-weight:500; color:var(--ink); flex:1; min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

  /* CUSTOM DATE PICKER */
  .date-picker-wrap { position:relative; flex-shrink:0; }
  .date-display { display:flex; align-items:center; gap:0.5rem; padding:0.4rem 0.75rem;
    background:var(--warm); border-radius:7px; cursor:pointer; font-size:0.82rem;
    font-weight:500; color:var(--ink); white-space:nowrap; user-select:none;
    border:1.5px solid transparent; transition:all 0.15s; }
  .date-display:hover { border-color:var(--accent); }
  .date-display.has-date { background:rgba(200,64,26,0.08); color:var(--accent); border-color:rgba(200,64,26,0.2); }
  .date-display svg { width:14px; height:14px; flex-shrink:0; }
  .calendar-popup { position:absolute; right:0; top:calc(100% + 6px); z-index:300;
    background:var(--card); border:1px solid var(--border); border-radius:14px;
    box-shadow:0 8px 32px rgba(0,0,0,0.14); padding:1rem; width:272px; animation:fadeUp 0.15s ease both; }
  .cal-popup-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:0.8rem; }
  .cal-popup-month { font-family:'Fraunces',serif; font-size:1rem; font-weight:600; color:var(--ink); }
  .cal-nav-btn { background:var(--warm); border:none; border-radius:7px; width:28px; height:28px;
    cursor:pointer; display:flex; align-items:center; justify-content:center;
    font-size:1rem; color:var(--ink); transition:background 0.15s; line-height:1; }
  .cal-nav-btn:hover { background:var(--border); }
  .cal-dow-row { display:grid; grid-template-columns:repeat(7,1fr); gap:2px; margin-bottom:4px; }
  .cal-dow { font-size:0.66rem; text-align:center; color:var(--muted); font-weight:500; padding:2px 0; }
  .cal-days-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:2px; }
  .cal-cell { aspect-ratio:1; display:flex; align-items:center; justify-content:center;
    border-radius:6px; font-size:0.8rem; cursor:pointer; transition:all 0.1s;
    border:none; background:transparent; font-family:'DM Sans',sans-serif; }
  .cal-cell:hover:not(.cal-disabled):not(.cal-empty) { background:var(--warm); }
  .cal-cell.cal-today { font-weight:700; color:var(--accent); }
  .cal-cell.cal-selected { background:var(--accent) !important; color:white; font-weight:600; }
  .cal-cell.cal-disabled { color:var(--border); cursor:not-allowed; }
  .cal-cell.cal-empty { cursor:default; }

  /* BUTTONS */
  .btn-primary { background:var(--ink); color:var(--cream); border:none; border-radius:10px;
    padding:0.9rem 2rem; font-family:'DM Sans',sans-serif; font-size:0.95rem; font-weight:500;
    cursor:pointer; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:0.5rem; width:100%; }
  .btn-primary:hover { background:var(--accent); transform:translateY(-1px); box-shadow:0 6px 20px rgba(200,64,26,0.25); }
  .btn-primary:disabled { opacity:0.5; cursor:not-allowed; transform:none; box-shadow:none; }

  /* LOADING */
  .loading-screen { display:flex; flex-direction:column; align-items:center; justify-content:center;
    min-height:80vh; gap:1.5rem; animation:fadeIn 0.3s ease; padding:2rem; text-align:center; }
  .loading-orb { width:56px; height:56px; border-radius:50%; border:3px solid var(--border);
    border-top-color:var(--accent); animation:spin 0.8s linear infinite; }
  .loading-title { font-family:'Fraunces',serif; font-size:1.3rem; color:var(--ink); }
  .loading-step { font-size:0.83rem; color:var(--muted); animation:pulse 2s ease infinite; }

  /* DASHBOARD */
  .dashboard { max-width:860px; margin:0 auto; padding:2rem 1.25rem 3rem; animation:fadeUp 0.4s ease both; width:100%; }
  .dash-greeting { font-family:'Fraunces',serif; font-size:clamp(1.5rem,5vw,2rem); font-weight:600; color:var(--ink); }
  .dash-sub { color:var(--muted); font-size:0.92rem; margin-top:0.3rem; margin-bottom:1.5rem; line-height:1.5; }

  /* STATS */
  .stats-row { display:grid; grid-template-columns:repeat(3,1fr); gap:0.75rem; margin-bottom:1.5rem; }
  @media(max-width:480px) { .stats-row { grid-template-columns:1fr 1fr; } .stat-card:last-child { grid-column:span 2; } }
  .stat-card { background:var(--card); border:1px solid var(--border); border-radius:12px; padding:1rem 1.2rem; }
  .stat-label { font-size:0.72rem; text-transform:uppercase; letter-spacing:0.08em; color:var(--muted); margin-bottom:0.3rem; }
  .stat-value { font-family:'Fraunces',serif; font-size:1.8rem; font-weight:600; color:var(--ink); line-height:1; }
  .stat-unit { font-size:0.8rem; color:var(--muted); margin-left:0.2rem; }
  .section-title { font-family:'Fraunces',serif; font-size:1.1rem; font-weight:600; color:var(--ink); margin-bottom:0.8rem; }

  /* TODAY CARD */
  .today-card { background:var(--ink); color:var(--cream); border-radius:14px; padding:1.5rem;
    margin-bottom:1.5rem; position:relative; overflow:hidden; }
  .today-card::before { content:''; position:absolute; top:-40px; right:-40px; width:140px; height:140px;
    border-radius:50%; background:rgba(200,64,26,0.15); pointer-events:none; }
  .today-label { font-size:0.72rem; letter-spacing:0.1em; text-transform:uppercase; color:rgba(245,240,232,0.5); margin-bottom:0.4rem; }
  .today-title { font-family:'Fraunces',serif; font-size:1.3rem; font-weight:600; margin-bottom:0.3rem; }
  .today-meta { font-size:0.83rem; color:rgba(245,240,232,0.6); }

  /* SUBJECTS */
  .subjects-grid { display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; margin-bottom:1.5rem; }
  @media(max-width:480px) { .subjects-grid { grid-template-columns:1fr; } }
  .subject-card { background:var(--card); border:1px solid var(--border); border-radius:12px; padding:1.1rem 1.2rem; }
  .subject-card-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.7rem; gap:0.5rem; }
  .subject-name { font-weight:600; font-size:0.92rem; }
  .subject-exam-date { font-size:0.72rem; color:var(--muted); margin-top:0.15rem; }
  .subject-days-left { font-family:'Fraunces',serif; font-size:1.4rem; font-weight:600; color:var(--accent); flex-shrink:0; }
  .progress-bar { height:4px; background:var(--warm); border-radius:3px; overflow:hidden; }
  .progress-fill { height:100%; border-radius:3px; background:var(--accent2); transition:width 0.4s ease; }

  /* CALENDAR */
  .calendar-wrap { margin-bottom:1.5rem; }
  .calendar-scroll { overflow-x:auto; -webkit-overflow-scrolling:touch; padding-bottom:0.5rem; }
  .calendar-inner { min-width:500px; }
  .cal-dow-header { display:grid; grid-template-columns:48px repeat(7,1fr); gap:0.3rem; margin-bottom:0.3rem; }
  .cal-dow-cell { font-size:0.65rem; text-align:center; color:var(--muted); font-weight:500; }
  .cal-week-row { display:grid; grid-template-columns:48px repeat(7,1fr); gap:0.3rem; margin-bottom:0.3rem; align-items:start; }
  .cal-week-lbl { font-size:0.62rem; color:var(--muted); text-align:right; padding-right:0.4rem; padding-top:0.4rem; }
  .cal-day-cell { border-radius:8px; padding:0.35rem 0.3rem; min-height:52px; border:1px solid var(--border);
    background:var(--card); overflow:hidden; position:relative; }
  .cal-day-cell.is-today { border-color:var(--accent); background:rgba(200,64,26,0.04); }
  .cal-day-cell.is-exam { border-color:var(--accent2); background:rgba(42,92,69,0.07); }
  .cal-day-cell.is-weekend { background:var(--warm); opacity:0.5; }
  .cal-day-num { font-size:0.64rem; font-weight:500; color:var(--muted); margin-bottom:0.2rem; }
  .cal-entry { font-size:0.6rem; padding:2px 4px; border-radius:3px; font-weight:500;
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis; display:block; margin-bottom:1px; line-height:1.3; }
  .cal-entry.math    { background:rgba(200,64,26,0.13); color:#a03010; }
  .cal-entry.german  { background:rgba(42,92,69,0.13); color:#1a4a30; }
  .cal-entry.english { background:rgba(180,140,40,0.15); color:#7a5800; }
  .cal-entry.bio     { background:rgba(60,120,200,0.13); color:#1a3a80; }
  .cal-entry.history { background:rgba(140,60,160,0.13); color:#6a1a80; }
  .cal-entry.physics { background:rgba(40,160,160,0.13); color:#0a6060; }
  .cal-entry.chem    { background:rgba(200,100,40,0.13); color:#803000; }
  .cal-entry.latin   { background:rgba(100,80,160,0.13); color:#3a2060; }
  .cal-entry.exam    { background:rgba(42,92,69,0.18); color:#1a4a30; font-weight:700; }

  /* ERROR */
  .error-banner { background:rgba(200,64,26,0.08); border:1px solid rgba(200,64,26,0.25);
    border-radius:10px; padding:0.8rem 1rem; font-size:0.83rem; color:var(--accent); margin-bottom:1rem; }

  @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes pulse { 0%,100% { opacity:0.5; } 50% { opacity:1; } }
`;

const SUBJECTS = ["Mathematik","Deutsch","Englisch","Biologie","Geschichte","Physik","Chemie","Latein"];
const SUBJECT_COLOR = {
  "Mathematik":"math","Deutsch":"german","Englisch":"english","Biologie":"bio",
  "Geschichte":"history","Physik":"physics","Chemie":"chem","Latein":"latin"
};
const LOADING_MSGS = [
  "Analysiere deine Prüfungstermine...",
  "Berechne optimale Lernverteilung...",
  "Erstelle personalisierten Tagesplan...",
  "Priorisiere Themen nach Schwierigkeit...",
  "Finalisiere deinen Abitur-Lernplan..."
];
const MONTHS_DE = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
const DAYS_DE = ["Mo","Di","Mi","Do","Fr","Sa","So"];

function getDaysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.max(0, Math.ceil((new Date(dateStr) - new Date()) / 86400000));
}
function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("de-DE", { day:"numeric", month:"short", year:"numeric" });
}
function toDateStr(y, m, d) {
  return `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
}
function localDateStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}

// ─── CUSTOM DATE PICKER ───────────────────────────────────────
function DatePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const today = new Date();
  const todayStr = localDateStr(today);
  const initDate = value ? new Date(value + "T12:00:00") : today;
  const [viewYear, setViewYear] = useState(initDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initDate.getMonth());
  const ref = useRef(null);

  useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y=>y-1); } else setViewMonth(m=>m-1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y=>y+1); } else setViewMonth(m=>m+1);
  }

  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  let offset = firstDow - 1; if (offset < 0) offset = 6;
  const daysInMonth = new Date(viewYear, viewMonth+1, 0).getDate();
  const cells = [...Array(offset).fill(null), ...Array.from({length:daysInMonth},(_,i)=>i+1)];

  return (
    <div className="date-picker-wrap" ref={ref}>
      <div className={`date-display ${value?"has-date":""}`} onClick={()=>setOpen(o=>!o)}>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="1" y="2" width="14" height="13" rx="2"/><path d="M1 6h14M5 1v2M11 1v2"/>
        </svg>
        {value ? formatDate(value) : "Datum wählen"}
      </div>
      {open && (
        <div className="calendar-popup">
          <div className="cal-popup-header">
            <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
            <div className="cal-popup-month">{MONTHS_DE[viewMonth]} {viewYear}</div>
            <button className="cal-nav-btn" onClick={nextMonth}>›</button>
          </div>
          <div className="cal-dow-row" style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:"2px",marginBottom:"4px"}}>
            {DAYS_DE.map(d=><div key={d} style={{fontSize:"0.66rem",textAlign:"center",color:"var(--muted)",fontWeight:500}}>{d}</div>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:"2px"}}>
            {cells.map((d,i)=>{
              if (!d) return <div key={i}/>;
              const str = toDateStr(viewYear, viewMonth, d);
              const isPast = str < todayStr;
              const isToday = str === todayStr;
              const isSel = str === value;
              return (
                <button key={i}
                  className={`cal-cell ${isPast?"cal-disabled":""} ${isToday&&!isSel?"cal-today":""} ${isSel?"cal-selected":""}`}
                  onClick={()=>{ if(!isPast){onChange(str);setOpen(false);} }}
                >{d}</button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CALENDAR VIEW ────────────────────────────────────────────
function CalendarView({ dailyPlan, subjects }) {
  const today = new Date();

  // Build a lookup: dateStr -> {subject, topic}
  const planByDate = {};
  (dailyPlan || []).forEach(entry => { planByDate[entry.date] = entry; });

  // Exam dates lookup
  const examByDate = {};
  (subjects || []).forEach(s => {
    if (s.examDate) examByDate[s.examDate] = s.name;
  });

  // Build 28 days starting today
  const days = Array.from({length:28}, (_,i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  // Find the Monday of today's week to align grid
  const startDay = new Date(today);
  const dow = startDay.getDay(); // 0=Sun
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  startDay.setDate(startDay.getDate() + mondayOffset);

  // Build 4 full weeks from that Monday
  const weeks = [];
  for (let w = 0; w < 4; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(startDay);
      date.setDate(startDay.getDate() + w*7 + d);
      week.push(date);
    }
    weeks.push(week);
  }

  const todayStr = localDateStr(today);

  return (
    <div className="calendar-wrap">
      <div className="calendar-scroll">
        <div className="calendar-inner">
          <div className="cal-dow-header">
            <div/>
            {["Mo","Di","Mi","Do","Fr","Sa","So"].map(d=>(
              <div key={d} className="cal-dow-cell">{d}</div>
            ))}
          </div>
          {weeks.map((week, wi) => (
            <div key={wi} className="cal-week-row">
              <div className="cal-week-lbl">W{wi+1}</div>
              {week.map((date, di) => {
                const ds = localDateStr(date);
                const entry = planByDate[ds];
                const examName = examByDate[ds];
                const isToday = ds === todayStr;
                const isWeekend = di >= 5;
                const isInRange = date >= today && date <= days[days.length-1];

                return (
                  <div key={di} className={`cal-day-cell ${isToday?"is-today":""} ${examName?"is-exam":""} ${isWeekend?"is-weekend":""}`}>
                    <div className="cal-day-num" style={{color: isToday ? "var(--accent)" : undefined, fontWeight: isToday ? 700 : undefined}}>
                      {date.getDate()}
                    </div>
                    {examName && (
                      <span className="cal-entry exam">🎯 {examName.substring(0,8)}</span>
                    )}
                    {entry && !examName && (
                      <span className={`cal-entry ${SUBJECT_COLOR[entry.subject]||"math"}`}>
                        {entry.topic?.length > 12 ? entry.topic.substring(0,11)+"…" : entry.topic}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div style={{fontSize:"0.7rem",color:"var(--muted)",marginTop:"0.5rem",textAlign:"right"}}>← seitwärts scrollen</div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("onboard");
  const [formData, setFormData] = useState({name:"",hoursPerDay:"2",weaknesses:""});
  const [subjectDates, setSubjectDates] = useState({});
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [planData, setPlanData] = useState(null);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState("");
  const loadingRef = useRef(null);

  function toggleSubject(s) {
    setSelectedSubjects(prev => prev.includes(s) ? prev.filter(x=>x!==s) : [...prev,s]);
  }

  async function handleGenerate() {
    if (!formData.name || selectedSubjects.length === 0) return;
    const subjects = selectedSubjects.map(s => ({ name: s, examDate: subjectDates[s] || "" }));
    setError("");
    setScreen("loading");
    let i = 0;
    loadingRef.current = setInterval(() => { setLoadingMsg(LOADING_MSGS[i++ % LOADING_MSGS.length]); }, 1400);
    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentData: { ...formData, subjects } })
      });
      clearInterval(loadingRef.current);
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setPlanData({ ...data, subjects });
      setScreen("dashboard");
    } catch (err) {
      clearInterval(loadingRef.current);
      setError("Generierung fehlgeschlagen. Bitte nochmal versuchen.");
      setScreen("onboard");
    }
  }

  // Find today's or next upcoming study entry
  const todayStr = localDateStr(new Date());
  const todayEntry = planData?.dailyPlan?.find(e => e.date === todayStr)
    || planData?.dailyPlan?.find(e => e.date > todayStr);

  if (screen === "loading") return (
    <div className="app">
      <style>{GOOGLE_FONTS}{styles}</style>
      <div className="loading-screen">
        <div className="loading-orb"/>
        <div className="loading-title">KI erstellt deinen Plan…</div>
        <div className="loading-step">{loadingMsg}</div>
      </div>
    </div>
  );

  return (
    <div className="app">
      <style>{GOOGLE_FONTS}{styles}</style>

      {screen === "onboard" ? (
        <div className="onboard">
          <div className="onboard-eyebrow">Abitur Lernplan</div>
          <h1 className="onboard-title">Dein <em>smarter</em> Lernplan — von KI erstellt</h1>
          <p className="onboard-sub">Gib deine Fächer und Prüfungstermine ein. Die KI erstellt in Sekunden einen personalisierten Tages-Lernplan.</p>
          {error && <div className="error-banner">⚠ {error}</div>}
          <div className="form-card">
            <div className="form-row">
              <div className="field">
                <label>Dein Name</label>
                <input placeholder="z.B. Lena" value={formData.name} onChange={e=>setFormData({...formData,name:e.target.value})}/>
              </div>
              <div className="field">
                <label>Stunden pro Tag</label>
                <select value={formData.hoursPerDay} onChange={e=>setFormData({...formData,hoursPerDay:e.target.value})}>
                  {["1","1.5","2","3","4","5"].map(h=><option key={h} value={h}>{h} Std.</option>)}
                </select>
              </div>
            </div>

            <div className="field">
              <label>Fächer auswählen</label>
              <div className="subject-tags">
                {SUBJECTS.map(s=>(
                  <button key={s} className={`subject-tag ${selectedSubjects.includes(s)?"selected":""}`} onClick={()=>toggleSubject(s)}>{s}</button>
                ))}
              </div>
            </div>

            {selectedSubjects.length > 0 && (
              <div className="field">
                <label>Prüfungstermine</label>
                <div className="exam-rows">
                  {selectedSubjects.map(s=>(
                    <div key={s} className="exam-row">
                      <div className="exam-row-name">{s}</div>
                      <DatePicker value={subjectDates[s]||""} onChange={date=>setSubjectDates(prev=>({...prev,[s]:date}))}/>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="field">
              <label>Schwächen / Wünsche (optional)</label>
              <textarea placeholder="z.B. Integralrechnung fällt mir schwer..." value={formData.weaknesses} onChange={e=>setFormData({...formData,weaknesses:e.target.value})}/>
            </div>

            <button className="btn-primary" onClick={handleGenerate} disabled={!formData.name||selectedSubjects.length===0}>
              <span>✦</span> KI-Lernplan generieren
            </button>
          </div>
        </div>

      ) : planData && (
        <>
          <nav className="nav">
            <div className="nav-logo">Lern<span>.</span>Plan</div>
          </nav>

          <div className="dashboard">
            <div className="dash-greeting">Hallo, {formData.name} 👋</div>
            <div className="dash-sub">{planData.planSummary}</div>

            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-label">Fächer</div>
                <div className="stat-value">{planData.subjects?.length}<span className="stat-unit"> aktiv</span></div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Lerntage</div>
                <div className="stat-value">{planData.dailyPlan?.length || 0}<span className="stat-unit"> geplant</span></div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Nächste Prüfung</div>
                <div className="stat-value">
                  {(() => {
                    const withDates = planData.subjects?.filter(s=>s.examDate);
                    if (!withDates?.length) return "—";
                    const sorted = withDates.sort((a,b)=>new Date(a.examDate)-new Date(b.examDate));
                    const d = getDaysUntil(sorted[0].examDate);
                    return d === null ? "—" : d;
                  })()}
                  <span className="stat-unit"> Tage</span>
                </div>
              </div>
            </div>

            {todayEntry && (
              <div className="today-card">
                <div className="today-label">
                  {todayEntry.date === todayStr ? "Heute lernen" : "Nächste Session"}
                </div>
                <div className="today-title">{todayEntry.topic}</div>
                <div className="today-meta">{todayEntry.subject} · {formData.hoursPerDay} Std. eingeplant</div>
              </div>
            )}

            <div className="section-title">Deine Fächer</div>
            <div className="subjects-grid">
              {planData.subjects?.map((s,i)=>(
                <div key={i} className="subject-card">
                  <div className="subject-card-header">
                    <div>
                      <div className="subject-name">{s.name}</div>
                      <div className="subject-exam-date">{s.examDate ? `Prüfung: ${formatDate(s.examDate)}` : "Kein Datum"}</div>
                    </div>
                    {s.examDate && getDaysUntil(s.examDate) !== null && (
                      <div className="subject-days-left">{getDaysUntil(s.examDate)}d</div>
                    )}
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{
                      width: s.examDate && getDaysUntil(s.examDate) !== null
                        ? `${Math.min(90,Math.max(5,100-getDaysUntil(s.examDate)*1.5))}%`
                        : "10%"
                    }}/>
                  </div>
                </div>
              ))}
            </div>

            <div className="section-title">28-Tage Lernkalender</div>
            <CalendarView dailyPlan={planData.dailyPlan||[]} subjects={planData.subjects||[]}/>
          </div>
        </>
      )}
    </div>
  );
}
