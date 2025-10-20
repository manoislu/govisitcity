import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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

    console.log('📊 Checking database for activities in', city)
    
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

    console.log(`📊 Found ${activities.length} activities in database for ${city}`)

    // If no activities found, try to get from any city
    if (activities.length === 0) {
      console.log('🔍 No activities in the same city, getting from any city...')
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
      
      console.log(`📊 Found ${fallbackActivities.length} fallback activities`)
      
      // Transform to match expected format
      const formattedActivities = fallbackActivities.map(activity => ({
        id: activity.id,
        name: activity.name,
        description: activity.description,
        category: activity.category,
        duration: activity.duration,
        rating: activity.rating,
        price: activity.price,
        image: activity.image
      }))

      return NextResponse.json({ activities: formattedActivities })
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
      image: activity.image
    }))

    console.log('✅ Returning activities:', formattedActivities.length)
    return NextResponse.json({ activities: formattedActivities })

  } catch (error: any) {
    console.error('💥 ERROR in suggest-activities API:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}