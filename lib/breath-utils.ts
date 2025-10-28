/**
 * Represents a single phase in a breathing pattern
 */
export interface BreathPhase {
  /** Display label for the phase (e.g., "Inhale", "Hold", "Exhale") */
  label: string;
  /** Duration of the phase in seconds */
  seconds: number;
}

/**
 * Complete breathing pattern configuration
 */
export interface BreathPattern {
  /** Display name of the pattern */
  name: string;
  /** Description of the pattern's purpose and benefits */
  description: string;
  /** Array of phases that make up one complete breathing cycle */
  pattern: BreathPhase[];
}

/**
 * Available breathing patterns with their configurations
 * Each pattern is designed for a specific purpose (relaxation, sleep, focus, energy)
 * @constant
 */
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

/**
 * Default breathing pattern for backwards compatibility
 * @deprecated Use BREATH_PATTERNS directly instead
 */
export const BREATH_PATTERN = BREATH_PATTERNS["4-4-6"].pattern;

/**
 * Calculates the total duration of one complete breathing cycle
 * @param patternKey - Key identifying the breathing pattern (e.g., "4-4-6", "box")
 * @returns Total duration in seconds for one complete cycle
 * @example
 * getBreathCycleDuration("4-4-6") // Returns 14 (4+4+6)
 * getBreathCycleDuration("box") // Returns 16 (4+4+4+4)
 */
export const getBreathCycleDuration = (patternKey: string = "4-4-6"): number => {
  const pattern = BREATH_PATTERNS[patternKey]?.pattern || BREATH_PATTERN;
  return pattern.reduce((total, phase) => total + phase.seconds, 0);
};

/**
 * Duration of the default breathing cycle in seconds
 * @constant
 */
export const BREATH_CYCLE_DURATION = getBreathCycleDuration();

/**
 * Preset durations for breathing sessions
 * @constant
 */
export const BREATH_PRESETS = [
  { label: "1 minute", value: 60 },
  { label: "2 minutes", value: 120 },
  { label: "5 minutes", value: 300 },
  { label: "10 minutes", value: 600 },
  { label: "15 minutes", value: 900 },
] as const;

/**
 * Determines the current breathing phase based on elapsed time
 * Handles cycling through multiple complete breathing cycles
 *
 * @param elapsedSeconds - Number of seconds elapsed since the session started
 * @param patternKey - Key identifying the breathing pattern to use
 * @returns Object containing current phase information
 * @returns returns.label - Name of the current phase
 * @returns returns.secondsRemaining - Seconds left in the current phase
 * @returns returns.secondsInPhase - Seconds elapsed in the current phase
 * @returns returns.phaseIndex - Index of the current phase in the pattern
 *
 * @example
 * // At 2 seconds into a 4-4-6 pattern (during inhale)
 * getBreathPhase(2, "4-4-6")
 * // Returns: { label: "Inhale", secondsRemaining: 2, secondsInPhase: 2, phaseIndex: 0 }
 */
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

/**
 * Calculates the progress through the current breathing phase as a percentage
 * Used for animating visual indicators during breathing exercises
 *
 * @param elapsedSeconds - Number of seconds elapsed since the session started
 * @param patternKey - Key identifying the breathing pattern to use
 * @returns Progress value between 0 and 1 (0% to 100%)
 *
 * @example
 * // 2 seconds into a 4-second inhale phase
 * getBreathProgress(2, "4-4-6") // Returns 0.5 (50%)
 *
 * @example
 * // At the start of a phase
 * getBreathProgress(0, "4-4-6") // Returns 0 (0%)
 */
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
