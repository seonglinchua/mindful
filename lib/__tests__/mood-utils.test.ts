import { calculateStreak, MOODS } from '../mood-utils';
import type { MoodEntry } from '../types';

describe('mood-utils', () => {
  describe('MOODS', () => {
    it('should contain 5 mood levels', () => {
      expect(MOODS).toHaveLength(5);
    });

    it('should have values from 1 to 5', () => {
      const values = MOODS.map(m => m.value);
      expect(values).toEqual([1, 2, 3, 4, 5]);
    });

    it('should have emoji and label for each mood', () => {
      MOODS.forEach(mood => {
        expect(mood.emoji).toBeDefined();
        expect(mood.label).toBeDefined();
        expect(typeof mood.emoji).toBe('string');
        expect(typeof mood.label).toBe('string');
      });
    });
  });

  describe('calculateStreak', () => {
    it('should return 0 for empty entries', () => {
      expect(calculateStreak([], '2024-01-15')).toBe(0);
    });

    it('should return 1 for a single entry today', () => {
      const entries: MoodEntry[] = [{ date: '2024-01-15', value: 3 }];
      expect(calculateStreak(entries, '2024-01-15')).toBe(1);
    });

    it('should calculate consecutive days correctly', () => {
      const entries: MoodEntry[] = [
        { date: '2024-01-15', value: 3 },
        { date: '2024-01-14', value: 4 },
        { date: '2024-01-13', value: 5 },
      ];
      expect(calculateStreak(entries, '2024-01-15')).toBe(3);
    });

    it('should stop counting at first gap', () => {
      const entries: MoodEntry[] = [
        { date: '2024-01-15', value: 3 },
        { date: '2024-01-14', value: 4 },
        { date: '2024-01-12', value: 5 }, // Gap on 01-13
        { date: '2024-01-11', value: 3 },
      ];
      expect(calculateStreak(entries, '2024-01-15')).toBe(2);
    });

    it('should handle unsorted entries', () => {
      const entries: MoodEntry[] = [
        { date: '2024-01-13', value: 5 },
        { date: '2024-01-15', value: 3 },
        { date: '2024-01-14', value: 4 },
      ];
      expect(calculateStreak(entries, '2024-01-15')).toBe(3);
    });

    it('should calculate streak from yesterday if no entry today', () => {
      const entries: MoodEntry[] = [
        { date: '2024-01-14', value: 4 },
        { date: '2024-01-13', value: 5 },
      ];
      expect(calculateStreak(entries, '2024-01-15')).toBe(2);
    });

    it('should return 0 if last entry is more than a day old', () => {
      const entries: MoodEntry[] = [
        { date: '2024-01-13', value: 5 },
        { date: '2024-01-12', value: 4 },
      ];
      expect(calculateStreak(entries, '2024-01-15')).toBe(0);
    });

    it('should handle duplicate dates', () => {
      const entries: MoodEntry[] = [
        { date: '2024-01-15', value: 3 },
        { date: '2024-01-15', value: 4 }, // Duplicate
        { date: '2024-01-14', value: 5 },
      ];
      expect(calculateStreak(entries, '2024-01-15')).toBeGreaterThan(0);
    });
  });
});
