/**
 * Script pour tester le problème de 'plus d'activités'
 */

const testMoreActivities = async () => {
  console.log('🧪 Test du problème "plus d\'activités"...\n')
  
  try {
    // Test 1: Demander plus d'activités pour Amsterdam
    console.log('📍 Test 1: Plus d\'activités pour Amsterdam (thème Gastronomie)...')
    
    // D'abord, simuler qu'on a déjà quelques activités d'Amsterdam
    const existingActivities = [
      { id: '1', name: 'Croisière sur les canaux', city: 'Amsterdam' },
      { id: '2', name: 'Visite du Rijksmuseum', city: 'Amsterdam' }
    ]
    
    const amsterdamResponse = await fetch('http://localhost:3000/api/more-activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        city: 'Amsterdam', 
        theme: 'Gastronomie', 
        existingActivities: existingActivities,
        participants: 2 
      })
    })
    
    if (amsterdamResponse.ok) {
      const amsterdamData = await amsterdamResponse.json()
      console.log(`✅ Amsterdam: ${amsterdamData.activities.length} activités reçues`)
      
      // Vérifier que toutes les activités sont bien d'Amsterdam
      let amsterdamCount = 0
      let otherCities = []
      
      amsterdamData.activities.forEach(activity => {
        // Vérifier si le nom ou la description contient Amsterdam ou des lieux spécifiques
        const activityText = (activity.name + ' ' + (activity.description || '')).toLowerCase()
        if (activityText.includes('amsterdam') || 
            activityText.includes('pays-bas') || 
            activityText.includes('holland') ||
            activityText.includes('van gogh') ||
            activityText.includes('rijksmuseum') ||
            activityText.includes('vondelpark') ||
            activityText.includes('canal') ||
            activityText.includes('marken') ||
            activityText.includes('volendam')) {
          amsterdamCount++
        } else {
          otherCities.push(activity.name)
        }
      })
      
      console.log(`   - Activités d'Amsterdam: ${amsterdamCount}`)
      console.log(`   - Activités suspectes: ${otherCities.length}`)
      
      if (otherCities.length > 0) {
        console.log('   ❌ PROBLÈME: Activités qui ne semblent pas être d\'Amsterdam:')
        otherCities.forEach(name => console.log(`      - ${name}`))
      } else {
        console.log('   ✅ OK: Toutes les activités semblent être d\'Amsterdam')
      }
      
    } else {
      console.log('❌ Erreur pour Amsterdam:', await amsterdamResponse.text())
    }
    
    // Attendre un peu
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Test 2: Demander plus d'activités pour Barcelone
    console.log('\n📍 Test 2: Plus d\'activités pour Barcelone (thème Culturel)...')
    
    const barceloneResponse = await fetch('http://localhost:3000/api/more-activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        city: 'Barcelone', 
        theme: 'Culturel', 
        existingActivities: [],
        participants: 2 
      })
    })
    
    if (barceloneResponse.ok) {
      const barceloneData = await barceloneResponse.json()
      console.log(`✅ Barcelone: ${barceloneData.activities.length} activités reçues`)
      
      // Vérifier que toutes les activités sont bien de Barcelone
      let barceloneCount = 0
      let otherCities = []
      
      barceloneData.activities.forEach(activity => {
        const activityText = (activity.name + ' ' + (activity.description || '')).toLowerCase()
        if (activityText.includes('barcelone') || 
            activityText.includes('catalogne') || 
            activityText.includes('espagne') ||
            activityText.includes('sagrada') ||
            activityText.includes('güell') ||
            activityText.includes('boqueria') ||
            activityText.includes('barceloneta') ||
            activityText.includes('eixample') ||
            activityText.includes('raval')) {
          barceloneCount++
        } else {
          otherCities.push(activity.name)
        }
      })
      
      console.log(`   - Activités de Barcelone: ${barceloneCount}`)
      console.log(`   - Activités suspectes: ${otherCities.length}`)
      
      if (otherCities.length > 0) {
        console.log('   ❌ PROBLÈME: Activités qui ne semblent pas être de Barcelone:')
        otherCities.forEach(name => console.log(`      - ${name}`))
      } else {
        console.log('   ✅ OK: Toutes les activités semblent être de Barcelone')
      }
      
    } else {
      console.log('❌ Erreur pour Barcelone:', await barceloneResponse.text())
    }
    
    // Test 3: Vérifier ce qui se passe avec un thème qui n'existe pas
    console.log('\n📍 Test 3: Plus d\'activités pour Amsterdam (thème qui n\'existe pas)...')
    
    const noThemeResponse = await fetch('http://localhost:3000/api/more-activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        city: 'Amsterdam', 
        theme: 'ThèmeInexistant123', 
        existingActivities: existingActivities,
        participants: 2 
      })
    })
    
    if (noThemeResponse.ok) {
      const noThemeData = await noThemeResponse.json()
      console.log(`✅ Amsterdam (thème inexistant): ${noThemeData.activities.length} activités reçues`)
      
      // Vérifier que toutes les activités sont bien d'Amsterdam
      let amsterdamCount = 0
      let otherCities = []
      
      noThemeData.activities.forEach(activity => {
        const activityText = (activity.name + ' ' + (activity.description || '')).toLowerCase()
        if (activityText.includes('amsterdam') || 
            activityText.includes('pays-bas') || 
            activityText.includes('holland') ||
            activityText.includes('van gogh') ||
            activityText.includes('rijksmuseum') ||
            activityText.includes('vondelpark') ||
            activityText.includes('canal') ||
            activityText.includes('marken') ||
            activityText.includes('volendam')) {
          amsterdamCount++
        } else {
          otherCities.push(activity.name)
        }
      })
      
      console.log(`   - Activités d'Amsterdam: ${amsterdamCount}`)
      console.log(`   - Activités suspectes: ${otherCities.length}`)
      
      if (otherCities.length > 0) {
        console.log('   ❌ PROBLÈME DÉTECTÉ: Le fallback retourne des activités d\'autres villes!')
        otherCities.forEach(name => console.log(`      - ${name}`))
      } else {
        console.log('   ✅ OK: Le fallback reste bien à Amsterdam')
      }
      
    } else {
      console.log('❌ Erreur pour thème inexistant:', await noThemeResponse.text())
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  }
}

// Exécuter le test
testMoreActivities()