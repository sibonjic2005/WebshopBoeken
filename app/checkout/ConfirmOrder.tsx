'use client'

import { useSearchParams } from 'next/navigation'
import { Toast } from '../components/Toast'

export default function ConfirmOrder() {
  const params = useSearchParams()
  const success = params.get('success')

  if (!success) return null

  return <Toast variant="success">Bestelling succesvol geplaatst!</Toast>
}
