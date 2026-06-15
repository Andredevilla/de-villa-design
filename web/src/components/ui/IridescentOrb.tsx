import type { ReactNode } from 'react'

export function IridescentOrb({
  size = 26,
  children,
  className = '',
}: {
  size?: number
  children?: ReactNode
  className?: string
}) {
  return (
    <span
      className={`orb ${className}`.trim()}
      style={{ width: size, height: size }}
      aria-hidden={children ? undefined : true}
    >
      {children}
    </span>
  )
}
