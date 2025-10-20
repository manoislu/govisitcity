import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    console.log('🔍 Checking database for activities without images...')
    
    // Récupérer toutes les activités
    const activities = await db.activities.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        city: true,
        category: true,
        theme: true,
        image: true,
        createdAt: true
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    })
    
    console.log(`📊 Found ${activities.length} total activities`)
    
    // Analyser les images
    const analysis = {
      total: activities.length,
      withRealImages: 0,
      withSvgFallbacks: 0,
      withoutImages: 0,
      activities: []
    }
    
    activities.forEach(activity => {
      const hasImage = !!activity.image
      const isSvg = activity.image?.includes('data:image/svg+xml') || false
      const isRealImage = hasImage && !isSvg
      
      if (isRealImage) {
        analysis.withRealImages++
      } else if (isSvg) {
        analysis.withSvgFallbacks++
      } else {
        analysis.withoutImages++
      }
      
      analysis.activities.push({
        id: activity.id,
        name: activity.name,
        city: activity.city,
        category: activity.category,
        theme: activity.theme,
        imageStatus: isRealImage ? 'REAL_IMAGE' : isSvg ? 'SVG_FALLBACK' : 'NO_IMAGE',
        imageSize: activity.image?.length || 0,
        imagePreview: activity.image?.substring(0, 100) || null,
        createdAt: activity.createdAt
      })
    })
    
    console.log('📊 Image Analysis Results:')
    console.log(`  - Total activities: ${analysis.total}`)
    console.log(`  - Real images: ${analysis.withRealImages}`)
    console.log(`  - SVG fallbacks: ${analysis.withSvgFallbacks}`)
    console.log(`  - No images: ${analysis.withoutImages}`)
    
    // Lister les activités qui n'ont pas de vraies images
    const activitiesNeedingImages = analysis.activities.filter(a => 
      a.imageStatus !== 'REAL_IMAGE'
    )
    
    console.log(`\n🎯 Activities needing real images (${activitiesNeedingImages.length}):`)
    activitiesNeedingImages.forEach((activity, index) => {
      console.log(`  ${index + 1}. ${activity.name} (${activity.city}) - ${activity.imageStatus}`)
    })
    
    return NextResponse.json({
      success: true,
      analysis,
      activitiesNeedingImages,
      summary: {
        total: analysis.total,
        needImages: activitiesNeedingImages.length,
        percentageWithRealImages: Math.round((analysis.withRealImages / analysis.total) * 100)
      }
    })
    
  } catch (error) {
    console.error('❌ Error checking database images:', error)
    return NextResponse.json(
      { error: 'Failed to check database images', details: error.message },
      { status: 500 }
    )
  }
}