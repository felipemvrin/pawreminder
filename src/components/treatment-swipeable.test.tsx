import { fireEvent, render, screen } from '@testing-library/react-native';

import { TreatmentSwipeable } from './treatment-swipeable';

jest.mock('lucide-react-native', () => ({
  Check: () => null,
  Clock: () => null
}));

describe('TreatmentSwipeable', () => {
  it('expone una accion accesible para marcar aplicado', () => {
    const onMarkApplied = jest.fn();

    render(
      <TreatmentSwipeable onMarkApplied={onMarkApplied}>
        <></>
      </TreatmentSwipeable>
    );

    expect(screen.queryByRole('button', { name: 'Marcar aplicado' })).toBeNull();

    const swipeable = screen.getByRole('button', { name: 'Mostrar acciones de swipe' });
    fireEvent.press(swipeable);

    fireEvent.press(screen.getByRole('button', { name: 'Marcar aplicado' }));

    expect(onMarkApplied).toHaveBeenCalledTimes(1);
  });

  it('deja posponer preparado y deshabilitado hasta definir su regla de negocio', () => {
    render(
      <TreatmentSwipeable onMarkApplied={jest.fn()}>
        <></>
      </TreatmentSwipeable>
    );

    const swipeable = screen.getByRole('button', { name: 'Mostrar acciones de swipe' });
    fireEvent.press(swipeable);

    expect(screen.getByRole('button', { name: 'Posponer' }).props.accessibilityState).toEqual({
      disabled: true
    });
  });

  it('deshabilita la accion de marcar aplicado mientras la mutacion sigue pendiente', () => {
    const onMarkApplied = jest.fn();

    render(
      <TreatmentSwipeable onMarkApplied={onMarkApplied} markAppliedDisabled>
        <></>
      </TreatmentSwipeable>
    );

    const swipeable = screen.getByRole('button', { name: 'Mostrar acciones de swipe' });
    fireEvent.press(swipeable);

    const action = screen.getByRole('button', { name: 'Marcar aplicado' });

    expect(action.props.accessibilityState).toEqual({ disabled: true });

    fireEvent.press(action);

    expect(onMarkApplied).not.toHaveBeenCalled();
  });
});
