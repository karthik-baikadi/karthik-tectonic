// app.js

document.addEventListener('DOMContentLoaded', () => {
    const addTaskBtns = document.querySelectorAll('.add-task-btn');
    const addColumnBtn = document.querySelector('.add-column-btn');
    const modal = document.getElementById('task-modal');
    const closeModalBtn = document.querySelector('.close-btn');
    const taskForm = document.getElementById('task-form');
    let currentColumn = '';
    let editMode = false;
    let taskBeingEdited = null;

    addTaskBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentColumn = btn.parentElement.getAttribute('data-column');
            showModal();
        }); 
    });

    closeModalBtn.addEventListener('click', closeModal);

    addColumnBtn.addEventListener('click', addColumn);

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const taskData = {
            id: editMode ? taskBeingEdited.getAttribute('data-id') : Date.now().toString(),
            title: document.getElementById('title').value,
            type: document.getElementById('type').value,
            effort: document.getElementById('effort').value,
            priority: document.getElementById('priority').value,
            description: document.getElementById('description').value,
            assignee: document.getElementById('assignee').value,
            attachments: document.getElementById('attachments').files,
            depends: document.getElementById('depends').value,
            blocks: document.getElementById('blocks').value,
            tags: document.getElementById('tags').value,
        };
        if (editMode) {
            updateTask(taskBeingEdited, taskData);
        } else {
            addTaskToColumn(taskData, currentColumn);
        }
        closeModal();
    });

    function showModal() {
        modal.style.display = 'flex';
    }

    function closeModal() {
        modal.style.display = 'none';
        taskForm.reset();
        editMode = false;
        taskBeingEdited = null;
    }

    function addColumn() {
        const columnName = prompt('Enter column name:', "");
        if (!columnName) {
            return;
        }
        const columnElement = document.createElement('div');
        columnElement.classList.add('column');
        columnElement.setAttribute('data-column', columnName.toUpperCase().replace(/\s+/g, '_'));
        columnElement.innerHTML = `
            <h2>${columnName}</h2>
            <div class="task-list"></div>
            <button class="add-task-btn">Add Task</button>
            <button class="delete-column-btn>Delete Column</button>
        `;

        columnElement.querySelector('.add-task-btn').addEventListener('click', () => {
            currentColumn = columnElement.getAttribute('data-column');
            showModal();
        });

        
        document.querySelector('.board').appendChild(columnElement);
    }

    function addTaskToColumn(taskData, column) {
        const task = document.createElement('div');
        task.classList.add('task');
        task.innerHTML = `
            <h3>${taskData.title}</h3>
            <p>Type: ${taskData.type}</p>
            <p>Effort: ${taskData.effort}</p>
            <p>Priority: ${taskData.priority}</p>
            <p>Description: ${taskData.description}</p>
            <p>Assignee: ${taskData.assignee}</p>
            <p>Attachments: ${taskData.attachments}</p>
            <p>depends on: ${taskData.depends}</p>
            <p>blocks: ${taskData.blocks}</p>
            <p>tags: ${taskData.tags}</p>
            <button class="edit-task-button">Edit</button>
            <button class="delete-task-button">Delete</button>
        `;

        task.querySelector('.edit-task-button').addEventListener('click', () => {
            editTask(task, taskData);
        });

        task.querySelector('.delete-task-button').addEventListener('click', () => {
            const confirmation = confirm("Are you sure you want to delete this task?");
            if (confirmation) {
                task.remove();
            }
        });

        document.querySelector(`[data-column="${column}"] .task-list`).appendChild(task);
    }

    function editTask(task, taskData) {
        editMode = true;
        taskBeingEdited = task;
        showModal();
    }

    function updateTask(task, taskData) {
        task.innerHTML = `
            <h3>${taskData.title}</h3>
            <p>Type: ${taskData.type}</p>
            <p>Priority: ${taskData.priority}</p>
            <p>Assignee: ${taskData.assignee}</p>
            <button class="edit-task-button">Edit</button>
            <button class="delete-task-button">Delete</button>
        `;

        task.querySelector('.edit-task-button').addEventListener('click', () => {
            editTask(task, taskData);
        });

        task.querySelector('.delete-task-button').addEventListener('click', () => {
            const confirmation = confirm("Are you sure you want to delete this task?");
            if (confirmation) {
                task.remove();
            }
        });
    }
});
