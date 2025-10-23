import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Validation des entrées
    if (!email) {
      return NextResponse.json(
        { error: 'L\'adresse e-mail est obligatoire' },
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

    // Vérifier si l'utilisateur existe
    const user = await db.user.findUnique({
      where: { email }
    })

    // Pour des raisons de sécurité, on ne révèle pas si l'email existe ou non
    // On simule toujours l'envoi d'un email
    if (user) {
      // Générer un token de réinitialisation sécurisé
      const resetToken = crypto.randomBytes(32).toString('hex')
      const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 heure
      
      // TODO: Sauvegarder le token dans la base de données
      // Pour l'instant, nous le simulons
      
      // Créer le lien de réinitialisation
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? process.env.NEXT_PUBLIC_APP_URL || 'https://govisitcity.com'
        : 'http://localhost:3000'
      
      const resetLink = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`
      
      console.log(`🔑 Token de réinitialisation généré pour ${email}: ${resetToken}`)
      console.log(`🔗 Lien de réinitialisation: ${resetLink}`)
      
      // TODO: Implémenter l'envoi d'email réel avec un service comme SendGrid, Nodemailer, etc.
      // Pour l'instant, nous retournons le lien pour le développement
      
      return NextResponse.json({
        message: 'Si un compte existe avec cette adresse e-mail, un lien de réinitialisation a été envoyé.',
        // En développement, retourner le lien pour faciliter les tests
        ...(process.env.NODE_ENV !== 'production' && {
          resetLink,
          resetToken,
          debugInfo: {
            email,
            tokenExpiry: resetTokenExpiry.toISOString(),
            environment: process.env.NODE_ENV
          }
        })
      })
    }

    // Si l'utilisateur n'existe pas, retourner un message générique
    return NextResponse.json({
      message: 'Si un compte existe avec cette adresse e-mail, un lien de réinitialisation a été envoyé.'
    })

  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'envoi de l\'email de réinitialisation' },
      { status: 500 }
    )
  }
}