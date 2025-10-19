'use client'

import { useEffect, useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'loading'
  database?: 'connected' | 'disconnected'
  activitiesCount?: number
  error?: string
}

export function HealthCheck() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({ status: 'loading' })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('/api/health')
        const data = await response.json()
        
        if (response.ok) {
          setHealthStatus({
            status: 'healthy',
            database: data.database,
            activitiesCount: data.activitiesCount
          })
        } else {
          setHealthStatus({
            status: 'unhealthy',
            database: data.database,
            error: data.error
          })
        }
      } catch (error) {
        setHealthStatus({
          status: 'unhealthy',
          error: error instanceof Error ? error.message : 'Failed to check health'
        })
      }
    }

    // Check health on mount
    checkHealth()

    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000)

    return () => clearInterval(interval)
  }, [])

  // Only show if there's an issue or if manually toggled
  useEffect(() => {
    if (healthStatus.status === 'unhealthy') {
      setIsVisible(true)
    }
  }, [healthStatus.status])

  if (healthStatus.status === 'loading') {
    return null
  }

  if (healthStatus.status === 'healthy' && !isVisible) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Alert className={`${
        healthStatus.status === 'healthy' 
          ? 'border-green-200 bg-green-50 text-green-800' 
          : 'border-red-200 bg-red-50 text-red-800'
      }`}>
        <div className="flex items-center gap-2">
          {healthStatus.status === 'healthy' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          <AlertDescription className="text-sm">
            {healthStatus.status === 'healthy' ? (
              <div>
                <strong>Système opérationnel</strong>
                <br />
                Base de données: {healthStatus.database}
                {healthStatus.activitiesCount !== undefined && (
                  <span> • {healthStatus.activitiesCount} activités</span>
                )}
              </div>
            ) : (
              <div>
                <strong>Problème détecté</strong>
                <br />
                {healthStatus.error || 'Erreur de connexion au serveur'}
                <br />
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-1 text-xs underline hover:no-underline"
                >
                  Actualiser la page
                </button>
              </div>
            )}
          </AlertDescription>
        </div>
        {healthStatus.status === 'healthy' && (
          <button
            onClick={() => setIsVisible(false)}
            className="ml-2 text-xs hover:opacity-70"
          >
            ✕
          </button>
        )}
      </Alert>
    </div>
  )
}