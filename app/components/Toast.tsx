'use client'

import { useEffect, useState } from 'react'

type Variant = 'success' | 'error' | 'info'

const variants: Record<Variant, string> = {
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-zinc-900 text-white',
}

export function Toast({
  children,
  variant = 'success',
  duration = 3000,
  onClose,
}: {
  children: React.ReactNode
  variant?: Variant
  duration?: number | null
  onClose?: () => void
}) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (duration === null) return
    const timer = setTimeout(() => {
      setVisible(false)
      onClose?.()
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!visible) return null

  const close = () => {
    setVisible(false)
    onClose?.()
  }

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-full px-4 py-2 text-sm shadow-lg ${variants[variant]}`}
    >
      <span>{children}</span>
      <button
        onClick={close}
        aria-label="Sluiten"
        className="flex h-5 w-5 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M2 2l8 8M10 2l-8 8" />
        </svg>
      </button>
    </div>
  )
}
