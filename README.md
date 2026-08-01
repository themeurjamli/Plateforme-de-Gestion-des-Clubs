# 🏛 Plateforme de Gestion de Clubs Associatifs

Plateforme fullstack permettant aux étudiants de découvrir, rejoindre et gérer des clubs associatifs.

---

## 📋 Table des matières

- [Aperçu](#aperçu)
- [Stack technique](#stack-technique)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Lancer le projet](#lancer-le-projet)
- [Comptes de test](#comptes-de-test)
- [Structure du projet](#structure-du-projet)
- [Routes API](#routes-api)
- [Fonctionnalités](#fonctionnalités)

---

## Aperçu

La plateforme permet à 4 types d'utilisateurs d'interagir avec les clubs :

| Rôle | Droits |
|------|--------|
| **Visiteur** | Consulter les clubs et événements publics |
| **Membre** | Rejoindre des clubs, s'inscrire aux événements, voter aux sondages |
| **Président** | Gérer son club, membres, événements, sondages et galerie |
| **Super Admin** | Valider les clubs, gérer les utilisateurs, voir les statistiques |

---

## Stack technique

### Frontend
- React 18 + TypeScript
- React Router DOM
- Axios
- Recharts (graphiques)

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT (authentification)
- bcryptjs (hashage des mots de passe)

---

## Prérequis

Avant de commencer, assure-toi d'avoir installé :

- [Node.js](https://nodejs.org/) v18+
- [MongoDB Community Server](https://www.mongodb.com/try/download/community)
- npm v9+

---

## Installation

### 1. Cloner le projet

```bash
git clone https://github.com/ton-username/plateforme-clubs.git
cd plateforme-clubs
```

### 2. Installer les dépendances backend

```bash
cd backend
npm install
```

### 3. Configurer les variables d'environnement backend

Crée un fichier `backend/.env` :

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/plateforme_clubs
JWT_SECRET=change_moi_en_production
JWT_EXPIRE=7d
```

### 4. Seeder la base de données

```bash
cd backend
node seed.js
```

Tu verras :
```
✅ Seed terminé avec succès !
📋 Comptes de test (mot de passe : password123)
```

### 5. Installer les dépendances frontend

```bash
cd ..
npm install
```

### 6. Configurer les variables d'environnement frontend

Crée un fichier `.env` à la racine du frontend :

```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Lancer le projet

### Terminal 1 — Backend

```bash
cd backend
node server.js
```

Tu dois voir :
```
✅ MongoDB connecté : localhost
🚀 Serveur lancé sur http://localhost:5000
```

Vérifie que le serveur fonctionne :
```
http://localhost:5000/api/health
```

### Terminal 2 — Frontend

```bash
npm start
```

L'application s'ouvre automatiquement sur :
```
http://localhost:3000
```

---

## Comptes de test

Mot de passe pour tous les comptes : **`password123`**

| Email | Rôle | Accès |
|-------|------|-------|
| `admin@test.com` | Super Admin | `/admin` |
| `president@test.com` | Président | `/dashboard` |
| `member@test.com` | Membre | `/mes-clubs` |
| `member2@test.com` | Membre | `/mes-clubs` |

---

## Structure du projet

```
plateforme-clubs/
│
├── backend/                    ← API Node.js + Express
│   ├── config/
│   │   └── db.js               ← Connexion MongoDB
│   ├── middleware/
│   │   └── auth.js             ← Vérification JWT
│   ├── models/
│   │   ├── User.model.js
│   │   ├── Club.model.js
│   │   ├── Membership.model.js
│   │   ├── Event.model.js
│   │   └── Poll.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── clubs.routes.js
│   │   ├── members.routes.js
│   │   ├── events.routes.js
│   │   ├── polls.routes.js
│   │   └── users.routes.js
│   ├── seed.js                 ← Données de test
│   ├── server.js               ← Point d'entrée
│   └── .env                    ← Variables d'environnement
│
└── src/                        ← Application React
    ├── components/
    │   ├── layout/             ← Navbar, Sidebar
    │   └── ui/                 ← Button, Badge, Input, StatCard...
    ├── context/
    │   ├── AuthContext.tsx     ← Authentification globale
    │   └── ToastContext.tsx    ← Notifications globales
    ├── pages/
    │   ├── dashboard/          ← Pages président
    │   └── admin/              ← Pages super admin
    ├── services/               ← Appels API axios
    ├── types/                  ← Types TypeScript
    ├── utils/                  ← Scoring, badges
    └── App.tsx                 ← Routes
```

---

## Routes API

### Auth
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/register` | Créer un compte |
| POST | `/api/auth/login` | Se connecter |
| GET | `/api/auth/me` | Profil connecté |
| PUT | `/api/auth/me` | Modifier son profil |

### Clubs
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/clubs` | Liste des clubs actifs |
| GET | `/api/clubs/all` | Tous les clubs (admin) |
| GET | `/api/clubs/ranking` | Classement par points |
| GET | `/api/clubs/:id` | Détail d'un club |
| GET | `/api/clubs/:id/score` | Score d'un club |
| POST | `/api/clubs` | Créer un club |
| PUT | `/api/clubs/:id` | Modifier un club |
| PATCH | `/api/clubs/:id/status` | Changer le statut |
| DELETE | `/api/clubs/:id` | Supprimer un club |

### Adhésions
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/memberships` | Rejoindre un club |
| GET | `/api/memberships/me` | Mes adhésions |
| PATCH | `/api/memberships/:id` | Accepter/refuser |
| DELETE | `/api/memberships/:id` | Retirer un membre |

### Événements
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/events` | Événements publics |
| GET | `/api/events/club/:clubId` | Événements d'un club |
| POST | `/api/events` | Créer un événement |
| PUT | `/api/events/:id` | Modifier un événement |
| DELETE | `/api/events/:id` | Supprimer un événement |
| POST | `/api/events/:id/register` | S'inscrire |
| DELETE | `/api/events/:id/register` | Se désinscrire |

### Sondages
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/polls/club/:clubId` | Sondages d'un club |
| POST | `/api/polls` | Créer un sondage |
| POST | `/api/polls/:id/vote` | Voter |
| PATCH | `/api/polls/:id/close` | Clôturer |
| DELETE | `/api/polls/:id` | Supprimer |

---

## Fonctionnalités

### 🏛 Gestion des clubs
- Création de club (soumis pour validation admin)
- Modification des informations
- Galerie photo persistée
- Statuts : pending → active / rejected / inactive

### 👥 Gestion des membres
- Demande d'adhésion
- Acceptation / refus par le président
- Bannissement par l'admin

### 📅 Événements
- Création avec capacité maximale optionnelle
- Visibilité publique ou membres seulement
- Inscription / désinscription

### 📊 Sondages
- Création avec options multiples (2 à 6)
- Vote unique par utilisateur
- Clôture manuelle par le président
- Affichage des résultats en temps réel

### 🏆 Système de gamification
- **Points par club** : membres (+5), événements (+10), événement complet (+15 bonus), sondages actifs (+8)
- **Niveaux** : Bronze (0-99) → Argent (100-299) → Or (300-599) → Platine (600+)
- **Classement** public des clubs
- **Badges membres** : Premier pas, Explorateur, Assidu, Votant actif, Fidèle, Hyperactif

### 📈 Dashboard Admin
- Statistiques globales avec graphiques (Recharts)
- Validation / rejet des clubs
- Gestion des utilisateurs (rôles, bannissement)
- Vue globale des événements

---

## Auteur

Projet réalisé dans le cadre d'un stage.

---

*Plateforme de Gestion de Clubs Associatifs — 2026*