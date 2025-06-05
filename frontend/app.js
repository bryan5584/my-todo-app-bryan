// Code JavaScript pour le front-end de l'application To-Do List

document.addEventListener('DOMContentLoaded', () => {
    const addTaskForm = document.getElementById('addTaskForm');
    const taskInput = document.querySelector('#addTaskForm input[type="text"]');
    const dueDateInput = document.querySelector('#addTaskForm input[type="date"]');
    const taskList = document.getElementById('taskList');
    const noTasksMessage = document.getElementById('noTasksMessage');

    // --- NOUVEAUX ÉLÉMENTS POUR LA MODALE ---
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-button">&times;</span>
            <h2>Détails de la tâche</h2>
            <div class="task-detail-item">
                <label for="modal-task-title">Titre:</label>
                <input type="text" id="modal-task-title" class="editable-field">
            </div>
            <div class="task-detail-item">
                <label for="modal-task-description">Description:</label>
                <textarea id="modal-task-description" class="editable-field" rows="3" placeholder="Ajouter une description..."></textarea>
            </div>
            <div class="task-detail-item">
                <label for="modal-task-due-date">Date d'échéance:</label>
                <input type="date" id="modal-task-due-date" class="editable-field">
            </div>
            <div class="task-detail-item">
                <label for="modal-task-priority">Priorité:</label>
                <select id="modal-task-priority" class="editable-field">
                    <option value="Aucune">Aucune</option>
                    <option value="Basse">Basse</option>
                    <option value="Moyenne">Moyenne</option>
                    <option value="Haute">Haute</option>
                </select>
            </div>
            <button id="saveTaskDetails" class="save-button">Enregistrer</button>
        </div>
    `;
    document.body.appendChild(modal);

    const closeButton = modal.querySelector('.close-button');
    const modalTaskTitle = modal.querySelector('#modal-task-title');
    const modalTaskDescription = modal.querySelector('#modal-task-description');
    const modalTaskDueDate = modal.querySelector('#modal-task-due-date');
    const modalTaskPriority = modal.querySelector('#modal-task-priority');
    const saveTaskDetailsButton = modal.querySelector('#saveTaskDetails');

    let currentEditingTask = null; // Pour garder une référence à la tâche en cours d'édition

    // Gère la fermeture de la modale
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Gère l'enregistrement des détails de la tâche depuis la modale
    saveTaskDetailsButton.addEventListener('click', async () => {
        if (currentEditingTask) {
            const newContent = modalTaskTitle.value.trim();
            const newDescription = modalTaskDescription.value.trim();
            const newDueDate = modalTaskDueDate.value.trim();
            const newPriority = modalTaskPriority.value;

            if (!newContent) {
                alert("Le titre de la tâche ne peut pas être vide !");
                return;
            }

            try {
                const response = await fetch(`/api/tasks/${currentEditingTask.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        content: newContent, 
                        description: newDescription || null,
                        dueDate: newDueDate || null,
                        priority: newPriority
                    })
                });
                if (response.ok) {
                    modal.style.display = 'none';
                    fetchTasks(); // Recharger les tâches pour voir les modifications
                } else {
                    console.error('Erreur lors de la mise à jour des détails de la tâche:', response.statusText);
                }
            } catch (error) {
                console.error('Erreur réseau lors de la mise à jour des détails de la tâche:', error);
            }
        }
    });
    // --- FIN NOUVEAUX ÉLÉMENTS POUR LA MODALE ---


    // Fonction pour charger et afficher les tâches
    async function fetchTasks() {
        try {
            const response = await fetch('/api/tasks');
            const tasks = await response.json();

            taskList.innerHTML = ''; // Vide la liste actuelle

            if (tasks.length === 0) {
                noTasksMessage.style.display = 'block';
            } else {
                noTasksMessage.style.display = 'none';
                // Trie les tâches: faites à la fin, puis par priorité (Haute > Moyenne > Basse > Aucune), puis par date
                tasks.sort((a, b) => {
                    // 1. Les tâches faites vont à la fin
                    if (a.done && !b.done) return 1;
                    if (!a.done && b.done) return -1;

                    // 2. Si les deux sont faites ou non faites, on trie par priorité
                    const priorityOrder = { 'Haute': 1, 'Moyenne': 2, 'Basse': 3, 'Aucune': 4 };
                    const priorityA = priorityOrder[a.priority || 'Aucune'];
                    const priorityB = priorityOrder[b.priority || 'Aucune'];
                    if (priorityA !== priorityB) {
                        return priorityA - priorityB;
                    }

                    // 3. Si priorités égales, on trie par date
                    const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
                    const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
                    return dateA - dateB;
                });

                tasks.forEach(task => {
                    renderTask(task);
                });
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des tâches:', error);
            noTasksMessage.style.display = 'block';
            noTasksMessage.textContent = 'Erreur de chargement des tâches.';
        }
    }

    // Fonction pour afficher une tâche individuelle dans la liste
    function renderTask(task) {
        const li = document.createElement('li');
        li.dataset.id = task.id;
        if (task.done) {
            li.classList.add('done');
        }

        const taskContentWrapper = document.createElement('span');
        taskContentWrapper.classList.add('task-content');

        const taskTextSpan = document.createElement('span');
        taskTextSpan.textContent = task.content;
        taskTextSpan.classList.add('task-text'); // Ajout d'une classe pour styliser le texte de la tâche si besoin
        taskContentWrapper.appendChild(taskTextSpan);

        // --- NOUVEAU : Affichage de la priorité ---
        const prioritySpan = document.createElement('span');
        prioritySpan.textContent = `Priorité: ${task.priority || 'Aucune'}`;
        prioritySpan.classList.add('task-priority');
        prioritySpan.classList.add(`priority-${(task.priority || 'Aucune').toLowerCase()}`); // Ajoute une classe pour la couleur
        taskContentWrapper.appendChild(prioritySpan);
        // --- FIN NOUVEAU ---

        // Rendre le texte de la tâche et la priorité cliquables pour ouvrir la modale
        taskTextSpan.style.cursor = 'pointer';
        taskTextSpan.title = "Cliquer pour voir les détails de la tâche";
        taskTextSpan.addEventListener('click', () => {
            currentEditingTask = task;
            modalTaskTitle.value = task.content;
            modalTaskDescription.value = task.description || '';
            modalTaskDueDate.value = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '';
            modalTaskPriority.value = task.priority || 'Aucune';
            modal.style.display = 'block';
        });

        // Même pour la priorité (si tu veux qu'un clic sur la priorité ouvre la modale aussi)
        prioritySpan.style.cursor = 'pointer';
        prioritySpan.title = "Cliquer pour modifier la priorité";
        prioritySpan.addEventListener('click', () => {
            currentEditingTask = task;
            modalTaskTitle.value = task.content;
            modalTaskDescription.value = task.description || '';
            modalTaskDueDate.value = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '';
            modalTaskPriority.value = task.priority || 'Aucune';
            modal.style.display = 'block';
            modalTaskPriority.focus();
        });


        // LOGIQUE POUR LA DATE ET LA COULEUR
        const dueDateContainer = document.createElement('span');
        dueDateContainer.classList.add('due-date-container');

        if (task.dueDate) {
            const dueDateObj = new Date(task.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const oneWeekLater = new Date(today);
            oneWeekLater.setDate(today.getDate() + 7);
            oneWeekLater.setHours(0, 0, 0, 0);

            const dueDateSpan = document.createElement('span');
            dueDateSpan.textContent = `Échéance: ${dueDateObj.toLocaleDateString('fr-FR')}`;
            dueDateSpan.classList.add('due-date');

            if (dueDateObj < today) {
                dueDateSpan.classList.add('overdue');
            } else if (dueDateObj <= oneWeekLater) {
                dueDateSpan.classList.add('soon-due');
            } else {
                dueDateSpan.classList.add('long-term');
            }
            dueDateContainer.appendChild(dueDateSpan);

            // Rendre le span de date cliquable pour ouvrir la modale
            dueDateSpan.style.cursor = 'pointer';
            dueDateSpan.title = "Cliquer pour modifier la date d'échéance";
            dueDateSpan.addEventListener('click', () => {
                currentEditingTask = task;
                modalTaskTitle.value = task.content;
                modalTaskDescription.value = task.description || '';
                modalTaskDueDate.value = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '';
                modalTaskPriority.value = task.priority || 'Aucune';
                modal.style.display = 'block';
                modalTaskDueDate.focus();
            });

        } else {
            // Message cliquable pour ajouter une date si la tâche n'en a pas
            const addDateSpan = document.createElement('span');
            addDateSpan.textContent = "Ajouter une date d'échéance";
            addDateSpan.classList.add('add-date-placeholder');
            addDateSpan.style.cursor = 'pointer';
            addDateSpan.title = "Cliquer pour ajouter une date d'échéance";
            addDateSpan.addEventListener('click', () => {
                currentEditingTask = task;
                modalTaskTitle.value = task.content;
                modalTaskDescription.value = task.description || '';
                modalTaskDueDate.value = '';
                modalTaskPriority.value = task.priority || 'Aucune';
                modal.style.display = 'block';
                modalTaskDueDate.focus();
            });
            dueDateContainer.appendChild(addDateSpan);
        }
        taskContentWrapper.appendChild(dueDateContainer);


        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('actions');

        const completeButton = document.createElement('button');
        completeButton.textContent = task.done ? 'Annuler' : 'Fait';
        completeButton.classList.add('complete');
        completeButton.addEventListener('click', async () => {
            const response = await fetch(`/api/tasks/${task.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ done: !task.done })
            });
            if (response.ok) {
                fetchTasks();
            } else {
                console.error('Erreur lors de la mise à jour de la tâche:', response.statusText);
            }
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'X';
        deleteButton.classList.add('delete');
        deleteButton.addEventListener('click', async () => {
            if (confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
                const response = await fetch(`/api/tasks/${task.id}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    fetchTasks();
                } else {
                    console.error('Erreur lors de la suppression de la tâche:', response.statusText);
                }
            }
        });

        actionsDiv.appendChild(completeButton);
        actionsDiv.appendChild(deleteButton);

        li.appendChild(taskContentWrapper);
        li.appendChild(actionsDiv);
        taskList.appendChild(li);
    }

    // Gère l'ajout d'une nouvelle tâche
    addTaskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const content = taskInput.value.trim();
        const dueDate = dueDateInput.value; 

        if (content) {
            try {
                const response = await fetch('/api/tasks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: content, dueDate: dueDate }) 
                });
                if (response.ok) {
                    taskInput.value = '';
                    dueDateInput.value = ''; 
                    fetchTasks();
                } else {
                    console.error('Erreur lors de l\'ajout de la tâche:', response.statusText);
                }
            } catch (error) {
                console.error('Erreur lors de l\'ajout de la tâche:', error);
            }
        }
    });

    // Charge les tâches au démarrage de la page
    fetchTasks();
});