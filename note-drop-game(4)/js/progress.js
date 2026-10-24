// Daily progress stored in localStorage: { "2026-10-24": { games, best, total, bestTime } }
const KEY = "noteDropDaily";
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const dayKey = (date = new Date()) => date.toLocaleDateString("en-CA");   // YYYY-MM-DD, local time

export function recordGame(score, seconds) {
  const data = load(), key = dayKey();
  const day = data[key] || { games: 0, best: 0, total: 0, bestTime: 0 };
  day.games++; day.total += score;
  day.best = Math.max(day.best, score);
  day.bestTime = Math.max(day.bestTime, Math.round(seconds));
  data[key] = day;
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
}

const pct = (now, before) => before == null ? null : before === 0 ? (now > 0 ? 100 : 0) : Math.round((now - before) / before * 100);
const badge = change => {
  if (change == null) return `<span class="badge">first day</span>`;
  if (change > 0) return `<span class="badge up">▲ ${change}%</span>`;
  if (change < 0) return `<span class="badge down">▼ ${Math.abs(change)}%</span>`;
  return `<span class="badge">same</span>`;
};
const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export function renderProgress() {
  const el = document.querySelector("#progress");
  document.querySelector("#progress-date").textContent = new Date().toLocaleDateString(undefined, { day: "numeric", month: "short" });
  const data = load(), today = dayKey();
  const t = data[today] || { games: 0, best: 0, total: 0, bestTime: 0 };
  const prevKey = Object.keys(data).filter(k => k < today).sort().pop();
  const p = prevKey ? data[prevKey] : null;

  const avg = t.games ? Math.round(t.total / t.games) : 0;
  const pAvg = p && p.games ? Math.round(p.total / p.games) : null;

  const days = [...Array(7)].map((_, i) => {
    const k = dayKey(new Date(Date.now() - (6 - i) * 864e5));
    return { k, best: data[k]?.best || 0 };
  });
  const max = Math.max(1, ...days.map(d => d.best));

  el.innerHTML = `
    <div class="prow"><span>Best score today</span><span><b>${t.best}</b>${badge(p ? pct(t.best, p.best) : null)}</span></div>
    <div class="prow"><span>Average per game</span><span><b>${avg}</b>${badge(pct(avg, pAvg))}</span></div>
    <div class="prow"><span>Longest survival</span><span><b>${fmt(t.bestTime)}</b></span></div>
    <div class="prow"><span>Games today</span><span><b>${t.games}</b></span></div>
    <div class="prow"><span>Previous day (${prevKey || "—"})</span><span><b>${p ? p.best : "—"}</b> best</span></div>
    <div class="bars">${days.map(d => `<div class="${d.k === today ? "today" : ""}" style="height:${d.best / max * 100}%" title="${d.k}: ${d.best}"></div>`).join("")}</div>
    <div class="bar-labels">${days.map(d => `<span>${d.k.slice(8)}</span>`).join("")}</div>`;
}
