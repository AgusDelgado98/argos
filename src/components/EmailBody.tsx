import { useId, useState } from "react"
import { officialDomain } from "../data/brands.ts"
import type { LabEmail } from "../data/emails.ts"
import { FakeLink } from "./FakeLink.tsx"

function Attachment({ name }: { name: string }) {
  const noteId = useId()
  const [open, setOpen] = useState(false)
  return (
    <div className="attachment">
      <button
        type="button"
        className="attachment-button"
        aria-expanded={open}
        aria-controls={noteId}
        onClick={() => setOpen((value) => !value)}
      >
        Archivo: {name}
      </button>
      <p id={noteId} className="attachment-note" hidden={!open}>
        En Argos este archivo no se descarga ni se abre. En un correo real, no abras un adjunto
        que no esperabas.
      </p>
    </div>
  )
}

export function EmailBody({ email }: { email: LabEmail }) {
  const domain = officialDomain(email.brand)
  return (
    <div className="email-body">
      {email.blocks.map((block, index) => {
        const key = `${email.id}-${index}`
        if (block.kind === "text") return <p key={key}>{block.text}</p>
        if (block.kind === "link") {
          return (
            <p key={key}>
              <FakeLink
                label={block.label}
                destination={block.destination}
                brandName={email.brand}
                officialDomain={domain}
              />
            </p>
          )
        }
        return <Attachment key={key} name={block.name} />
      })}
    </div>
  )
}
