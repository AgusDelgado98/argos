interface Props {
  total: number;
  current: number; // índice 0-based
  done: ReadonlySet<number>;
  label: string;
}

/** Barra segmentada «Caso 3 de 12». Decorativa para lectores: el texto ya informa. */
export function ProgressSegments({ total, current, done, label }: Props) {
  return (
    <div className="segments" role="img" aria-label={label}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`segment${i === current ? ' is-current' : ''}${done.has(i) ? ' is-done' : ''}`}
        />
      ))}
    </div>
  );
}
