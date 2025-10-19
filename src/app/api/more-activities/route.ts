import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    console.log('🏢 API more-activities called!')
    
    const { city, theme, existingActivities, budget, participants } = await request.json()
    console.log('🏢 Request data:', { city, theme, existingActivitiesCount: existingActivities?.length })

    if (!city || !theme) {
      console.log('❌ Missing required fields')
      return NextResponse.json(
        { error: 'City and theme are required' },
        { status: 400 }
      )
    }

    const existingIds = new Set(existingActivities?.map((a: any) => a.id) || [])
    
    // Find ONLY activities that match the theme in database
    let activities = await db.activity.findMany({
      where: {
        city: city,
        theme: theme,
        isActive: true,
        id: {
          notIn: Array.from(existingIds)
        }
      },
      orderBy: [
        { isPopular: 'desc' },
        { rating: 'desc' }
      ],
      take: 6
    })

    console.log(`📊 Found ${activities.length} themed activities in database for ${city}/${theme}`)

    // Si aucune activité trouvée dans la base de données, utiliser l'IA
    if (activities.length === 0) {
      console.log(`❌ No themed activities found in database, using AI for ${theme} activities in ${city}`)
      
      try {
        const zai = await ZAI.create()
        
        const prompt = `Génère 4 activités authentiquement ${theme} pour la ville de ${city}. 

CONTRAINTE STRICTE: Toutes les activités doivent OBLIGATOIREMENT être de thème ${theme}.

Exemples pour le thème gastronomique:
- Restaurant traditionnel spécialisé dans la cuisine locale
- Dégustation de vins ou produits locaux
- Cours de cuisine traditionnelle
- Marché gastronomique local
- Tour des spécialités culinaires

Exemples pour le thème nocturne:
- Bar ou club avec ambiance locale
- Tour nocturne des monuments illuminés
- Spectacle ou concert nocturne
- Bar dansant ou pub traditionnel
- Observatoire ou visite nocturne

Format de réponse exact:
[
  {
    "name": "Nom de l'activité",
    "description": "Description détaillée",
    "category": "${theme}",
    "duration": "2-3 heures",
    "rating": 4.5,
    "price": "€€",
    "theme": "${theme}"
  }
]`

        const completion = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'Tu es un expert local du tourisme et génères UNIQUEMENT des activités correspondant exactement au thème demandé. Pas de mélange de thèmes.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })

        const aiResponse = completion.choices[0]?.message?.content
        if (aiResponse) {
          try {
            const aiActivities = JSON.parse(aiResponse)
            console.log(`✅ AI generated ${aiActivities.length} ${theme} activities`)
            
            // Vérifier que les activités générées correspondent bien au thème
            const validActivities = aiActivities.filter((activity: any) => 
              activity.category === theme || activity.theme === theme
            )
            
            if (validActivities.length > 0) {
              const formattedActivities = validActivities.map((activity: any, index: number) => ({
                id: `ai_${Date.now()}_${index}`,
                name: activity.name,
                description: activity.description,
                category: activity.category || theme,
                duration: activity.duration || "2-3 heures",
                rating: activity.rating || 4.0,
                price: activity.price || "€€",
                theme: theme,
                isPopular: false
              }))
              
              return NextResponse.json({ activities: formattedActivities })
            }
          } catch (parseError) {
            console.error('❌ Error parsing AI response:', parseError)
          }
        }
      } catch (aiError) {
        console.error('❌ Error calling AI:', aiError)
      }
    }

    console.log(`✅ Total activities found: ${activities.length}`)

    if (activities.length === 0) {
      console.log('❌ No activities found for this theme')
      return NextResponse.json(
        { error: `Aucune activité ${theme} trouvée à ${city}. Essayez un autre thème comme "Culturel", "Gastronomique" ou "Aventure".` },
        { status: 404 }
      )
    }

    // Transform to match expected format
    const formattedActivities = activities.map(activity => ({
      id: activity.id,
      name: activity.name,
      description: activity.description,
      category: activity.category,
      duration: activity.duration,
      rating: activity.rating,
      price: activity.price,
      image: activity.image,
      theme: activity.theme,
      isPopular: activity.isPopular
    }))

    console.log('🎉 Returning activities:', formattedActivities.length)
    return NextResponse.json({ activities: formattedActivities })

  } catch (error) {
    console.error('💥 ERROR in more-activities API:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}