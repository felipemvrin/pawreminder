import {
  getMonthDays,
  getTreatmentsInMonth,
  groupTreatmentsByDueDay,
  monthKey
} from './calendar-utils';
import type { Treatment } from '@/types/domain';

const treatment = (id: string, nextDueDate: string): Treatment => ({
  id,
  petId: 'pet-1',
  type: 'internal',
  frequencyDays: 30,
  lastAppliedDate: '2026-01-01',
  nextDueDate,
  reminderDaysBefore: 2,
  active: true,
  createdAt: '2026-01-01T12:00:00.000Z'
});

describe('calendar utilities', () => {
  it('uses an ISO key for the selected month', () => {
    expect(monthKey(new Date(2026, 0, 1))).toBe('2026-01');
  });

  it('builds Monday-first weeks including leap-day February', () => {
    const days = getMonthDays(new Date(2024, 1, 1));

    expect(days).toHaveLength(32);
    expect(days.slice(0, 3)).toEqual([undefined, undefined, undefined]);
    expect(days.at(-1)).toBe(29);
  });

  it('filters and groups treatments by their due day in the selected month', () => {
    const treatments = [
      treatment('treatment-1', '2026-08-05'),
      treatment('treatment-2', '2026-08-05'),
      treatment('treatment-3', '2026-09-01')
    ];

    const scheduled = getTreatmentsInMonth(treatments, new Date(2026, 7, 1));
    const grouped = groupTreatmentsByDueDay(scheduled);

    expect(scheduled.map((item) => item.id)).toEqual(['treatment-1', 'treatment-2']);
    expect(grouped.get(5)?.map((item) => item.id)).toEqual(['treatment-1', 'treatment-2']);
  });

  it('groups correctly when nextDueDate includes a time component', () => {
    const treatments = [treatment('t-1', '2026-08-15T00:00:00.000Z')];

    const scheduled = getTreatmentsInMonth(treatments, new Date(2026, 7, 1));
    const grouped = groupTreatmentsByDueDay(scheduled);

    expect(grouped.get(15)?.map((item) => item.id)).toEqual(['t-1']);
    expect(grouped.has(NaN)).toBe(false);
  });
});
