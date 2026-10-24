import { NOTES } from "./notes.js";
import { playNote } from "./audio.js";
import { recordGame, renderProgress } from "./progress.js";

const canvas = document.querySelector("#game-canvas");
const ctx = canvas.getContext("2d");
const scoreText = document.querySelector("#score");
const bestText = document.querySelector("#best");
const timerText = document.querySelector("#timer");
const statusText = document.querySelector("#game-status");
const startButton = document.querySelector("#start-button");
const resultsScreen = document.querySelector("#results-screen");
const resultsTitle = document.querySelector("#results-title");
const resultsMessage = document.querySelector("#results-message");
const finalScore = document.querySelector("#final-score");
const finalTime = document.querySelector("#final-time");
const finalBest = document.querySelector("#final-best");
const WIDTH = canvas.width, HEIGHT = canvas.height, DEAD_LINE = HEIGHT - 62;

// Difficulty grows with elapsed time (seconds).
const BASE_SPEED = 85, SPEED_GAIN = 3.5, MAX_SPEED = 380;
const BASE_INTERVAL = 1.8, INTERVAL_DROP = 0.015, MIN_INTERVAL = 0.5;

let fallingNotes = [], particles = [], rings = [], score = 0, best = Number(localStorage.getItem("noteDropBest") || 0);
let running = false, lastFrame = 0, gameStart = 0, elapsed = 0, spawnTimer = 0, animationFrame = 0;
let bestAtRunStart = best;
bestText.textContent = best;

const fmtTime = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const currentSpeed = () => Math.min(MAX_SPEED, BASE_SPEED + elapsed * SPEED_GAIN);
const currentInterval = () => Math.max(MIN_INTERVAL, BASE_INTERVAL - elapsed * INTERVAL_DROP);

export function startGame() {
  cancelAnimationFrame(animationFrame);
  resultsScreen.hidden = true;
  bestAtRunStart = best;
  fallingNotes = []; particles = []; rings = []; score = 0; elapsed = 0; spawnTimer = 0.5;
  scoreText.textContent = "0"; timerText.textContent = "0:00"; statusText.textContent = "Playing";
  startButton.textContent = "Restart";
  running = true; lastFrame = gameStart = performance.now();
  animationFrame = requestAnimationFrame(update);
}

// Called once each time a new gesture is recognised. Bursts the lowest matching note.
export function handleGesture(noteName) {
  if (!running || !noteName) return;
  let target = -1;
  fallingNotes.forEach((n, i) => {
    if (n.pitch.name === noteName && (target === -1 || n.y > fallingNotes[target].y)) target = i;
  });
  if (target === -1) return;
  const [note] = fallingNotes.splice(target, 1);
  createBurst(note);
  playNote(note.pitch.frequency);
  score++; scoreText.textContent = score;
  if (score > best) {
    best = score; bestText.textContent = best;
    localStorage.setItem("noteDropBest", String(best));
  }
}

function spawnNote() {
  const pitch = NOTES[Math.floor(Math.random() * NOTES.length)];
  fallingNotes.push({ pitch, x: 55 + Math.random() * (WIDTH - 110), y: -38, radius: 27 });
}

function createBurst(note) {
  rings.push({ x: note.x, y: note.y, r: note.radius, life: 0.45, color: note.pitch.color });
  for (let i = 0; i < 26; i++) particles.push({
    x: note.x, y: note.y, vx: (Math.random() - 0.5) * 450,
    vy: (Math.random() - 0.5) * 450, life: 0.55, color: note.pitch.color
  });
}

function update(time) {
  if (!running) return;
  const dt = Math.min((time - lastFrame) / 1000, 0.04); lastFrame = time;
  elapsed = (time - gameStart) / 1000;
  timerText.textContent = fmtTime(elapsed);
  statusText.textContent = `Playing · speed ×${(currentSpeed() / BASE_SPEED).toFixed(1)}`;

  spawnTimer -= dt;
  if (spawnTimer <= 0) { spawnNote(); spawnTimer = currentInterval(); }
  const speed = currentSpeed();
  for (const note of fallingNotes) note.y += speed * dt;
  for (const st of stars) { st.y += st.v * dt * (1 + speed / 200); if (st.y > HEIGHT) { st.y = -2; st.x = Math.random() * WIDTH; } }
  for (let i = rings.length - 1; i >= 0; i--) { const r = rings[i]; r.r += 260 * dt; r.life -= dt; if (r.life <= 0) rings.splice(i, 1); }
  updateComet(dt);
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
    if (p.life <= 0) particles.splice(i, 1);
  }
  if (fallingNotes.some(note => note.y + note.radius >= DEAD_LINE)) {
    draw(); finishGame();
    return;
  }
  draw(); animationFrame = requestAnimationFrame(update);
}

