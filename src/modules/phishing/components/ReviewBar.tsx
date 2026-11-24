import { LogOut, RefreshCcw } from 'lucide-react';

interface Props {
  position: number;
  total: number;
  onExit: () => void;
}

/** Indicador discreto del repaso guiado, con salida en cualquier momento. */
export function ReviewBar({ position, total, onExit }: Props) {
  return (
    <div className="review-bar" role="status" aria-label="Repaso en curso">
      <p>
        <RefreshCcw size={15} aria-hidden="true" />
        <strong>
          Repaso {position} de {total}
        </strong>
        <span className="review-bar-hint"> · respuestas riesgosas del Desafío</span>
      </p>
      <button type="button" className="btn btn-ghost btn-sm" onClick={onExit}>
        <LogOut size={15} aria-hidden="true" /> Salir del repaso
      </button>
    </div>
  );
}
