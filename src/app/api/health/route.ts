import { NextResponse } from "next/server";
import { db, isDatabaseAvailable } from '@/lib/db';

export async function GET() {
  try {
    // Check if database is available
    if (!isDatabaseAvailable()) {
      return NextResponse.json({ 
        status: "unhealthy",
        database: "disconnected",
        error: "DATABASE_URL is not configured",
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }
    
    // Test database connection
    await db.$connect()
    
    // Test a simple query
    const activityCount = await db.activity.count()
    
    await db.$disconnect()
    
    return NextResponse.json({ 
      status: "healthy",
      database: "connected",
      activitiesCount: activityCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error)
    
    try {
      await db.$disconnect()
    } catch (e) {
      // Ignore disconnect errors
    }
    
    return NextResponse.json({ 
      status: "unhealthy",
      database: "disconnected",
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}