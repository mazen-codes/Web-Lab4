(() => {
  const els = {
    form: document.getElementById("composer"),
    input: document.getElementById("taskInput"),
    list: document.getElementById("taskList"),
    counter: document.getElementById("counter"),
    tabs: document.getElementById("tabs"),
    clearDone: document.getElementById("clearDone"),
    clearAll: document.getElementById("clearAll"),
  };

  const ICON_TRASH =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></svg>';
  const ICON_EMPTY =
    '<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 11h6M9 15h4"/></svg>';

  const store = { tasks: [], filter: "all", nextId: 1 };

  const visibleTasks = () =>
    store.tasks.filter((t) =>
      store.filter === "active" ? !t.done : store.filter === "completed" ? t.done : true
    );

  const addTask = (text) => {
    const clean = text.trim();
    if (!clean) return;
    store.tasks.push({ id: store.nextId++, text: clean, done: false });
  };

  const toggleTask = (id) => {
    const t = store.tasks.find((x) => x.id === id);
    if (t) t.done = !t.done;
  };

  const removeTask = (id) => {
    store.tasks = store.tasks.filter((x) => x.id !== id);
  };

  const renameTask = (id, text) => {
    const clean = text.trim();
    const t = store.tasks.find((x) => x.id === id);
    if (t && clean) t.text = clean;
  };

  function buildRow(task) {
    const li = document.createElement("li");
    li.className = "task" + (task.done ? " is-done" : "");
    li.dataset.id = task.id;

    const check = document.createElement("input");
    check.type = "checkbox";
    check.className = "task__check";
    check.checked = task.done;
    check.setAttribute("aria-label", "Mark as completed");

    const label = document.createElement("span");
    label.className = "task__text";
    label.textContent = task.text;

    const remove = document.createElement("button");
    remove.className = "task__remove";
    remove.type = "button";
    remove.setAttribute("aria-label", "Delete task");
    remove.innerHTML = ICON_TRASH;

    li.append(check, label, remove);
    return li;
  }

  function render() {
    const rows = visibleTasks();
    els.list.innerHTML = "";

    if (rows.length === 0) {
      const empty = document.createElement("li");
      empty.className = "empty";
      empty.innerHTML = ICON_EMPTY + "<span>No tasks found</span>";
      els.list.appendChild(empty);
    } else {
      rows.forEach((t) => els.list.appendChild(buildRow(t)));
    }

    const left = store.tasks.filter((t) => !t.done).length;
    els.counter.textContent = `${left} ${left === 1 ? "item" : "items"} left`;

    els.tabs.querySelectorAll(".tab").forEach((b) =>
      b.classList.toggle("is-selected", b.dataset.filter === store.filter)
    );
  }

  function startEdit(li, label) {
    const id = Number(li.dataset.id);
    const field = document.createElement("input");
    field.type = "text";
    field.className = "task__edit";
    field.value = label.textContent;
    label.replaceWith(field);
    field.focus();
    field.select();

    let finished = false;
    const finish = (save) => {
      if (finished) return;
      finished = true;
      if (save) renameTask(id, field.value);
      render();
    };
    field.addEventListener("keydown", (e) => {
      if (e.key === "Enter") finish(true);
      if (e.key === "Escape") finish(false);
    });
    field.addEventListener("blur", () => finish(true));
  }

  // Events
  els.form.addEventListener("submit", (e) => {
    e.preventDefault();
    addTask(els.input.value);
    els.input.value = "";
    render();
  });

  els.list.addEventListener("change", (e) => {
    if (!e.target.classList.contains("task__check")) return;
    toggleTask(Number(e.target.closest(".task").dataset.id));
    render();
  });

  els.list.addEventListener("click", (e) => {
    const btn = e.target.closest(".task__remove");
    if (!btn) return;
    removeTask(Number(btn.closest(".task").dataset.id));
    render();
  });

  els.list.addEventListener("dblclick", (e) => {
    const label = e.target.closest(".task__text");
    if (label) startEdit(label.closest(".task"), label);
  });

  els.tabs.addEventListener("click", (e) => {
    const tab = e.target.closest(".tab");
    if (!tab) return;
    store.filter = tab.dataset.filter;
    render();
  });

  els.clearDone.addEventListener("click", () => {
    store.tasks = store.tasks.filter((t) => !t.done);
    render();
  });

  els.clearAll.addEventListener("click", () => {
    store.tasks = [];
    render();
  });

  render();
})();
