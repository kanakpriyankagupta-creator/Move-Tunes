NOTE DROP — HOW TO RUN

Files are separated by job:
- index.html: page structure
- css/style.css: appearance
- js/game.js: falling notes, score, danger line, blasting
- js/handTracker.js: webcam and MediaPipe hand landmark detection
- js/gestureMapping.js: gesture name to musical note mapping
- js/notes.js: note names, colors, and sound frequencies
- js/audio.js: generated note sounds
- js/main.js: connects the camera, mapping, and game

Run it:
1. Open this note-drop-game folder in VS Code.
2. Install the Live Server extension if it is not installed.
3. Right-click index.html and choose "Open with Live Server".
4. Click Start game, then Enable camera, and allow camera access.
5. Raise only your index finger. The demo recognizes that as oneFinger,
   plays a C sound, and removes the lowest C circle on screen.

The MediaPipe JavaScript package, WASM files, and hand model are loaded from
Google's documented MediaPipe web resources and require an internet connection.
The initial mapping is only a demo. To map the other notes, edit
js/gestureMapping.js and js/handTracker.js after deciding the exact poses.
