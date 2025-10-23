'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Mail, Lock, User, Check, X, ArrowLeft, CheckCircle, Plane, MapPin, Calendar, Users } from 'lucide-react'

interface PasswordStrength {
  score: number
  feedback: string[]
  color: string
}

export default function AuthPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    color: 'bg-gray-300'
  })

  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    setIsMounted(true)
    try {
      const user = localStorage.getItem('user')
      const isLoggedIn = localStorage.getItem('isLoggedIn')
      if (user && isLoggedIn) {
        router.push('/')
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error)
    }
  }, [router])

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
      setError('Tous les champs sont obligatoires')
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la connexion')
      }

      // Sauvegarder l'utilisateur dans le localStorage
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('isLoggedIn', 'true')
      
      // Redirection vers la page principale
      router.push('/')
      
    } catch (error: any) {
      console.error('Erreur de connexion:', error)
      setError(error.message || 'Une erreur est survenue lors de la connexion')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name || !email || !password || !confirmPassword) {
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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription')
      }

      // Sauvegarder l'utilisateur dans le localStorage
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('isLoggedIn', 'true')
      
      // Redirection vers la page principale
      router.push('/')
      
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error)
      setError(error.message || 'Une erreur est survenue lors de l\'inscription')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded-lg animate-pulse mx-auto w-32" />
              <div className="h-6 bg-gray-200 rounded-lg animate-pulse mx-auto w-48" />
              <div className="space-y-3 mt-8">
                <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center min-h-screen">
          
          {/* Section gauche - Marketing */}
          <div className="hidden lg:block">
            <div className="text-center lg:text-left">
              <div className="flex justify-center lg:justify-start mb-6">
                <img 
                  src="/govisitcity-logo.png"
                  alt="GoVisitCity"
                  className="h-20 w-auto"
                />
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Votre assistant de voyage <span className="text-[#6CCDEA]">intelligent</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8">
                Planifiez vos voyages parfaits avec l'IA. Découvrez des activités personnalisées, 
                créez des itinéraires optimisés et vivez des expériences inoubliables.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Destinations</h3>
                  <p className="text-sm text-gray-600">Explorez les plus belles villes du monde</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Itinéraires</h3>
                  <p className="text-sm text-gray-600">Plans optimisés jour par jour</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Personnalisé</h3>
                  <p className="text-sm text-gray-600">Adapté à vos préférences</p>
                </div>
              </div>
              
              <div className="flex items-center justify-center lg:justify-start space-x-8">
                <div>
                  <div className="text-3xl font-bold text-gray-900">50+</div>
                  <div className="text-sm text-gray-600">Villes disponibles</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">1000+</div>
                  <div className="text-sm text-gray-600">Activités suggérées</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">24/7</div>
                  <div className="text-sm text-gray-600">Assistance IA</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Section droite - Formulaire */}
          <div className="flex justify-center">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center pb-6">
                <div className="lg:hidden flex justify-center mb-4">
                  <img 
                    src="/govisitcity-logo.png"
                    alt="GoVisitCity"
                    className="h-16 w-auto"
                  />
                </div>
                
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  {isLogin ? 'Connexion' : 'Créez votre compte'}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {isLogin 
                    ? 'Connectez-vous et planifiez votre voyage parfait.'
                    : 'Rejoignez-nous et commencez à planifier vos voyages.'
                  }
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {!isSuccess ? (
                  <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
                    {!isLogin && (
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center">
                          <User className="w-4 h-4 mr-2 text-blue-500" />
                          Nom complet
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Jean Dupont"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="w-full"
                        />
                      </div>
                    )}

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
                      
                      {/* Indicateur de force du mot de passe pour l'inscription */}
                      {!isLogin && password && (
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

                    {!isLogin && (
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
                    )}
                    
                    <Button
                      type="submit"
                      disabled={isLoading || (!isLogin && (passwordStrength.score < 3 || password !== confirmPassword))}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      ) : (
                        isLogin ? 'Se connecter' : 'S\'inscrire'
                      )}
                    </Button>
                  </form>
                ) : (
                  <div className="text-center py-6">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Inscription réussie !
                    </h3>
                    <p className="text-gray-600">
                      Bienvenue sur GoVisitCity ! Redirection en cours...
                    </p>
                  </div>
                )}
                
                <div className="mt-6 text-center">
                  <div className="flex items-center justify-center text-sm gap-2">
                    <span className="text-gray-600">
                      {isLogin ? 'Pas encore de compte ?' : 'Déjà un compte ?'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(!isLogin)
                        setError('')
                        setPassword('')
                        setConfirmPassword('')
                        setName('')
                        setEmail('')
                      }}
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                    >
                      {isLogin ? 'S\'inscrire' : 'Se connecter'}
                    </button>
                  </div>
                  
                  {isLogin && (
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => router.push('/forgot-password')}
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Mot de passe oublié ?
                      </button>
                    </div>
                  )}
                  
                  {/* Boîte d'erreur */}
                  {error && !isSuccess && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">
                            {isLogin ? 'Erreur de connexion' : 'Erreur d\'inscription'}
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
          </div>
        </div>
      </div>
    </div>
  )
}