"""
risk_engine.py — GridSynapse Asset Risk Scoring Engine
Fetches live weather from Open-Meteo, computes risk scores for each asset,
and writes results to src/data/risk_output.json.
"""

import json
import math
import urllib.request
from pathlib import Path

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).parent
ASSETS_FILE = BASE_DIR / "data" / "assets.json"
OUTPUT_FILE = BASE_DIR / "data" / "risk_output.json"

# ---------------------------------------------------------------------------
# Weather fetch (Open-Meteo — no API key required)
# ---------------------------------------------------------------------------

def fetch_weather(lat: float, lon: float) -> dict:
    """Return current weather variables for the given coordinates."""
    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        f"&current=temperature_2m,wind_speed_10m,precipitation"
        f"&timezone=auto"
    )
    with urllib.request.urlopen(url, timeout=15) as resp:
        data = json.loads(resp.read())
    current = data["current"]
    return {
        "temperature_c": current["temperature_2m"],
        "wind_speed_kmh": current["wind_speed_10m"],
        "precipitation_mm": current["precipitation"],
    }

# ---------------------------------------------------------------------------
# Sensor risk (0–100)
# ---------------------------------------------------------------------------
# Safe thresholds:  temp ≤ 85 °C | vibration ≤ 6 mm/s | partial discharge ≤ 400 pC

