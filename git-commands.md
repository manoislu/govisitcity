# Commandes Git pour publier les modifications

## 📋 Étapes à suivre

### 1. Vérifier l'état actuel
```bash
git status
```

### 2. Ajouter tous les fichiers modifiés
```bash
git add .
```

### 3. Voir ce qui va être commité
```bash
git diff --cached
```

### 4. Faire le commit
```bash
git commit -m "🚀 Fix timeout 504 API + optimisations IA

- Réduction activités IA: 8→6, descriptions: 150→100 caractères
- Ajout timeout 25s pour éviter les erreurs 504
- Fallback automatique vers base de données si IA échoue
- Optimisation tokens max: 1500→1200
- Ajout fichier .env avec configuration
- Script sync-changes.js pour appliquer modifications

🤖 Generated with Claude Code"
```

### 5. Push vers le repository
```bash
git push origin main
# ou git push selon votre configuration
```

## 🔍 Vérification après le push

### 1. Vérifier que tout est bien sur Git
```bash
git log --oneline -5
git status
```

### 2. Tester l'application en production
- Visitez votre URL de production
- Testez le formulaire de voyage
- Vérifiez qu'il n'y a plus de timeout 504

## 📝 Fichiers qui seront commités

- ✅ `src/app/api/suggest-activities/route.ts` (optimisé)
- ✅ `.env` (nouveau, avec variables d'environnement)
- ✅ `sync-changes.js` (script de synchronisation)
- ✅ `CHANGES.md` (documentation des changements)
- ✅ `git-commands.md` (ce fichier)

## ⚠️ Important

- Le fichier `.env` contient des informations sensibles
- Assurez-vous qu'il n'est pas dans votre `.gitignore` si vous voulez le partager
- En production, utilisez des variables d'environnement réelles