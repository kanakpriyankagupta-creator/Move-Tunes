// Gesture label -> note name (must match names in notes.js).
// "fist" is intentionally missing: it means stop / no sound.
export const GESTURE_TO_NOTE = {
  oneFinger: "C",
  twoFingers: "D",
  threeFingers: "E",
  fourFingers: "F",
  fiveFingers: "G",
  thumbDown: "A",
  thumbUp: "B",
  loveSign: "C♯",
  rockSign: "D♯",
  okSign: "F♯",
  shakaSign: "G♯",
  thumbIndexMiddle: "A♯"
};

// Friendly names shown in the "Detected gesture" box.
export const GESTURE_LABELS = {
  oneFinger: "Index finger",
  twoFingers: "Two fingers",
  threeFingers: "Three fingers",
  fourFingers: "Four fingers",
  fiveFingers: "Five fingers",
  thumbDown: "Thumbs down",
  thumbUp: "Thumbs up",
  loveSign: "I love you",
  rockSign: "Rock sign",
  okSign: "OK sign",
  shakaSign: "Shaka (thumb + pinky)",
  thumbIndexMiddle: "Thumb + index + middle",
  fist: "Fist (stop)"
};
