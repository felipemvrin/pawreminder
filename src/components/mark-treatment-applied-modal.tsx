import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useReducedMotion } from 'react-native-reanimated';

import { PawAnimation } from '@/components/animation/PawAnimation';
import { colors, radius, spacing, typography } from '@/theme/tokens';
import { hapticSuccess } from '@/utils/haptics';
import type { Treatment } from '@/types/domain';

interface MarkTreatmentAppliedModalProps {
  isVisible: boolean;
  treatment: Treatment | null;
  petName?: string;
  isLoading: boolean;
  onConfirm: () => Promise<boolean> | boolean;
  onAnimationComplete?: () => void;
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
  onAnimationComplete,
  onDismiss
}: MarkTreatmentAppliedModalProps) {
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const reducedMotion = useReducedMotion();
  const isConfirmPending = isLoading || isSubmitting;

  useEffect(() => {
    if (!isCelebrating) return;

    const timeout = setTimeout(() => {
      setIsCelebrating(false);
      onAnimationComplete?.();
    }, reducedMotion ? 0 : 1500);

    return () => clearTimeout(timeout);
  }, [isCelebrating, onAnimationComplete, reducedMotion]);

  if (!treatment) return null;

  const handleConfirm = async () => {
    if (isCelebrating || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const isConfirmed = await onConfirm();
      if (!isConfirmed) return;

      setIsCelebrating(true);
      void hapticSuccess();
    } catch {
      // The caller is responsible for surfacing the error to the user.
    } finally {
      setIsSubmitting(false);
    }
  };

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
          {isCelebrating ? (
            <View
              pointerEvents="none"
              style={{ alignItems: 'center', justifyContent: 'center', minHeight: 120 }}
            >
              <PawAnimation name="success" size={92} loop={false} autoPlay={!reducedMotion} />
              {!reducedMotion ? (
                <View style={{ position: 'absolute' }}>
                  <PawAnimation name="confetti" size={150} loop={false} />
                </View>
              ) : null}
            </View>
          ) : null}
          <Text style={{ ...typography.heading, color: colors.foreground, textAlign: 'center' }}>
            {isCelebrating ? 'Tratamiento registrado' : '¿Aplicaste el tratamiento?'}
          </Text>
          <Text style={{ ...typography.body, color: colors.muted, textAlign: 'center' }}>
            {treatment.productName || treatmentTypeLabel(treatment.type)}
            {petName ? ` · ${petName}` : ''}
          </Text>

          <View style={{ flexDirection: 'row', gap: spacing[3], marginTop: spacing[3] }}>
            <Pressable
              onPress={onDismiss}
              disabled={isConfirmPending}
              style={{
                flex: 1,
                paddingVertical: spacing[3],
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: 'center',
                opacity: isConfirmPending ? 0.6 : 1
              }}
            >
              <Text style={{ ...typography.label, color: colors.foreground }}>Todavía no</Text>
            </Pressable>
            <Pressable
              onPress={handleConfirm}
              disabled={isConfirmPending || isCelebrating}
              style={{
                flex: 1,
                paddingVertical: spacing[3],
                borderRadius: radius.md,
                backgroundColor: colors.primary,
                alignItems: 'center',
                opacity: isConfirmPending ? 0.6 : 1
              }}
            >
              {isConfirmPending ? (
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
