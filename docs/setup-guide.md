# Setup Guide

This guide assumes no prior familiarity with this repository. Follow these steps exactly to run OutageIQ locally.

## Prerequisites

- **Python 3.8 or newer** installed on your machine ([python.org/downloads](https://www.python.org/downloads/))
- **A modern web browser** (Chrome, Firefox, Edge, or similar) — no other software is required
- **Internet connection** — needed only if you want to re-run the risk engine and fetch live weather data or live AI-generated explanations; the dashboard itself works fully offline using the last-generated data
- **(Optional) A watsonx.ai API key and Project ID** — only needed if you want to re-generate explanations live. Without them, the risk engine automatically falls back to static explanation text, and the dashboard still works normally using the pre-scored data snapshot.

## Environment Variables

Only needed if you want to re-run the risk engine with live, AI-generated explanations. Copy `src/.env.example` to `src/.env` and fill in:

| Variable | Description |
|---|---|
| `WATSONX_API_KEY` | Your IBM Cloud API key (create one at [cloud.ibm.com/iam/apikeys](https://cloud.ibm.com/iam/apikeys)) |
| `WATSONX_PROJECT_ID` | Your watsonx.ai project ID (found in your project's Manage → General tab at [dataplatform.cloud.ibm.com](https://dataplatform.cloud.ibm.com)) |

If these are left unset or invalid, `risk_engine.py` automatically falls back to static, rule-based explanation text — it will not crash or block the pipeline. The Open-Meteo weather API used by `risk_engine.py` remains free and keyless and needs no credentials.

**Viewing the dashboard itself never requires any of this** — `index.html` reads from the already-generated `risk_output.json` snapshot included in the repo.

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/dhruvbhoi2007-hub/bob-ai-hackathon-GridSynapse.git
   cd bob-ai-hackathon-GridSynapse
   ```
2. (Optional — only needed if you want to re-run the risk engine yourself) Install dependencies:
   ```
   pip install -r requirements.txt
   ```
3. (Optional — only for live AI-generated explanations) Set up credentials:
   ```
   cp src/.env.example src/.env
   ```
   Then edit `src/.env` and fill in `WATSONX_API_KEY` and `WATSONX_PROJECT_ID` as described above.

## Running the Project

### Option A — View the dashboard immediately (no setup needed)

The dashboard already includes a working snapshot of scored, AI-explained data, so you can view it right away:

1. Navigate to the `src/` folder in your file explorer.
2. Double-click `index.html`.
3. It will open directly in your default browser and display the full OutageIQ dashboard — no server, no build step, no internet connection, and no credentials required.

### Option B — Re-generate the risk data yourself

If you want to see the risk-scoring pipeline run from scratch (including a fresh live weather fetch and freshly generated AI explanations):

1. Open a terminal in the project's root folder.
2. Run:
   ```
   python src/risk_engine.py
   ```
3. This will print a summary table to the console and overwrite `src/data/risk_output.json` with freshly computed scores, live weather-based risk, and — if `src/.env` is configured with valid watsonx.ai credentials — freshly generated AI explanations and recommended actions. Without valid credentials, it uses static fallback explanation text instead.
4. Refresh `src/index.html` in your browser (if it was already open) to see the updated data. Note: if you open `index.html` directly as a local file, some browsers restrict `fetch()` calls to local JSON files — in that case the dashboard automatically falls back to its last-embedded data snapshot. To guarantee it reads the freshly generated `risk_output.json` live, serve the folder with a simple local server instead:
   ```
   cd src
   python -m http.server 8000
   ```
   Then open `http://localhost:8000/index.html` in your browser.

## How to Verify It's Working

- The dashboard should show **8 total assets monitored**, with a breakdown across Critical/High/Medium/Low risk categories.
- The asset at the top of the list (sorted by risk score) should be **S-021**, scored in the **Critical** range.
- Clicking any asset card should expand it to reveal a written explanation and a recommended action — if this doesn't happen, check your browser's JavaScript console (F12 → Console tab) for errors.
- If you ran Option B with valid watsonx.ai credentials, the console output from `risk_engine.py` should complete with no errors or warnings, and the explanation text in `risk_output.json` should read as naturally generated prose rather than a fixed template.

## Troubleshooting

| Problem | Likely Cause | Fix |
|---|---|---|
| `python` command not recognized | Python isn't installed or isn't on your system PATH | Reinstall Python from python.org and check "Add Python to PATH" during setup |
| `ModuleNotFoundError: No module named 'requests'` (or `dotenv`, `ibm_watsonx_ai`) | Dependencies aren't installed | Run `pip install -r requirements.txt` |
| Dashboard shows no data / blank page | Opened `index.html` from a restrictive environment, or the embedded fallback data was removed | Confirm `src/data/risk_output.json` exists; try the local server method in Option B above |
| Weather fetch fails when re-running `risk_engine.py` | No internet connection, or Open-Meteo API is temporarily unavailable | Check your internet connection; the script can be re-run once connectivity is restored |
| Explanations look generic/templated instead of AI-generated | `src/.env` is missing or has invalid watsonx.ai credentials | This is expected fallback behavior, not a bug — add valid `WATSONX_API_KEY` and `WATSONX_PROJECT_ID` to `src/.env` to enable live AI explanations |
| watsonx.ai call fails (auth error, model not found, etc.) | Invalid/expired API key, wrong Project ID, or the configured model was deprecated in your region | Verify your credentials at cloud.ibm.com; if the model ID errors out, check available Granite models for your project's region and update `_MODEL_ID` in `risk_engine.py` — the pipeline still works via fallback in the meantime |
| Risk scores look identical to a previous run | Weather at the monitored region hasn't changed significantly since the last run | This is expected behavior, not a bug — try again during different weather conditions to see scores shift |
