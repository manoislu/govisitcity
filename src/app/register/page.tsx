'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Mail, Lock, User, Check, X } from 'lucide-react'
import Link from 'next/link'

interface PasswordStrength {
  score: number
  feedback: string[]
  color: string
}

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isMounted, setIsMounted] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    color: 'bg-gray-300'
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('Tous les champs sont obligatoires')
      return
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    // Validation des critères de mot de passe
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }
    
    if (!/[A-Z]/.test(password)) {
      setError('Le mot de passe doit contenir au moins 1 majuscule')
      return
    }
    
    if (!/\d/.test(password)) {
      setError('Le mot de passe doit contenir au moins 1 chiffre')
      return
    }

    if (passwordStrength.score < 3) {
      setError('Le mot de passe est trop faible. Veuillez améliorer sa force.')
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription')
      }

      // Succès
      setSuccess('Inscription réussie ! Redirection...')
      
      // Sauvegarder l'utilisateur dans le localStorage
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('isLoggedIn', 'true')
      
      // Redirection après un court délai pour montrer le message
      setTimeout(() => {
        window.location.href = '/'
      }, 1500)
      
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error)
      setError(error.message || 'Une erreur est survenue lors de l\'inscription')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {!isMounted ? (
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded-lg animate-pulse mx-auto w-32" />
              <div className="h-6 bg-gray-200 rounded-lg animate-pulse mx-auto w-48" />
              <div className="space-y-3 mt-8">
                <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <img 
                src="/govisitcity-logo.png"
                alt="GoVisitCity"
                className="h-16 w-auto"
              />
            </div>
            
            <CardTitle className="text-xl font-normal text-black mb-2">
              Créez votre compte
            </CardTitle>
            <CardDescription className="text-[#53BDFF] text-base font-normal">
              Rejoignez-nous et planifiez vos voyages facilement.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 flex items-center">
                    <User className="w-4 h-4 mr-2 text-blue-500" />
                    Prénom
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Votre prénom"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Nom
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Votre nom"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-blue-500" />
                  Adresse e-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemple@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center">
                  <Lock className="w-4 h-4 mr-2 text-blue-500" />
                  Mot de passe
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
                            <X className="w-3 h-3 mr-1 text-red-500" />
                            {item}
                          </div>
                        ))}
                      </div>
                    )}
                    {passwordStrength.score >= 3 && (
                      <div className="mt-2 flex items-center text-xs text-green-600">
                        <Check className="w-3 h-3 mr-1" />
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
                        <Check className="w-3 h-3 mr-1" />
                        Les mots de passe correspondent
                      </div>
                    ) : (
                      <div className="flex items-center text-xs text-red-600">
                        <X className="w-3 h-3 mr-1" />
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
                  'S\'inscrire'
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <div className="text-sm text-gray-600">
                Vous avez déjà un compte ?{' '}
                <Link href="/login" className="text-blue-600 hover:text-blue-800 hover:underline">
                  Se connecter
                </Link>
              </div>
              
              {/* Boîte de succès */}
              {success && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">
                        Inscription réussie
                      </h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>{success}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
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
                        Erreur d'inscription
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}