import type { Treatment } from '@/types/domain';

export function getMonthDays(month: Date) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const leadingDays = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();

  return Array.from({ length: leadingDays + daysInMonth }, (_, index) =>
    index < leadingDays ? undefined : index - leadingDays + 1
  );
}

export function monthKey(month: Date) {
  return `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
}

export function getTreatmentsInMonth<T extends Treatment>(treatments: T[], month: Date) {
  return treatments.filter((treatment) => treatment.nextDueDate.startsWith(monthKey(month)));
}

export function groupTreatmentsByDueDay<T extends Treatment>(treatments: T[]) {
  return treatments.reduce((groups, treatment) => {
    const day = Number(treatment.nextDueDate.slice(-2));
    groups.set(day, [...(groups.get(day) ?? []), treatment]);
    return groups;
  }, new Map<number, T[]>());
}
