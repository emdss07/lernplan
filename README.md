# LernPlan — Abitur KI-Lernplan

KI-gestützter Lernplan-Generator mit Karteikarten für Abitur-Schüler.

---

## 🚀 Deployment (kostenlos, ~10 Minuten)

### Schritt 1 — GitHub Repository anlegen
1. Gehe auf https://github.com → "New repository"
2. Name: `lernplan`, Public, ohne README
3. Alle Dateien aus diesem Ordner hochladen (drag & drop im Browser)

### Schritt 2 — Google Gemini API Key holen (kostenlos)
1. Gehe auf https://aistudio.google.com/apikey
2. Mit Google Account einloggen (kostenlos)
3. "Create API Key" klicken
4. Key kopieren und sicher aufbewahren

### Schritt 3 — Vercel deployen
1. Gehe auf https://vercel.com → mit GitHub einloggen
2. "Add New Project" → dein `lernplan` Repo auswählen
3. Framework: **Vite** (wird automatisch erkannt)
4. Vor dem Deploy: **Environment Variables** aufklappen
   - Name:  `GEMINI_API_KEY`
   - Value: dein Key aus Schritt 2
5. "Deploy" klicken

✅ Fertig! Du bekommst eine URL wie `lernplan.vercel.app`

---

## 📁 Projektstruktur

```
lernplan/
├── api/
│   └── generate-plan.js   ← Serverless Function (API Key ist hier sicher)
├── src/
│   ├── App.jsx            ← Haupt-App
│   └── main.jsx           ← Entry point
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🔐 Sicherheit

Der Anthropic API Key liegt **nur** in der Vercel Environment Variable.
Der Browser sendet Anfragen an `/api/generate-plan` (dein eigener Server).
Der Server leitet sie an Anthropic weiter — der Key verlässt nie den Server.

## 💰 Kosten

- Vercel Hosting: kostenlos (Hobby Plan)
- Google Gemini API: **komplett kostenlos** (Free Tier: 15 Anfragen/Min, 1500/Tag)
- Für die ersten tausende Nutzer: €0,00

## 🛠 Lokal entwickeln

```bash
npm install
npm run dev
```

Erstelle eine `.env.local` Datei:
```
GEMINI_API_KEY=AIza...
```
