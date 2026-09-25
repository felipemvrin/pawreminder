import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { QueryErrorState, QueryLoadingState } from '@/components/query-state';
import { Screen, useScreenBottomPadding } from '@/components/screen';
import {
  getMonthDays,
  getTreatmentsInMonth,
  groupTreatmentsByDueDay
} from '@/lib/calendar-utils';
import { isoDateToDisplay } from '@/lib/date-format';
import { usePets } from '@/lib/hooks/use-pets';
import { useUpcomingTreatments } from '@/lib/hooks/use-treatments';
import {
  getTreatmentStatus,
  treatmentStatusColors,
  treatmentStatusLabels
} from '@/lib/treatment-status';
import { colors, radius, spacing, typography } from '@/theme/tokens';
import { hapticLight } from '@/utils/haptics';

const weekdayLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const monthFormatter = new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric' });

export default function CalendarScreen() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const {
    data: pets,
    isLoading: isLoadingPets,
    isError: isPetsError,
    refetch: refetchPets
  } = usePets();
  const { treatments, isLoading, isError, refetch } = useUpcomingTreatments(pets);
  const bottomPadding = useScreenBottomPadding();
  const treatmentsInMonth = getTreatmentsInMonth(treatments, selectedMonth);
  const filteredTreatments = selectedPetId
    ? treatmentsInMonth.filter((treatment) => treatment.petId === selectedPetId)
    : treatmentsInMonth;
  const treatmentsByDay = groupTreatmentsByDueDay(filteredTreatments);
  const visibleTreatments = selectedDay
    ? filteredTreatments.filter(
        (treatment) => Number(treatment.nextDueDate.substring(8, 10)) === selectedDay
      )
    : filteredTreatments;

  const moveMonth = (offset: number) => {
    setSelectedMonth((month) => new Date(month.getFullYear(), month.getMonth() + offset, 1));
    setSelectedDay(null);
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
            onPress={() => {
              void hapticLight();
              moveMonth(-1);
            }}
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
            onPress={() => {
              void hapticLight();
              moveMonth(1);
            }}
            accessibilityRole="button"
            accessibilityLabel="Mes siguiente"
            hitSlop={12}
          >
            <ChevronRight size={24} color={colors.primary} />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing[2] }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Todas las mascotas"
            accessibilityState={{ selected: selectedPetId === null }}
            onPress={() => {
              void hapticLight();
              setSelectedPetId(null);
            }}
            style={{
              paddingHorizontal: spacing[3],
              paddingVertical: spacing[2],
              borderRadius: radius.full,
              backgroundColor: selectedPetId === null ? colors.primary : colors.secondary
            }}
          >
            <Text
              style={{
                ...typography.caption,
                color: selectedPetId === null ? colors.primaryForeground : colors.primary
              }}
            >
              Todas
            </Text>
          </Pressable>
          {(pets ?? []).map((pet) => {
            const selected = selectedPetId === pet.id;
            return (
              <Pressable
                key={pet.id}
                accessibilityRole="button"
                accessibilityLabel={`Filtrar por ${pet.name}`}
                accessibilityState={{ selected }}
                onPress={() => {
                  void hapticLight();
                  setSelectedPetId(pet.id);
                }}
                style={{
                  paddingHorizontal: spacing[3],
                  paddingVertical: spacing[2],
                  borderRadius: radius.full,
                  backgroundColor: selected ? colors.primary : colors.secondary
                }}
              >
                <Text
                  style={{
                    ...typography.caption,
                    color: selected ? colors.primaryForeground : colors.primary
                  }}
                >
                  {pet.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

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
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Seleccionar día ${day}`}
                      accessibilityState={{ selected: selectedDay === day }}
                      onPress={() => {
                        void hapticLight();
                        setSelectedDay((current) => (current === day ? null : day));
                      }}
                      style={{
                        width: 36,
                        height: 42,
                        borderRadius: radius.md,
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: spacing[1],
                        backgroundColor:
                          selectedDay === day
                            ? colors.primary
                            : dayTreatments.length
                              ? colors.secondary
                              : undefined
                      }}
                    >
                      <Text
                        style={{
                          ...typography.label,
                          color: selectedDay === day ? colors.primaryForeground : colors.foreground
                        }}
                      >
                        {day}
                      </Text>
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
                                  selectedDay === day
                                    ? colors.primaryForeground
                                    : treatmentStatusColors[getTreatmentStatus(treatment.nextDueDate)]
                              }}
                            />
                          ))}
                        </View>
                      ) : null}
                    </Pressable>
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>

        <View style={{ gap: spacing[3] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ ...typography.label, color: colors.foreground }}>
              {selectedDay ? `Cuidados del día ${selectedDay}` : 'Tratamientos programados'}
            </Text>
            {selectedDay ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Ver todo el mes"
                onPress={() => setSelectedDay(null)}
              >
                <Text style={{ ...typography.caption, color: colors.primary }}>Ver mes</Text>
              </Pressable>
            ) : null}
          </View>
          {visibleTreatments.length ? (
            visibleTreatments.map((treatment) => {
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
              {selectedDay
                ? 'No hay cuidados programados para este día.'
                : 'No hay tratamientos programados este mes.'}
            </Text>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
