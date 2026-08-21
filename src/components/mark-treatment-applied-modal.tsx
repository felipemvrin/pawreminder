import React from 'react';
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme/tokens';
import type { Treatment } from '@/types/domain';

interface MarkTreatmentAppliedModalProps {
  isVisible: boolean;
  treatment: Treatment | null;
  petName?: string;
  isLoading: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}

function treatmentTypeLabel(type: Treatment['type']) {
  return type === 'internal' ? 'Tratamiento interno' : 'Tratamiento externo';
}

/** Shown when the user taps a treatment reminder/due-date notification, letting them log it as applied without opening the pet detail screen. */
export function MarkTreatmentAppliedModal({
  isVisible,
  treatment,
  petName,
  isLoading,
  onConfirm,
  onDismiss
}: MarkTreatmentAppliedModalProps) {
  if (!treatment) return null;

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: spacing[4]
        }}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radius.xl,
            padding: spacing[6],
            width: '100%',
            maxWidth: 400,
            gap: spacing[3]
          }}
        >
          <Text style={{ ...typography.heading, color: colors.foreground, textAlign: 'center' }}>
            ¿Aplicaste el tratamiento?
          </Text>
          <Text style={{ ...typography.body, color: colors.muted, textAlign: 'center' }}>
            {treatment.productName || treatmentTypeLabel(treatment.type)}
            {petName ? ` · ${petName}` : ''}
          </Text>

          <View style={{ flexDirection: 'row', gap: spacing[3], marginTop: spacing[3] }}>
            <Pressable
              onPress={onDismiss}
              disabled={isLoading}
              style={{
                flex: 1,
                paddingVertical: spacing[3],
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: 'center',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              <Text style={{ ...typography.label, color: colors.foreground }}>Todavía no</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              disabled={isLoading}
              style={{
                flex: 1,
                paddingVertical: spacing[3],
                borderRadius: radius.md,
                backgroundColor: colors.primary,
                alignItems: 'center',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.primaryForeground} size="small" />
              ) : (
                <Text style={{ ...typography.label, color: colors.primaryForeground }}>Sí, aplicado hoy</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
