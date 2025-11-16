// todo.js (fixed)

let tasks = [];

// helpers
const saveTasks = () => {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

const loadTasks = () => {
  const raw = localStorage.getItem("tasks");
  tasks = raw ? JSON.parse(raw) : [];
};

// add / edit / delete / toggle
const addTask = () => {
  const taskInput = document.getElementById("taskInput");
  const text = taskInput.value.trim();
  if (!text) return;
  tasks.push({ text, completed: false });
  taskInput.value = "";
  saveTasks();
  updateTasksList();
  updateStats();
  clearBlastFlagIfNeeded(); // a safety
};

const toggleTaskComplete = (index) => {
  if (!tasks[index]) return;
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  updateTasksList();
  updateStats();
  clearBlastFlagIfNeeded();
};

const deleteTask = (index) => {
  tasks.splice(index, 1);
  saveTasks();
  updateTasksList();
  updateStats();
  clearBlastFlagIfNeeded();
};

const editTask = (index) => {
  const taskInput = document.getElementById("taskInput");
  taskInput.value = tasks[index].text;
  // remove original item so that saving will create a new one
  tasks.splice(index, 1);
  saveTasks();
  updateTasksList();
  updateStats();
  clearBlastFlagIfNeeded();
};

// progress + stats
const updateStats = () => {
  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;

  // correct progress calculation
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // get element first, then set
  const progressBar = document.getElementById("progress");
  if (progressBar) {
    progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  }

  document.getElementById("numbers").innerText = `${completedTasks} / ${totalTasks}`;

  // only blast when there are tasks and all are complete
  if (totalTasks > 0 && completedTasks === totalTasks) {
    maybeBlast(totalTasks);
  }
};

// render task list
const updateTasksList = () => {
  const taskList = document.getElementById("task-list");
  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    const listItem = document.createElement("li");
    listItem.className = "task-row";

    const taskWrapper = document.createElement("div");
    taskWrapper.className = "taskItem";

    const left = document.createElement("div");
    left.className = `task ${task.completed ? "completed" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "checkbox";
    checkbox.checked = !!task.completed;

    const p = document.createElement("p");
    p.textContent = task.text;

    left.appendChild(checkbox);
    left.appendChild(p);

    const icons = document.createElement("div");
    icons.className = "icons";

    const editImg = document.createElement("img");
    editImg.src = "img/edit.png";
    editImg.alt = "edit";
    editImg.addEventListener("click", () => editTask(index));

    const delImg = document.createElement("img");
    delImg.src = "img/clear.png";
    delImg.alt = "delete";
    delImg.addEventListener("click", () => deleteTask(index));

    icons.appendChild(editImg);
    icons.appendChild(delImg);

    taskWrapper.appendChild(left);
    taskWrapper.appendChild(icons);
    listItem.appendChild(taskWrapper);

    // checkbox listener
    checkbox.addEventListener("change", () => toggleTaskComplete(index));
    taskList.appendChild(listItem);
  });
};

// confetti / blast logic: avoid duplicate blasts if nothing changed
const BLAST_KEY = "blast_for_count";

const maybeBlast = (currentTotal) => {
  // if we already blasted for this exact number of tasks, skip
  const last = localStorage.getItem(BLAST_KEY);
  if (last && Number(last) === currentTotal) return;
  // otherwise set the flag and blast
  localStorage.setItem(BLAST_KEY, String(currentTotal));
  blast();
};

const clearBlastFlagIfNeeded = () => {
  // clear blast flag if number of tasks changed or not all completed
  const last = localStorage.getItem(BLAST_KEY);
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  if (!last) return;
  if (Number(last) !== total) {
    localStorage.removeItem(BLAST_KEY);
    return;
  }
  // if previously blasted but now not all complete, clear
  if (completed !== total) {
    localStorage.removeItem(BLAST_KEY);
  }
};

const blast = () => {
  // fallback: if confetti missing, don't crash
  if (typeof confetti !== "function") return;
  const end = Date.now() + 15 * 1000;
  const colors = ["#bb0000", "#ffffff"];
  (function frame() {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors,
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors,
    });
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
};

// initialization
document.addEventListener("DOMContentLoaded", () => {
  loadTasks();
  updateTasksList();
  updateStats();

  const newTaskBtn = document.getElementById("newTask");
  if (newTaskBtn) {
    newTaskBtn.addEventListener("click", function (e) {
      e.preventDefault();
      addTask();
    });
  }
});
