import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HintsPanel } from './HintsPanel';
import { getScenario } from '../data/scenarios';

const s = getScenario('ARG-001')!;

describe('<HintsPanel />', () => {
  it('Aprender: muestra solo las pistas reveladas y el contador', () => {
    render(<HintsPanel scenario={s} mode="learn" revealed={1} answered={false} active={null} onReveal={() => {}} onFocusHint={() => {}} />);
    expect(screen.getByText('Pistas reveladas: 1 de 3')).toBeInTheDocument();
    expect(screen.getByText(/El dominio no coincide/)).toBeInTheDocument();
    expect(screen.queryByText(/presión y amenaza/)).not.toBeInTheDocument();
    expect(screen.getAllByRole('img', { name: 'bloqueada' })).toHaveLength(2);
  });

  it('pide la siguiente pista y se deshabilita al llegar a 3', async () => {
    const user = userEvent.setup();
    const onReveal = vi.fn();
    const { rerender } = render(
      <HintsPanel scenario={s} mode="learn" revealed={0} answered={false} active={null} onReveal={onReveal} onFocusHint={() => {}} />,
    );
    await user.click(screen.getByRole('button', { name: /Mostrar pista/ }));
    expect(onReveal).toHaveBeenCalledTimes(1);
    rerender(<HintsPanel scenario={s} mode="learn" revealed={3} answered={false} active={null} onReveal={onReveal} onFocusHint={() => {}} />);
    expect(screen.getByRole('button', { name: /Mostrar pista/ })).toBeDisabled();
  });

  it('Desafío: oculta todas las pistas hasta responder', () => {
    const { rerender } = render(
      <HintsPanel scenario={s} mode="challenge" revealed={3} answered={false} active={null} onReveal={() => {}} onFocusHint={() => {}} />,
    );
    expect(screen.getByText(/se ocultan hasta que respondas/)).toBeInTheDocument();
    expect(screen.queryByText(/El dominio no coincide/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Mostrar pista/ })).not.toBeInTheDocument();
    rerender(<HintsPanel scenario={s} mode="challenge" revealed={0} answered active={null} onReveal={() => {}} onFocusHint={() => {}} />);
    expect(screen.getByText(/El dominio no coincide/)).toBeInTheDocument();
  });

  it('tocar una pista revelada la resalta', async () => {
    const user = userEvent.setup();
    const onFocusHint = vi.fn();
    render(<HintsPanel scenario={s} mode="learn" revealed={2} answered={false} active={null} onReveal={() => {}} onFocusHint={onFocusHint} />);
    await user.click(screen.getByRole('button', { name: /El tono del mensaje/ }));
    expect(onFocusHint).toHaveBeenCalledWith(2);
  });
});
