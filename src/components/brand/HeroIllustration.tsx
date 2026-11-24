/**
 * Ilustración vectorial original del hero: el ojo observador de Argos Panoptes,
 * un anillo de «cien ojos», y un templo clásico.
 * Es decorativa (aria-hidden); la información está en el texto del hero.
 */
const SMALL_EYES = Array.from({ length: 11 }, (_, i) => {
  const angle = Math.PI + (i / 10) * Math.PI; // semicírculo superior
  return { x: 330 + Math.cos(angle) * 214, y: 236 + Math.sin(angle) * 214, r: (angle * 180) / Math.PI + 90 };
});

const TICKS = Array.from({ length: 72 }, (_, i) => (i / 72) * Math.PI * 2);

export function HeroIllustration() {
  return (
    <svg className="hero-art" viewBox="0 0 600 520" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="hero-halo" cx="55%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#fff6e6" />
          <stop offset="55%" stopColor="#f6e3c7" />
          <stop offset="100%" stopColor="#f6e3c7" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hero-iris" cx="42%" cy="38%" r="65%">
          <stop offset="0%" stopColor="#f6c766" />
          <stop offset="45%" stopColor="#c8861f" />
          <stop offset="100%" stopColor="#6e4408" />
        </radialGradient>
        <linearGradient id="hero-hill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e9d6b6" />
          <stop offset="100%" stopColor="#f6ecdc" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hero-stone" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#e4d3b8" />
          <stop offset="50%" stopColor="#f5ead8" />
          <stop offset="100%" stopColor="#d9c4a3" />
        </linearGradient>
      </defs>

      <circle cx="330" cy="236" r="250" fill="url(#hero-halo)" />

      <g fill="none" stroke="#b77919" strokeLinecap="round">
        <circle cx="330" cy="236" r="232" strokeOpacity="0.35" strokeWidth="1.2" />
        <circle cx="330" cy="236" r="196" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="2 6" />
        <circle cx="330" cy="236" r="150" strokeOpacity="0.3" strokeWidth="1" />
        {TICKS.map((a, i) => (
          <line
            key={i}
            x1={330 + Math.cos(a) * 232}
            y1={236 + Math.sin(a) * 232}
            x2={330 + Math.cos(a) * (i % 6 === 0 ? 246 : 239)}
            y2={236 + Math.sin(a) * (i % 6 === 0 ? 246 : 239)}
            strokeOpacity="0.4"
            strokeWidth="1"
          />
        ))}
        <path d="M330 0 V40 M330 432 V472 M86 236 H120 M540 236 H574" strokeOpacity="0.35" />
      </g>

      {SMALL_EYES.map((e, i) => (
        <g key={i} transform={`translate(${e.x} ${e.y}) rotate(${e.r})`}>
          <path d="M-15 0 Q0 -10 15 0 Q0 10 -15 0 Z" fill="#fffcf7" stroke="#14243a" strokeWidth="1.4" />
          <circle r="5.2" fill="url(#hero-iris)" />
          <circle r="2.1" fill="#14243a" />
        </g>
      ))}

      {/* Ojo central */}
      <g>
        <path d="M150 236 Q330 70 510 236 Q330 392 150 236 Z" fill="#fffcf7" stroke="#14243a" strokeWidth="5" strokeLinejoin="round" />
        <path d="M168 196 Q330 54 494 200" fill="none" stroke="#b77919" strokeWidth="5" strokeLinecap="round" />
        <circle cx="330" cy="234" r="76" fill="url(#hero-iris)" stroke="#6e4408" strokeWidth="2" />
        <g stroke="#7a4d0a" strokeOpacity="0.35" strokeWidth="1.2">
          {Array.from({ length: 24 }, (_, i) => {
            const a = (i / 24) * Math.PI * 2;
            return <line key={i} x1={330 + Math.cos(a) * 36} y1={234 + Math.sin(a) * 36} x2={330 + Math.cos(a) * 72} y2={234 + Math.sin(a) * 72} />;
          })}
        </g>
        <circle cx="330" cy="234" r="32" fill="#14243a" />
        <circle cx="348" cy="214" r="12" fill="#fffcf7" opacity="0.95" />
        <circle cx="314" cy="252" r="4" fill="#fffcf7" opacity="0.6" />
      </g>

      {/* Colinas, cipreses y templo */}
      <path d="M0 470 Q120 400 250 440 T600 420 V520 H0 Z" fill="url(#hero-hill)" />
      <g fill="#7c8a6a" opacity="0.75">
        <path d="M70 470 Q78 410 86 470 Z" />
        <path d="M92 474 Q102 395 112 474 Z" />
        <path d="M498 462 Q507 405 516 462 Z" />
      </g>
      <g transform="translate(150 380)" fill="url(#hero-stone)" stroke="#a88b62" strokeWidth="1">
        <path d="M0 26 L95 0 L190 26 Z" />
        <rect x="4" y="26" width="182" height="8" />
        {Array.from({ length: 7 }, (_, i) => (
          <rect key={i} x={12 + i * 26} y="36" width="12" height="56" />
        ))}
        <rect x="0" y="92" width="190" height="7" />
        <rect x="-8" y="99" width="206" height="7" />
      </g>

    </svg>
  );
}
