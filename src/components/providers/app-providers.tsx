import type { PropsWithChildren } from 'react';

import { QueryClientProvider } from '@tanstack/react-query';
import { TamaguiProvider } from 'tamagui';

import { queryClient } from '@/lib/query-client';
import tamaguiConfig from '../../../tamagui.config';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="pawLight">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </TamaguiProvider>
  );
}
