import type { ReactNode } from 'react'

type Variant = 'blue' | 'clear' | 'solid'

const variantClass: Record<Variant, string> = {
  blue: 'btn-glass-blue',
  clear: 'btn-glass-clear',
  solid: 'btn-solid',
}

export function GlassButton({
  href,
  variant,
  external = false,
  className = '',
  children,
}: {
  href: string
  variant: Variant
  external?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={`${variantClass[variant]} ${className}`.trim()}
    >
      {children}
    </a>
  )
}
