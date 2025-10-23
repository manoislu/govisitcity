import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { travelInfo, selectedActivities } = await request.json()
    
    // Extract data from travelInfo object
    const city = travelInfo.city
    const startDate = travelInfo.startDate
    const endDate = travelInfo.endDate
    const participants = travelInfo.participants || 2
    const budget = travelInfo.budget || ''
    const activities = selectedActivities
    
    // Calculate number of days
    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1

    if (!city || !activities || !Array.isArray(activities) || activities.length === 0) {
      return NextResponse.json(
        { error: 'City, activities array, and valid date range are required' },
        { status: 400 }
      )
    }

    console.log('🧠 Using AI-powered smart itinerary generation...')
    
    // DEBUG: Log API date processing
    console.log('🔍 API DATE DEBUG:')
    console.log('📅 Received startDate:', startDate)
    console.log('📅 Received endDate:', endDate)
    console.log('📊 Calculated days:', days)
    console.log('📊 Total activities:', activities.length)
    
    try {
      // UTILISER L'IA POUR L'OPTIMISATION INTELLIGENTE
      const zai = await ZAI.create()
      
      const prompt = `En tant qu'expert en planification de voyages, crée un itinéraire optimisé pour ${days} jours à ${city}.

ACTIVITÉS À PLANIFIER :
${activities.map((a: any, i: number) => `${i+1}. ${a.name} (${a.category} - ${a.duration})`).join('\n')}

CONTRAINTES IMPORTANTES :
1. TEMPS : Chaque journée = 8-10h d'activités max
2. PROXIMITÉ : Regrouper les activités par quartier
3. RYTHME : Matin = culture, Après-midi = dynamique, Soir = gastronomie
4. ÉQUILIBRE : Répartir sur tous les jours

FORMAT JSON EXIGÉ :
{
  "itinerary": [
    {
      "day": 1,
      "activities": [
        {"id": "id1", "name": "Nom activité", "timeSlot": "09:00-11:00"},
        {"id": "id2", "name": "Nom activité", "timeSlot": "11:30-13:00"}
      ]
    }
  ]
}

Règles : Toutes les activités utilisées, format JSON strict.`

      // AJOUTER UN TIMEOUT DE 10 SECONDES
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('AI timeout after 10 seconds')), 10000)
      })

      const aiPromise = zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en planification. Réponds UNIQUEMENT en JSON valide.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      })

      const completion = await Promise.race([aiPromise, timeoutPromise])
      const aiResponse = completion.choices[0]?.message?.content
      console.log('🤖 AI Response received:', aiResponse?.substring(0, 200) + '...')

      if (!aiResponse) {
        throw new Error('No response from AI')
      }

      // Parser la réponse IA
      let aiItinerary
      try {
        aiItinerary = JSON.parse(aiResponse)
      } catch (parseError) {
        console.error('❌ Failed to parse AI response:', parseError)
        throw new Error('Invalid AI response format')
      }

      // Valider et formater la réponse IA
      if (!aiItinerary.itinerary || !Array.isArray(aiItinerary.itinerary)) {
        throw new Error('Invalid AI itinerary structure')
      }

      // S'assurer que les dates sont correctes
      const smartItinerary = []
      for (let day = 1; day <= days; day++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + day - 1)
        const formattedDate = date.toLocaleDateString('fr-FR', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric'
        })

        // Trouver le jour correspondant dans la réponse IA
        const aiDay = aiItinerary.itinerary.find((d: any) => d.day === day)
        
        if (aiDay && aiDay.activities) {
          // Convertir les activités IA en notre format
          const dayActivities = aiDay.activities.map((aiActivity: any) => {
            const originalActivity = activities.find((a: any) => 
              a.name === aiActivity.name || a.id === aiActivity.id
            )
            return originalActivity || {
              ...aiActivity,
              id: aiActivity.id || `ai_${day}_${Math.random()}`,
              description: `Activité optimisée par l'IA`,
              category: 'Optimisé',
              duration: '2h',
              rating: 5
            }
          })

          smartItinerary.push({
            day,
            date: formattedDate,
            activities: dayActivities,
            _aiOptimized: true,
            _totalTime: `${dayActivities.length * 2}h`,
            _area: 'Optimisé par IA'
          })
        } else {
          // Jour manquant dans la réponse IA - créer un jour vide
          smartItinerary.push({
            day,
            date: formattedDate,
            activities: [],
            _aiOptimized: true
          })
        }
      }

      console.log('🤖 AI OPTIMIZED ITINERARY:', smartItinerary.map(d => 
        `Day ${d.day}: ${d.date} (${d.activities.length} activités)`
      ))

      return NextResponse.json({ itinerary: smartItinerary })

    } catch (aiError) {
      console.error('❌ AI optimization failed, using balanced algorithm:', aiError.message)
      
      // FALLBACK IMMÉDIAT : Utiliser l'algorithme équilibré
      const quotient = Math.floor(activities.length / days)
      const reste = activities.length % days
      
      console.log(`🔄 FALLBACK: Distribution équilibrée - ${quotient} activités/jour + ${reste} jours avec +1`)
      
      const smartItinerary = []
      let activityIndex = 0
      
      for (let day = 1; day <= days; day++) {
        const activitiesForThisDay = quotient + (day <= reste ? 1 : 0)
        const dayActivities = []
        
        for (let i = 0; i < activitiesForThisDay && activityIndex < activities.length; i++) {
          dayActivities.push(activities[activityIndex])
          activityIndex++
        }
        
        const date = new Date(startDate)
        date.setDate(date.getDate() + day - 1)
        const formattedDate = date.toLocaleDateString('fr-FR', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric'
        })
        
        smartItinerary.push({
          day,
          date: formattedDate,
          activities: dayActivities,
          _aiOptimized: false
        })
      }

      console.log('✅ FALLBACK ITINERARY:', smartItinerary.map(d => 
        `Day ${d.day}: ${d.date} (${d.activities.length} activités)`
      ))

      return NextResponse.json({ itinerary: smartItinerary })
    }

  } catch (error) {
    console.error('💥 CRITICAL ERROR in generate-itinerary API:', error)
    
    // DERNIER RECOURS : Distribution simple
    const fallbackItinerary = []
    const activitiesPerDay = Math.max(1, Math.ceil(activities.length / days))
    
    for (let day = 1; day <= days; day++) {
      const startIndex = (day - 1) * activitiesPerDay
      const endIndex = Math.min(startIndex + activitiesPerDay, activities.length)
      const dayActivities = activities.slice(startIndex, endIndex)
      
      const date = new Date(startDate)
      date.setDate(date.getDate() + day - 1)
      const formattedDate = date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric'
      })
      
      fallbackItinerary.push({
        day,
        date: formattedDate,
        activities: dayActivities,
        _aiOptimized: false
      })
    }

    return NextResponse.json({ itinerary: fallbackItinerary })
  }
}