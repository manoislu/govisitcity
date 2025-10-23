'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [error, setError] = useState('')
  const [resetInfo, setResetInfo] = useState<{ resetLink?: string; resetToken?: string } | null>(null)

  // Éviter le flash de contenu non stylisé
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('') // Réinitialiser l'erreur
    setIsLoading(true)
    
    try {
      console.log('🔍 Envoi de la demande de réinitialisation pour:', email)
      
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      console.log('📡 Réponse du serveur:', response.status, response.statusText)

      const data = await response.json()
      console.log('📦 Données reçues:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue')
      }

      // Succès - afficher les informations de débogage dans la console
      if (data.resetLink) {
        console.log('✅ Lien de réinitialisation (développement):', data.resetLink)
        console.log('🔑 Token de réinitialisation:', data.resetToken)
        setResetInfo({ resetLink: data.resetLink, resetToken: data.resetToken })
      }

      setIsSubmitted(true)
    } catch (error) {
      console.error('❌ Erreur lors de la soumission:', error)
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        {!isMounted ? (
          // État de chargement pour éviter le flash
          <div className="w-full max-w-md h-96 bg-white rounded-lg shadow-sm animate-pulse" />
        ) : (
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              {/* Logo GoVisitCity */}
              <div className="flex justify-center mb-4">
                <img 
                  src="/govisitcity-logo.png"
                  alt="GoVisitCity"
                  className="h-16 w-auto"
                />
              </div>
              
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              <CardTitle className="flex items-center gap-2 justify-center text-xl font-normal text-black">
                E-mail envoyé !
              </CardTitle>
              <CardDescription className="text-gray-600">
                Nous avons envoyé un e-mail de réinitialisation à {email}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Vérifiez votre boîte de réception et suivez les instructions pour réinitialiser votre mot de passe.
              </p>
              
              {/* Afficher le lien de réinitialisation en développement */}
              {resetInfo?.resetLink && (
                <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 mb-3 font-semibold">
                    📋 <strong>MODE DÉVELOPPEMENT:</strong> Lien de réinitialisation
                  </p>
                  <div className="bg-white p-3 rounded border border-blue-300 mb-3">
                    <p className="text-xs text-blue-600 break-all font-mono">
                      {resetInfo.resetLink}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(resetInfo.resetLink!)}
                      className="flex-1 text-xs bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
                    >
                      📋 Copier le lien
                    </button>
                    <button
                      type="button"
                      onClick={() => window.location.href = resetInfo.resetLink!}
                      className="flex-1 text-xs bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
                    >
                      🔗 Utiliser le lien
                    </button>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    💡 <strong>Important:</strong> En production, un vrai email serait envoyé. 
                    Ici, cliquez sur "Utiliser le lien" ou copiez-le manuellement.
                  </p>
                </div>
              )}
              
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => window.location.href = '/login'}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 mx-auto"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Retour à la connexion
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false)
                    setEmail('')
                    setError('')
                    setResetInfo(null)
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800 hover:underline flex items-center gap-1 mx-auto"
                >
                  <Mail className="w-3 h-3" />
                  Envoyer un autre e-mail
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {!isMounted ? (
        // État de chargement pour éviter le flash
        <div className="w-full max-w-md h-96 bg-white rounded-lg shadow-sm animate-pulse" />
      ) : (
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            {/* Logo GoVisitCity */}
            <div className="flex justify-center mb-4">
              <img 
                src="/govisitcity-logo.png"
                alt="GoVisitCity"
                className="h-16 w-auto"
              />
            </div>
            
            <CardTitle className="text-xl font-normal text-black mb-2">
              Mot de passe oublié
            </CardTitle>
            <CardDescription className="text-gray-600">
              Entrez votre e-mail pour recevoir un lien de réinitialisation
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-500" />
                  Adresse e-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemple@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError('') // Effacer l'erreur lors de la saisie
                  }}
                  required
                  className={`w-full ${error ? 'border-red-500 focus:border-red-500' : ''}`}
                />
                {error && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Erreur d'envoi
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>{error}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <Button
                type="submit"
                disabled={isLoading || !email}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  'Envoyer le lien de réinitialisation'
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => window.location.href = '/login'}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 mx-auto"
              >
                <ArrowLeft className="w-3 h-3" />
                Retour à la connexion
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}