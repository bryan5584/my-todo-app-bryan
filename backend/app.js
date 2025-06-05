const express = require('express');
const path = require('path');
const { Pool } = require('pg'); // Importe le client PostgreSQL
require('dotenv').config(); // Charge les variables d'environnement depuis .env

const app = express();

// Utilise le port fourni par Render ou 3000 si en local
const PORT = process.env.PORT || 3000; 

// --- Configuration de la base de données PostgreSQL ---
// Utilise la variable d'environnement DATABASE_URL fournie par Render.
// Si tu es en local, tu devras la définir manuellement (voir la note après le code).
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Important pour Render en mode gratuit, accepte les certificats auto-signés
    }
});

// Teste la connexion à la base de données
pool.on('connect', () => {
    console.log('Connecté à la base de données PostgreSQL !');
});

pool.on('error', (err) => {
    console.error('Erreur inattendue sur le pool de base de données', err);
    process.exit(-1); // Arrête l'application en cas d'erreur critique de DB
});

// --- Middlewares ---
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend'))); // Chemin ajusté pour la nouvelle arborescence

// Route par défaut pour servir index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// --- ROUTES API ---

// Initialise la table des tâches si elle n'existe pas
// Cela sera exécuté au démarrage du serveur
(async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS tasks (
                id SERIAL PRIMARY KEY,
                content VARCHAR(255) NOT NULL,
                done BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Ajout de created_at si absent
                due_date DATE,
                description TEXT,
                priority VARCHAR(50) DEFAULT 'Aucune'
            );
        `);
        console.log('Table "tasks" vérifiée ou créée.');
    } catch (err) {
        console.error('Erreur lors de la création de la table des tâches:', err);
    }
})();

// GET toutes les tâches
app.get('/api/tasks', async (req, res) => {
    try {
        // Sélectionne toutes les colonnes pour que le frontend ait toutes les données
        const result = await pool.query('SELECT id, content, done, created_at, due_date, description, priority FROM tasks ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('Erreur lors de la récupération des tâches:', err);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

// POST une nouvelle tâche
app.post('/api/tasks', async (req, res) => {
    // Récupère explicitement 'description' et 'priority' du corps de la requête
    const { content, dueDate, description, priority } = req.body; 
    if (!content) {
        return res.status(400).json({ message: 'Le contenu de la tâche est requis.' });
    }
    try {
        const result = await pool.query(
            // S'assure que description et priority sont insérés avec les valeurs du frontend
            'INSERT INTO tasks (content, done, due_date, description, priority) VALUES ($1, FALSE, $2, $3, $4) RETURNING *',
            [content, dueDate || null, description || null, priority || 'Aucune'] // Utilise les valeurs fournies
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Erreur lors de l\'ajout de la tâche:', err);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

// PUT/UPDATE une tâche existante
app.put('/api/tasks/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    // Récupère explicitement tous les champs possibles du corps de la requête
    const { done, content, dueDate, description, priority } = req.body;

    try {
        // Construit dynamiquement la requête de mise à jour pour ne modifier que les champs fournis
        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (typeof done === 'boolean') {
            updates.push(`done = $${paramIndex++}`);
            values.push(done);
        }
        if (content !== undefined) { // Utilise undefined pour vérifier si le champ est présent
            updates.push(`content = $${paramIndex++}`);
            values.push(content);
        }
        if (dueDate !== undefined) {
            updates.push(`due_date = $${paramIndex++}`);
            values.push(dueDate || null); // Permet de définir la date à null
        }
        if (description !== undefined) {
            updates.push(`description = $${paramIndex++}`);
            values.push(description || null); // Permet de définir la description à null
        }
        if (priority !== undefined) {
            updates.push(`priority = $${paramIndex++}`);
            values.push(priority);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'Aucune propriété à mettre à jour.' });
        }

        values.push(id); // L'ID est le dernier paramètre pour la clause WHERE
        const query = `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

        const result = await pool.query(query, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tâche non trouvée.' });
        }
        res.json(result.rows[0]);

    } catch (err) {
        console.error('Erreur lors de la mise à jour de la tâche:', err);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

// DELETE une tâche
app.delete('/api/tasks/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tâche non trouvée.' });
        }
        res.status(204).send(); // 204 No Content pour une suppression réussie
    } catch (err) {
        console.error('Erreur lors de la suppression de la tâche:', err);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

// Gérer les erreurs 404
app.use((req, res) => {
    res.status(404).send('Page non trouvée');
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});