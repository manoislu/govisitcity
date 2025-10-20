import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateActivityImage } from '@/lib/image-generator'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Starting to fix missing images...')
    
    const { limit = 5 } = await request.json()
    
    // Récupérer les activités qui n'ont pas de vraies images
    const activitiesNeedingImages = await db.activities.findMany({
      where: {
        isActive: true,
        OR: [
          { image: null },
          { image: '' },
          { image: { contains: 'data:image/svg+xml' } }
        ]
      },
      select: {
        id: true,
        name: true,
        city: true,
        category: true,
        theme: true,
        image: true
      },
      orderBy: [
        { createdAt: 'desc' }
      ],
      take: limit
    })
    
    console.log(`🎯 Found ${activitiesNeedingImages.length} activities needing images`)
    
    if (activitiesNeedingImages.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All activities already have real images!',
        updated: 0,
        failed: 0
      })
    }
    
    const results = {
      updated: 0,
      failed: 0,
      details: []
    }
    
    // Générer des images pour chaque activité
    for (const activity of activitiesNeedingImages) {
      try {
        console.log(`🖼️ Generating image for: ${activity.name}`)
        
        const newImage = await generateActivityImage(
          activity.name, 
          activity.category, 
          activity.city
        )
        
        // Vérifier si c'est une vraie image ou un fallback
        const isRealImage = !newImage.includes('data:image/svg+xml')
        
        // Mettre à jour l'activité dans la base de données
        await db.activities.update({
          where: { id: activity.id },
          data: { image: newImage }
        })
        
        results.updated++
        results.details.push({
          id: activity.id,
          name: activity.name,
          status: 'SUCCESS',
          isRealImage,
          imageSize: newImage.length
        })
        
        console.log(`✅ Updated ${activity.name} with ${isRealImage ? 'REAL IMAGE' : 'SVG FALLBACK'}`)
        
      } catch (error) {
        console.error(`❌ Failed to update ${activity.name}:`, error)
        results.failed++
        results.details.push({
          id: activity.id,
          name: activity.name,
          status: 'FAILED',
          error: error.message
        })
      }
    }
    
    console.log(`🎉 Image fixing completed: ${results.updated} updated, ${results.failed} failed`)
    
    return NextResponse.json({
      success: true,
      message: `Fixed ${results.updated} images (${results.failed} failed)`,
      results
    })
    
  } catch (error) {
    console.error('❌ Error fixing missing images:', error)
    return NextResponse.json(
      { error: 'Failed to fix missing images', details: error.message },
      { status: 500 }
    )
  }
}