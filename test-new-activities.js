/**
 * Script pour tester que les nouvelles activités génèrent bien des photos réelles
 */

const testNewActivities = async () => {
  console.log('🧪 Test de génération de nouvelles activités avec photos réelles...\n')
  
  try {
    // Test 1: Générer des activités pour une nouvelle ville
    console.log('🏙️ Test 1: Génération d\'activités pour Barcelone...')
    const barcelonaResponse = await fetch('http://localhost:3000/api/suggest-activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        city: 'Barcelone', 
        participants: 2,
        budget: '€€' 
      })
    })
    
    if (barcelonaResponse.ok) {
      const barcelonaData = await barcelonaResponse.json()
      console.log(`✅ Barcelone: ${barcelonaData.activities.length} activités générées`)
      
      // Vérifier les types d'images
      let realImages = 0
      let svgImages = 0
      
      barcelonaData.activities.forEach(activity => {
        if (activity.image && activity.image.startsWith('data:image/png;base64,')) {
          realImages++
        } else if (activity.image && activity.image.startsWith('data:image/svg+xml')) {
          svgImages++
        }
      })
      
      console.log(`   - Photos réelles: ${realImages}`)
      console.log(`   - Images SVG: ${svgImages}`)
      
      if (realImages > 0) {
        console.log('   ✅ SUCCÈS: Des photos réelles ont été générées!')
      } else {
        console.log('   ⚠️ INFO: Uniquement des SVG (normal si l\'API est saturée)')
      }
      
    } else {
      console.log('❌ Erreur pour Barcelone:', await barcelonaResponse.text())
    }
    
    // Attendre un peu
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Test 2: Générer des activités thématiques pour Amsterdam
    console.log('\n🎨 Test 2: Génération d\'activités culturelles pour Amsterdam...')
    const amsterdamResponse = await fetch('http://localhost:3000/api/more-activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        city: 'Amsterdam', 
        theme: 'Culturel', 
        existingActivities: [],
        participants: 2 
      })
    })
    
    if (amsterdamResponse.ok) {
      const amsterdamData = await amsterdamResponse.json()
      console.log(`✅ Amsterdam Culturel: ${amsterdamData.activities.length} activités générées`)
      
      // Vérifier les types d'images
      let realImages = 0
      let svgImages = 0
      
      amsterdamData.activities.forEach(activity => {
        if (activity.image && activity.image.startsWith('data:image/png;base64,')) {
          realImages++
        } else if (activity.image && activity.image.startsWith('data:image/svg+xml')) {
          svgImages++
        }
      })
      
      console.log(`   - Photos réelles: ${realImages}`)
      console.log(`   - Images SVG: ${svgImages}`)
      
      if (realImages > 0) {
        console.log('   ✅ SUCCÈS: Des photos réelles ont été générées!')
      } else {
        console.log('   ⚠️ INFO: Uniquement des SVG (normal si l\'API est saturée)')
      }
      
    } else {
      console.log('❌ Erreur pour Amsterdam Culturel:', await amsterdamResponse.text())
    }
    
    // Test 3: Vérifier l'état final de la base de données
    console.log('\n📊 Test 3: Vérification finale de la base de données...')
    setTimeout(() => {
      const { execSync } = require('child_process')
      try {
        execSync('node check-database.js', { stdio: 'inherit' })
      } catch (error) {
        console.log('❌ Erreur lors de la vérification:', error.message)
      }
    }, 2000)
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  }
}

// Exécuter le test
testNewActivities()