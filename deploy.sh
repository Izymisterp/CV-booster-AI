#!/bin/bash

# Script de déploiement pour CV Booster AI sur Google Cloud Run
# Ce script lance Cloud Build avec le dernier commit

set -e

echo "🚀 Déploiement de CV Booster AI sur Google Cloud Run"
echo ""

# Vérifier que nous sommes sur la branche main
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "⚠️  Attention: Vous n'êtes pas sur la branche main (branche actuelle: $CURRENT_BRANCH)"
    read -p "Continuer quand même? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Récupérer le dernier commit SHA
COMMIT_SHA=$(git rev-parse HEAD)
SHORT_SHA=$(git rev-parse --short HEAD)

echo "📦 Commit à déployer: $SHORT_SHA ($COMMIT_SHA)"
echo ""

# Vérifier que le commit est bien pushé sur GitHub
if ! git branch -r --contains $COMMIT_SHA | grep -q "origin/"; then
    echo "❌ Erreur: Le commit $SHORT_SHA n'a pas été pushé sur GitHub"
    echo "   Exécutez: git push origin main"
    exit 1
fi

echo "✅ Le commit est bien sur GitHub"
echo ""

# Lancer Cloud Build
echo "🔨 Lancement de Cloud Build..."
gcloud builds submit --config=cloudbuild.yaml

echo ""
echo "✅ Déploiement terminé!"
echo "🌐 Votre application sera disponible sur Cloud Run"
