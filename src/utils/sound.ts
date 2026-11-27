// Gentle Web Audio API sound effects tailored for seniors (no harsh buzzers)

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.14,
  delay = 0
) {
  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration + 0.02);
}

export const soundFX = {
  tap(enabled: boolean) {
    if (!enabled) return;
    playTone(523.25, 0.09, 'triangle', 0.1);
  },

  match(enabled: boolean) {
    if (!enabled) return;
    playTone(523.25, 0.14, 'sine', 0.14, 0);
    playTone(659.25, 0.18, 'sine', 0.14, 0.08);
    playTone(783.99, 0.24, 'sine', 0.12, 0.16);
  },

  gentleWrong(enabled: boolean) {
    if (!enabled) return;
    playTone(261.63, 0.16, 'sine', 0.09, 0);
    playTone(220.0, 0.2, 'sine', 0.08, 0.1);
  },

  scaleStep(enabled: boolean, step: number) {
    if (!enabled) return;
    // Pentatonic-friendly warm scale (C, D, E, G, A, C2, D2, E2...)
    const pentatonic = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0];
    const freq = pentatonic[(step - 1) % pentatonic.length];
    playTone(freq, 0.16, 'triangle', 0.12);
  },

  hint(enabled: boolean) {
    if (!enabled) return;
    playTone(587.33, 0.12, 'sine', 0.1, 0);
    playTone(880.0, 0.2, 'sine', 0.1, 0.09);
  },

  win(enabled: boolean) {
    if (!enabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      playTone(n, 0.28, 'triangle', 0.14, idx * 0.11);
    });
  },
};
