import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateActivityImage } from '@/lib/image-generator'

export async function POST(request: NextRequest) {
  try {
    console.log('🖼️ API update-activity-images called!')
    
    const { city, limit = 5 } = await request.json()
    console.log('🖼️ Request data:', { city, limit })

    // Récupérer les activités qui ont encore des images placeholder (SVG simples)
    const activities = await db.activity.findMany({
      where: {
        ...(city && { city: city }),
        isActive: true,
        image: {
          contains: 'data:image/svg+xml'
        }
      },
      take: limit,
      orderBy: [
        { isPopular: 'desc' },
        { rating: 'desc' }
      ]
    })

    console.log(`📊 Found ${activities.length} activities to update`)

    const updatedActivities = []

    for (const activity of activities) {
      try {
        console.log(`🔄 Updating image for: ${activity.name}`)
        
        // Générer une vraie image
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
          success: true
        })
        
        console.log(`✅ Updated image for: ${activity.name}`)
        
        // Petit délai pour éviter de surcharger l'API
        await new Promise(resolve => setTimeout(resolve, 2000))
        
      } catch (error) {
        console.error(`❌ Failed to update image for ${activity.name}:`, error)
        updatedActivities.push({
          id: activity.id,
          name: activity.name,
          city: activity.city,
          success: false,
          error: error.message
        })
      }
    }

    console.log(`🎉 Updated ${updatedActivities.filter(a => a.success).length} images`)

    return NextResponse.json({ 
      message: 'Image update completed',
      updated: updatedActivities.filter(a => a.success).length,
      failed: updatedActivities.filter(a => !a.success).length,
      activities: updatedActivities
    })

  } catch (error) {
    console.error('💥 ERROR in update-activity-images API:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}