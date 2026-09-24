import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Text as RNText } from 'react-native';

import { OnboardingGate } from './onboarding';
import { onboardingService } from '@/services/storage/onboarding-service';

jest.mock('@/components/animation/PawAnimation', () => {
  const { createElement } = jest.requireActual<typeof import('react')>('react');
  const { Text } = jest.requireActual<typeof import('react-native')>('react-native');

  return {
    PawAnimation: ({ name }: { name: string }) => createElement(Text, null, name)
  };
});
jest.mock('@/services/storage/onboarding-service', () => ({
  onboardingService: {
    hasCompleted: jest.fn(),
    markCompleted: jest.fn(() => Promise.resolve())
  }
}));

describe('OnboardingGate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(onboardingService.hasCompleted).mockResolvedValue(false);
  });

  it('permite avanzar por las tres pantallas y completar', async () => {
    render(
      <OnboardingGate>
        <RNText>Aplicacion</RNText>
      </OnboardingGate>
    );

    expect(screen.getByText('Aplicacion')).toBeTruthy();
    await waitFor(() => expect(screen.getByText('Conoce el cuidado de tu mascota')).toBeTruthy());

    fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));
    expect(screen.getByText('Planifica sus cuidados')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));
    expect(screen.getByText('Recibe recordatorios')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Comenzar' }));

    await waitFor(() => expect(screen.queryByText('Recibe recordatorios')).toBeNull());
    expect(onboardingService.markCompleted).toHaveBeenCalledTimes(1);
  });

  it('permite saltar el onboarding', async () => {
    render(
      <OnboardingGate>
        <RNText>Aplicacion</RNText>
      </OnboardingGate>
    );

    await waitFor(() => expect(screen.getByRole('button', { name: 'Saltar' })).toBeTruthy());
    fireEvent.press(screen.getByRole('button', { name: 'Saltar' }));

    await waitFor(() => expect(screen.queryByRole('button', { name: 'Saltar' })).toBeNull());
    expect(onboardingService.markCompleted).toHaveBeenCalledTimes(1);
  });
});
