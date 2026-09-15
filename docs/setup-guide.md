# Setup Guide

This guide assumes no prior familiarity with this repository. Follow these steps exactly to run OutageIQ locally.

## Prerequisites

- **Python 3.8 or newer** installed on your machine ([python.org/downloads](https://www.python.org/downloads/))
- **A modern web browser** (Chrome, Firefox, Edge, or similar) — no other software is required
- **Internet connection** — needed only if you want to re-run the risk engine and fetch live weather data; the dashboard itself works fully offline using the last-generated data

## Environment Variables

None required. This project makes no authenticated API calls — the Open-Meteo weather API used by `risk_engine.py` is free and keyless. There is no `.env` file needed to view the dashboard; a `.env.example` is included only for template compliance and is not used by any code in this project.

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/dhruvbhoi2007-hub/bob-ai-hackathon-GridSynapse.git
   cd bob-ai-hackathon-GridSynapse
   ```
2. (Optional — only needed if you want to re-run the risk engine yourself) Install the one Python dependency used to call the weather API:
   ```
   pip install requests
   ```

## Running the Project

### Option A — View the dashboard immediately (no setup needed)

The dashboard already includes a working snapshot of scored data, so you can view it right away:

1. Navigate to the `src/` folder in your file explorer.
2. Double-click `index.html`.
3. It will open directly in your default browser and display the full OutageIQ dashboard — no server, no build step, and no internet connection required.

### Option B — Re-generate the risk data yourself

If you want to see the risk-scoring pipeline run from scratch (including a fresh live weather fetch):

1. Open a terminal in the project's root folder.
2. Run:
   ```
   python src/risk_engine.py
   ```
3. This will print a summary table to the console and overwrite `src/data/risk_output.json` with freshly computed scores based on current live weather conditions.
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

## Troubleshooting

| Problem | Likely Cause | Fix |
|---|---|---|
| `python` command not recognized | Python isn't installed or isn't on your system PATH | Reinstall Python from python.org and check "Add Python to PATH" during setup |
| `ModuleNotFoundError: No module named 'requests'` | The `requests` library isn't installed | Run `pip install requests` |
| Dashboard shows no data / blank page | Opened `index.html` from a restrictive environment, or the embedded fallback data was removed | Confirm `src/data/risk_output.json` exists; try the local server method in Option B above |
| Weather fetch fails when re-running `risk_engine.py` | No internet connection, or Open-Meteo API is temporarily unavailable | Check your internet connection; the script can be re-run once connectivity is restored |
| Risk scores look identical to a previous run | Weather at the monitored region hasn't changed significantly since the last run | This is expected behavior, not a bug — try again during different weather conditions to see scores shift |
