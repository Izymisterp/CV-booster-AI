# Image de base avec Node.js 18 (version alpine pour un conteneur léger)
FROM node:18-alpine

# Répertoire de travail
WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances (--only=production pour éviter les devDependencies)
RUN npm ci --only=production

# Copie du reste du code source
COPY . .

# Port exposé (à adapter selon votre app)
EXPOSE 8080
ENV PORT=8080

# Commande de démarrage (à adapter selon votre point d'entrée)
CMD ["npm", "start"]
