import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  console.log('🏢 API suggest-activities called!')
  
  try {
    const { city, budget, participants } = await request.json()
    console.log('🏢 Request data:', { city, budget, participants })

    if (!city || typeof city !== 'string') {
      console.log('❌ Invalid city:', city)
      return NextResponse.json(
        { error: 'City name is required' },
        { status: 400 }
      )
    }

    console.log('📊 Searching for activities in', city)
    
    // Test database connection first
    try {
      await db.$connect()
      console.log('✅ Database connected successfully')
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError)
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 500 }
      )
    }
    
    // Get activities from database first
    let activities = await db.activity.findMany({
      where: {
        city: city,
        isActive: true
      },
      orderBy: [
        { isPopular: 'desc' },
        { rating: 'desc' }
      ],
      take: 8
    })

    console.log(`📊 Found ${activities.length} activities in database for ${city}`)

    // If no activities in database, get popular activities from any city
    if (activities.length === 0) {
      console.log('🔍 No activities in database, getting popular activities...')
      activities = await db.activity.findMany({
        where: {
          isActive: true
        },
        orderBy: [
          { isPopular: 'desc' },
          { rating: 'desc' }
        ],
        take: 8
      })
    }

    // If still not enough activities, get more from database
    if (activities.length < 6) {
      const moreActivities = await db.activity.findMany({
        where: {
          isActive: true,
          id: {
            notIn: activities.map(a => a.id)
          }
        },
        orderBy: [
          { isPopular: 'desc' },
          { rating: 'desc' }
        ],
        take: 8 - activities.length
      })
      activities = [...activities, ...moreActivities]
    }

    // If still no activities, use AI to generate some
    if (activities.length === 0) {
      console.log('🤖 No activities in database, using AI to generate activities...')
      
      try {
        const zai = await ZAI.create()
        
        const prompt = `Génère 8 activités touristiques authentiques pour la ville de ${city}. 

IMPORTANT: Génère des activités variées et réalistes qui existent vraiment ou pourraient exister à ${city}.

Format de réponse exact:
[
  {
    "name": "Nom de l'activité",
    "description": "Description détaillée et attrayante",
    "category": "Culture|Gastronomie|Nature|Aventure|Romantique|Shopping|Nocturne",
    "duration": "1-2h|2-3h|3-4h|4-5h|Journée",
    "rating": 4.5,
    "price": "Gratuit|€|€€|€€€|€€€€",
    "theme": "Culturel|Gastronomique|Nature|Aventure|Romantique|Shopping|Nocturne",
    "isPopular": true
  }
]

Variété nécessaire:
- Au moins 2 activités culturelles (musées, monuments, visites)
- Au moins 2 activités gastronomiques (restaurants, marchés, dégustations)
- Au moins 1 activité nature (parcs, jardins, promenades)
- Au moins 1 activité romantique ou nocturne
- Les autres peuvent être shopping, aventure, etc.`

        const completion = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'Tu es un expert local du tourisme et génères des activités authentiques et variées pour les villes. Tes activités doivent être réalistes et attrayantes.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 3000
        })

        const aiResponse = completion.choices[0]?.message?.content
        if (aiResponse) {
          try {
            const aiActivities = JSON.parse(aiResponse)
            console.log(`✅ AI generated ${aiActivities.length} activities for ${city}`)
            
            // Transform to match expected format
            activities = aiActivities.map((activity: any, index: number) => ({
              id: `ai_${Date.now()}_${index}`,
              name: activity.name,
              description: activity.description,
              category: activity.category,
              duration: activity.duration,
              rating: activity.rating || 4.0,
              price: activity.price || "€€",
              theme: activity.theme,
              isPopular: activity.isPopular || false,
              isActive: true
            }))
          } catch (parseError) {
            console.error('❌ Error parsing AI response:', parseError)
          }
        }
      } catch (aiError) {
        console.error('❌ Error calling AI:', aiError)
      }
    }

    console.log(`✅ Returning ${activities.length} activities`)

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

    console.log('✅ Returning activities:', formattedActivities.length)
    return NextResponse.json({ activities: formattedActivities })

  } catch (error) {
    console.error('💥 ERROR in suggest-activities API:', error)
    console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('💥 Error message:', error instanceof Error ? error.message : 'Unknown error')
    
    // Ensure database connection is closed on error
    try {
      await db.$disconnect()
    } catch (disconnectError) {
      console.error('❌ Error disconnecting from database:', disconnectError)
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  } finally {
    // Always try to disconnect
    try {
      await db.$disconnect()
    } catch (e) {
      // Ignore disconnect errors
    }
  }
}