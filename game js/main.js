// Buttons are wired first, and every other module is loaded lazily inside try/catch.
// If a file is missing or a CDN is blocked, the page shows the reason instead of going dead.
const video = document.querySelector("#camera-video");
const cameraButton = document.querySelector("#camera-button");
const startButton = document.querySelector("#start-button");
const placeholder = document.querySelector("#camera-placeholder");
const cameraStatus = document.querySelector("#gesture-status");
const gameStatus = document.querySelector("#game-status");
const detectedText = document.querySelector("#detected-gesture");
let cameraOn = false, game = null;

function showError(where, error) {
  console.error(where, error);
  gameStatus.textContent = `Error loading ${where} — press F12 and check the Console`;
  gameStatus.style.color = "#ff8293";
}

async function loadGame() {
  game ??= await import("./game.js");
  return game;
}

// Load the game right away so the canvas and progress panel render.
loadGame().catch(e => showError("game.js (or a file it imports)", e));

startButton.addEventListener("click", async () => {
  try { (await loadGame()).startGame(); gameStatus.style.color = ""; }
  catch (e) { showError("game.js (or a file it imports)", e); }
});

cameraButton.addEventListener("click", async () => {
  if (cameraOn) {
    const { stopHandTracking } = await import("./handTracker.js");
    stopHandTracking(video); cameraOn = false;
    video.style.display = "none"; placeholder.style.display = "grid";
    cameraButton.textContent = "Enable camera"; cameraStatus.textContent = "Camera is off";
    detectedText.textContent = "None";
    return;
  }
  cameraButton.disabled = true;
  cameraStatus.textContent = "Starting…";
  try {
    const { startHandTracking } = await import("./handTracker.js");
    const mapping = await import("./gestureMapping.js");
    const g = await loadGame();
    await startHandTracking(video, gesture => {
      detectedText.textContent = gesture ? (mapping.GESTURE_LABELS?.[gesture] || gesture) : "None";
      const noteName = gesture ? mapping.GESTURE_TO_NOTE[gesture] : null;   // fist -> no sound
      if (noteName) g.handleGesture(noteName);
    }, status => { cameraStatus.textContent = status; });
    cameraOn = true; video.style.display = "block"; placeholder.style.display = "none";
    cameraButton.textContent = "Turn camera off";
  } catch (error) {
    console.error(error);
    cameraStatus.textContent = "Could not start camera";
    const msg = String(error?.message || error);
    const hint = msg.includes("dynamically imported module")
      ? "\n\nThe browser could not load that file. Make sure it exists in the js folder with exactly that name (capital T in handTracker.js), then restart Live Server and hard-refresh (Ctrl+Shift+R)."
      : "";
    alert("Could not start the camera.\n\n" + msg + hint);
  } finally {
    cameraButton.disabled = false;
  }
});
