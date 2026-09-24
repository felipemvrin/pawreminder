import { Check, Clock } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import type { SwipeableMethods } from 'react-native-gesture-handler/lib/typescript/components/ReanimatedSwipeable';
import { useRef, type ReactNode } from 'react';

import { colors, radius, spacing, typography } from '@/theme/tokens';
import { hapticLight } from '@/utils/haptics';

interface TreatmentSwipeableProps {
  children: ReactNode;
  onMarkApplied: () => void;
  onPostpone?: () => void;
  markAppliedDisabled?: boolean;
}

function SwipeAction({
  label,
  color,
  Icon,
  onPress,
  disabled = false
}: {
  label: string;
  color: string;
  Icon: typeof Check;
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => {
        if (disabled) return;
        onPress?.();
      }}
      style={{
        width: 112,
        minHeight: 96,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing[1],
        backgroundColor: color,
        opacity: disabled ? 0.55 : 1
      }}
    >
      <Icon size={22} color={colors.primaryForeground} />
      <Text style={{ ...typography.caption, color: colors.primaryForeground }}>{label}</Text>
    </Pressable>
  );
}

export function TreatmentSwipeable({
  children,
  onMarkApplied,
  onPostpone,
  markAppliedDisabled = false
}: TreatmentSwipeableProps) {
  const swipeableRef = useRef<SwipeableMethods | null>(null);

  const handleActionPress = (action?: () => void) => {
    swipeableRef.current?.close();
    void hapticLight();
    action?.();
  };

  // TODO: conectar Posponer cuando exista una regla de negocio para mover la fecha sin aplicar el tratamiento.
  return (
    <Swipeable
      ref={swipeableRef}
      overshootLeft={false}
      overshootRight={false}
      renderLeftActions={() => (
        <View style={{ borderRadius: radius.lg, overflow: 'hidden' }}>
          <SwipeAction
            label="Posponer"
            color={colors.warning}
            Icon={Clock}
            onPress={onPostpone ? () => handleActionPress(onPostpone) : undefined}
            disabled={!onPostpone}
          />
        </View>
      )}
      renderRightActions={() => (
        <View style={{ borderRadius: radius.lg, overflow: 'hidden' }}>
          <SwipeAction
            label="Marcar aplicado"
            color={colors.success}
            Icon={Check}
            onPress={() => handleActionPress(onMarkApplied)}
            disabled={markAppliedDisabled}
          />
        </View>
      )}
    >
      {children}
    </Swipeable>
  );
}
