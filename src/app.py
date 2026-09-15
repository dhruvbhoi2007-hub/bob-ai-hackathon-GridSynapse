"""
app.py — OutageIQ AI Advisor backend
A minimal Flask server exposing POST /api/chat.

Usage:
    python src/app.py

Requires WATSONX_API_KEY and WATSONX_PROJECT_ID in src/.env (or system env).
"""

import json
import os
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

load_dotenv(Path(__file__).parent / ".env")

app = Flask(__name__)
CORS(app)  # allow index.html served from any origin (file:// or http://localhost)

BASE_DIR = Path(__file__).parent
RISK_OUTPUT = BASE_DIR / "data" / "risk_output.json"


def _load_risk_context() -> str:
    """Return a compact text summary of the current risk_output.json."""
    try:
        with open(RISK_OUTPUT) as f:
            assets = json.load(f)
    except FileNotFoundError:
        return "No risk data available (run risk_engine.py first)."

    lines = ["Current asset risk summary:"]
    for a in assets:
        lines.append(
            f"  - {a['asset_type']} {a['asset_id']} ({a['location']}): "
            f"risk {a['risk_score']:.1f}/100 [{a['risk_label']}] — "
            f"{a['recommended_action']}"
        )
    return "\n".join(lines)


@app.route("/api/chat", methods=["POST"])
def chat():
    body = request.get_json(silent=True) or {}
    question = str(body.get("question", "")).strip()
    if not question:
        return jsonify({"error": "question is required"}), 400

    risk_context = _load_risk_context()

    prompt = (
        "You are an AI advisor for OutageIQ, a power-grid outage prediction dashboard.\n"
        "Answer the operator's question using the asset risk data provided below.\n"
        "Be concise and actionable (2–4 sentences).\n\n"
        f"{risk_context}\n\n"
        f"Operator question: {question}\n"
        "Answer:"
    )

    try:
        from watsonx_client import get_model

        model = get_model()
        response = model.chat(
            messages=[{"role": "user", "content": prompt}],
            params={"max_tokens": 300, "temperature": 0.3},
        )
        answer = (
            response.get("choices", [{}])[0]
            .get("message", {})
            .get("content", "")
            .strip()
        )
        if not answer:
            raise ValueError("Empty response from model")
    except Exception as exc:
        app.logger.warning("watsonx.ai call failed: %s", exc)
        return jsonify({"error": f"AI model unavailable: {exc}"}), 503

    return jsonify({"answer": answer})


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    print(f"OutageIQ AI Advisor running on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
