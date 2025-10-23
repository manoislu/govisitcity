'use client'

import { Suspense } from 'react'
import { ResetPasswordContent } from './ResetPasswordContent'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md h-96 bg-white rounded-lg shadow-sm animate-pulse" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}