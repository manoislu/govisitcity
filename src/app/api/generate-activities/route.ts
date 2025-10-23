import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

const activityTemplates = {
  paris: [
    { title: "Visite de la Tour Eiffel", description: "Montez au sommet de l'emblème de Paris pour une vue panoramique exceptionnelle.", category: "Monument", price: 25 },
    { title: "Croisière sur la Seine", description: "Découvrez Paris depuis l'eau avec une croisière commentée.", category: "Activité", price: 15 },
    { title: "Musée du Louvre", description: "Explorez l'un des plus grands musées du monde et ses chefs-d'œuvre.", category: "Culture", price: 17 },
    { title: "Montmartre et Sacré-Cœur", description: "Promenez-vous dans le quartier artistique et visitez la basilique.", category: "Quartier", price: 0 },
    { title: "Arc de Triomphe", description: "Montez au sommet pour une vue spectaculaire sur les Champs-Élysées.", category: "Monument", price: 13 }
  ],
  rome: [
    { title: "Colisée", description: "Découvrez le plus grand amphithéâtre de l'Empire romain.", category: "Monument", price: 16 },
    { title: "Vatican et Musées", description: "Visitez la chapelle Sixtine et la basilique Saint-Pierre.", category: "Culture", price: 22 },
    { title: "Fontaine de Trevi", description: "Jetez une pièce et faites un vœu dans la plus célèbre fontaine de Rome.", category: "Monument", price: 0 },
    { title: "Forum Romain", description: "Explorez le cœur politique et commercial de la Rome antique.", category: "Site historique", price: 12 },
    { title: "Cuisine italienne", description: "Dégustez des pâtes fraîches et une pizza authentique.", category: "Gastronomie", price: 35 }
  ],
  barcelona: [
    { title: "Sagrada Familia", description: "Admirez le chef-d'œuvre inachevé de Gaudí.", category: "Monument", price: 26 },
    { title: "Parc Güell", description: "Explorez ce parc public unique avec ses mosaïques colorées.", category: "Parc", price: 10 },
    { title: "Las Ramblas", description: "Promenez-vous sur la célèbre avenue piétonne de Barcelone.", category: "Quartier", price: 0 },
    { title: "Plage de la Barceloneta", description: "Détendez-vous sur la plage urbaine la plus populaire.", category: "Plage", price: 0 },
    { title: "Tapas catalanes", description: "Dégustez des tapas traditionnelles dans le quartier gothique.", category: "Gastronomie", price: 25 }
  ],
  amsterdam: [
    { title: "Canaux d'Amsterdam", description: "Croisière sur les célèbres canaux classés à l'UNESCO.", category: "Activité", price: 18 },
    { title: "Musée Van Gogh", description: "Découvrez la plus grande collection d'œuvres de Van Gogh.", category: "Culture", price: 19 },
    { title: "Maison d'Anne Frank", description: "Visitez le lieu où Anne Frank s'est cachée pendant la guerre.", category: "Historique", price: 14 },
    { title: "Vondelpark", description: "Promenez-vous dans le plus grand parc de la ville.", category: "Parc", price: 0 },
    { title: "Vélo dans la ville", description: "Explorez Amsterdam comme un local à vélo.", category: "Activité", price: 12 }
  ],
  london: [
    { title: "Tour de Londres", description: "Découvrez l'histoire des rois et reines d'Angleterre.", category: "Monument", price: 29 },
    { title: "British Museum", description: "Explorez des trésors du monde entier dans ce musée gratuit.", category: "Culture", price: 0 },
    { title: "London Eye", description: "Profitez d'une vue imprenable sur Londres depuis cette grande roue.", category: "Activité", price: 27 },
    { title: "Buckingham Palace", description: "Assistez à la relève de la garde et admirez la résidence royale.", category: "Monument", price: 0 },
    { title: "Théâtre dans le West End", description: "Assistez à un spectacle musical ou une pièce de théâtre.", category: "Spectacle", price: 45 }
  ],
  berlin: [
    { title: "Porte de Brandebourg", description: "Symbole de l'Allemagne réunifiée et de l'histoire berlinoise.", category: "Monument", price: 0 },
    { title: "Mur de Berlin", description: "Découvrez les vestiges du mur qui a divisé la ville.", category: "Historique", price: 0 },
    { title: "Musée de Pergame", description: "Admirez des antiquités impressionnantes sur l'Île des Musées.", category: "Culture", price: 12 },
    { title: "Reichstag", description: "Visitez le parlement allemand et son dôme de verre.", category: "Politique", price: 0 },
    { title: "East Side Gallery", description: "Promenez-vous le long de la plus longue section restante du mur.", category: "Art", price: 0 }
  ],
  madrid: [
    { title: "Musée du Prado", description: "Admirez des chefs-d'œuvre de Velázquez, Goya et El Greco.", category: "Culture", price: 15 },
    { title: "Palais Royal", description: "Visitez la résidence officielle de la famille royale espagnole.", category: "Monument", price: 13 },
    { title: "Parc du Retiro", description: "Détendez-vous dans ce magnifique parc au cœur de Madrid.", category: "Parc", price: 0 },
    { title: "Plaza Mayor", description: "Profitez de l'ambiance de cette place historique.", category: "Quartier", price: 0 },
    { title: "Tapas et sangria", description: "Dégustez des spécialités madrilènes dans un bar traditionnel.", category: "Gastronomie", price: 30 }
  ],
  prague: [
    { title: "Pont Charles", description: "Traversez le pont médiéval le plus célèbre de Prague.", category: "Monument", price: 0 },
    { title: "Château de Prague", description: "Explorez le plus ancien complexe de châteaux du monde.", category: "Monument", price: 16 },
    { title: "Horloge astronomique", description: "Admirez cette horloge médiévale unique et son spectacle.", category: "Monument", price: 0 },
    { title: "Vieille Ville", description: "Perdez-vous dans les rues pavées du centre historique.", category: "Quartier", price: 0 },
    { title: "Bière tchèque", description: "Dégustez une bière artisanale dans une brasserie locale.", category: "Gastronomie", price: 8 }
  ]
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { destination, startDate, endDate, travelers, budget } = body

    // Validate input
    if (!destination || !startDate || !endDate || !travelers || !budget) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Calculate trip duration
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

    if (days <= 0) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      )
    }

    // Get base activities for the destination
    const baseActivities = activityTemplates[destination as keyof typeof activityTemplates] || activityTemplates.paris

    // Use AI to enhance and personalize activities
    const zai = await ZAI.create()
    
    const prompt = `Génère un itinéraire de voyage personnalisé pour ${days} jour(s) à ${destination} pour ${travelers} voyageur(s) avec un budget ${budget}.

Base d'activités disponibles:
${baseActivities.map(a => `- ${a.title}: ${a.description} (${a.category}, ${a.price}€)`).join('\n')}

Génère ${Math.min(days * 3, 12)} activités détaillées en tenant compte de:
1. La durée du séjour (${days} jours)
2. Le nombre de voyageurs (${travelers})
3. Le budget par personne (${budget})
4. La variété des expériences (culture, gastronomie, monuments, activités gratuites)

Format de réponse attendu (JSON):
{
  "activities": [
    {
      "title": "Nom de l'activité",
      "description": "Description détaillée et attrayante",
      "category": "Catégorie",
      "price": prix_en_euros,
      "duration": "durée estimée",
      "day": jour_du_voyage
    }
  ]
}

IMPORTANT: Réponds UNIQUEMENT avec le JSON, sans aucun texte supplémentaire.`

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert en planification de voyages qui génère des itinéraires personnalisés et réalistes. Tu réponds toujours en JSON valide.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })

    let aiActivities = []
    try {
      const aiResponse = completion.choices[0]?.message?.content
      if (aiResponse) {
        const parsed = JSON.parse(aiResponse)
        aiActivities = parsed.activities || []
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
    }

    // If AI fails, use base activities with some randomization
    if (aiActivities.length === 0) {
      aiActivities = baseActivities
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(days * 2, 8))
        .map((activity, index) => ({
          ...activity,
          duration: index % 2 === 0 ? "2-3 heures" : "1-2 heures",
          day: Math.floor(index / 2) + 1
        }))
    }

    // Adjust prices based on budget
    const budgetMultipliers = {
      budget: 0.8,
      moderate: 1.0,
      comfort: 1.3,
      luxury: 1.8
    }

    const multiplier = budgetMultipliers[budget as keyof typeof budgetMultipliers] || 1.0

    const finalActivities = aiActivities.map(activity => ({
      ...activity,
      price: Math.round(activity.price * multiplier),
      originalPrice: activity.price
    }))

    return NextResponse.json({
      success: true,
      activities: finalActivities,
      metadata: {
        destination,
        days,
        travelers,
        budget,
        totalActivities: finalActivities.length,
        estimatedTotalCost: finalActivities.reduce((sum, act) => sum + act.price, 0) * travelers
      }
    })

  } catch (error) {
    console.error('Error generating activities:', error)
    return NextResponse.json(
      { error: 'Failed to generate activities' },
      { status: 500 }
    )
  }
}