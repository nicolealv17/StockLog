/* =========================================================
   StockLog — Kanban (lógica dos dois quadros: Produção e
   Tarefas Operacionais/Suporte). Sem limite de WIP; cores
   de card por prioridade (alta = vermelho, média = âmbar,
   baixa = verde).
   ========================================================= */
const STORAGE_KEYS = {
  production: "stocklog_kanban_v2",
  tasks: "stocklog_kanban_tasks_v1"
};
const USERS_KEY = "stocklog_kanban_users_v2";

const STATUSES = ["todo", "doing", "review", "done"];

const STATUS_LABELS = {
  production: { todo: "Planejamento", doing: "Em Produção", review: "Controle QA", done: "Pronto / Expedição" },
  tasks: { todo: "A Fazer", doing: "Em Andamento", review: "Em Revisão", done: "Concluído" }
};

const CATEGORIES = {
  production: ["Estoque", "Transporte", "Compras", "Financeiro", "Logística"],
  tasks: ["Suporte", "TI", "Administrativo", "RH", "Financeiro"]
};

const BOARD_LABELS = {
  production: { newTitle: "Nova Ordem de Produção", editTitle: "Editar OP", saveNew: "Salvar OP", saveEdit: "Atualizar OP", titleLabel: "Produto / Item", respLabel: "Operador Responsável" },
  tasks: { newTitle: "Nova Tarefa Operacional/Suporte", editTitle: "Editar Tarefa", saveNew: "Salvar Tarefa", saveEdit: "Atualizar Tarefa", titleLabel: "Título da Tarefa", respLabel: "Responsável" }
};

const DEFAULT_USERS = ["Maria Silva", "João Santos", "Pedro Costa", "Ana Oliveira", "Carlos Lima", "Fernanda Rocha", "Rafael Mendes", "Gustavo Almeida", "Ricardo Badeca"];

const DEFAULT_TASKS_PRODUCTION = [
  { id: "t1", board: "production", title: "Flange Aço ABNT 1020 ø50mm", desc: "Roteiro: Corte → Usinagem → Furação → Controle QA. Lote: 500 unid.", responsible: "Gustavo Almeida", priority: "alta", category: "Estoque", dueDate: "2026-08-24", status: "doing" },
  { id: "t2", board: "production", title: "Eixo Vazado 420mm", desc: "Roteiro: Torneamento → Fresamento → Retífica. Lote: 120 unid.", responsible: "Ana Oliveira", priority: "media", category: "Estoque", dueDate: "2026-08-26", status: "todo" },
  { id: "t3", board: "production", title: "Suporte Estrutural - Conjunto Soldado", desc: "Roteiro: Corte → Caldeiraria → Solda → Pintura. Lote: 80 unid.", responsible: "Ricardo Badeca", priority: "alta", category: "Logística", dueDate: "2026-08-22", status: "todo" },
  { id: "t4", board: "production", title: "Placa Base Usinada 300x300mm", desc: "Roteiro: Fresamento → Furação → Acabamento. Lote: 200 unid.", responsible: "Carlos Lima", priority: "media", category: "Transporte", dueDate: "2026-08-28", status: "doing" },
  { id: "t5", board: "production", title: "Conjunto de Mancais", desc: "Roteiro: Usinagem → Montagem → Controle QA. Lote: 45 unid.", responsible: "João Santos", priority: "alta", category: "Estoque", dueDate: "2026-08-21", status: "review" },
  { id: "t6", board: "production", title: "Chapa Perfurada 2mm", desc: "Roteiro: Corte → Furação → Acabamento. Lote: 1.000 unid.", responsible: "Fernanda Rocha", priority: "baixa", category: "Compras", dueDate: "2026-08-30", status: "todo" },
  { id: "t7", board: "production", title: "Anel de Vedação 200mm", desc: "Roteiro: Usinagem → Controle Dimensional. Lote: 300 unid.", responsible: "Maria Silva", priority: "media", category: "Estoque", dueDate: "2026-08-19", status: "done" },
  { id: "t8", board: "production", title: "Parafuso M8 Zincado", desc: "Roteiro: Forjamento → Rosqueamento → Tratamento Térmico. Lote: 5.000 unid.", responsible: "Pedro Costa", priority: "media", category: "Compras", dueDate: "2026-08-25", status: "todo" },
  { id: "t9", board: "production", title: "Carcaça Bomba Hidráulica", desc: "Roteiro: Fundição → Usinagem → Controle QA. Lote: 25 unid.", responsible: "Rafael Mendes", priority: "alta", category: "Estoque", dueDate: "2026-08-20", status: "review" },
  { id: "t10", board: "production", title: "Eixo Estriado 450mm", desc: "Roteiro: Torneamento → Fresamento de Estrias → Retífica. Lote: 60 unid.", responsible: "Gustavo Almeida", priority: "baixa", category: "Logística", dueDate: "2026-08-27", status: "todo" }
];

