import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }
  
  // Ensure the URL is absolute
  if (url.startsWith('file:./')) {
    const absolutePath = url.replace('file:./', `${process.cwd()}/`)
    return `file:${absolutePath}`
  }
  
  return url
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
    datasources: {
      db: {
        url: getDatabaseUrl()
      }
    }
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}

// Test connection function
export const testDatabaseConnection = async () => {
  try {
    await db.$connect()
    await db.$queryRaw`SELECT 1`
    await db.$disconnect()
    return true
  } catch (error) {
    console.error('Database connection test failed:', error)
    try {
      await db.$disconnect()
    } catch (e) {
      // Ignore disconnect errors
    }
    return false
  }
}