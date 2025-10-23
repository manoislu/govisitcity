'use client'

import { useState, useCallback } from 'react'

interface ErrorHandlerOptions {
  showToast?: boolean
  logToConsole?: boolean
  fallbackMessage?: string
}

interface ErrorState {
  hasError: boolean
  error: Error | null
  errorInfo: string | null
}

export const useErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    errorInfo: null
  })

  const {
    showToast = true,
    logToConsole = true,
    fallbackMessage = "Une erreur est survenue"
  } = options

  const handleError = useCallback((error: Error | string, errorInfo?: string) => {
    const errorObj = typeof error === 'string' ? new Error(error) : error
    
    if (logToConsole) {
      console.error('Error caught by useErrorHandler:', errorObj, errorInfo)
    }

    setErrorState({
      hasError: true,
      error: errorObj,
      errorInfo: errorInfo || errorObj.message
    })

    if (showToast) {
      // You can integrate with your toast system here
      // For now, we'll use a simple alert
      alert(errorInfo || errorObj.message || fallbackMessage)
    }

    return errorObj
  }, [showToast, logToConsole, fallbackMessage])

  const resetError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }, [])

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    errorMessage?: string
  ): Promise<T | null> => {
    try {
      return await asyncFn()
    } catch (error) {
      handleError(error as Error, errorMessage)
      return null
    }
  }, [handleError])

  return {
    ...errorState,
    handleError,
    resetError,
    handleAsyncError
  }
}

export default useErrorHandler