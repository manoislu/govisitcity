/**
 * Script pour mettre à jour uniquement les activités d'Amsterdam
 */

const updateAmsterdamImages = async () => {
  console.log('📍 Mise à jour des activités d\'Amsterdam avec de vraies photos...\n')
  
  try {
    const response = await fetch('http://localhost:3000/api/update-activity-images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        city: 'Amsterdam', 
        limit: 8 
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log(`✅ Résultats pour Amsterdam:`)
      console.log(`   - Images mises à jour: ${data.updated}`)
      console.log(`   - Échecs: ${data.failed}`)
      console.log(`   - Total traitées: ${data.activities.length}\n`)
      
      console.log('📋 Détail des activités:')
      data.activities.forEach((activity, index) => {
        if (activity.success) {
          console.log(`   ${index + 1}. ✅ ${activity.name}`)
        } else {
          console.log(`   ${index + 1}. ❌ ${activity.name} - ${activity.error || 'Erreur inconnue'}`)
        }
      })
      
      console.log('\n🎉 Mise à jour d\'Amsterdam terminée!')
      
      // Vérifier les résultats
      console.log('\n🔍 Vérification des résultats...')
      setTimeout(() => {
        const { execSync } = require('child_process')
        try {
          execSync('node check-database.js', { stdio: 'inherit' })
        } catch (error) {
          console.log('❌ Erreur lors de la vérification:', error.message)
        }
      }, 2000)
      
    } else {
      console.log('❌ Erreur lors de la requête:', response.status, response.statusText)
      const errorText = await response.text()
      console.log('Détail de l\'erreur:', errorText)
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error)
  }
}

// Exécuter la mise à jour
updateAmsterdamImages()