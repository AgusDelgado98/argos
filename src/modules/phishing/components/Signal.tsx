import type { ReactNode } from 'react';

interface Props {
  marker?: number;
  visible: ReadonlySet<number>;
  active: number | null;
  children: ReactNode;
}

/**
 * Fragmento señalado. Si la señal todavía no se reveló se renderiza como texto
 * común: el DOM no filtra la respuesta antes de tiempo.
 */
export function Signal({ marker, visible, active, children }: Props) {
  if (!marker || !visible.has(marker)) return <>{children}</>;
  return (
    <mark className={`signal${active === marker ? ' is-active' : ''}`} data-marker={marker}>
      {children}
      <span className="signal-num" aria-hidden="true">
        {marker}
      </span>
      <span className="visually-hidden"> (señal {marker})</span>
    </mark>
  );
}
