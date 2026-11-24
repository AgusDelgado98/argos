import { EyeMark } from './EyeMark';

interface Props {
  variant?: 'header' | 'hero';
  tagline?: string;
}

export function ArgosLogo({ variant = 'header', tagline }: Props) {
  if (variant === 'hero') {
    return (
      <div className="logo-hero">
        <div className="logo-hero-row">
          <EyeMark size={112} />
          <span className="logo-word logo-word-hero">ARGOS</span>
        </div>
        <div className="logo-hero-tagline" aria-hidden="true">
          <span />
          EL OBSERVADOR DIGITAL
          <span />
        </div>
        <span className="visually-hidden">El observador digital</span>
      </div>
    );
  }
  return (
    <span className="logo-header">
      <EyeMark size={46} />
      <span className="logo-word">ARGOS</span>
      {tagline && <span className="logo-tagline">{tagline}</span>}
    </span>
  );
}
