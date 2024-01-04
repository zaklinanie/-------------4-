document.addEventListener('DOMContentLoaded', function () {
    // Получение элементов формы и кнопок по их идентификаторам
    const saveTaskForm = document.getElementById('save-task');
    const taskEditForm = document.getElementById('task-edit');
    const taskContainer = document.getElementById('task-container');
    const editModal = document.getElementById('myModal');
    const closeEditModalBtn = editModal.querySelector('.close');

    // Перезагрузка страницы
    document.getElementById('btnReset').addEventListener('click', function() {
        location.reload(); 
    });

    // Функция для форматирования даты в формате "день.месяц.год"
    function formatDate(dateStr) {
        if (dateStr) {
            const date = new Date(dateStr);
            return date.toLocaleDateString('ru-RU');
        }
        return '—'; // Прочерк, если дата отсутствует
    }

    //Обработка вывода специальных символов в виде обычного текста
    function escapeHTML(text) {
        var map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    // Переменная для хранения ID редактируемой задачи
    let editableTaskId = null;
    // Функция для создания DOM элемента, который представляет задачу на странице
    function createTaskElement(task) {
        // Создание контейнера для задачи
        const taskEl = document.createElement('div');
        const escapedDescription = escapeHTML(task.description).replace(/\n/g, '<br>');
        const formattedDeadline = formatDate(task.deadline);
        // Назначение классов элементу в зависимости от статуса задачи (выполнена или нет)
        taskEl.className = task.done ? 'task-item task-completed' : 'task-item task-not-completed'; // Изменённая строка
        // Заполнение контейнера содержимым
        taskEl.innerHTML = `
            <div>
            <p class="title1 pb-2">${task.title}</p>
            <p class="is-size-4 pb-2">${escapedDescription}</p>
            <p class="is-size-6 pb-1">Срок выполнения:  ${formattedDeadline}</p>
            <label class="checkbox">
                <input type="checkbox" ${task.done ? 'checked' : ''} class="toggle-done" data-id="${task.id}">
                Выполнено
            </label>
            <p class="is-size-4 pb-2"></p>
            <button class="button is-info is-light edit-btn" data-id="${task.id}">Редактировать</button>
            <button class="button is-danger is-light delete-btn" data-id="${task.id}">Удалить</button>
            </div>
        `;
        return taskEl;
    }

    // Функция для отображения всех задач, сохраненных в localStorage
    function displayTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        taskContainer.innerHTML = '';
        // Сортировка задач по сроку выполнения
        tasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        // Добавление задач в контейнер для отображения на странице
        tasks.forEach(task => {
        taskContainer.appendChild(createTaskElement(task));
        });
        if (tasks.length === 0) {
        taskContainer.innerHTML = '<p>Сейчас нет задач</p>';
        }
    }

    // Функция для сохранения массива задач в localStorage
    function saveTasks(tasks) {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Получаем задачу из формы при нажатии кнопки submit
    saveTaskForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const titleInput = document.getElementById('itTitle');
        const descriptionInput = document.getElementById('itDescription');
        const deadlineInput = document.getElementById('itDeadline');
        // Создание объекта задачи с уникальным id, значением из полей формы и статусом выполнения
        const task = {
        id: Date.now(),
        title: titleInput.value,
        description: descriptionInput.value,
        deadline: deadlineInput.value,
        done: false
        };
        // Добавление новой задачи в массив задач с сохранением в localStorage
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.push(task);
        saveTasks(tasks);
        displayTasks();
        // Сброс значений формы
        titleInput.value = '';
        descriptionInput.value = '';
        deadlineInput.value = '';
    });

    // Удаление задачи
    taskContainer.addEventListener('click', function (e) {
        if (e.target.classList.contains('delete-btn')) {
        const taskId = e.target.dataset.id;
        const tasks = JSON.parse(localStorage.getItem('tasks'));
        const updatedTasks = tasks.filter(task => task.id.toString() !== taskId);
        saveTasks(updatedTasks);
        displayTasks();
        }
    });

    // Добавление обработчика для открытия формы редактирования задачи
    taskContainer.addEventListener('click', function (e) {
        if (e.target.classList.contains('edit-btn')) {
        // Установка значения текущего ID редактируемой задачи
        editableTaskId = e.target.dataset.id;
        // Находим задачу в массиве 
        const tasks = JSON.parse(localStorage.getItem('tasks'));
        const taskToEdit = tasks.find(task => task.id.toString() === editableTaskId);
        // Заполнение формы редактирования текущими значениями задачи
        document.getElementById('editTitle').value = taskToEdit.title;
        document.getElementById('editDescription').value = taskToEdit.description;
        document.getElementById('editDeadline').value = taskToEdit.deadline;
        document.getElementById('editDone').checked = taskToEdit.done;
        // Открытие модального окна редактирования
        editModal.classList.add('is-active');
        }
    });
    closeEditModalBtn.addEventListener('click', function () {
        editModal.classList.remove('is-active');
    });

    // Сохранение изменений в задаче
    taskEditForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const tasks = JSON.parse(localStorage.getItem('tasks'));
        // Находим индекс задачи в массиве по ID
        const taskIndex = tasks.findIndex(task => task.id.toString() === editableTaskId);
        // Сохраняем изменения в задачу
        tasks[taskIndex].title = document.getElementById('editTitle').value;
        tasks[taskIndex].description = document.getElementById('editDescription').value;
        tasks[taskIndex].deadline = document.getElementById('editDeadline').value;
        tasks[taskIndex].done = document.getElementById('editDone').checked;
        saveTasks(tasks);
        displayTasks();
        editModal.classList.remove('is-active');
    });

    // Изменение статуса выполнения задачи
    taskContainer.addEventListener('change', function (e) {
        if (e.target.classList.contains('toggle-done')) {
        const taskId = e.target.dataset.id;
        const tasks = JSON.parse(localStorage.getItem('tasks'));
        const task = tasks.find(task => task.id.toString() === taskId);
        // Меняем статус задачи на выполненную или невыполненную
        task.done = e.target.checked;
        saveTasks(tasks);
        displayTasks();
        }
    });

    // Вызов функции отображения задач при загрузке страницы
    displayTasks();
});
