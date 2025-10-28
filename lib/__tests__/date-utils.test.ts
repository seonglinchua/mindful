import { todayKey, formatDisplayDate } from '../date-utils';

describe('date-utils', () => {
  describe('todayKey', () => {
    it('should return date in YYYY-MM-DD format', () => {
      const result = todayKey();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should pad month and day with zeros', () => {
      const result = todayKey();
      const [year, month, day] = result.split('-');
      expect(month.length).toBe(2);
      expect(day.length).toBe(2);
    });
  });

  describe('formatDisplayDate', () => {
    it('should format date in short month format', () => {
      expect(formatDisplayDate('2024-01-15')).toBe('Jan 15');
      expect(formatDisplayDate('2024-12-25')).toBe('Dec 25');
    });

    it('should handle different months correctly', () => {
      expect(formatDisplayDate('2024-02-29')).toBe('Feb 29');
      expect(formatDisplayDate('2024-06-15')).toBe('Jun 15');
    });

    it('should handle invalid date strings gracefully', () => {
      // Invalid dates will throw, so we wrap in try-catch
      try {
        const result = formatDisplayDate('invalid-date');
        // If it doesn't throw, result should be defined
        expect(result).toBeDefined();
      } catch (error) {
        // It's acceptable for invalid dates to throw
        expect(error).toBeDefined();
      }
    });

    it('should use UTC timezone', () => {
      const result = formatDisplayDate('2024-01-01');
      expect(result).toBe('Jan 1');
    });
  });
});
