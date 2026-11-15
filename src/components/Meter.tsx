const METER_STEPS = 12

export function Meter({ done, total }: { done: number; total: number }) {
  const ratio = total === 0 ? 0 : done / total
  const step = Math.min(METER_STEPS, Math.max(0, Math.round(ratio * METER_STEPS)))
  return (
    <div className="meter" data-done={step} aria-hidden="true">
      <div className="meter-bar" />
    </div>
  )
}
