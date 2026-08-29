import { render, screen, fireEvent } from '@testing-library/react-native';
import React from 'react';

import { QueryErrorState, QueryLoadingState } from './query-state';

describe('QueryLoadingState', () => {
  it('renders an activity indicator', () => {
    render(<QueryLoadingState />);
    expect(screen.getByTestId('query-loading')).toBeTruthy();
  });

  it('accepts a custom style override', () => {
    render(<QueryLoadingState style={{ flex: 0, paddingVertical: 24 }} />);
    expect(screen.getByTestId('query-loading')).toBeTruthy();
  });
});

describe('QueryErrorState', () => {
  it('renders the heading and message', () => {
    render(<QueryErrorState message="Algo salió mal." onRetry={() => {}} />);
    expect(screen.getByText('No pudimos cargar esta información')).toBeTruthy();
    expect(screen.getByText('Algo salió mal.')).toBeTruthy();
  });

  it('renders the retry button with correct accessibility label', () => {
    render(<QueryErrorState message="Error." onRetry={() => {}} />);
    const button = screen.getByRole('button', { name: 'Reintentar carga' });
    expect(button).toBeTruthy();
  });

  it('calls onRetry when the button is pressed', () => {
    const onRetry = jest.fn();
    render(<QueryErrorState message="Error." onRetry={onRetry} />);
    fireEvent.press(screen.getByRole('button', { name: 'Reintentar carga' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('accepts a custom style override', () => {
    render(<QueryErrorState message="Error." onRetry={() => {}} style={{ flex: 0 }} />);
    expect(screen.getByText('No pudimos cargar esta información')).toBeTruthy();
  });
});
