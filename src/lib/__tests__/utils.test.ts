import { cn } from '../utils';

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('class1', 'class2');
    expect(result).toBe('class1 class2');
  });

  it('should handle conditional classes', () => {
    const result = cn('base', true && 'conditional', false && 'hidden');
    expect(result).toBe('base conditional');
  });

  it('should merge conflicting Tailwind classes', () => {
    const result = cn('p-4', 'p-8');
    expect(result).toContain('p-8');
    expect(result).not.toContain('p-4');
  });

  it('should handle undefined and null values', () => {
    const result = cn('base', undefined, null, 'valid');
    expect(result).toBe('base valid');
  });

  it('should handle empty strings', () => {
    const result = cn('base', '', 'valid');
    expect(result).toBe('base valid');
  });
});

