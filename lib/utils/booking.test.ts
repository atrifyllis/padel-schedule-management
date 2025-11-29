import { describe, expect, it } from 'vitest';
import { getSlotStats, toLocalInputValue } from './booking';

describe('lib/utils/booking', () => {
  it('calculates slot statistics with averages and counts', () => {
    const stats = getSlotStats([
      { probability: 100 },
      { probability: 50 },
      { probability: 0 }
    ]);

    expect(stats.responseCount).toBe(3);
    expect(stats.availableCount).toBe(2);
    expect(stats.unavailableCount).toBe(1);
    expect(stats.averageProbability).toBe(50);
  });

  it('returns zeroed statistics when no responses exist', () => {
    expect(getSlotStats([])).toEqual({
      responseCount: 0,
      availableCount: 0,
      unavailableCount: 0,
      averageProbability: 0
    });
  });

  it('converts dates to local datetime-local input values', () => {
    const date = new Date('2024-01-01T12:00:00Z');
    const value = toLocalInputValue(date);

    expect(value).toMatch(/2024-01-01T/);
    expect(value.length).toBe(16);
  });
});
