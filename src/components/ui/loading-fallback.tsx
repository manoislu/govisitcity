'use client'

import { Loader2 } from 'lucide-react'

export function LoadingFallback() {
  return (
    <div className="loading-fallback min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm text-gray-600">Chargement...</p>
      </div>
    </div>
  )
}