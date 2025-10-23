'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react'

interface PasswordStrength {
  score: number
  feedback: string[]
  color: string
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const email = searchParams.get('email')
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isValidToken, setIsValidToken] = useState(true)
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    color: 'bg-gray-300'
  })

  useEffect(() => {
    setIsMounted(true)
    
    // Vérifier si le token et l'email sont présents
    if (!token || !email) {
      setIsValidToken(false)
      setError('Lien de réinitialisation invalide ou manquant.')
    }
  }, [token, email])

  // Vérifier la force du mot de passe
  useEffect(() => {
    if (password.length === 0) {
      setPasswordStrength({ score: 0, feedback: [], color: 'bg-gray-300' })
      return
    }

    let score = 0
    const feedback: string[] = []

    // Longueur
    if (password.length >= 8) {
      score += 1
    } else {
      feedback.push('Au moins 8 caractères')
    }

    // Majuscule
    if (/[A-Z]/.test(password)) {
      score += 1
    } else {
      feedback.push('Au moins 1 majuscule')
    }

    // Minuscule
    if (/[a-z]/.test(password)) {
      score += 1
    } else {
      feedback.push('Au moins 1 minuscule')
    }

    // Chiffre
    if (/\d/.test(password)) {
      score += 1
    } else {
      feedback.push('Au moins 1 chiffre')
    }

    // Caractère spécial
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1
    } else {
      feedback.push('Au moins 1 caractère spécial')
    }

    // Couleur selon la force
    let color = 'bg-red-500'
    if (score >= 4) color = 'bg-green-500'
    else if (score >= 3) color = 'bg-yellow-500'
    else if (score >= 2) color = 'bg-orange-500'

    setPasswordStrength({ score, feedback, color })
  }, [password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!password || !confirmPassword) {
      setError('Tous les champs sont obligatoires')
      return
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (passwordStrength.score < 3) {
      setError('Le mot de passe est trop faible. Veuillez améliorer sa force.')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          email,
          password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la réinitialisation du mot de passe')
      }

      setSuccess(true)
      
      // Redirection après un court délai
      setTimeout(() => {
        router.push('/login')
      }, 3000)
      
    } catch (error: any) {
      console.error('Erreur de réinitialisation:', error)
      setError(error.message || 'Une erreur est survenue lors de la réinitialisation du mot de passe')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md h-96 bg-white rounded-lg shadow-sm animate-pulse" />
      </div>
    )
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img 
                src="/govisitcity-logo.png"
                alt="GoVisitCity"
                className="h-16 w-auto"
              />
            </div>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-xl font-normal text-black">
              Lien invalide
            </CardTitle>
            <CardDescription className="text-gray-600">
              Ce lien de réinitialisation est invalide ou a expiré.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Veuillez demander un nouveau lien de réinitialisation.
            </p>
            <Button
              onClick={() => router.push('/forgot-password')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Demander un nouveau lien
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
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
            <CardTitle className="text-xl font-normal text-black">
              Mot de passe réinitialisé !
            </CardTitle>
            <CardDescription className="text-gray-600">
              Votre mot de passe a été réinitialisé avec succès.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Vous allez être redirigé vers la page de connexion...
            </p>
            <Button
              onClick={() => router.push('/login')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Se connecter maintenant
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/govisitcity-logo.png"
              alt="GoVisitCity"
              className="h-16 w-auto"
            />
          </div>
          <CardTitle className="text-xl font-normal text-black mb-2">
            Réinitialiser le mot de passe
          </CardTitle>
          <CardDescription className="text-gray-600">
            Entrez votre nouveau mot de passe pour {email}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center">
                <Lock className="w-4 h-4 mr-2 text-blue-500" />
                Nouveau mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  tabIndex="-1"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              
              {/* Indicateur de force du mot de passe */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Force du mot de passe</span>
                    <span className="text-xs text-gray-600">
                      {passwordStrength.score}/5
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    />
                  </div>
                  {passwordStrength.feedback.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {passwordStrength.feedback.map((item, index) => (
                        <div key={index} className="flex items-center text-xs text-gray-600">
                          <AlertCircle className="w-3 h-3 mr-1 text-red-500" />
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                  {passwordStrength.score >= 3 && (
                    <div className="mt-2 flex items-center text-xs text-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Mot de passe suffisamment fort
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 flex items-center">
                <Lock className="w-4 h-4 mr-2 text-blue-500" />
                Confirmer le mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  tabIndex="-1"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {confirmPassword && password && (
                <div className="mt-1">
                  {password === confirmPassword ? (
                    <div className="flex items-center text-xs text-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Les mots de passe correspondent
                    </div>
                  ) : (
                    <div className="flex items-center text-xs text-red-600">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Les mots de passe ne correspondent pas
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <Button
              type="submit"
              disabled={isLoading || passwordStrength.score < 3 || password !== confirmPassword}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                'Réinitialiser le mot de passe'
              )}
            </Button>
          </form>
          
          {/* Boîte d'erreur */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Erreur de réinitialisation
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}