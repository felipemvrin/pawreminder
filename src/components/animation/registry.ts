import type { AnimationObject } from 'lottie-react-native';

export type PawAnimationName =
  | 'empty-pets'
  | 'empty-treatments'
  | 'loading'
  | 'success'
  | 'confetti'
  | 'onboarding-pet'
  | 'onboarding-calendar'
  | 'onboarding-bell';

type LottieSource = string | AnimationObject | { uri: string };

const sources: Partial<Record<PawAnimationName, LottieSource>> = {
  // Optional animation assets are intentionally registered only when they exist.
};

export function getPawAnimationSource(name: PawAnimationName): LottieSource | undefined {
  return sources[name];
}