const DEFAULT_TASKS_SUPPORT = [
  { id: "s1", board: "tasks", title: "Chamado: leitor de código de barras não funciona", desc: "Usuário da expedição relatou falha no leitor. Verificar driver e cabo USB.", responsible: "João Santos", priority: "alta", category: "TI", dueDate: "2026-08-23", status: "doing" },
  { id: "s2", board: "tasks", title: "Atualizar cadastro de fornecedor - Aço Vale", desc: "Novo contato comercial e condições de pagamento precisam ser atualizados no sistema.", responsible: "Fernanda Rocha", priority: "media", category: "Administrativo", dueDate: "2026-08-29", status: "todo" },
  { id: "s3", board: "tasks", title: "Manutenção preventiva - Empilhadeira 02", desc: "Revisão programada de 500h. Agendar com oficina externa.", responsible: "Carlos Lima", priority: "alta", category: "Suporte", dueDate: "2026-08-21", status: "review" },
  { id: "s4", board: "tasks", title: "Treinamento de integração - novo operador", desc: "Aplicar treinamento de segurança e procedimentos do chão de fábrica.", responsible: "Ana Oliveira", priority: "baixa", category: "RH", dueDate: "2026-09-02", status: "todo" },
  { id: "s5", board: "tasks", title: "Revisar processo de expedição", desc: "Mapear gargalos no fechamento de romaneios antes do embarque.", responsible: "Pedro Costa", priority: "media", category: "Suporte", dueDate: "2026-08-27", status: "doing" },
  { id: "s6", board: "tasks", title: "Fechamento de ponto - equipe produção", desc: "Conferir horas extras e ausências do mês para envio ao RH.", responsible: "Maria Silva", priority: "baixa", category: "RH", dueDate: "2026-08-31", status: "done" }
];

let state = {
  boards: {
    production: { tasks: [], filters: { search: "", priority: "", responsible: "", category: "", status: "" } },
    tasks: { tasks: [], filters: { search: "", priority: "", responsible: "", category: "", status: "" } }
  },
  users: [],
  currentDragId: null,
  currentDragBoard: null,
  currentView: "production"
};

function loadState() {
  try {
    const savedProd = localStorage.getItem(STORAGE_KEYS.production);
    const savedTasks = localStorage.getItem(STORAGE_KEYS.tasks);
    const users = localStorage.getItem(USERS_KEY);
    state.boards.production.tasks = savedProd ? JSON.parse(savedProd) : DEFAULT_TASKS_PRODUCTION.slice();
    state.boards.tasks.tasks = savedTasks ? JSON.parse(savedTasks) : DEFAULT_TASKS_SUPPORT.slice();
    state.users = users ? JSON.parse(users) : DEFAULT_USERS.slice();
    if (!savedProd) saveBoard("production");
    if (!savedTasks) saveBoard("tasks");
    if (!users) saveUsers();
  } catch (e) {
    console.error("Erro ao carregar:", e);
    state.boards.production.tasks = DEFAULT_TASKS_PRODUCTION.slice();
    state.boards.tasks.tasks = DEFAULT_TASKS_SUPPORT.slice();
    state.users = DEFAULT_USERS.slice();
  }
}
function saveBoard(board) { localStorage.setItem(STORAGE_KEYS[board], JSON.stringify(state.boards[board].tasks)); }
function saveUsers() { localStorage.setItem(USERS_KEY, JSON.stringify(state.users)); }

