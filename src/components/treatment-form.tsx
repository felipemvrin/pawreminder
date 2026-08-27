import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ChevronDown } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';
import { Modal, Platform, Pressable, Text, TextInput, View } from 'react-native';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { ProductSelect } from '@/components/ProductSelect';
import {
  treatmentFormDefaultValues,
  treatmentFormSchema,
  type TreatmentFormOutput,
  type TreatmentFormValues
} from '@/lib/schemas/treatment-schema';
import { isoDateToDisplay, isoDateToLocalDate, localDateToISO } from '@/lib/date-format';
import { colors, radius, spacing, typography } from '@/theme/tokens';
import { getAllProductos } from '@/utils/desparasitantes';
import type { Producto, TratamientoTipo } from '@/types/desparasitante';

function FieldLabel({ children }: { children: string }) {
  return <Text style={{ ...typography.label, color: colors.foreground }}>{children}</Text>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <Text style={{ ...typography.caption, color: colors.error }}>{message}</Text>;
}

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

interface TreatmentFormProps {
  defaultValues?: TreatmentFormValues;
  submitLabel: string;
  submittingLabel: string;
  isSubmitting: boolean;
  onSubmit: (values: TreatmentFormOutput) => void | Promise<void>;
}

export function TreatmentForm({
  defaultValues = treatmentFormDefaultValues,
  submitLabel,
  submittingLabel,
  isSubmitting,
  onSubmit
}: TreatmentFormProps) {
  const initialProduct = getAllProductos().find(
    (producto) => producto.marca === (defaultValues.productName ?? '')
  );
  const [treatmentType, setTreatmentType] = useState<TratamientoTipo | null>(
    defaultValues.type === 'internal' ? 'interno' : 'externo'
  );
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(initialProduct ?? null);
  const [frequencyDays, setFrequencyDays] = useState<number | ''>(
    initialProduct?.frecuencia_dias ??
      (typeof defaultValues.frequencyDays === 'number' ? defaultValues.frequencyDays : '')
  );
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<TreatmentFormValues, unknown, TreatmentFormOutput>({
    resolver: zodResolver(treatmentFormSchema),
    defaultValues
  });

  const submit = handleSubmit(onSubmit);

  return (
    <View style={{ gap: spacing[5] }}>
      <View style={{ gap: spacing[2] }}>
        <FieldLabel>Tipo de tratamiento</FieldLabel>
        <Controller
          control={control}
          name="type"
          render={({ field: { onChange, value } }) => (
            <View style={{ flexDirection: 'row', gap: spacing[3] }}>
              {[
                { key: 'internal' as const, label: 'Interno' },
                { key: 'external' as const, label: 'Externo' }
              ].map(({ key, label }) => {
                const selected = value === key;
                return (
                  <Pressable
                    key={key}
                    onPress={() => {
                      onChange(key);
                      setTreatmentType(key === 'internal' ? 'interno' : 'externo');
                      setSelectedProduct(null);
                      setFrequencyDays('');
                      setValue('productName', '');
                      setValue('frequencyDays', '');
                    }}
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: spacing[3],
                      borderRadius: radius.md,
                      borderWidth: 1,
                      borderColor: selected ? colors.primary : colors.border,
                      backgroundColor: selected ? colors.secondary : colors.surface
                    }}
                  >
                    <Text
                      style={{
                        ...typography.label,
                        color: selected ? colors.primary : colors.muted
                      }}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        />
        <FieldError message={errors.type?.message} />
      </View>

      <Controller
        control={control}
        name="productName"
        render={({ field: { onChange: onProductChange } }) => (
          <Controller
            control={control}
            name="frequencyDays"
            render={({ field: { onChange: onFrequencyDaysChange } }) => (
              <ProductSelect
                treatmentType={treatmentType}
                selectedProduct={selectedProduct}
                frequencyDays={frequencyDays}
                onProductChange={(product) => {
                  setSelectedProduct(product);
                  onProductChange(product?.marca ?? '');
                }}
                onFrequencyDaysChange={(days) => {
                  setFrequencyDays(days);
                  onFrequencyDaysChange(days);
                }}
              />
            )}
          />
        )}
      />
      <FieldError message={errors.productName?.message ?? errors.frequencyDays?.message} />

      <View style={{ gap: spacing[2] }}>
        <FieldLabel>Última aplicación (DD-MM-AAAA)</FieldLabel>
        <Controller
          control={control}
          name="lastAppliedDate"
          render={({ field: { onChange, value } }) => (
            <>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Seleccionar última fecha de aplicación"
                onPress={() => {
                  setTempDate(isoDateToLocalDate(value));
                  setIsDatePickerVisible(true);
                }}
                style={{
                  ...inputStyle,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Text style={{ fontSize: 16, color: colors.foreground }}>
                  {isoDateToDisplay(value)}
                </Text>
                <ChevronDown size={20} color={colors.muted} />
              </Pressable>
              {isDatePickerVisible && (
                <Modal
                  animationType="slide"
                  transparent
                  visible
                  onRequestClose={() => {
                    setTempDate(null);
                    setIsDatePickerVisible(false);
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      justifyContent: 'flex-end',
                      backgroundColor: 'rgba(0, 0, 0, 0.35)'
                    }}
                  >
                    <View
                      style={{
                        padding: spacing[5],
                        borderTopLeftRadius: radius.lg,
                        borderTopRightRadius: radius.lg,
                        backgroundColor: colors.surface,
                        gap: spacing[3]
                      }}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <Text style={{ ...typography.label, color: colors.foreground }}>
                          Selecciona una fecha
                        </Text>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="Cancelar selección de fecha"
                          onPress={() => {
                            setTempDate(null);
                            setIsDatePickerVisible(false);
                          }}
                        >
                          <Text style={{ ...typography.label, color: colors.primary }}>
                            Cancelar
                          </Text>
                        </Pressable>
                      </View>
                      <DateTimePicker
                        value={tempDate ?? isoDateToLocalDate(value)}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
                        locale="es"
                        onChange={(_event: DateTimePickerEvent, selectedDate?: Date) => {
                          if (Platform.OS === 'android') {
                            if (selectedDate) onChange(localDateToISO(selectedDate));
                            setIsDatePickerVisible(false);
                          } else if (selectedDate) {
                            setTempDate(selectedDate);
                          }
                        }}
                      />
                      {Platform.OS === 'ios' && (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="Confirmar fecha seleccionada"
                          onPress={() => {
                            if (tempDate) onChange(localDateToISO(tempDate));
                            setTempDate(null);
                            setIsDatePickerVisible(false);
                          }}
                          style={{
                            paddingVertical: spacing[3],
                            borderRadius: radius.md,
                            backgroundColor: colors.primary,
                            alignItems: 'center'
                          }}
                        >
                          <Text style={{ ...typography.label, color: colors.primaryForeground }}>
                            Confirmar
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                </Modal>
              )}
            </>
          )}
        />
        <FieldError message={errors.lastAppliedDate?.message} />
      </View>

      <View style={{ gap: spacing[2] }}>
        <FieldLabel>Recordar con anticipación (días)</FieldLabel>
        <Controller
          control={control}
          name="reminderDaysBefore"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value !== undefined ? String(value) : ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Ej. 2"
              placeholderTextColor={colors.muted}
              keyboardType="number-pad"
              style={inputStyle}
            />
          )}
        />
        <FieldError message={errors.reminderDaysBefore?.message} />
      </View>

      <Pressable
        onPress={submit}
        disabled={isSubmitting}
        style={{
          marginTop: spacing[4],
          paddingVertical: spacing[4],
          borderRadius: radius.md,
          backgroundColor: colors.primary,
          alignItems: 'center',
          opacity: isSubmitting ? 0.7 : 1
        }}
      >
        <Text style={{ ...typography.label, color: colors.primaryForeground }}>
          {isSubmitting ? submittingLabel : submitLabel}
        </Text>
      </Pressable>
    </View>
  );
}
