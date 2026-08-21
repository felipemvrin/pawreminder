import { z } from 'zod';

export const petFormSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio').max(40, 'Máximo 40 caracteres'),
  species: z.enum(['dog', 'cat'], { message: 'Selecciona una especie' }),
  breed: z.string().trim().max(40, 'Máximo 40 caracteres').optional().or(z.literal('')),
  weightKg: z.coerce
    .number({ message: 'Ingresa un peso válido' })
    .positive('El peso debe ser mayor a 0')
    .max(150, 'Peso demasiado alto'),
  livesOutdoors: z.boolean()
});

export type PetFormValues = z.input<typeof petFormSchema>;
export type PetFormOutput = z.output<typeof petFormSchema>;

export const petFormDefaultValues: PetFormValues = {
  name: '',
  species: 'dog',
  breed: '',
  weightKg: 0,
  livesOutdoors: false
};
