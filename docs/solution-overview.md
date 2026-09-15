# Solution Overview

## What OutageIQ Does

OutageIQ is a grid intelligence system that continuously evaluates every monitored asset (transformers and substations) against three inputs — sensor health, live weather conditions, and operational criticality — and produces a single, explainable risk score per asset. Instead of a utility team manually cross-referencing sensor dashboards, weather reports, and asset records, OutageIQ does that correlation automatically and presents the result as a prioritized, actionable list.

## Core Mechanism

The system works in four stages:

1. **Data collection** — asset sensor readings (temperature, vibration, oil quality, partial discharge) are read from a structured dataset, and live weather conditions (temperature, wind speed, precipitation) are fetched in real time for the asset's region via a public weather API.
2. **Risk scoring** — each asset receives a 0–100 risk score, computed as a weighted combination of:
   - **Sensor risk (60%)** — how far each sensor reading is from its safe operating threshold, combined so that the single worst reading dominates the score and additional breaches stack on top of it, rather than being diluted by an average across all sensors.
   - **Weather risk (20%)** — current wind speed and precipitation relative to safety thresholds.
   - **Asset criticality (20%)** — how much impact a failure of this specific asset would have (based on customers served and its role in the grid).
3. **AI-generated explanation** — for each asset, the system generates a plain-English paragraph explaining exactly *why* it received its score, citing its actual sensor readings and current weather — not a generic label, but a specific, defensible explanation a technician could act on immediately.
4. **Prioritized recommendation** — each asset is labeled Critical / High / Medium / Low, and paired with a concrete, time-bound recommended action (e.g., "Inspect within 6 hours" for Critical assets, down to "Monitor remotely" for Low-risk ones), so operations teams know not just *what's* at risk, but *what to do about it* and *how urgently*.

## What Makes This Different From a Naive Alternative

A naive version of this problem would simply flag any sensor reading above a fixed threshold. OutageIQ goes further in two specific ways:

- **It combines multiple weak signals into one strong signal.** An asset with several sensors each slightly elevated, plus incoming bad weather, is often a bigger real-world risk than an asset with one sensor spiking in isolation — and the scoring formula is specifically designed to reflect that (the worst single reading sets the floor, but every additional issue compounds the score rather than being averaged away).
- **It explains its reasoning, not just its output.** A raw "risk = 81" number tells an operator nothing actionable. OutageIQ's AI-generated explanations name the specific sensor readings and conditions responsible, which builds trust in the system's output and gives a technician a starting point for their physical inspection.

## Key Design Decisions

- **Rule-based, explainable scoring over a black-box model.** Given the safety-critical nature of grid maintenance decisions, a transparent, auditable scoring formula was chosen over an opaque machine learning model for the initial version — every score can be traced back to the exact sensor readings and weather conditions that produced it. This also made the system faster to build, test, and verify correct within the hackathon's timeframe.
- **IBM Bob as the core development and reasoning engine.** The risk-scoring logic, the explanation-generation logic, and the dashboard interface were all built directly by IBM Bob operating in Agent mode — reading the project's data structures, writing and testing the implementation, and iterating based on real output (including diagnosing and fixing a scoring-normalization bug during development). Bob is not a peripheral tool here; it is the system's primary builder.
- **Zero-dependency, framework-free implementation.** The entire solution runs from a single Python script and a single self-contained HTML file, requiring no build tools, no server, and no external services beyond one free, keyless weather API call. This was a deliberate choice to maximize reliability and reproducibility for judges evaluating the submission.

## User Experience

A utility operations user opens the OutageIQ dashboard and immediately sees, at a glance: how many assets are being monitored, how many fall into each risk category, and a sorted list of every asset ranked from most to least urgent. Clicking any asset reveals the specific reasoning behind its score and a clear recommended next step — no manual cross-referencing of separate systems required.
