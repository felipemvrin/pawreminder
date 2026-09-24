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

function sanitizeNumber(value: number, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function sanitizePositive(value: number, fallback: number) {
  if (!Number.isFinite(value) || value <= 0) return fallback;
  return value;
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
  const normalizedSize = sanitizePositive(size, 120);
  const normalizedStrokeWidth = Math.min(
    sanitizePositive(strokeWidth, 10),
    normalizedSize
  );
  const normalizedCompleted = Math.max(sanitizeNumber(completed), 0);
  const normalizedTotal = Math.max(sanitizeNumber(total), 0);
  const progress = getProgress(normalizedCompleted, normalizedTotal);
  const animatedProgress = useSharedValue(reducedMotion ? progress : 0);
  const radius = (normalizedSize - normalizedStrokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = normalizedSize / 2;
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
      accessibilityLabel={
        accessibilityLabel ?? `${normalizedCompleted} de ${normalizedTotal} cuidados al día`
      }
      accessibilityValue={{
        min: 0,
        max: normalizedTotal,
        now: Math.min(normalizedCompleted, normalizedTotal)
      }}
      style={{
        width: normalizedSize,
        height: normalizedSize,
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Svg
        width={normalizedSize}
        height={normalizedSize}
        viewBox={`0 0 ${normalizedSize} ${normalizedSize}`}
      >
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.secondary}
          strokeWidth={normalizedStrokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.success}
          strokeWidth={normalizedStrokeWidth}
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
          {normalizedCompleted} / {normalizedTotal}
        </Text>
        <Text style={{ ...typography.caption, color: colors.muted }}>al día</Text>
      </View>
    </View>
  );
}
