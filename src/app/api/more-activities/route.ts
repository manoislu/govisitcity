import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    console.log('🔥 API more-activities called!')
    
    const { city, theme, existingActivities, budget, participants, generateImages = false } = await request.json()
    console.log('🔥 Request data:', { city, theme, existingActivities: existingActivities?.length || 0, budget, participants, generateImages })

    if (!city || !theme) {
      console.log('❌ Missing required data:', { city, theme })
      return NextResponse.json(
        { error: 'City and theme are required' },
        { status: 400 }
      )
    }

    console.log('🤖 Generating more activities for', city, 'with theme:', theme)
    
    try {
      const zai = await ZAI.create()
      
      const existingNames = (existingActivities || []).map((a: any) => a.name)
      
      const prompt = `Génère 4 activités touristiques pour la ville de ${city} avec le thème "${theme}".
ATTENTION: Ces activités doivent être DIFFÉRENTES des activités déjà existantes.

Activités existantes à éviter:
${existingNames.map((name: string) => `- ${name}`).join('\n')}

Budget: ${budget || 'non spécifié'}
Participants: ${participants || 2} personnes

RÈGLES IMPORTANTES:
- Chaque activité doit correspondre au thème "${theme}"
- Chaque nom d'activité doit mentionner ${city} ou un lieu spécifique de ${city}
- Ne génère JAMAIS d'activités qui sont dans la liste des activités existantes
- Sois créatif et original dans tes suggestions

Pour chaque activité, fournis:
- name: nom de l'activité (doit inclure ${city} ou un lieu spécifique)
- description: description détaillée (1-2 phrases, doit mentionner ${city})
- category: Culture, Gastronomie, Nature, Shopping, Aventure, Romantique, Nocturne
- duration: durée approximative (ex: "2h", "3h30")
- rating: note sur 5 (ex: 4.2, 3.8)
- price: niveau de prix (Gratuit, €, €€, €€€, €€€€)
- theme: thème principal (doit être "${theme}")

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
      "theme": "${theme}"
    }
  ]
}`

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en tourisme qui génère des activités pertinentes et originales. Tu réponds uniquement en JSON valide. IMPORTANT: Toutes les activités doivent être spécifiques à la ville demandée et correspondre au thème demandé.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1500
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
          if (aiData.activities && Array.isArray(aiData.activities)) {
            console.log(`✅ AI generated ${aiData.activities.length} new activities`)
            
            const formattedActivities = aiData.activities.map((activity: any, index: number) => ({
              id: `new_${Date.now()}_${index}`,
              name: activity.name,
              description: activity.description,
              category: activity.category,
              duration: activity.duration,
              rating: activity.rating,
              price: activity.price,
              image: generateImages ? undefined : `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%2310B981' width='400' height='300'/%3E%3Ctext x='200' y='150' text-anchor='middle' fill='white' font-family='Arial' font-size='16'%3E${activity.name}%3C/text%3E%3C/svg%3E`,
              theme: activity.theme,
              isNewlyAdded: true
            }))

            console.log('🎉 Returning new activities:', formattedActivities.length)
            return NextResponse.json({ activities: formattedActivities })
          }
        } catch (parseError) {
          console.error('❌ Failed to parse AI response:', parseError)
        }
      }
    } catch (aiError) {
      console.error('❌ AI generation failed:', aiError)
    }

    // Fallback activities
    console.log('🔄 Using fallback activities for theme:', theme)
    const fallbackActivities = [
      {
        id: `fallback_${Date.now()}_1`,
        name: `Expérience ${theme} à ${city}`,
        description: `Découvrez une expérience unique de ${theme} dans le cadre magnifique de ${city}.`,
        category: theme === "Gastronomique" ? "Gastronomie" : theme === "Culturel" ? "Culture" : "Aventure",
        duration: "2h",
        rating: 4.3,
        price: "€€",
        image: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%2310B981' width='400' height='300'/%3E%3Ctext x='200' y='150' text-anchor='middle' fill='white' font-family='Arial' font-size='16'%3E${theme}%3C/text%3E%3C/svg%3E`,
        theme: theme,
        isNewlyAdded: true
      }
    ]

    return NextResponse.json({ activities: fallbackActivities })

  } catch (error) {
    console.error('💥 ERROR in more-activities API:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}