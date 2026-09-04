function toggleTheme() {

  const isDark = document.body.classList.toggle("dark");

  document.getElementById("themeIcon").className = isDark ? "fas fa-moon" : "fas fa-sun";

}


const STATUS_META = {

  planejamento: { label: "Planejamento", color: "#5890c0", bg: "var(--primary-light)" },

  aguardando: { label: "Aguard. Material", color: "var(--amber)", bg: "var(--amber-bg)" },

  producao: { label: "Em Produção", color: "var(--green)", bg: "var(--green-bg)" },

  qa: { label: "Controle QA", color: "var(--purple)", bg: "var(--purple-bg)" },

  concluido: { label: "Concluído", color: "var(--blue2)", bg: "var(--blue2-bg)" },

  cancelado: { label: "Cancelado", color: "var(--red)", bg: "var(--red-bg)" },

};

const PRIORITY_META = {

  baixa: { label: "Baixa", color: "var(--green)", bg: "var(--green-bg)" },

  media: { label: "Média", color: "var(--primary)", bg: "var(--primary-light)" },

  alta: { label: "Alta", color: "var(--amber)", bg: "var(--amber-bg)" },

  urgente: { label: "Urgente", color: "var(--red)", bg: "var(--red-bg)" },

};


let orders = [

  { id: "OP-2025-001", produto: "Flange Aço ABNT 1020 ø50mm", quantidade: 500, prioridade: "media", responsavel: "Gustavo Lima", prazo: "2026-06-09", status: "producao", obs: "" },

  { id: "OP-2025-002", produto: "Eixo Vazado 420mm", quantidade: 120, prioridade: "alta", responsavel: "Ana Ferreira", prazo: "2026-06-11", status: "qa", obs: "" },

  { id: "OP-2025-003", produto: "Chapa Inox 304 2mm", quantidade: 800, prioridade: "urgente", responsavel: "Ricardo Ribeiro", prazo: "2026-08-10", status: "aguardando", obs: "Aguardando reposição de matéria-prima." },

  { id: "OP-2025-004", produto: "Luva Nitrílica Reforçada", quantidade: 2000, prioridade: "alta", responsavel: "Vinícius Carvalho", prazo: "2026-08-18", status: "planejamento", obs: "" },

  { id: "OP-2025-005", produto: "Suporte de Fixação L-40", quantidade: 300, prioridade: "baixa", responsavel: "Bruno Ferreira", prazo: "2026-07-30", status: "concluido", obs: "" },

  { id: "OP-2025-006", produto: "Válvula Esfera 1/2\"", quantidade: 150, prioridade: "media", responsavel: "Ana Ferreira", prazo: "2026-05-20", status: "cancelado", obs: "Pedido cancelado a pedido do cliente." },

];

let nextSeq = 7;

let editingId = null;

let viewMode = false;


function fmtDate(iso) {

  if (!iso) return "—";

  const [y, m, d] = iso.split("-");

  return `${d}/${m}/${y}`;

}

function isLate(order) {

  if (order.status === "concluido" || order.status === "cancelado") return false;

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return new Date(order.prazo + "T00:00:00") < today;

}


function renderKPIs() {

  document.getElementById("kpiTotal").textContent = orders.filter((o) => o.status !== "cancelado").length;

  document.getElementById("kpiProducao").textContent = orders.filter((o) => o.status === "producao").length;

  document.getElementById("kpiAtrasados").textContent = orders.filter(isLate).length;

  document.getElementById("kpiConcluidos").textContent = orders.filter((o) => o.status === "concluido").length;

}


function escapeHtml(str) {

  const d = document.createElement("div");

  d.textContent = str;

  return d.innerHTML;

}


