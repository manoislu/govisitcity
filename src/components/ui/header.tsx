"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Home, LogOut, MapPin, User, Calendar, LogOut as LogoutIcon } from 'lucide-react'

export function Header() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('isLoggedIn')
    router.push('/login')
  }

  return (
    <header className="bg-white shadow-sm border-b pb-3 pt-[5px]">
      <div className="max-w-[460px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end h-20">
          {/* Bouton Accueil à gauche */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center text-gray-700 hover:text-blue-600 transition-colors cursor-pointer">
              <Home className="h-5 w-5" />
            </Link>
          </div>

          {/* Logo au centre */}
          <div className="flex flex-col items-center max-w-xs mx-auto">
            <img 
              src="/govisitcity-logo.png" 
              alt="GoVisitCity" 
              className="w-[240px] h-auto"
            />
            <div className="text-base text-black">Votre assistant de voyage intelligent</div>
          </div>

          {/* Menu utilisateur à droite */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span className="font-medium">Menu</span>
              </button>
              
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                  <button
                    onClick={() => router.push('/account')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
                  >
                    <User className="h-4 w-4" />
                    Mon compte
                  </button>
                  <button
                    onClick={() => router.push('/my-trips')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
                  >
                    <Calendar className="h-4 w-4" />
                    Mes voyages
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
                  >
                    <LogoutIcon className="h-4 w-4" />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}