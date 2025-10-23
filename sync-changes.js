#!/usr/bin/env node

/**
 * Script de synchronisation pour appliquer les modifications localement
 * Exécutez: node sync-changes.js
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Début de la synchronisation des modifications...\n');

// Modifications à appliquer
const modifications = [
  {
    file: 'src/app/api/suggest-activities/route.ts',
    description: 'Optimisation de l\'API pour éviter les timeouts',
    changes: [
      {
        search: '// Générer des suggestions d\'activités avec IA',
        replace: '// Générer des suggestions d\'activités avec IA (optimisé)'
      },
      {
        search: 'const activities = await generateActivitiesWithAI(destination, budget, numberOfPeople, language);',
        replace: 'const activities = await generateActivitiesWithAI(destination, budget, numberOfPeople, language, 25); // 25s timeout'
      },
      {
        search: 'async function generateActivitiesWithAI(destination, budget, numberOfPeople, language) {',
        replace: 'async function generateActivitiesWithAI(destination, budget, numberOfPeople, language, timeoutMs = 25000) {'
      }
    ]
  },
  {
    file: 'src/app/api/suggest-activities/route.ts',
    description: 'Ajout de la fonction timeout',
    changes: [
      {
        search: '// Créer une instance ZAI',
        replace: '// Fonction pour ajouter un timeout\nfunction withTimeout(promise, timeoutMs) {\n  return Promise.race([\n    promise,\n    new Promise((_, reject) => \n      setTimeout(() => reject(new Error(`Timeout après ${timeoutMs}ms`)), timeoutMs)\n    )\n  ]);\n}\n\n// Créer une instance ZAI'
      }
    ]
  },
  {
    file: 'src/app/api/suggest-activities/route.ts',
    description: 'Optimisation des paramètres IA',
    changes: [
      {
        search: 'max_tokens: 1500,',
        replace: 'max_tokens: 1200,'
      },
      {
        search: 'Génère 8 activités variées',
        replace: 'Génère 6 activités variées'
      },
      {
        search: 'génère 4 images',
        replace: 'génère 3 images'
      },
      {
        search: '150-200 caractères',
        replace: '100-150 caractères'
      }
    ]
  },
  {
    file: 'src/app/api/suggest-activities/route.ts',
    description: 'Ajout du timeout autour de l\'appel IA',
    changes: [
      {
        search: 'const completion = await zai.chat.completions.create({',
        replace: 'const completion = await withTimeout(zai.chat.completions.create({'
      }
    ]
  },
  {
    file: 'src/app/api/suggest-activities/route.ts',
    description: 'Correction de la fermeture de parenthèse',
    changes: [
      {
        search: '    });\n\n    console.log(\'Réponse IA reçue:\', JSON.stringify(completion, null, 2));',
        replace: '    }), timeoutMs);\n\n    console.log(\'Réponse IA reçue:\', JSON.stringify(completion, null, 2));'
      }
    ]
  }
];

function applyModifications() {
  let successCount = 0;
  let errorCount = 0;

  modifications.forEach((mod, index) => {
    console.log(`\n📝 Modification ${index + 1}/${modifications.length}: ${mod.description}`);
    console.log(`📁 Fichier: ${mod.file}`);
    
    try {
      const filePath = path.join(process.cwd(), mod.file);
      
      if (!fs.existsSync(filePath)) {
        console.log(`❌ Fichier non trouvé: ${filePath}`);
        errorCount++;
        return;
      }

      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;

      mod.changes.forEach(change => {
        if (content.includes(change.search)) {
          content = content.replace(change.search, change.replace);
          modified = true;
          console.log(`  ✅ Appliqué: ${change.search.substring(0, 50)}...`);
        } else {
          console.log(`  ⚠️  Non trouvé: ${change.search.substring(0, 50)}...`);
        }
      });

      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`  💾 Fichier mis à jour`);
        successCount++;
      } else {
        console.log(`  ℹ️  Aucune modification nécessaire`);
      }

    } catch (error) {
      console.log(`  ❌ Erreur: ${error.message}`);
      errorCount++;
    }
  });

  console.log(`\n📊 Résumé:`);
  console.log(`  ✅ Modifications réussies: ${successCount}`);
  console.log(`  ❌ Erreurs: ${errorCount}`);
  console.log(`  📁 Fichiers traités: ${modifications.length}`);
  
  if (successCount > 0) {
    console.log(`\n🎉 Synchronisation terminée! Vous pouvez maintenant tester localement.`);
    console.log(`\n🔄 Pour redémarrer votre serveur de développement:`);
    console.log(`   npm run dev`);
  }
}

// Vérifier si nous sommes dans le bon répertoire
if (!fs.existsSync('package.json')) {
  console.log('❌ Erreur: Veuillez exécuter ce script depuis la racine du projet Next.js');
  process.exit(1);
}

applyModifications();