export function EyeMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="32" cy="7" r="2.1" fill="currentColor" />
      <circle cx="50" cy="14" r="2.1" fill="currentColor" />
      <circle cx="57" cy="32" r="2.1" fill="currentColor" />
      <circle cx="50" cy="50" r="2.1" fill="currentColor" />
      <circle cx="32" cy="57" r="2.1" fill="currentColor" />
      <circle cx="14" cy="50" r="2.1" fill="currentColor" />
      <circle cx="7" cy="32" r="2.1" fill="currentColor" />
      <circle cx="14" cy="14" r="2.1" fill="currentColor" />
      <ellipse cx="32" cy="32" rx="14" ry="9" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="32" cy="32" r="4.2" fill="#e2a85a" />
      <circle cx="32" cy="32" r="1.6" fill="#1c1915" />
    </svg>
  )
}
