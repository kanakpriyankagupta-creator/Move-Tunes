import { startHandTracking, stopHandTracking } from "./handTracker.js";
import { GESTURE_TO_NOTE } from "./gestureMapping.js";
import { handleGesture } from "./game.js";

const video = document.querySelector("#camera-video");
const cameraButton = document.querySelector("#camera-button");
const placeholder = document.querySelector("#camera-placeholder");
const cameraStatus = document.querySelector("#gesture-status");
const detectedText = document.querySelector("#detected-gesture");
let cameraOn = false;

cameraButton.addEventListener("click", async () => {
  if (cameraOn) {
    stopHandTracking(video); cameraOn = false;
    video.style.display = "none"; placeholder.style.display = "grid";
    cameraButton.textContent = "Enable camera"; cameraStatus.textContent = "Camera is off";
    detectedText.textContent = "None";
    return;
  }
  cameraButton.disabled = true;
  try {
    await startHandTracking(video, gesture => {
      const label = gesture || "None";
      detectedText.textContent = label;
      const noteName = gesture ? GESTURE_TO_NOTE[gesture] : null;
      if (noteName) handleGesture(noteName);
    }, status => { cameraStatus.textContent = status; });
    cameraOn = true; video.style.display = "block"; placeholder.style.display = "none";
    cameraButton.textContent = "Turn camera off";
  } catch (error) {
    console.error(error);
    cameraStatus.textContent = "Could not start camera";
    alert("Could not start MediaPipe or the camera. Check camera permission and make sure the page is running through Live Server.");
  } finally {
    cameraButton.disabled = false;
  }
});
