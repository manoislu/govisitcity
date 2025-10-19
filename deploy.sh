#!/bin/bash

echo "🚀 Script de Déploiement Production - GoVisitCity"
echo "=================================================="

# Vérifier les variables d'environnement essentielles
echo "📋 Vérification des variables d'environnement..."

if [ ! -f .env ]; then
    echo "❌ Fichier .env manquant. Création avec valeurs par défaut..."
    cat > .env << EOF
# Database - Default for build time
DATABASE_URL="file:./db/custom.db"

# Next.js - Default values
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="default-secret-for-build-only"

# Environment
NODE_ENV="production"
EOF
    echo "✅ Fichier .env créé"
fi

if [ ! -f .env.local ]; then
    echo "⚠️ Fichier .env.local manquant. Utilisation de .env.example comme modèle..."
    if [ -f .env.example ]; then
        cp .env.example .env.local
        echo "✅ .env.local copié depuis .env.example"
    else
        echo "❌ .env.example non trouvé. Création manuelle requise."
    fi
fi

# Nettoyer les builds précédents
echo "🧹 Nettoyage des builds précédents..."
rm -rf .next
rm -rf node_modules/.cache

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm ci --only=production

# Générer le client Prisma
echo "🗄️ Génération du client Prisma..."
npm run db:generate

# Builder l'application
echo "🏗️ Build de l'application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build réussi !"
    
    # Vérifier que les fichiers essentiels existent
    if [ -f ".next/server/app/api/health/route.js" ]; then
        echo "✅ API health compilée"
    else
        echo "❌ API health manquante"
    fi
    
    if [ -f ".next/server/app/api/suggest-activities/route.js" ]; then
        echo "✅ API suggest-activities compilée"
    else
        echo "❌ API suggest-activities manquante"
    fi
    
    echo "🎉 Déploiement prêt !"
    echo "📝 Instructions de démarrage :"
    echo "   npm start"
    echo ""
    echo "🔍 Vérifications post-déploiement :"
    echo "   curl http://localhost:3000/api/health"
    echo "   curl -X POST http://localhost:3000/api/suggest-activities -H 'Content-Type: application/json' -d '{\"city\":\"Paris\",\"budget\":\"€€\",\"participants\":2}'"
    
else
    echo "❌ Build échoué !"
    echo "🔍 Vérifiez les logs ci-dessus pour corriger les erreurs."
    exit 1
fi