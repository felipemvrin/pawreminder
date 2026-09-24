import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppProviders } from '@/components/providers/app-providers';
import { OnboardingGate } from '@/components/onboarding';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <OnboardingGate>
        <AppProviders>
          <Stack screenOptions={{ headerShown: false }} />
        </AppProviders>
      </OnboardingGate>
    </GestureHandlerRootView>
  );
}
