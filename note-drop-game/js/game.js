import { NOTES } from "./notes.js";
import { playNote } from "./audio.js";

const canvas = document.querySelector("#game-canvas");
const ctx = canvas.getContext("2d");
const scoreText = document.querySelector("#score");
const bestText = document.querySelector("#best");
const statusText = document.querySelector("#game-status");
const startButton = document.querySelector("#start-button");
const WIDTH = canvas.width, HEIGHT = canvas.height, DEAD_LINE = HEIGHT - 62;
let fallingNotes = [], particles = [], score = 0, best = Number(localStorage.getItem("noteDropBest") || 0);
let running = false, lastFrame = 0, spawnTimer = 0, spawnInterval = 1.15;
let animationFrame = 0, lastGestureAt = 0;
bestText.textContent = best;

export function startGame() {
  cancelAnimationFrame(animationFrame);
  fallingNotes = []; particles = []; score = 0; spawnTimer = 0.35; spawnInterval = 1.15;
  scoreText.textContent = "0"; statusText.textContent = "Playing";
  running = true; lastFrame = performance.now();
  animationFrame = requestAnimationFrame(update);
}

export function handleGesture(noteName) {
  if (!running || !noteName) return;
  // Prevent the same held pose from firing repeatedly. A short cooldown allows repeated poses.
  const now = performance.now();
  if (now - lastGestureAt < 650) return;
  const targetIndex = fallingNotes
    .map((note, index) => ({ note, index }))
    .filter(item => item.note.pitch.name === noteName)
    .sort((a, b) => b.note.y - a.note.y)[0]?.index;
  if (targetIndex === undefined) return;
  lastGestureAt = now;
  const [note] = fallingNotes.splice(targetIndex, 1);
  createBurst(note);
  playNote(note.pitch.frequency);
  score++; scoreText.textContent = score;
  if (score > best) {
    best = score; bestText.textContent = best;
    localStorage.setItem("noteDropBest", String(best));
  }
  if (score % 6 === 0) spawnInterval = Math.max(0.48, spawnInterval - 0.07);
}

function spawnNote() {
  const pitch = NOTES[Math.floor(Math.random() * NOTES.length)];
  fallingNotes.push({ pitch, x: 55 + Math.random() * (WIDTH - 110), y: -38, radius: 27, speed: 105 + Math.min(score * 2, 120) });
}

function createBurst(note) {
  for (let i = 0; i < 18; i++) particles.push({
    x: note.x, y: note.y, vx: (Math.random() - 0.5) * 350,
    vy: (Math.random() - 0.5) * 350, life: 0.5, color: note.pitch.color
  });
}

function update(time) {
  if (!running) return;
  const dt = Math.min((time - lastFrame) / 1000, 0.04); lastFrame = time;
  spawnTimer -= dt;
  if (spawnTimer <= 0) { spawnNote(); spawnTimer = spawnInterval; }
  for (const note of fallingNotes) note.y += note.speed * dt;
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
    if (p.life <= 0) particles.splice(i, 1);
  }
  if (fallingNotes.some(note => note.y + note.radius >= DEAD_LINE)) {
    draw(); running = false; statusText.textContent = "Game over"; startButton.textContent = "Play again";
    return;
  }
  draw(); animationFrame = requestAnimationFrame(update);
}

function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  for (let i = 0; i < 45; i++) {
    ctx.globalAlpha = 0.12 + (i % 3) * 0.04; ctx.fillStyle = "#fff";
    ctx.fillRect((i * 193 + 31) % WIDTH, (i * 97 + 19) % HEIGHT, 2, 2);
  }
  ctx.globalAlpha = 1; ctx.fillStyle = "#202946"; ctx.fillRect(0, DEAD_LINE, WIDTH, HEIGHT - DEAD_LINE);
  ctx.strokeStyle = "#ff4f68"; ctx.lineWidth = 4; ctx.setLineDash([12, 9]); ctx.beginPath();
  ctx.moveTo(0, DEAD_LINE); ctx.lineTo(WIDTH, DEAD_LINE); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = "#ff8293"; ctx.font = "bold 13px system-ui"; ctx.fillText("DANGER LINE", 15, DEAD_LINE + 23);
  for (const note of fallingNotes) {
    ctx.shadowColor = note.pitch.color; ctx.shadowBlur = 20; ctx.fillStyle = note.pitch.color;
    ctx.beginPath(); ctx.arc(note.x, note.y, note.radius, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = "#111629"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = "bold 19px system-ui"; ctx.fillText(note.pitch.name, note.x, note.y);
  }
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life / 0.5); ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

startButton.addEventListener("click", startGame);
draw();
