/** Símbolo del ojo de ARGOS (SVG propio). */
export function EyeMark({ size = 48, className }: { size?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size * 0.62}
      viewBox="0 0 100 62"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="argos-iris" cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#f2b54a" />
          <stop offset="55%" stopColor="#c8861f" />
          <stop offset="100%" stopColor="#7a4d0a" />
        </radialGradient>
      </defs>
      <path d="M6 8 Q50 -6 94 10" fill="none" stroke="#b77919" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M4 34 Q50 -4 96 34 Q50 70 4 34 Z" fill="#fffcf7" stroke="#14243a" strokeWidth="3.2" strokeLinejoin="round" />
      <circle cx="50" cy="33" r="17" fill="url(#argos-iris)" stroke="#7a4d0a" strokeWidth="1.2" />
      <circle cx="50" cy="33" r="7.5" fill="#14243a" />
      <circle cx="54.5" cy="28.5" r="3" fill="#fffcf7" />
      <path d="M12 46 Q50 66 88 46" fill="none" stroke="#14243a" strokeWidth="1.6" opacity="0.35" />
    </svg>
  );
}
