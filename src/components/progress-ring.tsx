import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

import { colors, typography } from '@/theme/tokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  completed: number;
  total: number;
  size?: number;
  strokeWidth?: number;
  accessibilityLabel?: string;
}

function getProgress(completed: number, total: number) {
  if (total <= 0 || !Number.isFinite(completed) || !Number.isFinite(total)) return 0;
  return Math.min(Math.max(completed / total, 0), 1);
}

export function ProgressRing({
  completed,
  total,
  size = 120,
  strokeWidth = 10,
  accessibilityLabel
}: ProgressRingProps) {
  const reducedMotion = useReducedMotion();
  const progress = getProgress(completed, total);
  const animatedProgress = useSharedValue(reducedMotion ? progress : 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value)
  }));

  useEffect(() => {
    animatedProgress.value = reducedMotion
      ? progress
      : withTiming(progress, { duration: 650 });
  }, [animatedProgress, progress, reducedMotion]);

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel ?? `${completed} de ${total} cuidados al día`}
      accessibilityValue={{ min: 0, max: total, now: Math.min(Math.max(completed, 0), total) }}
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.secondary}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.success}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
          fill="none"
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>
      <View pointerEvents="none" style={{ position: 'absolute', alignItems: 'center' }}>
        <Text style={{ ...typography.heading, color: colors.foreground }}>
          {completed} / {total}
        </Text>
        <Text style={{ ...typography.caption, color: colors.muted }}>al día</Text>
      </View>
    </View>
  );
}
