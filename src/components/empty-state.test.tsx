import { fireEvent, render, screen } from '@testing-library/react-native';

import { EmptyState } from './empty-state';

describe('EmptyState', () => {
  it('muestra la animacion, el mensaje y ejecuta la accion', () => {
    const onAction = jest.fn();

    render(
      <EmptyState
        animation="empty-pets"
        title="Aun no tienes mascotas"
        message="Agrega una mascota para comenzar."
        actionLabel="Agregar mascota"
        onAction={onAction}
      />
    );

    expect(screen.getByText('Aun no tienes mascotas')).toBeTruthy();
    expect(screen.getByText('Agrega una mascota para comenzar.')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Agregar mascota' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('puede renderizarse sin accion', () => {
    render(
      <EmptyState
        animation="empty-treatments"
        title="Aun no hay tratamientos"
        message="El historial aparecera aqui."
      />
    );

    expect(screen.queryByRole('button')).toBeNull();
  });
});
