'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Header } from '@/components/ui/header'
import { TravelForm } from '@/components/ui/travel-form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ErrorBoundary from '@/components/ui/error-boundary'
import { useErrorHandler } from '@/hooks/use-error-handler'
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
  const router = useRouter()
  
  // Utiliser le gestionnaire d'erreurs
  useErrorHandler()
  
  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    try {
      const user = localStorage.getItem('user')
      const isLoggedIn = localStorage.getItem('isLoggedIn')
      if (!user || !isLoggedIn) {
        router.push('/login')
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error)
      // En cas d'erreur localStorage, rediriger vers login
      router.push('/login')
    }
  }, [router])

  // Version: 2.1 - Production ready with PostgreSQL
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

  // Effet pour détecter les changements de dates et mettre à jour l'itinéraire
  useEffect(() => {
    if (travelInfo.startDate && travelInfo.endDate) {
      // Vérifier si les dates ont changé
      const currentDaysCount = Math.ceil((travelInfo.endDate.getTime() - travelInfo.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
      
      // Si on a un itinéraire et que le nombre de jours a changé, mettre à jour
      if (itinerary.length > 0 && currentDaysCount !== itinerary.length) {
        updateItineraryForNewDates(travelInfo.startDate, travelInfo.endDate)
      }
    }
  }, [travelInfo.startDate, travelInfo.endDate])

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
    console.log('🔍 handleTravelInfoSubmit called!')
    console.log('🔍 travelInfo:', {
      city: travelInfo.city,
      cityTrimmed: travelInfo.city?.trim(),
      startDate: travelInfo.startDate,
      endDate: travelInfo.endDate,
      participants: travelInfo.participants,
      budget: travelInfo.budget
    })
    
    if (!travelInfo.city.trim() || !travelInfo.startDate || !travelInfo.endDate) {
      console.log('❌ Validation failed:')
      console.log('  - city.trim():', travelInfo.city?.trim())
      console.log('  - startDate:', travelInfo.startDate)
      console.log('  - endDate:', travelInfo.endDate)
      return
    }
    
    console.log('✅ Validation passed, proceeding...')
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
      
      // Gestion améliorée des erreurs
      if (error.message.includes('fetch') || error.message.includes('network')) {
        alert('Erreur de connexion au serveur. Veuillez vérifier votre connexion internet et réessayer.')
      } else if (error.message.includes('500')) {
        alert('Erreur serveur interne. Veuillez réessayer dans quelques instants. Si le problème persiste, contactez le support.')
      } else if (error.message.includes('Database connection failed')) {
        alert('Erreur de connexion à la base de données. Veuillez réessayer plus tard.')
      } else {
        alert(`Erreur: ${error.message || 'Une erreur inattendue est survenue'}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const generateImagesForNewActivitiesOnly = async (newActivities: Activity[]) => {
    console.log('🖼️ Generating images ONLY for new activities without images...')
    
    for (let i = 0; i < Math.min(newActivities.length, 6); i++) {
      // Vérifier si l'activité n'a pas déjà une image
      if (newActivities[i].image) {
        console.log(`⏭️ Activity ${newActivities[i].name} already has an image, skipping`)
        continue
      }
      
      try {
        console.log(`🎨 Generating image for: ${newActivities[i].name}`)
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
                console.log(`✅ Image generated for ${newActivities[i].name}`)
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

  const generateImagesForActivitiesSimple = async (activities: Activity[]) => {
    setIsGeneratingImages(true)
    
    for (let i = 0; i < Math.min(activities.length, 6); i++) {
      // Ne générer l'image que si l'activité n'en a pas déjà une
      if (activities[i].image) {
        console.log(`⏭️ Activity ${activities[i].name} already has an image, skipping generation`)
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

  const generateImagesForActivities = async (activities: Activity[]) => {
    setIsGeneratingImages(true)
    const updatedActivities = [...activities]
    
    // Generate images for all activities
    for (let i = 0; i < activities.length; i++) {
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
            updatedActivities[i] = { ...updatedActivities[i], image: data.image }
          }
        }
      } catch (error) {
        console.error('Error generating image:', error)
      }
    }
    
    setSuggestedActivities(updatedActivities)
    setIsGeneratingImages(false)
  }

  const handleMoreActivities = async () => {
    console.log('🔥 handleMoreActivities called!')
    console.log('🔥 Theme input:', themeInput)
    console.log('🔥 City:', travelInfo.city)
    
    if (!themeInput.trim()) {
      console.log('❌ Theme input is empty')
      return
    }
    
    if (!travelInfo.city) {
      console.log('❌ No city set')
      return
    }
    
    console.log('✅ Inputs are valid, starting request...')
    setIsGeneratingMore(true)
    
    try {
      // Test with hardcoded data first
      console.log('📡 Sending API request...')
      
      // Remove timeout to let AI respond naturally
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
      
      console.log('📡 Response received:', response.status, response.statusText)
      
      if (!response.ok) {
        console.error('❌ API response not ok:', response.status, response.statusText)
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
      console.log('✅ API Response data:', data)
      
      if (!data.activities || data.activities.length === 0) {
        console.warn('❌ No activities in response')
        alert('Aucune activité reçue de l\'API')
        setIsGeneratingMore(false)
        return
      }
      
      console.log(`✅ Received ${data.activities.length} activities`)
      
      // Force update with a simple approach - new activities FIRST
      const newActivities = data.activities.map((activity: any, index: number) => ({
        ...activity,
        id: activity.id || `new_${Date.now()}_${index}`,
        isNewlyAdded: true // Flag to identify newly added activities
      }))
      
      console.log('🔄 Updating state with new activities:', newActivities.length)
      
      setSuggestedActivities(prev => {
        // Remove isNewlyAdded flags from all existing activities
        const existingActivities = prev.map(activity => ({ ...activity, isNewlyAdded: false }))
        console.log(`🔄 Removed "Nouveau" flags from ${existingActivities.length} existing activities`)
        // Put new activities FIRST, then existing ones without flags
        const result = [...newActivities, ...existingActivities]
        console.log(`🎉 State updated! Total activities: ${result.length}`)
        console.log('🎉 First 3 activities:', result.slice(0, 3))
        
        // Générer les images SEULEMENT pour les nouvelles activités qui n'en ont pas
        setTimeout(() => {
          generateImagesForNewActivitiesOnly(newActivities)
        }, 100)
        
        return result
      })
      
      setThemeInput('')
      setNewActivitiesCount(newActivities.length)
      setTimeout(() => setNewActivitiesCount(0), 3000)
      
      // Les flags isNewlyAdded restent jusqu'à la prochaine recherche
      
      console.log('🎉 SUCCESS! Activities added successfully')
      
    } catch (error) {
      console.error('💥 ERROR in handleMoreActivities:', error)
      alert(`Erreur: ${error.message}`)
    } finally {
      setIsGeneratingMore(false)
      console.log('🏁 Function finished')
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

  const saveTravel = async () => {
    if (itinerary.length === 0) {
      alert('Aucun itinéraire à sauvegarder. Veuillez d\'abord générer un itinéraire.')
      return
    }
    
    setIsLoading(true)
    try {
      const travelData = {
        travelInfo: {
          city: travelInfo.city,
          startDate: travelInfo.startDate?.toISOString(),
          endDate: travelInfo.endDate?.toISOString(),
          participants: travelInfo.participants,
          budget: travelInfo.budget
        },
        selectedActivities: selectedActivities,
        itinerary: itinerary,
        savedAt: new Date().toISOString()
      }
      
      // Sauvegarder dans le localStorage
      const savedTravels = JSON.parse(localStorage.getItem('savedTravels') || '[]')
      const newTravel = {
        id: `travel_${Date.now()}`,
        ...travelData,
        title: `Voyage à ${travelInfo.city} - ${new Date().toLocaleDateString('fr-FR')}`
      }
      savedTravels.push(newTravel)
      localStorage.setItem('savedTravels', JSON.stringify(savedTravels))
      
      // Afficher un message de succès
      alert('✅ Voyage sauvegardé avec succès!')
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('❌ Erreur lors de la sauvegarde du voyage')
    } finally {
      setIsLoading(false)
    }
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
          city: travelInfo.city
        })
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la génération de l\'itinéraire')
      }
      
      const data = await response.json()
      setItinerary(data.itinerary)
      setStep('itinerary')
      
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la génération de l\'itinéraire')
    } finally {
      setIsLoading(false)
    }
  }

  const updateItineraryForNewDates = (newStartDate: Date, newEndDate: Date) => {
    const newDaysCount = Math.ceil((newEndDate.getTime() - newStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    
    setItinerary(prev => {
      const newItinerary: ItineraryDay[] = []
      
      for (let i = 0; i < newDaysCount; i++) {
        const currentDate = new Date(newStartDate)
        currentDate.setDate(newStartDate.getDate() + i)
        
        if (i < prev.length) {
          // Garder les activités du jour existant
          newItinerary.push({
            ...prev[i],
            date: currentDate.toISOString().split('T')[0]
          })
        } else {
          // Créer un nouveau jour vide
          newItinerary.push({
            day: i + 1,
            date: currentDate.toISOString().split('T')[0],
            activities: []
          })
        }
      }
      
      return newItinerary
    })
  }

  const handleDragStart = (activity: Activity, fromDay: number) => {
    setDraggedActivity(activity)
    setDraggedFromDay(fromDay)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, toDay: number) => {
    e.preventDefault()
    
    if (!draggedActivity || draggedFromDay === null) return
    
    setItinerary(prev => {
      const newItinerary = [...prev]
      
      // Retirer l'activité du jour d'origine
      newItinerary[draggedFromDay].activities = newItinerary[draggedFromDay].activities.filter(
        a => a.id !== draggedActivity.id
      )
      
      // Ajouter l'activité au jour de destination
      newItinerary[toDay].activities.push(draggedActivity)
      
      return newItinerary
    })
    
    setDraggedActivity(null)
    setDraggedFromDay(null)
  }

  const removeActivityFromItinerary = (dayIndex: number, activityId: string) => {
    setItinerary(prev => {
      const newItinerary = [...prev]
      newItinerary[dayIndex].activities = newItinerary[dayIndex].activities.filter(
        a => a.id !== activityId
      )
      return newItinerary
    })
  }

  const resetPlanner = () => {
    setStep('travel-info')
    setTravelInfo({
      city: '',
      startDate: null,
      endDate: null,
      participants: 2,
      budget: ''
    })
    setSuggestedActivities([])
    setSelectedActivities([])
    setItinerary([])
    setThemeInput('')
  }

  // ... (le reste du code continue avec les fonctions manquantes)
  
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        
        <main className="w-[500px] mx-auto">
          {/* Travel Info Step */}
          {step === 'travel-info' && (
            <div className="px-6 py-4">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Planifiez votre voyage parfait
                </h1>
                <p className="text-gray-600">
                  Découvrez des activités uniques et créez des souvenirs inoubliables
                </p>
              </div>

              <TravelForm
                travelInfo={travelInfo}
                setTravelInfo={setTravelInfo}
                onSubmit={handleTravelInfoSubmit}
                isLoading={isLoading}
                popularCities={popularCities}
                budgetOptions={budgetOptions}
              />
            </div>
          )}

          {/* Activities Step */}
          {step === 'activities' && (
            <div className="px-6 py-4">
              <div className="mb-6">
                <Button
                  variant="ghost"
                  onClick={() => setStep('travel-info')}
                  className="mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
                
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Activités à {travelInfo.city}
                </h2>
                <p className="text-gray-600">
                  Sélectionnez les activités qui vous intéressent
                </p>
              </div>

              {/* Theme Input */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <Input
                    placeholder="Rechercher un thème (ex: Culturel, Gastronomique, Aventure...)"
                    value={themeInput}
                    onChange={(e) => setThemeInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleMoreActivities()}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleMoreActivities}
                    disabled={isGeneratingMore || !themeInput.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isGeneratingMore ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                
                {newActivitiesCount > 0 && (
                  <div className="mt-2 text-sm text-green-600 font-medium">
                    ✅ {newActivitiesCount} nouvelles activités ajoutées!
                  </div>
                )}
              </div>

              {/* Popular Themes */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Thèmes populaires</h3>
                <div className="flex flex-wrap gap-2">
                  {popularThemes.map((theme) => (
                    <Button
                      key={theme}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setThemeInput(theme)
                        handleMoreActivities()
                      }}
                      disabled={isGeneratingMore}
                    >
                      {theme}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Activities List */}
              <ScrollArea className="h-[400px] mb-6">
                <div className="space-y-4">
                  {suggestedActivities.map((activity) => (
                    <Card 
                      key={activity.id} 
                      className={`cursor-pointer transition-all ${
                        selectedActivities.find(a => a.id === activity.id) 
                          ? 'ring-2 ring-blue-500 bg-blue-50' 
                          : 'hover:shadow-md'
                      } ${(activity as any).isNewlyAdded ? 'border-green-500 bg-green-50' : ''}`}
                      onClick={() => toggleActivitySelection(activity)}
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {activity.image && (
                            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                              <img 
                                src={activity.image} 
                                alt={activity.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-gray-900">
                                {activity.name}
                                {(activity as any).isNewlyAdded && (
                                  <Badge className="ml-2 bg-green-500 text-white text-xs">Nouveau</Badge>
                                )}
                              </h3>
                              <div className="flex items-center gap-2">
                                {selectedActivities.find(a => a.id === activity.id) && (
                                  <Check className="w-4 h-4 text-blue-500" />
                                )}
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {activity.description}
                            </p>
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {activity.duration}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {activity.category}
                              </span>
                              {activity.price && (
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  {activity.price}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>

              {/* Selection Summary */}
              {selectedActivities.length > 0 && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-900">
                      {selectedActivities.length} activité{selectedActivities.length > 1 ? 's' : ''} sélectionnée{selectedActivities.length > 1 ? 's' : ''}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSelections(!showSelections)}
                    >
                      {showSelections ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </div>
                  
                  {showSelections && (
                    <div className="mt-2 space-y-1">
                      {selectedActivities.map((activity) => (
                        <div key={activity.id} className="text-xs text-blue-700">
                          • {activity.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('travel-info')}
                  className="flex-1"
                >
                  Modifier
                </Button>
                <Button
                  onClick={generateItinerary}
                  disabled={selectedActivities.length === 0 || isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Wand2 className="w-4 h-4 mr-2" />
                  )}
                  Générer l'itinéraire
                </Button>
              </div>
            </div>
          )}

          {/* Itinerary Step */}
          {step === 'itinerary' && (
            <div className="px-6 py-4">
              <div className="mb-6">
                <Button
                  variant="ghost"
                  onClick={() => setStep('activities')}
                  className="mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour aux activités
                </Button>
                
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Votre itinéraire à {travelInfo.city}
                </h2>
                <p className="text-gray-600">
                  {new Date(travelInfo.startDate!).toLocaleDateString('fr-FR')} - {new Date(travelInfo.endDate!).toLocaleDateString('fr-FR')}
                </p>
              </div>

              <ScrollArea className="h-[500px] mb-6">
                <div className="space-y-6">
                  {itinerary.map((day, dayIndex) => (
                    <Card key={day.day}>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Jour {day.day} - {new Date(day.date).toLocaleDateString('fr-FR', { 
                            weekday: 'long', 
                            day: 'numeric', 
                            month: 'long' 
                          })}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div 
                          className="space-y-3 min-h-[100px] border-2 border-dashed border-gray-200 rounded-lg p-4"
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, dayIndex)}
                        >
                          {day.activities.length === 0 ? (
                            <p className="text-center text-gray-500 text-sm">
                              Glissez-déposez des activités ici
                            </p>
                          ) : (
                            day.activities.map((activity) => (
                              <div
                                key={activity.id}
                                draggable
                                onDragStart={() => handleDragStart(activity, dayIndex)}
                                className="bg-white p-3 rounded-lg border cursor-move hover:shadow-md transition-shadow"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-sm">{activity.name}</h4>
                                    <p className="text-xs text-gray-600 mt-1">
                                      {activity.duration} • {activity.category}
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeActivityFromItinerary(dayIndex, activity.id)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={resetPlanner}
                  className="flex-1"
                >
                  Nouveau voyage
                </Button>
                <Button
                  onClick={saveTravel}
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Sauvegarder
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </ErrorBoundary>
  )
}