def _clamp(value: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return max(lo, min(hi, value))

def sensor_risk(sensors: dict) -> tuple[float, list[str]]:
    """
    Returns (score 0-100, list of contributing factor strings).

    Normalization rules (per sensor):
      - Below threshold: linear 0→40 across the safe range (non-zero but capped low)
      - At/above threshold: floors immediately at 60, then linear 60→100 to the
        max reference value.  This ensures any single breach scores ≥ 60.

    Combination: max(scores) + 0.15 * sum(remaining scores), clamped to 100.
    This means a single severe breach dominates, and multiple breaches stack
    additively rather than being diluted by a simple average.
    """
    notes = []

    # Temperature
    #   Below 85 °C  : score = temp / 85 * 40          (range 0–40)
    #   Above 85 °C  : score = 60 + (temp−85)/(120−85)*40  (range 60–100)
    temp = sensors["temperature_c"]
    if temp > 85:
        t_score = _clamp(60 + (temp - 85) / (120 - 85) * 40)
        notes.append(f"temperature {temp}°C exceeds safe limit of 85°C")
    else:
        t_score = _clamp(temp / 85 * 40)

    # Vibration
    #   Below 6 mm/s : score = vib / 6 * 40             (range 0–40)
    #   Above 6 mm/s : score = 60 + (vib−6)/(15−6)*40  (range 60–100)
    vib = sensors["vibration_mm_s"]
    if vib > 6:
        v_score = _clamp(60 + (vib - 6) / (15 - 6) * 40)
        notes.append(f"vibration {vib} mm/s exceeds safe limit of 6 mm/s")
    else:
        v_score = _clamp(vib / 6 * 40)

    # Partial discharge
    #   Below 400 pC : score = pd / 400 * 40            (range 0–40)
    #   Above 400 pC : score = 60 + (pd−400)/(800−400)*40  (range 60–100)
    pd = sensors["partial_discharge_pc"]
    if pd > 400:
        p_score = _clamp(60 + (pd - 400) / (800 - 400) * 40)
        notes.append(f"partial discharge {pd} pC exceeds safe limit of 400 pC")
    else:
        p_score = _clamp(pd / 400 * 40)

    # Oil quality — flat score (unchanged)
    oil = sensors["oil_quality"]
    oil_map = {"Poor": 100, "Degraded": 65, "Fair": 35, "Good": 0}
    o_score = oil_map.get(oil, 0)
    if oil in ("Poor", "Degraded"):
        notes.append(f"oil quality is {oil}")
    elif oil == "Fair":
        notes.append("oil quality is Fair (moderate concern)")

    # Combination: dominant breach + 15% bonus for each additional breach
    # This prevents a low score on one sensor from diluting high scores on others.
    scores = [t_score, v_score, p_score, o_score]
    top = max(scores)
    rest_sum = sum(scores) - top
    combined = top + 0.15 * rest_sum
    return _clamp(combined), notes

# ---------------------------------------------------------------------------
# Weather risk (0–100)
# ---------------------------------------------------------------------------
# Wind ≥ 60 km/h or precip ≥ 10 mm/h are considered severe

def weather_risk(weather: dict) -> tuple[float, list[str]]:
    notes = []
    wind = weather["wind_speed_kmh"]
    precip = weather["precipitation_mm"]

    w_score = _clamp(wind / 60 * 100)
    p_score = _clamp(precip / 10 * 100)

    if wind >= 40:
        notes.append(f"wind speed {wind:.1f} km/h (elevated)")
    if wind >= 60:
        notes[-1] = f"wind speed {wind:.1f} km/h (severe)"
    if precip >= 5:
        notes.append(f"precipitation {precip:.1f} mm (elevated)")
    if precip >= 10:
        notes[-1] = f"precipitation {precip:.1f} mm (severe)"

    combined = (w_score + p_score) / 2
    return _clamp(combined), notes

# ---------------------------------------------------------------------------
# Criticality score (0–100)
# ---------------------------------------------------------------------------

CRITICALITY_MAP = {"Critical": 100, "High": 75, "Medium": 50, "Low": 25}

def criticality_score(level: str) -> float:
    return float(CRITICALITY_MAP.get(level, 25))

# ---------------------------------------------------------------------------
# Final composite risk
# ---------------------------------------------------------------------------

def composite_risk(s_risk: float, w_risk: float, c_score: float) -> float:
    return _clamp(s_risk * 0.60 + w_risk * 0.20 + c_score * 0.20)

# ---------------------------------------------------------------------------
# Labels & actions
# ---------------------------------------------------------------------------

def risk_label(score: float) -> str:
    if score >= 80:
        return "Critical"
    if score >= 60:
        return "High"
    if score >= 40:
        return "Medium"
    return "Low"

def recommended_action(label: str) -> str:
    return {
        "Critical": "Inspect within 6 hours and prepare contingency switching plan",
        "High":     "Schedule inspection within 24 hours",
        "Medium":   "Schedule inspection this week",
        "Low":      "Monitor remotely; next scheduled maintenance cycle",
    }[label]

# ---------------------------------------------------------------------------
# Plain-English explanation
# ---------------------------------------------------------------------------

def build_explanation(
    asset: dict,
    s_score: float, s_notes: list[str],
    w_score: float, w_notes: list[str],
    c_score: float,
    final_score: float,
    label: str,
    weather: dict,
) -> str:
    a_id = asset["asset_id"]
    a_type = asset["asset_type"]
    loc = asset["location"]
    crit = asset["criticality"]

    sensor_text = (
        (", ".join(s_notes) + ".") if s_notes
        else "all sensor readings are within safe operating limits."
    )
    weather_text = (
        (", ".join(w_notes) + ".") if w_notes
        else (
            f"current weather conditions are benign "
            f"(wind {weather['wind_speed_kmh']:.1f} km/h, "
            f"precipitation {weather['precipitation_mm']:.1f} mm)."
        )
    )

    return (
        f"{a_type} {a_id} at {loc} has been assigned a risk score of "
        f"{final_score:.1f} ({label}). "
        f"Sensor analysis (contributing {s_score:.1f}/100 at 60% weight) flagged: "
        f"{sensor_text} "
        f"Weather conditions at the region contribute {w_score:.1f}/100 at 20% weight — "
        f"{weather_text} "
        f"The asset's operational criticality is {crit} "
        f"(contributing {c_score:.0f}/100 at 20% weight), "
        f"as it serves {asset['customers_served']:,} customers "
        f"and has {asset['previous_failures']} prior failure(s) "
        f"over its {asset['age_years']}-year lifespan."
    )

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    # Load assets
    with open(ASSETS_FILE) as f:
        raw = json.load(f)

    assets = raw["assets"]
    region = raw["region"]

    print(f"Fetching weather for {region['name']} "
          f"({region['latitude']}°N, {region['longitude']}°E)…")
    weather = fetch_weather(region["latitude"], region["longitude"])
    print(
        f"  Temperature: {weather['temperature_c']}°C  |  "
        f"Wind: {weather['wind_speed_kmh']} km/h  |  "
        f"Precipitation: {weather['precipitation_mm']} mm\n"
    )

    w_risk, w_notes = weather_risk(weather)

    results = []
    for asset in assets:
        s_risk, s_notes = sensor_risk(asset["sensors"])
        c_score = criticality_score(asset["criticality"])
        final = composite_risk(s_risk, w_risk, c_score)
        label = risk_label(final)
        explanation = build_explanation(
            asset, s_risk, s_notes, w_risk, w_notes, c_score, final, label, weather
        )
        results.append({
            "asset_id":           asset["asset_id"],
            "asset_type":         asset["asset_type"],
            "location":           asset["location"],
            "criticality":        asset["criticality"],
            "risk_score":         round(final, 2),
            "risk_label":         label,
            "explanation":        explanation,
            "recommended_action": recommended_action(label),
        })

    # Sort descending by risk score
    results.sort(key=lambda x: x["risk_score"], reverse=True)

    # Write output
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        json.dump(results, f, indent=2)
    print(f"Results written to {OUTPUT_FILE}\n")

    # Console summary table
    col_w = [8, 14, 35, 10, 12, 6]
    headers = ["ID", "Type", "Location", "Criticality", "Risk Label", "Score"]
    sep = "+" + "+".join("-" * (w + 2) for w in col_w) + "+"
    row_fmt = "| " + " | ".join(f"{{:<{w}}}" for w in col_w) + " |"

    print(sep)
    print(row_fmt.format(*headers))
    print(sep)
    for r in results:
        print(row_fmt.format(
            r["asset_id"],
            r["asset_type"],
            r["location"][:col_w[2]],
            r["criticality"],
            r["risk_label"],
            f"{r['risk_score']:.1f}",
        ))
    print(sep)
    print(f"\nTotal assets evaluated: {len(results)}")
    label_counts = {}
    for r in results:
        label_counts[r["risk_label"]] = label_counts.get(r["risk_label"], 0) + 1
    for lbl in ("Critical", "High", "Medium", "Low"):
        if lbl in label_counts:
            print(f"  {lbl}: {label_counts[lbl]}")

if __name__ == "__main__":
    main()
