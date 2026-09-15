
  // ── AI ADVISOR CHAT ──────────────────────────────────────────────────────────
  (function initChat() {
    const CHAT_API = 'http://localhost:5000/api/chat';
    const fab      = document.getElementById('chat-fab');
    const panel    = document.getElementById('chat-panel');
    const closeBtn = document.getElementById('chat-close');
    const messages = document.getElementById('chat-messages');
    const input    = document.getElementById('chat-input');
    const sendBtn  = document.getElementById('chat-send');

    function togglePanel() {
      panel.classList.toggle('hidden');
      if (!panel.classList.contains('hidden')) {
        input.focus();
        if (messages.children.length === 0) {
          appendMsg('ai', 'Hello! Ask me anything about the current grid risk data — e.g. "Which assets need attention today?" or "What should I do about S-021?"');
        }
      }
    }

    fab.addEventListener('click', togglePanel);
    closeBtn.addEventListener('click', () => panel.classList.add('hidden'));

    function appendMsg(role, text) {
      const div = document.createElement('div');
      div.className = 'chat-msg ' + role;
      div.textContent = text;
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
      return div;
    }

    async function sendMessage() {
      const question = input.value.trim();
      if (!question) return;
      input.value = '';
      sendBtn.disabled = true;

      appendMsg('user', question);
      const thinking = appendMsg('thinking', 'Thinking…');

      try {
        const res = await fetch(CHAT_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question }),
        });

        thinking.remove();

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          appendMsg('ai', 'Sorry, the AI advisor returned an error: ' + (err.error || res.statusText));
        } else {
          const data = await res.json();
          appendMsg('ai', data.answer || '(no response)');
        }
      } catch (_) {
        thinking.remove();
        appendMsg('offline', 'AI advisor is offline — start the backend with python src/app.py to enable it.');
      } finally {
        sendBtn.disabled = false;
        input.focus();
      }
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
  })();

  // ── EMBEDDED FALLBACK DATA ──────────────────────────────────────────────────
  const FALLBACK_DATA = [{"asset_id":"S-021","asset_type":"Substation","location":"Zone A - Downtown Grid","criticality":"Critical","risk_score":81.08,"risk_label":"Critical","explanation":"Substation S-021 at Zone A - Downtown Grid has been assigned a risk score of 81.1 (Critical). Sensor analysis (contributing 100.0/100 at 60% weight) flagged: temperature 88°C exceeds safe limit of 85°C, partial discharge 510 pC exceeds safe limit of 400 pC, oil quality is Poor. Weather conditions at the region contribute 5.4/100 at 20% weight — current weather conditions are benign (wind 2.3 km/h, precipitation 0.7 mm). The asset's operational criticality is Critical (contributing 100/100 at 20% weight), as it serves 9,800 customers and has 3 prior failure(s) over its 22-year lifespan.","recommended_action":"Inspect within 6 hours and prepare contingency switching plan","history":[{"date":"2025-01-15","risk_score":74.1},{"date":"2025-02-01","risk_score":75.6},{"date":"2025-02-15","risk_score":77.3},{"date":"2025-03-01","risk_score":78.8},{"date":"2025-03-15","risk_score":79.5},{"date":"2025-04-01","risk_score":80.2},{"date":"2025-04-15","risk_score":81.08}]},{"asset_id":"T-104","asset_type":"Transformer","location":"Zone A - Riverside Substation","criticality":"High","risk_score":74.97,"risk_label":"High","explanation":"Transformer T-104 at Zone A - Riverside Substation has been assigned a risk score of 75.0 (High). Sensor analysis (contributing 98.2/100 at 60% weight) flagged: temperature 92°C exceeds safe limit of 85°C, vibration 7.8 mm/s exceeds safe limit of 6 mm/s, partial discharge 480 pC exceeds safe limit of 400 pC, oil quality is Degraded. Weather conditions at the region contribute 5.4/100 at 20% weight — current weather conditions are benign (wind 2.3 km/h, precipitation 0.7 mm). The asset's operational criticality is High (contributing 75/100 at 20% weight), as it serves 4,200 customers and has 2 prior failure(s) over its 18-year lifespan.","recommended_action":"Schedule inspection within 24 hours","history":[{"date":"2025-01-15","risk_score":61.2},{"date":"2025-02-01","risk_score":63.8},{"date":"2025-02-15","risk_score":67.4},{"date":"2025-03-01","risk_score":70.1},{"date":"2025-03-15","risk_score":72.5},{"date":"2025-04-01","risk_score":73.9},{"date":"2025-04-15","risk_score":74.97}]},{"asset_id":"S-009","asset_type":"Substation","location":"Zone C - Eastgate Grid","criticality":"High","risk_score":70.25,"risk_label":"High","explanation":"Substation S-009 at Zone C - Eastgate Grid has been assigned a risk score of 70.3 (High). Sensor analysis (contributing 90.3/100 at 60% weight) flagged: vibration 6.8 mm/s exceeds safe limit of 6 mm/s, partial discharge 450 pC exceeds safe limit of 400 pC, oil quality is Degraded. Weather conditions at the region contribute 5.4/100 at 20% weight — current weather conditions are benign (wind 2.3 km/h, precipitation 0.7 mm). The asset's operational criticality is High (contributing 75/100 at 20% weight), as it serves 5,600 customers and has 2 prior failure(s) over its 20-year lifespan.","recommended_action":"Schedule inspection within 24 hours","history":[{"date":"2025-01-15","risk_score":62.8},{"date":"2025-02-01","risk_score":64.5},{"date":"2025-02-15","risk_score":66.9},{"date":"2025-03-01","risk_score":68.3},{"date":"2025-03-15","risk_score":69.1},{"date":"2025-04-01","risk_score":69.8},{"date":"2025-04-15","risk_score":70.25}]},{"asset_id":"T-087","asset_type":"Transformer","location":"Zone B - Millbrook Substation","criticality":"High","risk_score":62.08,"risk_label":"High","explanation":"Transformer T-087 at Zone B - Millbrook Substation has been assigned a risk score of 62.1 (High). Sensor analysis (contributing 76.7/100 at 60% weight) flagged: vibration 6.2 mm/s exceeds safe limit of 6 mm/s, oil quality is Fair (moderate concern). Weather conditions at the region contribute 5.4/100 at 20% weight — current weather conditions are benign (wind 2.3 km/h, precipitation 0.7 mm). The asset's operational criticality is High (contributing 75/100 at 20% weight), as it serves 3,100 customers and has 1 prior failure(s) over its 12-year lifespan.","recommended_action":"Schedule inspection within 24 hours","history":[{"date":"2025-01-15","risk_score":55.3},{"date":"2025-02-01","risk_score":57.0},{"date":"2025-02-15","risk_score":58.6},{"date":"2025-03-01","risk_score":60.2},{"date":"2025-03-15","risk_score":61.4},{"date":"2025-04-15","risk_score":62.08}]},{"asset_id":"T-112","asset_type":"Transformer","location":"Zone B - Northside Substation","criticality":"Medium","risk_score":39.81,"risk_label":"Low","explanation":"Transformer T-112 at Zone B - Northside Substation has been assigned a risk score of 39.8 (Low). Sensor analysis (contributing 47.9/100 at 60% weight) flagged: oil quality is Fair (moderate concern). Weather conditions at the region contribute 5.4/100 at 20% weight — current weather conditions are benign (wind 2.3 km/h, precipitation 0.7 mm). The asset's operational criticality is Medium (contributing 50/100 at 20% weight), as it serves 2,200 customers and has 1 prior failure(s) over its 15-year lifespan.","recommended_action":"Monitor remotely; next scheduled maintenance cycle","history":[{"date":"2025-01-15","risk_score":36.4},{"date":"2025-02-01","risk_score":37.2},{"date":"2025-02-15","risk_score":38.0},{"date":"2025-03-01","risk_score":38.9},{"date":"2025-03-15","risk_score":39.4},{"date":"2025-04-15","risk_score":39.81}]},{"asset_id":"T-043","asset_type":"Transformer","location":"Zone C - Oakridge Substation","criticality":"Medium","risk_score":31.26,"risk_label":"Low","explanation":"Transformer T-043 at Zone C - Oakridge Substation has been assigned a risk score of 31.3 (Low). Sensor analysis (contributing 33.6/100 at 60% weight) flagged: all sensor readings are within safe operating limits. Weather conditions at the region contribute 5.4/100 at 20% weight — current weather conditions are benign (wind 2.3 km/h, precipitation 0.7 mm). The asset's operational criticality is Medium (contributing 50/100 at 20% weight), as it serves 1,500 customers and has 0 prior failure(s) over its 8-year lifespan.","recommended_action":"Monitor remotely; next scheduled maintenance cycle","history":[{"date":"2025-01-15","risk_score":29.8},{"date":"2025-02-01","risk_score":30.5},{"date":"2025-02-15","risk_score":31.0},{"date":"2025-03-01","risk_score":30.2},{"date":"2025-03-15","risk_score":31.4},{"date":"2025-04-15","risk_score":31.26}]},{"asset_id":"T-065","asset_type":"Transformer","location":"Zone D - Southbay Substation","criticality":"Low","risk_score":24.44,"risk_label":"Low","explanation":"Transformer T-065 at Zone D - Southbay Substation has been assigned a risk score of 24.4 (Low). Sensor analysis (contributing 30.6/100 at 60% weight) flagged: all sensor readings are within safe operating limits. Weather conditions at the region contribute 5.4/100 at 20% weight — current weather conditions are benign (wind 2.3 km/h, precipitation 0.7 mm). The asset's operational criticality is Low (contributing 25/100 at 20% weight), as it serves 950 customers and has 0 prior failure(s) over its 6-year lifespan.","recommended_action":"Monitor remotely; next scheduled maintenance cycle","history":[{"date":"2025-01-15","risk_score":23.1},{"date":"2025-02-01","risk_score":23.6},{"date":"2025-02-15","risk_score":24.0},{"date":"2025-03-01","risk_score":23.8},{"date":"2025-03-15","risk_score":24.2},{"date":"2025-04-15","risk_score":24.44}]},{"asset_id":"S-018","asset_type":"Substation","location":"Zone D - Harbor District","criticality":"Low","risk_score":23.17,"risk_label":"Low","explanation":"Substation S-018 at Zone D - Harbor District has been assigned a risk score of 23.2 (Low). Sensor analysis (contributing 28.5/100 at 60% weight) flagged: all sensor readings are within safe operating limits. Weather conditions at the region contribute 5.4/100 at 20% weight — current weather conditions are benign (wind 2.3 km/h, precipitation 0.7 mm). The asset's operational criticality is Low (contributing 25/100 at 20% weight), as it serves 800 customers and has 0 prior failure(s) over its 5-year lifespan.","recommended_action":"Monitor remotely; next scheduled maintenance cycle","history":[{"date":"2025-01-15","risk_score":22.1},{"date":"2025-02-01","risk_score":22.8},{"date":"2025-02-15","risk_score":23.0},{"date":"2025-03-01","risk_score":22.5},{"date":"2025-04-01","risk_score":23.2},{"date":"2025-04-15","risk_score":23.17}]}];

  // ── UTILS ──────────────────────────────────────────────────────────────────
  function esc(str) {
    return String(str)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function labelClass(label) {
    const l = String(label).toLowerCase();
    if (l === 'critical') return 'critical';
    if (l === 'high')     return 'high';
    if (l === 'medium')   return 'medium';
    return 'low';
  }

  // ── SPARKLINE ──────────────────────────────────────────────────────────────
  function buildSparkline(history, cls) {
    if (!history || history.length < 2) return '';
    const scores = history.map(h => h.risk_score);
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    const range = max - min || 1;
    const W = 200, H = 36, pad = 3;
    const pts = scores.map((s, i) => {
      const x = pad + (i / (scores.length - 1)) * (W - pad * 2);
      const y = H - pad - ((s - min) / range) * (H - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
    const first = scores[0].toFixed(1);
    const last  = scores[scores.length - 1].toFixed(1);
    // colour map matching CSS vars
    const colMap = { critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e' };
    const col = colMap[cls] || '#3b82f6';
    return `<div class="sparkline-wrap">
      <div class="detail-section-label">Risk Score Trend</div>
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
        <polyline points="${pts}" fill="none" stroke="${col}" stroke-width="1.8"
                  stroke-linejoin="round" stroke-linecap="round" opacity="0.85"/>
        <circle cx="${(pad).toFixed(1)}" cy="${(H - pad - ((scores[0]-min)/range)*(H-pad*2)).toFixed(1)}"
                r="2.5" fill="${col}" opacity="0.7"/>
        <circle cx="${(pad+(W-pad*2)).toFixed(1)}" cy="${(H - pad - ((scores[scores.length-1]-min)/range)*(H-pad*2)).toFixed(1)}"
                r="2.5" fill="${col}"/>
      </svg>
      <div class="sparkline-label-row">
        <span>${history[0].date} · ${first}</span>
        <span>${history[history.length-1].date} · ${last}</span>
      </div>
    </div>`;
  }

  // ── RENDER ─────────────────────────────────────────────────────────────────
  let _allData = [];

  function render(data) {
    _allData = data;
    applyFilterSort();

    // Stats bar (always from full dataset)
    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    data.forEach(d => {
      const k = d.risk_label;
      if (counts[k] !== undefined) counts[k]++;
      else counts.Low++;
    });
    const total = data.length;
    document.getElementById('stat-total').textContent    = total;
    document.getElementById('stat-critical').textContent = counts.Critical;
    document.getElementById('stat-high').textContent     = counts.High;
    document.getElementById('stat-medium').textContent   = counts.Medium;
    document.getElementById('stat-low').textContent      = counts.Low;

    // Chart (always from full dataset)
    const chartEl = document.getElementById('chart-container');
    const maxCount = Math.max(...Object.values(counts), 1);
    const chartRows = [
      { label: 'Critical', cls: 'critical', count: counts.Critical },
      { label: 'High',     cls: 'high',     count: counts.High },
      { label: 'Medium',   cls: 'medium',   count: counts.Medium },
      { label: 'Low',      cls: 'low',       count: counts.Low },
    ];
    chartEl.innerHTML = chartRows.map(r => {
      const pct = total > 0 ? (r.count / total * 100).toFixed(1) : 0;
      const barW = (r.count / maxCount * 100).toFixed(1);
      return `<div class="chart-row">
        <div class="chart-label ${r.cls}">${r.label}</div>
        <div class="chart-track">
          <div class="chart-fill ${r.cls}" style="width:${barW}%" title="${r.count} asset(s) — ${pct}%"></div>
        </div>
        <div class="chart-count">${r.count}</div>
      </div>`;
    }).join('');

    // Animate chart bars on load
    requestAnimationFrame(() => {
      document.querySelectorAll('.chart-fill').forEach(el => {
        const w = el.style.width;
        el.style.width = '0%';
        requestAnimationFrame(() => { el.style.width = w; });
      });
    });
  }

  // ── CRITICALITY ORDER ──────────────────────────────────────────────────────
  const CRIT_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3 };

  function applyFilterSort() {
    const query   = (document.getElementById('asset-search').value || '').trim().toLowerCase();
    const sortKey = document.getElementById('asset-sort').value;

    let filtered = _allData.filter(a => {
      if (!query) return true;
      return a.asset_id.toLowerCase().includes(query) ||
             a.risk_label.toLowerCase().includes(query) ||
             a.risk_tier && a.risk_tier.toLowerCase().includes(query);
    });

    if (sortKey === 'risk_score') {
      filtered.sort((a, b) => b.risk_score - a.risk_score);
    } else if (sortKey === 'asset_id') {
      filtered.sort((a, b) => a.asset_id.localeCompare(b.asset_id));
    } else if (sortKey === 'criticality') {
      filtered.sort((a, b) => (CRIT_ORDER[a.criticality] ?? 4) - (CRIT_ORDER[b.criticality] ?? 4));
    }

    const noResults = document.getElementById('no-results');
    noResults.style.display = filtered.length === 0 ? 'block' : 'none';

    const grid = document.getElementById('cards-grid');
    grid.innerHTML = filtered.map((asset, idx) => {
      const cls  = labelClass(asset.risk_label);
      const pct  = Math.round(asset.risk_score);
      const spark = buildSparkline(asset.history || [], cls);
      return `
      <div class="asset-card ${cls}" id="card-${idx}" role="button" tabindex="0"
           aria-expanded="false" onclick="toggleCard(${idx})" onkeydown="if(event.key==='Enter'||event.key===' ')toggleCard(${idx})">
        <div class="card-header">
          <div class="card-id-row">
            <div class="card-id">${esc(asset.asset_id)}</div>
            <div class="card-type">${esc(asset.asset_type)}</div>
          </div>
          <div class="risk-badge ${cls}">${esc(asset.risk_label)}</div>
        </div>
        <div class="card-location">${esc(asset.location)}</div>
        <div class="card-score-row">
          <div class="card-score-track">
            <div class="card-score-fill ${cls}" style="width:${pct}%"></div>
          </div>
          <div class="card-score-num">${asset.risk_score.toFixed(1)}</div>
        </div>
        <div class="card-toggle">
          <i class="toggle-arrow">▾</i> Why this matters
        </div>
        <div class="card-detail">
          <div class="card-detail-inner">
            <div>
              <div class="detail-section-label">Risk Analysis</div>
              <div class="detail-explanation">${esc(asset.explanation)}</div>
            </div>
            ${spark}
            <div>
              <div class="detail-section-label">Recommended Action</div>
              <div class="detail-action ${cls}">
                <p>${esc(asset.recommended_action)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    }).join('');
  }

  function toggleCard(idx) {
    const card = document.getElementById('card-' + idx);
    const expanded = card.classList.toggle('expanded');
    card.setAttribute('aria-expanded', expanded);
  }

  // ── SEARCH + SORT WIRING ───────────────────────────────────────────────────
  document.getElementById('asset-search').addEventListener('input', applyFilterSort);
  document.getElementById('asset-sort').addEventListener('change', applyFilterSort);

  // ── FOOTER DATE ────────────────────────────────────────────────────────────
  document.getElementById('footer-date').textContent =
    new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // ── LOAD DATA ──────────────────────────────────────────────────────────────
  (function loadData() {
    // Try relative fetch first (works when served via HTTP/S)
    if (typeof fetch !== 'undefined') {
      fetch('./data/risk_output.json')
        .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(data => render(data))
        .catch(() => render(FALLBACK_DATA));
    } else {
      render(FALLBACK_DATA);
    }
  })();

