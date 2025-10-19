import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    console.log('🔍 Testing database connection...')
    
    // Test simple database query
    const count = await db.activity.count()
    console.log(`📊 Found ${count} activities in database`)
    
    // Test getting first few activities
    const activities = await db.activity.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        city: true,
        isActive: true
      }
    })
    
    console.log('📋 Sample activities:', activities)
    
    return NextResponse.json({ 
      success: true, 
      count,
      activities 
    })
  } catch (error) {
    console.error('❌ Database test failed:', error)
    return NextResponse.json(
      { error: 'Database connection failed', details: error.message },
      { status: 500 }
    )
  }
}