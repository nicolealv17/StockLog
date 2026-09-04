(function() {
  'use strict';

  // ---- FILTRO DA TABELA ----
  const filterBtn = document.querySelector('.filter-btn');
  const searchInput = document.querySelector('.search-input');
  const statusFilter = document.querySelector('.filter-select');

  function applyFilters() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const statusTerm = statusFilter ? statusFilter.value.toLowerCase() : '';

    const rows = document.querySelectorAll('.table-wrapper tbody tr');
    rows.forEach(function(row) {
      const pedido = row.cells[0] ? row.cells[0].textContent.toLowerCase() : '';
      const cliente = row.cells[1] ? row.cells[1].textContent.toLowerCase() : '';
      const statusEl = row.querySelector('.status-badge');
      const statusText = statusEl ? statusEl.textContent.toLowerCase() : '';

      let show = true;
      if (searchTerm && !pedido.includes(searchTerm) && !cliente.includes(searchTerm)) {
        show = false;
      }
      if (statusTerm) {
        const statusMap = {
          'concluido': 'concluído',
          'pendente': 'pendente',
          'andamento': 'em andamento'
        };
        const mappedStatus = statusMap[statusTerm] || statusTerm;
        if (!statusText.includes(mappedStatus)) {
          show = false;
        }
      }
      row.style.display = show ? '' : 'none';
    });
  }

  if (filterBtn) {
    filterBtn.addEventListener('click', applyFilters);
  }

  if (searchInput) {
    searchInput.addEventListener('keyup', function(e) {
      if (e.key === 'Enter') {
        applyFilters();
      }
    });
  }

  if (statusFilter) {
    statusFilter.addEventListener('change', applyFilters);
  }

  // ---- ANIMAÇÃO DAS BARRAS ----
  window.addEventListener('load', function() {
    const fills = document.querySelectorAll('.chart-fill');
    fills.forEach(function(bar) {
      const width = bar.style.width;
      bar.style.width = '0%';
      setTimeout(function() {
        bar.style.width = width;
      }, 200);
    });
  });

  // ---- CHAT TOGGLE ----
  const chatToggle = document.getElementById('chatToggle');
  if (chatToggle) {
    chatToggle.addEventListener('click', function() {
      // Simula abertura do chat - integra com components/js/chat.js
      const chatEvent = new CustomEvent('toggleChat');
      document.dispatchEvent(chatEvent);
    });
  }

  console.log('🚀 StockLog Dashboard carregado com sucesso!');
})();