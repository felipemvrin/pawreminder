import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

import { hapticLight } from '@/utils/haptics';

interface AnimatedPressableProps extends PressableProps {
  style?: StyleProp<ViewStyle>;
}

const ReanimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AnimatedPressable({ style, onPressIn, onPressOut, ...props }: AnimatedPressableProps) {
  const scale = useSharedValue(1);
  const reducedMotion = useReducedMotion();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <ReanimatedPressable
      {...props}
      onPressIn={(event) => {
        if (!reducedMotion) scale.value = withTiming(0.97, { duration: 100 });
        void hapticLight();
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        if (!reducedMotion) scale.value = withTiming(1, { duration: 140 });
        onPressOut?.(event);
      }}
      style={[style, animatedStyle]}
    />
  );
}
