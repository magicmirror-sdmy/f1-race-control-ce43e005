import { useCallback, useRef } from "react";

// Audio context for sound effects
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

const playTone = (frequency: number, duration: number, type: OscillatorType = "sine", volume = 0.1) => {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    console.log("Audio not available");
  }
};

export const useGameFeedback = () => {
  const lastSoundRef = useRef<number>(0);

  const triggerHaptic = useCallback((intensity: "light" | "medium" | "heavy" = "medium") => {
    if ("vibrate" in navigator) {
      const duration = intensity === "light" ? 25 : intensity === "medium" ? 50 : 100;
      navigator.vibrate(duration);
    }
  }, []);

  const playSound = useCallback((sound: "brake" | "throttle" | "emergency" | "click" | "startup" | "shutdown") => {
    // Debounce sounds
    const now = Date.now();
    if (now - lastSoundRef.current < 50) return;
    lastSoundRef.current = now;

    switch (sound) {
      case "click":
        playTone(800, 0.05, "square", 0.05);
        break;
      case "startup":
        // Ascending chime
        playTone(400, 0.15, "sine", 0.08);
        setTimeout(() => playTone(600, 0.15, "sine", 0.08), 100);
        setTimeout(() => playTone(800, 0.2, "sine", 0.1), 200);
        break;
      case "shutdown":
        // Descending tone
        playTone(600, 0.15, "sine", 0.08);
        setTimeout(() => playTone(400, 0.2, "sine", 0.06), 100);
        break;
      case "emergency":
        // Alarm-like sound
        playTone(880, 0.1, "square", 0.15);
        setTimeout(() => playTone(440, 0.1, "square", 0.15), 100);
        setTimeout(() => playTone(880, 0.1, "square", 0.15), 200);
        break;
      case "throttle":
        playTone(200, 0.05, "sawtooth", 0.03);
        break;
      case "brake":
        playTone(150, 0.08, "square", 0.05);
        break;
    }
  }, []);

  return { triggerHaptic, playSound };
};