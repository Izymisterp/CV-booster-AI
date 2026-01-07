# Guide de Déploiement - CV Booster AI

## 📋 Prérequis

- Docker installé
- Compte Google Cloud Platform (GCP) avec Cloud Build et Cloud Run activés
- Clé API Gemini

## 🚀 Déploiement sur Google Cloud Run

### 1. Configuration de la clé API

Pour Cloud Run, vous devez passer la clé API Gemini comme variable d'environnement lors du déploiement :

```bash
gcloud run deploy cv-booster-ai \
  --image=gcr.io/$PROJECT_ID/cv-booster-ai:$COMMIT_SHA \
  --region=europe-west1 \
  --platform=managed \
  --set-env-vars="VITE_GEMINI_API_KEY=votre_clé_api_ici"
```

### 2. Déploiement automatique avec Cloud Build

Le fichier `cloudbuild.yaml` est déjà configuré. Pour déclencher un déploiement :

```bash
# Depuis la racine du projet
gcloud builds submit --config=cloudbuild.yaml
```

**Note importante :** Vous devrez modifier le `cloudbuild.yaml` pour ajouter la variable d'environnement :

```yaml
- name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
  entrypoint: gcloud
  args:
    - 'run'
    - 'deploy'
    - 'cv-booster-ai'
    - '--image=gcr.io/$PROJECT_ID/cv-booster-ai:$COMMIT_SHA'
    - '--region=europe-west1'
    - '--platform=managed'
    - '--set-env-vars=VITE_GEMINI_API_KEY=$$GEMINI_API_KEY'
  secretEnv: ['GEMINI_API_KEY']

availableSecrets:
  secretManager:
  - versionName: projects/$PROJECT_ID/secrets/gemini-api-key/versions/latest
    env: 'GEMINI_API_KEY'
```

### 3. Stocker la clé API dans Secret Manager (recommandé)

```bash
# Créer le secret
echo -n "votre_clé_api" | gcloud secrets create gemini-api-key --data-file=-

# Donner accès à Cloud Build
gcloud secrets add-iam-policy-binding gemini-api-key \
  --member=serviceAccount:PROJECT_NUMBER@cloudbuild.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor
```

## 🐳 Test local avec Docker

### Build de l'image

```bash
docker build -t cv-booster-ai .
```

### Exécution du conteneur

```bash
docker run -p 8080:8080 \
  -e VITE_GEMINI_API_KEY=votre_clé_api \
  cv-booster-ai
```

Accédez à l'application sur : http://localhost:8080

## 🔧 Dépannage

### Problème : L'application ne démarre pas

- Vérifiez que le build s'est bien exécuté : `docker logs <container_id>`
- Assurez-vous que la clé API est bien définie

### Problème : Erreur 404 sur les routes

- L'application utilise `serve -s` qui gère automatiquement le routing SPA

### Problème : Variables d'environnement non reconnues

- Pour Vite, les variables doivent commencer par `VITE_`
- Elles sont injectées au moment du build, pas au runtime

## 📝 Notes importantes

1. **Variables d'environnement Vite** : Les variables `VITE_*` sont injectées lors du build. Si vous changez la clé API, vous devez rebuilder l'image.

2. **Sécurité** : Ne commitez jamais votre `.env.local` avec des vraies clés API. Utilisez `.env.example` comme template.

3. **Production** : Pour la production, utilisez toujours Secret Manager pour stocker les clés sensibles.
