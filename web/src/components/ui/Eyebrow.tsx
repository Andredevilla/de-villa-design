import type { ReactNode } from 'react'

export function Eyebrow({ children, dot = false }: { children: ReactNode; dot?: boolean }) {
  return (
    <p className="eyebrow">
      {dot && <span className="eyebrow-dot" aria-hidden="true" />}
      {children}
    </p>
  )
}
