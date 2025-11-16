let tasks = [];

const saveTasks = () => {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

const loadTasks = () => {
  const raw = localStorage.getItem("tasks");
  tasks = raw ? JSON.parse(raw) : [];
};


const addTask = () => {
  const taskInput = document.getElementById("taskInput");
  const text = taskInput.value.trim();
  if (!text) return;
  tasks.push({ text, completed: false });
  taskInput.value = "";
  saveTasks();
  updateTasksList();
  updateStats();
  clearBlastFlagIfNeeded();
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
  tasks.splice(index, 1);
  saveTasks();
  updateTasksList();
  updateStats();
  clearBlastFlagIfNeeded();
};


const updateStats = () => {
  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;


  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);


  const progressBar = document.getElementById("progress");
  if (progressBar) {
    progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  }

  document.getElementById("numbers").innerText = `${completedTasks} / ${totalTasks}`;


  if (totalTasks > 0 && completedTasks === totalTasks) {
    maybeBlast(totalTasks);
  }
};


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


    checkbox.addEventListener("change", () => toggleTaskComplete(index));
    taskList.appendChild(listItem);
  });
};


const BLAST_KEY = "blast_for_count";

const maybeBlast = (currentTotal) => {
  
  const last = localStorage.getItem(BLAST_KEY);
  if (last && Number(last) === currentTotal) return;
  
  localStorage.setItem(BLAST_KEY, String(currentTotal));
  blast();
};

const clearBlastFlagIfNeeded = () => {
  const last = localStorage.getItem(BLAST_KEY);
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  if (!last) return;
  if (Number(last) !== total) {
    localStorage.removeItem(BLAST_KEY);
    return;
  }
  if (completed !== total) {
    localStorage.removeItem(BLAST_KEY);
  }
};

const blast = () => {
  
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
