import { useEffect, useRef } from "react";
import { getBreathPhase } from "./breath-utils";

export function useBreathAudio(
  elapsed: number,
  pattern: string,
  isRunning: boolean,
  enabled: boolean = false
) {
  const lastPhaseRef = useRef<string>("");
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    // Initialize AudioContext lazily
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
    }

    return () => {
      // Don't close the audio context on cleanup, just keep it ready
    };
  }, [enabled]);

  useEffect(() => {
    if (!isRunning || !enabled || !audioContextRef.current) return;

    const phase = getBreathPhase(elapsed, pattern);
    const currentPhase = phase.label;

    // Check if phase has changed
    if (lastPhaseRef.current !== currentPhase && lastPhaseRef.current !== "") {
      playTransitionSound(currentPhase.toLowerCase());
    }

    lastPhaseRef.current = currentPhase;
  }, [elapsed, pattern, isRunning, enabled]);

  const playTransitionSound = (phaseName: string) => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;

    // Create oscillator for a simple tone
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Different frequencies for different phases
    let frequency = 440; // Default A4
    if (phaseName.includes("inhale")) {
      frequency = 523.25; // C5 - higher pitch for inhale
    } else if (phaseName.includes("exhale")) {
      frequency = 392.0; // G4 - lower pitch for exhale
    } else if (phaseName.includes("hold")) {
      frequency = 440.0; // A4 - middle pitch for hold
    }

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    // Envelope
    const now = ctx.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.1, now + 0.05); // Attack
    gainNode.gain.linearRampToValueAtTime(0.05, now + 0.1); // Sustain
    gainNode.gain.linearRampToValueAtTime(0, now + 0.2); // Release

    oscillator.start(now);
    oscillator.stop(now + 0.2);
  };
}
