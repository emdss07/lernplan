// api/generate-plan.js
// This runs on Vercel's servers — the API key is NEVER sent to the browser
// Uses Google Gemini API (free tier: 15 requests/min, 1500 requests/day)

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { studentData } = req.body;
  if (!studentData) {
    return res.status(400).json({ error: "Missing studentData" });
  }

  const prompt = `Du bist ein Abitur-Lerncoach. Erstelle für den folgenden Schüler einen strukturierten Lernplan und Karteikarten.

Schüler: ${studentData.name}
Fächer & Prüfungstermine: ${studentData.subjects.map(s => `${s.name} (${s.level || 'Grundkurs'}) am ${s.examDate}`).join(", ")}
Schwächen: ${studentData.weaknesses || "keine angegeben"}
Stunden/Tag: ${studentData.hoursPerDay}

Antworte NUR mit JSON in exakt diesem Format (kein Markdown, keine Erklärung):
{
  "planSummary": "2-3 Sätze Zusammenfassung des Plans",
  "weeklyFocus": [
    {"week": 1, "subject": "Mathematik", "topic": "Differentialrechnung", "sessions": 3},
    {"week": 1, "subject": "Deutsch", "topic": "Textanalyse", "sessions": 2},
    {"week": 2, "subject": "Mathematik", "topic": "Integralrechnung", "sessions": 3},
    {"week": 2, "subject": "Deutsch", "topic": "Aufsatz schreiben", "sessions": 2},
    {"week": 3, "subject": "Mathematik", "topic": "Stochastik", "sessions": 2},
    {"week": 3, "subject": "Deutsch", "topic": "Gedichtanalyse", "sessions": 3},
    {"week": 4, "subject": "Mathematik", "topic": "Wiederholung", "sessions": 3},
    {"week": 4, "subject": "Deutsch", "topic": "Wiederholung", "sessions": 2}
  ],
  "flashcardDecks": [
    {
      "subject": "Mathematik",
      "topic": "Ableitungsregeln",
      "cards": [
        {"question": "Was ist die Kettenregel?", "answer": "f(g(x))' = f'(g(x)) · g'(x)", "hint": "Äußere mal innere Ableitung"},
        {"question": "Produktregel?", "answer": "(u·v)' = u'v + uv'", "hint": "u-strich-v + u-v-strich"},
        {"question": "Wann liegt ein Hochpunkt vor?", "answer": "f'(x₀)=0 und f''(x₀)<0", "hint": "Vorzeichenwechsel beachten"},
        {"question": "Ableitung von sin(x)?", "answer": "cos(x)", "hint": "Sinus → Kosinus"},
        {"question": "Was bedeutet streng monoton steigend?", "answer": "f'(x) > 0 auf dem gesamten Intervall", "hint": "Vorzeichen der ersten Ableitung"}
      ]
    },
    {
      "subject": "Deutsch",
      "topic": "Rhetorische Mittel",
      "cards": [
        {"question": "Was ist eine Anapher?", "answer": "Wiederholung eines Wortes am Anfang aufeinanderfolgender Sätze", "hint": "Anfang = Anapher"},
        {"question": "Metapher vs. Vergleich?", "answer": "Metapher ohne 'wie', Vergleich mit 'wie'", "hint": "Metapher ist direkter"},
        {"question": "Was ist eine Klimax?", "answer": "Steigerung von Begriffen in aufsteigender Intensität", "hint": "Drei Stufen, immer intensiver"},
        {"question": "Was ist ein Enjambement?", "answer": "Zeilenübergang in der Lyrik ohne Pause am Versende", "hint": "Vers springt weiter"}
      ]
    }
  ]
}`;

  try {
    // ✅ Groq — free tier, 14,400 requests/day, extremely fast
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        temperature: 0.7,
        max_tokens: 1500,
        messages: [
          {
            role: "system",
            content: "Du bist ein Abitur-Lerncoach. Antworte IMMER nur mit reinem JSON, ohne Markdown, ohne Erklärung."
          },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq error:", err);
      return res.status(500).json({ error: "AI service error" });
    }

    const data = await response.json();
    // Groq uses OpenAI-compatible response format
    const text = data.choices?.[0]?.message?.content || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json(parsed);
  } catch (err) {
    console.error("Handler error:", err);
    return res.status(500).json({ error: "Failed to generate plan" });
  }
}
