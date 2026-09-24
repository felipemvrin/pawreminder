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

  it('evita llamadas duplicadas al completar mientras persiste', async () => {
    let resolveMarkCompleted: (() => void) | undefined;
    jest.mocked(onboardingService.markCompleted).mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveMarkCompleted = resolve;
        })
    );

    render(
      <OnboardingGate>
        <RNText>Aplicacion</RNText>
      </OnboardingGate>
    );

    await waitFor(() => expect(screen.getByRole('button', { name: 'Saltar' })).toBeTruthy());
    fireEvent.press(screen.getByRole('button', { name: 'Saltar' }));
    fireEvent.press(screen.getByRole('button', { name: 'Saltar' }));

    expect(onboardingService.markCompleted).toHaveBeenCalledTimes(1);
    resolveMarkCompleted?.();
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Saltar' })).toBeNull());
  });

  it('mantiene onboarding visible si falla la persistencia', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.mocked(onboardingService.markCompleted).mockRejectedValueOnce(new Error('save failed'));

    render(
      <OnboardingGate>
        <RNText>Aplicacion</RNText>
      </OnboardingGate>
    );

    await waitFor(() => expect(screen.getByRole('button', { name: 'Saltar' })).toBeTruthy());
    fireEvent.press(screen.getByRole('button', { name: 'Saltar' }));

    await waitFor(() => expect(errorSpy).toHaveBeenCalled());
    expect(screen.getByRole('button', { name: 'Saltar' })).toBeTruthy();
    errorSpy.mockRestore();
  });

  it('continua sin onboarding si falla la lectura del estado inicial', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.mocked(onboardingService.hasCompleted).mockRejectedValueOnce(new Error('load failed'));

    render(
      <OnboardingGate>
        <RNText>Aplicacion</RNText>
      </OnboardingGate>
    );

    await waitFor(() => expect(errorSpy).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: 'Saltar' })).toBeNull();
    errorSpy.mockRestore();
  });
});
