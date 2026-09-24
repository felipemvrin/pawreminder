import { act, fireEvent, render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { MarkTreatmentAppliedModal } from './mark-treatment-applied-modal';
import type { Treatment } from '@/types/domain';

const mockHapticSuccess = jest.fn(() => Promise.resolve());

jest.mock('@/components/animation/PawAnimation', () => ({
  PawAnimation: ({ name }: { name: string }) => <Text>{name}</Text>
}));
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

  it('dispara el háptico, la celebración y cierra después del límite', () => {
    const onConfirm = jest.fn();
    const onAnimationComplete = jest.fn();
    const { getByText } = render(
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
    expect(mockHapticSuccess).toHaveBeenCalledTimes(1);
    expect(getByText('success')).toBeTruthy();
    expect(getByText('confetti')).toBeTruthy();
    expect(onAnimationComplete).not.toHaveBeenCalled();

    act(() => jest.advanceTimersByTime(1500));

    expect(onAnimationComplete).toHaveBeenCalledTimes(1);
  });
});
