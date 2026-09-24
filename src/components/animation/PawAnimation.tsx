import LottieView from 'lottie-react-native';
import { MotiView } from 'moti';
import { useEffect, useRef } from 'react';
import { Text } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { colors, radius, spacing } from '@/theme/tokens';
import { getPawAnimationSource, type PawAnimationName } from './registry';

interface PawAnimationProps {
  name: PawAnimationName;
  size?: number;
  loop?: boolean;
  autoPlay?: boolean;
  onFinish?: () => void;
}

export function PawAnimation({
  name,
  size = 96,
  loop = true,
  autoPlay = true,
  onFinish
}: PawAnimationProps) {
  const source = getPawAnimationSource(name);
  const reducedMotion = useReducedMotion();
  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    if (reducedMotion && source) {
      lottieRef.current?.reset();
    }
  }, [reducedMotion, source]);

  if (source) {
    return (
      <LottieView
        ref={lottieRef}
        source={source}
        autoPlay={autoPlay && !reducedMotion}
        loop={loop && !reducedMotion}
        style={{ width: size, height: size }}
        onAnimationFinish={onFinish}
      />
    );
  }

  return (
    <MotiView
      from={{ opacity: 0.72, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'timing', duration: 650, loop: !reducedMotion && loop }}
      style={{
        width: size,
        height: size,
        borderRadius: radius.full,
        backgroundColor: colors.secondary,
        alignItems: 'center',
        justifyContent: 'center'
      }}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      <Text style={{ color: colors.primary, fontSize: size * 0.42 }}>🐾</Text>
      {name === 'success' ? (
        <Text style={{ position: 'absolute', color: colors.success, fontSize: spacing[4] }}>OK</Text>
      ) : null}
    </MotiView>
  );
}
