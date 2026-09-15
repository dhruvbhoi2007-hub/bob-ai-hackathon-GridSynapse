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

OutageIQ is a risk-monitoring dashboard that scores each grid asset's likelihood of failure using sensor condition, live weather data, and asset criticality. Instead of reacting after an outage, operators get an early-warning view of at-risk equipment with a plain-language explanation and a recommended action for each one.

---

## ✨ Key Features

- **Weighted risk scoring:** Combines sensor condition (60%), weather risk (20%), and asset criticality (20%) into a single risk score per asset.
- **Live weather integration:** Pulls real-time weather conditions per asset location from the Open-Meteo API.
- **AI-generated explanations:** Every score comes with a plain-language explanation and a recommended action, generated via watsonx.ai (Granite) — with a safe fallback to static logic if the API is unavailable.
- **Visual dashboard:** Summary stats, a risk-distribution chart, and color-coded, expandable asset cards for drill-down detail.

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Languages** | Python, JavaScript, HTML/CSS |
| **Frameworks** | None — lightweight static dashboard + standalone Python risk engine |
| **IBM Technologies** | IBM Bob (Agent mode), watsonx.ai (Granite) |
| **Databases** | None — asset data stored as JSON |
| **Other** | Open-Meteo API, GitHub Actions |

---

## 📁 Repository Structure

```
├── src/                  # All source code
│   ├── data/             # Mock asset dataset + risk output
│   ├── risk_engine.py    # Risk scoring engine
│   └── index.html        # Dashboard
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

# 4. (Optional) Serve locally to guarantee the dashboard reads the fresh data
cd src
python -m http.server 8000
# then open http://localhost:8000/index.html
```

Re-running the risk engine with live data requires your own watsonx.ai `API_KEY` and `PROJECT_ID` (see step 3) — but the dashboard works immediately out of the box using the pre-scored `risk_output.json` snapshot, no credentials needed. If the watsonx.ai call fails for any reason, the engine automatically falls back to static explanation logic so the dashboard never breaks. See [`docs/setup-guide.md`](docs/setup-guide.md) for full details and troubleshooting.

---

## 🖥️ Demo

| Artifact | Link |
|---|---|
| 📹 Demo Video | [See demo/demo-video-link.txt](demo/demo-video-link.txt) |
| 🖼️ Screenshots | [See demo/screenshots/](demo/screenshots/) |
| 📊 Presentation | [See presentation/](presentation/) |

---

## ⚠️ Known Limitations

- Risk *score* is rule-based (weighted formula), not a trained ML model — chosen for transparency; only the explanation/recommendation text is AI-generated via watsonx.ai.
- Asset dataset is mock/synthetic data, not connected to real utility sensor feeds.
- No live cloud deployment — runs locally, per hackathon rules.
- No authentication or multi-user support — single-operator demo scope.

---

## 🏅 What We're Most Proud Of

Building a fully working, explainable risk-scoring pipeline — from raw asset + weather data to a clear, actionable dashboard — as a solo, first-time coder relying on IBM Bob as the core development agent for every line of code.

---
