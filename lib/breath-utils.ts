export interface BreathPhase {
  label: string;
  seconds: number;
}

export interface BreathPattern {
  name: string;
  description: string;
  pattern: BreathPhase[];
}

export const BREATH_PATTERNS: Record<string, BreathPattern> = {
  "4-4-6": {
    name: "Relaxation (4-4-6)",
    description: "Balanced breathing for relaxation",
    pattern: [
      { label: "Inhale", seconds: 4 },
      { label: "Hold", seconds: 4 },
      { label: "Exhale", seconds: 6 },
    ],
  },
  "4-7-8": {
    name: "Sleep (4-7-8)",
    description: "Deep relaxation for better sleep",
    pattern: [
      { label: "Inhale", seconds: 4 },
      { label: "Hold", seconds: 7 },
      { label: "Exhale", seconds: 8 },
    ],
  },
  "box": {
    name: "Box Breathing",
    description: "Equal timing for focus and calm",
    pattern: [
      { label: "Inhale", seconds: 4 },
      { label: "Hold", seconds: 4 },
      { label: "Exhale", seconds: 4 },
      { label: "Hold", seconds: 4 },
    ],
  },
  "4-2": {
    name: "Energizing (4-2)",
    description: "Quick breathing for energy",
    pattern: [
      { label: "Inhale", seconds: 4 },
      { label: "Exhale", seconds: 2 },
    ],
  },
};

// Default pattern for backwards compatibility
export const BREATH_PATTERN = BREATH_PATTERNS["4-4-6"].pattern;

export const getBreathCycleDuration = (patternKey: string = "4-4-6"): number => {
  const pattern = BREATH_PATTERNS[patternKey]?.pattern || BREATH_PATTERN;
  return pattern.reduce((total, phase) => total + phase.seconds, 0);
};

export const BREATH_CYCLE_DURATION = getBreathCycleDuration();

export const BREATH_PRESETS = [
  { label: "1 minute", value: 60 },
  { label: "2 minutes", value: 120 },
  { label: "5 minutes", value: 300 },
  { label: "10 minutes", value: 600 },
  { label: "15 minutes", value: 900 },
] as const;

export const getBreathPhase = (
  elapsedSeconds: number,
  patternKey: string = "4-4-6"
) => {
  const pattern = BREATH_PATTERNS[patternKey]?.pattern || BREATH_PATTERN;
  const cycleDuration = pattern.reduce((total, phase) => total + phase.seconds, 0);

  if (elapsedSeconds === 0) {
    return {
      label: pattern[0].label,
      secondsRemaining: pattern[0].seconds,
      secondsInPhase: 0,
      phaseIndex: 0,
    };
  }

  const position = elapsedSeconds % cycleDuration;
  let accumulated = 0;

  for (let i = 0; i < pattern.length; i++) {
    const phase = pattern[i];
    const phaseEnd = accumulated + phase.seconds;
    if (position < phaseEnd) {
      return {
        label: phase.label,
        secondsRemaining: Math.max(
          phase.seconds - Math.floor(position - accumulated),
          1,
        ),
        secondsInPhase: Math.floor(position - accumulated),
        phaseIndex: i,
      };
    }
    accumulated = phaseEnd;
  }

  return {
    label: pattern[0].label,
    secondsRemaining: pattern[0].seconds,
    secondsInPhase: 0,
    phaseIndex: 0,
  };
};

export const getBreathProgress = (
  elapsedSeconds: number,
  patternKey: string = "4-4-6"
): number => {
  const phase = getBreathPhase(elapsedSeconds, patternKey);
  const pattern = BREATH_PATTERNS[patternKey]?.pattern || BREATH_PATTERN;
  const currentPhase = pattern[phase.phaseIndex];

  if (!currentPhase) return 0;

  return phase.secondsInPhase / currentPhase.seconds;
};
