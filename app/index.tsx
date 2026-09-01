import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import { CalendarDays, Cat, Dog, Plus, User } from 'lucide-react-native';
import { FlatList, Pressable, Text, View } from 'react-native';

import { QueryErrorState, QueryLoadingState } from '@/components/query-state';
import { usePets } from '@/lib/hooks/use-pets';
import { usePetTreatmentSummaries } from '@/lib/hooks/use-treatments';
import {
  getTreatmentStatus,
  treatmentStatusColors,
  treatmentStatusLabels
} from '@/lib/treatment-status';
import { Screen, useScreenBottomPadding } from '@/components/screen';
import { colors, radius, spacing, typography } from '@/theme/tokens';
import type { Pet, Treatment } from '@/types/domain';

function PetCard({ pet, nextTreatment }: { pet: Pet; nextTreatment?: Treatment }) {
  const router = useRouter();
  const Icon = pet.species === 'dog' ? Dog : Cat;
  const status = nextTreatment ? getTreatmentStatus(nextTreatment.nextDueDate) : undefined;

  return (
    <Pressable
      onPress={() => router.push(`/pet/${pet.id}`)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[4],
        padding: spacing[4],
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: radius.full,
          backgroundColor: colors.secondary,
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Icon size={24} color={colors.primary} />
      </View>
      <View style={{ flex: 1, gap: spacing[1] }}>
        <Text style={{ ...typography.label, color: colors.foreground }}>{pet.name}</Text>
        <Text style={{ ...typography.caption, color: colors.muted }}>
          {pet.breed ? `${pet.breed} · ` : ''}
          {pet.weightKg} kg
        </Text>
      </View>
      {status && (
        <View
          style={{
            paddingHorizontal: spacing[3],
            paddingVertical: spacing[1],
            borderRadius: radius.full,
            backgroundColor: treatmentStatusColors[status]
          }}
        >
          <Text style={{ ...typography.caption, color: colors.primaryForeground }}>
            {treatmentStatusLabels[status]}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

function EmptyState() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing[2],
        padding: spacing[6]
      }}
    >
      <Text style={{ ...typography.heading, color: colors.foreground, textAlign: 'center' }}>
        Aún no tienes mascotas
      </Text>
      <Text style={{ ...typography.body, color: colors.muted, textAlign: 'center' }}>
        Agrega tu primera mascota para empezar a programar sus recordatorios.
      </Text>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { data: pets, isLoading, isError, refetch } = usePets();
  const { summaries } = usePetTreatmentSummaries(pets);
  const bottomPadding = useScreenBottomPadding();

  const showAnimation = !isLoading && (pets?.length ?? 0) > 0 && (pets?.length ?? 0) <= 4;

  return (
    <Screen
      title="Mis mascotas"
      showBack={false}
      right={
        <View style={{ flexDirection: 'row', gap: spacing[2] }}>
          <Pressable
            onPress={() => router.push('/account')}
            accessibilityRole="button"
            accessibilityLabel="Cuenta y sincronización"
            style={{
              width: 44,
              height: 44,
              borderRadius: radius.full,
              backgroundColor: colors.secondary,
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <User size={21} color={colors.primary} />
          </Pressable>
          <Pressable
            onPress={() => router.push('/calendar')}
            accessibilityRole="button"
            accessibilityLabel="Ver calendario de tratamientos"
            style={{
              width: 44,
              height: 44,
              borderRadius: radius.full,
              backgroundColor: colors.secondary,
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CalendarDays size={21} color={colors.primary} />
          </Pressable>
          <Pressable
            onPress={() => router.push('/pet/new')}
            accessibilityRole="button"
            accessibilityLabel="Agregar mascota"
            style={{
              width: 44,
              height: 44,
              borderRadius: radius.full,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Plus size={22} color={colors.primaryForeground} />
          </Pressable>
        </View>
      }
    >
      {isLoading ? (
        <QueryLoadingState />
      ) : isError ? (
        <QueryErrorState
          message="Revisa tu conexión e inténtalo nuevamente."
          onRetry={() => void refetch()}
        />
      ) : pets && pets.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id}
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: spacing[6],
            paddingTop: 0,
            paddingBottom: showAnimation ? spacing[3] : bottomPadding,
            gap: spacing[3]
          }}
          renderItem={({ item }) => <PetCard pet={item} nextTreatment={summaries.get(item.id)} />}
        />
      )}

      {showAnimation && (
        <View style={{ marginBottom: bottomPadding, gap: spacing[1] }}>
          <LottieView
            source={require('../assets/animations/animacion-home.json')}
            autoPlay
            loop
            style={{ width: '100%', height: 180 }}
            resizeMode="contain"
          />
          <Text style={{ ...typography.caption, color: colors.primary, textAlign: 'center' }}>
            PawReminder
          </Text>
        </View>
      )}
    </Screen>
  );
}
