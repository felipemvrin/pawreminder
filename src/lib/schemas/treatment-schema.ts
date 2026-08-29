import { z } from 'zod';

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

function isValidISODate(value: string) {
  if (!isoDatePattern.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export const treatmentFormSchema = z
  .object({
    type: z.enum(['internal', 'external'], { message: 'Selecciona un tipo de tratamiento' }),
    productName: z.string().trim().max(60, 'Máximo 60 caracteres').optional().or(z.literal('')),
    frequencyDays: z.coerce
      .number({ message: 'Ingresa una frecuencia válida' })
      .int('Debe ser un número entero')
      .positive('La frecuencia debe ser mayor a 0'),
    lastAppliedDate: z
      .string()
      .trim()
      .refine(isValidISODate, 'Ingresa una fecha válida con formato AAAA-MM-DD'),
    reminderDaysBefore: z.coerce
      .number({ message: 'Ingresa un valor válido' })
      .int('Debe ser un número entero')
      .min(0, 'No puede ser negativo')
      .max(30, 'Máximo 30 días')
  })
  .refine((values) => values.reminderDaysBefore < values.frequencyDays, {
    message: 'Debe ser menor que la frecuencia del tratamiento',
    path: ['reminderDaysBefore']
  });

export type TreatmentFormValues = z.input<typeof treatmentFormSchema>;
export type TreatmentFormOutput = z.output<typeof treatmentFormSchema>;

export const treatmentFormDefaultValues: TreatmentFormValues = {
  type: 'internal',
  productName: '',
  frequencyDays: 30,
  lastAppliedDate: new Date().toISOString().split('T')[0],
  reminderDaysBefore: 2
};
