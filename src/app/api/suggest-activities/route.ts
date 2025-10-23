import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

async function generateAIActivities(city: string, budget?: string, participants?: number, duration?: string, interests?: string) {
  const zai = await ZAI.create()

  // Create personalized prompt based on user preferences
  const prompt = `Génère 6 activités touristiques uniques et personnalisées pour ${city} avec les critères suivants:
- Budget: ${budget || 'non spécifié'}€ par personne
- Nombre de participants: ${participants || 2} personnes
- Durée: ${duration || '1 journée'}
- Intérêts: ${interests || 'culture, gastronomie, découverte'}

Pour chaque activité, fournis:
1. Un nom attractif en français
2. Une description détaillée (100-150 caractères)
3. La catégorie (culture, gastronomie, nature, sport, shopping, divertissement)
4. La durée approximative en heures
5. Un prix estimé en euros par personne
6. Une note de popularité (4.0-5.0)

Format de réponse exact (JSON):
{
  "activities": [
    {
      "name": "Nom de l'activité",
      "description": "Description détaillée de l'activité",
      "category": "culture",
      "duration": 2.5,
      "price": 25,
      "rating": 4.7
    }
  ]
}

Important: 
- Toutes les activités doivent être réelles et existantes à ${city}
- Les prix doivent être réalistes pour la ville
- Varier les catégories d'activités
- Inclure des activités gratuites et payantes
- Adapter au budget spécifié`

  const completion = await zai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'Tu es un expert du tourisme qui génère des recommandations d\'activités personnalisées et réelles pour les voyageurs. Tu réponds uniquement en JSON valide.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.8,
    max_tokens: 1200
  })

  console.log('AI Response received')

  const messageContent = completion.choices[0]?.message?.content
  if (!messageContent) {
    throw new Error('No response from AI')
  }

  // Parse AI response
  let aiResponse
  try {
    aiResponse = JSON.parse(messageContent)
  } catch (parseError) {
    console.error('Failed to parse AI response:', messageContent)
    throw new Error('Invalid AI response format')
  }

  if (!aiResponse.activities || !Array.isArray(aiResponse.activities)) {
    throw new Error('Invalid activities structure in AI response')
  }

  // Generate images for activities (limit to first 3 for performance)
  const activitiesWithImages = await Promise.all(
    aiResponse.activities.slice(0, 3).map(async (activity: any, index: number) => {
      try {
        console.log(`Generating image for activity ${index + 1}: ${activity.name}`)
        
        const imagePrompt = `Photo professionnelle de tourisme pour "${activity.name}" à ${city}. Style: photographie moderne, lumineuse, attrayante. Format: paysage, haute qualité.`

        const imageResponse = await zai.images.generations.create({
          prompt: imagePrompt,
          size: '1024x1024'
        })

        const imageBase64 = imageResponse.data[0]?.base64
        
        return {
          ...activity,
          id: `ai-${city.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${index}`,
          image: imageBase64 || null,
          isAIGenerated: true,
          city: city
        }
      } catch (imageError) {
        console.error(`Failed to generate image for ${activity.name}:`, imageError)
        return {
          ...activity,
          id: `ai-${city.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${index}`,
          image: null,
          isAIGenerated: true,
          city: city
        }
      }
    })
  )

  // Add remaining activities without images
  const remainingActivities = aiResponse.activities.slice(3).map((activity: any, index: number) => ({
    ...activity,
    id: `ai-${city.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${index + 3}`,
    image: null,
    isAIGenerated: true,
    city: city
  }))

  return [...activitiesWithImages, ...remainingActivities]
}

export async function POST(request: NextRequest) {
  try {
    console.log('AI-Powered suggest-activities API called!')
    
    const { city, budget, participants, duration, interests, useAI = true } = await request.json()
    console.log('Request data:', { city, budget, participants, duration, interests, useAI })

    if (!city || typeof city !== 'string') {
      console.log('Invalid city:', city)
      return NextResponse.json(
        { error: 'City name is required' },
        { status: 400 }
      )
    }

    // Try AI generation first if enabled
    if (useAI) {
      try {
        console.log('Attempting AI generation for', city)
        
        // Add timeout for AI generation
        const aiGenerationPromise = generateAIActivities(city, budget, participants, duration, interests)
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('AI generation timeout')), 25000) // 25 seconds timeout
        )
        
        const aiActivities = await Promise.race([aiGenerationPromise, timeoutPromise])
        
        if (aiActivities && aiActivities.length > 0) {
          console.log(`Successfully generated ${aiActivities.length} AI activities for ${city}`)
          
          return NextResponse.json({ 
            activities: aiActivities,
            isAIGenerated: true,
            city: city,
            generatedAt: new Date().toISOString()
          })
        }
        
      } catch (aiError: any) {
        console.error('AI Generation Error:', aiError)
        console.log('Falling back to database activities...')
      }
    }

    // Fallback to database activities
    console.log('Checking database for activities in', city)
    
    // Get activities from database
    const activities = await db.activities.findMany({
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

    console.log(`Found ${activities.length} activities in database for ${city}`)

    // If no activities found, try to get from any city
    if (activities.length === 0) {
      console.log('No activities in the same city, getting from any city...')
      const fallbackActivities = await db.activities.findMany({
        where: {
          isActive: true
        },
        orderBy: [
          { isPopular: 'desc' },
          { rating: 'desc' }
        ],
        take: 8
      })
      
      console.log(`Found ${fallbackActivities.length} fallback activities`)
      
      // Transform to match expected format
      const formattedActivities = fallbackActivities.map(activity => ({
        id: activity.id,
        name: activity.name,
        description: activity.description,
        category: activity.category,
        duration: activity.duration,
        rating: activity.rating,
        price: activity.price,
        image: activity.image,
        isAIGenerated: false
      }))

      return NextResponse.json({ 
        activities: formattedActivities,
        isAIGenerated: false,
        fallback: true 
      })
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
      isAIGenerated: false
    }))

    console.log('Returning database activities:', formattedActivities.length)
    return NextResponse.json({ 
      activities: formattedActivities,
      isAIGenerated: false 
    })

  } catch (error: any) {
    console.error('ERROR in suggest-activities API:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}