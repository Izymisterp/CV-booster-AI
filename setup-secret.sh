#!/bin/bash

# Script pour créer le secret Gemini API Key dans Google Cloud Secret Manager
# Ce script demande la clé API de manière sécurisée (sans l'afficher à l'écran)

set -e

echo "🔐 Configuration du secret Gemini API Key dans Google Cloud"
echo ""

# Vérifier que gcloud est installé
if ! command -v gcloud &> /dev/null; then
    echo "❌ Erreur: gcloud CLI n'est pas installé"
    echo "   Installez-le depuis: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Récupérer le PROJECT_ID actuel
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Erreur: Aucun projet GCP configuré"
    echo "   Exécutez: gcloud config set project VOTRE_PROJECT_ID"
    exit 1
fi

echo "📦 Projet GCP: $PROJECT_ID"
echo ""

# Demander la clé API de manière sécurisée (sans l'afficher)
echo "Entrez votre clé API Gemini (la saisie sera masquée):"
read -s GEMINI_API_KEY
echo ""

if [ -z "$GEMINI_API_KEY" ]; then
    echo "❌ Erreur: La clé API ne peut pas être vide"
    exit 1
fi

echo "✅ Clé API reçue"
echo ""

# Vérifier si le secret existe déjà
if gcloud secrets describe gemini-api-key &>/dev/null; then
    echo "⚠️  Le secret 'gemini-api-key' existe déjà"
    read -p "Voulez-vous le mettre à jour? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔄 Mise à jour du secret..."
        echo -n "$GEMINI_API_KEY" | gcloud secrets versions add gemini-api-key --data-file=-
        echo "✅ Secret mis à jour"
    else
        echo "❌ Opération annulée"
        exit 0
    fi
else
    echo "📝 Création du secret 'gemini-api-key'..."
    echo -n "$GEMINI_API_KEY" | gcloud secrets create gemini-api-key --data-file=-
    echo "✅ Secret créé"
fi

echo ""
echo "🔑 Configuration des permissions pour Cloud Build..."

# Récupérer le numéro de projet
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

# Donner accès à Cloud Build
gcloud secrets add-iam-policy-binding gemini-api-key \
    --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor" \
    --quiet

echo "✅ Permissions configurées"
echo ""
echo "🎉 Configuration terminée!"
echo ""
echo "Vous pouvez maintenant déployer avec:"
echo "  ./deploy.sh"
echo "  ou"
echo "  gcloud builds submit --config=cloudbuild.yaml"
