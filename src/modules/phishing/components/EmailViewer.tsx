import { Mail } from 'lucide-react';
import type { Scenario } from '../domain/schema';
import { parseMarkup } from '../domain/markup';
import { Signal } from './Signal';
import { InertLink } from './InertLink';
import { AttachmentChip } from './AttachmentChip';
import { BrandIcon } from './BrandIcon';

interface Props {
  scenario: Scenario;
  recipientName: string;
  visible: ReadonlySet<number>;
  active: number | null;
}

export function EmailViewer({ scenario, recipientName, visible, active }: Props) {
  const m = scenario.markers;
  const subjectId = `asunto-${scenario.id}`;
  return (
    <article className="mail-window" aria-labelledby={subjectId}>
      <div className="mail-titlebar">
        <span className="mail-dots" aria-hidden="true">
          <span /> <span /> <span />
        </span>
        <Mail size={16} aria-hidden="true" />
        <span>Correo recibido</span>
        <span className="mail-sim-tag">Simulación</span>
      </div>
      <dl className="mail-headers">
        <div>
          <dt>De:</dt>
          <dd>
            <Signal marker={m.sender} visible={visible} active={active}>
              <span className="mail-sender-name">{scenario.senderName}</span>{' '}
              <span className="mail-address">&lt;{scenario.senderEmail}&gt;</span>
            </Signal>
          </dd>
        </div>
        {scenario.replyTo && (
          <div>
            <dt>Responder a:</dt>
            <dd>
              <Signal marker={m.replyTo} visible={visible} active={active}>
                <span className="mail-address">{scenario.replyTo}</span>
              </Signal>
            </dd>
          </div>
        )}
        <div>
          <dt>Para:</dt>
          <dd>
            {recipientName} <span className="mail-address">&lt;{scenario.to}&gt;</span>
          </dd>
        </div>
        <div>
          <dt>Asunto:</dt>
          <dd id={subjectId} className="mail-subject">
            <Signal marker={m.subject} visible={visible} active={active}>
              {scenario.subject}
            </Signal>
          </dd>
        </div>
        <div>
          <dt>Fecha:</dt>
          <dd>{scenario.receivedAt}</dd>
        </div>
      </dl>
      <div className="mail-body">
        {scenario.brand && (
          <div className="mail-brand">
            <BrandIcon icon={scenario.brand.icon} />
            <span>{scenario.brand.name}</span>
          </div>
        )}
        {scenario.content.map((block, i) => {
          if (typeof block === 'string') {
            return (
              <p key={i}>
                {parseMarkup(block).map((seg, j) => (
                  <Signal key={j} marker={seg.marker} visible={visible} active={active}>
                    {seg.text}
                  </Signal>
                ))}
              </p>
            );
          }
          if (block.type === 'link') return <InertLink key={i} block={block} visible={visible} active={active} />;
          if (block.type === 'attachment') return <AttachmentChip key={i} block={block} visible={visible} active={active} />;
          return (
            <p key={i} className="mail-signature">
              {block.lines.map((line, j) => (
                <span key={j}>{line}</span>
              ))}
            </p>
          );
        })}
      </div>
    </article>
  );
}