function finishGame() {
  running = false;
  const newPersonalBest = score > bestAtRunStart;
  if (newPersonalBest) {
    best = score;
    bestText.textContent = String(best);
    try { localStorage.setItem("noteDropBest", String(best)); } catch {}

    // DATABASE INTEGRATION (enable once your backend is ready):
    // Send an authenticated user's score only after it beats their saved best.
    // The backend should also compare scores atomically before updating the user's record.
    // Example endpoint/payload; replace with your real URL and auth token handling:
    // fetch("https://your-api.example.com/users/me/best-score", {
    //   method: "PUT",
    //   headers: { "Content-Type": "application/json", "Authorization": `Bearer ${userToken}` },
    //   body: JSON.stringify({ bestScore: score })
    // }).catch(error => console.error("Could not save best score", error));
  }

  statusText.textContent = "Run complete";
  startButton.textContent = "Play again";
  finalScore.textContent = String(score);
  finalTime.textContent = fmtTime(elapsed);
  finalBest.textContent = String(best);
  resultsTitle.textContent = newPersonalBest ? "New personal best!" : "Nice run!";
  resultsMessage.textContent = newPersonalBest
    ? "You set a new high score. Keep that streak going!"
    : "The notes caught up this time. Ready for another run?";
  resultsScreen.hidden = false;
  recordGame(score, elapsed);
  renderProgress();
}

document.querySelector("#results-play-again").addEventListener("click", startGame);

// ---------- space visuals ----------
const stars = Array.from({ length: 110 }, () => ({
  x: Math.random() * WIDTH, y: Math.random() * HEIGHT,
  r: Math.random() * 1.6 + 0.4, v: 6 + Math.random() * 22, phase: Math.random() * 6.28
}));
let comet = null, cometTimer = 3;

// Nebula is painted once to an offscreen canvas for speed.
const nebula = document.createElement("canvas");
nebula.width = WIDTH; nebula.height = HEIGHT;
(() => {
  const n = nebula.getContext("2d");
  const bg = n.createLinearGradient(0, 0, 0, HEIGHT);
  bg.addColorStop(0, "#050620"); bg.addColorStop(1, "#0b0a2e");
  n.fillStyle = bg; n.fillRect(0, 0, WIDTH, HEIGHT);
  const blob = (x, y, r, c) => {
    const g = n.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, c); g.addColorStop(1, "rgba(0,0,0,0)");
    n.fillStyle = g; n.fillRect(0, 0, WIDTH, HEIGHT);
  };
  blob(180, 120, 300, "rgba(110,60,220,0.35)");
  blob(740, 220, 280, "rgba(30,110,230,0.28)");
  blob(450, 430, 330, "rgba(200,60,170,0.20)");
  blob(820, 520, 220, "rgba(60,200,230,0.14)");
})();

function updateComet(dt) {
  cometTimer -= dt;
  if (!comet && cometTimer <= 0) {
    comet = { x: Math.random() * WIDTH * 0.6 + 100, y: -10, vx: 380, vy: 260, life: 1.1 };
    cometTimer = 4 + Math.random() * 6;
  }
  if (comet) { comet.x += comet.vx * dt; comet.y += comet.vy * dt; comet.life -= dt; if (comet.life <= 0) comet = null; }
}

