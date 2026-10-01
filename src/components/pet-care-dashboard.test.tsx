import { render, screen } from '@testing-library/react-native';
import { ScrollView, View } from 'react-native';

import type { Pet } from '@/types/domain';
import { PetCareDashboard } from './pet-care-dashboard';

jest.mock('@/components/progress-ring', () => ({
  ProgressRing: () => null
}));

function createPet(id: string, name: string): Pet {
  return {
    id,
    name,
    species: 'dog',
    weightKg: 12,
    livesOutdoors: false,
    createdAt: '2026-08-01T12:00:00.000Z'
  };
}

const progress = new Map();

describe('PetCareDashboard', () => {
  it('distribuye hasta dos mascotas en el ancho disponible sin scroll horizontal', () => {
    const { UNSAFE_getAllByType, UNSAFE_queryAllByType } = render(
      <PetCareDashboard
        pets={[createPet('pet-1', 'Luna'), createPet('pet-2', 'Milo')]}
        progress={progress}
      />
    );

    expect(UNSAFE_queryAllByType(ScrollView)).toHaveLength(0);
    expect(UNSAFE_getAllByType(View).filter((view) => view.props.style?.flex === 1)).toHaveLength(2);
    expect(screen.getByText('Luna')).toBeTruthy();
    expect(screen.getByText('Milo')).toBeTruthy();
  });

  it('mantiene el scroll horizontal y ancho fijo cuando hay más de dos mascotas', () => {
    const pets = [
      createPet('pet-1', 'Luna'),
      createPet('pet-2', 'Milo'),
      createPet('pet-3', 'Nube')
    ];
    const { UNSAFE_getAllByType } = render(
      <PetCareDashboard pets={pets} progress={progress} />
    );

    expect(UNSAFE_getAllByType(ScrollView)).toHaveLength(1);
    expect(UNSAFE_getAllByType(View).some((view) => view.props.style?.width === 148)).toBe(true);
    expect(screen.getByText('Nube')).toBeTruthy();
  });
});
