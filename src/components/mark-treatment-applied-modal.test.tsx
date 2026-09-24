import { act, fireEvent, render } from '@testing-library/react-native';

import { MarkTreatmentAppliedModal } from './mark-treatment-applied-modal';
import type { Treatment } from '@/types/domain';

const mockHapticSuccess = jest.fn(() => Promise.resolve());

jest.mock('@/components/animation/PawAnimation', () => {
  const { Text: MockText } = jest.requireActual('react-native');

  return {
    PawAnimation: ({ name }: { name: string }) => <MockText>{name}</MockText>
  };
});
jest.mock('@/utils/haptics', () => ({ hapticSuccess: mockHapticSuccess }));
jest.mock('react-native-reanimated', () => ({
  useReducedMotion: jest.fn(() => false)
}));

const treatment: Treatment = {
  id: 'treatment-1',
  petId: 'pet-1',
  type: 'vaccine',
  productName: 'Vacuna',
  frequencyDays: 365,
  lastAppliedDate: '2026-01-01',
  nextDueDate: '2027-01-01',
  reminderDaysBefore: 7,
  active: true,
  createdAt: '2026-01-01T12:00:00.000Z'
};

describe('MarkTreatmentAppliedModal', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => jest.useRealTimers());

  it('mantiene el modal abierto mientras la confirmación sigue pendiente', () => {
    const onConfirm = jest.fn(() => new Promise<boolean>(() => {}));
    const onAnimationComplete = jest.fn();
    const { getByText, queryByText } = render(
      <MarkTreatmentAppliedModal
        isVisible
        treatment={treatment}
        isLoading={false}
        onConfirm={onConfirm}
        onAnimationComplete={onAnimationComplete}
        onDismiss={jest.fn()}
      />
    );

    fireEvent.press(getByText('Sí, aplicado hoy'));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(queryByText('success')).toBeNull();
    expect(queryByText('confetti')).toBeNull();

    act(() => jest.advanceTimersByTime(1500));

    expect(onAnimationComplete).not.toHaveBeenCalled();
  });

  it('celebra y cierra después del límite cuando la confirmación es exitosa', async () => {
    const onConfirm = jest.fn().mockResolvedValue(true);
    const onAnimationComplete = jest.fn();
    const { getByText, queryByText } = render(
      <MarkTreatmentAppliedModal
        isVisible
        treatment={treatment}
        isLoading={false}
        onConfirm={onConfirm}
        onAnimationComplete={onAnimationComplete}
        onDismiss={jest.fn()}
      />
    );

    expect(queryByText('success')).toBeNull();
    expect(queryByText('confetti')).toBeNull();

    await act(async () => {
      fireEvent.press(getByText('Sí, aplicado hoy'));
      await Promise.resolve();
    });

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(getByText('success')).toBeTruthy();
    expect(getByText('confetti')).toBeTruthy();
    expect(onAnimationComplete).not.toHaveBeenCalled();

    act(() => jest.advanceTimersByTime(1500));

    expect(onAnimationComplete).toHaveBeenCalledTimes(1);
  });

  it('mantiene el modal abierto cuando la confirmación falla', async () => {
    const onAnimationComplete = jest.fn();
    const { getByText, queryByText } = render(
      <MarkTreatmentAppliedModal
        isVisible
        treatment={treatment}
        isLoading={false}
        onConfirm={jest.fn().mockResolvedValue(false)}
        onAnimationComplete={onAnimationComplete}
        onDismiss={jest.fn()}
      />
    );

    await act(async () => {
      fireEvent.press(getByText('Sí, aplicado hoy'));
    });

    expect(queryByText('success')).toBeNull();
    expect(queryByText('confetti')).toBeNull();

    act(() => jest.advanceTimersByTime(1500));

    expect(onAnimationComplete).not.toHaveBeenCalled();
  });
});
