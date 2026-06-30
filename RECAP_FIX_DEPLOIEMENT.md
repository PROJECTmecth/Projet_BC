# 🛠️ Récap Complet — Correction Erreur CORS / 502 sur Railway

**Date :** 19 mai 2026  
**Projet :** Bomba Cash (Frontend Vercel + Backend Laravel Railway)

---

## 🔴 Le Problème

Lors du déploiement, le frontend (Vercel) affichait cette erreur dans la console :

```
Access to XMLHttpRequest at 'https://projetbc-production-bombacash.up.railway.app/api/login'
from origin 'https://projet-bc.vercel.app' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**En réalité, ce n'était PAS une erreur CORS.** C'était une erreur **502 Bad Gateway** (serveur planté) déguisée en erreur CORS. Quand un serveur plante, il ne renvoie aucun en-tête CORS, et le navigateur interprète ça comme un blocage CORS.

---

## ✅ Les 3 Corrections Appliquées

---

### 1. Le Port Réseau (CAUSE PRINCIPALE)

**Où :** Railway → Projet_BC → Settings → **Networking**

| Paramètre | Avant (❌) | Après (✅) |
|---|---|---|
| Port Public | `10000` | `8080` |

**Explication :**  
Railway envoyait le trafic public au port **10000**, mais le serveur PHP (`php artisan serve`) écoutait sur le port **8080**. Le trafic n'arrivait jamais à l'application → Railway renvoyait **502 Bad Gateway**.

**Action :** Cliquer sur le crayon (✏️) à côté du domaine dans Networking et changer le port de `10000` à `8080`.

---

### 2. Les Variables d'Environnement

**Où :** Railway → Projet_BC → **Variables** → `{} Raw Editor`

Plusieurs variables étaient incorrectes :

| Variable | Avant (❌) | Après (✅) |
|---|---|---|
| `SESSION_DRIVER` | `projet-bc.vercel.app` | `file` |
| `CACHE_STORE` | `database` | `file` |
| `CACHE_DRIVER` | `database` | *(supprimé)* |
| `QUEUE_CONNECTION` | `database` | `sync` |
| `SESSION_DOMAIN` | `vercel.app` | *(supprimé)* |
| `CORS_ALLOWED_HEADERS` | valeur cassée | *(supprimé)* |
| `CORS_ALLOWED_METHODS` | `GET,POST,...` | *(supprimé)* |
| `CORS_ALLOWED_ORIGINS` | mal configuré | *(supprimé)* |
| `SANCTUM_STATEFUL_DOMAINS` | `projet-bc.vercel.app` | *(supprimé)* |

**Les 16 variables finales propres :**

```env
APP_KEY=base64:I2pkTCrVpe0lW43LkWOQtfT9xhoPn6Bfyye9EEyTAmA=
APP_ENV=production
APP_DEBUG=true
APP_URL=https://projetbc-production-bombacash.up.railway.app
FRONTEND_URL=https://projet-bc.vercel.app
DB_CONNECTION=mysql
DB_HOST=mysql.railway.internal
DB_PORT=3306
DB_DATABASE=railway
DB_USERNAME=root
DB_PASSWORD=oYTBRMNWmjTCEEvRdDvOwiJfAAuftJUZ
SESSION_DRIVER=file
CACHE_STORE=file
QUEUE_CONNECTION=sync
LOG_CHANNEL=stderr
LOG_LEVEL=debug
```

> ⚠️ **Note :** Les variables CORS (`CORS_ALLOWED_HEADERS`, etc.) ont été supprimées car elles interféraient avec le fichier `config/cors.php` qui gère déjà tout correctement dans le code.

---

### 3. Le fichier `backend/railway.json`

**Avant (❌) :**
```json
{
  "build": { "builder": "NIXPACKS" },
  "deploy": {
    "startCommand": "cp .env.railway .env || true; php artisan config:clear && php artisan cache:clear && php artisan route:clear && php artisan serve --host=0.0.0.0 --port=${PORT:-8080}"
  }
}
```

**Après (✅) :**
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "php artisan optimize:clear && php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=${PORT:-8080}",
    "healthcheckPath": "/up",
    "healthcheckTimeout": 300
  }
}
```

**Changements :**
- Supprimé `cp .env.railway .env` — Cette commande écrasait les variables Railway avec un fichier local potentiellement incorrect
- Remplacé les 3 commandes `clear` par `optimize:clear` (plus propre)
- Ajouté `migrate --force` pour appliquer les migrations automatiquement
- Ajouté le health check `/up` pour que Railway vérifie que le serveur est vivant

---

## 📁 Fichiers Backend (déjà corrects, aucune modification nécessaire)

| Fichier | Rôle | Statut |
|---|---|---|
| `config/cors.php` | Autorise `projet-bc.vercel.app` + pattern `*.vercel.app` | ✅ OK |
| `bootstrap/app.php` | Middleware `HandleCors` chargé en premier | ✅ OK |
| `app/Http/Controllers/Auth/AuthenticatedSessionController.php` | Login par Bearer Token Sanctum | ✅ OK |
| `public/index.php` | Point d'entrée Laravel standard | ✅ OK |

---

## 🔎 Paramètres Railway Vérifiés

| Paramètre | Valeur Correcte |
|---|---|
| Root Directory | `/backend` |
| Networking Port | `8080` |
| Custom Start Command | *(vide — géré par railway.json)* |
| Branche Git | `production` |

---

## ✅ Résultat Final

```bash
# Test health check
curl https://projetbc-production-bombacash.up.railway.app/up
→ HTTP 200 OK ✅ {"status":"ok"}

# Test API login
curl -X POST .../api/login -H "Origin: https://projet-bc.vercel.app"
→ HTTP 422 ✅ (validation normale)
→ Access-Control-Allow-Origin: https://projet-bc.vercel.app ✅
```

Le frontend Vercel peut maintenant communiquer avec le backend Railway sans erreur CORS.

---

## 📌 Leçon Retenue

> Quand le navigateur affiche une **"erreur CORS"**, toujours vérifier d'abord si le serveur backend **fonctionne réellement** en testant avec `curl` (sans navigateur). Une erreur **502/500** du serveur est souvent **masquée** en erreur CORS par le navigateur.

---

## ⚠️ À Faire Plus Tard

- [ ] Passer `APP_DEBUG=false` en production (pour la sécurité)
- [ ] Exécuter `php artisan db:seed` si la base de données est vide
