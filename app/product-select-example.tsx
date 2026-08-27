import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { ProductSelect } from '@/components/ProductSelect';
import { Screen } from '@/components/screen';
import type { Producto, TratamientoTipo } from '@/types/desparasitante';
import { colors, radius, spacing, typography } from '@/theme/tokens';

export default function ProductSelectExampleScreen() {
  const [productName, setProductName] = useState('');
  const [treatmentType, setTreatmentType] = useState<TratamientoTipo | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [frequencyDays, setFrequencyDays] = useState<number | ''>('');

  return (
    <Screen title="Seleccionar producto">
      <ScrollView contentContainerStyle={{ padding: spacing[6], gap: spacing[5] }}>
        <View style={{ flexDirection: 'row', gap: spacing[3] }}>
          {(['interno', 'externo'] as const).map((type) => (
            <Pressable
              key={type}
              onPress={() => {
                setTreatmentType(type);
                setSelectedProduct(null);
                setProductName('');
                setFrequencyDays('');
              }}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: spacing[3],
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: treatmentType === type ? colors.primary : colors.border,
                backgroundColor: treatmentType === type ? colors.secondary : colors.surface
              }}
            >
              <Text style={{ ...typography.label, color: colors.foreground }}>
                {type === 'interno' ? 'Interno' : 'Externo'}
              </Text>
            </Pressable>
          ))}
        </View>
        <ProductSelect
          treatmentType={treatmentType}
          selectedProduct={selectedProduct}
          frequencyDays={frequencyDays}
          onProductChange={(product) => {
            setSelectedProduct(product);
            setProductName(product?.marca ?? '');
          }}
          onFrequencyDaysChange={setFrequencyDays}
        />
        <Text style={{ ...typography.caption, color: colors.muted }}>
          Producto: {productName || 'sin selección'} | Frecuencia:{' '}
          {frequencyDays || 'sin selección'}
        </Text>
      </ScrollView>
    </Screen>
  );
}
