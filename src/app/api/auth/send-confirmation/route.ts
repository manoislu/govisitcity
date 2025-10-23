import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    }

    // Générer un token de confirmation
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h

    // TODO: Sauvegarder le token en base de données
    // await db.emailVerification.create({
    //   data: {
    //     email,
    //     token,
    //     expiresAt
    //   }
    // })

    const confirmationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`

    const { data, error } = await resend.emails.send({
      from: 'GoVisitCity <noreply@govisitcity.com>',
      to: [email],
      subject: 'Confirmez votre adresse email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 20px;">
            <img src="${process.env.NEXTAUTH_URL}/govisitcity-logo.png" alt="GoVisitCity" style="height: 60px;">
          </div>
          
          <h2 style="color: #333; margin-bottom: 20px;">Bienvenue ${name || ''} !</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Merci de vous être inscrit sur GoVisitCity. Pour finaliser votre inscription, 
            veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Confirmer mon email
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            Ce lien expirera dans 24 heures. Si vous n'avez pas créé de compte, 
            vous pouvez ignorer cet email.
          </p>
          
          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            Ou copiez-collez ce lien : ${confirmationUrl}
          </p>
        </div>
      `
    })

    if (error) {
      console.error('Erreur Resend:', error)
      return NextResponse.json({ error: 'Erreur envoi email' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Email de confirmation envoyé',
      data 
    })

  } catch (error) {
    console.error('Erreur send-confirmation:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}