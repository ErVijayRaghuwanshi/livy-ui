/**
 * Client-side Haptic & Web Audio Feedback Utilities for Query Execution.
 * Zero external audio assets — uses browser Web Audio API and navigator.vibrate.
 */

let sharedAudioCtx = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioCtx) {
    sharedAudioCtx = new AudioCtx();
  }
  if (sharedAudioCtx.state === "suspended") {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

function playTone(ctx, freq, startOffset, duration, type = "sine", peakGain = 0.06) {
  const now = ctx.currentTime + startOffset;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(peakGain, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.01);
}

/**
 * Triggers haptic vibration and/or subtle Web Audio chime on query completion.
 * @param {"ok" | "error" | "cancelled"} status
 * @param {Object} [settings]
 */
export function triggerQueryFeedback(status, settings = {}) {
  if (status !== "ok" && status !== "error") return;

  const enableHaptics = settings["workbench.hapticFeedback"] !== false;
  const enableSound = settings["workbench.soundFeedback"] !== false;

  if (enableHaptics && typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    try {
      navigator.vibrate(status === "ok" ? [15] : [35, 45, 35]);
    } catch {
      // Ignore vibration errors on unsupported platforms
    }
  }

  if (enableSound) {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (status === "ok") {
        // Subtle ascending two-tone chime (C5 -> E5)
        playTone(ctx, 523.25, 0, 0.09, "sine", 0.055);
        playTone(ctx, 659.25, 0.07, 0.14, "sine", 0.055);
      } else {
        // Distinct low descending two-tone alert (G3 -> D3)
        playTone(ctx, 196.0, 0, 0.11, "triangle", 0.07);
        playTone(ctx, 146.83, 0.09, 0.16, "triangle", 0.07);
      }
    } catch {
      // Ignore audio errors when autoplay/context is blocked
    }
  }
}
