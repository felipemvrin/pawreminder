import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { QueryErrorState, QueryLoadingState } from '@/components/query-state';
import { Screen, useScreenBottomPadding } from '@/components/screen';
import { isoDateToDisplay } from '@/lib/date-format';
import { usePets } from '@/lib/hooks/use-pets';
import { useUpcomingTreatments } from '@/lib/hooks/use-treatments';
import {
  getTreatmentStatus,
  treatmentStatusColors,
  treatmentStatusLabels
} from '@/lib/treatment-status';
import { colors, radius, spacing, typography } from '@/theme/tokens';

const weekdayLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const monthFormatter = new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric' });

function getMonthDays(month: Date) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const leadingDays = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();

  return Array.from({ length: leadingDays + daysInMonth }, (_, index) =>
    index < leadingDays ? undefined : index - leadingDays + 1
  );
}

function monthKey(month: Date) {
  return `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
}

export default function CalendarScreen() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const {
    data: pets,
    isLoading: isLoadingPets,
    isError: isPetsError,
    refetch: refetchPets
  } = usePets();
  const { treatments, isLoading, isError, refetch } = useUpcomingTreatments(pets);
  const bottomPadding = useScreenBottomPadding();
  const selectedMonthKey = monthKey(selectedMonth);
  const treatmentsInMonth = treatments.filter((treatment) =>
    treatment.nextDueDate.startsWith(selectedMonthKey)
  );
  const treatmentsByDay = new Map<number, typeof treatments>();

  treatmentsInMonth.forEach((treatment) => {
    const day = Number(treatment.nextDueDate.slice(-2));
    treatmentsByDay.set(day, [...(treatmentsByDay.get(day) ?? []), treatment]);
  });

  const moveMonth = (offset: number) => {
    setSelectedMonth((month) => new Date(month.getFullYear(), month.getMonth() + offset, 1));
  };

  if (isLoadingPets || isLoading) {
    return (
      <Screen title="Calendario">
        <QueryLoadingState />
      </Screen>
    );
  }

  if (isPetsError || isError) {
    return (
      <Screen title="Calendario">
        <QueryErrorState
          message="No pudimos cargar los tratamientos programados."
          onRetry={() => {
            void refetchPets();
            void refetch();
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen title="Calendario">
      <ScrollView
        contentContainerStyle={{
          padding: spacing[6],
          paddingTop: 0,
          paddingBottom: bottomPadding,
          gap: spacing[5]
        }}
      >
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Pressable
            onPress={() => moveMonth(-1)}
            accessibilityRole="button"
            accessibilityLabel="Mes anterior"
            hitSlop={12}
          >
            <ChevronLeft size={24} color={colors.primary} />
          </Pressable>
          <Text
            style={{ ...typography.heading, color: colors.foreground, textTransform: 'capitalize' }}
          >
            {monthFormatter.format(selectedMonth)}
          </Text>
          <Pressable
            onPress={() => moveMonth(1)}
            accessibilityRole="button"
            accessibilityLabel="Mes siguiente"
            hitSlop={12}
          >
            <ChevronRight size={24} color={colors.primary} />
          </Pressable>
        </View>

        <View style={{ gap: spacing[2] }}>
          <View style={{ flexDirection: 'row' }}>
            {weekdayLabels.map((day) => (
              <Text
                key={day}
                style={{ ...typography.caption, color: colors.muted, flex: 1, textAlign: 'center' }}
              >
                {day}
              </Text>
            ))}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing[2] }}>
            {getMonthDays(selectedMonth).map((day, index) => {
              const dayTreatments = day ? (treatmentsByDay.get(day) ?? []) : [];
              return (
                <View
                  key={`${index}-${day ?? 'empty'}`}
                  style={{ width: '14.2857%', alignItems: 'center' }}
                >
                  {day ? (
                    <View
                      style={{
                        width: 36,
                        height: 42,
                        borderRadius: radius.md,
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: spacing[1],
                        backgroundColor: dayTreatments.length ? colors.secondary : undefined
                      }}
                    >
                      <Text style={{ ...typography.label, color: colors.foreground }}>{day}</Text>
                      {dayTreatments.length ? (
                        <View style={{ flexDirection: 'row', gap: 3 }}>
                          {dayTreatments.slice(0, 3).map((treatment) => (
                            <View
                              key={treatment.id}
                              style={{
                                width: 5,
                                height: 5,
                                borderRadius: radius.full,
                                backgroundColor:
                                  treatmentStatusColors[getTreatmentStatus(treatment.nextDueDate)]
                              }}
                            />
                          ))}
                        </View>
                      ) : null}
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>

        <View style={{ gap: spacing[3] }}>
          <Text style={{ ...typography.label, color: colors.foreground }}>
            Tratamientos programados
          </Text>
          {treatmentsInMonth.length ? (
            treatmentsInMonth.map((treatment) => {
              const status = getTreatmentStatus(treatment.nextDueDate);
              return (
                <View
                  key={treatment.id}
                  style={{
                    padding: spacing[4],
                    borderRadius: radius.lg,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    gap: spacing[1]
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      gap: spacing[2]
                    }}
                  >
                    <Text style={{ ...typography.label, color: colors.foreground, flex: 1 }}>
                      {treatment.productName || 'Tratamiento'}
                    </Text>
                    <Text style={{ ...typography.caption, color: treatmentStatusColors[status] }}>
                      {treatmentStatusLabels[status]}
                    </Text>
                  </View>
                  <Text style={{ ...typography.body, color: colors.muted }}>
                    {treatment.pet.name} · {isoDateToDisplay(treatment.nextDueDate)}
                  </Text>
                </View>
              );
            })
          ) : (
            <Text style={{ ...typography.body, color: colors.muted }}>
              No hay tratamientos programados este mes.
            </Text>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
