import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';

import { QueryClientProvider } from '@tanstack/react-query';
import { TamaguiProvider } from 'tamagui';

import { queryClient } from '@/lib/query-client';
import { ToastProvider } from '@/lib/toast-context';
import { ToastContainer } from '@/components/toast-container';
import { databaseService } from '@/services/database/database-service';
import tamaguiConfig from '../../../tamagui.config';

function DatabaseInitializer({ children }: PropsWithChildren) {
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await databaseService.initialize();
        console.log('Database initialized successfully');
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };

    initializeDatabase();
  }, []);

  return <>{children}</>;
}

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="pawLight">
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <DatabaseInitializer>
            <>
              {children}
              <ToastContainer />
            </>
          </DatabaseInitializer>
        </ToastProvider>
      </QueryClientProvider>
    </TamaguiProvider>
  );
}
