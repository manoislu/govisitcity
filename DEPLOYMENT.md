# GoVisitCity - Guide de Déploiement en Production

## 🔧 Configuration Requise

### 1. Variables d'Environnement

Copiez `.env.example` vers `.env.local` et configurez les variables suivantes :

```bash
# Base de données SQLite
DATABASE_URL="file:./db/custom.db"

# Next.js
NEXTAUTH_URL="https://votre-domaine.com"
NEXTAUTH_SECRET="votre-clé-secrète-très-sécurisée"

# Z-AI SDK (optionnel)
ZAI_API_KEY=""
ZAI_BASE_URL=""

# Production
NODE_ENV="production"
PORT=3000
HOSTNAME="0.0.0.0"
```

### 2. Build de Production

```bash
# Installer les dépendances
npm install

# Générer le client Prisma
npm run db:generate

# Pousser le schéma de la base de données
npm run db:push

# Builder l'application
npm run build
```

### 3. Démarrage en Production

```bash
npm start
```

## 🚨 Dépannage des Erreurs 500

### Problèmes Courants

1. **Base de données non connectée**
   - Vérifiez que `DATABASE_URL` est correctement configuré
   - Assurez-vous que le fichier `db/custom.db` existe et est accessible en écriture

2. **Variables d'environnement manquantes**
   - Vérifiez que toutes les variables requises sont dans `.env.local`
   - Redémarrez le serveur après avoir modifié les variables

3. **Permissions de fichiers**
   - Assurez-vous que le dossier `db/` et le fichier `custom.db` ont les bonnes permissions

### Vérification de Santé

Utilisez l'endpoint `/api/health` pour vérifier l'état du système :

```bash
curl https://votre-domaine.com/api/health
```

Réponse attendue :
```json
{
  "status": "healthy",
  "database": "connected",
  "activitiesCount": 42,
  "timestamp": "2025-01-20T10:30:00.000Z"
}
```

### Logs d'Erreurs

Les erreurs détaillées sont disponibles dans :
- Console du serveur
- Logs du navigateur (F12)
- Réseau → onglet "Réponse" pour les erreurs API

## 🔄 Mise à Jour

Pour mettre à jour l'application en production :

```bash
# Arrêter le serveur
# Pull des dernières modifications
git pull

# Réinstaller les dépendances si nécessaire
npm install

# Rebuilder
npm run build

# Redémarrer
npm start
```

## 📊 Monitoring

L'application inclut un système de monitoring automatique :
- Vérification de la connexion à la base de données toutes les 30 secondes
- Alertes visuelles en cas de problème
- Logs détaillés pour le debugging

## 🛠️ Support

En cas d'erreur 500 persistante :

1. Vérifiez les logs du serveur
2. Testez l'endpoint `/api/health`
3. Vérifiez les variables d'environnement
4. Assurez-vous que la base de données est accessible

## 🌐 Déploiement sur Plateformes

### Vercel
- Ajoutez les variables d'environnement dans le dashboard Vercel
- La base de données SQLite nécessite une configuration spécifique

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Railway/Render
- Configurez les variables d'environnement dans l'interface
- Assurez-vous que le `DATABASE_URL` pointe vers une base de données persistante