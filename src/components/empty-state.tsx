import { Pressable, Text, View } from 'react-native';

import { PawAnimation } from '@/components/animation/PawAnimation';
import { colors, radius, spacing, typography } from '@/theme/tokens';
import type { PawAnimationName } from '@/components/animation/registry';

interface EmptyStateProps {
  animation: PawAnimationName;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  animation,
  title,
  message,
  actionLabel,
  onAction
}: EmptyStateProps) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing[3],
        padding: spacing[6]
      }}
    >
      <PawAnimation name={animation} size={112} />
      <Text style={{ ...typography.heading, color: colors.foreground, textAlign: 'center' }}>
        {title}
      </Text>
      <Text style={{ ...typography.body, color: colors.muted, textAlign: 'center' }}>
        {message}
      </Text>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          style={{
            marginTop: spacing[2],
            paddingHorizontal: spacing[4],
            paddingVertical: spacing[3],
            borderRadius: radius.md,
            backgroundColor: colors.primary
          }}
        >
          <Text style={{ ...typography.label, color: colors.primaryForeground }}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
