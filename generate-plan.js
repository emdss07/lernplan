// api/generate-plan.js — Vercel serverless, API key never reaches browser

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { studentData } = req.body;
  if (!studentData) return res.status(400).json({ error: "Missing studentData" });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function localStr(d) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }

  // Build 28 weekdays, but only include a subject on days BEFORE its exam date
  const weekdays = [];
  for (let i = 0; i < 42; i++) { // scan 42 days to get 28 weekdays
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (d.getDay() >= 1 && d.getDay() <= 5) {
      weekdays.push(localStr(d));
      if (weekdays.length >= 28) break;
    }
  }

  // For each subject, figure out which days are valid (before exam date)
  const subjects = studentData.subjects;
  const subjectInfo = subjects.map(s => {
    const examDate = s.examDate || null;
    const validDays = examDate
      ? weekdays.filter(d => d < examDate)
      : weekdays;
    return { name: s.name, examDate, validDays };
  });

  // Build a per-day availability map: date -> [subject names available that day]
  const daySubjects = {};
  weekdays.forEach(d => {
    daySubjects[d] = subjectInfo.filter(s => s.validDays.includes(d)).map(s => s.name);
  });

  // Only include days where at least one subject is available
  const activeDays = weekdays.filter(d => daySubjects[d].length > 0);

  const hours = parseFloat(studentData.hoursPerDay) || 2;
  // sessions per day: 1 session per ~1.5h, min 1, max 3
  const sessionsPerDay = Math.min(3, Math.max(1, Math.round(hours / 1.5)));

  const subjectInfoStr = subjectInfo.map(s =>
    `${s.name}: Prüfung am ${s.examDate || "kein Datum"}, lernbar bis: ${s.validDays.slice(-1)[0] || "—"}`
  ).join("\n");

  const dayMapStr = activeDays.map(d =>
    `${d}: verfügbare Fächer: [${daySubjects[d].join(", ")}]`
  ).join("\n");

  const prompt = `Du bist ein Abitur-Lerncoach. Erstelle einen präzisen Lernplan.

Schüler: ${studentData.name}
Tägliche Lernzeit: ${studentData.hoursPerDay} Stunden (${sessionsPerDay} Lerneinheit(en) pro Tag)
Schwächen: ${studentData.weaknesses || "keine angegeben"}

Fächer und ihre Prüfungstermine:
${subjectInfoStr}

Pro Tag verfügbare Fächer (NUR diese dürfen an diesem Tag eingetragen werden):
${dayMapStr}

Regeln:
- Pro Tag GENAU ${sessionsPerDay} Einträge — jeder mit einem anderen Fach falls möglich.
- Verwende an jedem Tag NUR die dort aufgelisteten verfügbaren Fächer.
- Themen sollen konkret, lehrreich und zum Fach passend sein (z.B. "Ableitungsregeln", "Epochen der Romantik").
- Fächer mit näherem Prüfungstermin häufiger einplanen.
- Wiederholungen in der letzten Woche vor der Prüfung einbauen.

Antworte NUR mit diesem JSON, ohne Markdown, ohne Erklärung:
{
  "planSummary": "2-3 Sätze Zusammenfassung auf Deutsch",
  "dailyPlan": [
    {"date": "YYYY-MM-DD", "subject": "Fachname", "topic": "Konkretes Thema"},
    {"date": "YYYY-MM-DD", "subject": "AnderesFach", "topic": "Konkretes Thema"}
  ]
}

Erstelle Einträge für alle ${activeDays.length} aktiven Lerntage, je ${sessionsPerDay} Einträge pro Tag.`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        temperature: 0.3,
        max_tokens: 4000,
        messages: [
          {
            role: "system",
            content: "Antworte AUSSCHLIESSLICH mit reinem JSON-Objekt. Kein Text, keine Backticks, kein Markdown. Nur { ... }."
          },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq error:", err);
      return res.status(500).json({ error: `Groq error: ${err}` });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "";
    const clean = raw.replace(/```json|```/gi, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch (e) {
      console.error("Parse error. Raw:", clean);
      return res.status(500).json({ error: "AI returned invalid JSON" });
    }

    // Hard server-side filter: remove entries after their subject's exam date
    // and remove entries with subjects not in the allowed list
    const allowedSubjects = studentData.subjects.map(s => s.name);
    const examDates = {};
    studentData.subjects.forEach(s => { if (s.examDate) examDates[s.name] = s.examDate; });

    if (parsed.dailyPlan) {
      parsed.dailyPlan = parsed.dailyPlan.filter(entry => {
        if (!allowedSubjects.includes(entry.subject)) return false;
        if (examDates[entry.subject] && entry.date >= examDates[entry.subject]) return false;
        return true;
      });
    }

    return res.status(200).json(parsed);
  } catch (err) {
    console.error("Handler error:", err);
    return res.status(500).json({ error: "Failed to generate plan" });
  }
}
