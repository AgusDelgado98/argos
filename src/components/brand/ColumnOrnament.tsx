/** Columna clásica decorativa para el borde del hero (solo escritorio). */
export function ColumnOrnament() {
  return (
    <svg className="column-ornament" viewBox="0 0 90 520" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="col-stone" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#dcc7a6" />
          <stop offset="45%" stopColor="#f7eddc" />
          <stop offset="100%" stopColor="#cfb68f" />
        </linearGradient>
      </defs>
      <g fill="url(#col-stone)" stroke="#b49a72" strokeWidth="1">
        <rect x="0" y="0" width="90" height="16" />
        <path d="M6 16 H84 Q78 34 66 38 H24 Q12 34 6 16 Z" />
        <rect x="16" y="38" width="58" height="470" />
        <rect x="6" y="504" width="78" height="16" />
      </g>
      <g stroke="#b49a72" strokeOpacity="0.6">
        {[26, 36, 46, 56, 64].map((x) => (
          <line key={x} x1={x} y1="44" x2={x} y2="500" />
        ))}
      </g>
      <g fill="#a3812f" opacity="0.75">
        {Array.from({ length: 6 }, (_, i) => (
          <ellipse key={i} cx={i % 2 ? 78 : 12} cy={90 + i * 46} rx="6" ry="14" transform={`rotate(${i % 2 ? 30 : -30} ${i % 2 ? 78 : 12} ${90 + i * 46})`} />
        ))}
      </g>
    </svg>
  );
}
