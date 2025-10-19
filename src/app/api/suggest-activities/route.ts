import { NextRequest, NextResponse } from 'next/server'
import { supabase, Activity } from '@/lib/supabase'
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

    // If Supabase is not available, use AI directly
    if (!supabase) {
      console.log('⚠️ Supabase not available, using AI generation only')
      return await generateActivitiesWithAI(city, budget, participants)
    }

    console.log('📊 Checking Supabase for activities in', city)
    
    // First try exact match in Supabase
    const result = await supabase
      .from('activities')
      .select('*')
      .eq('city', city)
      .eq('is_active', true)
      .order('is_popular', { ascending: false })
      .order('rating', { ascending: false })
      .limit(8)
    
    const activities = result.data
    const error = result.error

    if (error) {
      console.error('❌ Supabase error:', error)
      // Fallback to AI if Supabase fails
      return await generateActivitiesWithAI(city, budget, participants)
    } else {
      console.log(`📊 Found ${activities?.length || 0} activities in Supabase for ${city}`)
    }

    // If no activities in database, use AI to generate some
    if (!activities || activities.length === 0) {
      console.log('🤖 No activities in database, calling AI to generate...')
      return await generateActivitiesWithAI(city, budget, participants, supabase)
    }

    // Transform activities to match expected format
    const formattedActivities = activities.map((activity: Activity) => ({
      id: activity.id,
      name: activity.name,
      description: activity.description,
      category: activity.category,
      duration: activity.duration,
      rating: activity.rating,
      price: activity.price,
      image: activity.image,
      theme: activity.theme,
      isPopular: activity.is_popular
    }))

    console.log('✅ Returning activities:', formattedActivities.length)
    return NextResponse.json({ activities: formattedActivities })

  } catch (error) {
    console.error('💥 ERROR in suggest-activities API:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function generateActivitiesWithAI(city: string, budget: string, participants: number, supabaseClient: any = null) {
  try {
    console.log('🤖 Generating activities with AI for', city)
    
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
          
          // Save AI activities to Supabase for future use (if available)
          if (supabaseClient) {
            for (const activity of aiData.activities) {
              const activityData = {
                id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: activity.name,
                description: activity.description,
                category: activity.category,
                duration: activity.duration,
                rating: activity.rating,
                price: activity.price,
                image: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23${Math.floor(Math.random()*16777215).toString(16)}' width='400' height='300'/%3E%3Ctext x='200' y='150' text-anchor='middle' fill='white' font-family='Arial' font-size='16'%3E${activity.name}%3C/text%3E%3C/svg%3E`,
                theme: activity.theme,
                is_popular: activity.isPopular || false,
                city: city,
                is_active: true
              }
              
              const { error: insertError } = await supabaseClient
                .from('activities')
                .insert(activityData)
              
              if (insertError) {
                console.warn('⚠️ Failed to save activity to Supabase:', insertError)
              }
            }
            console.log('💾 AI activities saved to Supabase')
          }
          
          const formattedActivities = aiData.activities.map((activity: any, index: number) => ({
            id: `ai_${Date.now()}_${index}`,
            name: activity.name,
            description: activity.description,
            category: activity.category,
            duration: activity.duration,
            rating: activity.rating,
            price: activity.price,
            image: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%234F46E5' width='400' height='300'/%3E%3Ctext x='200' y='150' text-anchor='middle' fill='white' font-family='Arial' font-size='16'%3E${activity.name}%3C/text%3E%3C/svg%3E`,
            theme: activity.theme,
            isPopular: activity.isPopular
          }))

          console.log('🎉 Returning activities:', formattedActivities.length)
          return NextResponse.json({ activities: formattedActivities })
        }
      } catch (parseError) {
        console.error('❌ Failed to parse AI response:', parseError)
        console.error('❌ Raw AI response:', aiResponse)
      }
    }
  } catch (aiError) {
    console.error('❌ AI generation failed:', aiError)
  }

  // Fallback activities if everything fails
  console.log('🔄 Using fallback activities for:', city)
  const fallbackActivities = [
    {
      id: `fallback_${Date.now()}_1`,
      name: `Visite des monuments de ${city}`,
      description: `Découvrez les monuments emblématiques et l'histoire fascinante de ${city}.`,
      category: "Culture",
      duration: "3h",
      rating: 4.5,
      price: "€€",
      image: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%234F46E5' width='400' height='300'/%3E%3Ctext x='200' y='150' text-anchor='middle' fill='white' font-family='Arial' font-size='16'%3E${city}%3C/text%3E%3C/svg%3E`,
      theme: "Culturel",
      isPopular: true
    },
    {
      id: `fallback_${Date.now()}_2`,
      name: `Exploration gastronomique de ${city}`,
      description: `Savourez les spécialités culinaires traditionnelles de ${city}.`,
      category: "Gastronomie",
      duration: "2h30",
      rating: 4.3,
      price: "€€€",
      image: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23F97316' width='400' height='300'/%3E%3Ctext x='200' y='150' text-anchor='middle' fill='white' font-family='Arial' font-size='16'%3EGastronomie%3C/text%3E%3C/svg%3E`,
      theme: "Gastronomique",
      isPopular: true
    }
  ]

  return NextResponse.json({ activities: fallbackActivities })
}