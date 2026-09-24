import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PawAnimation } from '@/components/animation/PawAnimation';
import { onboardingService } from '@/services/storage/onboarding-service';
import { colors, radius, spacing, typography } from '@/theme/tokens';

const pages = [
  {
    animation: 'onboarding-pet' as const,
    title: 'Conoce el cuidado de tu mascota',
    message: 'Registra sus datos y organiza todo en un solo lugar.'
  },
  {
    animation: 'onboarding-calendar' as const,
    title: 'Planifica sus cuidados',
    message: 'Programa tratamientos, vacunas y otras fechas importantes.'
  },
  {
    animation: 'onboarding-bell' as const,
    title: 'Recibe recordatorios',
    message: 'PawReminder te avisa cuando se acerquen sus cuidados.'
  }
];

export function OnboardingGate({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadOnboardingState = async () => {
      try {
        const completed = await onboardingService.hasCompleted();
        if (cancelled) return;
        setIsVisible(!completed);
      } catch (error) {
        console.error('Failed to load onboarding state:', error);
      } finally {
        if (!cancelled) setIsReady(true);
      }
    };

    void loadOnboardingState();

    return () => {
      cancelled = true;
    };
  }, []);

  const finish = async () => {
    if (isFinishing) return;
    setIsFinishing(true);
    try {
      await onboardingService.markCompleted();
      setIsVisible(false);
    } catch (error) {
      console.error('Failed to persist onboarding completion:', error);
    } finally {
      setIsFinishing(false);
    }
  };

  const next = () => {
    if (pageIndex === pages.length - 1) {
      void finish();
      return;
    }
    setPageIndex((current) => current + 1);
  };

  const page = pages[pageIndex];

  return (
    <View style={{ flex: 1 }}>
      {children}
      {isReady && isVisible ? (
        <View
          accessibilityViewIsModal
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: colors.background,
            padding: spacing[6],
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing[5]
          }}
        >
          <PawAnimation name={page.animation} size={180} />
          <View style={{ gap: spacing[2], alignItems: 'center' }}>
            <Text style={{ ...typography.heading, color: colors.foreground, textAlign: 'center' }}>
              {page.title}
            </Text>
            <Text style={{ ...typography.body, color: colors.muted, textAlign: 'center' }}>
              {page.message}
            </Text>
          </View>
          <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: pages.length, now: pageIndex + 1 }} style={{ flexDirection: 'row', gap: spacing[2] }}>
            {pages.map((item, index) => (
              <View
                key={item.animation}
                style={{
                  width: index === pageIndex ? spacing[6] : spacing[2],
                  height: spacing[2],
                  borderRadius: radius.full,
                  backgroundColor: index === pageIndex ? colors.primary : colors.border
                }}
              />
            ))}
          </View>
          <View style={{ width: '100%', gap: spacing[3] }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={pageIndex === pages.length - 1 ? 'Comenzar' : 'Continuar'}
              onPress={next}
              disabled={isFinishing}
              style={{ paddingVertical: spacing[3], borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center' }}
            >
              <Text style={{ ...typography.label, color: colors.primaryForeground }}>
                {pageIndex === pages.length - 1 ? 'Comenzar' : 'Continuar'}
              </Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => void finish()} disabled={isFinishing} style={{ alignItems: 'center', padding: spacing[2] }}>
              <Text style={{ ...typography.label, color: colors.muted }}>Saltar</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}
