import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { databaseService } from '@/services/database/database-service';
import type { Pet, Treatment } from '@/types/domain';
import { treatmentsKeys, usePetCareDashboard } from './use-treatments';

jest.mock('@/services/database/database-service', () => ({
  databaseService: {
    getTreatmentsByPetId: jest.fn()
  }
}));

jest.mock('@/services/notifications/notification-service', () => ({
  notificationService: {
    scheduleTreatmentNotifications: jest.fn(),
    cancelTreatmentNotifications: jest.fn(),
    markTreatmentAsApplied: jest.fn()
  }
}));

const mockGetTreatmentsByPetId = jest.mocked(databaseService.getTreatmentsByPetId);
const queryClients: QueryClient[] = [];

const pets: Pet[] = [
  {
    id: 'pet-1',
    name: 'Luna',
    species: 'dog',
    weightKg: 12,
    livesOutdoors: false,
    createdAt: '2026-08-01T12:00:00.000Z'
  },
  {
    id: 'pet-2',
    name: 'Milo',
    species: 'cat',
    weightKg: 5,
    livesOutdoors: false,
    createdAt: '2026-08-01T12:00:00.000Z'
  }
];

function createTreatment(overrides: Partial<Treatment> = {}): Treatment {
  return {
    id: 'treatment-1',
    petId: 'pet-1',
    type: 'internal',
    frequencyDays: 30,
    lastAppliedDate: '2099-08-01',
    nextDueDate: '2099-08-26',
    reminderDaysBefore: 2,
    active: true,
    createdAt: '2099-08-01T12:00:00.000Z',
    ...overrides
  };
}

function createQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });

  queryClients.push(queryClient);
  return queryClient;
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('usePetCareDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    queryClients.splice(0).forEach((queryClient) => {
      queryClient.clear();
    });
  });

  it('does not expose fake progress while pet treatments are still loading', async () => {
    let resolvePet1: ((value: Treatment[]) => void) | undefined;
    let resolvePet2: ((value: Treatment[]) => void) | undefined;

    mockGetTreatmentsByPetId.mockImplementation(
      (petId) =>
        new Promise<Treatment[]>((resolve) => {
          if (petId === 'pet-1') {
            resolvePet1 = resolve;
            return;
          }
          resolvePet2 = resolve;
        })
    );

    const queryClient = createQueryClient();
    const { result } = renderHook(() => usePetCareDashboard(pets), {
      wrapper: createWrapper(queryClient)
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.progress.get('pet-1')).toBeUndefined();
    expect(result.current.progress.get('pet-2')).toBeUndefined();
    expect(result.current.summaries.get('pet-1')).toBeUndefined();

    await act(async () => {
      resolvePet1?.([createTreatment()]);
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.progress.get('pet-1')).toBeUndefined();
    expect(result.current.progress.get('pet-2')).toBeUndefined();

    await act(async () => {
      resolvePet2?.([createTreatment({ id: 'treatment-2', petId: 'pet-2', active: false })]);
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.progress.get('pet-1')).toEqual({ completed: 1, total: 1 });
    expect(result.current.progress.get('pet-2')).toEqual({ completed: 0, total: 0 });
  });

  it('surfaces query errors without fabricating dashboard values', async () => {
    mockGetTreatmentsByPetId.mockRejectedValueOnce(new Error('db failed'));
    mockGetTreatmentsByPetId.mockResolvedValueOnce([createTreatment({ petId: 'pet-2' })]);

    const queryClient = createQueryClient();
    const { result } = renderHook(() => usePetCareDashboard(pets), {
      wrapper: createWrapper(queryClient)
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(true);
    expect(result.current.progress.get('pet-1')).toBeUndefined();
    expect(result.current.summaries.get('pet-1')).toBeUndefined();
    expect(result.current.progress.get('pet-2')).toEqual({ completed: 1, total: 1 });
  });

  it('preserves dashboard data while a pet query is refetching', async () => {
    mockGetTreatmentsByPetId.mockResolvedValueOnce([createTreatment()]);
    mockGetTreatmentsByPetId.mockResolvedValueOnce([
      createTreatment({ id: 'treatment-2', petId: 'pet-2' })
    ]);

    const queryClient = createQueryClient();
    const { result } = renderHook(() => usePetCareDashboard(pets), {
      wrapper: createWrapper(queryClient)
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.progress.get('pet-1')).toEqual({ completed: 1, total: 1 });

    let resolveRefetch: ((value: Treatment[]) => void) | undefined;
    mockGetTreatmentsByPetId.mockImplementationOnce(
      () =>
        new Promise<Treatment[]>((resolve) => {
          resolveRefetch = resolve;
        })
    );

    await act(async () => {
      void queryClient.invalidateQueries({ queryKey: treatmentsKeys.byPet('pet-1') });
    });

    await waitFor(() => expect(result.current.isLoading).toBe(true));
    expect(result.current.progress.get('pet-1')).toEqual({ completed: 1, total: 1 });
    expect(result.current.summaries.get('pet-1')?.id).toBe('treatment-1');

    await act(async () => {
      resolveRefetch?.([createTreatment()]);
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });
});
