import { Link } from 'react-router-dom';
import { Modal } from '../components/ui/Modal';

const STEPS = [
  { title: 'Elegí un caso', text: 'Abrí «Casos interactivos» y seleccioná un correo de la bandeja. Todos son inventados.' },
  { title: 'Observá las señales', text: 'Mirá remitente, dominio, tono, enlaces y adjuntos. Los enlaces son texto inerte: tocalos para ver su destino sin riesgo.' },
  { title: 'Decidí', text: 'Elegí entre «Parece legítimo», «Es un posible phishing» o «No tengo suficiente información».' },
  { title: 'Aprendé del análisis', text: 'Después de responder verás las señales marcadas, la acción recomendada y qué convenía verificar.' },
];

export function QuickGuide({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal
      open={open}
      title="Guía rápida"
      onClose={onClose}
      footer={
        <Link to="/casos/phishing" className="btn btn-primary" onClick={onClose}>
          Empezar a practicar
        </Link>
      }
    >
      <ol className="guide-steps">
        {STEPS.map((s, i) => (
          <li key={s.title}>
            <span className="guide-num" aria-hidden="true">{i + 1}</span>
            <div>
              <strong>{s.title}</strong>
              <p>{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="guide-modes">
        <strong>Aprender</strong> te deja pedir hasta tres pistas por caso. <strong>Desafío</strong> oculta las pistas
        hasta que respondas y suma tu puntaje. Tu progreso se guarda solo en este navegador.
      </p>
    </Modal>
  );
}
