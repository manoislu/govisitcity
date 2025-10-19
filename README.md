# 🏙️ GoVisitCity

Découvrez les meilleures activités et expériences dans votre ville !

## 🌟 Fonctionnalités

- **🔍 Recherche d'activités** thématiques dans votre ville
- **🎨 Génération d'images** avec IA pour chaque activité
- **📅 Planification** d'itinéraires personnalisés
- **🗺️ Exploration** locale et touristique
- **⚡ Interface moderne** avec shadcn/ui
- **📱 Design responsive** et accessible

## 🚀 Déploiement

### Avec Vercel (Recommandé)

1. **Connecter GitHub à Vercel**
   - Allez sur [vercel.com](https://vercel.com)
   - Importez votre repository GitHub
   - Vercel détectera automatiquement Next.js

2. **Configuration des variables d'environnement**
   ```
   DATABASE_URL=your_database_url
   NEXTAUTH_SECRET=your_secret
   ```

3. **Déploiement automatique**
   - Chaque `push` sur `main` déclenche un déploiement
   - L'URL sera disponible : `https://your-app.vercel.app`

### Avec Netlify

1. Connectez votre repository GitHub
2. Configurez les variables d'environnement
3. Build command: `npm run build`
4. Publish directory: `.next`

## 🛠️ Développement local

```bash
# Installer les dépendances
npm install

# Initialiser la base de données
npm run db:push

# Démarrer le serveur de développement
npm run dev
```

## 📁 Structure du projet

```
src/
├── app/              # Pages Next.js 15
├── components/       # Composants React
├── lib/             # Utilitaires et configurations
└── styles/          # Styles globaux

prisma/
└── schema.prisma    # Schéma de la base de données
```

## 🎨 Technologies

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Prisma + SQLite
- **Real-time**: Socket.IO
- **AI**: z-ai-web-dev-sdk

## 🎨 Technologies

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Prisma + SQLite
- **Real-time**: Socket.IO
- **AI**: z-ai-web-dev-sdk

## 📝 Licence

MIT

---

🏙️ **GoVisitCity** - Explorez votre ville autrement