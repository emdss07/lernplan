// api/generate-plan.js — Vercel serverless, API key never reaches browser

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { studentData } = req.body;
  if (!studentData) return res.status(400).json({ error: "Missing studentData" });

  // Build list of upcoming weekdays (Mon–Fri) for the next 28 days
  const today = new Date();
  const weekdays = [];
  for (let i = 0; i < 28; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dow = d.getDay(); // 0=Sun, 6=Sat
    if (dow >= 1 && dow <= 5) {
      weekdays.push(d.toISOString().split("T")[0]);
    }
  }

  // ONLY the subjects the student actually selected
  const subjectList = studentData.subjects.map(s =>
    `${s.name}${s.examDate ? ` (Prüfung am ${s.examDate})` : " (kein Datum)"}`
  ).join(", ");

  const prompt = `Du bist ein Abitur-Lerncoach. Erstelle einen Lernplan NUR für diese Fächer: ${subjectList}

Schüler: ${studentData.name}
Tägliche Lernzeit: ${studentData.hoursPerDay} Stunden
Schwächen: ${studentData.weaknesses || "keine angegeben"}

Verfügbare Lerntage (Wochentage): ${weekdays.join(", ")}

Regeln:
- Verwende AUSSCHLIESSLICH die oben genannten Fächer. Erfinde KEINE anderen Fächer.
- Verteile die Fächer gleichmäßig, priorisiere Fächer mit näherem Prüfungstermin.
- Jedes Thema soll konkret und zum Fach passend sein.
- Erstelle für JEDEN der ${weekdays.length} Lerntage genau einen Eintrag.

Antworte NUR mit diesem JSON, ohne Markdown, ohne Erklärung:
{
  "planSummary": "2-3 Sätze über den Plan auf Deutsch",
  "dailyPlan": [
    {"date": "YYYY-MM-DD", "subject": "Fachname", "topic": "Konkretes Thema"}
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
        max_tokens: 2500,
        messages: [
          {
            role: "system",
            content: "Antworte AUSSCHLIESSLICH mit reinem JSON. Kein Text davor oder danach, keine Backticks, kein Markdown. Nur das JSON-Objekt."
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

    // Safety filter: strip any entries with subjects not in the student's list
    const allowedSubjects = studentData.subjects.map(s => s.name);
    if (parsed.dailyPlan) {
      parsed.dailyPlan = parsed.dailyPlan.filter(entry =>
        allowedSubjects.includes(entry.subject)
      );
    }

    return res.status(200).json(parsed);
  } catch (err) {
    console.error("Handler error:", err);
    return res.status(500).json({ error: "Failed to generate plan" });
  }
}
