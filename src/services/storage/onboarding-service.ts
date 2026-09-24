import { asyncStorageService } from './async-storage-service';

const ONBOARDING_COMPLETED_KEY = 'pawreminder:onboarding:completed';

export interface OnboardingService {
  hasCompleted(): Promise<boolean>;
  markCompleted(): Promise<void>;
}

export const onboardingService: OnboardingService = {
  async hasCompleted() {
    return (await asyncStorageService.getItem(ONBOARDING_COMPLETED_KEY)) === 'true';
  },
  async markCompleted() {
    await asyncStorageService.setItem(ONBOARDING_COMPLETED_KEY, 'true');
  }
};
