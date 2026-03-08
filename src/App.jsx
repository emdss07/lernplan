import { useState, useRef } from "react";

const GOOGLE_FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;0,9..144,700;1,9..144,300&family=DM+Sans:wght@300;400;500&display=swap');
`;

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --ink: #0f0e0c; --cream: #f5f0e8; --warm: #e8e0d0; --accent: #c8401a;
    --accent2: #2a5c45; --gold: #d4a843; --muted: #8a8070; --card: #faf7f2; --border: #d8d0c0;
  }
  body { background: var(--cream); color: var(--ink); font-family: 'DM Sans', sans-serif; }
  .app { min-height: 100vh; background: var(--cream);
    background-image: radial-gradient(ellipse at 10% 20%, rgba(200,64,26,0.06) 0%, transparent 50%),
      radial-gradient(ellipse at 90% 80%, rgba(42,92,69,0.06) 0%, transparent 50%); }
  .nav { display:flex; align-items:center; justify-content:space-between; padding:1.2rem 2.5rem;
    border-bottom:1px solid var(--border); background:rgba(245,240,232,0.85);
    backdrop-filter:blur(10px); position:sticky; top:0; z-index:100; }
  .nav-logo { font-family:'Fraunces',serif; font-size:1.5rem; font-weight:700; color:var(--ink); letter-spacing:-0.02em; }
  .nav-logo span { color:var(--accent); }
  .nav-tabs { display:flex; gap:0.25rem; background:var(--warm); border-radius:10px; padding:0.3rem; }
  .nav-tab { padding:0.45rem 1.1rem; border-radius:7px; border:none; background:transparent;
    font-family:'DM Sans',sans-serif; font-size:0.85rem; font-weight:500; color:var(--muted); cursor:pointer; transition:all 0.2s; }
  .nav-tab.active { background:var(--card); color:var(--ink); box-shadow:0 1px 4px rgba(0,0,0,0.08); }
  .nav-badge { background:var(--accent); color:white; font-size:0.7rem; padding:0.2rem 0.6rem; border-radius:20px; font-weight:500; }
  .onboard { max-width:560px; margin:0 auto; padding:4rem 2rem; animation:fadeUp 0.5s ease both; }
  .onboard-eyebrow { font-size:0.75rem; letter-spacing:0.12em; text-transform:uppercase; color:var(--accent); font-weight:500; margin-bottom:1rem; }
  .onboard-title { font-family:'Fraunces',serif; font-size:2.8rem; font-weight:600; line-height:1.15; color:var(--ink); margin-bottom:1rem; }
  .onboard-title em { font-style:italic; color:var(--accent); }
  .onboard-sub { color:var(--muted); font-size:1rem; line-height:1.6; margin-bottom:2.5rem; }
  .form-card { background:var(--card); border:1px solid var(--border); border-radius:16px; padding:2rem;
    display:flex; flex-direction:column; gap:1.2rem; box-shadow:0 4px 24px rgba(0,0,0,0.06); }
  .form-row { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
  .field { display:flex; flex-direction:column; gap:0.4rem; }
  .field label { font-size:0.78rem; font-weight:500; color:var(--muted); text-transform:uppercase; letter-spacing:0.06em; }
  .field input, .field select, .field textarea { background:var(--cream); border:1px solid var(--border);
    border-radius:9px; padding:0.75rem 1rem; font-family:'DM Sans',sans-serif; font-size:0.92rem;
    color:var(--ink); outline:none; transition:border-color 0.2s; }
  .field input:focus, .field select:focus, .field textarea:focus { border-color:var(--accent); }
  .field textarea { resize:vertical; min-height:80px; }
  .subject-tags { display:flex; flex-wrap:wrap; gap:0.5rem; margin-top:0.3rem; }
  .subject-tag { padding:0.35rem 0.9rem; border-radius:20px; border:1.5px solid var(--border);
    font-size:0.8rem; font-weight:500; cursor:pointer; background:var(--cream); color:var(--muted); transition:all 0.15s; }
  .subject-tag.selected { border-color:var(--accent); background:rgba(200,64,26,0.08); color:var(--accent); }
  .btn-primary { background:var(--ink); color:var(--cream); border:none; border-radius:10px;
    padding:0.9rem 2rem; font-family:'DM Sans',sans-serif; font-size:0.95rem; font-weight:500;
    cursor:pointer; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:0.5rem; }
  .btn-primary:hover { background:var(--accent); transform:translateY(-1px); box-shadow:0 6px 20px rgba(200,64,26,0.25); }
  .btn-primary:disabled { opacity:0.5; cursor:not-allowed; transform:none; }
  .btn-secondary { background:transparent; color:var(--ink); border:1.5px solid var(--border); border-radius:10px;
    padding:0.75rem 1.5rem; font-family:'DM Sans',sans-serif; font-size:0.9rem; font-weight:500; cursor:pointer; transition:all 0.2s; }
  .btn-secondary:hover { border-color:var(--ink); }
  .loading-screen { display:flex; flex-direction:column; align-items:center; justify-content:center;
    min-height:60vh; gap:1.5rem; animation:fadeIn 0.3s ease; }
  .loading-orb { width:64px; height:64px; border-radius:50%; border:3px solid var(--border);
    border-top-color:var(--accent); animation:spin 0.8s linear infinite; }
  .loading-title { font-family:'Fraunces',serif; font-size:1.4rem; color:var(--ink); }
  .loading-step { font-size:0.85rem; color:var(--muted); animation:pulse 2s ease infinite; }
  .dashboard { max-width:900px; margin:0 auto; padding:2.5rem 2rem; animation:fadeUp 0.4s ease both; }
  .dash-greeting { font-family:'Fraunces',serif; font-size:2rem; font-weight:600; color:var(--ink); }
  .dash-sub { color:var(--muted); font-size:0.95rem; margin-top:0.3rem; margin-bottom:2rem; }
  .stats-row { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; margin-bottom:2rem; }
  .stat-card { background:var(--card); border:1px solid var(--border); border-radius:14px; padding:1.3rem 1.5rem; }
  .stat-label { font-size:0.75rem; text-transform:uppercase; letter-spacing:0.08em; color:var(--muted); margin-bottom:0.4rem; }
  .stat-value { font-family:'Fraunces',serif; font-size:2rem; font-weight:600; color:var(--ink); }
  .stat-unit { font-size:0.85rem; color:var(--muted); margin-left:0.2rem; }
  .section-title { font-family:'Fraunces',serif; font-size:1.2rem; font-weight:600; color:var(--ink); margin-bottom:1rem; }
  .calendar-grid { display:flex; flex-direction:column; gap:0.6rem; margin-bottom:2.5rem; }
  .cal-week { display:grid; grid-template-columns:80px repeat(7,1fr); gap:0.5rem; align-items:center; }
  .cal-week-label { font-size:0.75rem; color:var(--muted); text-align:right; padding-right:0.8rem; }
  .cal-day { border-radius:10px; padding:0.6rem 0.5rem; min-height:60px; border:1px solid var(--border);
    background:var(--card); cursor:pointer; transition:all 0.15s; }
  .cal-day:hover { border-color:var(--accent); transform:translateY(-1px); }
  .cal-day.today { border-color:var(--accent); background:rgba(200,64,26,0.05); }
  .cal-day.exam-day { border-color:var(--accent2); background:rgba(42,92,69,0.08); }
  .cal-day-num { font-size:0.75rem; font-weight:500; color:var(--muted); margin-bottom:0.3rem; }
  .cal-task { font-size:0.65rem; padding:2px 5px; border-radius:4px; font-weight:500;
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:2px; }
  .cal-task.math { background:rgba(200,64,26,0.12); color:var(--accent); }
  .cal-task.german { background:rgba(42,92,69,0.12); color:var(--accent2); }
  .cal-task.english { background:rgba(212,168,67,0.15); color:#8a6820; }
  .cal-task.bio { background:rgba(100,120,200,0.12); color:#3a4a8a; }
  .cal-task.history { background:rgba(150,80,150,0.12); color:#7a3a7a; }
  .subjects-grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:2.5rem; }
  .subject-card { background:var(--card); border:1px solid var(--border); border-radius:14px;
    padding:1.2rem 1.4rem; cursor:pointer; transition:all 0.2s; }
  .subject-card:hover { border-color:var(--accent); box-shadow:0 4px 16px rgba(0,0,0,0.06); }
  .subject-card-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.8rem; }
  .subject-name { font-weight:600; font-size:0.95rem; }
  .subject-exam-date { font-size:0.75rem; color:var(--muted); }
  .subject-days-left { font-family:'Fraunces',serif; font-size:1.5rem; font-weight:600; color:var(--accent); }
  .progress-bar { height:5px; background:var(--warm); border-radius:3px; overflow:hidden; margin-top:0.8rem; }
  .progress-fill { height:100%; border-radius:3px; background:var(--accent2); transition:width 0.4s ease; }
  .today-card { background:var(--ink); color:var(--cream); border-radius:16px; padding:1.8rem;
    margin-bottom:2.5rem; position:relative; overflow:hidden; }
  .today-card::before { content:''; position:absolute; top:-40px; right:-40px; width:160px; height:160px;
    border-radius:50%; background:rgba(200,64,26,0.15); }
  .today-label { font-size:0.75rem; letter-spacing:0.1em; text-transform:uppercase; color:rgba(245,240,232,0.5); margin-bottom:0.5rem; }
  .today-title { font-family:'Fraunces',serif; font-size:1.5rem; font-weight:600; margin-bottom:0.4rem; }
  .today-meta { font-size:0.85rem; color:rgba(245,240,232,0.6); margin-bottom:1.5rem; }
  .today-actions { display:flex; gap:0.8rem; }
  .btn-light { background:rgba(245,240,232,0.12); color:var(--cream); border:1px solid rgba(245,240,232,0.2);
    border-radius:9px; padding:0.7rem 1.4rem; font-family:'DM Sans',sans-serif; font-size:0.88rem;
    font-weight:500; cursor:pointer; transition:all 0.2s; }
  .btn-light:hover { background:rgba(245,240,232,0.2); }
  .btn-light.primary-light { background:var(--accent); border-color:transparent; }
  .btn-light.primary-light:hover { background:#a33215; }
  .flashcard-screen { max-width:620px; margin:0 auto; padding:2.5rem 2rem; animation:fadeUp 0.4s ease both; }
  .session-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:2rem; }
  .session-progress-bar { flex:1; height:6px; background:var(--warm); border-radius:3px; overflow:hidden; margin:0 1.5rem; }
  .session-progress-fill { height:100%; background:var(--accent2); border-radius:3px; transition:width 0.3s ease; }
  .session-count { font-size:0.85rem; color:var(--muted); white-space:nowrap; }
  .card-scene { perspective:1200px; margin-bottom:1.5rem; }
  .card-flipper { position:relative; width:100%; padding-top:60%; transform-style:preserve-3d;
    transition:transform 0.55s cubic-bezier(0.4,0,0.2,1); cursor:pointer; }
  .card-flipper.flipped { transform:rotateY(180deg); }
  .card-face { position:absolute; inset:0; backface-visibility:hidden; border-radius:20px;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    padding:2.5rem; box-shadow:0 8px 40px rgba(0,0,0,0.1); }
  .card-front { background:var(--card); border:1px solid var(--border); }
  .card-back { background:var(--ink); color:var(--cream); transform:rotateY(180deg); }
  .card-hint { font-size:0.7rem; text-transform:uppercase; letter-spacing:0.1em; color:var(--muted); margin-bottom:1rem; }
  .card-back .card-hint { color:rgba(245,240,232,0.4); }
  .card-question { font-family:'Fraunces',serif; font-size:1.5rem; font-weight:600; text-align:center; line-height:1.3; }
  .card-back .card-question { color:var(--cream); }
  .rating-buttons { display:grid; grid-template-columns:repeat(3,1fr); gap:0.8rem; margin-bottom:1rem; }
  .rating-btn { border:1.5px solid var(--border); background:var(--card); border-radius:12px;
    padding:0.8rem; font-family:'DM Sans',sans-serif; cursor:pointer; transition:all 0.15s;
    display:flex; flex-direction:column; align-items:center; gap:0.3rem; }
  .rating-btn .emoji { font-size:1.4rem; }
  .rating-btn .label { font-size:0.75rem; font-weight:500; color:var(--muted); }
  .rating-btn.hard:hover { border-color:#c0392b; background:rgba(192,57,43,0.05); }
  .rating-btn.ok:hover { border-color:var(--gold); background:rgba(212,168,67,0.05); }
  .rating-btn.easy:hover { border-color:var(--accent2); background:rgba(42,92,69,0.05); }
  .session-complete { text-align:center; padding:4rem 2rem; animation:fadeUp 0.4s ease both; }
  .complete-icon { font-size:4rem; margin-bottom:1rem; }
  .complete-title { font-family:'Fraunces',serif; font-size:2rem; font-weight:600; margin-bottom:0.5rem; }
  .complete-sub { color:var(--muted); margin-bottom:2rem; }
  .complete-stats { display:flex; justify-content:center; gap:3rem; margin-bottom:2rem; }
  .c-stat-num { font-family:'Fraunces',serif; font-size:2rem; font-weight:700; color:var(--accent); }
  .c-stat-label { font-size:0.78rem; color:var(--muted); }
  .error-banner { background:rgba(200,64,26,0.1); border:1px solid rgba(200,64,26,0.3); border-radius:10px;
    padding:0.9rem 1.2rem; font-size:0.85rem; color:var(--accent); margin-bottom:1rem; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes pulse { 0%,100% { opacity:0.5; } 50% { opacity:1; } }
`;

