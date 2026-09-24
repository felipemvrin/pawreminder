import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { AnimatedPressable } from './animated-pressable';

const mockHapticLight = jest.fn(() => Promise.resolve());

jest.mock('react-native-reanimated', () => ({
  __esModule: true,
  default: {
    createAnimatedComponent: (Component: unknown) => Component
  },
  useSharedValue: (initial: number) => ({ value: initial }),
  withTiming: (value: number) => value,
  useReducedMotion: () => false,
  useAnimatedStyle: (updater: () => { transform: { scale: number }[] }) =>
    new Proxy(
      {},
      {
        get: (_target, property: 'transform') => updater()[property]
      }
    )
}));

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
        style={{ padding: 8 }}
      >
        <Text>Presionar</Text>
      </AnimatedPressable>
    );

    const pressable = screen.getByTestId('animated-pressable');
    const getScale = () => pressable.props.style[1].transform[0].scale;

    expect(getScale()).toBe(1);

    fireEvent(pressable, 'pressIn');
    expect(getScale()).toBe(0.97);

    fireEvent.press(pressable);
    fireEvent(pressable, 'pressOut');
    expect(getScale()).toBe(1);

    expect(mockHapticLight).toHaveBeenCalledTimes(1);
    expect(onPressIn).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPressOut).toHaveBeenCalledTimes(1);
  });
});
