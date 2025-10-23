'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isMounted, setIsMounted] = useState(false)

  // Éviter le flash de contenu non stylisé
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('') // Réinitialiser l'erreur
    
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
      
      // Redirection directe après connexion réussie
      window.location.href = '/'
      
    } catch (error: any) {
      console.error('Erreur de connexion:', error)
      setError(error.message || 'Une erreur est survenue lors de la connexion')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {!isMounted ? (
        // État de chargement pour éviter le flash
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
      ) : (
        <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-6">
          {/* Logo GoVisitCity */}
          <div className="flex justify-center mb-4">
            <img 
              src="/govisitcity-logo.png"
              alt="GoVisitCity"
              className="h-16 w-auto"
            />
          </div>
          
          <CardTitle className="text-xl font-normal text-[#6CCDEA] mb-2">
            Votre assistant de voyage intelligent
          </CardTitle>
          <CardDescription className="text-black text-base font-normal">
            Connectez-vous et planifiez votre voyage parfait.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
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
              <p className="text-xs text-gray-500 mt-1 text-center">
                (8 caractères minimum, 1 majuscule et 1 chiffre)
              </p>
            </div>
            
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center text-sm gap-2">
              <button
                type="button"
                onClick={() => window.location.href = '/forgot-password'}
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                Mot de passe oublié ?
              </button>
              <span className="text-gray-400">-</span>
              <button
                type="button"
                onClick={() => window.location.href = '/register'}
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                S'inscrire
              </button>
            </div>
            
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
                      Erreur de connexion
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