function renderTable() {

  const search = document.getElementById("searchInput").value.trim().toLowerCase();

  const statusF = document.getElementById("statusFilter").value;

  const priorityF = document.getElementById("priorityFilter").value;


  const filtered = orders.filter((o) => {

    const matchesSearch =

      !search ||

      o.id.toLowerCase().includes(search) ||

      o.produto.toLowerCase().includes(search) ||

      o.responsavel.toLowerCase().includes(search);

    const matchesStatus = !statusF || o.status === statusF;

    const matchesPriority = !priorityF || o.prioridade === priorityF;

    return matchesSearch && matchesStatus && matchesPriority;

  });


  const tbody = document.getElementById("ordersTableBody");

  tbody.innerHTML = "";

  document.getElementById("emptyState").style.display = filtered.length ? "none" : "block";

  document.getElementById("countBadge").textContent = `${orders.length} pedido${orders.length === 1 ? "" : "s"}`;


  filtered.forEach((o) => {

    const st = STATUS_META[o.status];

    const pr = PRIORITY_META[o.prioridade];

    const tr = document.createElement("tr");

    tr.className = "order-row";

    tr.innerHTML = `

      <td><strong>${o.id}</strong></td>

      <td class="prod-cell">

        <div class="prod-name">${escapeHtml(o.produto)}</div>

        <div class="prod-qty">${o.quantidade.toLocaleString("pt-BR")} unid.</div>

      </td>

      <td><span class="priority-tag" style="background:${pr.bg};color:${pr.color}"><span class="dot" style="background:${pr.color}"></span>${pr.label}</span></td>

      <td>${escapeHtml(o.responsavel)}</td>

      <td>${fmtDate(o.prazo)}${isLate(o) ? ' <i class="fas fa-triangle-exclamation" style="color:var(--red)" title="Prazo vencido"></i>' : ""}</td>

      <td><span class="status-tag" style="background:${st.bg};color:${st.color}"><span class="dot" style="background:${st.color}"></span>${st.label}</span></td>

      <td>

        <div class="row-actions">

          <button class="icon-btn" title="Visualizar" onclick="openViewModal('${o.id}')"><i class="fas fa-eye"></i></button>

          <button class="icon-btn" title="Editar" onclick="openEditModal('${o.id}')"><i class="fas fa-pen"></i></button>

          <button class="icon-btn danger" title="Excluir" onclick="deleteOrder('${o.id}')"><i class="fas fa-trash"></i></button>

        </div>

      </td>

    `;

    tbody.appendChild(tr);

  });

}


function renderAll() {

  renderKPIs();

  renderTable();

}


const overlay = document.getElementById("modalOverlay");

const form = document.getElementById("orderForm");


function resetForm() {

  form.reset();

  document.getElementById("fPrioridade").value = "media";

  document.getElementById("fStatus").value = "planejamento";

  [...form.querySelectorAll(".field")].forEach((f) => f.classList.remove("has-error"));

  setFieldsDisabled(false);

}


function setFieldsDisabled(disabled) {

  ["fProduto", "fQuantidade", "fPrioridade", "fResponsavel", "fPrazo", "fStatus", "fObs"].forEach((id) => {

    document.getElementById(id).disabled = disabled;

  });

}


function openCreateModal() {

  editingId = null;

  viewMode = false;

  resetForm();

  document.getElementById("modalTitle").innerHTML = '<i class="fas fa-plus"></i>Novo pedido';

  document.getElementById("codeFieldWrap").style.display = "none";

  document.getElementById("saveBtn").style.display = "inline-flex";

  document.getElementById("editFromViewBtn").style.display = "none";

  overlay.classList.add("open");

  document.getElementById("fProduto").focus();

}


function fillForm(o) {

  document.getElementById("fProduto").value = o.produto;

  document.getElementById("fQuantidade").value = o.quantidade;

  document.getElementById("fPrioridade").value = o.prioridade;

  document.getElementById("fResponsavel").value = o.responsavel;

  document.getElementById("fPrazo").value = o.prazo;

  document.getElementById("fStatus").value = o.status;

  document.getElementById("fObs").value = o.obs || "";

}


