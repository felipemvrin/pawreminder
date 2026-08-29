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

  it('accepts an Android content URI', () => {
    expect(
      petFormSchema.safeParse({
        ...validPet,
        photoUri: 'content://media/external/images/media/1'
      }).success
    ).toBe(true);
  });

  it('rejects an invalid image URI', () => {
    expect(petFormSchema.safeParse({ ...validPet, photoUri: 'luna.jpg' }).success).toBe(false);
  });
});
