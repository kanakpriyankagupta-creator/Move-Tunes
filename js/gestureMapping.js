// Gesture label -> note name (must match names in notes.js).
// "fist" is intentionally missing: it means stop / no sound.
// "...Tilted" = same finger count, hand rotated 90° anticlockwise -> sharp note.
export const GESTURE_TO_NOTE = {
  // Natural notes
  oneFinger: "C",
  twoFingers: "D",
  threeFingers: "F",
  fourFingers: "G",
  fiveFingers: "A",
  thumbUp: "B",
  thumbDown: "E",

  // Sharp notes (90° anticlockwise tilt)
  oneFingerTilted: "C♯",
  twoFingersTilted: "D♯",
  threeFingersTilted: "F♯",
  fourFingersTilted: "G♯",
  fiveFingersTilted: "A♯"
};

// Friendly names shown in the "Detected gesture" box.
export const GESTURE_LABELS = {
  oneFinger: "Index finger",
  twoFingers: "Two fingers",
  threeFingers: "Three fingers",
  fourFingers: "Four fingers",
  fiveFingers: "Five fingers",
  thumbUp: "Thumbs up",
  thumbDown: "Thumbs down",

  oneFingerTilted: "Index finger (tilted 90° left)",
  twoFingersTilted: "Two fingers (tilted 90° left)",
  threeFingersTilted: "Three fingers (tilted 90° left)",
  fourFingersTilted: "Four fingers (tilted 90° left)",
  fiveFingersTilted: "Five fingers (tilted 90° left)",

  fist: "Fist (stop)"
};
