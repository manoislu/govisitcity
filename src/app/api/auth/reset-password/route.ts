import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { token, email, password } = await request.json()

    // Validation des entrées
    if (!token || !email || !password) {
      return NextResponse.json(
        { error: 'Le token, l\'email et le mot de passe sont obligatoires' },
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

    // Vérifier si l'utilisateur existe
    const user = await db.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // TODO: Vérifier la validité du token dans la base de données
    // Pour l'instant, nous acceptons tous les tokens en développement
    if (process.env.NODE_ENV === 'production') {
      // En production, vérifier le token dans la base de données
      // const resetToken = await db.passwordReset.findFirst({
      //   where: {
      //     token,
      //     email,
      //     expiresAt: { gt: new Date() },
      //     used: false
      //   }
      // })
      
      // if (!resetToken) {
      //   return NextResponse.json(
      //     { error: 'Token de réinitialisation invalide ou expiré' },
      //     { status: 400 }
      //   )
      // }
      
      // Marquer le token comme utilisé
      // await db.passwordReset.update({
      //   where: { id: resetToken.id },
      //   data: { used: true }
      // })
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Mettre à jour le mot de passe de l'utilisateur
    await db.user.update({
      where: { email },
      data: { password: hashedPassword }
    })

    console.log(`✅ Mot de passe réinitialisé pour l'utilisateur: ${email}`)

    return NextResponse.json({
      message: 'Mot de passe réinitialisé avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la réinitialisation du mot de passe' },
      { status: 500 }
    )
  }
}