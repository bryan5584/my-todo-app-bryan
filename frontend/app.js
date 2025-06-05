// Code JavaScript pour le front-end de l'application To-Do List (avec i18n et modale d'édition)

document.addEventListener('DOMContentLoaded', () => {
    const addTaskForm = document.getElementById('addTaskForm');
    const taskInput = document.querySelector('#addTaskForm input[type="text"]');
    const dueDateInput = document.querySelector('#addTaskForm input[type="date"]');
    const priorityInput = document.getElementById('addTaskPriority'); // Nouveau: sélecteur de priorité pour l'ajout
    const taskList = document.getElementById('taskList');
    const noTasksMessage = document.getElementById('noTasksMessage');
    const languageSelect = document.getElementById('language-select');

    let translations = {};
    let currentLang = localStorage.getItem('lang') || 'fr';

    // --- FONCTIONS D'INTERNATIONALISATION ---

    async function loadTranslations(lang) {
        try {
            const response = await fetch(`./locales/${lang}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load translation for ${lang}`);
            }
            translations = await response.json();
            localStorage.setItem('lang', lang);
            applyTranslations();
            languageSelect.value = lang;
        } catch (error) {
            console.error('Error loading translations:', error);
            // Si la langue préférée échoue, essayez l'anglais comme fallback
            if (lang !== 'en') {
                loadTranslations('en');
            }
        }
    }

    function translateText(key) {
        return translations[key] || `[${key}]`;
    }

    function applyTranslations() {
        document.querySelector('header h1').textContent = translateText('appTitle');
        taskInput.placeholder = translateText('addTaskPlaceholder');
        dueDateInput.placeholder = translateText('dueDatePlaceholder');
        
        // Traduction des options de priorité pour le formulaire d'ajout
        // Assurez-vous que ces éléments existent avant d'essayer de les traduire
        const addTaskPriorityNone = document.querySelector('#addTaskPriority option[value="Aucune"]');
        if (addTaskPriorityNone) addTaskPriorityNone.textContent = translateText('priorityNone');
        const addTaskPriorityLow = document.querySelector('#addTaskPriority option[value="Basse"]');
        if (addTaskPriorityLow) addTaskPriorityLow.textContent = translateText('priorityLow');
        const addTaskPriorityMedium = document.querySelector('#addTaskPriority option[value="Moyenne"]');
        if (addTaskPriorityMedium) addTaskPriorityMedium.textContent = translateText('priorityMedium');
        const addTaskPriorityHigh = document.querySelector('#addTaskPriority option[value="Haute"]');
        if (addTaskPriorityHigh) addTaskPriorityHigh.textContent = translateText('priorityHigh');
        
        document.querySelector('#addTaskForm button[type="submit"]').textContent = translateText('addButton');
        noTasksMessage.textContent = translateText('noTasksMessage');

        // Modale
        modal.querySelector('h2').textContent = translateText('taskDetailsTitle');
        modal.querySelector('label[for="modal-task-title"]').textContent = translateText('titleLabel');
        modal.querySelector('label[for="modal-task-description"]').textContent = translateText('descriptionLabel');
        modal.querySelector('#modal-task-description').placeholder = translateText('descriptionPlaceholder');
        modal.querySelector('label[for="modal-task-due-date"]').textContent = translateText('dueDateLabel');
        modal.querySelector('label[for="modal-task-priority"]').textContent = translateText('priorityLabel');
        
        // Traduction des options de priorité pour la modale (important de les mettre à jour ici aussi)
        const modalPriorityNone = modal.querySelector('#modal-task-priority option[value="Aucune"]');
        if (modalPriorityNone) modalPriorityNone.textContent = translateText('priorityNone');
        const modalPriorityLow = modal.querySelector('#modal-task-priority option[value="Basse"]');
        if (modalPriorityLow) modalPriorityLow.textContent = translateText('priorityLow');
        const modalPriorityMedium = modal.querySelector('#modal-task-priority option[value="Moyenne"]');
        if (modalPriorityMedium) modalPriorityMedium.textContent = translateText('priorityMedium');
        const modalPriorityHigh = modal.querySelector('#modal-task-priority option[value="Haute"]');
        if (modalPriorityHigh) modalPriorityHigh.textContent = translateText('priorityHigh');
        
        saveTaskDetailsButton.textContent = translateText('saveButton');

        // Met à jour les options du sélecteur de langue
        languageSelect.querySelector('option[value="fr"]').textContent = translateText('languageFrench');
        languageSelect.querySelector('option[value="en"]').textContent = translateText('languageEnglish');
        languageSelect.querySelector('option[value="de"]').textContent = translateText('languageGerman');
        // Assurez-vous que les options des autres langues existent et sont traduites si vous les gardez
        // languageSelect.querySelector('option[value="es"]').textContent = translateText('languageSpanish');
        // ...
        languageSelect.value = currentLang;

        fetchTasks(); // Re-rendre les tâches pour appliquer les nouvelles traductions
    }

    languageSelect.addEventListener('change', (e) => {
        currentLang = e.target.value;
        loadTranslations(currentLang);
    });

    // --- FIN FONCTIONS D'INTERNATIONALISATION ---


    // --- ÉLÉMENTS DE LA MODALE ---
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-button">&times;</span>
            <h2>${translateText('taskDetailsTitle')}</h2>
            <div class="task-detail-item">
                <label for="modal-task-title">${translateText('titleLabel')}</label>
                <input type="text" id="modal-task-title" class="editable-field">
            </div>
            <div class="task-detail-item">
                <label for="modal-task-description">${translateText('descriptionLabel')}</label>
                <textarea id="modal-task-description" class="editable-field" rows="3" placeholder="${translateText('descriptionPlaceholder')}"></textarea>
            </div>
            <div class="task-detail-item">
                <label for="modal-task-due-date">${translateText('dueDateLabel')}</label>
                <input type="date" id="modal-task-due-date" class="editable-field">
            </div>
            <div class="task-detail-item">
                <label for="modal-task-priority">${translateText('priorityLabel')}</label>
                <select id="modal-task-priority" class="editable-field">
                    <option value="Aucune">${translateText('priorityNone')}</option>
                    <option value="Basse">${translateText('priorityLow')}</option>
                    <option value="Moyenne">${translateText('priorityMedium')}</option>
                    <option value="Haute">${translateText('priorityHigh')}</option>
                </select>
            </div>
            <button id="saveTaskDetails" class="save-button">${translateText('saveButton')}</button>
        </div>
    `;
    document.body.appendChild(modal);

    const closeButton = modal.querySelector('.close-button');
    const modalTaskTitle = modal.querySelector('#modal-task-title');
    const modalTaskDescription = modal.querySelector('#modal-task-description');
    const modalTaskDueDate = modal.querySelector('#modal-task-due-date');
    const modalTaskPriority = modal.querySelector('#modal-task-priority');
    const saveTaskDetailsButton = modal.querySelector('#saveTaskDetails');

    let currentEditingTask = null;

    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    saveTaskDetailsButton.addEventListener('click', async () => {
        if (currentEditingTask) {
            const newContent = modalTaskTitle.value.trim();
            const newDescription = modalTaskDescription.value.trim();
            const newDueDate = modalTaskDueDate.value.trim();
            const newPriority = modalTaskPriority.value;

            if (!newContent) {
                alert(translateText('taskTitleEmptyAlert'));
                return;
            }

            try {
                const response = await fetch(`/api/tasks/${currentEditingTask.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        content: newContent,
                        description: newDescription || null,
                        dueDate: newDueDate || null, // le backend attend 'dueDate'
                        priority: newPriority
                    })
                });
                if (response.ok) {
                    modal.style.display = 'none';
                    fetchTasks();
                } else {
                    console.error('Erreur lors de la mise à jour des détails de la tâche:', response.statusText);
                }
            } catch (error) {
                console.error('Erreur réseau lors de la mise à jour des détails de la tâche:', error);
            }
        }
    });


    // Fonction pour charger et afficher les tâches
    async function fetchTasks() {
        try {
            const response = await fetch('/api/tasks');
            const tasks = await response.json();

            taskList.innerHTML = '';

            if (tasks.length === 0) {
                noTasksMessage.style.display = 'block';
            } else {
                noTasksMessage.style.display = 'none';
                tasks.sort((a, b) => {
                    if (a.done && !b.done) return 1;
                    if (!a.done && b.done) return -1;

                    const priorityOrder = { 'Haute': 1, 'Moyenne': 2, 'Basse': 3, 'Aucune': 4 };
                    const priorityA = priorityOrder[a.priority || 'Aucune'];
                    const priorityB = priorityOrder[b.priority || 'Aucune'];
                    if (priorityA !== priorityB) {
                        return priorityA - priorityB;
                    }

                    // Correction ici pour s'assurer que les dates nulles sont bien gérées comme étant "après" les dates existantes
                    const dateA = a.due_date ? new Date(a.due_date).getTime() : Infinity; // Utilise due_date
                    const dateB = b.due_date ? new Date(b.due_date).getTime() : Infinity; // Utilise due_date
                    return dateA - dateB;
                });

                tasks.forEach(task => {
                    renderTask(task);
                });
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des tâches:', error);
            noTasksMessage.style.display = 'block';
            noTasksMessage.textContent = translateText('noTasksMessage');
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
        taskTextSpan.classList.add('task-text');

        // Permet l'édition du texte de la tâche au double-clic (pour l'édition inline rapide)
        taskTextSpan.contentEditable = "true";
        taskTextSpan.setAttribute('role', 'textbox');
        taskTextSpan.setAttribute('aria-label', `${translateText('titleLabel')} ${task.content}`);
        taskTextSpan.title = translateText('doubleClickToEdit');

        // Gère la sauvegarde du texte de la tâche après édition inline
        taskTextSpan.addEventListener('blur', async () => {
            const newContent = taskTextSpan.textContent.trim();
            if (newContent !== task.content && newContent !== '') {
                try {
                    const response = await fetch(`/api/tasks/${task.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ content: newContent })
                    });
                    if (response.ok) {
                        task.content = newContent;
                        fetchTasks();
                    } else {
                        taskTextSpan.textContent = task.content; // Revert si erreur
                        console.error('Erreur lors de la mise à jour du titre:', response.statusText);
                    }
                } catch (error) {
                    taskTextSpan.textContent = task.content; // Revert si erreur réseau
                    console.error('Erreur réseau lors de la mise à jour du titre:', error);
                }
            } else if (newContent === '') {
                taskTextSpan.textContent = task.content; // Revert si vide
                alert(translateText('taskTitleEmptyAlert'));
            }
        });

        taskTextSpan.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                taskTextSpan.blur();
            }
        });

        taskContentWrapper.appendChild(taskTextSpan);

        // --- Affichage de la priorité ---
        const prioritySpan = document.createElement('span');
        prioritySpan.textContent = `${translateText('priorityLabel')} ${translateText('priority' + (task.priority || 'Aucune'))}`;
        prioritySpan.classList.add('task-priority');
        prioritySpan.classList.add(`priority-${(task.priority || 'Aucune').toLowerCase()}`);
        taskContentWrapper.appendChild(prioritySpan);

        // LOGIQUE POUR LA DATE ET LA COULEUR
        const dueDateContainer = document.createElement('span');
        dueDateContainer.classList.add('due-date-container');

        // CORRECTION ICI : Utilisez task.due_date qui vient du backend
        if (task.due_date) { 
            const dueDateObj = new Date(task.due_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const oneWeekLater = new Date(today);
            oneWeekLater.setDate(today.getDate() + 7);
            oneWeekLater.setHours(0, 0, 0, 0);

            const dueDateSpan = document.createElement('span');
            dueDateSpan.classList.add('due-date');

            if (dueDateObj < today) {
                dueDateSpan.textContent = translateText('overdueTask') + `: ${dueDateObj.toLocaleDateString(currentLang === 'fr' ? 'fr-FR' : currentLang === 'de' ? 'de-DE' : 'en-US')}`;
                dueDateSpan.classList.add('overdue');
            } else if (dueDateObj <= oneWeekLater) {
                dueDateSpan.textContent = `${translateText('dueDateDisplay')} ${dueDateObj.toLocaleDateString(currentLang === 'fr' ? 'fr-FR' : currentLang === 'de' ? 'de-DE' : 'en-US')}`;
                dueDateSpan.classList.add('soon-due');
            } else {
                dueDateSpan.textContent = `${translateText('dueDateDisplay')} ${dueDateObj.toLocaleDateString(currentLang === 'fr' ? 'fr-FR' : currentLang === 'de' ? 'de-DE' : 'en-US')}`;
                dueDateSpan.classList.add('long-term');
            }
            dueDateContainer.appendChild(dueDateSpan);

        } else {
            const addDateSpan = document.createElement('span');
            addDateSpan.textContent = translateText('addDueDatePlaceholder');
            addDateSpan.classList.add('add-date-placeholder');
            dueDateContainer.appendChild(addDateSpan);
        }
        taskContentWrapper.appendChild(dueDateContainer);


        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('actions');

        // Bouton Terminer/Annuler
        const completeButton = document.createElement('button');
        completeButton.textContent = task.done ? translateText('undoCompleteButton') : translateText('completeButton');
        completeButton.classList.add('complete');
        completeButton.addEventListener('click', async (e) => {
            e.stopPropagation(); // TRÈS IMPORTANT: Empêche le clic de propager au LI parent et d'ouvrir la modale
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

        // Bouton Supprimer
        const deleteButton = document.createElement('button');
        deleteButton.textContent = translateText('deleteButton');
        deleteButton.classList.add('delete');
        deleteButton.addEventListener('click', async (e) => {
            e.stopPropagation(); // TRÈS IMPORTANT: Empêche le clic de propager au LI parent
            if (confirm(translateText('confirmDelete'))) {
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

        // Écouteur de clic sur le LI entier pour ouvrir la modale
        // Ne doit pas être sur taskTextSpan pour éviter les conflits avec l'édition inline
        li.addEventListener('click', (e) => {
            // Vérifie si le clic n'a pas été sur un bouton d'action ou le champ de texte en édition
            if (!e.target.closest('.actions button') && e.target !== taskTextSpan && document.activeElement !== taskTextSpan) {
                currentEditingTask = task;
                modalTaskTitle.value = task.content;
                modalTaskDescription.value = task.description || '';
                // CORRECTION ICI : Utilisez task.due_date pour remplir la modale
                modalTaskDueDate.value = task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '';
                modalTaskPriority.value = task.priority || 'Aucune';
                
                // Assure que les options de la modale sont traduites lors de l'ouverture
                modal.querySelector('#modal-task-priority option[value="Aucune"]').textContent = translateText('priorityNone');
                modal.querySelector('#modal-task-priority option[value="Basse"]').textContent = translateText('priorityLow');
                modal.querySelector('#modal-task-priority option[value="Moyenne"]').textContent = translateText('priorityMedium');
                modal.querySelector('#modal-task-priority option[value="Haute"]').textContent = translateText('priorityHigh');
                modal.style.display = 'block';
            }
        });
    }

    // Gère l'ajout d'une nouvelle tâche
    addTaskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const content = taskInput.value.trim();
        const dueDate = dueDateInput.value;
        const priority = priorityInput.value; // Récupère la priorité

        if (content) {
            try {
                const response = await fetch('/api/tasks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        content: content,
                        dueDate: dueDate || null, // Le backend attend 'dueDate'
                        priority: priority // Inclut la priorité lors de l'ajout
                    })
                });
                if (response.ok) {
                    taskInput.value = '';
                    dueDateInput.value = '';
                    priorityInput.value = 'Aucune'; // Réinitialise la priorité
                    fetchTasks();
                } else {
                    console.error('Erreur lors de l\'ajout de la tâche:', response.statusText);
                }
            } catch (error) {
                console.error('Erreur lors de l\'ajout de la tâche:', error);
            }
        }
    });

    // Initialisation : charge les traductions et les tâches au démarrage
    loadTranslations(currentLang);
});