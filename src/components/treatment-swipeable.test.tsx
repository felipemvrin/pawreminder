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

    fireEvent.press(screen.getByRole('button', { name: 'Marcar aplicado' }));

    expect(onMarkApplied).toHaveBeenCalledTimes(1);
  });

  it('deja posponer preparado y deshabilitado hasta definir su regla de negocio', () => {
    render(
      <TreatmentSwipeable onMarkApplied={jest.fn()}>
        <></>
      </TreatmentSwipeable>
    );

    expect(screen.getByRole('button', { name: 'Posponer' }).props.accessibilityState).toEqual({
      disabled: true
    });
  });
});
