import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    console.log('🏢 API suggest-activities called!')
    
    const { city, budget, participants } = await request.json()
    console.log('🏢 Request data:', { city, budget, participants })

    if (!city || typeof city !== 'string') {
      console.log('❌ Invalid city:', city)
      return NextResponse.json(
        { error: 'City name is required' },
        { status: 400 }
      )
    }

    console.log('📊 First, checking database for activities in', city)
    
    // First try exact match in database
    let activities = await db.activity.findMany({
      where: {
        city: city,
        isActive: true
      },
      orderBy: [
        { isPopular: 'desc' },
        { rating: 'desc' }
      ],
      take: 8 // Limit to 8 activities
    })

    console.log(`📊 Found ${activities.length} activities in database for ${city}`)

    // If no activities in database, use AI to generate some
    if (activities.length === 0) {
      console.log('🤖 No activities in database, calling AI to generate...')
      
      try {
        const zai = await ZAI.create()
        
        const prompt = `Génère 8 activités touristiques EXCLUSIVEMENT pour la ville de ${city}. 
ATTENTION: Toutes les activités doivent être spécifiquement situées à ${city} ou dans ses environs immédiats.

Budget: ${budget || 'non spécifié'}
Participants: ${participants || 2} personnes

RÈGLES IMPORTANTES:
- Chaque nom d'activité doit mentionner ${city} ou un lieu spécifique de ${city}
- Chaque description doit clairement indiquer que l'activité se déroule à ${city}
- Ne génère JAMAIS d'activités génériques qui pourraient être dans n'importe quelle ville
- Sois précis sur les lieux, quartiers, monuments ou rues de ${city}

Pour chaque activité, fournis:
- name: nom de l'activité (doit inclure ${city} ou un lieu spécifique)
- description: description détaillée (1-2 phrases, doit mentionner ${city})
- category: Culture, Gastronomie, Nature, Shopping, Aventure, Romantique, Nocturne
- duration: durée approximative (ex: "2h", "3h30")
- rating: note sur 5 (ex: 4.2, 3.8)
- price: niveau de prix (Gratuit, €, €€, €€€, €€€€)
- theme: thème principal (Culturel, Gastronomique, Nature, Shopping, Aventure, Romantique, Nocturne)
- isPopular: true si c'est une activité populaire, false sinon

Réponds uniquement au format JSON avec cette structure:
{
  "activities": [
    {
      "name": "Activité spécifique à ${city}",
      "description": "Description qui mentionne clairement ${city}",
      "category": "...",
      "duration": "...",
      "rating": ...,
      "price": "...",
      "theme": "...",
      "isPopular": ...
    }
  ]
}`

        const completion = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'Tu es un expert en tourisme qui génère des activités pertinentes et intéressantes. Tu réponds uniquement en JSON valide. IMPORTANT: Toutes les activités doivent être spécifiques à la ville demandée, jamais d\'activités génériques.'
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
        console.log('🤖 AI Response received:', aiResponse?.substring(0, 200) + '...')

        if (aiResponse) {
          try {
            // Clean AI response to extract pure JSON
            let cleanResponse = aiResponse.trim()
            
            // Remove markdown code blocks if present
            if (cleanResponse.includes('```json')) {
              cleanResponse = cleanResponse.replace(/```json\s*/, '').replace(/```\s*$/, '')
            } else if (cleanResponse.includes('```')) {
              cleanResponse = cleanResponse.replace(/```\s*/, '').replace(/```\s*$/, '')
            }
            
            const aiData = JSON.parse(cleanResponse)
            if (aiData.activities && Array.isArray(aiData.activities)) {
              console.log(`✅ AI generated ${aiData.activities.length} activities`)
              
              // Save AI activities to database for future use - SANS génération d'image synchrone
              for (const activity of aiData.activities) {
                // Utiliser un placeholder SVG immédiatement
                const placeholderImage = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23${Math.floor(Math.random()*16777215).toString(16)}' width='400' height='300'/%3E%3Ctext x='200' y='150' text-anchor='middle' fill='white' font-family='Arial' font-size='16'%3E${activity.name}%3C/text%3E%3C/svg%3E`
                
                await db.activity.create({
                  data: {
                    ...activity,
                    city: city,
                    isActive: true,
                    image: placeholderImage,
                    imageGenerated: false // Flag pour indiquer que l'image doit être générée
                  }
                })
              }
              
              console.log('💾 AI activities saved to database with placeholder images')
              activities = aiData.activities
            }
          } catch (parseError) {
            console.error('❌ Failed to parse AI response:', parseError)
            console.error('❌ Raw AI response:', aiResponse)
          }
        }
      } catch (aiError) {
        console.error('❌ AI generation failed:', aiError)
      }
    }

    // If still no activities (AI failed), return popular activities from the same city first
    if (activities.length === 0) {
      console.log('🔍 Still no activities, returning popular activities from the same city first...')
      
      // First try to get activities from the same city
      activities = await db.activity.findMany({
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
      
      // If still no activities from the same city, then get from any city
      if (activities.length === 0) {
        console.log('🔍 No activities in the same city, getting from any city...')
        activities = await db.activities.findMany({
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
    }

    console.log(`✅ Returning ${activities.length} activities`)

    // Transform to match expected format
    const formattedActivities = activities.map(activity => ({
      id: activity.id || `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
    console.error('💥 ERROR in suggest-activities API:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}