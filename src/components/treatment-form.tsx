import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import {
  treatmentFormDefaultValues,
  treatmentFormSchema,
  type TreatmentFormOutput,
  type TreatmentFormValues
} from '@/lib/schemas/treatment-schema';
import { isoDateToDisplay, isoDateToLocalDate, localDateToISO } from '@/lib/date-format';
import { colors, radius, spacing, typography } from '@/theme/tokens';

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
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const {
    control,
    handleSubmit,
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
                    onPress={() => onChange(key)}
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

      <View style={{ gap: spacing[2] }}>
        <FieldLabel>Producto (opcional)</FieldLabel>
        <Controller
          control={control}
          name="productName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Ej. Nexgard"
              placeholderTextColor={colors.muted}
              style={inputStyle}
            />
          )}
        />
        <FieldError message={errors.productName?.message} />
      </View>

      <View style={{ gap: spacing[2] }}>
        <FieldLabel>Frecuencia (días)</FieldLabel>
        <Controller
          control={control}
          name="frequencyDays"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value ? String(value) : ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Ej. 30"
              placeholderTextColor={colors.muted}
              keyboardType="number-pad"
              style={inputStyle}
            />
          )}
        />
        <FieldError message={errors.frequencyDays?.message} />
      </View>

      <View style={{ gap: spacing[2] }}>
        <FieldLabel>Última aplicación (DD-MM-AAAA)</FieldLabel>
        <Controller
          control={control}
          name="lastAppliedDate"
          render={({ field: { onChange, value } }) => (
            <>
              <Pressable
                accessibilityRole="button"
                onPress={() => setIsDatePickerVisible(true)}
                style={{ ...inputStyle, justifyContent: 'center' }}
              >
                <Text style={{ fontSize: 16, color: colors.foreground }}>
                  {isoDateToDisplay(value)}
                </Text>
              </Pressable>
              {isDatePickerVisible && (
                <DateTimePicker
                  value={isoDateToLocalDate(value)}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setIsDatePickerVisible(false);
                    if (selectedDate) onChange(localDateToISO(selectedDate));
                  }}
                />
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
