import { useId, useRef, useState } from "react"
import type { PointerEvent } from "react"

export function FakeLink({
  label,
  destination,
  brandName,
  officialDomain,
}: {
  label: string
  destination: string
  brandName: string
  officialDomain: string
}) {
  const previewId = useId()
  const pinned = useRef(false)
  const [open, setOpen] = useState(false)

  function showFromPointer(event: PointerEvent<HTMLButtonElement>) {
    if (event.pointerType === "mouse") setOpen(true)
  }

  function hideFromPointer(event: PointerEvent<HTMLButtonElement>) {
    if (event.pointerType === "mouse" && !pinned.current) setOpen(false)
  }

  function togglePin() {
    pinned.current = !pinned.current
    setOpen(pinned.current)
  }

  return (
    <span className="fake-link-wrap">
      <button
        type="button"
        className="fake-link"
        aria-expanded={open}
        aria-controls={previewId}
        onClick={togglePin}
        onPointerEnter={showFromPointer}
        onPointerLeave={hideFromPointer}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          if (!pinned.current) setOpen(false)
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            pinned.current = false
            setOpen(false)
          }
        }}
      >
        {label}
        <span className="sr-only">. Ver el destino real. No abre ninguna página.</span>
      </button>
      <span id={previewId} role="note" className="link-preview" hidden={!open}>
        <span className="preview-kicker">Destino real</span>
        <span className="url" translate="no">
          {destination}
        </span>
        <span className="preview-kicker">Dominio de práctica de {brandName}</span>
        <span className="url" translate="no">
          {officialDomain}
        </span>
        <span>Comparalos. Este enlace no abre ninguna página.</span>
      </span>
    </span>
  )
}
