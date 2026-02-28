Projet-BC/
├── backend/→  Laravel (PHP)
└── frontend/→  React(javascript)
├──Readme
    readme.md
Base de données:bomba_cash

Étapes détaillées pour cloner le projet
        *backend
1.Se placer dans le dossier backend :
    -cd backend

2.Installer les dépendances PHP :
    -composer install
  Cela télécharge toutes les librairies Laravel nécessaires (contenues dans vendor/)

3.Créer le fichier .env à partir du modèle :
    -cp .env.example .env
 cela permettre à Chaque collaborateur de créer son propre .env local.
 Ensuite, il doit modifier les valeurs pour sa machine (base de données, mot de passe, URL).

4.Générer la clé de l’application Laravel :
    -php artisan key:generate
  Cette commande mettra à jour APP_KEY dans le .env.

Obligatoire pour que Laravel fonctionne correctement.

        *frontend
1. cd frontend
2. npm install: # installe les dépendances npm
3. npm run dev  # lancer le serveur React



