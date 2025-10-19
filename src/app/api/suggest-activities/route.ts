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

    console.log('📊 Searching for activities in', city)
    
    // Get activities from database first
    let activities = await db.activity.findMany({
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

    // If no activities in database, get popular activities from any city
    if (activities.length === 0) {
      console.log('🔍 No activities in database, getting popular activities...')
      activities = await db.activity.findMany({
        where: {
          isActive: true
        },
        orderBy: [
          { isPopular: 'desc' },
          { rating: 'desc' }
        ],
        take: 8
      })
    }

    // If still not enough activities, get more from database
    if (activities.length < 6) {
      const moreActivities = await db.activity.findMany({
        where: {
          isActive: true,
          id: {
            notIn: activities.map(a => a.id)
          }
        },
        orderBy: [
          { isPopular: 'desc' },
          { rating: 'desc' }
        ],
        take: 8 - activities.length
      })
      activities = [...activities, ...moreActivities]
    }

    console.log(`✅ Returning ${activities.length} activities`)

    // Transform to match expected format
    const formattedActivities = activities.map(activity => ({
      id: activity.id,
      name: activity.name,
      description: activity.description,
      category: activity.category,
      duration: activity.duration,
      rating: activity.rating,
      price: activity.price,
      image: activity.image,
      theme: activity.theme,
      isPopular: activity.isPopular
    }))

    console.log('🎉 Returning activities:', formattedActivities.length)
    return NextResponse.json({ activities: formattedActivities })

  } catch (error) {
    console.error('💥 ERROR in suggest-activities API:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}