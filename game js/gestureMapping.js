// Gesture label -> note name (must match names in notes.js).
// "fist" is intentionally missing: it means stop / no sound.
// "Tilt" = the same finger count with the hand turned sideways (the sharp notes).
export const GESTURE_TO_NOTE = {
  twoFingers: "C",   twoFingersTilt: "C♯",
  threeFingers: "D", threeFingersTilt: "D♯",
  thumbDown: "E",
  fourFingers: "F",  fourFingersTilt: "F♯",
  fiveFingers: "G",  fiveFingersTilt: "G♯",
  oneFinger: "A",    oneFingerTilt: "A♯",
  thumbUp: "B"
};

// Friendly names shown in the "Detected gesture" box.
export const GESTURE_LABELS = {
  twoFingers: "2 fingers",     twoFingersTilt: "2 fingers, tilted",
  threeFingers: "3 fingers",   threeFingersTilt: "3 fingers, tilted",
  thumbDown: "Thumbs down",
  fourFingers: "4 fingers",    fourFingersTilt: "4 fingers, tilted",
  fiveFingers: "5 fingers",    fiveFingersTilt: "5 fingers, tilted",
  oneFinger: "1 finger",       oneFingerTilt: "1 finger, tilted",
  thumbUp: "Thumbs up",
  fist: "Fist (stop)"
};