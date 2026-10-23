import { FilesetResolver, HandLandmarker } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22";

const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm";
let landmarker, cameraStream, detectionLoop = 0, lastVideoTime = -1;
let previousGesture = null;

export async function startHandTracking(video, onGesture, onStatus) {
  onStatus("Loading hand tracking…");
  const vision = await FilesetResolver.forVisionTasks(WASM_URL);
  landmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: MODEL_URL },
    runningMode: "VIDEO", numHands: 1,
    minHandDetectionConfidence: 0.55,
    minHandPresenceConfidence: 0.55,
    minTrackingConfidence: 0.5
  });
  cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
  video.srcObject = cameraStream;
  await video.play();
  onStatus("Camera on — show your hand");
  const detect = () => {
    if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {
      const result = landmarker.detectForVideo(video, performance.now());
      const landmarks = result.landmarks?.[0];
      const gesture = landmarks ? recognizeDemoGesture(landmarks) : null;
      // Fire once when a pose appears; the player must relax their hand before
      // showing the same pose again, so a held finger does not blast repeatedly.
      if (gesture !== previousGesture) onGesture(gesture);
      previousGesture = gesture;
      lastVideoTime = video.currentTime;
    }
    detectionLoop = requestAnimationFrame(detect);
  };
  detect();
}

// The first demo gesture is index finger up with the other three fingers curled.
// Your complete mapping can be added in gestureMapping.js once you share it.
function recognizeDemoGesture(points) {
  const extended = [8, 12, 16, 20].map((tip, i) => points[tip].y < points[[6, 10, 14, 18][i]].y);
  const indexOnly = extended[0] && !extended[1] && !extended[2] && !extended[3];
  return indexOnly ? "oneFinger" : null;
}

export function stopHandTracking(video) {
  cancelAnimationFrame(detectionLoop);
  cameraStream?.getTracks().forEach(track => track.stop());
  cameraStream = null;
  previousGesture = null;
  video.srcObject = null;
  landmarker?.close(); landmarker = null;
}
