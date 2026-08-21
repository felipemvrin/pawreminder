import { colors } from '@/theme/tokens';
import type { Treatment } from '@/types/domain';

export type TreatmentStatus = 'upcoming' | 'today' | 'overdue';

export const treatmentStatusLabels: Record<TreatmentStatus, string> = {
  upcoming: 'Próximo',
  today: 'Hoy',
  overdue: 'Vencido'
};

export const treatmentStatusColors: Record<TreatmentStatus, string> = {
  upcoming: colors.success,
  today: colors.warning,
  overdue: colors.error
};

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function getTreatmentStatus(nextDueDate: string, today: Date = new Date()): TreatmentStatus {
  const due = startOfDay(new Date(nextDueDate));
  const now = startOfDay(today);

  if (due.getTime() < now.getTime()) return 'overdue';
  if (due.getTime() === now.getTime()) return 'today';
  return 'upcoming';
}

/** Picks the treatment with the closest due date among active treatments, used for status badges. */
export function getMostUrgentTreatment(treatments: Treatment[]): Treatment | undefined {
  return treatments
    .filter((t) => t.active)
    .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())[0];
}
