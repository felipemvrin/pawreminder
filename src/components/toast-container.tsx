import React from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast, type ToastType } from '@/lib/toast-context';
import { X } from 'lucide-react-native';

const getToastStyles = (type: ToastType) => {
  const baseStyles = {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginHorizontal: 12,
    marginTop: 8,
  };

  const colors = {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  };

  return {
    ...baseStyles,
    backgroundColor: colors[type],
  };
};

const ToastMessage: React.FC<{ text: string }> = ({ text }) => {
  return (
    <Text
      style={{
        color: '#fff',
        fontSize: 14,
        flex: 1,
        fontWeight: '500',
      }}
      numberOfLines={3}
    >
      {text}
    </Text>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) return null;

  return (
    <View
      style={{
        position: 'absolute',
        top: insets.top + 8,
        left: 0,
        right: 0,
        zIndex: 9999,
        pointerEvents: 'box-none',
      }}
    >
      {toasts.map((toast) => (
        <Animated.View key={toast.id} style={getToastStyles(toast.type)}>
          <ToastMessage text={toast.message} />
          <Pressable
            onPress={() => removeToast(toast.id)}
            style={{
              paddingLeft: 12,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <X size={18} color="#fff" />
          </Pressable>
        </Animated.View>
      ))}
    </View>
  );
};