const SUBJECTS = ["Mathematik","Deutsch","Englisch","Biologie","Geschichte","Physik","Chemie","Latein"];
const SUBJECT_COLORS = { "Mathematik":"math","Deutsch":"german","Englisch":"english","Biologie":"bio","Geschichte":"history","Physik":"math","Chemie":"english","Latein":"history" };
const LOADING_MSGS = ["Analysiere deine Prüfungstermine...","Berechne optimale Lernverteilung...","Erstelle personalisierte Karteikarten...","Priorisiere Themen nach Schwierigkeit...","Finalisiere deinen Abitur-Lernplan..."];

function getDaysUntil(dateStr) {
  return Math.max(0, Math.ceil((new Date(dateStr) - new Date()) / 86400000));
}
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("de-DE", { day:"numeric", month:"short" });
}

function CalendarView({ subjects, weeklyFocus }) {
  const today = new Date();
  const days = Array.from({length:28}, (_,i) => { const d = new Date(today); d.setDate(today.getDate()+i); return d; });
  function getTasksForDay(date) {
    const tasks = [];
    const dayOfWeek = date.getDay();
    const weekNum = Math.floor((date - today) / (7*86400000));
    const wf = weeklyFocus.filter(w => w.week === weekNum+1);
    if (wf.length > 0 && dayOfWeek !== 0 && dayOfWeek !== 6) {
      const t = wf[(dayOfWeek-1) % wf.length];
      if (t) tasks.push(t);
    }
    subjects.forEach(s => { if (new Date(s.examDate).toDateString() === date.toDateString()) tasks.push({subject:s.name, topic:"PRÜFUNG 🎯", isExam:true}); });
    return tasks;
  }
  const weeks = [days.slice(0,7),days.slice(7,14),days.slice(14,21),days.slice(21,28)];
  return (
    <div className="calendar-grid">
      <div className="cal-week">
        <div/>
        {["Mo","Di","Mi","Do","Fr","Sa","So"].map(d=><div key={d} style={{fontSize:"0.72rem",textAlign:"center",color:"var(--muted)",fontWeight:500}}>{d}</div>)}
      </div>
      {weeks.map((week,wi)=>(
        <div key={wi} className="cal-week">
          <div className="cal-week-label">Woche {wi+1}</div>
          {week.map((day,di)=>{
            const tasks = getTasksForDay(day);
            const isToday = day.toDateString()===today.toDateString();
            const hasExam = tasks.some(t=>t.isExam);
            return (
              <div key={di} className={`cal-day ${isToday?"today":""} ${hasExam?"exam-day":""}`}>
                <div className="cal-day-num">{day.getDate()}</div>
                {tasks.slice(0,2).map((t,ti)=>(
                  <div key={ti} className={`cal-task ${SUBJECT_COLORS[t.subject]||"math"}`}>{t.isExam?t.topic:t.topic?.substring(0,12)}</div>
                ))}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function FlashcardSession({ deck, onComplete }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState([]);
  const [done, setDone] = useState(false);
  const card = deck.cards[idx];

  function rate(r) {
    const nr = [...results, r];
    setResults(nr);
    setFlipped(false);
    setTimeout(() => { if (idx+1 >= deck.cards.length) setDone(true); else setIdx(idx+1); }, 300);
  }

  if (done) {
    return (
      <div className="session-complete">
        <div className="complete-icon">🎉</div>
        <div className="complete-title">Session abgeschlossen!</div>
        <div className="complete-sub">{deck.topic} · {deck.cards.length} Karten</div>
        <div className="complete-stats">
          {[["easy","✅ Leicht"],["ok","🤔 Ok"],["hard","😓 Schwer"]].map(([k,l])=>(
            <div key={k}><div className="c-stat-num">{results.filter(r=>r===k).length}</div><div className="c-stat-label">{l}</div></div>
          ))}
        </div>
        <button className="btn-primary" onClick={onComplete}>Zurück zum Plan</button>
      </div>
    );
  }

  return (
    <div className="flashcard-screen">
      <div className="session-header">
        <button className="btn-secondary" style={{padding:"0.45rem 0.9rem",fontSize:"0.8rem"}} onClick={onComplete}>← Zurück</button>
        <div className="session-progress-bar"><div className="session-progress-fill" style={{width:`${(idx/deck.cards.length)*100}%`}}/></div>
        <div className="session-count">{idx+1} / {deck.cards.length}</div>
      </div>
      <div style={{textAlign:"center",marginBottom:"1rem"}}>
        <span style={{fontSize:"0.78rem",color:"var(--muted)",fontWeight:500}}>{deck.subject} · {deck.topic}</span>
      </div>
      <div className="card-scene" onClick={()=>setFlipped(!flipped)}>
        <div className={`card-flipper ${flipped?"flipped":""}`}>
          <div className="card-face card-front">
            <div className="card-hint">Frage — tippe zum Aufdecken</div>
            <div className="card-question">{card.question}</div>
            {card.hint && <div style={{fontSize:"0.78rem",color:"var(--muted)",marginTop:"0.8rem",fontStyle:"italic"}}>💡 {card.hint}</div>}
          </div>
          <div className="card-face card-back">
            <div className="card-hint">Antwort</div>
            <div className="card-question">{card.answer}</div>
          </div>
        </div>
      </div>
      {flipped ? (
        <div className="rating-buttons" style={{animation:"fadeUp 0.25s ease both"}}>
          {[["hard","😓","Schwer"],["ok","🤔","Ok"],["easy","✅","Leicht"]].map(([k,e,l])=>(
            <button key={k} className={`rating-btn ${k}`} onClick={()=>rate(k)}>
              <span className="emoji">{e}</span><span className="label">{l}</span>
            </button>
          ))}
        </div>
      ) : (
        <div style={{textAlign:"center",color:"var(--muted)",fontSize:"0.83rem",marginTop:"0.5rem"}}>Tippe die Karte, um die Antwort zu sehen</div>
      )}
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("onboard");
  const [tab, setTab] = useState("plan");
  const [formData, setFormData] = useState({name:"",hoursPerDay:"2",weaknesses:""});
  const [subjectInputs, setSubjectInputs] = useState({});
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [planData, setPlanData] = useState(null);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [activeSession, setActiveSession] = useState(null);
  const [error, setError] = useState("");
  const loadingRef = useRef(null);

  function toggleSubject(s) {
    setSelectedSubjects(prev => prev.includes(s) ? prev.filter(x=>x!==s) : [...prev,s]);
  }

  async function handleGenerate() {
    if (!formData.name || selectedSubjects.length === 0) return;
    const subjects = selectedSubjects.map(s => ({
      name: s,
      examDate: subjectInputs[s]?.examDate || "2025-06-15"
    }));
    setError("");
    setScreen("loading");
    let i = 0;
    loadingRef.current = setInterval(() => { setLoadingMsg(LOADING_MSGS[i++ % LOADING_MSGS.length]); }, 1400);

    try {
      // ✅ Calls OUR server, not Anthropic directly — key is safe
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

  if (activeSession) return (
    <div className="app">
      <style>{GOOGLE_FONTS}{styles}</style>
      <FlashcardSession deck={activeSession} onComplete={()=>setActiveSession(null)}/>
    </div>
  );

  return (
    <div className="app">
      <style>{GOOGLE_FONTS}{styles}</style>

      {screen === "onboard" ? (
        <div className="onboard">
          <div className="onboard-eyebrow">Abitur 2025</div>
          <h1 className="onboard-title">Dein <em>smarter</em> Lernplan — von KI erstellt</h1>
          <p className="onboard-sub">Gib deine Fächer und Prüfungstermine ein. Die KI erstellt in Sekunden einen personalisierten Lernplan mit Karteikarten und Spaced Repetition.</p>
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
                {selectedSubjects.map(s=>(
                  <div key={s} style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.8rem",marginTop:"0.5rem",alignItems:"center"}}>
                    <div style={{fontSize:"0.85rem",fontWeight:500}}>{s}</div>
                    <input type="date" style={{background:"var(--cream)",border:"1px solid var(--border)",borderRadius:"9px",padding:"0.55rem 0.8rem",fontFamily:"DM Sans,sans-serif",fontSize:"0.85rem",color:"var(--ink)"}}
                      onChange={e=>setSubjectInputs(prev=>({...prev,[s]:{...prev[s],examDate:e.target.value}}))}/>
                  </div>
                ))}
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
      ) : (
        <>
          <nav className="nav">
            <div className="nav-logo">Lern<span>.</span>Plan</div>
            <div className="nav-tabs">
              <button className={`nav-tab ${tab==="plan"?"active":""}`} onClick={()=>setTab("plan")}>📅 Lernplan</button>
              <button className={`nav-tab ${tab==="cards"?"active":""}`} onClick={()=>setTab("cards")}>🃏 Karteikarten</button>
            </div>
            <span className="nav-badge">Abitur '25</span>
          </nav>

          {tab === "plan" && planData && (
            <div className="dashboard">
              <div className="dash-greeting">Hallo, {formData.name} 👋</div>
              <div className="dash-sub">{planData.planSummary}</div>
              <div className="stats-row">
                <div className="stat-card"><div className="stat-label">Fächer</div><div className="stat-value">{planData.subjects?.length}<span className="stat-unit">aktiv</span></div></div>
                <div className="stat-card"><div className="stat-label">Karteikarten</div><div className="stat-value">{planData.flashcardDecks?.reduce((a,d)=>a+d.cards.length,0)}<span className="stat-unit">gesamt</span></div></div>
                <div className="stat-card"><div className="stat-label">Nächste Prüfung</div><div className="stat-value">{getDaysUntil(planData.subjects?.[0]?.examDate||"2025-06-15")}<span className="stat-unit">Tage</span></div></div>
              </div>
              <div className="today-card">
                <div className="today-label">Heutige Session</div>
                <div className="today-title">{planData.weeklyFocus?.[0]?.topic||"Lernstart"}</div>
                <div className="today-meta">{planData.weeklyFocus?.[0]?.subject} · {formData.hoursPerDay} Stunden eingeplant</div>
                <div className="today-actions">
                  <button className="btn-light primary-light" onClick={()=>setTab("cards")}>▶ Session starten</button>
                  <button className="btn-light" onClick={()=>setTab("cards")}>Karteikarten ansehen</button>
                </div>
              </div>
              <div className="section-title">Deine Fächer</div>
              <div className="subjects-grid">
                {planData.subjects?.map((s,i)=>(
                  <div key={i} className="subject-card" onClick={()=>setTab("cards")}>
                    <div className="subject-card-header">
                      <div><div className="subject-name">{s.name}</div><div className="subject-exam-date">Prüfung: {formatDate(s.examDate)}</div></div>
                      <div className="subject-days-left">{getDaysUntil(s.examDate)}d</div>
                    </div>
                    <div className="progress-bar"><div className="progress-fill" style={{width:`${Math.min(95,Math.max(5,100-getDaysUntil(s.examDate)*2))}%`}}/></div>
                  </div>
                ))}
              </div>
              <div className="section-title">28-Tage Lernkalender</div>
              <CalendarView subjects={planData.subjects||[]} weeklyFocus={planData.weeklyFocus||[]}/>
            </div>
          )}

          {tab === "cards" && planData && (
            <div className="dashboard">
              <div className="dash-greeting">Karteikarten</div>
              <div className="dash-sub">KI-generierte Decks basierend auf deinem Lernplan</div>
              <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
                {planData.flashcardDecks?.map((deck,i)=>(
                  <div key={i} className="subject-card" style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"1rem"}}>
                    <div>
                      <div style={{marginBottom:"0.3rem"}}><span className={`cal-task ${SUBJECT_COLORS[deck.subject]||"math"}`} style={{borderRadius:"6px",padding:"0.2rem 0.6rem"}}>{deck.subject}</span></div>
                      <div className="subject-name" style={{marginBottom:"0.15rem"}}>{deck.topic}</div>
                      <div style={{fontSize:"0.8rem",color:"var(--muted)"}}>{deck.cards.length} Karten</div>
                    </div>
                    <button className="btn-primary" style={{whiteSpace:"nowrap",flexShrink:0}} onClick={()=>setActiveSession(deck)}>Lernen ▶</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
