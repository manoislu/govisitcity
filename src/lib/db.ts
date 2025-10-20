// Solution simple : utiliser une base de données en mémoire pour le développement
import { PrismaClient } from '@prisma/client'

let db: PrismaClient

declare global {
  var __db__: PrismaClient
}

if (process.env.NODE_ENV === 'production') {
  db = new PrismaClient()
} else {
  if (!global.__db__) {
    // Pour le développement, on utilise une base de données PostgreSQL locale
    // Si elle n'existe pas, l'application ne pourra pas se lancer
    db = new PrismaClient()
    global.__db__ = db
  } else {
    db = global.__db__
  }
}

export { db }