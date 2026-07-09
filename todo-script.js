// ===== LOCAL STORAGE KEY =====
// This is where all tasks are saved in the browser's memory
const STORAGE_KEY = 'todoTasks';

// ===== DOM ELEMENTS =====
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const tasksList = document.getElementById('tasksList');
const emptyState = document.getElementById('emptyState');
const errorMessage = document.getElementById('errorMessage');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const totalTasksEl = document.getElementById('totalTasks');
const completedTasksEl = document.getElementById('completedTasks');
const remainingTasksEl = document.getElementById('remainingTasks');

// ===== STATE VARIABLES =====
let tasks = [];
let currentFilter = 'all';
let editingId = null;

// ===== INITIALIZATION =====
// Load tasks from local storage when the page loads
window.addEventListener('DOMContentLoaded', () => {
    loadTasksFromStorage();
    renderTasks();
    updateStats();
    console.log('📝 To-Do List App loaded! Your tasks are saved automatically.');
});

// ===== EVENT LISTENERS =====
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.dataset.filter;
        renderTasks();
    });
});

clearCompletedBtn.addEventListener('click', clearCompletedTasks);
clearAllBtn.addEventListener('click', clearAllTasks);

// ===== ADD NEW TASK =====
function addTask() {
    const text = taskInput.value.trim();

    if (!text) {
        showError('Please enter a task!');
        return;
    }

    if (text.length > 100) {
        showError('Task is too long! Keep it under 100 characters.');
        return;
    }

    // Create new task object
    const task = {
        id: Date.now(), // Unique ID using timestamp
        text: text,
        completed: false,
        createdAt: new Date().toLocaleDateString()
    };

    // Add to tasks array
    tasks.unshift(task); // Add to beginning of array

    // Save to local storage
    saveTasksToStorage();

    // Clear input
    taskInput.value = '';
    clearError();

    // Re-render the list
    renderTasks();
    updateStats();
}

// ===== TOGGLE TASK COMPLETION =====
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasksToStorage();
        renderTasks();
        updateStats();
    }
}

// ===== DELETE TASK =====
function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasksToStorage();
        renderTasks();
        updateStats();
    }
}

// ===== EDIT TASK =====
function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        const newText = prompt('Edit task:', task.text);
        if (newText && newText.trim()) {
            task.text = newText.trim();
            saveTasksToStorage();
            renderTasks();
            updateStats();
        }
    }
}

// ===== CLEAR COMPLETED TASKS =====
function clearCompletedTasks() {
    if (confirm('Clear all completed tasks?')) {
        tasks = tasks.filter(t => !t.completed);
        saveTasksToStorage();
        renderTasks();
        updateStats();
    }
}

// ===== CLEAR ALL TASKS =====
function clearAllTasks() {
    if (confirm('This will delete ALL tasks! Are you sure?')) {
        tasks = [];
        saveTasksToStorage();
        renderTasks();
        updateStats();
    }
}

// ===== FILTER TASKS =====
function getFilteredTasks() {
    switch (currentFilter) {
        case 'active':
            return tasks.filter(t => !t.completed);
        case 'completed':
            return tasks.filter(t => t.completed);
        default:
            return tasks;
    }
}

// ===== RENDER TASKS ON PAGE =====
function renderTasks() {
    const filteredTasks = getFilteredTasks();

    // Clear the list
    tasksList.innerHTML = '';

    if (filteredTasks.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    // Create HTML for each task
    filteredTasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        taskElement.innerHTML = `
            <input 
                type="checkbox" 
                class="task-checkbox" 
                ${task.completed ? 'checked' : ''}
                onchange="toggleTask(${task.id})"
            >
            <div class="task-text-container">
                <div class="task-text">${escapeHtml(task.text)}</div>
                <div class="task-date">Added: ${task.createdAt}</div>
            </div>
            <div class="task-buttons">
                <button class="edit-btn" onclick="editTask(${task.id})">Edit</button>
                <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
            </div>
        `;

        tasksList.appendChild(taskElement);
    });
}

// ===== UPDATE STATISTICS =====
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const remaining = total - completed;

    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;
    remainingTasksEl.textContent = remaining;
}

// ===== SAVE TO LOCAL STORAGE =====
// This stores all tasks in the browser so they persist after refresh
function saveTasksToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    console.log('💾 Tasks saved to local storage!');
}

// ===== LOAD FROM LOCAL STORAGE =====
// This retrieves all saved tasks when the page loads
function loadTasksFromStorage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        tasks = JSON.parse(saved);
        console.log(`✅ Loaded ${tasks.length} tasks from local storage`);
    } else {
        tasks = [];
        console.log('ℹ️ No saved tasks found. Starting fresh!');
    }
}

// ===== ERROR MESSAGE DISPLAY =====
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 3000);
}

function clearError() {
    errorMessage.classList.remove('show');
    errorMessage.textContent = '';
}

// ===== ESCAPE HTML SPECIAL CHARACTERS =====
// This prevents code injection attacks
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
    // Ctrl+K or Cmd+K to focus on input
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        taskInput.focus();
    }
});

console.log('✨ Keyboard tip: Press Ctrl+K to focus on task input');
