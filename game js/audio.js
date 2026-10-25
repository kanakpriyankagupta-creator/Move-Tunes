let audioContext;

export async function playNote(frequency) {
  audioContext ??= new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === "suspended") await audioContext.resume();

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.22, audioContext.currentTime + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.55);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.57);
}
