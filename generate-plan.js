export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { studentData } = req.body;
  if (!studentData) return res.status(400).json({ error: "Missing studentData" });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function localStr(d) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }

  const weekdays = [];
  for (let i = 0; i < 60; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (d.getDay() >= 1 && d.getDay() <= 5) {
      weekdays.push(localStr(d));
      if (weekdays.length >= 28) break;
    }
  }

  const subjects = studentData.subjects;
  const subjectInfo = subjects.map(s => {
    const examDate = s.examDate || null;
    const validDays = examDate ? weekdays.filter(d => d < examDate) : weekdays;
    return { name: s.name, examDate, validDays };
  });

  const daySubjects = {};
  weekdays.forEach(d => {
    daySubjects[d] = subjectInfo.filter(s => s.validDays.includes(d)).map(s => s.name);
  });

  const activeDays = weekdays.filter(d => daySubjects[d].length > 0);
  const hours = parseFloat(studentData.hoursPerDay) || 2;

  const subjectInfoStr = subjectInfo.map(s =>
    `${s.name}: Prüfung ${s.examDate || "kein Datum"}, lernbar bis: ${s.validDays.slice(-1)[0] || "—"}`
  ).join("\n");

  const dayMapStr = activeDays.map(d =>
    `${d}: [${daySubjects[d].join(", ")}]`
  ).join("\n");

  const prompt = `Du bist ein Abitur-Lerncoach. Erstelle einen Lernplan.

Schüler: ${studentData.name}
Tägliche Lernzeit: ${hours} Stunden
Schwächen: ${studentData.weaknesses || "keine"}

Fächer (mit Prüfungsdaten):
${subjectInfoStr}

Verfügbare Fächer pro Tag:
${dayMapStr}

WICHTIGE REGELN:
1. Entscheide selbst wie viele Lerneinheiten pro Tag sinnvoll sind, basierend auf ${hours} Stunden/Tag:
   - Bei 1h: meist 1 Einheit, manchmal 2 kurze
   - Bei 2h: 2 Einheiten
   - Bei 3h: 2-3 Einheiten
   - Bei 4-5h: 3-4 Einheiten
2. Verteile die Zeit sinnvoll: z.B. 45 min, 60 min, 90 min pro Einheit. Gesamtzeit pro Tag = ${hours}h.
3. Verwende NUR die aufgelisteten Fächer für den jeweiligen Tag.
4. Themen sollen konkret und lehrreich sein.
5. Fächer mit näherem Prüfungstermin öfter einplanen.
6. Für jede Einheit ein "duration" Feld angeben (z.B. "45 min", "1 Std.", "90 min").

Antworte NUR mit JSON:
{
  "planSummary": "2-3 Sätze auf Deutsch",
  "dailyPlan": [
    {"date": "YYYY-MM-DD", "subject": "Fachname", "topic": "Konkretes Thema", "duration": "60 min"}
  ]
}`;

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
          { role: "system", content: "Antworte AUSSCHLIESSLICH mit reinem JSON. Kein Markdown, keine Backticks, kein Text davor oder danach." },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: `Groq error: ${err}` });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "";
    const clean = raw.replace(/```json|```/gi, "").trim();

    let parsed;
    try { parsed = JSON.parse(clean); }
    catch (e) { return res.status(500).json({ error: "AI returned invalid JSON" }); }

    // Hard filter: remove entries after exam date or with wrong subjects
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
    return res.status(500).json({ error: "Failed to generate plan" });
  }
}
