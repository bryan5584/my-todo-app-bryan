# Application Web To-Do List

Ce dépôt contient le code source d'une application web de gestion de tâches (To-Do List) développée dans le cadre d'une assignation technique.

## Technologies Utilisées

* **Frontend :** JavaScript (Vanilla JS), HTML5, CSS3
* **Backend :** Node.js avec Express.js
* **Base de Données :** PostgreSQL
* **Déploiement :** Render

## Fonctionnalités Principales

L'application offre une gestion complète des tâches avec les capacités suivantes :

* **Création, Lecture, Mise à jour, Suppression (CRUD)** de tâches.
* **Gestion des détails :** Chaque tâche peut inclure un titre, une description, une date d'échéance et une priorité (Haute, Moyenne, Basse, Aucune).
* **Filtrage et Tri :** Possibilité de rechercher des tâches et de les trier selon différents critères (date d'échéance, priorité, date de création, titre).
* **Statuts des tâches :** Marquage des tâches comme "terminées" et indicateurs visuels pour les dates d'échéance (en retard, bientôt dues, à long terme).
* **Support Multilingue :** L'interface utilisateur est disponible en plusieurs langues (Français, Anglais, Allemand, Espagnol, Italien, Portugais, Chinois, Japonais).
* **Déploiement Continu :** L'application est déployée en ligne, permettant un accès facile et des mises à jour rapides.

## Accès à l'Application Déployée

Vous pouvez accéder à l'application fonctionnelle directement via ce lien :
**[VOTRE LIEN VERS L'APPLICATION DÉPLOYÉE SUR RENDER]**
(Exemple : `https://ma-todo-list-bryan.onrender.com/`)

## Installation et Lancement Local (pour développement)

Pour lancer l'application en local :

1.  **Cloner le dépôt :**
    ```bash
    git clone [https://github.com/](https://github.com/)[VotreNomUtilisateur]/[NomDeVotreDepot].git
    cd [NomDeVotreDepot]
    ```
2.  **Configuration du Backend :**
    ```bash
    cd backend
    npm install
    ```
    Créez un fichier `.env` à la racine du dossier `backend` avec vos identifiants PostgreSQL :
    ```
    DATABASE_URL="postgresql://user:password@host:port/database"
    # Exemple pour un utilisateur local par défaut: DATABASE_URL="postgresql://postgres:password@localhost:5432/todo_db"
    PORT=3000
    ```
    Initialisez la base de données (si ce n'est pas déjà fait) :
    ```bash
    node init_db.js
    ```
    Lancez le serveur backend :
    ```bash
    npm start
    ```
3.  **Configuration du Frontend :**
    Le frontend est une application HTML/CSS/JS statique. Vous pouvez l'ouvrir directement dans votre navigateur depuis le dossier `frontend/index.html` ou utiliser un serveur HTTP simple (comme Live Server pour VS Code). Si le backend tourne sur un port différent du frontend (par exemple, 3000 pour le backend et 5500 pour le frontend avec Live Server), assurez-vous que les requêtes API sont dirigées vers le bon port backend.

---