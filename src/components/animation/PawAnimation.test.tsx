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
  it('muestra el fallback cuando no existe el asset sin exponerlo a lectores de pantalla', () => {
    const { queryByLabelText, toJSON } = render(<PawAnimation name="empty-pets" />);

    expect(toJSON()).toMatchObject({
      props: {
        accessible: false,
        importantForAccessibility: 'no-hide-descendants'
      }
    });
    expect(queryByLabelText('Animacion empty-pets')).toBeNull();
  });

  it('mantiene el fallback estatico con reducir movimiento', () => {
    const { useReducedMotion } = jest.requireMock('react-native-reanimated') as {
      useReducedMotion: jest.Mock;
    };
    useReducedMotion.mockReturnValue(true);

    const { queryByLabelText, toJSON } = render(<PawAnimation name="success" loop />);

    expect(toJSON()).toMatchObject({
      props: {
        accessible: false,
        importantForAccessibility: 'no-hide-descendants'
      }
    });
    expect(queryByLabelText('Animacion success')).toBeNull();
    useReducedMotion.mockReturnValue(false);
  });
});
