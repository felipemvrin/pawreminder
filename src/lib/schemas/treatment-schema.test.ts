import { treatmentFormSchema } from './treatment-schema';

const validTreatment = {
  type: 'internal' as const,
  productName: 'Comprimido',
  frequencyDays: 30,
  lastAppliedDate: '2026-08-29',
  reminderDaysBefore: 2
};

describe('treatmentFormSchema', () => {
  it('accepts a valid treatment', () => {
    expect(treatmentFormSchema.safeParse(validTreatment).success).toBe(true);
  });

  it('rejects dates that do not exist in the calendar', () => {
    const result = treatmentFormSchema.safeParse({
      ...validTreatment,
      lastAppliedDate: '2026-02-30'
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        'Ingresa una fecha válida con formato AAAA-MM-DD'
      );
    }
  });

  it('rejects reminders that fall outside the treatment cycle', () => {
    const result = treatmentFormSchema.safeParse({
      ...validTreatment,
      frequencyDays: 2,
      reminderDaysBefore: 2
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        'Debe ser menor que la frecuencia del tratamiento'
      );
    }
  });
});
