'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Mail, Phone, MapPin, Calendar, Shield, User as UserIcon } from 'lucide-react'
import { Header } from '@/components/ui/header'

export default function AccountPage() {
  const [isMounted, setIsMounted] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [user, setUser] = useState({
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@example.com',
    phone: '+33 6 12 34 56 78',
    address: '123 Rue de la République',
    postalCode: '75001',
    city: 'Paris',
    birthDate: '1990-01-01',
    memberSince: '2024-01-15'
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleSave = () => {
    // Simuler la sauvegarde
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="w-[500px] mx-auto">
          <div className="px-6 py-4">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded-lg w-48" />
              <div className="h-64 bg-gray-200 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <main className="w-[500px] mx-auto">
        <div className="px-6 py-4 mb-4">
          <div className="flex items-center gap-2 mb-2 justify-center">
            <UserIcon className="w-6 h-6 text-[#6CCDEA]" />
            <h1 className="text-2xl font-normal text-gray-900">Mon compte</h1>
          </div>
          <p className="text-gray-600 text-center">Gérez vos informations personnelles et vos préférences</p>
        </div>

        <div className="grid gap-6 px-6">
          {/* Informations personnelles */}
          <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm w-full">
            <div className="px-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5" />
                <h2 className="font-semibold">Informations personnelles</h2>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      value={user.firstName}
                      onChange={(e) => setUser({...user, firstName: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      value={user.lastName}
                      onChange={(e) => setUser({...user, lastName: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                    Adresse
                  </Label>
                  <Input
                    id="address"
                    value={user.address}
                    onChange={(e) => setUser({...user, address: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Code postal</Label>
                    <Input
                      id="postalCode"
                      value={user.postalCode}
                      onChange={(e) => setUser({...user, postalCode: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville</Label>
                    <Input
                      id="city"
                      value={user.city}
                      onChange={(e) => setUser({...user, city: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-blue-500" />
                    Adresse e-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    onChange={(e) => setUser({...user, email: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-blue-500" />
                      Téléphone
                    </Label>
                    <Input
                      id="phone"
                      value={user.phone}
                      onChange={(e) => setUser({...user, phone: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Date de naissance</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={user.birthDate}
                      onChange={(e) => setUser({...user, birthDate: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Informations du compte */}
          <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm w-full">
            <div className="px-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5" />
                <h2 className="font-semibold">Informations de votre compte GoVisitCity</h2>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Membre depuis</p>
                      <p className="font-medium">{new Date(user.memberSince).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">E-mail vérifié</p>
                      <p className="font-medium text-green-600">Oui</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  Annuler
                </Button>
                <Button onClick={handleSave}>
                  Enregistrer les modifications
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
                Enregistrer mes informations
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}