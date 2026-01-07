let allTasks = {
    'todo-list': [],
    'progress-list': [],
    'done-list': []
};

let currentlyDraggingTask = null;

function openModal() {
    document.getElementById('task-modal').classList.add('show');
}

function closeModal() {
    document.getElementById('task-modal').classList.remove('show');
    document.getElementById('title-input').value = '';
    document.getElementById('description-input').value = '';
}

function addNewTask() {
    const title = document.getElementById('title-input').value;
    const description = document.getElementById('description-input').value;

    if (title.trim() === '') {
        alert('Please enter a task title!');
        return;
    }

    const newTask = { title, description };
    allTasks['todo-list'].push(newTask);
    renderAllTasks();
    closeModal();
}

function createTaskCard(task, columnId) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.draggable = true;

    card.innerHTML = `
        <div class="task-title">${task.title}</div>
        <div class="task-description">${task.description}</div>
        <div class="task-actions">
            <button class="delete-button" onclick="deleteTask(this)">Delete</button>
        </div>
    `;

    card.addEventListener('dragstart', function() {
        currentlyDraggingTask = card;
        card.classList.add('dragging');
    });

    card.addEventListener('dragend', function() {
        card.classList.remove('dragging');
        currentlyDraggingTask = null;
        saveCurrentState();
    });

    return card;
}

function deleteTask(deleteButton) {
    const card = deleteButton.closest('.task-card');
    card.style.opacity = '0';
    card.style.transform = 'scale(0.9)';
    
    setTimeout(function() {
        card.remove();
        saveCurrentState();
    }, 200);
}

function renderAllTasks() {
    Object.keys(allTasks).forEach(function(columnId) {
        const listContainer = document.getElementById(columnId);
        listContainer.innerHTML = '';
        allTasks[columnId].forEach(function(task) {
            const card = createTaskCard(task, columnId);
            listContainer.appendChild(card);
        });
    });
    updateTaskCounts();
}

function updateTaskCounts() {
    document.getElementById('todo-count').textContent = allTasks['todo-list'].length;
    document.getElementById('progress-count').textContent = allTasks['progress-list'].length;
    document.getElementById('done-count').textContent = allTasks['done-list'].length;
}

function saveCurrentState() {
    allTasks = {
        'todo-list': [],
        'progress-list': [],
        'done-list': []
    };

    ['todo-list', 'progress-list', 'done-list'].forEach(function(columnId) {
        const listContainer = document.getElementById(columnId);
        const cards = listContainer.querySelectorAll('.task-card');
        
        cards.forEach(function(card) {
            const task = {
                title: card.querySelector('.task-title').textContent,
                description: card.querySelector('.task-description').textContent
            };
            allTasks[columnId].push(task);
        });
    });

    updateTaskCounts();
}

function setupDragAndDrop() {
    const columns = document.querySelectorAll('.column');

    columns.forEach(function(column) {
        const listContainer = column.querySelector('.task-list');

        column.addEventListener('dragover', function(event) {
            event.preventDefault();
            column.classList.add('drag-over');

            const afterElement = getDragAfterElement(listContainer, event.clientY);
            if (afterElement == null) {
                listContainer.appendChild(currentlyDraggingTask);
            } else {
                listContainer.insertBefore(currentlyDraggingTask, afterElement);
            }
        });

        column.addEventListener('dragleave', function() {
            column.classList.remove('drag-over');
        });

        column.addEventListener('drop', function() {
            column.classList.remove('drag-over');
        });
    });
}

function getDragAfterElement(container, mouseY) {
    const cards = Array.from(container.querySelectorAll('.task-card:not(.dragging)'));
    let closestCard = null;
    let closestOffset = Number.NEGATIVE_INFINITY;

    cards.forEach(function(card) {
        const box = card.getBoundingClientRect();
        const offset = mouseY - box.top - box.height / 2;
        if (offset < 0 && offset > closestOffset) {
            closestOffset = offset;
            closestCard = card;
        }
    });

    return closestCard;
}

window.addEventListener('DOMContentLoaded', function() {
    setupDragAndDrop();
    updateTaskCounts();
});