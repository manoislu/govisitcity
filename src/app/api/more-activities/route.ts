import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateActivityImage } from '@/lib/image-generator'
import ZAI from 'z-ai-web-dev-sdk'

async function generateActivitiesWithAI(
  city: string, 
  theme: string, 
  budget?: string, 
  participants?: number, 
  existingActivities?: any[]
) {
  const zai = await ZAI.create()
  
  const prompt = `Génère 4 activités touristiques EXCLUSIVEMENT pour la ville de ${city} avec le thème "${theme}".
ATTENTION: Toutes les activités doivent être spécifiquement situées à ${city} ou dans ses environs immédiats.

Budget: ${budget || 'non spécifié'}
Participants: ${participants || 2} personnes
Évite ces activités déjà existantes: ${existingActivities?.map((a: any) => a.name).join(', ') || 'aucune'}

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
- theme: "${theme}" (doit correspondre au thème demandé)
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
        content: 'Tu es un expert en tourisme qui génère des activités pertinentes et intéressantes selon les thèmes demandés. Tu réponds uniquement en JSON valide. IMPORTANT: Toutes les activités doivent être spécifiques à la ville demandée, jamais d\'activités génériques.'
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
        console.log(`✅ AI generated ${aiData.activities.length} themed activities`)
        
        // Save AI activities to database for future use (with timeout protection)
        const savedActivities = []
        
        // Generate images in parallel for better performance
        const imagePromises = aiData.activities.map(async (activity) => {
          try {
            console.log(`🖼️ Generating image for: ${activity.name}`)
            return await generateActivityImage(activity.name, activity.category, city)
          } catch (error) {
            console.error(`❌ Failed to generate image for ${activity.name}:`, error)
            // Generate fallback image
            return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}' width='400' height='300'/%3E%3Ctext x='200' y='150' text-anchor='middle' fill='white' font-family='Arial' font-size='16'%3E${encodeURIComponent(activity.name)}%3C/text%3E%3C/svg%3E`
          }
        })
        
        const images = await Promise.all(imagePromises)
        
        // Save activities with their images
        for (let i = 0; i < aiData.activities.length; i++) {
          const activity = aiData.activities[i]
          const image = images[i]
          
          try {
            const savedActivity = await db.activities.create({
              data: {
                ...activity,
                city: city,
                isActive: true,
                image: image
              }
            })
            savedActivities.push(savedActivity)
          } catch (saveError) {
            console.error(`❌ Failed to save activity ${activity.name}:`, saveError)
          }
        }
        
        console.log(`💾 ${savedActivities.length}/${aiData.activities.length} AI themed activities saved to database`)
        return savedActivities
      }
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', parseError)
      console.error('❌ Raw AI response:', aiResponse)
    }
  }
  
  return []
}

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

    console.log('🤖 Forcing AI generation for new themed activities...')
    
    let activities: any[] = []
    
    try {
      // Add timeout for the entire AI generation process
      const aiGenerationPromise = generateActivitiesWithAI(city, theme, budget, participants, existingActivities)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AI generation timeout')), 30000) // 30 seconds for AI + image generation
      )
      
      const generatedActivities = await Promise.race([aiGenerationPromise, timeoutPromise]) as any[]
      
      if (generatedActivities && generatedActivities.length > 0) {
        activities = generatedActivities
        console.log(`✅ AI generation completed, got ${activities.length} activities`)
      } else {
        console.log('⚠️ AI generation returned no activities, trying database fallback...')
        
        // Only use database as fallback if AI completely fails
        const existingIds = new Set(existingActivities?.map((a: any) => a.id) || [])
        
        // Try to find activities that match the theme in database
        let dbActivities = await db.activities.findMany({
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
          take: 4
        })

        console.log(`📊 Found ${dbActivities.length} themed activities in database for ${city}/${theme}`)

        // If no themed activities, try any activities from the city
        if (dbActivities.length === 0) {
          console.log('🔍 No themed activities, trying any activities from the city...')
          dbActivities = await db.activities.findMany({
            where: {
              city: city,
              isActive: true,
              id: {
                notIn: Array.from(existingIds)
              }
            },
            orderBy: [
              { isPopular: 'desc' },
              { rating: 'desc' }
            ],
            take: 4
          })
          
          console.log(`📊 Found ${dbActivities.length} activities from ${city} (any theme)`)
        }

        activities = dbActivities.map(activity => ({
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
      }
      
    } catch (aiError) {
      console.error('❌ AI generation failed:', aiError)
      if (aiError instanceof Error && aiError.message === 'AI generation timeout') {
        console.log('⏰ AI generation timed out, using database fallback')
      }
      
      // Database fallback
      const existingIds = new Set(existingActivities?.map((a: any) => a.id) || [])
      const fallbackActivities = await db.activities.findMany({
        where: {
          city: city,
          isActive: true,
          id: {
            notIn: Array.from(existingIds)
          }
        },
        orderBy: [
          { isPopular: 'desc' },
          { rating: 'desc' }
        ],
        take: 4
      })
      
      activities = fallbackActivities.map(activity => ({
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
    }

    console.log(`✅ Total activities found: ${activities.length}`)

    if (activities.length === 0) {
      console.log('❌ No activities found at all')
      return NextResponse.json(
        { error: 'Aucune activité trouvée' },
        { status: 404 }
      )
    }

    // Transform to match expected format and generate images for AI activities
    const formattedActivities = await Promise.all(activities.map(async (activity) => {
      // If this is an AI-generated activity without a proper image, generate one
      if (activity.id && activity.id.toString().startsWith('ai_') && (!activity.image || activity.image.includes('data:image/svg+xml'))) {
        try {
          console.log(`🖼️ Generating image for AI activity: ${activity.name}`)
          const generatedImage = await generateActivityImage(activity.name, activity.category, city)
          return {
            ...activity,
            image: generatedImage
          }
        } catch (imageError) {
          console.error(`❌ Failed to generate image for ${activity.name}:`, imageError)
          // Keep the original image if generation fails
        }
      }
      
      return {
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
      }
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