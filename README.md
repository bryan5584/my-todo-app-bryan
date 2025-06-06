# Notes de Projet : Application To-Do List (JavaScript/Express.js)

---

## 1. Objectif de la Mission

Développer une **application web fonctionnelle de gestion de tâches (To-Do List)** en utilisant JavaScript. Cette mission vise à couvrir les étapes clés d'un projet web : définition des besoins, configuration de l'environnement, architecture, codage (front-end et back-end), tests et déploiement.

## 2. Fonctionnalités Clés (MVP - Minimum Viable Product)

L'application doit permettre à un utilisateur de :

* **Afficher** la liste de toutes les tâches existantes.
* **Ajouter** une nouvelle tâche à la liste via un formulaire.
* **Marquer** une tâche comme "terminée" (ou la "dé-marquer").
* **Supprimer** une tâche de la liste.

_Note : Pour cette première version, les tâches seront stockées en **mémoire vive** sur le serveur. Elles ne seront donc pas persistantes si le serveur est redémarré._

## 3. Technologies et Architecture Choisies

* **Langage Principal :** JavaScript.
* **Back-end (Côté Serveur) :**
    * **Node.js** (environnement d'exécution JavaScript).
    * **Express.js** (framework web minimaliste pour Node.js).
    * Express.js gérera les requêtes HTTP (ex: ajouter une tâche) et les réponses.
    * Les tâches seront stockées dans un tableau JavaScript (`Array`) en mémoire.
* **Front-end (Côté Client - Navigateur) :**
    * **HTML** (pour la structure de la page).
    * **CSS** (pour la mise en forme et le style).
    * **JavaScript** (pour l'interaction dynamique avec l'utilisateur et la communication asynchrone avec le back-end via des requêtes HTTP).

## 4. Structure du Projet (Dossiers et Fichiers Clés)




test 1