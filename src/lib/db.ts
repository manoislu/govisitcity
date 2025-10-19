import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL
  if (!url) {
    // En développement, utiliser un chemin par défaut
    if (process.env.NODE_ENV === 'development') {
      return 'file:./db/custom.db'
    }
    // En production, lever une erreur plus claire
    throw new Error('DATABASE_URL is not set. Please configure your environment variables.')
  }
  
  // Ensure the URL is absolute
  if (url.startsWith('file:./')) {
    const absolutePath = url.replace('file:./', `${process.cwd()}/`)
    return `file:${absolutePath}`
  }
  
  return url
}

// Créer le client Prisma uniquement si DATABASE_URL est disponible
const createPrismaClient = () => {
  try {
    const databaseUrl = getDatabaseUrl()
    return new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl
        }
      }
    })
  } catch (error) {
    console.error('Failed to create Prisma client:', error)
    return null
  }
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production' && db) {
  globalForPrisma.prisma = db
}

// Test connection function
export const testDatabaseConnection = async () => {
  if (!db) {
    return false
  }
  
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

// Export a function to check if database is available
export const isDatabaseAvailable = () => {
  return db !== null
}