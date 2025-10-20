import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { activityName, city, category } = await request.json()

    if (!activityName || !city) {
      return NextResponse.json(
        { error: 'Activity name and city are required' },
        { status: 400 }
      )
    }

    const zai = await ZAI.create()

    // Create a descriptive prompt for the image
    const prompt = `Beautiful photo of ${activityName} in ${city}, ${category} activity, travel photography, high quality, bright colors, realistic style, tourist attraction`

    const response = await zai.images.generations.create({
      prompt: prompt,
      size: '1024x1024'
    })

    const imageBase64 = response.data[0]?.base64

    if (!imageBase64) {
      throw new Error('No image generated')
    }

    return NextResponse.json({ 
      image: `data:image/png;base64,${imageBase64}` 
    })

  } catch (error: any) {
    console.error('Error generating image:', error)
    
    // Return a placeholder image URL or empty string
    return NextResponse.json({ 
      image: null,
      error: 'Failed to generate image'
    })
  }
}