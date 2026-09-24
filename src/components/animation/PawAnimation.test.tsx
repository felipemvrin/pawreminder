import type { ReactNode } from 'react';

import { render } from '@testing-library/react-native';
import { PawAnimation } from './PawAnimation';

jest.mock('lottie-react-native', () => 'LottieView');
jest.mock('moti', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    MotiView: ({ children, ...props }: { children: ReactNode; [key: string]: unknown }) => (
      <View {...props}>{children}</View>
    )
  };
});
jest.mock('react-native-reanimated', () => ({
  useReducedMotion: jest.fn(() => false)
}));

describe('PawAnimation', () => {
  it('muestra el fallback cuando no existe el asset', () => {
    const { getByLabelText } = render(<PawAnimation name="empty-pets" />);

    expect(getByLabelText('Animacion empty-pets')).toBeTruthy();
  });

  it('mantiene el fallback estatico con reducir movimiento', () => {
    const { useReducedMotion } = jest.requireMock('react-native-reanimated') as {
      useReducedMotion: jest.Mock;
    };
    useReducedMotion.mockReturnValue(true);

    const { getByLabelText } = render(<PawAnimation name="success" loop />);

    expect(getByLabelText('Animacion success')).toBeTruthy();
    useReducedMotion.mockReturnValue(false);
  });
});
