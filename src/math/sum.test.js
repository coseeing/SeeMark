import sum from './sum';

describe('sum function', () => {
  it('should return the sum of two numbers', () => {
    expect(sum(1, 2)).toBe(3);
    expect(sum(-1, 1)).toBe(0);
    expect(sum(0, 0)).toBe(0);
    expect(sum(100, 200)).toBe(300);
  });

  it('should handle non-numeric inputs gracefully', () => {
    expect(() => sum('a', 'b')).toThrow();
    expect(() => sum(null, undefined)).toThrow();
  });
});
