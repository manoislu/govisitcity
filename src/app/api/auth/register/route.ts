import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, password } = await request.json()

    // Validation des entrées
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'Tous les champs sont obligatoires' },
        { status: 400 }
      )
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Adresse e-mail invalide' },
        { status: 400 }
      )
    }

    // Validation du mot de passe
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      )
    }

    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 1 majuscule' },
        { status: 400 }
      )
    }

    if (!/\d/.test(password)) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 1 chiffre' },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un compte avec cette adresse e-mail existe déjà' },
        { status: 409 }
      )
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Créer l'utilisateur
    const user = await db.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email,
        password: hashedPassword
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      message: 'Compte créé avec succès',
      user
    })

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création du compte' },
      { status: 500 }
    )
  }
}