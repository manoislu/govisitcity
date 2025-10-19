/**
 * Script pour mettre à jour les activités de Marseille et Lyon
 */

const updateMarseilleLyonImages = async () => {
  console.log('📍 Mise à jour des activités de Marseille et Lyon avec de vraies photos...\n')
  
  try {
    // Marseille d'abord
    console.log('🌊 Mise à jour de Marseille...')
    const marseilleResponse = await fetch('http://localhost:3000/api/update-activity-images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        city: 'Marseille', 
        limit: 6 
      })
    })
    
    if (marseilleResponse.ok) {
      const marseilleData = await marseilleResponse.json()
      console.log(`✅ Marseille: ${marseilleData.updated} images mises à jour, ${marseilleData.failed} échecs`)
      
      marseilleData.activities.forEach((activity, index) => {
        if (activity.success) {
          console.log(`   ${index + 1}. ✅ ${activity.name}`)
        } else {
          console.log(`   ${index + 1}. ❌ ${activity.name} - ${activity.error || 'Erreur inconnue'}`)
        }
      })
    } else {
      console.log('❌ Erreur pour Marseille:', await marseilleResponse.text())
    }
    
    // Attendre un peu
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Lyon ensuite
    console.log('\n🦁 Mise à jour de Lyon...')
    const lyonResponse = await fetch('http://localhost:3000/api/update-activity-images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        city: 'Lyon', 
        limit: 6 
      })
    })
    
    if (lyonResponse.ok) {
      const lyonData = await lyonResponse.json()
      console.log(`✅ Lyon: ${lyonData.updated} images mises à jour, ${lyonData.failed} échecs`)
      
      lyonData.activities.forEach((activity, index) => {
        if (activity.success) {
          console.log(`   ${index + 1}. ✅ ${activity.name}`)
        } else {
          console.log(`   ${index + 1}. ❌ ${activity.name} - ${activity.error || 'Erreur inconnue'}`)
        }
      })
    } else {
      console.log('❌ Erreur pour Lyon:', await lyonResponse.text())
    }
    
    console.log('\n🎉 Mise à jour terminée!')
    
    // Vérification finale
    console.log('\n🔍 Vérification finale des résultats...')
    setTimeout(() => {
      const { execSync } = require('child_process')
      try {
        execSync('node check-database.js', { stdio: 'inherit' })
      } catch (error) {
        console.log('❌ Erreur lors de la vérification:', error.message)
      }
    }, 3000)
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error)
  }
}

// Exécuter la mise à jour
updateMarseilleLyonImages()