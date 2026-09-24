import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { AnimatedPressable } from './animated-pressable';

const mockHapticLight = jest.fn(() => Promise.resolve());

jest.mock('@/utils/haptics', () => ({
  hapticLight: () => mockHapticLight()
}));

describe('AnimatedPressable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ejecuta haptic y callbacks de press in/out', () => {
    const onPressIn = jest.fn();
    const onPressOut = jest.fn();
    const onPress = jest.fn();

    render(
      <AnimatedPressable
        testID="animated-pressable"
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
      >
        <Text>Presionar</Text>
      </AnimatedPressable>
    );

    const pressable = screen.getByTestId('animated-pressable');

    fireEvent(pressable, 'pressIn');
    fireEvent.press(pressable);
    fireEvent(pressable, 'pressOut');

    expect(mockHapticLight).toHaveBeenCalledTimes(1);
    expect(onPressIn).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPressOut).toHaveBeenCalledTimes(1);
  });
});