function drawPlanet(note) {
  const { x, y, radius: r, pitch } = note, c = pitch.color;
  const idx = NOTES.indexOf(pitch), ringed = idx % 3 === 0, banded = idx % 3 === 1;
  ctx.save();
  if (ringed) { // back half of the ring
    ctx.strokeStyle = "rgba(255,255,255,0.45)"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.ellipse(x, y, r * 1.75, r * 0.5, -0.35, Math.PI, Math.PI * 2); ctx.stroke();
  }
  ctx.shadowColor = c; ctx.shadowBlur = 26; ctx.fillStyle = c;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
  if (banded) { // gas-giant stripes
    ctx.fillStyle = "rgba(255,255,255,0.16)"; ctx.fillRect(x - r, y - r * 0.5, r * 2, r * 0.28);
    ctx.fillStyle = "rgba(0,0,0,0.18)"; ctx.fillRect(x - r, y + r * 0.1, r * 2, r * 0.3);
  } else if (!ringed) { // craters
    ctx.fillStyle = "rgba(0,0,0,0.16)";
    ctx.beginPath(); ctx.arc(x - r * 0.35, y + r * 0.3, r * 0.22, 0, 6.28); ctx.fill();
    ctx.beginPath(); ctx.arc(x + r * 0.35, y - r * 0.1, r * 0.15, 0, 6.28); ctx.fill();
  }
  const shade = ctx.createRadialGradient(x - r * 0.4, y - r * 0.4, r * 0.1, x + r * 0.2, y + r * 0.2, r * 1.25);
  shade.addColorStop(0, "rgba(255,255,255,0.55)"); shade.addColorStop(0.35, "rgba(255,255,255,0)");
  shade.addColorStop(1, "rgba(3,4,25,0.8)");
  ctx.fillStyle = shade; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
  if (ringed) { // front half of the ring
    ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.ellipse(x, y, r * 1.75, r * 0.5, -0.35, 0, Math.PI); ctx.stroke();
  }
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = "bold 19px system-ui";
  ctx.lineWidth = 4; ctx.strokeStyle = "rgba(5,6,30,0.85)"; ctx.strokeText(pitch.name, x, y + 1);
  ctx.fillStyle = "#fff"; ctx.fillText(pitch.name, x, y + 1);
  ctx.restore();
}

function draw() {
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
  ctx.drawImage(nebula, 0, 0);
  const t = performance.now() / 1000;
  ctx.fillStyle = "#fff";
  for (const st of stars) {
    ctx.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(t * 1.4 + st.phase));
    ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, 6.28); ctx.fill();
  }
  ctx.globalAlpha = 1;
  if (comet) {
    const g = ctx.createLinearGradient(comet.x, comet.y, comet.x - comet.vx * 0.35, comet.y - comet.vy * 0.35);
    g.addColorStop(0, "rgba(255,255,255,0.95)"); g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.strokeStyle = g; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(comet.x, comet.y); ctx.lineTo(comet.x - comet.vx * 0.35, comet.y - comet.vy * 0.35); ctx.stroke();
  }
  // Danger zone: a dark planet horizon with a glowing red edge
  const ground = ctx.createLinearGradient(0, DEAD_LINE, 0, HEIGHT);
  ground.addColorStop(0, "#1a1040"); ground.addColorStop(1, "#05061a");
  ctx.fillStyle = ground; ctx.fillRect(0, DEAD_LINE, WIDTH, HEIGHT - DEAD_LINE);
  ctx.shadowColor = "#ff4f68"; ctx.shadowBlur = 14;
  ctx.strokeStyle = "#ff4f68"; ctx.lineWidth = 3; ctx.setLineDash([14, 9]); ctx.beginPath();
  ctx.moveTo(0, DEAD_LINE); ctx.lineTo(WIDTH, DEAD_LINE); ctx.stroke(); ctx.setLineDash([]); ctx.shadowBlur = 0;
  ctx.fillStyle = "#ff8293"; ctx.font = "bold 13px system-ui"; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  ctx.fillText("EVENT HORIZON — don't let planets cross", 15, DEAD_LINE + 23);

  for (const note of fallingNotes) drawPlanet(note);

  ctx.globalCompositeOperation = "lighter";
  for (const r of rings) {
    ctx.globalAlpha = Math.max(0, r.life / 0.45); ctx.strokeStyle = r.color; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, 6.28); ctx.stroke();
  }
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life / 0.55); ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, 6.28); ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
}

// Start button is wired in main.js.
renderProgress();
draw();
