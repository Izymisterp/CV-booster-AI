# Image de base avec Node.js 20 (version alpine pour un conteneur léger)
FROM node:20-alpine

# Répertoire de travail
WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation de TOUTES les dépendances (nécessaire pour le build)
RUN npm ci

# Copie du reste du code source
COPY . .

# Build de l'application Vite pour la production
RUN npm run build

# Port exposé
EXPOSE 8080
ENV PORT=8080

# Commande de démarrage - sert les fichiers statiques buildés
CMD ["npm", "start"]
