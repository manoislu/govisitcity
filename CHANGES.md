# Modifications pour corriger le problème de timeout 504

## 🎯 Problème
L'API `/api/suggest-activities` générait un timeout 504 car l'appel à l'IA prenait trop de temps (plus de 30 secondes).

## 🔧 Solutions appliquées

### 1. Optimisation des paramètres IA
- **Activités**: Réduit de 8 à 6 activités
- **Description**: Réduite de 150-200 à 100-150 caractères  
- **Images**: Réduit de 4 à 3 images
- **Tokens max**: Réduit de 1500 à 1200

### 2. Ajout d'un timeout de 25 secondes
- Protection contre les réponses IA trop longues
- Utilisation de `Promise.race()` pour limiter le temps d'attente
- Timeout configuré à 25 secondes (en dessous de la limite de 30s du serveur)

### 3. Amélioration de la gestion d'erreur
- Si l'IA échoue, retour automatique aux activités de la base de données
- Logs détaillés pour le debugging
- Messages d'erreur plus clairs

## 📁 Fichiers modifiés

### `src/app/api/suggest-activities/route.ts`

#### Changement 1: Ajout de la fonction timeout
```typescript
// Fonction pour ajouter un timeout
function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`Timeout après ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
}
```

#### Changement 2: Modification de la signature de fonction
```typescript
// Avant
async function generateActivitiesWithAI(destination, budget, numberOfPeople, language) {

// Après  
async function generateActivitiesWithAI(destination, budget, numberOfPeople, language, timeoutMs = 25000) {
```

#### Changement 3: Optimisation du prompt IA
```typescript
// Avant
"Génère 8 activités variées pour un voyage à {destination}..."
"génère 4 images..."
"150-200 caractères"

// Après
"Génère 6 activités variées pour un voyage à {destination}..."
"génère 3 images..."
"100-150 caractères"
```

#### Changement 4: Ajout du timeout autour de l'appel IA
```typescript
// Avant
const completion = await zai.chat.completions.create({

// Après
const completion = await withTimeout(zai.chat.completions.create({
```

#### Changement 5: Paramètres optimisés
```typescript
// Avant
max_tokens: 1500,

// Après
max_tokens: 1200,
```

#### Changement 6: Appel avec timeout
```typescript
// Avant
});

// Après
}), timeoutMs);
```

## 🚀 Comment appliquer ces modifications

### Option 1: Script automatique (recommandé)
```bash
node sync-changes.js
```

### Option 2: Manuellement
1. Ouvrir `src/app/api/suggest-activities/route.ts`
2. Appliquer les changements listés ci-dessus dans l'ordre
3. Redémarrer le serveur: `npm run dev`

### Option 3: Copier le fichier complet
Remplacer tout le contenu de `src/app/api/suggest-activities/route.ts` par la version optimisée.

## 🧪 Test

Après avoir appliqué les modifications:

1. **Redémarrez le serveur**:
   ```bash
   npm run dev
   ```

2. **Testez l'API**:
   - Allez sur http://localhost:3000
   - Remplissez le formulaire de voyage
   - Cliquez sur "Générer des activités"
   - Vérifiez que vous recevez une réponse en moins de 30 secondes

3. **Vérifiez les logs**:
   - Les logs devraient montrer "Réponse IA reçue" ou "Fallback vers la base de données"
   - Plus de messages de timeout 504

## 📊 Résultats attendus

- ✅ Réponse de l'API en moins de 30 secondes
- ✅ Plus d'erreurs 504 Gateway Timeout  
- ✅ Si l'IA échoue, les activités de la base de données sont retournées
- ✅ Logs clairs pour le debugging
- ✅ Expérience utilisateur améliorée avec des temps de réponse rapides

## 🔍 Monitoring

Pour vérifier que tout fonctionne:

```bash
# Surveiller les logs du serveur
npm run dev

# Tester l'API directement
curl -X POST http://localhost:3000/api/suggest-activities \
  -H "Content-Type: application/json" \
  -d '{"destination":"Paris","budget":1000,"numberOfPeople":2,"language":"fr"}'
```

---

*Si vous rencontrez des problèmes après avoir appliqué ces modifications, vérifiez les logs du serveur pour des messages d'erreur détaillés.*