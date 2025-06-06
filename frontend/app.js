document.addEventListener('DOMContentLoaded', () => {
    const addTaskForm = document.getElementById('addTaskForm');
    const taskInput = document.querySelector('#addTaskForm input[type="text"]');
    const dueDateInput = document.querySelector('#addTaskForm input[type="date"]');
    const priorityInput = document.getElementById('addTaskPriority'); 
    const taskList = document.getElementById('taskList');
    const noTasksMessage = document.getElementById('noTasksMessage');
    const languageSelect = document.getElementById('language-select');
    const sortSelect = document.getElementById('sort-select'); 
    const searchInput = document.getElementById('searchInput'); 
    const totalTasksSpan = document.getElementById('totalTasks'); 
    const pendingTasksSpan = document.getElementById('pendingTasks'); 
    const completedTasksSpan = document.getElementById('completedTasks'); 

    let translations = {};
    let currentLang = localStorage.getItem('lang') || 'fr';
    let allTasks = [];

    async function loadTranslations(lang) {
        try {
            const response = await fetch(`./locales/${lang}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load translation for ${lang}, trying fallback`);
            }
            translations = await response.json();
            localStorage.setItem('lang', lang);
            applyTranslations();
            fetchTasks(); 
            languageSelect.value = lang;
        } catch (error) {
            console.error('Error loading translations:', error);
            if (lang !== 'en') {
                loadTranslations('en');
            } else {
                alert("Erreur: Impossible de charger les traductions. L'application pourrait ne pas s'afficher correctement.");
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

        const addTaskPriorityPlaceholder = document.querySelector('#addTaskPriority option[value=""]'); 
        if (addTaskPriorityPlaceholder) {
            addTaskPriorityPlaceholder.textContent = translateText('priorityPlaceholder');
        }
        
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

        document.querySelector('label[for="sort-select"]').textContent = translateText('sortByLabel');
        document.querySelector('#sort-select option[value="dueDateAsc"]').textContent = translateText('sortDueDateAsc');
        document.querySelector('#sort-select option[value="priorityHigh"]').textContent = translateText('sortPriorityHigh');
        document.querySelector('#sort-select option[value="creationDateDesc"]').textContent = translateText('sortCreationDateDesc');
        document.querySelector('#sort-select option[value="titleAsc"]').textContent = translateText('sortTitleAsc');

        searchInput.placeholder = translateText('searchPlaceholder');

        modal.querySelector('h2').textContent = translateText('taskDetailsTitle');
        modal.querySelector('label[for="modal-task-title"]').textContent = translateText('titleLabel');
        modal.querySelector('label[for="modal-task-description"]').textContent = translateText('descriptionLabel');
        modal.querySelector('#modal-task-description').placeholder = translateText('descriptionPlaceholder');
        modal.querySelector('label[for="modal-task-due-date"]').textContent = translateText('dueDateLabel');
        modal.querySelector('label[for="modal-task-priority"]').textContent = translateText('priorityLabel');

        const modalPriorityNone = modal.querySelector('#modal-task-priority option[value="Aucune"]');
        if (modalPriorityNone) modalPriorityNone.textContent = translateText('priorityNone');
        const modalPriorityLow = modal.querySelector('#modal-task-priority option[value="Basse"]');
        if (modalPriorityLow) modalPriorityLow.textContent = translateText('priorityLow');
        const modalPriorityMedium = modal.querySelector('#modal-task-priority option[value="Moyenne"]');
        if (modalPriorityMedium) modalPriorityMedium.textContent = translateText('priorityMedium');
        const modalPriorityHigh = modal.querySelector('#modal-task-priority option[value="Haute"]');
        if (modalPriorityHigh) modalPriorityHigh.textContent = translateText('priorityHigh');

        saveTaskDetailsButton.textContent = translateText('saveButton');

        languageSelect.querySelector('option[value="fr"]').textContent = translateText('languageFrench');
        languageSelect.querySelector('option[value="en"]').textContent = translateText('languageEnglish');
        languageSelect.querySelector('option[value="de"]').textContent = translateText('languageGerman');
        const languageSpanish = languageSelect.querySelector('option[value="es"]');
        if(languageSpanish) languageSpanish.textContent = translateText('languageSpanish');
        const languageItalian = languageSelect.querySelector('option[value="it"]');
        if(languageItalian) languageItalian.textContent = translateText('languageItalian');
        const languagePortuguese = languageSelect.querySelector('option[value="pt"]');
        if(languagePortuguese) languagePortuguese.textContent = translateText('languagePortuguese');
        const languageChinese = languageSelect.querySelector('option[value="zh"]');
        if(languageChinese) languageChinese.textContent = translateText('languageChinese');
        const languageJapanese = languageSelect.querySelector('option[value="ja"]');
        if(languageJapanese) languageJapanese.textContent = translateText('languageJapanese');

        languageSelect.value = currentLang;

        updateTaskCounters(allTasks);
        renderTasks(allTasks);
    }

    languageSelect.addEventListener('change', (e) => {
        currentLang = e.target.value;
        loadTranslations(currentLang);
    });

    sortSelect.addEventListener('change', () => { 
        renderTasks(allTasks);
    });

    searchInput.addEventListener('input', () => {
        renderTasks(allTasks);
    });

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
                        dueDate: newDueDate || null,
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

    function updateTaskCounters(tasks) {
        const total = tasks.length;
        const pending = tasks.filter(task => !task.done).length;
        const completed = tasks.filter(task => task.done).length;

        totalTasksSpan.textContent = `${translateText('totalTasks')}: ${total}`;
        pendingTasksSpan.textContent = `${translateText('pendingTasks')}: ${pending}`;
        completedTasksSpan.textContent = `${translateText('completedTasks')}: ${completed}`;
    }

    async function fetchTasks() {
        try {
            const response = await fetch('/api/tasks');
            allTasks = await response.json(); 
            renderTasks(allTasks);
        } catch (error) {
            console.error('Erreur lors de la récupération des tâches:', error);
            noTasksMessage.style.display = 'block';
            noTasksMessage.textContent = translateText('noTasksMessage');
            updateTaskCounters([]);
        }
    }

    function renderTasks(tasksToRender) {
        let filteredAndSortedTasks = [...tasksToRender];

        const searchTerm = searchInput.value.toLowerCase().trim();
        if (searchTerm) {
            filteredAndSortedTasks = filteredAndSortedTasks.filter(task => 
                task.content.toLowerCase().includes(searchTerm) || 
                (task.description && task.description.toLowerCase().includes(searchTerm))
            );
        }

        const sortBy = sortSelect.value; 
        filteredAndSortedTasks.sort((a, b) => {
            if (a.done && !b.done) return 1;
            if (!a.done && b.done) return -1;

            switch (sortBy) {
                case 'priorityHigh':
                    const priorityOrder = { 'Haute': 1, 'Moyenne': 2, 'Basse': 3, 'Aucune': 4 };
                    const priorityA = priorityOrder[a.priority || 'Aucune'];
                    const priorityB = priorityOrder[b.priority || 'Aucune'];
                    if (priorityA !== priorityB) {
                        return priorityA - priorityB;
                    }
                    break;
                case 'dueDateAsc':
                    const dateA = a.due_date ? new Date(a.due_date).getTime() : Infinity;
                    const dateB = b.due_date ? new Date(b.due_date).getTime() : Infinity;
                    if (dateA !== dateB) {
                        return dateA - dateB;
                    }
                    break;
                case 'creationDateDesc':
                    const creationA = new Date(a.created_at).getTime(); 
                    const creationB = new Date(b.created_at).getTime();
                    return creationB - creationA; 
                case 'titleAsc':
                    return a.content.localeCompare(b.content); 
                default:
                    break;
            }
            return a.id - b.id;
        });

        taskList.innerHTML = '';

        if (filteredAndSortedTasks.length === 0) {
            noTasksMessage.style.display = 'block';
            noTasksMessage.textContent = searchTerm ? translateText('noSearchResults') : translateText('noTasksMessage');
        } else {
            noTasksMessage.style.display = 'none';
            filteredAndSortedTasks.forEach(task => {
                renderTask(task);
            });
        }
        updateTaskCounters(tasksToRender);
    }

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

        taskTextSpan.contentEditable = "true";
        taskTextSpan.setAttribute('role', 'textbox');
        taskTextSpan.setAttribute('aria-label', `${translateText('titleLabel')} ${task.content}`);
        taskTextSpan.title = translateText('doubleClickToEdit');

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
                        taskTextSpan.textContent = task.content; 
                        console.error('Erreur lors de la mise à jour du titre:', response.statusText);
                    }
                } catch (error) {
                    taskTextSpan.textContent = task.content; 
                    console.error('Erreur réseau lors de la mise à jour du titre:', error);
                }
            } else if (newContent === '') {
                taskTextSpan.textContent = task.content; 
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

        const prioritySpan = document.createElement('span');
        const priorityValueFromBackend = task.priority || 'Aucune'; 
        let translatedPriorityText = '';

        switch (priorityValueFromBackend) {
            case 'Haute': translatedPriorityText = translateText('priorityHigh'); break;
            case 'Moyenne': translatedPriorityText = translateText('priorityMedium'); break;
            case 'Basse': translatedPriorityText = translateText('priorityLow'); break;
            case 'Aucune': default: translatedPriorityText = translateText('priorityNone'); break;
        }

        prioritySpan.textContent = `${translateText('priorityLabel')} ${translatedPriorityText}`; 
        prioritySpan.classList.add('task-priority');
        prioritySpan.classList.add(`priority-${priorityValueFromBackend.toLowerCase()}`); 
        taskContentWrapper.appendChild(prioritySpan);

        const dueDateContainer = document.createElement('span');
        dueDateContainer.classList.add('due-date-container');

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

        const completeButton = document.createElement('button');
        completeButton.textContent = task.done ? translateText('undoCompleteButton') : translateText('completeButton');
        completeButton.classList.add('complete');
        completeButton.addEventListener('click', async (e) => {
            e.stopPropagation(); 
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
        deleteButton.textContent = translateText('deleteButton');
        deleteButton.classList.add('delete');
        deleteButton.addEventListener('click', async (e) => {
            e.stopPropagation(); 
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

        li.addEventListener('click', (e) => {
            if (!e.target.closest('.actions button') && e.target !== taskTextSpan && document.activeElement !== taskTextSpan) {
                currentEditingTask = task;
                modalTaskTitle.value = task.content;
                modalTaskDescription.value = task.description || '';
                modalTaskDueDate.value = task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '';
                modalTaskPriority.value = task.priority || 'Aucune';

                modal.querySelector('#modal-task-priority option[value="Aucune"]').textContent = translateText('priorityNone');
                modal.querySelector('#modal-task-priority option[value="Basse"]').textContent = translateText('priorityLow');
                modal.querySelector('#modal-task-priority option[value="Moyenne"]').textContent = translateText('priorityMedium');
                modal.querySelector('#modal-task-priority option[value="Haute"]').textContent = translateText('priorityHigh');
                modal.style.display = 'block';
            }
        });
    }

    addTaskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const content = taskInput.value.trim();
        const dueDate = dueDateInput.value;
        let priority = priorityInput.value; 

        if (priority === '') {
            priority = 'Aucune';
        }

        if (content) {
            try {
                const response = await fetch('/api/tasks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        content: content,
                        dueDate: dueDate || null, 
                        description: '', 
                        priority: priority 
                    })
                });
                if (response.ok) {
                    taskInput.value = '';
                    dueDateInput.value = '';
                    priorityInput.value = ''; 
                    fetchTasks(); 
                } else {
                    console.error('Erreur lors de l\'ajout de la tâche:', response.statusText);
                }
            } catch (error) {
                console.error('Erreur lors de l\'ajout de la tâche:', error);
            }
        }
    });

    loadTranslations(currentLang);
});