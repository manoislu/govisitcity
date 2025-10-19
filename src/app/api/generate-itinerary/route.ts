import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    console.log('📅 API generate-itinerary called!')
    
    const { city, activities, days, startDate, endDate, participants, budget } = await request.json()
    console.log('📅 Request data:', { city, activities: activities?.length, days, startDate, endDate, participants, budget })

    if (!city || !activities || activities.length === 0 || !days || !startDate) {
      console.log('❌ Missing required data')
      return NextResponse.json(
        { error: 'Missing required data: city, activities, days, startDate' },
        { status: 400 }
      )
    }

    console.log('🤖 Generating itinerary for', days, 'days in', city)
    
    try {
      const zai = await ZAI.create()
      
      const activitiesList = activities.map((a: any) => `- ${a.name} (${a.category}, ${a.duration})`).join('\n')
      
      const prompt = `Génère un itinéraire de ${days} jours pour ${city} du ${startDate} au ${endDate}.

Informations:
- Participants: ${participants || 2} personnes
- Budget: ${budget || 'non spécifié'}
- Activités disponibles:
${activitiesList}

RÈGLES IMPORTANTES:
- Répartis les activités sur les ${days} jours de manière logique
- Regroupe les activités par zone géographique quand possible
- Prévois des temps de déplacement réalistes
- Chaque jour doit avoir entre 2 et 4 activités maximum
- Inclut des temps de pause et de repas
- Sois réaliste sur les durées et les horaires

Pour chaque jour, fournis:
- day: numéro du jour (1, 2, 3...)
- date: date au format JJ/MM/AAAA
- activities: liste des activités pour ce jour avec leur ordre
- _totalTime: temps total estimé pour la journée
- _walkingTime: temps de marche estimé
- _area: zone géographique principale de la journée

Réponds uniquement au format JSON avec cette structure:
{
  "itinerary": [
    {
      "day": 1,
      "date": "JJ/MM/AAAA",
      "activities": [
        {
          "id": "id_activité",
          "name": "nom de l'activité",
          "description": "description",
          "category": "catégorie",
          "duration": "durée",
          "rating": note,
          "price": "prix",
          "image": "image"
        }
      ],
      "_totalTime": "Xh",
      "_walkingTime": "Xmin",
      "_area": "zone"
    }
  ]
}`

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en organisation de voyages qui crée des itinéraires réalistes et optimisés. Tu réponds uniquement en JSON valide.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 2500
      })

      const aiResponse = completion.choices[0]?.message?.content
      console.log('🤖 AI Response received:', aiResponse?.substring(0, 200) + '...')

      if (aiResponse) {
        try {
          let cleanResponse = aiResponse.trim()
          
          if (cleanResponse.includes('```json')) {
            cleanResponse = cleanResponse.replace(/```json\s*/, '').replace(/```\s*$/, '')
          } else if (cleanResponse.includes('```')) {
            cleanResponse = cleanResponse.replace(/```\s*/, '').replace(/```\s*$/, '')
          }
          
          const aiData = JSON.parse(cleanResponse)
          if (aiData.itinerary && Array.isArray(aiData.itinerary)) {
            console.log(`✅ AI generated itinerary for ${aiData.itinerary.length} days`)
            
            // Make sure activities have all required fields
            const formattedItinerary = aiData.itinerary.map((day: any, dayIndex: number) => ({
              day: day.day || dayIndex + 1,
              date: day.date || startDate,
              activities: day.activities.map((activity: any, actIndex: number) => {
                const originalActivity = activities.find((a: any) => a.name === activity.name)
                return {
                  id: originalActivity?.id || `itinerary_${Date.now()}_${dayIndex}_${actIndex}`,
                  name: activity.name,
                  description: originalActivity?.description || activity.description,
                  category: originalActivity?.category || activity.category,
                  duration: originalActivity?.duration || activity.duration,
                  rating: originalActivity?.rating || activity.rating,
                  price: originalActivity?.price || activity.price,
                  image: originalActivity?.image || activity.image
                }
              }),
              _totalTime: day._totalTime || "4h",
              _walkingTime: day._walkingTime || "30min",
              _area: day._area || city
            }))

            console.log('🎉 Returning itinerary:', formattedItinerary.length, 'days')
            return NextResponse.json({ itinerary: formattedItinerary })
          }
        } catch (parseError) {
          console.error('❌ Failed to parse AI response:', parseError)
        }
      }
    } catch (aiError) {
      console.error('❌ AI generation failed:', aiError)
    }

    // Fallback: simple distribution
    console.log('🔄 Using fallback itinerary generation')
    const activitiesPerDay = Math.ceil(activities.length / days)
    const fallbackItinerary = []
    
    for (let day = 1; day <= days; day++) {
      const startIndex = (day - 1) * activitiesPerDay
      const endIndex = Math.min(startIndex + activitiesPerDay, activities.length)
      const dayActivities = activities.slice(startIndex, endIndex)
      
      if (dayActivities.length > 0) {
        fallbackItinerary.push({
          day: day,
          date: startDate,
          activities: dayActivities,
          _totalTime: `${dayActivities.length * 2}h`,
          _walkingTime: "20min",
          _area: city
        })
      }
    }

    return NextResponse.json({ itinerary: fallbackItinerary })

  } catch (error) {
    console.error('💥 ERROR in generate-itinerary API:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}