# Add a lightweight AI advisor chat feature to OutageIQ.

Create src/app.py — a minimal Flask server with a single POST endpoint /api/chat that accepts {"question": "..."}, loads src/data/risk_output.json for context, and calls watsonx.ai's Granite model (ibm/granite-4-h-small, same credentials as risk_engine.py) with a prompt combining the user's question and the current asset risk data. Return {"answer": "..."}. Reuse the existing watsonx.ai connection logic from risk_engine.py rather than duplicating it — extract it into a shared helper if needed.
Add CORS support so index.html can call this endpoint from the browser (flask-cors).
In index.html, add a simple chat panel (a toggleable sidebar or floating button) with a text input and a message list. On submit, POST to http://localhost:5000/api/chat and display the response.
If the backend isn't running or the call fails, show a graceful inline message ("AI advisor is offline — start the backend with python src/app.py to enable it") instead of breaking the rest of the dashboard.
Update requirements.txt with flask and flask-cors. Do not modify risk_engine.py's existing behavior.

---

**Status:** active  **Date:** 2026-09-15

---

### 👤 User

Add a lightweight AI advisor chat feature to OutageIQ.

Create src/app.py — a minimal Flask server with a single POST endpoint /api/chat that accepts {"question": "..."}, loads src/data/risk_output.json for context, and calls watsonx.ai's Granite model (ibm/granite-4-h-small, same credentials as risk_engine.py) with a prompt combining the user's question and the current asset risk data. Return {"answer": "..."}. Reuse the existing watsonx.ai connection logic from risk_engine.py rather than duplicating it — extract it into a shared helper if needed.
Add CORS support so index.html can call this endpoint from the browser (flask-cors).
In index.html, add a simple chat panel (a toggleable sidebar or floating button) with a text input and a message list. On submit, POST to http://localhost:5000/api/chat and display the response.
If the backend isn't running or the call fails, show a graceful inline message ("AI advisor is offline — start the backend with python src/app.py to enable it") instead of breaking the rest of the dashboard.
Update requirements.txt with flask and flask-cors. Do not modify risk_engine.py's existing behavior.

---

### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[ ] Explore the existing codebase structure
[ ] Extract watsonx.ai connection logic into a shared helper
[ ] Create src/app.py with Flask server and /api/chat endpoint
[ ] Update requirements.txt with flask and flask-cors
[ ] Add chat panel UI to index.html


### 🤖 Assistant

> 🔧 called: list_files



> 🔧 **list_files** — .

### 🤖 Assistant

> 🔧 called: list_files, read_file



> 🔧 **list_files** — src

> 🔧 **read_file** — requirements.txt

### 🤖 Assistant

> 🔧 called: read_file, read_file



> 🔧 **read_file** — src/risk_engine.py

> 🔧 **read_file** — src/data/risk_output.json

### 🤖 Assistant

> 🔧 called: read_file

Now let me read the index.html to understand the current UI structure:

> 🔧 **read_file** — src/index.html

### 🤖 Assistant

> 🔧 called: update_todo_list

Now I have a full picture of the codebase. Let me implement all the changes:

> 🔧 **update_todo_list** — 
[x] Explore the existing codebase structure
[-] Extract watsonx.ai connection logic into a shared helper
[ ] Create src/app.py with Flask server and /api/chat endpoint
[ ] Update requirements.txt with flask and flask-cors
[ ] Add chat panel UI to index.html


### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[-] Explore the existing codebase structure
[ ] Extract watsonx.ai connection logic into a shared helper
[ ] Create src/app.py with Flask server and /api/chat endpoint
[ ] Update requirements.txt with flask and flask-cors
[ ] Add chat panel UI to index.html


### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[x] Explore the existing codebase structure
[-] Extract watsonx.ai connection logic into a shared helper
[ ] Create src/app.py with Flask server and /api/chat endpoint
[ ] Update requirements.txt with flask and flask-cors
[ ] Add chat panel UI to index.html


### 🤖 Assistant

> 🔧 called: write_file

The watsonx.ai connection in [`risk_engine.py`](src/risk_engine.py:288) is self-contained inside `generate_explanation` — it creates `Credentials` + `ModelInference` inline. I'll extract the model factory into a new [`src/watsonx_client.py`](src/watsonx_client.py) helper, then update `risk_engine.py` to use it, and build `app.py` on top.

> 🔧 **write_file** — src/watsonx_client.py

### 🤖 Assistant

> 🔧 called: apply_diff

Now update [`risk_engine.py`](src/risk_engine.py) to reuse the shared helper instead of duplicating the connection logic:

> 🔧 **apply_diff** — src/risk_engine.py

### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[x] Explore the existing codebase structure
[x] Extract watsonx.ai connection logic into a shared helper
[-] Create src/app.py with Flask server and /api/chat endpoint
[ ] Update requirements.txt with flask and flask-cors
[ ] Add chat panel UI to index.html


### 🤖 Assistant

> 🔧 called: write_file



> 🔧 **write_file** — """
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


### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[x] Explore the existing codebase structure
[x] Extract watsonx.ai connection logic into a shared helper
[x] Create src/app.py with Flask server and /api/chat endpoint
[-] Update requirements.txt with flask and flask-cors
[ ] Add chat panel UI to index.html


### 🤖 Assistant

> 🔧 called: apply_diff



> 🔧 **apply_diff** — <<<<<<< SEARCH
:start_line:1
-------
ibm-watsonx-ai>=1.0.0
python-dotenv>=1.0.0
=======
ibm-watsonx-ai>=1.0.0
python-dotenv>=1.0.0
flask>=3.0.0
flask-cors>=4.0.0
>>>>>>> REPLACE


### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[x] Explore the existing codebase structure
[x] Extract watsonx.ai connection logic into a shared helper
[x] Create src/app.py with Flask server and /api/chat endpoint
[x] Update requirements.txt with flask and flask-cors
[-] Add chat panel UI to index.html


### 🤖 Assistant

> 🔧 called: apply_diff

Now add the chat panel to [`index.html`](src/index.html). I'll add CSS styles in the `<style>` block and the chat panel markup + JS before `</body>`:

> 🔧 **apply_diff** — src/index.html

### 🤖 Assistant

> 🔧 called: read_file, read_file

Now let me verify the final state of the key files looks correct:

> 🔧 **read_file** — src/watsonx_client.py

> 🔧 **read_file** — src/app.py

### 🤖 Assistant

> 🔧 called: read_file, read_file

Let me also verify the risk_engine.py change looks correct at the relevant section:

> 🔧 **read_file** — requirements.txt

> 🔧 **read_file** — src/risk_engine.py

### 🤖 Assistant

> 🔧 called: read_file

Everything looks correct. Let me also verify the HTML chat section rendered correctly:

> 🔧 **read_file** — src/index.html

### 🤖 Assistant

> 🔧 called: grep

All changes are in place. Let me do a final check that `risk_engine.py` still has no remaining references to the old inline credential setup:

> 🔧 **grep** — Credentials|ModelInference|_WATSONX_URL|_MODEL_ID

### 🤖 Assistant

> 🔧 called: update_todo_list

Clean. All old duplicated credential code is gone from [`risk_engine.py`](src/risk_engine.py).

> 🔧 **update_todo_list** — 
[x] Explore the existing codebase structure
[x] Extract watsonx.ai connection logic into a shared helper
[x] Create src/app.py with Flask server and /api/chat endpoint
[x] Update requirements.txt with flask and flask-cors
[x] Add chat panel UI to index.html


### 🤖 Assistant

Here's a summary of every change made:

---

### New files

**[`src/watsonx_client.py`](src/watsonx_client.py)** — shared helper  
A single `get_model()` function that reads `WATSONX_API_KEY` / `WATSONX_PROJECT_ID` from the environment, builds `Credentials`, and returns a configured `ModelInference` instance. Both `risk_engine.py` and `app.py` import from here — the credentials/URL/model-ID are defined in exactly one place.

**[`src/app.py`](src/app.py)** — Flask AI advisor backend  
- `CORS(app)` via `flask-cors` so `index.html` can POST from `file://` or any `localhost` origin  
- `_load_risk_context()` reads `risk_output.json` fresh on every request and formats it as a concise text block  
- `POST /api/chat` — validates the `question` field, builds a prompt with the risk context, calls `get_model().chat(...)`, and returns `{"answer": "..."}`. Returns HTTP 503 with `{"error": "..."}` if the model call fails for any reason.

---

### Modified files

**[`src/risk_engine.py`](src/risk_engine.py:248)** — deduplicated  
Removed the inline `_WATSONX_URL`, `_MODEL_ID`, and the `Credentials`/`ModelInference` construction. Now uses `from watsonx_client import get_model`. Behavior is identical.

**[`requirements.txt`](requirements.txt)** — two lines added  
```
flask>=3.0.0
flask-cors>=4.0.0
```

**[`src/index.html`](src/index.html:609)** — chat panel added  
- A fixed 🤖 floating action button (bottom-right) toggles the panel  
- Panel: header with close button, scrollable message list, text input + Send  
- On submit → `POST http://localhost:5000/api/chat` → appends the answer bubble  
- On network failure/timeout → shows the offline message: *"AI advisor is offline — start the backend with: python src/app.py"* with `chat-msg offline` styling — the rest of the dashboard is completely unaffected  
- Enter key submits; send button is disabled while waiting