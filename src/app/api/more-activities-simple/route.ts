import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    console.log('🏢 API more-activities-simple called!')
    
    const { city, theme, existingActivities, budget, participants } = await request.json()
    console.log('🏢 Request data:', { city, theme, existingActivitiesCount: existingActivities?.length })

    if (!city || !theme) {
      console.log('❌ Missing required fields')
      return NextResponse.json(
        { error: 'City and theme are required' },
        { status: 400 }
      )
    }

    console.log('📊 Returning mock data for testing')
    
    // Return mock data for testing
    const mockActivities = [
      {
        id: 'mock_1',
        name: `Mock ${theme} Activity in ${city}`,
        description: `This is a mock ${theme} activity in ${city} for testing purposes`,
        category: 'Culture',
        duration: '2h',
        rating: 4.5,
        price: '€€',
        image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ccc" width="400" height="300"/%3E%3Ctext x="200" y="150" text-anchor="middle" fill="black" font-family="Arial" font-size="16"%3EMock Activity%3C/text%3E%3C/svg%3E',
        theme: theme,
        isPopular: true
      }
    ]

    console.log(`✅ Returning ${mockActivities.length} mock activities`)
    return NextResponse.json({ activities: mockActivities })

  } catch (error) {
    console.error('💥 ERROR in more-activities-simple API:', error)
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}