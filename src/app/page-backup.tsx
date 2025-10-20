'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Header } from '@/components/ui/header'
import { TravelForm } from '@/components/ui/travel-form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Star, 
  Plus, 
  X, 
  ChevronRight, 
  Sparkles, 
  Map, 
  Image as ImageIcon,
  GripVertical,
  Wand2,
  RefreshCw,
  Users,
  DollarSign,
  Check,
  ChevronUp,
  ChevronDown,
  Brain,
  TrendingUp,
  ArrowLeft,
  Search,
  ArrowRight
} from 'lucide-react'

interface TravelInfo {
  city: string
  startDate: Date | null
  endDate: Date | null
  participants: number
  budget: string
}

interface Activity {
  id: string
  name: string
  description: string
  category: string
  duration: string
  rating?: number
  price?: string
  image?: string
}

interface ItineraryDay {
  day: number
  date: string
  activities: Activity[]
  _aiOptimized?: boolean
  _totalTime?: string
  _walkingTime?: string
  _area?: string
}

export default function TravelPlanner() {
  const [step, setStep] = useState<'travel-info' | 'activities' | 'itinerary'>('travel-info')
  const [travelInfo, setTravelInfo] = useState<TravelInfo>({
    city: '',
    startDate: null,
    endDate: null,
    participants: 2,
    budget: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [suggestedActivities, setSuggestedActivities] = useState<Activity[]>([])
  const [selectedActivities, setSelectedActivities] = useState<Activity[]>([])
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([])
  const [themeInput, setThemeInput] = useState('')
  const [isGeneratingMore, setIsGeneratingMore] = useState(false)
  const [isGeneratingImages, setIsGeneratingImages] = useState(false)
  const [newActivitiesCount, setNewActivitiesCount] = useState(0)
  const [draggedActivity, setDraggedActivity] = useState<Activity | null>(null)
  const [draggedFromDay, setDraggedFromDay] = useState<number | null>(null)
  const [showSelections, setShowSelections] = useState(false)

  // Prevent SSR issues - simplified approach
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (travelInfo.startDate && travelInfo.endDate) {
      const currentDaysCount = Math.ceil((travelInfo.endDate.getTime() - travelInfo.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
      
      if (itinerary.length > 0 && currentDaysCount !== itinerary.length) {
        updateItineraryForNewDates(travelInfo.startDate, travelInfo.endDate)
      }
    }
  }, [travelInfo.startDate, travelInfo.endDate])

  // Remove the loading screen check - let the app render normally

  const popularCities = [
    'Paris', 'Londres', 'Rome', 'Barcelone', 'Amsterdam', 
    'Berlin', 'Madrid', 'Venise', 'Prague', 'Budapest'
  ]

  const popularThemes = [
    'Romantique', 'Aventure', 'Culturel', 'Gastronomique', 
    'Familial', 'Nocturne', 'Nature', 'Shopping'
  ]

  const budgetOptions = [
    '€ (Économique)',
    '€€ (Modéré)',
    '€€€ (Confort)',
    '€€€€ (Luxe)'
  ]

  const handleTravelInfoSubmit = async () => {
    if (!travelInfo.city.trim() || !travelInfo.startDate || !travelInfo.endDate) {
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/suggest-activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          city: travelInfo.city,
          budget: travelInfo.budget || '',
          participants: travelInfo.participants || 1
        })
      })
      
      if (!response.ok) {
        if (response.status === 502) {
          alert('Le serveur met trop de temps à répondre. Veuillez réessayer dans quelques instants.')
        } else {
          alert(`Erreur lors de la génération des activités: ${response.status}`)
        }
        return
      }
      
      const data = await response.json()
      
      if (!data.activities || data.activities.length === 0) {
        alert('Aucune activité reçue. Veuillez réessayer.')
        return
      }
      
      setSuggestedActivities(data.activities.map(activity => ({ ...activity, isNewlyAdded: false })))
      setStep('activities')
      
      generateImagesForActivitiesSimple(data.activities)
      
    } catch (error) {
      console.error('💥 ERROR in handleTravelInfoSubmit:', error)
      alert(`Erreur: ${error.message || 'Une erreur inattendue est survenue'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const generateImagesForActivitiesSimple = async (activities: Activity[]) => {
    if (!travelInfo.city) return
    
    setIsGeneratingImages(true)
    
    for (let i = 0; i < Math.min(activities.length, 6); i++) {
      if (activities[i].image) {
        continue
      }
      
      try {
        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            activityName: activities[i].name, 
            city: travelInfo.city, 
            category: activities[i].category 
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.image) {
            setSuggestedActivities(prev => {
              const updated = [...prev]
              const index = updated.findIndex(a => a.id === activities[i].id)
              if (index !== -1) {
                updated[index] = { ...updated[index], image: data.image }
              }
              return updated
            })
          }
        }
      } catch (error) {
        console.error(`Error generating image for activity ${i + 1}:`, error)
      }
    }
    
    setIsGeneratingImages(false)
  }

  const handleMoreActivities = async () => {
    if (!themeInput.trim() || !travelInfo.city) {
      return
    }
    
    setIsGeneratingMore(true)
    
    try {
      const response = await fetch('/api/more-activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          city: travelInfo.city, 
          theme: themeInput,
          existingActivities: suggestedActivities,
          budget: travelInfo.budget,
          participants: travelInfo.participants
        })
      })
      
      if (!response.ok) {
        if (response.status === 404) {
          const errorData = await response.json()
          alert(errorData.error || 'Aucune activité trouvée pour ce thème. Essayez un autre thème comme "Culturel", "Gastronomique" ou "Aventure".')
        } else {
          alert(`Erreur API: ${response.status} ${response.statusText}`)
        }
        setIsGeneratingMore(false)
        return
      }
      
      const data = await response.json()
      
      if (!data.activities || data.activities.length === 0) {
        alert('Aucune activité reçue de l\'API')
        setIsGeneratingMore(false)
        return
      }
      
      const newActivities = data.activities.map((activity: any, index: number) => ({
        ...activity,
        id: activity.id || `new_${Date.now()}_${index}`,
        isNewlyAdded: true
      }))
      
      setSuggestedActivities(prev => {
        const existingActivities = prev.map(activity => ({ ...activity, isNewlyAdded: false }))
        const result = [...newActivities, ...existingActivities]
        
        setTimeout(() => {
          generateImagesForNewActivitiesOnly(newActivities)
        }, 100)
        
        return result
      })
      
      setThemeInput('')
      setNewActivitiesCount(newActivities.length)
      setTimeout(() => setNewActivitiesCount(0), 3000)
      
    } catch (error) {
      console.error('💥 ERROR in handleMoreActivities:', error)
      alert(`Erreur: ${error.message}`)
    } finally {
      setIsGeneratingMore(false)
    }
  }

  const generateImagesForNewActivitiesOnly = async (newActivities: Activity[]) => {
    if (!travelInfo.city) return
    
    for (let i = 0; i < Math.min(newActivities.length, 6); i++) {
      if (newActivities[i].image) {
        continue
      }
      
      try {
        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            activityName: newActivities[i].name, 
            city: travelInfo.city, 
            category: newActivities[i].category 
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.image) {
            setSuggestedActivities(prev => {
              const updated = [...prev]
              const index = updated.findIndex(a => a.id === newActivities[i].id)
              if (index !== -1) {
                updated[index] = { ...updated[index], image: data.image }
              }
              return updated
            })
          }
        }
      } catch (error) {
        console.error(`Error generating image for ${newActivities[i].name}:`, error)
      }
    }
  }

  const toggleActivitySelection = (activity: Activity) => {
    setSelectedActivities(prev => {
      const exists = prev.find(a => a.id === activity.id)
      if (exists) {
        return prev.filter(a => a.id !== activity.id)
      } else {
        return [...prev, activity]
      }
    })
  }

  const generateItinerary = async () => {
    if (selectedActivities.length === 0) {
      alert('Veuillez sélectionner au moins une activité.')
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activities: selectedActivities,
          startDate: travelInfo.startDate,
          endDate: travelInfo.endDate,
          participants: travelInfo.participants
        })
      })
      
      if (!response.ok) {
        alert('Erreur lors de la génération de l\'itinéraire.')
        return
      }
      
      const data = await response.json()
      setItinerary(data.itinerary)
      setStep('itinerary')
      
    } catch (error) {
      console.error('Error generating itinerary:', error)
      alert('Erreur lors de la génération de l\'itinéraire.')
    } finally {
      setIsLoading(false)
    }
  }

  const updateItineraryForNewDates = (newStartDate: Date, newEndDate: Date) => {
    const newDaysCount = Math.ceil((newEndDate.getTime() - newStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    
    if (itinerary.length === 0) return
    
    const newItinerary: ItineraryDay[] = []
    const allActivities = itinerary.flatMap(day => day.activities)
    
    for (let i = 0; i < newDaysCount; i++) {
      const currentDate = new Date(newStartDate)
      currentDate.setDate(newStartDate.getDate() + i)
      
      newItinerary.push({
        day: i + 1,
        date: currentDate.toLocaleDateString('fr-FR'),
        activities: []
      })
    }
    
    allActivities.forEach((activity, index) => {
      const dayIndex = index % newDaysCount
      newItinerary[dayIndex].activities.push(activity)
    })
    
    setItinerary(newItinerary)
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {step === 'travel-info' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Planifiez votre voyage parfait
              </h2>
              <p className="text-gray-600 text-lg">
                Découvrez des activités incroyables et créez votre itinéraire personnalisé
              </p>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Informations de voyage
                </CardTitle>
                <CardDescription>
                  Remplissez les informations de base pour commencer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TravelForm
                  value={travelInfo}
                  onChange={setTravelInfo}
                />
                
                <div className="mt-6 flex justify-center">
                  <Button
                    onClick={handleTravelInfoSubmit}
                    disabled={isLoading || !travelInfo.city.trim() || !travelInfo.startDate || !travelInfo.endDate}
                    className="px-8 py-3 text-lg"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Recherche en cours...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Trouver des activités
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'activities' && (
          <div className="max-w-6xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Activités à {travelInfo.city}
                </h2>
                <p className="text-gray-600">
                  Sélectionnez les activités qui vous intéressent
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setStep('travel-info')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
            </div>

            {newActivitiesCount > 0 && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">
                  ✅ {newActivitiesCount} nouvelles activités ajoutées !
                </p>
              </div>
            )}

            <div className="mb-6 flex gap-4 items-end">
              <div className="flex-1">
                <Input
                  placeholder="Rechercher plus d'activités (ex: Culturel, Gastronomique, Aventure...)"
                  value={themeInput}
                  onChange={(e) => setThemeInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleMoreActivities()}
                />
              </div>
              <Button
                onClick={handleMoreActivities}
                disabled={isGeneratingMore || !themeInput.trim()}
              >
                {isGeneratingMore ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Recherche...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Rechercher
                  </>
                )}
              </Button>
            </div>

            <div className="mb-6 flex gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="secondary">
                  {suggestedActivities.length} activités trouvées
                </Badge>
                <Badge variant="outline">
                  {selectedActivities.length} sélectionnées
                </Badge>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowSelections(!showSelections)}
                >
                  {showSelections ? (
                    <>
                      <X className="mr-2 h-4 w-4" />
                      Tout afficher
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Voir la sélection
                    </>
                  )}
                </Button>
                
                {selectedActivities.length > 0 && (
                  <Button onClick={generateItinerary} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Génération...
                      </>
                    ) : (
                      <>
                        <Calendar className="mr-2 h-4 w-4" />
                        Générer l'itinéraire
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {isGeneratingImages && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800">
                  🎨 Génération des images en cours...
                </p>
              </div>
            )}

            <ScrollArea className="h-[600px]">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {(showSelections ? selectedActivities : suggestedActivities).map((activity) => (
                  <Card
                    key={activity.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedActivities.find(a => a.id === activity.id)
                        ? 'ring-2 ring-blue-500 bg-blue-50'
                        : ''
                    } ${activity.isNewlyAdded ? 'ring-2 ring-green-500 bg-green-50' : ''}`}
                    onClick={() => toggleActivitySelection(activity)}
                  >
                    {activity.image && (
                      <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                        <img
                          src={activity.image}
                          alt={activity.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{activity.name}</CardTitle>
                        {selectedActivities.find(a => a.id === activity.id) && (
                          <Check className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      {activity.isNewlyAdded && (
                        <Badge variant="secondary" className="w-fit">
                          Nouveau
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">
                        {activity.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <Badge variant="outline">{activity.category}</Badge>
                        <span className="text-gray-500">{activity.duration}</span>
                      </div>
                      {activity.rating && (
                        <div className="flex items-center mt-2">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="ml-1 text-sm">{activity.rating}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {step === 'itinerary' && (
          <div className="max-w-6xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Votre itinéraire à {travelInfo.city}
                </h2>
                <p className="text-gray-600">
                  {travelInfo.startDate?.toLocaleDateString('fr-FR')} - {travelInfo.endDate?.toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep('activities')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour aux activités
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setStep('travel-info')}
                >
                  Nouveau voyage
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[600px]">
              <div className="space-y-6">
                {itinerary.map((day) => (
                  <Card key={day.day}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Jour {day.day} - {day.date}
                      </CardTitle>
                      {day._aiOptimized && (
                        <Badge variant="secondary" className="w-fit">
                          <Brain className="mr-1 h-3 w-3" />
                          Optimisé par l'IA
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {day.activities.map((activity, index) => (
                          <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{activity.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {activity.description}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {activity.duration}
                                </span>
                                <Badge variant="outline">{activity.category}</Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </main>
    </div>
  )
}