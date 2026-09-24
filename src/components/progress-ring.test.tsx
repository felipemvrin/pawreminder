import { render, screen } from '@testing-library/react-native';

import { ProgressRing } from './progress-ring';

jest.mock('react-native-svg', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');

  return {
    __esModule: true,
    default: View,
    Circle: View
  };
});

jest.mock('react-native-reanimated', () => {
  const actual = jest.requireActual<typeof import('react-native-reanimated')>(
    'react-native-reanimated'
  );

  return {
    ...actual,
    createAnimatedComponent: (component: unknown) => component,
    useAnimatedProps: (factory: () => object) => factory(),
    useReducedMotion: jest.fn(() => false),
    useSharedValue: (value: number) => ({ value }),
    withTiming: (value: number) => value
  };
});

describe('ProgressRing', () => {
  it('muestra el resumen accesible de cuidados', () => {
    render(<ProgressRing completed={3} total={5} />);

    expect(screen.getByText('3 / 5')).toBeTruthy();
    expect(screen.getByText('al día')).toBeTruthy();
    expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({
      min: 0,
      max: 5,
      now: 3
    });
  });

  it('limita el valor accesible al total disponible', () => {
    render(<ProgressRing completed={4} total={0} />);

    expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({
      min: 0,
      max: 0,
      now: 0
    });
  });

  it('normaliza valores inválidos para evitar estados accesibles inconsistentes', () => {
    render(<ProgressRing completed={Number.POSITIVE_INFINITY} total={-2} />);

    expect(screen.getByText('0 / 0')).toBeTruthy();
    expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({
      min: 0,
      max: 0,
      now: 0
    });
  });
});
