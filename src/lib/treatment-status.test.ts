import type { Treatment } from '@/types/domain';
import { getMostUrgentTreatment, getTreatmentStatus } from './treatment-status';

const today = new Date(2026, 7, 26, 12);

function createTreatment(overrides: Partial<Treatment> = {}): Treatment {
  return {
    id: 'treatment-1',
    petId: 'pet-1',
    type: 'internal',
    frequencyDays: 30,
    lastAppliedDate: '2026-07-27',
    nextDueDate: '2026-08-26',
    reminderDaysBefore: 2,
    active: true,
    createdAt: '2026-07-27T12:00:00.000Z',
    ...overrides
  };
}

describe('treatment status', () => {
  it.each([
    ['overdue', '2026-08-25'],
    ['today', '2026-08-26'],
    ['upcoming', '2026-08-27']
  ] as const)('classifies a treatment as %s', (expectedStatus, nextDueDate) => {
    expect(getTreatmentStatus(nextDueDate, today)).toBe(expectedStatus);
  });

  it('ignores inactive treatments when finding the most urgent one', () => {
    const inactiveTreatment = createTreatment({
      id: 'inactive',
      nextDueDate: '2026-08-20',
      active: false
    });
    const activeTreatment = createTreatment({ id: 'active', nextDueDate: '2026-08-30' });

    expect(getMostUrgentTreatment([inactiveTreatment, activeTreatment])).toBe(activeTreatment);
  });

  it('returns the active treatment with the closest due date', () => {
    const laterTreatment = createTreatment({ id: 'later', nextDueDate: '2026-09-10' });
    const urgentTreatment = createTreatment({ id: 'urgent', nextDueDate: '2026-08-27' });

    expect(getMostUrgentTreatment([laterTreatment, urgentTreatment])).toBe(urgentTreatment);
  });

  it('returns undefined when there are no active treatments', () => {
    expect(getMostUrgentTreatment([createTreatment({ active: false })])).toBeUndefined();
  });
});
