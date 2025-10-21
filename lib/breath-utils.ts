export const BREATH_PATTERN = [
  { label: "Inhale", seconds: 4 },
  { label: "Hold", seconds: 4 },
  { label: "Exhale", seconds: 6 },
] as const;

export const BREATH_CYCLE_DURATION = BREATH_PATTERN.reduce(
  (total, phase) => total + phase.seconds,
  0,
);

export const BREATH_PRESETS = [
  { label: "1 minute", value: 60 },
  { label: "2 minutes", value: 120 },
] as const;

export const getBreathPhase = (elapsedSeconds: number) => {
  if (elapsedSeconds === 0) {
    return {
      label: BREATH_PATTERN[0].label,
      secondsRemaining: BREATH_PATTERN[0].seconds,
      secondsInPhase: 0,
    };
  }

  const position = elapsedSeconds % BREATH_CYCLE_DURATION;
  let accumulated = 0;

  for (const phase of BREATH_PATTERN) {
    const phaseEnd = accumulated + phase.seconds;
    if (position < phaseEnd) {
      return {
        label: phase.label,
        secondsRemaining: Math.max(
          phase.seconds - Math.floor(position - accumulated),
          1,
        ),
        secondsInPhase: Math.floor(position - accumulated),
      };
    }
    accumulated = phaseEnd;
  }

  return {
    label: BREATH_PATTERN[0].label,
    secondsRemaining: BREATH_PATTERN[0].seconds,
    secondsInPhase: 0,
  };
};
