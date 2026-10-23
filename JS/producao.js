/* StockLog — Controle de Produção
   Registros demonstrativos. atualizar() apenas reaplica filtros e confirma
   a ação visual; não simula consulta ao banco nem telemetria industrial.
*/
(function () {
  "use strict";

  const searchInput = document.getElementById("order-search");
  const statusFilter = document.getElementById("order-filter");
  const table = document.getElementById("orders-table");
  const emptyState = document.getElementById("orders-empty");
  const toast = document.getElementById("page-toast");
  const toastMessage = document.getElementById("toast-message");
  let toastTimer;

  function showToast(message) {
    if (!toast || !toastMessage) return;
    toastMessage.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 3200);
  }

  function filterOrders() {
    if (!table) return;
    const query = (searchInput?.value || "").trim().toLocaleLowerCase("pt-BR");
    const selectedStatus = statusFilter?.value || "all";
    const rows = Array.from(table.querySelectorAll("tbody tr"));
    let visibleCount = 0;

    rows.forEach((row) => {
      const searchableText = row.textContent.toLocaleLowerCase("pt-BR");
      const matchesQuery = !query || searchableText.includes(query);
      const matchesStatus = selectedStatus === "all"
        || (selectedStatus === "delayed" && row.dataset.delayed === "true")
        || row.dataset.status === selectedStatus;
      const visible = matchesQuery && matchesStatus;
      row.style.display = visible ? "" : "none";
      if (visible) visibleCount += 1;
    });

    if (emptyState) emptyState.style.display = visibleCount ? "none" : "block";
  }

  window.atualizar = function atualizar() {
    filterOrders();
    const now = new Date();
    const time = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    showToast(`Visualização revisada às ${time}. Dados demonstrativos.`);
  };

  searchInput?.addEventListener("input", filterOrders);
  statusFilter?.addEventListener("change", filterOrders);
  filterOrders();
})();