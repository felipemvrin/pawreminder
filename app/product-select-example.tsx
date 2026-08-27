import { useState } from 'react';
import { ScrollView, Text } from 'react-native';

import { ProductSelect } from '@/components/ProductSelect';
import { Screen } from '@/components/screen';
import { spacing, typography, colors } from '@/theme/tokens';

export default function ProductSelectExampleScreen() {
  const [productName, setProductName] = useState('');
  const [frequencyDays, setFrequencyDays] = useState(0);

  return (
    <Screen title="Seleccionar producto">
      <ScrollView contentContainerStyle={{ padding: spacing[6], gap: spacing[5] }}>
        <ProductSelect
          productName={productName}
          onProductChange={(name) => setProductName(name)}
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
