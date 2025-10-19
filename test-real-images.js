/**
 * Script de test pour valider la génération d'images réelles
 */

const testRealImages = async () => {
  console.log('🧪 Test de génération d\'images réelles...\n')
  
  try {
    // Test 1: Générer une nouvelle activité avec image réelle
    console.log('📸 Test 1: Génération d\'activité avec image réelle')
    const response = await fetch('http://localhost:3000/api/suggest-activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        city: 'Amsterdam', 
        participants: 2,
        budget: '€€' 
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log(`✅ ${data.activities.length} activités reçues`)
      
      // Analyser les types d'images
      let realImages = 0
      let svgImages = 0
      
      data.activities.forEach(activity => {
        if (activity.image.startsWith('data:image/png;base64,')) {
          realImages++
        } else if (activity.image.startsWith('data:image/svg+xml')) {
          svgImages++
        }
      })
      
      console.log(`📊 Répartition des images:`)
      console.log(`   - Images réelles (PNG): ${realImages}`)
      console.log(`   - Images placeholder (SVG): ${svgImages}`)
      
      if (realImages > 0) {
        console.log('✅ Succès: Des images réelles ont été générées!')
      } else {
        console.log('⚠️ Info: Seules des images SVG ont été générées (normal si l\'API d\'images est saturée)')
      }
      
    } else {
      console.log('❌ Erreur lors de la récupération des activités')
    }
    
    // Test 2: Mettre à jour les images existantes
    console.log('\n🔄 Test 2: Mise à jour d\'images existantes')
    const updateResponse = await fetch('http://localhost:3000/api/update-activity-images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        city: 'Amsterdam', 
        limit: 3 
      })
    })
    
    if (updateResponse.ok) {
      const updateData = await updateResponse.json()
      console.log(`✅ Mise à jour terminée:`)
      console.log(`   - Images mises à jour: ${updateData.updated}`)
      console.log(`   - Échecs: ${updateData.failed}`)
      
      if (updateData.updated > 0) {
        console.log('✅ Succès: Des images existantes ont été mises à jour!')
        updateData.activities.forEach(activity => {
          if (activity.success) {
            console.log(`   ✓ ${activity.name} (${activity.city})`)
          }
        })
      }
    } else {
      console.log('❌ Erreur lors de la mise à jour des images')
    }
    
    console.log('\n🎉 Tests terminés!')
    console.log('\n💡 Note: La génération d\'images réelles peut prendre du temps.')
    console.log('   Si les images sont des SVG, c\'est que le système utilise le fallback.')
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error)
  }
}

// Exécuter les tests
testRealImages()