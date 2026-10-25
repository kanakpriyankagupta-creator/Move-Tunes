// Gesture label -> note name (must match names in notes.js).
// "fist" is intentionally missing: it means stop / no sound.
// "...Tilt" = same pose, hand rotated 90° anticlockwise -> sharp note.
export const GESTURE_TO_NOTE = {
  oneFinger: "C",
  twoFingers: "D",
  threeFingers: "F",
  fourFingers: "G",
  fiveFingers: "A",
  thumbUp: "B",
  thumbDown: "E",

  oneFingerTilt: "C♯",
  twoFingersTilt: "D♯",
  threeFingersTilt: "F♯",
  fourFingersTilt: "G♯",
  fiveFingersTilt: "A♯"
};

export const GESTURE_LABELS = {
  oneFinger: "Index finger",
  twoFingers: "Two fingers",
  threeFingers: "Three fingers",
  fourFingers: "Four fingers",
  fiveFingers: "Five fingers",
  thumbUp: "Thumbs up",
  thumbDown: "Thumbs down",
  oneFingerTilt: "Index finger (tilted)",
  twoFingersTilt: "Two fingers (tilted)",
  threeFingersTilt: "Three fingers (tilted)",
  fourFingersTilt: "Four fingers (tilted)",
  fiveFingersTilt: "Five fingers (tilted)",
  fist: "Fist (stop)"
};