'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
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

export default function GoVisitCity() {
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
      
      setSuggestedActivities(data.activities)
      setStep('activities')
      
      // Ne plus générer les images automatiquement pour éviter les changements visibles
      // generateImagesForActivitiesSimple(data.activities)
      
    } catch (error) {
      console.error('💥 ERROR in handleTravelInfoSubmit:', error)
      if (error.message.includes('fetch')) {
        alert('Erreur de connexion au serveur. Veuillez vérifier votre connexion internet.')
      } else {
        alert(`Erreur: ${error.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const generateImagesForActivitiesSimple = async (activities: Activity[]) => {
    setIsGeneratingImages(true)
    
    try {
      for (let i = 0; i < Math.min(activities.length, 6); i++) {
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
    } catch (error) {
      console.error('Error in generateImagesForActivitiesSimple:', error)
    } finally {
      setIsGeneratingImages(false)
    }
  }

  const generateImagesForActivities = async (activities: Activity[]) => {
    setIsGeneratingImages(true)
    const updatedActivities = [...activities]
    
    try {
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
    } catch (error) {
      console.error('Error in generateImagesForActivities:', error)
    } finally {
      setIsGeneratingImages(false)
    }
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
          participants: travelInfo.participants,
          generateImages: false // Ne pas générer d'images pour éviter les changements visibles
        })
      })
      
      console.log('📡 Response received:', response.status, response.statusText)
      
      if (!response.ok) {
        console.error('❌ API response not ok:', response.status, response.statusText)
        alert(`Erreur API: ${response.status} ${response.statusText}`)
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
        // Remove isNewlyAdded flag from all existing activities
        const cleanedPrev = prev.map(activity => ({
          ...activity,
          isNewlyAdded: false
        }))
        
        // Put new activities FIRST, then existing ones without the flag
        const result = [...newActivities, ...cleanedPrev]
        console.log(`🎉 State updated! Total activities: ${result.length}`)
        console.log('🎉 First 3 activities:', result.slice(0, 3))
        return result
      })
      
      setThemeInput('')
      setNewActivitiesCount(newActivities.length)
      setTimeout(() => setNewActivitiesCount(0), 3000)
      
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

  const generateItinerary = async () => {
    if (selectedActivities.length === 0) return
    
    setIsLoading(true)
    try {
      const startDate = travelInfo.startDate!
      const endDate = travelInfo.endDate!
      
      // Normaliser les dates à minuit pour un calcul correct
      const normalizedStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
      const normalizedEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
      
      const days = Math.round((normalizedEnd.getTime() - normalizedStart.getTime()) / (1000 * 60 * 60 * 24)) + 1 // Utiliser Math.round
      
      // DEBUG: Log frontend date calculations
      console.log('🔍 FRONTEND DATE DEBUG:')
      console.log('📅 Original startDate object:', startDate)
      console.log('📅 Original startDate ISO:', startDate.toISOString())
      console.log('📅 Normalized start date:', normalizedStart.toISOString())
      console.log('📅 Original endDate object:', endDate)
      console.log('📅 Original endDate ISO:', endDate.toISOString())
      console.log('📅 Normalized end date:', normalizedEnd.toISOString())
      console.log('📅 Calculated days:', days)
      
      // CORRECTION: Envoyer la date locale correcte, pas UTC
      const startDateString = startDate.toLocaleDateString('fr-FR', { 
        year: 'numeric',
        month: '2-digit', 
        day: '2-digit'
      }).split('/').reverse().join('-') // Convert DD/MM/YYYY -> YYYY-MM-DD
      
      console.log('📅 ENVOI A LAPI:', {
        startDate: startDateString,
        endDate: endDate.toLocaleDateString('fr-FR', { 
          year: 'numeric',
          month: '2-digit', 
          day: '2-digit'
        }).split('/').reverse().join('-'),
        days: days
      })
      
      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          city: travelInfo.city, 
          activities: selectedActivities,
          days: Math.min(days, 7),
          startDate: startDateString,
          endDate: endDate.toLocaleDateString('fr-FR', { 
            year: 'numeric',
            month: '2-digit', 
            day: '2-digit'
          }).split('/').reverse().join('-'),
          participants: travelInfo.participants,
          budget: travelInfo.budget
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.itinerary && data.itinerary.length > 0) {
          console.log('📅 REÇU DE LAPI:', data.itinerary.map(d => `Day ${d.day}: ${d.date}`))
          
          // DEBUG: Verify each day's date calculation
          console.log('🔍 VERIFICATION DES DATES:')
          data.itinerary.forEach((day: any, index: number) => {
            const expectedDate = new Date(startDateString + 'T12:00:00')
            expectedDate.setDate(expectedDate.getDate() + index)
            const expectedDateStr = expectedDate.toLocaleDateString('fr-FR', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric'
            })
            const isMatch = day.date === expectedDateStr
            console.log(`Day ${day.day}: API=${day.date}, Expected=${expectedDateStr}, Match=${isMatch}`)
          })
          
          // DEBUG: Compare with frontend display
          console.log('🔍 COMPARAISON FRONTEND/API:')
          console.log(`Frontend header: ${startDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })} au ${endDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`)
          console.log(`API first day: ${data.itinerary[0]?.date}, API last day: ${data.itinerary[data.itinerary.length - 1]?.date}`)
          
          setItinerary(data.itinerary)
          setStep('itinerary')
        } else {
          alert('Erreur: L\'itinéraire reçu est vide')
        }
      } else {
        alert('Erreur API: ' + response.status)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDragStart = (activity: Activity, fromDay: number | null) => {
    setDraggedActivity(activity)
    setDraggedFromDay(fromDay)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, toDay: number, toIndex?: number) => {
    e.preventDefault()
    
    if (!draggedActivity) return

    const newItinerary = [...itinerary]
    
    // Remove from original location
    if (draggedFromDay !== null) {
      newItinerary[draggedFromDay].activities = newItinerary[draggedFromDay].activities.filter(
        a => a.id !== draggedActivity.id
      )
    }
    
    // Add to new location (check for duplicates in the same day only)
    const existsInDay = newItinerary[toDay].activities.some(a => a.id === draggedActivity.id)
    if (!existsInDay) {
      if (toIndex !== undefined) {
        newItinerary[toDay].activities.splice(toIndex, 0, draggedActivity)
      } else {
        newItinerary[toDay].activities.push(draggedActivity)
      }
    }
    
    setItinerary(newItinerary)
    setDraggedActivity(null)
    setDraggedFromDay(null)
  }

  const removeFromItinerary = (dayIndex: number, activityId: string) => {
    setItinerary(prev => {
      const newItinerary = [...prev]
      newItinerary[dayIndex].activities = newItinerary[dayIndex].activities.filter(
        a => a.id !== activityId
      )
      return newItinerary
    })
  }

  const addToItinerary = (dayIndex: number, activity: Activity) => {
    setItinerary(prev => {
      const newItinerary = [...prev]
      newItinerary[dayIndex].activities.push(activity)
      return newItinerary
    })
  }

  const updateItineraryForNewDates = (newStartDate: Date, newEndDate: Date) => {
    if (!newStartDate || !newEndDate) return
    
    // Calculer le nombre de jours selon les nouvelles dates
    // Normaliser les dates à minuit pour éviter les problèmes d'heures
    const normalizedStart = new Date(newStartDate.getFullYear(), newStartDate.getMonth(), newStartDate.getDate())
    const normalizedEnd = new Date(newEndDate.getFullYear(), newEndDate.getMonth(), newEndDate.getDate())
    
    const timeDiff = normalizedEnd.getTime() - normalizedStart.getTime()
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24)
    const newDaysCount = Math.round(daysDiff) + 1 // Utiliser Math.round au lieu de Math.ceil
    
    console.log('🔄 updateItineraryForNewDates called:')
    console.log('📅 Original start date:', newStartDate.toLocaleDateString('fr-FR'), newStartDate.toISOString())
    console.log('📅 Original end date:', newEndDate.toLocaleDateString('fr-FR'), newEndDate.toISOString())
    console.log('📅 Normalized start date:', normalizedStart.toLocaleDateString('fr-FR'), normalizedStart.toISOString())
    console.log('📅 Normalized end date:', normalizedEnd.toLocaleDateString('fr-FR'), normalizedEnd.toISOString())
    console.log('📅 Time difference (ms):', timeDiff)
    console.log('📅 Time difference (days):', daysDiff)
    console.log('📅 Math.ceil(daysDiff):', Math.ceil(daysDiff))
    console.log('📅 New days count (Math.ceil + 1):', newDaysCount)
    console.log('📅 Current itinerary length:', itinerary.length)
    console.log('📅 Current itinerary:', itinerary.map(d => `Day ${d.day}: ${d.date}`))
    
    setItinerary(prev => {
      // Reconstruire complètement l'itinéraire depuis le début
      const newItinerary = []
      
      // Conserver les activités existantes pour les replacer plus tard
      const allExistingActivities = prev.flatMap(day => day.activities)
      console.log('📝 Preserved activities:', allExistingActivities.length)
      
      // Créer les nouveaux jours selon les nouvelles dates
      for (let dayNumber = 1; dayNumber <= newDaysCount; dayNumber++) {
        const dayDate = new Date(normalizedStart) // Utiliser la date normalisée
        dayDate.setDate(dayDate.getDate() + (dayNumber - 1)) // dayNumber-1 parce que day 1 = start + 0 jours
        
        // Vérifier s'il y avait des activités pour ce jour dans l'ancien itinéraire
        const existingDay = prev.find(d => d.day === dayNumber)
        const activities = existingDay ? existingDay.activities : []
        
        newItinerary.push({
          day: dayNumber,
          date: dayDate.toLocaleDateString('fr-FR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
          }),
          activities: activities
        })
        
        console.log(`📅 Created day ${dayNumber} with date ${dayDate.toLocaleDateString('fr-FR')} and ${activities.length} activities`)
      }
      
      // Si on a supprimé des jours, remettre les activités dans les activités disponibles
      if (prev.length > newDaysCount) {
        const removedActivities = prev.slice(newDaysCount).flatMap(day => day.activities)
        console.log(`🔄 ${removedActivities.length} activities from removed days will be available again`)
        
        removedActivities.forEach(activity => {
          const alreadyAvailable = selectedActivities.some(a => a.id === activity.id)
          if (!alreadyAvailable) {
            setSelectedActivities(prevSelected => [...prevSelected, activity])
          }
        })
      }
      
      console.log('✅ Rebuilt itinerary:', newItinerary.map(d => `Day ${d.day}: ${d.date}`))
      return newItinerary
    })
  }

  const updateItineraryIfNeeded = () => {
    if (itinerary.length > 0 && travelInfo.startDate && travelInfo.endDate) {
      // Vérifier si les dates ont changé en comparant les dates réelles
      // Normaliser les dates pour un calcul cohérent
      const normalizedStart = new Date(travelInfo.startDate.getFullYear(), travelInfo.startDate.getMonth(), travelInfo.startDate.getDate())
      const normalizedEnd = new Date(travelInfo.endDate.getFullYear(), travelInfo.endDate.getMonth(), travelInfo.endDate.getDate())
      const currentDaysCount = Math.round((normalizedEnd.getTime() - normalizedStart.getTime()) / (1000 * 60 * 60 * 24)) + 1
      
      // Vérifier si le nombre de jours a changé
      const daysCountChanged = currentDaysCount !== itinerary.length
      
      // Vérifier si les dates ont changé (en comparant la première date)
      const firstDayDate = new Date(travelInfo.startDate)
      const expectedFirstDate = firstDayDate.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      })
      const dateChanged = itinerary.length > 0 && itinerary[0].date !== expectedFirstDate
      
      console.log('🔍 updateItineraryIfNeeded check:')
      console.log('📅 Current start date:', travelInfo.startDate.toLocaleDateString('fr-FR'))
      console.log('📅 Expected first date:', expectedFirstDate)
      console.log('📅 Actual first date in itinerary:', itinerary[0]?.date)
      console.log('📅 Days count changed:', daysCountChanged)
      console.log('📅 Date changed:', dateChanged)
      
      if (daysCountChanged || dateChanged) {
        console.log('🔄 Updating itinerary for new dates')
        updateItineraryForNewDates(travelInfo.startDate, travelInfo.endDate)
      }
    }
  }

  const handleGoToItinerary = () => {
    updateItineraryIfNeeded()
    setStep('itinerary')
  }

  const handleGoToActivities = () => {
    updateItineraryIfNeeded()
    setStep('activities')
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Culture': 'bg-purple-100 text-purple-800',
      'Gastronomie': 'bg-orange-100 text-orange-800',
      'Nature': 'bg-green-100 text-green-800',
      'Shopping': 'bg-pink-100 text-pink-800',
      'Loisirs': 'bg-blue-100 text-blue-800',
      'Histoire': 'bg-amber-100 text-amber-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  if (step === 'travel-info') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto pt-16">
          <Card className="shadow-xl">
            <CardHeader className="text-center pb-8">
              <div className="flex justify-center mb-4">
              <img 
                src="/logo.png" 
                alt="GoVisitCity" 
                className="h-16 rounded-lg"
                style={{ width: 'auto' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = document.getElementById('logo-fallback');
                  if (fallback) fallback.style.display = 'block';
                }}
              />
              <div id="logo-fallback" style={{ display: 'none' }}>
                <Map className="w-16 h-16 text-blue-600" />
              </div>
            </div>
            <CardDescription className="text-lg mt-2">
              Découvrez les meilleures activités et expériences dans votre ville
            </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <TravelForm
                value={travelInfo}
                onChange={setTravelInfo}
              />

              <div className={itinerary.length > 0 ? "space-y-3" : "flex gap-3"}>
                {itinerary.length === 0 ? (
                  <Button 
                    onClick={handleTravelInfoSubmit}
                    disabled={isLoading || !travelInfo.city.trim() || !travelInfo.startDate || !travelInfo.endDate}
                    className="flex-1"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Génération en cours...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Générer des activités
                      </>
                    )}
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={handleGoToActivities}
                      disabled={!travelInfo.city.trim() || !travelInfo.startDate || !travelInfo.endDate}
                      className="w-full"
                      size="lg"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Aller aux activités
                    </Button>
                    
                    <Button 
                      onClick={handleGoToItinerary}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      size="lg"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Aller aux itinéraires
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (step === 'activities') {
    const unselectedActivities = suggestedActivities.filter(activity => 
      !selectedActivities.find(a => a.id === activity.id)
    )
    
    console.log('Rendering activities step - Total suggested:', suggestedActivities.length)
    console.log('Rendering activities step - Selected:', selectedActivities.length)
    console.log('Rendering activities step - Unselected to display:', unselectedActivities.length)

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 pb-32">
        <div className="max-w-7xl mx-auto pt-8">
          <div className="mb-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-yellow-500" />
                      Activités pour {travelInfo.city}
                    </CardTitle>
                    <CardDescription>
                      {travelInfo.startDate?.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })} au {travelInfo.endDate?.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })} • {travelInfo.participants} personne(s) • {travelInfo.budget}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => setStep('travel-info')}
                    >
                      Modifier le plan du voyage
                    </Button>
                    {itinerary.length > 0 && (
                      <Button 
                        variant="outline"
                        onClick={handleGoToItinerary}
                      >
                        Voir les itinéraires
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Debug info */}
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="pt-4">
              <div className="text-sm space-y-1">
                <p>🔍 <strong>Debug Info:</strong></p>
                <p>• Total activités suggérées: {suggestedActivities.length}</p>
                <p>• Activités sélectionnées: {selectedActivities.length}</p>
                <p>• Activités non sélectionnées: {suggestedActivities.filter(activity => !selectedActivities.find(a => a.id === activity.id)).length}</p>
                <p>• Ville: {travelInfo.city}</p>
                <p>• Thème input: "{themeInput}"</p>
              </div>
            </CardContent>
          </Card>

          {/* Section pour demander plus d'activités */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-purple-600" />
                Demander plus d'activités
              </CardTitle>
              <CardDescription>
                Précisez un thème pour obtenir des suggestions personnalisées
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Ex: Romantique, Aventure, Culturel, Gastronomique..."
                  value={themeInput}
                  onChange={(e) => setThemeInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleMoreActivities()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleMoreActivities}
                  disabled={!themeInput.trim() || isGeneratingMore}
                  variant="outline"
                >
                  {isGeneratingMore ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularThemes.map((theme) => (
                  <Badge
                    key={theme}
                    variant="secondary"
                    className="cursor-pointer hover:bg-purple-100"
                    onClick={() => {
                      setThemeInput(theme)
                      setTimeout(handleMoreActivities, 100)
                    }}
                  >
                    {theme}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          
          {newActivitiesCount > 0 && (
            <Card className="mb-6 border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-green-700">
                  <Check className="w-5 h-5" />
                  <span>{newActivitiesCount} nouvelle{newActivitiesCount > 1 ? 's' : ''} activité{newActivitiesCount > 1 ? 's' : ''} ajoutée{newActivitiesCount > 1 ? 's' : ''} !</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activités non sélectionnées */}
          {unselectedActivities.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Suggestions d'activités</h3>
                <Badge variant="outline" className="text-sm">
                  {unselectedActivities.length} disponible{unselectedActivities.length > 1 ? 's' : ''}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unselectedActivities.map((activity) => {
                  const isSelected = selectedActivities.find(a => a.id === activity.id)
                  const isNewlyAdded = (activity as any).isNewlyAdded || (activity as any).testAdded
                  return (
                    <Card 
                      key={activity.id}
                      className={`cursor-pointer transition-all hover:shadow-lg relative ${
                        isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                      } ${
                        isNewlyAdded ? 'ring-2 ring-green-400 bg-green-50' : ''
                      }`}
                    >
                      {isNewlyAdded && (
                        <div className="absolute top-2 left-2 z-10">
                          <Badge className="bg-green-500 text-white text-xs px-2 py-1">
                            Nouveau
                          </Badge>
                        </div>
                      )}
                      <div className="relative" onClick={() => toggleActivitySelection(activity)}>
                        {activity.image ? (
                          <img 
                            src={activity.image} 
                            alt={activity.name}
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                            <ImageIcon className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2 z-10">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="w-6 h-6 p-0 rounded-full shadow-lg bg-white/80 hover:bg-white text-gray-600"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSuggestedActivities(prev => prev.filter(a => a.id !== activity.id))
                              setSelectedActivities(prev => prev.filter(a => a.id !== activity.id))
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{activity.name}</CardTitle>
                          <Badge 
                            className={`mt-1 ${getCategoryColor(activity.category)}`}
                            variant="secondary"
                          >
                            {activity.category}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm text-gray-600">{activity.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3 text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {activity.duration}
                            </div>
                            {activity.price && (
                              <div className="flex items-center gap-1 text-green-600 font-medium">
                                <DollarSign className="w-4 h-4" />
                                <span>{activity.price}</span>
                              </div>
                            )}
                          </div>
                          {activity.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span>{activity.rating}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Menu déroulant des sélections - fixé en bas */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
          <div className="max-w-7xl mx-auto p-4">
            <div 
              className="flex items-center justify-between mb-3 cursor-pointer"
              onClick={() => setShowSelections(!showSelections)}
            >
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 hover:bg-green-100"
                >
                  {showSelections ? <ChevronDown className="w-4 h-4 text-green-600" /> : <ChevronUp className="w-4 h-4 text-green-600" />}
                </Button>
                <h3 className="font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Activités sélectionnées ({selectedActivities.length})
                </h3>
                {selectedActivities.length > 0 && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {selectedActivities.reduce((total, activity) => {
                      // Extract duration if it contains numbers
                      const durationMatch = activity.duration.match(/(\d+)/)
                      const hours = durationMatch ? parseInt(durationMatch[1]) : 2
                      return total + hours
                    }, 0)}h total
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {itinerary.length > 0 && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleGoToItinerary()
                    }}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                  >
                    Aller aux itinéraires
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
                <Button 
                  onClick={(e) => {
                    e.stopPropagation()
                    generateItinerary()
                  }}
                  disabled={selectedActivities.length === 0 || isLoading}
                  className="px-6 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      {itinerary.length > 0 ? "Régénérer les itinéraires" : "Générer les itinéraires"}
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {showSelections && (
              <div className="animate-in slide-in-from-bottom-2 duration-200">
                <div className="border rounded-lg bg-gray-50 max-h-96 overflow-hidden">
                  <div className="overflow-y-auto max-h-96">
                    <div className="p-3 space-y-2">
                      {selectedActivities.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Check className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p>Aucune activité sélectionnée</p>
                          <p className="text-sm">Cliquez sur les activités ci-dessus pour les ajouter</p>
                        </div>
                      ) : (
                        selectedActivities.map((activity) => (
                          <div 
                            key={activity.id}
                            className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200 hover:shadow-sm transition-shadow"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              {activity.image ? (
                                <img 
                                  src={activity.image} 
                                  alt={activity.name}
                                  className="w-14 h-14 object-cover rounded-lg"
                                />
                              ) : (
                                <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <ImageIcon className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 truncate">{activity.name}</h4>
                                <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
                                  <Badge 
                                    className={`text-xs ${getCategoryColor(activity.category)}`}
                                    variant="secondary"
                                  >
                                    {activity.category}
                                  </Badge>
                                  <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {activity.duration}
                                    </span>
                                    {activity.price && (
                                      <span className="text-green-600 font-medium flex items-center gap-1">
                                        <DollarSign className="w-3 h-3" />
                                        {activity.price}
                                      </span>
                                    )}
                                  </div>
                                  {activity.rating && (
                                    <span className="flex items-center gap-1">
                                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                      {activity.rating}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleActivitySelection(activity)
                              }}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (step === 'itinerary') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto pt-8">
          <div className="mb-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      Votre itinéraire pour {travelInfo.city}
                    </CardTitle>
                    <CardDescription>
                      {travelInfo.startDate?.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })} au {travelInfo.endDate?.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })} • {travelInfo.participants} personne(s) • {travelInfo.budget}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => setStep('travel-info')}
                    >
                      Modifier le plan du voyage
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setStep('activities')}
                      className="flex items-center gap-2"
                    >
                      <Search className="w-4 h-4" />
                      Rechercher d'autres activités
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Activités non planifiées - DÉPLACÉES EN HAUT */}
            {selectedActivities.filter(activity => 
              !itinerary.some(day => 
                day.activities.some(a => a.id === activity.id)
              )
            ).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Plus className="w-5 h-5 text-orange-500" />
                    Activités disponibles à planifier
                  </CardTitle>
                  <CardDescription>
                    Glissez ces activités dans les jours ci-dessous ou utilisez les menus déroulants
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 min-h-24 max-h-96 overflow-y-auto">
                    {selectedActivities
                        .filter(activity => 
                          !itinerary.some(day => 
                            day.activities.some(a => a.id === activity.id)
                          )
                        )
                        .map((activity) => (
                          <div 
                            key={activity.id}
                            className="group flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-move"
                            draggable
                            onDragStart={() => handleDragStart(activity, null)}
                          >
                            <div className="flex items-center gap-3">
                              <GripVertical className="w-4 h-4 text-gray-400" />
                              {activity.image ? (
                                <img 
                                  src={activity.image} 
                                  alt={activity.name}
                                  className="w-10 h-10 object-cover rounded"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                                  <ImageIcon className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                              <div className="flex-1">
                                <span className="text-sm font-medium">{activity.name}</span>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge 
                                    className={`text-xs ${getCategoryColor(activity.category)}`}
                                    variant="secondary"
                                  >
                                    {activity.category}
                                  </Badge>
                                  {activity.price && (
                                    <span className="text-xs text-green-600">{activity.price}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedActivities(prev => prev.filter(a => a.id !== activity.id))
                              }}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-100 md:group-hover:opacity-100"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))
                      }
                    </div>
                </CardContent>
              </Card>
            )}

            {itinerary.map((day, dayIndex) => (
              <Card key={day.day}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {day.day}
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Jour {day.day} - {day.date}</span>
                        {day._aiOptimized && (
                          <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            <Brain className="w-3 h-3" />
                            <span>IA</span>
                          </div>
                        )}
                      </div>
                    </CardTitle>
                    {day._aiOptimized && (
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{day._totalTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{day._area}</span>
                        </div>
                        {day._walkingTime && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>{day._walkingTime}</span>
                          </div>
                        )}
                      </div>
                    )}
                    <Select 
                      key={`select-day-${dayIndex}-${day.activities.length}`}
                      onValueChange={(activityId) => {
                        const activity = selectedActivities.find(a => a.id === activityId)
                        if (activity) {
                          addToItinerary(dayIndex, activity)
                        }
                      }}
                    >
                      <SelectTrigger className="w-48" disabled={
                        selectedActivities.filter(activity => {
                          const isAlreadyUsed = itinerary.some(day => 
                            day.activities.some(a => a.id === activity.id)
                          )
                          return !isAlreadyUsed
                        }).length === 0
                      }>
                        <SelectValue placeholder="Ajouter une activité" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedActivities
                          .filter(activity => {
                            // Vérifier si l'activité est déjà utilisée dans N'IMPORTE QUEL jour de l'itinéraire
                            const isAlreadyUsed = itinerary.some(day => 
                              day.activities.some(a => a.id === activity.id)
                            )
                            return !isAlreadyUsed
                          })
                          .map((activity) => (
                            <SelectItem key={activity.id} value={activity.id}>
                              {activity.name}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  {day.activities.length === 0 ? (
                    <div 
                      className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, dayIndex)}
                    >
                      <p className="text-gray-500 mb-2">
                        Aucune activité prévue pour ce jour
                      </p>
                      <p className="text-sm text-gray-400">
                        Glissez des activités ici ou utilisez le menu déroulant
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {day.activities.map((activity, activityIndex) => (
                        <div 
                          key={activity.id} 
                          className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100 transition-colors"
                          draggable
                          onDragStart={() => handleDragStart(activity, dayIndex)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, dayIndex, activityIndex)}
                        >
                          <GripVertical className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                          {activity.image ? (
                            <img 
                              src={activity.image} 
                              alt={activity.name}
                              className="w-16 h-16 object-cover rounded flex-shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                            {activityIndex + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium">{activity.name}</h4>
                                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                                <div className="flex items-center gap-3 mt-2">
                                  <Badge 
                                    className={`text-xs ${getCategoryColor(activity.category)}`}
                                    variant="secondary"
                                  >
                                    {activity.category}
                                  </Badge>
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Clock className="w-3 h-3" />
                                    {activity.duration}
                                  </div>
                                  {activity.price && (
                                    <span className="text-xs font-medium text-green-600">{activity.price}</span>
                                  )}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFromItinerary(dayIndex, activity.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return null
}