/**
 * Script pour mettre à jour toutes les activités avec de vraies photos
 */

const updateAllImages = async () => {
  console.log('🖼️ Début de la mise à jour de toutes les images...\n')
  
  try {
    // Mettre à jour Amsterdam en premier (8 activités)
    console.log('📍 Mise à jour des activités d\'Amsterdam...')
    const amsterdamResponse = await fetch('http://localhost:3000/api/update-activity-images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        city: 'Amsterdam', 
        limit: 10 
      })
    })
    
    if (amsterdamResponse.ok) {
      const amsterdamData = await amsterdamResponse.json()
      console.log(`✅ Amsterdam: ${amsterdamData.updated} images mises à jour, ${amsterdamData.failed} échecs`)
      
      amsterdamData.activities.forEach(activity => {
        if (activity.success) {
          console.log(`   ✓ ${activity.name}`)
        } else {
          console.log(`   ❌ ${activity.name} - ${activity.error}`)
        }
      })
    } else {
      console.log('❌ Erreur pour Amsterdam:', await amsterdamResponse.text())
    }
    
    // Attendre un peu entre les villes
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Mettre à jour Paris (9 activités)
    console.log('\n📍 Mise à jour des activités de Paris...')
    const parisResponse = await fetch('http://localhost:3000/api/update-activity-images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        city: 'Paris', 
        limit: 10 
      })
    })
    
    if (parisResponse.ok) {
      const parisData = await parisResponse.json()
      console.log(`✅ Paris: ${parisData.updated} images mises à jour, ${parisData.failed} échecs`)
      
      parisData.activities.forEach(activity => {
        if (activity.success) {
          console.log(`   ✓ ${activity.name}`)
        } else {
          console.log(`   ❌ ${activity.name} - ${activity.error}`)
        }
      })
    } else {
      console.log('❌ Erreur pour Paris:', await parisResponse.text())
    }
    
    // Attendre un peu entre les villes
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Mettre à jour Londres (14 activités - en deux fois)
    console.log('\n📍 Mise à jour des activités de Londres (partie 1)...')
    const londres1Response = await fetch('http://localhost:3000/api/update-activity-images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        city: 'Londres', 
        limit: 8 
      })
    })
    
    if (londres1Response.ok) {
      const londres1Data = await londres1Response.json()
      console.log(`✅ Londres (1/2): ${londres1Data.updated} images mises à jour, ${londres1Data.failed} échecs`)
      
      londres1Data.activities.forEach(activity => {
        if (activity.success) {
          console.log(`   ✓ ${activity.name}`)
        } else {
          console.log(`   ❌ ${activity.name} - ${activity.error}`)
        }
      })
    } else {
      console.log('❌ Erreur pour Londres (1/2):', await londres1Response.text())
    }
    
    // Attendre un peu
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    console.log('\n📍 Mise à jour des activités de Londres (partie 2)...')
    const londres2Response = await fetch('http://localhost:3000/api/update-activity-images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        city: 'Londres', 
        limit: 8 
      })
    })
    
    if (londres2Response.ok) {
      const londres2Data = await londres2Response.json()
      console.log(`✅ Londres (2/2): ${londres2Data.updated} images mises à jour, ${londres2Data.failed} échecs`)
      
      londres2Data.activities.forEach(activity => {
        if (activity.success) {
          console.log(`   ✓ ${activity.name}`)
        } else {
          console.log(`   ❌ ${activity.name} - ${activity.error}`)
        }
      })
    } else {
      console.log('❌ Erreur pour Londres (2/2):', await londres2Response.text())
    }
    
    // Mettre à jour les autres villes
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    console.log('\n📍 Mise à jour des activités de Marseille...')
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
    } else {
      console.log('❌ Erreur pour Marseille:', await marseilleResponse.text())
    }
    
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    console.log('\n📍 Mise à jour des activités de Lyon...')
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
    } else {
      console.log('❌ Erreur pour Lyon:', await lyonResponse.text())
    }
    
    console.log('\n🎉 Mise à jour terminée!')
    console.log('Vérification des résultats dans 5 secondes...')
    
    // Vérifier les résultats après 5 secondes
    setTimeout(async () => {
      console.log('\n🔍 Vérification des résultats...')
      const { execSync } = require('child_process')
      try {
        execSync('node check-database.js', { stdio: 'inherit' })
      } catch (error) {
        console.log('❌ Erreur lors de la vérification:', error.message)
      }
    }, 5000)
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error)
  }
}

// Exécuter la mise à jour
updateAllImages()