#!/bin/bash

# Script de restauration pour GoVisitCity v1.2.0 - UI Improvements
# Usage: ./restore-v1.2.0.sh

echo "🔄 Restauration de GoVisitCity v1.2.0 - UI Improvements..."
echo "=================================================="

# Vérifier si on est dans un dépôt git
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Erreur: Ce n'est pas un dépôt git!"
    exit 1
fi

# Sauvegarder l'état actuel
echo "💾 Sauvegarde de l'état actuel..."
current_branch=$(git branch --show-current)
backup_branch="backup-before-restore-$(date +%Y%m%d-%H%M%S)"
git checkout -b "$backup_branch" 2>/dev/null || git checkout "$backup_branch" 2>/dev/null

# Restaurer le tag v1.2.0-ui-improvements
echo "🏷️  Restauration du tag v1.2.0-ui-improvements..."
git checkout v1.2.0-ui-improvements

# Créer une branche à partir du tag
echo "🌿 Création de la branche de restauration..."
git checkout -b restore-v1.2.0-ui-improvements

echo ""
echo "✅ Restauration terminée avec succès!"
echo ""
echo "📋 Informations sur la restauration:"
echo "   • Version: v1.2.0-ui-improvements"
echo "   • Branche actuelle: restore-v1.2.0-ui-improvements"
echo "   • Sauvegarde de l'état précédent: $backup_branch"
echo ""
echo "🎯 Fonctionnalités restaurées:"
echo "   • Icônes ajoutées aux éléments UI"
echo "   • Recherche par thème corrigée avec fallback IA"
echo "   • Calendrier responsive mobile optimisé"
echo "   • Sauvegarde des voyages avec localStorage"
echo "   • Comportements des boutons améliorés"
echo "   • Icônes de navigation cohérentes"
echo ""
echo "🔄 Pour revenir à l'état précédent:"
echo "   git checkout $backup_branch"
echo ""
echo "🚀 Pour continuer le développement:"
echo "   npm run dev"