'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ConfirmOrder() {
  const params = useSearchParams()
  const success = params.get('success')

  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (success) {
      setVisible(true)

      const timer = setTimeout(() => {
        setVisible(false)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [success])

  if (!visible) return null

  return (
    <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-3 rounded shadow z-50">
      Bestelling succesvol geplaatst!
    </div>
  )
}