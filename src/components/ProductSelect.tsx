import { useEffect, useState } from 'react';
import { FlatList, Modal, Pressable, Text, TextInput, View } from 'react-native';

import { getAllProductos } from '@/utils/desparasitantes';
import type { Producto } from '@/types/desparasitante';
import { colors, radius, spacing, typography } from '@/theme/tokens';

const productos = getAllProductos();

const inputStyle = {
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radius.md,
  paddingHorizontal: spacing[4],
  paddingVertical: spacing[3],
  fontSize: 16,
  color: colors.foreground,
  backgroundColor: colors.surface
};

interface ProductSelectProps {
  productName?: string;
  onProductChange: (productName: string, product?: Producto) => void;
  onFrequencyDaysChange: (frequencyDays: number) => void;
}

export function ProductSelect({
  productName = '',
  onProductChange,
  onFrequencyDaysChange
}: ProductSelectProps) {
  const [selectedProduct, setSelectedProduct] = useState<Producto | undefined>(() =>
    productos.find((producto) => producto.marca === productName)
  );
  const [frequencyDays, setFrequencyDays] = useState<number | ''>(
    selectedProduct?.frecuencia_dias ?? ''
  );
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const nextProduct = productos.find((producto) => producto.marca === productName);
    setSelectedProduct(nextProduct);
    setFrequencyDays(nextProduct?.frecuencia_dias ?? '');
  }, [productName]);

  function selectProduct(product: Producto) {
    setSelectedProduct(product);
    setFrequencyDays(product.frecuencia_dias);
    onProductChange(product.marca, product);
    onFrequencyDaysChange(product.frecuencia_dias);
    setIsModalVisible(false);
  }

  return (
    <View style={{ gap: spacing[5] }}>
      <View style={{ gap: spacing[2] }}>
        <Text style={{ ...typography.label, color: colors.foreground }}>Producto</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Seleccionar producto"
          onPress={() => setIsModalVisible(true)}
          style={{ ...inputStyle, justifyContent: 'center' }}
        >
          <Text style={{ fontSize: 16, color: selectedProduct ? colors.foreground : colors.muted }}>
            {selectedProduct?.marca ?? 'Selecciona un producto'}
          </Text>
        </Pressable>
      </View>

      <View style={{ gap: spacing[2] }}>
        <Text style={{ ...typography.label, color: colors.foreground }}>Frecuencia (días)</Text>
        <TextInput
          accessibilityLabel="Frecuencia en días"
          editable={false}
          value={frequencyDays === '' ? '' : String(frequencyDays)}
          style={{ ...inputStyle, color: colors.muted }}
        />
      </View>

      <Modal
        animationType="slide"
        transparent
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View
          style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.35)' }}
        >
          <View
            style={{
              maxHeight: '75%',
              padding: spacing[5],
              borderTopLeftRadius: radius.lg,
              borderTopRightRadius: radius.lg,
              backgroundColor: colors.surface
            }}
          >
            <Text
              style={{ ...typography.label, color: colors.foreground, marginBottom: spacing[3] }}
            >
              Selecciona un producto
            </Text>
            <FlatList
              data={productos}
              keyExtractor={(product, index) => `${product.tipo}-${product.marca}-${index}`}
              renderItem={({ item }) => (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => selectProduct(item)}
                  style={{
                    paddingVertical: spacing[3],
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border
                  }}
                >
                  <Text style={{ ...typography.body, color: colors.foreground }}>{item.marca}</Text>
                  <Text style={{ ...typography.caption, color: colors.muted }}>
                    {item.tipo === 'externo' ? 'Externo' : 'Interno'}
                  </Text>
                </Pressable>
              )}
            />
            <Pressable onPress={() => setIsModalVisible(false)} style={{ paddingTop: spacing[4] }}>
              <Text style={{ ...typography.label, color: colors.primary, textAlign: 'center' }}>
                Cancelar
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
