"use client";

import * as React from "react";
import { getBreathPhase, getBreathProgress } from "@/lib/breath-utils";

interface BreathingGuideProps {
  elapsed: number;
  pattern: string;
  isRunning: boolean;
}

export function BreathingGuide({ elapsed, pattern, isRunning }: BreathingGuideProps) {
  const phase = getBreathPhase(elapsed, pattern);
  const progress = getBreathProgress(elapsed, pattern);

  // Calculate scale based on breathing phase
  const getScale = () => {
    if (!isRunning) return 1;

    const label = phase.label.toLowerCase();
    if (label.includes("inhale")) {
      // Expand during inhale
      return 1 + progress * 0.5; // Scale from 1 to 1.5
    } else if (label.includes("exhale")) {
      // Contract during exhale
      return 1.5 - progress * 0.5; // Scale from 1.5 to 1
    } else {
      // Hold - maintain current size
      // Check if we're in the hold after inhale or after exhale
      // This is a simplified version - we'll use the phase index to determine
      return phase.phaseIndex === 1 ? 1.5 : 1;
    }
  };

  const scale = getScale();

  return (
    <div className="relative w-full h-64 flex items-center justify-center">
      {/* Outer ring */}
      <div className="absolute w-48 h-48 rounded-full border-4 border-primary/20" />

      {/* Breathing circle */}
      <div
        className="absolute w-32 h-32 rounded-full bg-gradient-to-br from-primary/40 to-primary/60 backdrop-blur-sm transition-transform duration-1000 ease-in-out flex items-center justify-center shadow-lg"
        style={{
          transform: `scale(${scale})`,
        }}
      >
        <div className="text-center">
          <div className="text-2xl font-semibold text-white drop-shadow-lg">
            {phase.label}
          </div>
          <div className="text-lg text-white/90 drop-shadow">
            {phase.secondsRemaining}s
          </div>
        </div>
      </div>

      {/* Pulsing rings effect */}
      {isRunning && (
        <>
          <div
            className="absolute w-40 h-40 rounded-full border-2 border-primary/30 animate-ping"
            style={{ animationDuration: "3s" }}
          />
          <div
            className="absolute w-36 h-36 rounded-full border border-primary/20 animate-ping"
            style={{ animationDuration: "2s", animationDelay: "0.5s" }}
          />
        </>
      )}
    </div>
  );
}
