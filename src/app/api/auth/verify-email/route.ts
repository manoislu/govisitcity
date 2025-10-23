import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 400 })
    }

    // TODO: Vérifier le token en base de données
    // const verification = await db.emailVerification.findUnique({
    //   where: { token }
    // })

    // if (!verification || verification.expiresAt < new Date()) {
    //   return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 400 })
    // }

    // TODO: Marquer l'email comme vérifié
    // await db.user.update({
    //   where: { email: verification.email },
    //   data: { emailVerified: new Date() }
    // })

    // TODO: Supprimer le token
    // await db.emailVerification.delete({
    //   where: { token }
    // })

    // Pour l'instant, on simule le succès
    return NextResponse.json({ 
      success: true, 
      message: 'Email vérifié avec succès' 
    })

  } catch (error) {
    console.error('Erreur verify-email:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}