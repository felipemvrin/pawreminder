import { asyncStorageService } from './async-storage-service';
import { onboardingService } from './onboarding-service';

jest.mock('./async-storage-service', () => ({
  asyncStorageService: {
    getItem: jest.fn(),
    setItem: jest.fn()
  }
}));

describe('onboardingService', () => {
  it('detecta si el onboarding fue completado', async () => {
    jest.mocked(asyncStorageService.getItem).mockResolvedValueOnce('true');

    await expect(onboardingService.hasCompleted()).resolves.toBe(true);
  });

  it('persiste la finalizacion del onboarding', async () => {
    await onboardingService.markCompleted();

    expect(asyncStorageService.setItem).toHaveBeenCalledWith(
      'pawreminder:onboarding:completed',
      'true'
    );
  });
});
