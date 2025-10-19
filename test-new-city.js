/**
 * Script pour tester la génération d'activités pour une nouvelle ville
 */

const testNewCity = async () => {
  console.log('🧪 Test de génération pour une nouvelle ville...\n')
  
  try {
    // Test avec Rome
    console.log('🏛️ Test: Génération d\'activités pour Rome...')
    const romeResponse = await fetch('http://localhost:3000/api/suggest-activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        city: 'Rome', 
        participants: 2,
        budget: '€€' 
      })
    })
    
    if (romeResponse.ok) {
      const romeData = await romeResponse.json()
      console.log(`✅ Rome: ${romeData.activities.length} activités générées`)
      
      // Vérifier que toutes les activités sont bien de Rome
      let romeCount = 0
      let otherCities = []
      
      romeData.activities.forEach(activity => {
        const activityText = (activity.name + ' ' + (activity.description || '')).toLowerCase()
        if (activityText.includes('rome') || 
            activityText.includes('italie') || 
            activityText.includes('colisée') ||
            activityText.includes('vatican') ||
            activityText.includes('trevi') ||
            activityText.includes('forum') ||
            activityText.includes('panthéon') ||
            activityText.includes('saint-pierre') ||
            activityText.includes('chapelle sixtine')) {
          romeCount++
        } else {
          otherCities.push(activity.name)
        }
      })
      
      console.log(`   - Activités de Rome: ${romeCount}`)
      console.log(`   - Activités suspectes: ${otherCities.length}`)
      
      if (otherCities.length > 0) {
        console.log('   ❌ PROBLÈME: Activités qui ne semblent pas être de Rome:')
        otherCities.forEach(name => console.log(`      - ${name}`))
      } else {
        console.log('   ✅ OK: Toutes les activités sont spécifiques à Rome!')
      }
      
      // Afficher quelques exemples
      console.log('\n📋 Exemples d\'activités générées:')
      romeData.activities.slice(0, 3).forEach((activity, index) => {
        console.log(`   ${index + 1}. ${activity.name}`)
        console.log(`      ${activity.description}`)
      })
      
    } else {
      console.log('❌ Erreur pour Rome:', await romeResponse.text())
    }
    
    // Attendre un peu
    await new Promise(resolve => setTimeout(resolve, 2000))
    
      // Test avec "plus d'activités" pour Rome
    console.log('\n🎨 Test: Plus d\'activités pour Rome (thème Culturel)...')
    
    // Récupérer d'abord les activités de Rome
    let romeActivities = []
    try {
      const romeResponse = await fetch('http://localhost:3000/api/suggest-activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          city: 'Rome', 
          participants: 2,
          budget: '€€' 
        })
      })
      
      if (romeResponse.ok) {
        const romeData = await romeResponse.json()
        romeActivities = romeData.activities || []
      }
    } catch (error) {
      console.log('⚠️ Erreur lors de la récupération des activités de Rome:', error.message)
    }
    
    const romeMoreResponse = await fetch('http://localhost:3000/api/more-activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        city: 'Rome', 
        theme: 'Culturel', 
        existingActivities: romeActivities.slice(0, 2),
        participants: 2 
      })
    })
    
    if (romeMoreResponse.ok) {
      const romeMoreData = await romeMoreResponse.json()
      console.log(`✅ Rome Culturel: ${romeMoreData.activities.length} activités générées`)
      
      // Vérifier que toutes les activités sont bien de Rome
      let romeCount = 0
      let otherCities = []
      
      romeMoreData.activities.forEach(activity => {
        const activityText = (activity.name + ' ' + (activity.description || '')).toLowerCase()
        if (activityText.includes('rome') || 
            activityText.includes('italie') || 
            activityText.includes('colisée') ||
            activityText.includes('vatican') ||
            activityText.includes('trevi') ||
            activityText.includes('forum') ||
            activityText.includes('panthéon') ||
            activityText.includes('saint-pierre') ||
            activityText.includes('chapelle sixtine')) {
          romeCount++
        } else {
          otherCities.push(activity.name)
        }
      })
      
      console.log(`   - Activités de Rome: ${romeCount}`)
      console.log(`   - Activités suspectes: ${otherCities.length}`)
      
      if (otherCities.length > 0) {
        console.log('   ❌ PROBLÈME: Activités qui ne semblent pas être de Rome:')
        otherCities.forEach(name => console.log(`      - ${name}`))
      } else {
        console.log('   ✅ OK: Toutes les activités sont spécifiques à Rome!')
      }
      
      // Afficher quelques exemples
      console.log('\n📋 Exemples d\'activités culturelles:')
      romeMoreData.activities.slice(0, 3).forEach((activity, index) => {
        console.log(`   ${index + 1}. ${activity.name}`)
        console.log(`      ${activity.description}`)
      })
      
    } else {
      console.log('❌ Erreur pour Rome Culturel:', await romeMoreResponse.text())
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  }
}

// Exécuter le test
testNewCity()