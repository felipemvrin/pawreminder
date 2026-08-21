import { zodResolver } from '@hookform/resolvers/zod';
import { Cat, Dog } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, Switch, Text, TextInput, View } from 'react-native';

import {
  petFormDefaultValues,
  petFormSchema,
  type PetFormOutput,
  type PetFormValues
} from '@/lib/schemas/pet-schema';
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

interface PetFormProps {
  defaultValues?: PetFormValues;
  submitLabel: string;
  submittingLabel: string;
  isSubmitting: boolean;
  onSubmit: (values: PetFormOutput) => void | Promise<void>;
}

export function PetForm({
  defaultValues = petFormDefaultValues,
  submitLabel,
  submittingLabel,
  isSubmitting,
  onSubmit
}: PetFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<PetFormValues, unknown, PetFormOutput>({
    resolver: zodResolver(petFormSchema),
    defaultValues
  });

  const submit = handleSubmit(onSubmit);

  return (
    <View style={{ gap: spacing[5] }}>
      <View style={{ gap: spacing[2] }}>
        <FieldLabel>Nombre</FieldLabel>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Ej. Firulais"
              placeholderTextColor={colors.muted}
              style={inputStyle}
            />
          )}
        />
        <FieldError message={errors.name?.message} />
      </View>

      <View style={{ gap: spacing[2] }}>
        <FieldLabel>Especie</FieldLabel>
        <Controller
          control={control}
          name="species"
          render={({ field: { onChange, value } }) => (
            <View style={{ flexDirection: 'row', gap: spacing[3] }}>
              {(
                [
                  { key: 'dog' as const, label: 'Perro', Icon: Dog },
                  { key: 'cat' as const, label: 'Gato', Icon: Cat }
                ]
              ).map(({ key, label, Icon }) => {
                const selected = value === key;
                return (
                  <Pressable
                    key={key}
                    onPress={() => onChange(key)}
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: spacing[2],
                      paddingVertical: spacing[3],
                      borderRadius: radius.md,
                      borderWidth: 1,
                      borderColor: selected ? colors.primary : colors.border,
                      backgroundColor: selected ? colors.secondary : colors.surface
                    }}
                  >
                    <Icon size={18} color={selected ? colors.primary : colors.muted} />
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
        <FieldError message={errors.species?.message} />
      </View>

      <View style={{ gap: spacing[2] }}>
        <FieldLabel>Raza (opcional)</FieldLabel>
        <Controller
          control={control}
          name="breed"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Ej. Labrador"
              placeholderTextColor={colors.muted}
              style={inputStyle}
            />
          )}
        />
        <FieldError message={errors.breed?.message} />
      </View>

      <View style={{ gap: spacing[2] }}>
        <FieldLabel>Peso (kg)</FieldLabel>
        <Controller
          control={control}
          name="weightKg"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value ? String(value) : ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Ej. 12.5"
              placeholderTextColor={colors.muted}
              keyboardType="decimal-pad"
              style={inputStyle}
            />
          )}
        />
        <FieldError message={errors.weightKg?.message} />
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <FieldLabel>Vive al aire libre</FieldLabel>
        <Controller
          control={control}
          name="livesOutdoors"
          render={({ field: { onChange, value } }) => (
            <Switch
              value={value}
              onValueChange={onChange}
              trackColor={{ true: colors.primary, false: colors.border }}
            />
          )}
        />
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
