# Rapport de Tests Postman — Plateforme de Gestion de Clubs

> Tests effectués sur le backend Node.js + Express + MongoDB  
> Base URL : `http://localhost:5000/api`

---

## Configuration Postman

- Variable d'environnement : `base_url` = `http://localhost:5000/api`
- Variable `token` : remplie automatiquement après chaque login via script Post-response
- Authentification : onglet **Authorization → Bearer Token** (ne pas utiliser Headers manuellement)

**Script Post-response à ajouter sur chaque requête Login :**
```javascript
const response = pm.response.json();
if (response.token) {
    pm.environment.set("token", response.token);
}
```

---

## Résultats des Tests

### Étape 1 — Auth (sans token)

| # | Nom | Méthode | Route | Résultat | Statut |
|---|-----|---------|-------|----------|--------|
| 1 | Login admin | POST | `/auth/login` | `200` + token + `role: "admin"` | ✅ Valide |
| 2 | Login président | POST | `/auth/login` | `200` + token + `role: "president"` + `clubId` | ✅ Valide |
| 3 | Mauvais mot de passe | POST | `/auth/login` | `401` + `"Email ou mot de passe incorrect"` | ✅ Valide |
| 4 | Register nouveau compte | POST | `/auth/register` | ⚠️ **Erreur initiale** — `400 "next is not a function"` | 🔧 Corrigé |

**Correction appliquée pour le test 4 :**
Dans `User.model.js`, le hook `pre('save')` utilisait `next` qui n'est pas supporté en async avec Mongoose v7+.

```js
// AVANT (causait l'erreur)
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  ...
  next();
});

// APRÈS (corrigé)
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  ...
});
```
Après correction : `201` + token + `role: "member"` ✅

---

### Étape 2 — Profil (avec token)

| # | Nom | Méthode | Route | Résultat | Statut |
|---|-----|---------|-------|----------|--------|
| 5 | Récupérer mon profil | GET | `/auth/me` | ⚠️ **Erreur initiale** — `401 "Token invalide ou expiré"` | 🔧 Corrigé |

**Correction appliquée pour le test 5 :**
Le problème venait de la façon d'envoyer le token dans Postman. En utilisant l'onglet **Headers** manuellement, des erreurs de format survenaient.

**Solution :** Utiliser l'onglet **Authorization → Bearer Token** dans Postman au lieu de Headers.

Après correction : `200` + objet utilisateur complet sans mot de passe ✅

---

### Étape 3 — Clubs (public, sans token)

| # | Nom | Méthode | Route | Résultat | Statut |
|---|-----|---------|-------|----------|--------|
| 6 | Liste des clubs actifs | GET | `/clubs` | `200` + 3 clubs (Robotique, Théâtre, Football) | ✅ Valide |
| 7 | Filtrer par catégorie | GET | `/clubs?category=Tech` | `200` + Club de Robotique uniquement | ✅ Valide |
| 8 | Recherche par nom | GET | `/clubs?search=robot` | `200` + Club de Robotique | ✅ Valide |
| 9 | Détail d'un club | GET | `/clubs/:id` | `200` + objet club avec presidentId populated | ✅ Valide |
| 10a | Tous les clubs (admin) | GET | `/clubs/all` | `200` + 5 clubs (actifs + pending) | ✅ Valide |
| 10b | Tous les clubs (sans token) | GET | `/clubs/all` | `401` | ✅ Valide |

---

### Étape 4 — Événements

| # | Nom | Méthode | Route | Résultat | Statut |
|---|-----|---------|-------|----------|--------|
| 11 | Événements publics à venir | GET | `/events` | `200` + tableau upcoming publics | ✅ Valide |
| 12 | Créer un événement (président) | POST | `/events` | `201` + objet événement créé | ✅ Valide |
| 13 | Créer sans token | POST | `/events` | `401` | ✅ Valide |

---

### Étape 5 — Adhésions

| # | Nom | Méthode | Route | Résultat | Statut |
|---|-----|---------|-------|----------|--------|
| 14 | Rejoindre un club (membre) | POST | `/memberships` | `201` + `status: "pending"` | ✅ Valide |
| 15 | Mes adhésions | GET | `/memberships/me` | `200` + tableau avec clubId populated | ✅ Valide |
| 16 | Rejoindre le même club 2x | POST | `/memberships` | `400` + `"Vous avez déjà une demande"` | ✅ Valide |

---

### Étape 6 — Sondages

| # | Nom | Méthode | Route | Résultat | Statut |
|---|-----|---------|-------|----------|--------|
| 17 | Créer un sondage (président) | POST | `/polls` | `201` + sondage avec options et votesCount à 0 | ✅ Valide |
| 18 | Voter | POST | `/polls/:id/vote` | `200` + votesCount incrémenté | ✅ Valide |
| 19 | Voter deux fois | POST | `/polls/:id/vote` | `400` + `"Vous avez déjà voté"` | ✅ Valide |

---

### Étape 7 — Utilisateurs (admin)

| # | Nom | Méthode | Route | Résultat | Statut |
|---|-----|---------|-------|----------|--------|
| 20 | Liste des utilisateurs | GET | `/users` | `200` + tableau de tous les utilisateurs | ✅ Valide |
| 21 | Bannir un utilisateur | PATCH | `/users/:id` | `200` + `status: "banned"` | ✅ Valide |

---

## Récapitulatif Global

| Catégorie | Total tests | ✅ Valides | 🔧 Corrigés | ❌ Échoués |
|-----------|------------|-----------|------------|-----------|
| Auth | 4 | 3 | 1 | 0 |
| Profil | 1 | 0 | 1 | 0 |
| Clubs | 6 | 6 | 0 | 0 |
| Événements | 3 | 3 | 0 | 0 |
| Adhésions | 3 | 3 | 0 | 0 |
| Sondages | 3 | 3 | 0 | 0 |
| Utilisateurs | 2 | 2 | 0 | 0 |
| **Total** | **22** | **20** | **2** | **0** |

---

## Corrections appliquées durant les tests

### Correction 1 — `User.model.js`
**Problème :** `400 Bad Request — "next is not a function"`  
**Cause :** Mongoose v7+ ne supporte pas `next` dans les hooks async  
**Fix :** Supprimer le paramètre `next` du hook `pre('save')`

### Correction 2 — Postman (configuration)
**Problème :** `401 — Token invalide ou expiré` sur `GET /auth/me`  
**Cause :** Token mal formaté en passant par l'onglet Headers manuellement  
**Fix :** Utiliser l'onglet **Authorization → Bearer Token** dans Postman

---

## Codes HTTP utilisés

| Code | Signification | Utilisé pour |
|------|--------------|-------------|
| `200` | Succès | GET, PUT, PATCH |
| `201` | Créé avec succès | POST (register, créer club, événement...) |
| `400` | Données invalides | Doublon, champ manquant |
| `401` | Non authentifié | Token manquant ou invalide |
| `403` | Non autorisé | Rôle insuffisant |
| `404` | Introuvable | Ressource inexistante |

---

## Prochaine étape

Les tests Postman sont tous validés. Le backend est prêt.  
**Prochaine étape :** Lancer le frontend React et tester le flux complet en connectant les deux.

```bash
# Lancer le backend (terminal 1)
cd backend
node server.js

# Lancer le frontend (terminal 2)
cd plateforme-clubs
npm start
```

---

*Rapport généré le 29 juillet 2026*  
*Backend : Node.js + Express + MongoDB*  
*Tests effectués avec Postman*