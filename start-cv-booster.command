#!/bin/bash

# Charger l'environnement utilisateur pour trouver node/npm
[ -f ~/.zshrc ] && source ~/.zshrc
[ -f ~/.bash_profile ] && source ~/.bash_profile
[ -f ~/.zprofile ] && source ~/.zprofile

# Ajouter les chemins communs au cas où
export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin

# Aller dans le dossier du projet
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "========================================"
echo "   🚀 CV BOOSTER AI - Démarrage..."
echo "========================================"

# Vérifier node
if ! command -v npm &> /dev/null; then
    echo "❌ Erreur : 'npm' est introuvable."
    echo "Assurez-vous que Node.js est installé."
    echo "Appuyez sur une touche pour quitter..."
    read -n 1
    exit 1
fi

# Install si besoin
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances en cours..."
    npm install
fi

# Fonction pour attendre que le serveur soit prêt
wait_for_server() {
    echo "⏳ Attente du démarrage du serveur..."
    local url="http://localhost:3000"
    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -s --head  --request GET "$url" | grep "200 OK" > /dev/null; then 
            # Le serveur répond, on ouvre
            echo "✅ Serveur prêt ! Ouverture du navigateur..."
            open "$url"
            return 0
        fi
        # Alternative simple check si curl fail complètement (conn refused)
        if nc -z localhost 3000 2>/dev/null; then
             echo "✅ Port détecté ! Ouverture du navigateur..."
             open "$url"
             return 0
        fi
        
        sleep 1
        ((attempt++))
    done
    
    echo "⚠️ Le navigateur ne s'est pas ouvert automatiquement."
    echo "Essayez d'ouvrir manuellement : $url"
}

echo "✅ Lancement du serveur sur le port 3000..."
echo "⚠️  Ne fermez pas cette fenêtre tant que vous utilisez l'application."

# Lancer la vérification en arrière-plan
wait_for_server &

# Lancer le serveur (bloquant)
npm run dev
