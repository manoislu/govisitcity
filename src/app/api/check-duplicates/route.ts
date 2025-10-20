import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API check-duplicates called!')
    
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    
    // Get all activities
    const allActivities = await db.activities.findMany({
      where: {
        isActive: true,
        ...(city && { city: city })
      },
      orderBy: [
        { city: 'asc' },
        { name: 'asc' }
      ]
    })

    // Group by name and city to find duplicates
    const activityGroups = new Map()
    
    for (const activity of allActivities) {
      const normalizedName = activity.name.toLowerCase().trim().replace(/\s+/g, ' ')
      const normalizedCity = activity.city.toLowerCase().trim()
      const key = `${normalizedName}-${normalizedCity}`
      
      if (!activityGroups.has(key)) {
        activityGroups.set(key, [])
      }
      activityGroups.get(key).push(activity)
    }

    // Find duplicates
    const duplicates = []
    let totalDuplicates = 0

    for (const [key, activities] of activityGroups) {
      if (activities.length > 1) {
        totalDuplicates += activities.length - 1
        const sortedActivities = activities.sort((a, b) => {
          if (b.rating !== a.rating) {
            return b.rating - a.rating
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
        
        duplicates.push({
          name: sortedActivities[0].name,
          city: sortedActivities[0].city,
          count: sortedActivities.length,
          keep: sortedActivities[0],
          delete: sortedActivities.slice(1)
        })
      }
    }

    return NextResponse.json({ 
      message: 'Duplicate analysis completed',
      totalActivities: allActivities.length,
      duplicateGroups: duplicates.length,
      totalDuplicates: totalDuplicates,
      duplicates: duplicates
    })

  } catch (error) {
    console.error('💥 ERROR in check-duplicates API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}