function clearFilters(board) {
  state.boards[board].filters = { search: "", priority: "", responsible: "", category: "", status: "" };
  document.getElementById(`searchInput-${board}`).value = "";
  document.getElementById(`filterPriority-${board}`).value = "";
  document.getElementById(`filterResponsible-${board}`).value = "";
  document.getElementById(`filterCategory-${board}`).value = "";
  document.getElementById(`filterStatus-${board}`).value = "";
  render();
  showToast("Filtros limpos.", "info");
}

function bindFilterEvents(board) {
  document.getElementById(`searchInput-${board}`).addEventListener("input", (e) => { state.boards[board].filters.search = e.target.value.toLowerCase(); render(); });
  document.getElementById(`filterPriority-${board}`).addEventListener("change", (e) => { state.boards[board].filters.priority = e.target.value; render(); });
  document.getElementById(`filterResponsible-${board}`).addEventListener("change", (e) => { state.boards[board].filters.responsible = e.target.value; render(); });
  document.getElementById(`filterCategory-${board}`).addEventListener("change", (e) => { state.boards[board].filters.category = e.target.value; render(); });
  document.getElementById(`filterStatus-${board}`).addEventListener("change", (e) => { state.boards[board].filters.status = e.target.value; render(); });
}

// Tabs de visualização
document.querySelectorAll(".view-tab").forEach((tab) => {
  tab.addEventListener("click", function () {
    document.querySelectorAll(".view-tab").forEach((t) => { t.classList.remove("active"); t.setAttribute("aria-selected", "false"); });
    this.classList.add("active");
    this.setAttribute("aria-selected", "true");
    const view = this.dataset.view;
    state.currentView = view;
    document.querySelectorAll(".view-panel").forEach((p) => p.classList.remove("active"));
    document.getElementById("panel-" + view).classList.add("active");
    render();
  });
});

function populateFilterSelects(board) {
  const resp = document.getElementById(`filterResponsible-${board}`);
  const current = resp.value;
  resp.innerHTML = board === "production" ? '<option value="">Todos Operadores</option>' : '<option value="">Todos Responsáveis</option>';
  state.users.forEach((u) => resp.insertAdjacentHTML("beforeend", `<option value="${u}">${u}</option>`));
  resp.value = current;
}

function populateModalResponsibles() {
  const taskResp = document.getElementById("taskResponsible");
  const current = taskResp.value;
  taskResp.innerHTML = '<option value="">Selecione...</option>';
  state.users.forEach((u) => taskResp.insertAdjacentHTML("beforeend", `<option value="${u}">${u}</option>`));
  taskResp.value = current;
}

function populateModalCategories(board) {
  const sel = document.getElementById("taskCategory");
  sel.innerHTML = CATEGORIES[board].map((c) => `<option value="${c}">${c}</option>`).join("");
}

function populateModalStatuses(board) {
  const sel = document.getElementById("taskStatus");
  sel.innerHTML = STATUSES.map((s) => `<option value="${s}">${STATUS_LABELS[board][s]}</option>`).join("");
}

function renderStats(board) {
  const list = state.boards[board].tasks;
  const total = list.length;
  const doing = list.filter((t) => t.status === "doing").length;
  const overdue = list.filter((t) => isOverdue(t)).length;
  const done = list.filter((t) => t.status === "done").length;
  const high = list.filter((t) => t.priority === "alta" && t.status !== "done").length;

  const stats = [
    { label: board === "production" ? "Total de OPs" : "Total de Tarefas", value: total, icon: "fa-table-columns", cls: "c-blue" },
    { label: "Em Andamento", value: doing, icon: "fa-circle-play", cls: "c-blue" },
    { label: " uma vez a cada 24 horas", value: overdue, icon: "fa-triangle-exclamation", cls: "c-red" },
    { label: "Concluídas", value: done, icon: "fa-circle-check", cls: "c-green" },
    { label: "Prioridade Alta", value: high, icon: "fa-fire", cls: "c-amber" }
  ];

  document.getElementById(`kanbanStats-${board}`).innerHTML = stats
    .map(
      (s) => `
    <div class="kpi-card ${s.cls}">
      <div class="kpi-label"><i class="fas ${s.icon}"></i> ${s.label}</div>
      <div class="kpi-value">${s.value}</div>
    </div>`
    )
    .join("");
}

