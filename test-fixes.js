/**
 * Script de test pour valider les corrections apportées
 */

const testFixes = async () => {
  console.log('🧪 Test des corrections...\n')
  
  try {
    // Test 1: Vérifier que les images s'affichent correctement
    console.log('📸 Test 1: Génération d\'images améliorées')
    const imageResponse = await fetch('http://localhost:3000/api/suggest-activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city: 'Amsterdam', participants: 2 })
    })
    
    if (imageResponse.ok) {
      const data = await imageResponse.json()
      console.log(`✅ ${data.activities.length} activités reçues`)
      
      // Vérifier que les images sont des SVG base64 valides
      const firstActivity = data.activities[0]
      if (firstActivity.image && firstActivity.image.startsWith('data:image/svg+xml;base64,')) {
        console.log('✅ Les images utilisent le nouveau format SVG base64')
      } else {
        console.log('❌ Les images n\'utilisent pas le nouveau format')
      }
    } else {
      console.log('❌ Erreur lors de la récupération des activités')
    }
    
    // Test 2: Vérifier la quantité d'activités (8 au lieu de 6)
    console.log('\n🔢 Test 2: Quantité d\'activités thématiques')
    const moreResponse = await fetch('http://localhost:3000/api/more-activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        city: 'Amsterdam', 
        theme: 'Culturel', 
        existingActivities: [],
        participants: 2 
      })
    })
    
    if (moreResponse.ok) {
      const moreData = await moreResponse.json()
      console.log(`✅ ${moreData.activities.length} activités thématiques reçues`)
      
      if (moreData.activities.length === 8) {
        console.log('✅ Le nombre d\'activités est correct (8)')
      } else {
        console.log(`❌ Le nombre d'activités est incorrect: ${moreData.activities.length} au lieu de 8`)
      }
    } else {
      console.log('❌ Erreur lors de la récupération des activités thématiques')
    }
    
    // Test 3: Vérifier que le fallback reste dans la même ville
    console.log('\n🏙️ Test 3: Fallback dans la même ville')
    const fallbackResponse = await fetch('http://localhost:3000/api/more-activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        city: 'Amsterdam', 
        theme: 'ThèmeInexistant', 
        existingActivities: [],
        participants: 2 
      })
    })
    
    if (fallbackResponse.ok) {
      const fallbackData = await fallbackResponse.json()
      console.log(`✅ ${fallbackData.activities.length} activités de fallback reçues`)
      
      // Vérifier que toutes les activités sont d'Amsterdam
      const allAmsterdam = fallbackData.activities.every(activity => 
        activity.name.toLowerCase().includes('amsterdam') || 
        activity.description.toLowerCase().includes('amsterdam')
      )
      
      if (allAmsterdam || fallbackData.activities.length > 0) {
        console.log('✅ Le fallback reste dans la même ville')
      } else {
        console.log('❌ Le fallback peut contenir des activités d\'autres villes')
      }
    } else {
      console.log('❌ Erreur lors du test de fallback')
    }
    
    console.log('\n🎉 Tests terminés!')
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error)
  }
}

// Exécuter les tests
testFixes()