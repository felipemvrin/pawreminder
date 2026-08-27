import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as Notifications from 'expo-notifications';

import { databaseService } from '@/services/database/database-service';
import { useMarkTreatmentApplied } from '@/lib/hooks/use-treatments';
import { useToast } from '@/lib/toast-context';
import type { Pet, Treatment } from '@/types/domain';
import { useNotificationQuickAction } from './use-notification-quick-action';

jest.mock('expo-notifications', () => ({
  addNotificationResponseReceivedListener: jest.fn()
}));

jest.mock('@/services/database/database-service', () => ({
  databaseService: {
    getTreatmentById: jest.fn(),
    getPetById: jest.fn()
  }
}));

jest.mock('@/lib/hooks/use-treatments', () => ({
  useMarkTreatmentApplied: jest.fn()
}));

jest.mock('@/lib/toast-context', () => ({
  useToast: jest.fn()
}));

const mockAddNotificationResponseReceivedListener = jest.mocked(
  Notifications.addNotificationResponseReceivedListener
);
const mockGetTreatmentById = jest.mocked(databaseService.getTreatmentById);
const mockGetPetById = jest.mocked(databaseService.getPetById);
const mockUseMarkTreatmentApplied = jest.mocked(useMarkTreatmentApplied);
const mockUseToast = jest.mocked(useToast);

const pet: Pet = {
  id: 'pet-1',
  name: 'Luna',
  species: 'dog',
  weightKg: 12,
  livesOutdoors: false,
  createdAt: '2026-08-01T12:00:00.000Z'
};

const treatment: Treatment = {
  id: 'treatment-1',
  petId: pet.id,
  type: 'external',
  productName: 'Pipeta',
  frequencyDays: 30,
  lastAppliedDate: '2026-08-01',
  nextDueDate: '2026-08-26',
  reminderDaysBefore: 2,
  active: true,
  createdAt: '2026-08-01T12:00:00.000Z'
};

function notificationResponse(treatmentId = treatment.id) {
  return {
    notification: {
      request: {
        content: { data: { treatmentId } }
      }
    }
  } as never;
}

describe('useNotificationQuickAction', () => {
  const remove = jest.fn();
  const mutateAsync = jest.fn();
  const success = jest.fn();
  const error = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-08-26T12:00:00.000Z'));
    mockUseMarkTreatmentApplied.mockReturnValue({ isPending: false, mutateAsync } as never);
    mockUseToast.mockReturnValue({ success, error } as never);
    mockGetTreatmentById.mockResolvedValue(treatment);
    mockGetPetById.mockResolvedValue(pet);
    mutateAsync.mockResolvedValue({ id: 'log-1' });
    mockAddNotificationResponseReceivedListener.mockReturnValue({ remove } as never);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('opens the quick action when a notification contains a treatment ID', async () => {
    const { result } = renderHook(() => useNotificationQuickAction());
    const listener = mockAddNotificationResponseReceivedListener.mock.calls[0][0];

    await act(async () => {
      await listener(notificationResponse());
    });

    await waitFor(() => {
      expect(result.current.isOpen).toBe(true);
    });
    expect(result.current.treatment).toBe(treatment);
    expect(result.current.petName).toBe('Luna');
    expect(mockGetTreatmentById).toHaveBeenCalledWith('treatment-1');
    expect(mockGetPetById).toHaveBeenCalledWith('pet-1');
  });

  it('marks the treatment as applied, shows success, and closes the action', async () => {
    const { result } = renderHook(() => useNotificationQuickAction());
    const listener = mockAddNotificationResponseReceivedListener.mock.calls[0][0];

    await act(async () => {
      await listener(notificationResponse());
    });

    await act(async () => {
      await result.current.confirm();
    });

    expect(mutateAsync).toHaveBeenCalledWith({
      treatmentId: 'treatment-1',
      petId: 'pet-1',
      appliedDate: '2026-08-26'
    });
    expect(success).toHaveBeenCalledWith('Tratamiento registrado, próxima fecha actualizada');
    expect(result.current.isOpen).toBe(false);
  });

  it('shows an error and keeps the action open when marking fails', async () => {
    mutateAsync.mockRejectedValueOnce(new Error('database failure'));
    const { result } = renderHook(() => useNotificationQuickAction());
    const listener = mockAddNotificationResponseReceivedListener.mock.calls[0][0];

    await act(async () => {
      await listener(notificationResponse());
    });
    await act(async () => {
      await result.current.confirm();
    });

    expect(error).toHaveBeenCalledWith('No se pudo registrar el tratamiento');
    expect(result.current.isOpen).toBe(true);
  });

  it('removes the notification listener when unmounted', () => {
    const { unmount } = renderHook(() => useNotificationQuickAction());

    unmount();

    expect(remove).toHaveBeenCalledTimes(1);
  });
});
