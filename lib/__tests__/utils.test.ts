import { cn } from '../utils';

describe('utils', () => {
  describe('cn', () => {
    it('should combine multiple class names', () => {
      expect(cn('class1', 'class2', 'class3')).toBe('class1 class2 class3');
    });

    it('should filter out falsy values', () => {
      expect(cn('class1', false, 'class2', null, 'class3', undefined)).toBe('class1 class2 class3');
    });

    it('should handle empty input', () => {
      expect(cn()).toBe('');
    });

    it('should handle all falsy values', () => {
      expect(cn(false, null, undefined)).toBe('');
    });

    it('should handle single class name', () => {
      expect(cn('single')).toBe('single');
    });

    it('should handle conditional class names', () => {
      const isActive = true;
      const isDisabled = false;
      expect(cn('base', isActive && 'active', isDisabled && 'disabled')).toBe('base active');
    });
  });
});
