const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Simule une base de données avec un tableau en mémoire
let tasks = [
    { id: 1, content: 'Apprendre Node.js', done: false, dueDate: '2025-06-15', description: 'Revoir les bases d\'Express et les middlewares.', priority: 'Haute' }, // Exemple avec priorité
    { id: 2, content: 'Finir le projet To-Do List', done: false, dueDate: '2025-06-07', description: null, priority: 'Moyenne' },
    { id: 3, content: 'Imprimer mes documents', done: true, dueDate: '2025-06-05', description: 'Billets d\'avion et réservation hôtel.', priority: 'Basse' },
    { id: 4, content: 'Acheter du pain', done: false, dueDate: null, description: null, priority: 'Aucune' }
];
let nextId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;

// --- Middlewares ---
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend'))); // Chemin ajusté pour la nouvelle arborescence

// --- ROUTES API ---

app.get('/api/tasks', (req, res) => {
    res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
    const { content, dueDate } = req.body;
    if (!content) {
        return res.status(400).json({ message: 'Le contenu de la tâche est requis.' });
    }
    // Ajout de 'priority: "Aucune"' par défaut
    const newTask = { id: nextId++, content, done: false, dueDate: dueDate || null, description: null, priority: 'Aucune' };
    tasks.push(newTask);
    res.status(201).json(newTask);
});

app.put('/api/tasks/:id', (req, res) => {
    const id = parseInt(req.params.id);
    // Récupère toutes les propriétés possibles à mettre à jour, y compris la description et la priorité
    const { done, content, dueDate, description, priority } = req.body;

    const taskIndex = tasks.findIndex(task => task.id === id);

    if (taskIndex === -1) {
        return res.status(404).json({ message: 'Tâche non trouvée.' });
    }

    // Mise à jour des propriétés si elles sont fournies
    if (typeof done === 'boolean') {
        tasks[taskIndex].done = done;
    }
    if (content !== undefined) {
        tasks[taskIndex].content = content;
    }
    if (dueDate !== undefined) {
        tasks[taskIndex].dueDate = dueDate || null;
    }
    if (description !== undefined) {
        tasks[taskIndex].description = description || null;
    }
    // Mise à jour de la priorité
    if (priority !== undefined) {
        tasks[taskIndex].priority = priority;
    }

    res.json(tasks[taskIndex]);
});

app.delete('/api/tasks/:id', (req, res) => {
    const id = parseInt(req.params.id);

    const initialLength = tasks.length;
    tasks = tasks.filter(task => task.id !== id);

    if (tasks.length === initialLength) {
        return res.status(404).json({ message: 'Tâche non trouvée.' });
    }

    res.status(204).send();
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});