function openEditModal(id) {

  const o = orders.find((x) => x.id === id);

  if (!o) return;

  editingId = id;

  viewMode = false;

  resetForm();

  fillForm(o);

  document.getElementById("modalTitle").innerHTML = '<i class="fas fa-pen"></i>Editar pedido';

  document.getElementById("codeFieldWrap").style.display = "flex";

  document.getElementById("viewCode").textContent = o.id;

  document.getElementById("saveBtn").style.display = "inline-flex";

  document.getElementById("editFromViewBtn").style.display = "none";

  overlay.classList.add("open");

}


function openViewModal(id) {

  const o = orders.find((x) => x.id === id);

  if (!o) return;

  editingId = id;

  viewMode = true;

  resetForm();

  fillForm(o);

  setFieldsDisabled(true);

  document.getElementById("modalTitle").innerHTML = '<i class="fas fa-eye"></i>Detalhes do pedido';

  document.getElementById("codeFieldWrap").style.display = "flex";

  document.getElementById("viewCode").textContent = o.id;

  document.getElementById("saveBtn").style.display = "none";

  document.getElementById("editFromViewBtn").style.display = "inline-flex";

  overlay.classList.add("open");

}


function switchViewToEdit() {

  viewMode = false;

  setFieldsDisabled(false);

  document.getElementById("modalTitle").innerHTML = '<i class="fas fa-pen"></i>Editar pedido';

  document.getElementById("saveBtn").style.display = "inline-flex";

  document.getElementById("editFromViewBtn").style.display = "none";

}


function closeModal() {

  overlay.classList.remove("open");

  editingId = null;

  viewMode = false;

}

overlay.addEventListener("click", (e) => {

  if (e.target === overlay) closeModal();

});

document.addEventListener("keydown", (e) => {

  if (e.key === "Escape" && overlay.classList.contains("open")) closeModal();

});


function validate() {

  let valid = true;

  const checks = [

    ["fProduto", (v) => v.trim().length > 0],

    ["fQuantidade", (v) => Number(v) > 0],

    ["fResponsavel", (v) => v.trim().length > 0],

    ["fPrazo", (v) => v.trim().length > 0],

  ];

  checks.forEach(([id, test]) => {

    const el = document.getElementById(id);

    const field = el.closest(".field");

    if (!test(el.value)) {

      field.classList.add("has-error");

      valid = false;

    } else {

      field.classList.remove("has-error");

    }

  });

  return valid;

}


form.addEventListener("submit", (e) => {

  e.preventDefault();

  if (viewMode) return;

  if (!validate()) return;


  const data = {

    produto: document.getElementById("fProduto").value.trim(),

    quantidade: Number(document.getElementById("fQuantidade").value),

    prioridade: document.getElementById("fPrioridade").value,

    responsavel: document.getElementById("fResponsavel").value.trim(),

    prazo: document.getElementById("fPrazo").value,

    status: document.getElementById("fStatus").value,

    obs: document.getElementById("fObs").value.trim(),

  };


  if (editingId) {

    const o = orders.find((x) => x.id === editingId);

    Object.assign(o, data);

    showToast(`Pedido ${editingId} atualizado com sucesso.`);

  } else {

    const id = `OP-2025-${String(nextSeq++).padStart(3, "0")}`;

    orders.unshift({ id, ...data });

    showToast(`Pedido ${id} criado com sucesso.`);

  }

  closeModal();

  renderAll();

});


function deleteOrder(id) {

  if (!confirm(`Excluir o pedido ${id}? Essa ação não pode ser desfeita.`)) return;

  orders = orders.filter((o) => o.id !== id);

  showToast(`Pedido ${id} excluído.`, true);

  renderAll();

}


let toastTimer;

function showToast(msg, danger = false) {

  const toast = document.getElementById("toast");

  toast.classList.toggle("danger", danger);

  toast.querySelector("i").className = danger ? "fas fa-trash" : "fas fa-check-circle";

  document.getElementById("toastMsg").textContent = msg;

  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);

}


document.getElementById("searchInput").addEventListener("input", renderTable);

document.getElementById("statusFilter").addEventListener("change", renderTable);

document.getElementById("priorityFilter").addEventListener("change", renderTable);


renderAll();