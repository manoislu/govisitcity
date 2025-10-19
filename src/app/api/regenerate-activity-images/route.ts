import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateActivityImage } from '@/lib/image-generator'

export async function POST(request: NextRequest) {
  try {
    console.log('🖼️ API regenerate-activity-images called!')
    
    const { city, limit = 10 } = await request.json()
    console.log('🖼️ Request data:', { city, limit })

    if (!city) {
      return NextResponse.json(
        { error: 'City is required' },
        { status: 400 }
      )
    }

    // Récupérer toutes les activités pour la ville spécifiée
    const activities = await db.activity.findMany({
      where: {
        city: city,
        isActive: true
      },
      take: limit,
      orderBy: [
        { isPopular: 'desc' },
        { rating: 'desc' }
      ]
    })

    console.log(`📊 Found ${activities.length} activities to regenerate images for`)

    const updatedActivities = []

    for (const activity of activities) {
      try {
        console.log(`🔄 Regenerating image for: ${activity.name}`)
        
        // Générer une nouvelle image
        const newImage = await generateActivityImage(activity.name, activity.category, activity.city)
        
        // Mettre à jour l'activité dans la base de données
        const updated = await db.activity.update({
          where: { id: activity.id },
          data: { image: newImage }
        })
        
        updatedActivities.push({
          id: updated.id,
          name: updated.name,
          city: updated.city,
          success: true,
          oldImageType: activity.image.startsWith('data:image/png') ? 'PNG' : 'SVG',
          newImageType: newImage.startsWith('data:image/png') ? 'PNG' : 'SVG'
        })
        
        console.log(`✅ Regenerated image for: ${activity.name}`)
        
        // Petit délai pour éviter de surcharger l'API
        await new Promise(resolve => setTimeout(resolve, 3000))
        
      } catch (error) {
        console.error(`❌ Failed to regenerate image for ${activity.name}:`, error)
        updatedActivities.push({
          id: activity.id,
          name: activity.name,
          city: activity.city,
          success: false,
          error: error.message
        })
      }
    }

    console.log(`🎉 Regenerated ${updatedActivities.filter(a => a.success).length} images`)

    return NextResponse.json({ 
      message: 'Image regeneration completed',
      city: city,
      total: activities.length,
      updated: updatedActivities.filter(a => a.success).length,
      failed: updatedActivities.filter(a => !a.success).length,
      activities: updatedActivities
    })

  } catch (error) {
    console.error('💥 ERROR in regenerate-activity-images API:', error)
    
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}