import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmailViewer } from './EmailViewer';
import { getScenario, scenarios } from '../data/scenarios';

const none = new Set<number>();

describe('<EmailViewer />', () => {
  it('muestra encabezados y cuerpo del correo como texto', () => {
    const s = getScenario('ARG-001')!;
    render(<EmailViewer scenario={s} recipientName="Sofía Ramos" visible={none} active={null} />);
    expect(screen.getByRole('article', { name: s.subject })).toBeInTheDocument();
    expect(screen.getByText(/alertas@banco-atlas-validacion\.example/)).toBeInTheDocument();
    expect(screen.getByText('Hoy, 09:12')).toBeInTheDocument();
  });

  it('ningún caso genera enlaces navegables (todo enlace es inerte)', () => {
    for (const s of scenarios) {
      const { container, unmount } = render(<EmailViewer scenario={s} recipientName="Sofía" visible={new Set([1, 2, 3])} active={null} />);
      expect(container.querySelectorAll('a').length).toBe(0);
      expect(container.querySelectorAll('[href]').length).toBe(0);
      expect(container.innerHTML).not.toMatch(/href=|src=|<script|<iframe|<form/i);
      unmount();
    }
  });

  it('no revela señales mientras no estén visibles', () => {
    const s = getScenario('ARG-001')!;
    const { container, rerender } = render(<EmailViewer scenario={s} recipientName="Sofía" visible={none} active={null} />);
    expect(container.querySelectorAll('mark')).toHaveLength(0);
    rerender(<EmailViewer scenario={s} recipientName="Sofía" visible={new Set([1])} active={null} />);
    const marks = container.querySelectorAll('mark');
    expect(marks.length).toBeGreaterThan(0);
    marks.forEach((m) => expect(m.getAttribute('data-marker')).toBe('1'));
  });

  it('el enlace simulado muestra su destino al tocarlo, sin navegar', async () => {
    const user = userEvent.setup();
    const s = getScenario('ARG-001')!;
    render(<EmailViewer scenario={s} recipientName="Sofía" visible={none} active={null} />);
    const link = screen.getByRole('button', { name: /Confirmar mis credenciales/ });
    expect(link).toHaveAttribute('aria-expanded', 'false');
    await user.click(link);
    expect(link).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('http://banco-atlas-validacion.example/acceso-seguro/login')).toBeVisible();
    expect(screen.getByText(/Enlace simulado e inactivo/)).toBeVisible();
  });

  it('los adjuntos son simulados y no descargables', async () => {
    const user = userEvent.setup();
    const s = getScenario('ARG-003')!;
    render(<EmailViewer scenario={s} recipientName="Sofía" visible={none} active={null} />);
    await user.click(screen.getByRole('button', { name: /Comprobante_0007-00412\.pdf/ }));
    expect(screen.getByText(/no se pueden abrir ni descargar/)).toBeVisible();
  });

  it('muestra «Responder a» cuando difiere del remitente', () => {
    const s = getScenario('ARG-006')!;
    render(<EmailViewer scenario={s} recipientName="Sofía" visible={none} active={null} />);
    expect(screen.getByText('Responder a:')).toBeInTheDocument();
    expect(screen.getByText('direccion.oficina@correo-veloz.example')).toBeInTheDocument();
  });
});