function isOverdue(task) {
  if (!task.dueDate || task.status === "done") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(task.dueDate + "T00:00:00");
  return due < today;
}

function formatDateBR(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}`;
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr + "T00:00:00");
  return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
}

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function escapeHtml(str) {
  if (str == null) return "";
  return String(str).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}

function applyFilters(board, tasks) {
  const f = state.boards[board].filters;
  return tasks.filter((t) => {
    if (f.search) {
      const hay = (t.title + " " + t.desc + " " + t.responsible).toLowerCase();
      if (!hay.includes(f.search)) return false;
    }
    if (f.priority && t.priority !== f.priority) return false;
    if (f.responsible && t.responsible !== f.responsible) return false;
    if (f.category && t.category !== f.category) return false;
    if (f.status && t.status !== f.status) return false;
    return true;
  });
}

function renderCard(board, task) {
  const overdue = isOverdue(task);
  const days = daysUntil(task.dueDate);
  let dateLabel = "";
  if (task.dueDate) {
    if (overdue) dateLabel = `<span class="overdue-flag"><i class="fas fa-circle-exclamation"></i> ${formatDateBR(task.dueDate)}</span>`;
    else if (days === 0) dateLabel = `<span style="color: var(--amber)"><i class="fas fa-clock"></i> Hoje</span>`;
    else if (days === 1) dateLabel = `<span><i class="fas fa-calendar"></i> Amanhã</span>`;
    else dateLabel = `<span><i class="fas fa-calendar"></i> ${formatDateBR(task.dueDate)}</span>`;
  }

  const catSlug = task.category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, "");
  const catClass = "tag-cat-" + catSlug;

  let progress = 0;
  if (task.status === "todo") progress = 25;
  else if (task.status === "doing") progress = 55;
  else if (task.status === "review") progress = 85;
  else if (task.status === "done") progress = 100;

  return `
    <div class="kanban-card priority-${task.priority} ${overdue ? "overdue" : ""}" draggable="true" data-id="${task.id}" data-board="${board}">
      <div class="card-top">
        <span class="card-id">#${task.id.toUpperCase()}</span>
        <button class="card-menu-btn" onclick="toggleCardMenu(event, '${task.id}')" aria-label="Menu"><i class="fas fa-ellipsis-vertical"></i></button>
        <div class="card-menu" id="menu-${task.id}">
          <button onclick="editTask('${board}', '${task.id}')"><i class="fas fa-pen"></i> Editar</button>
          <button onclick="duplicateTask('${board}', '${task.id}')"><i class="fas fa-copy"></i> Duplicar</button>
          <button class="danger" onclick="deleteTask('${board}', '${task.id}')"><i class="fas fa-trash"></i> Excluir</button>
        </div>
      </div>
      <div class="card-title">${escapeHtml(task.title)}</div>
      ${task.desc ? `<div class="card-desc">${escapeHtml(task.desc)}</div>` : ""}

      <div class="card-progress">
        <span class="progress-track">
          <span class="progress-fill" style="width: ${progress}%;"></span>
        </span>
        <span class="progress-text">${progress}%</span>
      </div>

      <div class="card-tags">
        <span class="tag tag-priority-${task.priority}">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
        <span class="tag ${catClass}">${escapeHtml(task.category)}</span>
      </div>
      <div class="card-footer">
        <div class="card-meta">${dateLabel || '<span style="opacity:0.6"><i class="fas fa-calendar"></i> Sem prazo</span>'}</div>
        <div class="card-avatar" title="${escapeHtml(task.responsible)}">${getInitials(task.responsible)}</div>
      </div>
    </div>`;
}

function renderColumn(board, status) {
  const col = document.getElementById(`col-${status}-${board}`);
  const filtered = applyFilters(board, state.boards[board].tasks.filter((t) => t.status === status));

  document.getElementById(`count-${status}-${board}`).textContent = filtered.length;

  if (filtered.length === 0) {
    const f = state.boards[board].filters;
    const hasFilters = f.search || f.priority || f.category || f.responsible || f.status;
    col.innerHTML = `<div class="column-empty">Nenhum card<br>${hasFilters ? "com os filtros aplicados" : "aqui ainda"}</div>`;
  } else {
    col.innerHTML = filtered.map((t) => renderCard(board, t)).join("");
  }
  attachDragEvents(col);
}

function renderBoard(board) {
  renderStats(board);
  STATUSES.forEach((s) => renderColumn(board, s));
  populateFilterSelects(board);
}

function render() {
  renderBoard("production");
  renderBoard("tasks");
}

function attachDragEvents(col) {
  col.querySelectorAll(".kanban-card").forEach((card) => {
    card.addEventListener("dragstart", (e) => {
      state.currentDragId = card.dataset.id;
      state.currentDragBoard = card.dataset.board;
      card.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      try { e.dataTransfer.setData("text/plain", card.dataset.id); } catch (_) {}
    });
    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
      state.currentDragId = null;
      state.currentDragBoard = null;
      document.querySelectorAll(".kanban-column").forEach((c) => c.classList.remove("drag-over"));
    });
  });
}

document.querySelectorAll(".column-cards").forEach((col) => {
  col.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    col.parentElement.classList.add("drag-over");
  });
  col.addEventListener("dragleave", (e) => {
    if (!col.contains(e.relatedTarget)) col.parentElement.classList.remove("drag-over");
  });
  col.addEventListener("drop", (e) => {
    e.preventDefault();
    col.parentElement.classList.remove("drag-over");
    const board = col.dataset.board;
    const id = state.currentDragId || e.dataTransfer.getData("text/plain");
    if (!id) return;
    const task = state.boards[board].tasks.find((t) => t.id === id);
    if (!task) return;
    const newStatus = col.dataset.status;
    if (task.status === newStatus) return;

    const oldLabel = STATUS_LABELS[board][task.status];
    const newLabel = STATUS_LABELS[board][newStatus];
    task.status = newStatus;
    saveBoard(board);
    render();
    showToast(`"${task.title}" movido: ${oldLabel} → ${newLabel}`, "success");
  });
});

function toggleCardMenu(e, id) {
  e.stopPropagation();
  document.querySelectorAll(".card-menu").forEach((m) => { if (m.id !== "menu-" + id) m.classList.remove("open"); });
  const menu = document.getElementById("menu-" + id);
  if (menu) menu.classList.toggle("open");
}
document.addEventListener("click", () => document.querySelectorAll(".card-menu").forEach((m) => m.classList.remove("open")));

function openTaskModal(board, status = "todo") {
  const labels = BOARD_LABELS[board];
  document.getElementById("taskForm").reset();
  document.getElementById("taskId").value = "";
  document.getElementById("taskBoard").value = board;
  document.getElementById("taskPriority").value = "media";
  document.getElementById("modalTitle").textContent = labels.newTitle;
  document.getElementById("modalSaveText").textContent = labels.saveNew;
  document.getElementById("taskTitleLabel").innerHTML = `${labels.titleLabel} <span class="req">*</span>`;
  document.getElementById("taskResponsibleLabel").innerHTML = `${labels.respLabel} <span class="req">*</span>`;
  document.querySelectorAll(".form-error").forEach((e) => e.classList.remove("show"));
  populateModalResponsibles();
  populateModalCategories(board);
  populateModalStatuses(board);
  document.getElementById("taskStatus").value = status;
  document.getElementById("taskModal").classList.add("open");
}
function closeTaskModal() { document.getElementById("taskModal").classList.remove("open"); }

function editTask(board, id) {
  const task = state.boards[board].tasks.find((t) => t.id === id);
  if (!task) return;
  const labels = BOARD_LABELS[board];
  document.getElementById("taskId").value = task.id;
  document.getElementById("taskBoard").value = board;
  populateModalResponsibles();
  populateModalCategories(board);
  populateModalStatuses(board);
  document.getElementById("taskTitle").value = task.title;
  document.getElementById("taskDesc").value = task.desc || "";
  document.getElementById("taskResponsible").value = task.responsible;
  document.getElementById("taskPriority").value = task.priority;
  document.getElementById("taskCategory").value = task.category;
  document.getElementById("taskDueDate").value = task.dueDate || "";
  document.getElementById("taskStatus").value = task.status;
  document.getElementById("modalTitle").textContent = labels.editTitle;
  document.getElementById("modalSaveText").textContent = labels.saveEdit;
  document.getElementById("taskTitleLabel").innerHTML = `${labels.titleLabel} <span class="req">*</span>`;
  document.getElementById("taskResponsibleLabel").innerHTML = `${labels.respLabel} <span class="req">*</span>`;
  document.querySelectorAll(".form-error").forEach((e) => e.classList.remove("show"));
  document.getElementById("taskModal").classList.add("open");
}

function saveTask() {
  const board = document.getElementById("taskBoard").value || "production";
  const id = document.getElementById("taskId").value;
  const title = document.getElementById("taskTitle").value.trim();
  const responsible = document.getElementById("taskResponsible").value;
  const priority = document.getElementById("taskPriority").value;
  const category = document.getElementById("taskCategory").value;
  const dueDate = document.getElementById("taskDueDate").value;
  const status = document.getElementById("taskStatus").value;
  const desc = document.getElementById("taskDesc").value.trim();

  let valid = true;
  const showErr = (fid, show) => {
    const el = document.getElementById("err-" + fid);
    if (el) el.classList.toggle("show", show);
    if (show) valid = false;
  };
  showErr("title", !title);
  showErr("responsible", !responsible);
  if (!valid) return;

  if (id) {
    const task = state.boards[board].tasks.find((t) => t.id === id);
    if (task) {
      Object.assign(task, { title, desc, responsible, priority, category, dueDate, status });
      showToast(board === "production" ? "OP atualizada." : "Tarefa atualizada.", "success");
    }
  } else {
    const prefix = board === "production" ? "t" : "s";
    const newId = prefix + Date.now().toString(36);
    state.boards[board].tasks.push({ id: newId, board, title, desc, responsible, priority, category, dueDate, status });
    if (!state.users.includes(responsible)) { state.users.push(responsible); saveUsers(); }
    showToast(board === "production" ? "OP criada no quadro." : "Tarefa criada no quadro.", "success");
  }
  saveBoard(board);
  closeTaskModal();
  render();
}

function deleteTask(board, id) {
  const task = state.boards[board].tasks.find((t) => t.id === id);
  if (!task) return;
  if (!confirm(`Excluir "${task.title}"?`)) return;
  state.boards[board].tasks = state.boards[board].tasks.filter((t) => t.id !== id);
  saveBoard(board);
  render();
  showToast(board === "production" ? "OP excluída." : "Tarefa excluída.", "warning");
}

function duplicateTask(board, id) {
  const task = state.boards[board].tasks.find((t) => t.id === id);
  if (!task) return;
  const prefix = board === "production" ? "t" : "s";
  const newId = prefix + Date.now().toString(36);
  state.boards[board].tasks.push({ ...task, id: newId, title: task.title + " (cópia)", status: "todo" });
  saveBoard(board);
  render();
  showToast("Card duplicado.", "info");
}

function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  const icons = { success: "fa-circle-check", error: "fa-circle-xmark", warning: "fa-triangle-exclamation", info: "fa-circle-info" };
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fas ${icons[type] || "fa-circle-info"}"></i><span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("hiding");
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeTaskModal();
    document.querySelectorAll(".card-menu").forEach((m) => m.classList.remove("open"));
  }
  if (e.key === "n" && (e.ctrlKey || "metaKey")) {
    e.preventDefault();
    openTaskModal(state.currentView);
  }
});

loadState();
bindFilterEvents("production");
bindFilterEvents("tasks");
render();
