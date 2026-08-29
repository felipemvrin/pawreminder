import { petFormSchema } from './pet-schema';

const validPet = {
  name: 'Luna',
  species: 'dog' as const,
  breed: '',
  photoUri: '',
  weightKg: 12,
  livesOutdoors: false
};

describe('petFormSchema', () => {
  it('accepts a local image URI', () => {
    expect(
      petFormSchema.safeParse({ ...validPet, photoUri: 'file:///photos/luna.jpg' }).success
    ).toBe(true);
  });

  it('rejects an invalid image URI', () => {
    expect(petFormSchema.safeParse({ ...validPet, photoUri: 'luna.jpg' }).success).toBe(false);
  });
});
