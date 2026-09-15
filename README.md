# ⚡ OutageIQ

---

## 👥 Team

| Field | Value |
|---|---|
| **Team Name** | GridSynapse |
| **Track** | AI (Utilities) |
| **Team Lead** | Dhruv Bhoi |
| **Members** | Jiya Sheth, Kush Parekh, Aditi |

---

## 🎯 Problem Statement

Utility operators typically discover failing grid equipment — transformers, substations — only after it fails, causing unplanned power outages. There's no easy way to see, at a glance, which assets are quietly degrading and need attention before they cause a blackout.

---

## 💡 Solution

OutageIQ is a risk-monitoring dashboard that scores each grid asset's likelihood of failure using sensor condition, live weather data, and asset criticality. Instead of reacting after an outage, operators get an early-warning view of at-risk equipment with a plain-language explanation and a recommended action for each one. An optional AI Advisor chat interface (Flask backend + watsonx.ai) lets operators ask natural-language questions about the current risk data.

---

## ✨ Key Features

- **Weighted risk scoring:** Combines sensor condition (60%), weather risk (20%), and asset criticality (20%) into a single risk score per asset.
- **Live weather integration:** Pulls real-time weather conditions per asset location from the Open-Meteo API (no API key required).
- **AI-generated explanations:** Every score comes with a plain-language explanation and a recommended action, generated via watsonx.ai (Granite `ibm/granite-4-h-small`) — with a safe fallback to static logic if the API is unavailable.
- **AI Advisor chat:** A Flask backend (`app.py`) exposes `POST /api/chat`, letting operators ask free-form questions about the current risk data, answered by watsonx.ai Granite in 2–4 actionable sentences.
- **Visual dashboard:** Summary stats, a risk-distribution chart, and color-coded, expandable asset cards for drill-down detail.

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Languages** | Python, JavaScript, HTML/CSS |
| **Frameworks** | Flask, flask-cors (AI Advisor backend) |
| **IBM Technologies** | IBM Bob (Agent mode), watsonx.ai (Granite `ibm/granite-4-h-small`), `ibm-watsonx-ai` Python SDK |
| **Databases** | None — asset data and risk output stored as JSON |
| **Other** | Open-Meteo API (live weather, keyless), `python-dotenv`, GitHub Actions |

---

## 📁 Repository Structure

```
├── src/                  # All source code
│   ├── data/             # Mock asset dataset (assets.json) + risk output (risk_output.json)
│   ├── risk_engine.py    # Risk scoring engine (fetches weather, scores assets, calls watsonx.ai)
│   ├── watsonx_client.py # Shared watsonx.ai connection helper (ibm/granite-4-h-small, eu-de)
│   ├── app.py            # Flask AI Advisor backend — POST /api/chat
│   └── index.html        # Self-contained dashboard UI
├── docs/                 # Written documentation
│   ├── problem-statement.md
│   ├── solution-overview.md
│   ├── architecture.md
│   └── setup-guide.md
├── demo/                 # Demo artifacts
│   ├── screenshots/      # App screenshots
│   └── demo-video-link.txt  # Link to demo video
├── bob_sessions/         # IBM Bob task session logs + consumption summaries
├── presentation/         # Slide deck
└── submission.yaml       # Structured submission metadata
```

---

## ⚡ How to Run

> See [`docs/setup-guide.md`](docs/setup-guide.md) for full details.

```bash
# 1. Clone the repo
git clone https://github.com/dhruvbhoi2007-hub/bob-ai-hackathon-GridSynapse.git
cd bob-ai-hackathon-GridSynapse

# 2. View the dashboard immediately — no setup needed
# Just open src/index.html in your browser (uses a pre-scored data snapshot)

# 3. (Optional) Re-run the risk engine with fresh live weather + AI-generated explanations
pip install -r requirements.txt
cp src/.env.example src/.env
# Edit src/.env with your own WATSONX_API_KEY and WATSONX_PROJECT_ID
python src/risk_engine.py

# 4. (Optional) Start the AI Advisor backend
python src/app.py
# Exposes POST http://localhost:5000/api/chat
# Body: { "question": "Which assets need immediate attention?" }

# 5. (Optional) Serve locally to guarantee the dashboard reads the fresh data
cd src
python -m http.server 8000
# then open http://localhost:8000/index.html
```

Re-running the risk engine with live data requires your own watsonx.ai `WATSONX_API_KEY` and `WATSONX_PROJECT_ID` (see step 3) — but the dashboard works immediately out of the box using the pre-scored `risk_output.json` snapshot, no credentials needed. If the watsonx.ai call fails for any reason, the engine automatically falls back to static explanation logic so the dashboard never breaks. See [`docs/setup-guide.md`](docs/setup-guide.md) for full details and troubleshooting.

---

## 🖥️ Demo

| Artifact | Link |
|---|---|
| 📹 Demo Video | [https://youtu.be/Zfm04pKZHp8](https://youtu.be/Zfm04pKZHp8) |
| 🖼️ Screenshots | [See demo/screenshots/](demo/screenshots/) |
| 📊 Presentation | [See presentation/](presentation/) |

---

## ⚠️ Known Limitations

- Risk *score* is rule-based (weighted formula), not a trained ML model — chosen for transparency and auditability; only the explanation/recommendation text is AI-generated via watsonx.ai.
- Asset dataset is mock/synthetic data, not connected to real utility sensor feeds.
- No live cloud deployment — runs locally, per hackathon rules.
- No authentication or multi-user support — single-operator demo scope.
- The AI Advisor (`app.py`) requires valid watsonx.ai credentials; it does not have a fallback mode like the risk engine does.

---

## 🏅 What We're Most Proud Of

Building a fully working, explainable risk-scoring pipeline — from raw asset + weather data to a clear, actionable dashboard with AI-generated explanations and an interactive AI Advisor chat — as a team relying on IBM Bob as the core development agent for every line of code.

---
