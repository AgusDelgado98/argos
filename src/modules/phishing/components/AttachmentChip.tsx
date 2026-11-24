import { useId, useState } from 'react';
import { Paperclip } from 'lucide-react';
import { Signal } from './Signal';
import type { AttachmentBlock } from '../domain/schema';

interface Props {
  block: AttachmentBlock;
  visible: ReadonlySet<number>;
  active: number | null;
}

/** Adjunto representado solo como texto. No existe archivo ni descarga. */
export function AttachmentChip({ block, visible, active }: Props) {
  const [open, setOpen] = useState(false);
  const tipId = useId();
  return (
    <div className="attachment-wrap">
      <Signal marker={block.marker} visible={visible} active={active}>
        <button type="button" className="attachment" aria-expanded={open} aria-controls={tipId} onClick={() => setOpen((v) => !v)}>
          <Paperclip size={16} aria-hidden="true" />
          <span className="attachment-name">{block.fileName}</span>
          <span className="attachment-size">{block.size}</span>
        </button>
      </Signal>
      <div id={tipId} className="inert-tip" role="status" hidden={!open}>
        <strong>Adjunto simulado.</strong> En ARGOS los archivos no existen y no se pueden abrir ni descargar. En la vida real,
        antes de abrir un adjunto inesperado, confirmá con quien lo envía por otro canal.
      </div>
    </div>
  );
}
