import type { ReactNode } from 'react'
import { Eyebrow } from './Eyebrow'

export function SectionHead({
  eyebrow,
  title,
  lead,
  dot,
}: {
  eyebrow: string
  title: ReactNode
  lead?: string
  dot?: boolean
}) {
  return (
    <div className="section-head">
      <Eyebrow dot={dot}>{eyebrow}</Eyebrow>
      <h2>{title}</h2>
      {lead && <p>{lead}</p>}
    </div>
  )
}
