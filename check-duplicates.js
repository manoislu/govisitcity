import { db } from '@/lib/db'

async function findDuplicates() {
  try {
    console.log('🔍 Searching for duplicate activities...')
    
    // Get all activities
    const allActivities = await db.activities.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { city: 'asc' },
        { name: 'asc' }
      ]
    })

    console.log(`📊 Total activities found: ${allActivities.length}`)

    // Group by name and city to find duplicates
    const activityGroups = new Map()
    
    for (const activity of allActivities) {
      const key = `${activity.name.toLowerCase().trim()}-${activity.city.toLowerCase().trim()}`
      
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
        duplicates.push({
          key,
          activities: activities.sort((a, b) => {
            // Keep the one with highest rating or most recent
            if (b.rating !== a.rating) {
              return b.rating - a.rating
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          })
        })
      }
    }

    console.log(`🚨 Found ${duplicates.length} duplicate groups (${totalDuplicates} total duplicates)`)

    if (duplicates.length > 0) {
      console.log('\n📋 Duplicate Details:')
      for (const group of duplicates) {
        console.log(`\n🏷️  "${group.activities[0].name}" in ${group.activities[0].city}`)
        console.log(`   📊 Found ${group.activities.length} copies:`)
        
        group.activities.forEach((activity, index) => {
          const keep = index === 0 ? '✅ KEEP' : '❌ DELETE'
          console.log(`   ${index + 1}. ${keep} ID: ${activity.id} | Rating: ${activity.rating} | Created: ${activity.createdAt.toLocaleDateString()}`)
        })
      }
    } else {
      console.log('✅ No duplicates found!')
    }

    return { duplicates, totalDuplicates }

  } catch (error) {
    console.error('❌ Error finding duplicates:', error)
    return { duplicates: [], totalDuplicates: 0 }
  }
}

findDuplicates()