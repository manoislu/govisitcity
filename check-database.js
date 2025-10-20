/**
 * Script pour vérifier l'état actuel des activités dans la base de données
 */

const { PrismaClient } = require('@prisma/client')

const checkDatabase = async () => {
  const db = new PrismaClient()
  
  try {
    console.log('🔍 Vérification de la base de données...\n')
    
    // Récupérer toutes les activités actives
    const activities = await db.activities.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        city: true,
        category: true,
        image: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`📊 Total d'activités: ${activities.length}\n`)
    
    // Analyser les types d'images
    let realImages = 0
    let svgImages = 0
    let noImages = 0
    
    const cityStats = {}
    
    activities.forEach(activity => {
      // Statistiques par ville
      if (!cityStats[activity.city]) {
        cityStats[activity.city] = { total: 0, real: 0, svg: 0 }
      }
      cityStats[activity.city].total++
      
      // Analyser le type d'image
      if (!activity.image) {
        noImages++
      } else if (activity.image.startsWith('data:image/png;base64,')) {
        realImages++
        cityStats[activity.city].real++
      } else if (activity.image.startsWith('data:image/svg+xml')) {
        svgImages++
        cityStats[activity.city].svg++
      }
    })
    
    console.log('📈 Répartition des images:')
    console.log(`   - Photos réelles (PNG): ${realImages}`)
    console.log(`   - Images SVG: ${svgImages}`)
    console.log(`   - Pas d'image: ${noImages}\n`)
    
    console.log('🏙️ Statistiques par ville:')
    Object.entries(cityStats).forEach(([city, stats]) => {
      const realPercentage = stats.total > 0 ? Math.round((stats.real / stats.total) * 100) : 0
      console.log(`   ${city}: ${stats.total} activités (${stats.real} photos réelles, ${stats.svg} SVG) - ${realPercentage}% photos réelles`)
    })
    
    // Afficher les 10 activités les plus récentes avec leur type d'image
    console.log('\n🕐 10 activités les plus récentes:')
    activities.slice(0, 10).forEach((activity, index) => {
      let imageType = '❌ Pas d\'image'
      if (activity.image) {
        if (activity.image.startsWith('data:image/png;base64,')) {
          imageType = '📸 Photo réelle'
        } else if (activity.image.startsWith('data:image/svg+xml')) {
          imageType = '🎨 SVG'
        }
      }
      console.log(`   ${index + 1}. ${activity.name} (${activity.city}) - ${imageType}`)
    })
    
    // Identifier les activités qui ont besoin d'être mises à jour
    const activitiesToUpdate = activities.filter(activity => 
      !activity.image || !activity.image.startsWith('data:image/png;base64,')
    )
    
    console.log(`\n🔄 Activités à mettre à jour: ${activitiesToUpdate.length}`)
    
    if (activitiesToUpdate.length > 0) {
      console.log('\n📋 Liste des activités à mettre à jour:')
      activitiesToUpdate.slice(0, 20).forEach((activity, index) => {
        console.log(`   ${index + 1}. ${activity.name} (${activity.city})`)
      })
      
      if (activitiesToUpdate.length > 20) {
        console.log(`   ... et ${activitiesToUpdate.length - 20} autres`)
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error)
  } finally {
    await db.$disconnect()
  }
}

checkDatabase()