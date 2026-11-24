import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DecisionBar } from './DecisionBar';

describe('<DecisionBar />', () => {
  it('ofrece las tres decisiones de la especificación', async () => {
    const user = userEvent.setup();
    const onDecide = vi.fn();
    render(<DecisionBar mode="learn" onDecide={onDecide} onRetry={() => {}} />);
    for (const label of ['Parece legítimo', 'Es un posible phishing', 'No tengo suficiente información']) {
      expect(screen.getByRole('button', { name: label })).toBeEnabled();
    }
    await user.click(screen.getByRole('button', { name: 'No tengo suficiente información' }));
    expect(onDecide).toHaveBeenCalledWith('needs_more_info');
  });

  it('las tres opciones tienen el mismo tratamiento visual (sin sesgo de color)', () => {
    render(<DecisionBar mode="challenge" onDecide={() => {}} onRetry={() => {}} />);
    const buttons = ['Parece legítimo', 'Es un posible phishing', 'No tengo suficiente información'].map((n) =>
      screen.getByRole('button', { name: n }),
    );
    buttons.forEach((b) => expect(b.className).toBe('decision-btn'));
  });

  it('tras responder bloquea las opciones; en Aprender permite reintentar', () => {
    const { rerender } = render(<DecisionBar mode="learn" decision="phishing" onDecide={() => {}} onRetry={() => {}} onNext={() => {}} />);
    expect(screen.getByRole('button', { name: /Es un posible phishing/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Parece legítimo/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Intentar de nuevo/ })).toBeInTheDocument();
    rerender(<DecisionBar mode="challenge" decision="phishing" onDecide={() => {}} onRetry={() => {}} />);
    expect(screen.queryByRole('button', { name: /Intentar de nuevo/ })).not.toBeInTheDocument();
  });
});
