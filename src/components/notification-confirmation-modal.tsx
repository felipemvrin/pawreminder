import React from 'react';
import { Modal, View, Text, Pressable, ActivityIndicator } from 'react-native';
import type { Treatment } from '@/types/domain';
import { AlertCircle } from 'lucide-react-native';

interface NotificationConfirmationModalProps {
  isVisible: boolean;
  treatment: Treatment | null;
  isLoading: boolean;
  onConfirm: (treatment: Treatment) => void;
  onCancel: () => void;
}

export const NotificationConfirmationModal: React.FC<NotificationConfirmationModalProps> = ({
  isVisible,
  treatment,
  isLoading,
  onConfirm,
  onCancel,
}) => {
  if (!treatment) return null;

  const getTreatmentLabel = (type: string) => {
    const labels: Record<string, string> = {
      internal: 'Tratamiento interno',
      external: 'Tratamiento externo',
    };
    return labels[type] || 'Tratamiento';
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 16,
        }}
      >
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 24,
            width: '100%',
            maxWidth: 400,
            alignItems: 'center',
          }}
        >
          <AlertCircle size={48} color="#f59e0b" />

          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              marginTop: 16,
              textAlign: 'center',
              color: '#1f2937',
            }}
          >
            ¿Confirmar cambios en notificaciones?
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: '#6b7280',
              marginTop: 12,
              textAlign: 'center',
              lineHeight: 20,
            }}
          >
            Se cancelarán las notificaciones previas y se programarán nuevas para:
            {'\n\n'}
            <Text style={{ fontWeight: '600', color: '#1f2937' }}>
              {getTreatmentLabel(treatment.type)}
            </Text>
            {treatment.productName && (
              <>
                {'\n'}
                <Text style={{ fontWeight: '500' }}>{treatment.productName}</Text>
              </>
            )}
            {'\n\n'}
            Próxima fecha: <Text style={{ fontWeight: '600' }}>{treatment.nextDueDate}</Text>
          </Text>

          <View
            style={{
              flexDirection: 'row',
              gap: 12,
              marginTop: 24,
              width: '100%',
            }}
          >
            <Pressable
              onPress={onCancel}
              disabled={isLoading}
              style={{
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 8,
                backgroundColor: '#e5e7eb',
                justifyContent: 'center',
                alignItems: 'center',
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              <Text
                style={{
                  color: '#374151',
                  fontWeight: '600',
                  fontSize: 14,
                }}
              >
                Cancelar
              </Text>
            </Pressable>

            <Pressable
              onPress={() => onConfirm(treatment)}
              disabled={isLoading}
              style={{
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 8,
                backgroundColor: '#3b82f6',
                justifyContent: 'center',
                alignItems: 'center',
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text
                  style={{
                    color: '#fff',
                    fontWeight: '600',
                    fontSize: 14,
                  }}
                >
                  Confirmar
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
