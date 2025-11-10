# 🎤 Shadow Transcribe

**Vos réunions transcrites. Sous le radar.**

Landing page avec outil de transcription audio intégré, destiné aux professionnels qui n'ont pas accès aux outils IA sur leur poste de travail.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Python](https://img.shields.io/badge/Python-3.9-green)

## 🚀 Stack Technique

- **Frontend** : Next.js 14 + TypeScript + Tailwind CSS
- **Backend** : Python API Routes (Vercel Serverless Functions)
- **Base de données** : Neon (PostgreSQL serverless) - optionnel pour V1
- **API** : OpenAI Whisper (transcription) + GPT-4 (résumé)
- **Déploiement** : Vercel
- **Versioning** : GitHub

## ✨ Fonctionnalités

- ⚡ **Upload drag & drop** : Interface intuitive pour uploader des fichiers audio
- 🎯 **Transcription automatique** : Utilise Whisper d'OpenAI pour transcrire avec précision
- 📊 **Résumé exécutif** : GPT-4 génère un résumé structuré avec points clés et actions
- 🔄 **Chunking automatique** : Découpe automatiquement les fichiers >25MB pour Whisper
- 📥 **Export multiple** : Téléchargez vos résultats en TXT ou Markdown
- 🔒 **Privacy-first** : Aucune donnée stockée (wording marketing pour l'instant)
- 🎨 **Design minimaliste** : Interface épurée, rapide, professionnelle

### Limite gratuite
- Fichiers jusqu'à **1 minute** : gratuit
- Au-delà : message de contact (pas de paywall implémenté pour V1)

## 📋 Prérequis

- Node.js 18+ et npm
- Python 3.9+
- Compte OpenAI avec API key
- Compte Vercel (pour le déploiement)
- Compte GitHub
- (Optionnel) Compte Neon pour la base de données

## 🛠️ Installation locale

### 1. Cloner le repository

```bash
git clone https://github.com/Liftof/shadow-transcribe.git
cd shadow-transcribe
```

### 2. Installer les dépendances Node.js

```bash
npm install
```

### 3. Installer les dépendances Python

```bash
pip install -r requirements.txt
```

### 4. Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```bash
cp .env.example .env.local
```

Éditez `.env.local` et ajoutez votre clé API OpenAI :

```
OPENAI_API_KEY=sk-votre-cle-api-ici
```

Pour obtenir votre clé API OpenAI :
1. Allez sur [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Créez une nouvelle clé API
3. Copiez-la et collez-la dans `.env.local`

### 5. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 🌍 Déploiement sur Vercel

### Méthode 1 : Via le dashboard Vercel (recommandée)

1. **Connectez votre repo GitHub**
   - Allez sur [vercel.com](https://vercel.com)
   - Cliquez sur "Add New" > "Project"
   - Sélectionnez votre repo `shadow-transcribe`

2. **Configurez les variables d'environnement**
   - Dans les paramètres du projet, allez dans "Environment Variables"
   - Ajoutez : `OPENAI_API_KEY` avec votre clé API

3. **Intégration Neon (optionnel)**
   - Dans le dashboard Vercel, allez dans "Storage"
   - Connectez Neon pour avoir `DATABASE_URL` automatiquement configuré

4. **Déployez**
   - Cliquez sur "Deploy"
   - Vercel détectera automatiquement Next.js et Python

### Méthode 2 : Via CLI

```bash
# Installer Vercel CLI
npm i -g vercel

# Login
vercel login

# Déployer
vercel

# Configurer les variables d'environnement
vercel env add OPENAI_API_KEY

# Déployer en production
vercel --prod
```

## 📁 Structure du projet

```
shadow-transcribe/
├── api/
│   └── transcribe.py          # API Python pour transcription/résumé
├── app/
│   ├── layout.tsx             # Layout principal Next.js
│   ├── page.tsx               # Page d'accueil/landing
│   └── globals.css            # Styles globaux
├── components/
│   ├── AudioUploader.tsx      # Composant d'upload drag & drop
│   └── TranscriptionResults.tsx # Affichage des résultats
├── public/                    # Assets statiques
├── .env.example               # Template des variables d'env
├── .gitignore                 # Fichiers ignorés par Git
├── vercel.json                # Configuration Vercel
├── requirements.txt           # Dépendances Python
├── package.json               # Dépendances Node.js
└── README.md                  # Ce fichier
```

## 🔧 Configuration technique

### API Python (`api/transcribe.py`)

L'API gère :
- Upload de fichier audio
- Vérification de la durée (limite 1 min pour version gratuite)
- Chunking automatique si fichier >25MB
- Appel à Whisper pour transcription
- Appel à GPT-4 pour résumé structuré
- Retour JSON avec transcription + résumé

**Limitations Vercel à connaître :**
- Timeout : 10s (free tier), 60s (Pro tier)
- Body size : 4.5MB (free tier)
- Pour fichiers >4.5MB : implémenter upload vers Vercel Blob (TODO)

### Frontend Next.js

- **`app/page.tsx`** : Page principale avec état (transcription, summary, processing)
- **`AudioUploader`** : Composant d'upload avec `react-dropzone`
- **`TranscriptionResults`** : Affichage des résultats + boutons copier/télécharger

### Formats audio supportés

MP3, WAV, M4A, OGG, FLAC, AAC

## 🔐 Sécurité & Privacy

**Note importante** : Pour V1, les messages de privacy sont du **wording marketing uniquement**. Aucune logique de suppression automatique n'est implémentée.

Messages affichés :
- "Vos fichiers sont supprimés immédiatement après traitement"
- "Aucune donnée n'est conservée ou utilisée pour entraîner des modèles"

À implémenter dans une future version :
- Suppression automatique des fichiers temporaires
- Logging minimal (timestamps, durées)
- Pas de stockage de contenu audio ou transcription

## 🗄️ Base de données Neon (optionnel)

Pour V1, pas de logique métier en DB. Potentiellement pour tracking basique :

```sql
CREATE TABLE transcriptions (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  duration_seconds INT,
  file_size_mb FLOAT,
  success BOOLEAN,
  error_message TEXT
);
```

## 🎨 Design & Wording

### Philosophie
- Minimaliste, épuré, rapide à charger
- Ton complice, direct, "shadow IT" assumé
- Pas de superflu, zéro distraction

### Couleurs
- Fond : Dégradé slate-900 → slate-800
- Accent : Blue-500 (CTA, liens)
- Texte : White/Slate-300/Slate-400

### Messages clés
- **Hero** : "Vos réunions transcrites. Sous le radar."
- **Bénéfices** : 4 points avec emojis (⚡🔒🎯💼)
- **Pourquoi** : Message sur la DSI qui bloque les outils IA
- **Footer** : Engagement privacy + email de contact

## 🐛 Debugging

### Erreurs communes

**1. API Python ne fonctionne pas en local**
- Vercel Python serverless functions ne fonctionnent qu'en production
- Pour tester localement : créer un endpoint Next.js qui appelle le script Python

**2. Fichier trop gros (>4.5MB sur free tier)**
- Implémenter upload vers Vercel Blob
- Ou compresser l'audio avant upload côté client

**3. Timeout sur gros fichiers**
- Passer au plan Vercel Pro (60s timeout)
- Ou découper en chunks plus petits

**4. Whisper échoue**
- Vérifier que le fichier est dans un format supporté
- Vérifier que la clé API OpenAI est valide et a des crédits

## 📈 Roadmap

- [ ] Implémenter upload via Vercel Blob pour fichiers >4.5MB
- [ ] Ajouter export PDF propre
- [ ] Implémenter vraie logique de suppression automatique
- [ ] Ajouter tracking basique dans Neon (durées, succès/échecs)
- [ ] Intégrer Stripe pour paywall fichiers >1min
- [ ] Ajouter timestamps cliquables dans la transcription
- [ ] Support multilingue (détection auto de la langue)
- [ ] Progressive Web App (PWA) pour usage mobile

## 🤝 Contribution

Ce projet est actuellement en V1 et n'accepte pas de contributions externes. Contact : contact@shadow-transcribe.com

## 📄 Licence

Tous droits réservés.

## 🙋 Support

Pour toute question ou problème :
- Email : contact@shadow-transcribe.com
- GitHub Issues : [https://github.com/Liftof/shadow-transcribe/issues](https://github.com/Liftof/shadow-transcribe/issues)

---

**Philosophie du projet :** Simplicité maximale. Un seul outil, un seul job, parfaitement exécuté. Pas de features superflues. Pas de dashboard. Pas de gamification. Juste : upload → résultat → bye.
