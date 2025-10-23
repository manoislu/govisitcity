'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Users, Clock, Plus, Edit, Trash2, Share2, Plane, Hotel, Camera } from 'lucide-react'
import { Header } from '@/components/ui/header'
import Link from 'next/link'

interface Trip {
  id: string
  destination: string
  startDate: string
  endDate: string
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  travelers: number
  budget?: number
  image?: string
  activities?: string[]
  description?: string
}

export default function MyTripsPage() {
  const [isMounted, setIsMounted] = useState(false)
  const [trips, setTrips] = useState<Trip[]>([
    {
      id: '1',
      destination: 'Paris, France',
      startDate: '2024-12-15',
      endDate: '2024-12-22',
      status: 'upcoming',
      travelers: 2,
      budget: 2500,
      image: '/photos/city1.jpg',
      activities: ['Visite Tour Eiffel', 'Musée Louvre', 'Croisière Seine'],
      description: 'Voyage romantique dans la ville lumière'
    },
    {
      id: '2',
      destination: 'Amsterdam, Pays-Bas',
      startDate: '2024-10-10',
      endDate: '2024-10-15',
      status: 'completed',
      travelers: 4,
      budget: 1800,
      image: '/photos/amsterdam-canals.jpg',
      activities: ['Visite musées', 'Tour en vélo', 'Croisière canaux'],
      description: 'Week-end entre amis pour découvrir la ville'
    },
    {
      id: '3',
      destination: 'Rome, Italie',
      startDate: '2025-03-20',
      endDate: '2025-03-27',
      status: 'upcoming',
      travelers: 2,
      budget: 2200,
      activities: ['Colisée', 'Vatican', 'Fontaine de Trevi'],
      description: 'Découverte de la Rome antique'
    }
  ])
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('all')

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const getStatusColor = (status: Trip['status']) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800'
      case 'ongoing': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: Trip['status']) => {
    switch (status) {
      case 'upcoming': return 'À venir'
      case 'ongoing': return 'En cours'
      case 'completed': return 'Terminé'
      case 'cancelled': return 'Annulé'
      default: return status
    }
  }

  const filteredTrips = trips.filter(trip => 
    filter === 'all' || trip.status === filter
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
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
            <Calendar className="w-6 h-6 text-[#6CCDEA]" />
            <h1 className="text-2xl font-normal text-gray-900">Mes voyages</h1>
          </div>
          <p className="text-gray-600 text-center mb-4">Gérez et planifiez toutes vos aventures</p>
          <div className="flex justify-center">
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau voyage
              </Button>
            </Link>
          </div>
        </div>

        {/* Filtres */}
        <div className="px-6 mb-6">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Tous ({trips.length})
            </Button>
            <Button
              variant={filter === 'upcoming' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('upcoming')}
            >
              À venir ({trips.filter(t => t.status === 'upcoming').length})
            </Button>
            <Button
              variant={filter === 'ongoing' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('ongoing')}
            >
              En cours ({trips.filter(t => t.status === 'ongoing').length})
            </Button>
            <Button
              variant={filter === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('completed')}
            >
              Terminés ({trips.filter(t => t.status === 'completed').length})
            </Button>
          </div>
        </div>

        {/* Liste des voyages */}
        <div className="px-6 space-y-4">
          {filteredTrips.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Plane className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {filter === 'all' ? 'Aucun voyage' : `Aucun voyage ${getStatusText(filter as any)}`}
                </h3>
                <p className="text-gray-600 mb-4">
                  {filter === 'all' 
                    ? 'Commencez par planifier votre première aventure !'
                    : `Vous n'avez pas de voyage ${getStatusText(filter as any).toLowerCase()}`
                  }
                </p>
                <Link href="/">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Planifier un voyage
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            filteredTrips.map((trip) => (
              <Card key={trip.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {trip.image && (
                  <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${trip.image})` }}>
                    <div className="h-full bg-black bg-opacity-20 flex items-end p-4">
                      <Badge className={getStatusColor(trip.status)}>
                        {getStatusText(trip.status)}
                      </Badge>
                    </div>
                  </div>
                )}
                
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {trip.destination}
                      </h3>
                      {trip.description && (
                        <p className="text-sm text-gray-600">{trip.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(trip.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{calculateDays(trip.startDate, trip.endDate)} jours</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{trip.travelers} voyageur{trip.travelers > 1 ? 's' : ''}</span>
                    </div>
                    {trip.budget && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="text-green-600 font-medium">
                          {trip.budget.toLocaleString('fr-FR')} €
                        </span>
                      </div>
                    )}
                  </div>

                  {trip.activities && trip.activities.length > 0 && (
                    <div className="border-t pt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Camera className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Activités prévues</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {trip.activities.slice(0, 3).map((activity, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {activity}
                          </Badge>
                        ))}
                        {trip.activities.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{trip.activities.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Statistiques */}
        {trips.length > 0 && (
          <div className="px-6 mt-8 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vos statistiques de voyage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{trips.length}</div>
                    <div className="text-sm text-gray-600">Voyages totaux</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {trips.filter(t => t.status === 'completed').length}
                    </div>
                    <div className="text-sm text-gray-600">Voyages terminés</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {trips.filter(t => t.status === 'upcoming').length}
                    </div>
                    <div className="text-sm text-gray-600">À venir</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {trips.reduce((sum, trip) => sum + (trip.budget || 0), 0).toLocaleString('fr-FR')} €
                    </div>
                    <div className="text-sm text-gray-600">Budget total</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}