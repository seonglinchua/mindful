import {
  BREATH_PATTERNS,
  BREATH_PRESETS,
  getBreathCycleDuration,
  getBreathPhase,
  getBreathProgress,
} from '../breath-utils';

describe('breath-utils', () => {
  describe('BREATH_PATTERNS', () => {
    it('should contain all breath patterns', () => {
      expect(BREATH_PATTERNS).toHaveProperty('4-4-6');
      expect(BREATH_PATTERNS).toHaveProperty('4-7-8');
      expect(BREATH_PATTERNS).toHaveProperty('box');
      expect(BREATH_PATTERNS).toHaveProperty('4-2');
    });

    it('should have valid structure for each pattern', () => {
      Object.values(BREATH_PATTERNS).forEach(pattern => {
        expect(pattern).toHaveProperty('name');
        expect(pattern).toHaveProperty('description');
        expect(pattern).toHaveProperty('pattern');
        expect(Array.isArray(pattern.pattern)).toBe(true);
      });
    });

    it('should have valid phases in each pattern', () => {
      Object.values(BREATH_PATTERNS).forEach(breathPattern => {
        breathPattern.pattern.forEach(phase => {
          expect(phase).toHaveProperty('label');
          expect(phase).toHaveProperty('seconds');
          expect(typeof phase.label).toBe('string');
          expect(typeof phase.seconds).toBe('number');
          expect(phase.seconds).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('BREATH_PRESETS', () => {
    it('should contain 5 presets', () => {
      expect(BREATH_PRESETS).toHaveLength(5);
    });

    it('should have increasing durations', () => {
      for (let i = 1; i < BREATH_PRESETS.length; i++) {
        expect(BREATH_PRESETS[i].value).toBeGreaterThan(BREATH_PRESETS[i - 1].value);
      }
    });

    it('should have label and value for each preset', () => {
      BREATH_PRESETS.forEach(preset => {
        expect(preset.label).toBeDefined();
        expect(preset.value).toBeDefined();
        expect(typeof preset.label).toBe('string');
        expect(typeof preset.value).toBe('number');
      });
    });
  });

  describe('getBreathCycleDuration', () => {
    it('should calculate correct duration for 4-4-6 pattern', () => {
      expect(getBreathCycleDuration('4-4-6')).toBe(14);
    });

    it('should calculate correct duration for 4-7-8 pattern', () => {
      expect(getBreathCycleDuration('4-7-8')).toBe(19);
    });

    it('should calculate correct duration for box pattern', () => {
      expect(getBreathCycleDuration('box')).toBe(16);
    });

    it('should calculate correct duration for 4-2 pattern', () => {
      expect(getBreathCycleDuration('4-2')).toBe(6);
    });

    it('should default to 4-4-6 pattern if no pattern specified', () => {
      expect(getBreathCycleDuration()).toBe(14);
    });

    it('should default to 4-4-6 pattern for invalid pattern', () => {
      expect(getBreathCycleDuration('invalid')).toBe(14);
    });
  });

  describe('getBreathPhase', () => {
    it('should return first phase at 0 seconds', () => {
      const phase = getBreathPhase(0, '4-4-6');
      expect(phase.label).toBe('Inhale');
      expect(phase.secondsRemaining).toBe(4);
      expect(phase.secondsInPhase).toBe(0);
      expect(phase.phaseIndex).toBe(0);
    });

    it('should return correct phase during inhale', () => {
      const phase = getBreathPhase(2, '4-4-6');
      expect(phase.label).toBe('Inhale');
      expect(phase.secondsRemaining).toBe(2);
      expect(phase.secondsInPhase).toBe(2);
    });

    it('should transition to hold phase', () => {
      const phase = getBreathPhase(4, '4-4-6');
      expect(phase.label).toBe('Hold');
    });

    it('should transition to exhale phase', () => {
      const phase = getBreathPhase(8, '4-4-6');
      expect(phase.label).toBe('Exhale');
    });

    it('should cycle back to beginning after complete cycle', () => {
      const phase = getBreathPhase(14, '4-4-6');
      expect(phase.label).toBe('Inhale');
    });

    it('should handle box breathing pattern', () => {
      const phase1 = getBreathPhase(0, 'box');
      expect(phase1.label).toBe('Inhale');

      const phase2 = getBreathPhase(4, 'box');
      expect(phase2.label).toBe('Hold');

      const phase3 = getBreathPhase(8, 'box');
      expect(phase3.label).toBe('Exhale');

      const phase4 = getBreathPhase(12, 'box');
      expect(phase4.label).toBe('Hold');
    });

    it('should handle multiple cycles', () => {
      const phase = getBreathPhase(28, '4-4-6'); // 2 full cycles
      expect(phase.label).toBe('Inhale');
    });
  });

  describe('getBreathProgress', () => {
    it('should return 0 at start of phase', () => {
      expect(getBreathProgress(0, '4-4-6')).toBe(0);
    });

    it('should return progress within phase', () => {
      const progress = getBreathProgress(2, '4-4-6'); // 2 seconds into 4-second inhale
      expect(progress).toBe(0.5);
    });

    it('should return progress near end of phase', () => {
      const progress = getBreathProgress(3, '4-4-6'); // 3 seconds into 4-second inhale
      expect(progress).toBe(0.75);
    });

    it('should handle different pattern phases', () => {
      const progress = getBreathProgress(6, '4-4-6'); // 2 seconds into hold
      expect(progress).toBe(0.5);
    });

    it('should work with box breathing', () => {
      const progress = getBreathProgress(2, 'box'); // 2 seconds into 4-second inhale
      expect(progress).toBe(0.5);
    });

    it('should handle progress across cycles', () => {
      const progress = getBreathProgress(16, '4-4-6'); // 2 seconds into second cycle
      expect(progress).toBe(0.5);
    });
  });
});
