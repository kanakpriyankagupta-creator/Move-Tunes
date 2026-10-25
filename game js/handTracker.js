
const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

const SOURCES = [
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32",
  "https://unpkg.com/@mediapipe/tasks-vision@0.10.32"
];

// MediaPipe is loaded here (not at the top of the file) so this file itself always loads,
// and a network problem produces a clear message. Two CDNs are tried in turn.
async function loadMediaPipe() {
  for (const base of SOURCES) {
    try { return { mod: await import(`${base}/vision_bundle.mjs`), wasm: `${base}/wasm` }; }
    catch (e) { console.warn("MediaPipe load failed from", base, e); }
  }
  throw new Error("Could not download MediaPipe (tried jsDelivr and unpkg). Check your internet connection, VPN, firewall or ad-blocker.");
}
const STABLE_FRAMES = 3;   // a pose must last this many frames before it counts (filters flicker)

// Classifies one hand (21 MediaPipe landmarks, already in pixel units) into a gesture label.
// Works for left or right hand and any hand rotation, except thumbs up/down which use screen "up/down".
const d = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// Adds the "Tilt" suffix when the hand is rotated ~90° anticlockwise.
// Returns null in the in-between angles so a half-rotated hand doesn't flicker between notes.
const withTilt = (base, upright, tilted) =>
  !base ? null : upright ? base : tilted ? base + "Tilt" : null;

function recognizeGesture(p) {
  const palm = d(p[0], p[9]) || 1;                       // wrist -> middle knuckle = hand size

  // A finger is "up" when its tip is clearly farther from the wrist than its middle joint.
  const up = (tip, pip) => d(p[0], p[tip]) > d(p[0], p[pip]) * 1.1;
  const index = up(8, 6), middle = up(12, 10), ring = up(16, 14), pinky = up(20, 18);

  const thumb = d(p[4], p[5]) / palm > 0.55 && d(p[4], p[17]) > d(p[3], p[17]);
  const thumbDy = (p[4].y - p[2].y) / palm;              // negative = pointing up on screen
  const count = [index, middle, ring, pinky].filter(Boolean).length;

  // Hand direction: 0° = fingers up, +90° = fingers pointing to the LEFT of the mirrored screen
  // (i.e. hand rotated anticlockwise from your point of view).
  const angle = Math.atan2(p[9].x - p[0].x, -(p[9].y - p[0].y)) * 180 / Math.PI;
  const upright = Math.abs(angle) < 40;
  const tilted = angle > 50 && angle < 130;

  if (!thumb) {
    if (count === 0) return "fist";
    let base = null;
    if (index && !middle && !ring && !pinky) base = "oneFinger";
    else if (index && middle && !ring && !pinky) base = "twoFingers";
    else if (index && middle && ring && !pinky) base = "threeFingers";
    else if (count === 4) base = "fourFingers";
    return withTilt(base, upright, tilted);
  }

  if (count === 4) return withTilt("fiveFingers", upright, tilted);
  if (count === 0) {
    if (thumbDy < -0.45) return "thumbUp";
    if (thumbDy > 0.45) return "thumbDown";
  }
  return null;
}

let landmarker, cameraStream, detectionLoop = 0, lastVideoTime = -1;
let candidate = null, candidateCount = 0, stable = null;

export async function startHandTracking(video, onGesture, onStatus) {
  onStatus("Loading hand tracking…");
  const { mod, wasm } = await loadMediaPipe();
  try {
    const vision = await mod.FilesetResolver.forVisionTasks(wasm);
    landmarker = await mod.HandLandmarker.createFromOptions(vision, {
      baseOptions: { modelAssetPath: MODEL_URL },
      runningMode: "VIDEO", numHands: 1,
      minHandDetectionConfidence: 0.55,
      minHandPresenceConfidence: 0.55,
      minTrackingConfidence: 0.5
    });
  } catch (e) {
    console.error(e);
    throw new Error("MediaPipe loaded, but the hand model could not be downloaded (storage.googleapis.com may be blocked). " + (e?.message || ""));
  }
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
  } catch (e) {
    landmarker?.close(); landmarker = null;
    const reason = e?.name === "NotAllowedError" ? "Camera permission was denied — allow it in the address bar."
      : e?.name === "NotFoundError" ? "No camera was found."
      : e?.name === "NotReadableError" ? "The camera is being used by another app." : (e?.message || e);
    throw new Error(reason);
  }
  video.srcObject = cameraStream;
  await video.play();
  onStatus("Camera on — show your hand");
  candidate = null; candidateCount = 0; stable = null;

  const detect = () => {
    if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {
      const result = landmarker.detectForVideo(video, performance.now());
      const raw = result.landmarks?.[0];
      // Convert to pixel units so distances are not squashed by the 4:3 video shape.
      const points = raw?.map(pt => ({ x: pt.x * video.videoWidth, y: pt.y * video.videoHeight }));
      const gesture = points ? recognizeGesture(points) : null;

      if (gesture === candidate) candidateCount++;
      else { candidate = gesture; candidateCount = 1; }
      // Fire once each time a new stable pose appears. Relax (or make a fist) to re-arm the same pose.
      if (candidateCount >= STABLE_FRAMES && candidate !== stable) {
        stable = candidate;
        onGesture(stable);
      }
      lastVideoTime = video.currentTime;
    }
    detectionLoop = requestAnimationFrame(detect);
  };
  detect();
}

export function stopHandTracking(video) {
  cancelAnimationFrame(detectionLoop);
  cameraStream?.getTracks().forEach(track => track.stop());
  cameraStream = null;
  candidate = null; candidateCount = 0; stable = null; lastVideoTime = -1;
  video.srcObject = null;
  landmarker?.close(); landmarker = null;
}
