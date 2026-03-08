// api/generate-plan.js
// Runs on Vercel — API key never reaches the browser

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { studentData } = req.body;
  if (!studentData) {
    return res.status(400).json({ error: "Missing studentData" });
  }

  // Calculate today and the next 28 days as concrete dates
  const today = new Date();
  const dates = [];
  for (let i = 0; i < 28; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push({
      index: i,
      dateStr: d.toISOString().split("T")[0],
      weekday: d.getDay(), // 0=Sun,1=Mon,...,6=Sat
      week: Math.floor(i / 7) + 1,
    });
  }

  // Only weekdays (Mon-Fri) available for study
  const weekdays = dates.filter(d => d.weekday >= 1 && d.weekday <= 5);

  const prompt = `Du bist ein Abitur-Lerncoach. Erstelle einen 28-Tage-Lernplan.

Schüler: ${studentData.name}
Fächer & Prüfungstermine: ${studentData.subjects.map(s => `${s.name} am ${s.examDate || "kein Datum"}`).join(", ")}
Schwächen: ${studentData.weaknesses || "keine angegeben"}
Stunden/Tag: ${studentData.hoursPerDay}

Verfügbare Lerntage (nur Wochentage): ${weekdays.map(d => d.dateStr).join(", ")}

Weise jedem Lerntag genau ein Fach und ein konkretes Thema zu. Verteile die Fächer sinnvoll.
Priorisiere Fächer mit näher liegendem Prüfungstermin.

Antworte NUR mit diesem JSON (kein Markdown, keine Erklärung, kein Text davor oder danach):
{
  "planSummary": "2-3 Sätze über den Plan",
  "dailyPlan": [
    {"date": "2025-03-10", "subject": "Mathematik", "topic": "Differentialrechnung"},
    {"date": "2025-03-11", "subject": "Deutsch", "topic": "Textanalyse"}
  ]
}

Erstelle einen Eintrag für jeden der ${weekdays.length} Lerntage. Nutze NUR diese Daten: ${weekdays.map(d => d.dateStr).join(", ")}`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        temperature: 0.5,
        max_tokens: 2000,
        messages: [
          {
            role: "system",
            content: "Du bist ein Abitur-Lerncoach. Antworte AUSSCHLIESSLICH mit reinem JSON. Kein Markdown, keine Backticks, keine Erklärung. Nur das JSON-Objekt.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq error:", err);
      return res.status(500).json({ error: `AI service error: ${err}` });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";

    // Strip any accidental markdown fences
    const clean = text.replace(/```json|```/gi, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr, "\nRaw text:", clean);
      return res.status(500).json({ error: "Invalid AI response format" });
    }

    return res.status(200).json(parsed);
  } catch (err) {
    console.error("Handler error:", err);
    return res.status(500).json({ error: "Failed to generate plan" });
  }
}
