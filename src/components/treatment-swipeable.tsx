import { Check, Clock } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import type { ReactNode } from 'react';

import { colors, radius, spacing, typography } from '@/theme/tokens';
import { hapticLight } from '@/utils/haptics';

interface TreatmentSwipeableProps {
  children: ReactNode;
  onMarkApplied: () => void;
  onPostpone?: () => void;
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
        void hapticLight();
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

export function TreatmentSwipeable({ children, onMarkApplied, onPostpone }: TreatmentSwipeableProps) {
  // TODO: conectar Posponer cuando exista una regla de negocio para mover la fecha sin aplicar el tratamiento.
  return (
    <Swipeable
      overshootLeft={false}
      overshootRight={false}
      renderLeftActions={() => (
        <View style={{ borderRadius: radius.lg, overflow: 'hidden' }}>
          <SwipeAction
            label="Posponer"
            color={colors.warning}
            Icon={Clock}
            onPress={onPostpone}
            disabled={!onPostpone}
          />
        </View>
      )}
      renderRightActions={() => (
        <View style={{ borderRadius: radius.lg, overflow: 'hidden' }}>
          <SwipeAction label="Marcar aplicado" color={colors.success} Icon={Check} onPress={onMarkApplied} />
        </View>
      )}
    >
      {children}
    </Swipeable>
  );
}
