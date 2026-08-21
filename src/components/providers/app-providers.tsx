import type { PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider } from 'tamagui';

import { queryClient } from '@/lib/query-client';
import { ToastProvider } from '@/lib/toast-context';
import { ToastContainer } from '@/components/toast-container';
import { MarkTreatmentAppliedModal } from '@/components/mark-treatment-applied-modal';
import { useNotificationQuickAction } from '@/lib/use-notification-quick-action';
import { databaseService } from '@/services/database/database-service';
import { colors } from '@/theme/tokens';
import tamaguiConfig from '../../../tamagui.config';

function DatabaseInitializer({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const initializeDatabase = async () => {
      try {
        await databaseService.initialize();
        console.log('Database initialized successfully');
      } catch (error) {
        console.error('Failed to initialize database:', error);
      } finally {
        if (!cancelled) setIsReady(true);
      }
    };

    initializeDatabase();

    return () => {
      cancelled = true;
    };
  }, []);

  // Hold rendering until the DB is ready so queries don't fire before initialization completes
  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background
        }}
      >
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

function NotificationQuickActionHandler() {
  const quickAction = useNotificationQuickAction();

  return (
    <MarkTreatmentAppliedModal
      isVisible={quickAction.isOpen}
      treatment={quickAction.treatment}
      petName={quickAction.petName}
      isLoading={quickAction.isLoading}
      onConfirm={quickAction.confirm}
      onDismiss={quickAction.dismiss}
    />
  );
}

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider>
      <TamaguiProvider config={tamaguiConfig} defaultTheme="pawLight">
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <DatabaseInitializer>
              <>
                {children}
                <ToastContainer />
                <NotificationQuickActionHandler />
              </>
            </DatabaseInitializer>
          </ToastProvider>
        </QueryClientProvider>
      </TamaguiProvider>
    </SafeAreaProvider>
  );
}
