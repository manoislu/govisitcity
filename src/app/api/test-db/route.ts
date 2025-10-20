import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    console.log('🔍 Testing database connection...')
    
    // Test simple connection
    await db.$connect()
    console.log('✅ Database connected successfully')
    
    // Test simple query
    const count = await db.activity.count()
    console.log(`✅ Database query successful: ${count} activities found`)
    
    // Test environment variables
    const dbUrl = process.env.DATABASE_URL
    const nodeEnv = process.env.NODE_ENV
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      activityCount: count,
      environment: {
        NODE_ENV: nodeEnv,
        DATABASE_URL_SET: !!dbUrl,
        DATABASE_URL_PREFIX: dbUrl?.split('://')[0],
        DATABASE_URL_HOST: dbUrl?.split('@')[1]?.split('/')[0]
      }
    })
    
  } catch (error) {
    console.error('💥 Database connection failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL_SET: !!process.env.DATABASE_URL,
        DATABASE_URL_PREFIX: process.env.DATABASE_URL?.split('://')[0]
      }
    }, { status: 500 })
  } finally {
    await db.$disconnect()
  }
}