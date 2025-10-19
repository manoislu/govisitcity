import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Starting to clean duplicate activities...')
    
    const { dryRun = true } = await request.json()
    
    console.log(`🔍 Mode: ${dryRun ? 'DRY RUN (no actual deletion)' : 'LIVE DELETION'}`)
    
    // Get all activities
    const allActivities = await db.activity.findMany({
      orderBy: { createdAt: 'asc' }
    })
    
    console.log(`📊 Total activities in database: ${allActivities.length}`)
    
    // Group activities by name + city + theme combination
    const activityGroups = new Map<string, any[]>()
    
    allActivities.forEach(activity => {
      const key = `${activity.name.toLowerCase().trim()}|${activity.city.toLowerCase().trim()}|${activity.theme?.toLowerCase().trim() || ''}`
      if (!activityGroups.has(key)) {
        activityGroups.set(key, [])
      }
      activityGroups.get(key)!.push(activity)
    })
    
    // Find duplicates and prepare for deletion
    const duplicatesToDelete = []
    let totalDuplicates = 0
    
    for (const [key, activities] of activityGroups.entries()) {
      if (activities.length > 1) {
        // Sort by creation date (oldest first)
        const sortedActivities = activities.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        
        // Keep the oldest one, mark others for deletion
        const toKeep = sortedActivities[0]
        const toDelete = sortedActivities.slice(1)
        
        console.log(`🔄 Duplicate group: ${toKeep.name} in ${toKeep.city}`)
        console.log(`   Keeping: ${toKeep.id} (created: ${toKeep.createdAt})`)
        console.log(`   Deleting: ${toDelete.map(a => `${a.id} (${a.createdAt})`).join(', ')}`)
        
        duplicatesToDelete.push(...toDelete)
        totalDuplicates += toDelete.length
      }
    }
    
    console.log(`📊 Found ${totalDuplicates} duplicates to delete`)
    
    if (!dryRun && duplicatesToDelete.length > 0) {
      console.log('🗑️ Starting actual deletion...')
      
      // Delete duplicates in batches
      const batchSize = 10
      for (let i = 0; i < duplicatesToDelete.length; i += batchSize) {
        const batch = duplicatesToDelete.slice(i, i + batchSize)
        const batchIds = batch.map(a => a.id)
        
        await db.activity.deleteMany({
          where: {
            id: {
              in: batchIds
            }
          }
        })
        
        console.log(`✅ Deleted batch ${Math.floor(i/batchSize) + 1}: ${batch.length} activities`)
      }
      
      console.log(`🎉 Successfully deleted ${duplicatesToDelete.length} duplicate activities`)
    }
    
    // Get final count
    const finalCount = dryRun ? allActivities.length : await db.activity.count()
    
    return NextResponse.json({
      success: true,
      dryRun,
      originalCount: allActivities.length,
      finalCount,
      duplicatesFound: totalDuplicates,
      duplicatesDeleted: dryRun ? 0 : duplicatesToDelete.length,
      duplicates: duplicatesToDelete.map(activity => ({
        id: activity.id,
        name: activity.name,
        city: activity.city,
        theme: activity.theme,
        createdAt: activity.createdAt
      }))
    })
    
  } catch (error) {
    console.error('❌ Error cleaning duplicates:', error)
    return NextResponse.json(
      { error: 'Failed to clean duplicates' },
      { status: 500 }
    )
  }
}