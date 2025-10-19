/**
 * Générateur d'images réelles pour les activités
 * Utilise l'API z-ai-web-dev-sdk pour générer de vraies photos des lieux et activités
 */

import ZAI from 'z-ai-web-dev-sdk'

export async function generateActivityImage(activityName: string, category: string, city: string): Promise<string> {
  try {
    console.log(`🖼️ Génération d'image pour: ${activityName} à ${city} (catégorie: ${category})`)
    
    const zai = await ZAI.create()
    
    // Créer un prompt plus spécifique et efficace pour générer une photo réaliste
    const prompt = `Beautiful professional photograph of "${activityName}" in ${city}, ${category} activity. 
    Style: Realistic travel photography, natural lighting, high resolution, no text, no watermarks.
    Subject: Clear view of the actual place or activity, recognizable landmark or scene.
    Quality: National Geographic style photography, vibrant colors, sharp details.`
    
    console.log(`📝 Prompt: ${prompt}`)
    
    const response = await zai.images.generations.create({
      prompt: prompt,
      size: '1024x1024'
    })
    
    console.log(`📡 API Response received:`, {
      hasData: !!response.data,
      dataLength: response.data?.length,
      hasBase64: !!response.data?.[0]?.base64,
      base64Length: response.data?.[0]?.base64?.length
    })
    
    if (response.data && response.data[0] && response.data[0].base64) {
      console.log(`✅ Image générée avec succès pour: ${activityName} (${response.data[0].base64.length} caractères)`)
      return `data:image/png;base64,${response.data[0].base64}`
    } else {
      console.error(`❌ Réponse API invalide:`, JSON.stringify(response, null, 2))
      throw new Error('Réponse API invalide - pas de données d\'image')
    }
    
  } catch (error) {
    console.error(`❌ Erreur détaillée lors de la génération d'image pour ${activityName}:`, {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    // Fallback: générer une image placeholder simple
    console.log(`🔄 Utilisation du fallback SVG pour: ${activityName}`)
    return generatePlaceholderImage(activityName, city)
  }
}

/**
 * Génère une image placeholder avec une couleur aléatoire (fallback)
 */
export function generatePlaceholderImage(activityName: string, city: string): string {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F']
  const color = colors[Math.floor(Math.random() * colors.length)]
  
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="${color}"/>
  <text x="200" y="120" text-anchor="middle" font-family="Arial" font-size="24" font-weight="bold" fill="white">
    ${city}
  </text>
  <text x="200" y="160" text-anchor="middle" font-family="Arial" font-size="16" fill="white">
    ${activityName.substring(0, 40)}
  </text>
</svg>
  `.trim()
  
  const base64 = Buffer.from(svg, 'utf8').toString('base64')
  return `data:image/svg+xml;base64,${base64}`
}

/**
 * Génère des images en lot pour plusieurs activités (avec gestion des erreurs)
 */
export async function generateBatchActivityImages(activities: Array<{name: string, category: string, city: string}>): Promise<Array<{name: string, image: string}>> {
  const results = []
  
  for (const activity of activities) {
    try {
      const image = await generateActivityImage(activity.name, activity.category, activity.city)
      results.push({ name: activity.name, image })
      
      // Petit délai pour éviter de surcharger l'API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      console.error(`❌ Erreur pour ${activity.name}:`, error)
      results.push({ 
        name: activity.name, 
        image: generatePlaceholderImage(activity.name, activity.city) 
      })
    }
  }
  
  return results
}