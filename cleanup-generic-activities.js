/**
 * Script pour nettoyer les activités génériques et forcer la régénération
 */

const { PrismaClient } = require('@prisma/client')

const cleanupGenericActivities = async () => {
  const db = new PrismaClient()
  
  try {
    console.log('🧹 Nettoyage des activités génériques...\n')
    
    // Récupérer toutes les activités
    const allActivities = await db.activities.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        city: true,
        category: true,
        theme: true
      }
    })
    
    console.log(`📊 Total d'activités: ${allActivities.length}`)
    
    // Identifier les activités génériques (qui ne mentionnent pas leur ville dans le nom)
    const genericActivities = allActivities.filter(activity => {
      const activityName = activity.name.toLowerCase()
      const cityName = activity.city.toLowerCase()
      
      // Vérifier si le nom de l'activité mentionne la ville ou un lieu spécifique
      const mentionsCity = activityName.includes(cityName) || 
                          activityName.includes('amsterdam') || 
                          activityName.includes('paris') || 
                          activityName.includes('londres') || 
                          activityName.includes('marseille') || 
                          activityName.includes('lyon') || 
                          activityName.includes('barcelone') ||
                          activityName.includes('sagrada') ||
                          activityName.includes('rijksmuseum') ||
                          activityName.includes('van gogh') ||
                          activityName.includes('notre-dame') ||
                          activityName.includes('vondelpark') ||
                          activityName.includes('eiffel') ||
                          activityName.includes('louvre') ||
                          activityName.includes('tower') ||
                          activityName.includes('big ben') ||
                          activityName.includes('canal')
      
      return !mentionsCity
    })
    
    console.log(`🎯 Activités génériques identifiées: ${genericActivities.length}`)
    
    if (genericActivities.length > 0) {
      console.log('\n📋 Liste des activités génériques à supprimer:')
      genericActivities.forEach((activity, index) => {
        console.log(`   ${index + 1}. ${activity.name} (${activity.city})`)
      })
      
      // Supprimer les activités génériques
      console.log('\n🗑️ Suppression des activités génériques...')
      
      for (const activity of genericActivities) {
        await db.activities.delete({
          where: { id: activity.id }
        })
        console.log(`   ❌ Supprimé: ${activity.name}`)
      }
      
      console.log(`\n✅ ${genericActivities.length} activités génériques supprimées`)
      
      // Afficher le nouvel état
      const remainingActivities = await db.activities.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          city: true
        }
      })
      
      console.log(`\n📊 Activités restantes: ${remainingActivities.length}`)
      console.log('\n📋 Activités restantes (toutes spécifiques à leur ville):')
      remainingActivities.forEach((activity, index) => {
        console.log(`   ${index + 1}. ${activity.name} (${activity.city})`)
      })
      
    } else {
      console.log('✅ Aucune activité générique trouvée!')
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error)
  } finally {
    await db.$disconnect()
  }
}

cleanupGenericActivities()