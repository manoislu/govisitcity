import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validation des entrées
    if (!email || !password) {
      return NextResponse.json(
        { error: 'L\'email et le mot de passe sont obligatoires' },
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

    // Rechercher l'utilisateur
    const user = await db.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Aucun compte trouvé avec cette adresse e-mail' },
        { status: 401 }
      )
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Retourner les informations de l'utilisateur (sans le mot de passe)
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    }

    return NextResponse.json({
      message: 'Connexion réussie',
      user: userResponse
    })

  } catch (error) {
    console.error('Erreur lors de la connexion:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la connexion' },
      { status: 500 }
    )
  }
}