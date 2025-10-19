/**
 * Script pour mettre à jour les activités de Londres
 */

const updateLondonImages = async () => {
  console.log('📍 Mise à jour des activités de Londres avec de vraies photos...\n')
  
  try {
    const response = await fetch('http://localhost:3000/api/update-activity-images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        city: 'Londres', 
        limit: 8 
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log(`✅ Résultats pour Londres:`)
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
      
      console.log('\n🎉 Mise à jour de Londres terminée!')
      
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
updateLondonImages()