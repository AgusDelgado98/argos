import { useId, useState } from 'react';
import { Lock } from 'lucide-react';
import { Signal } from './Signal';
import type { LinkBlock } from '../domain/schema';

interface Props {
  block: LinkBlock;
  visible: ReadonlySet<number>;
  active: number | null;
}

/**
 * Representa un botón/enlace de correo como TEXTO INERTE. No hay <a href>,
 * no hay navegación: solo permite inspeccionar el destino, como harías
 * pasando el cursor por encima en un cliente real.
 */
export function InertLink({ block, visible, active }: Props) {
  const [pinned, setPinned] = useState(false);
  const [hover, setHover] = useState(false);
  const tipId = useId();
  const open = pinned || hover;
  return (
    <div className="inert-link-wrap">
      <Signal marker={block.marker} visible={visible} active={active}>
        <button
          type="button"
          className="inert-link"
          aria-expanded={open}
          aria-controls={tipId}
          onClick={() => setPinned((v) => !v)}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          data-inert-url={block.url}
        >
          <Lock size={15} aria-hidden="true" />
          {block.label}
        </button>
      </Signal>
      <div id={tipId} className="inert-tip" role="status" hidden={!open}>
        <strong>Enlace simulado e inactivo.</strong> Si fuera real, te llevaría a:
        <code className="inert-url">{block.url}</code>
      </div>
    </div>
  );
}
