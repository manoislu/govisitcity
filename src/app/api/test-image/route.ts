import { NextRequest, NextResponse } from 'next/server'
import { generateActivityImage } from '@/lib/image-generator'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test image generation API called')
    
    const { activityName, category, city } = await request.json()
    
    if (!activityName || !category || !city) {
      return NextResponse.json(
        { error: 'Missing required fields: activityName, category, city' },
        { status: 400 }
      )
    }
    
    console.log(`🧪 Testing image generation for: ${activityName} in ${city}`)
    
    const startTime = Date.now()
    const image = await generateActivityImage(activityName, category, city)
    const endTime = Date.now()
    
    // Check if it's a real image or fallback SVG
    const isRealImage = !image.includes('data:image/svg+xml')
    const imageSize = image.length
    
    console.log(`🧪 Test completed in ${endTime - startTime}ms`)
    console.log(`🧪 Image type: ${isRealImage ? 'REAL PHOTO' : 'SVG FALLBACK'}`)
    console.log(`🧪 Image size: ${imageSize} characters`)
    
    return NextResponse.json({
      success: true,
      activityName,
      category,
      city,
      isRealImage,
      imageSize,
      generationTime: endTime - startTime,
      imagePreview: isRealImage ? 'Real photo generated' : 'SVG fallback used',
      imageData: image.substring(0, 100) + '...' // Preview of first 100 chars
    })
    
  } catch (error) {
    console.error('🧪 Test image generation failed:', error)
    
    return NextResponse.json(
      { 
        error: 'Test failed',
        details: error.message,
        stack: error.stack
      },
      { status: 500 }
    )
  }
}