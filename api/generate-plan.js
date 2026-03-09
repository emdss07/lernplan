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
    return { name: s.name, examDate, validDays, topics: s.topics || [], importance: s.importance || 3 };
  });

  const daySubjects = {};
  weekdays.forEach(d => {
    daySubjects[d] = subjectInfo.filter(s => s.validDays.includes(d)).map(s => s.name);
  });

  const activeDays = weekdays.filter(d => daySubjects[d].length > 0);
  const hours = parseFloat(studentData.hoursPerDay) || 2;
  const totalMinutes = Math.round(hours * 60);

  const subjectInfoStr = subjectInfo.map(s => {
    const topicList = (s.topics && s.topics.length > 0)
      ? `Prüfungsthemen: ${s.topics.join(", ")}`
      : "Prüfungsthemen: nicht angegeben (allgemeine Themen verwenden)";
    const importanceLabel = ["","sehr unwichtig","weniger wichtig","normal wichtig","sehr wichtig","höchste Priorität"][s.importance] || "normal wichtig";
    return `${s.name}: Prüfung ${s.examDate || "kein Datum"}, lernbar bis: ${s.validDays.slice(-1)[0] || "—"}, Wichtigkeit: ${s.importance}/5 (${importanceLabel}), ${topicList}`;
  }).join("\n");

  const dayMapStr = activeDays.map(d =>
    `${d}: [${daySubjects[d].join(", ")}]`
  ).join("\n");

  // Group subjects by exam date to enforce fair distribution hints
  const examDateGroups = {};
  subjectInfo.forEach(s => {
    const key = s.examDate || "none";
    if (!examDateGroups[key]) examDateGroups[key] = [];
    examDateGroups[key].push(s.name);
  });
  const fairnessHint = Object.entries(examDateGroups)
    .filter(([,names]) => names.length > 1)
    .map(([date, names]) => `Fächer mit gleichem Prüfungstag (${date}): [${names.join(", ")}] → ungefähr gleich viel Gesamtlernzeit geben`)
    .join("\n");

  const prompt = `Du bist ein Lerncoach. Erstelle einen präzisen Lernplan.

Schüler: ${studentData.name}
Tägliche Lernzeit: EXAKT ${totalMinutes} Minuten (= ${hours} Stunden). Diese Zeit MUSS pro Tag exakt eingehalten werden.

Fächer (mit Prüfungsdaten und Prüfungsthemen):
${subjectInfoStr}

Verfügbare Fächer pro Tag:
${dayMapStr}
${fairnessHint ? `\nFaire Verteilung beachten:\n${fairnessHint}` : ""}

STRIKTE REGELN:
1. Die Summe aller "durationMinutes" eines Tages MUSS exakt ${totalMinutes} ergeben.
2. Entscheide wie viele Einheiten sinnvoll sind. Typisch: 30, 45, 60, 90 min.
3. Verwende NUR die aufgelisteten Fächer für den jeweiligen Tag.
4. WICHTIGKEIT: Fächer mit höherer Wichtigkeit (4-5 Sterne) sollen deutlich mehr Gesamtlernzeit bekommen als Fächer mit niedriger Wichtigkeit (1-2 Sterne). Wichtigkeit 5 = ca. doppelt so viel Zeit wie Wichtigkeit 1. Wichtigkeit 3 = normale Zeit.
5. WICHTIG: Wenn Prüfungsthemen angegeben sind, erstelle SEHR SPEZIFISCHE Lerneinheiten daraus.
   Beispiel: Themen "Vektoren, Stochastik" → nicht "Mathematik lernen" sondern konkret:
   "Vektoren: Skalarprodukt und Winkelberechnung", "Stochastik: Binomialverteilung Aufgaben", usw.
6. Ohne Themen: allgemeine, fachspezifische Lerneinheiten erstellen.
7. Fächer mit näherem Prüfungstermin häufiger einplanen.
8. Fächer mit gleichem Prüfungstag: Lernzeit proportional zur Wichtigkeit verteilen.

Antworte NUR mit JSON (kein Markdown, keine Backticks):
{
  "planSummary": "2-3 Sätze auf Deutsch",
  "dailyPlan": [
    {"date": "YYYY-MM-DD", "subject": "Fachname", "topic": "Sehr spezifisches Thema", "durationMinutes": 60}
  ]
}

WICHTIG: durationMinutes ist ein Integer. Summe pro Tag = exakt ${totalMinutes}.`;

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
          { role: "system", content: "Antworte AUSSCHLIESSLICH mit reinem JSON-Objekt. Kein Markdown, keine Backticks, kein Text." },
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

    // Hard filter: remove entries after exam date or wrong subjects
    const allowedSubjects = studentData.subjects.map(s => s.name);
    const examDates = {};
    studentData.subjects.forEach(s => { if (s.examDate) examDates[s.name] = s.examDate; });

    if (parsed.dailyPlan) {
      parsed.dailyPlan = parsed.dailyPlan.filter(entry => {
        if (!allowedSubjects.includes(entry.subject)) return false;
        if (examDates[entry.subject] && entry.date >= examDates[entry.subject]) return false;
        return true;
      });

      // Server-side correction: rescale each day's durations to exactly match totalMinutes
      const byDate = {};
      parsed.dailyPlan.forEach(e => {
        if (!byDate[e.date]) byDate[e.date] = [];
        byDate[e.date].push(e);
      });
      Object.values(byDate).forEach(entries => {
        const sum = entries.reduce((a, e) => a + (e.durationMinutes || 60), 0);
        if (sum !== totalMinutes && sum > 0) {
          const factor = totalMinutes / sum;
          let remaining = totalMinutes;
          entries.forEach((e, i) => {
            if (i === entries.length - 1) {
              e.durationMinutes = remaining;
            } else {
              e.durationMinutes = Math.round((e.durationMinutes || 60) * factor);
              remaining -= e.durationMinutes;
            }
          });
        }
      });
    }

    // Count total minutes per subject across the whole plan
    const subjTotals = {};
    parsed.dailyPlan.forEach(e => {
      subjTotals[e.subject] = (subjTotals[e.subject] || 0) + (e.durationMinutes || 0);
    });

    // For subjects with same exam date, check if distribution is very unfair (>2x difference)
    // If so, log it but don't hard-correct — the prompt already asked for fairness

    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: "Failed to generate plan" });
  }
}

