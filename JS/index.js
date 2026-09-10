(function () {
  'use strict';

  /* ==================================================================
     DADOS DOS ALERTAS
     Em produção isso viria da sua API — troque ATRASO_DATA / LOGISTICO_DATA
     pela resposta do backend quando integrar.
     ================================================================== */
  const ATRASO_DATA = [
    {
      id: 'PED-1042',
      title: 'Pedido #1042 – Atraso na produção',
      meta: [
        { icon: 'fa-calendar-times', text: 'Venceu há 5 dias' },
        { icon: 'fa-building', text: 'Qualidade' }
      ],
      severity: 'critical',
      severityLabel: 'Crítico',
      actionLabel: 'Revisar',
      actionIcon: 'fa-search',
      actionType: 'revisar'
    },
    {
      id: 'PED-1031',
      title: 'Pedido #1031 – Aguardando matéria-prima',
      meta: [
        { icon: 'fa-calendar-times', text: 'Venceu há 12 dias' },
        { icon: 'fa-industry', text: 'Produção' }
      ],
      severity: 'critical',
      severityLabel: 'Crítico',
      actionLabel: 'Ver Estoque',
      actionIcon: 'fa-warehouse',
      actionType: 'estoque'
    },
    {
      id: 'OP-2026-007',
      title: 'OP-2026-007 – Prazo crítico de entrega',
      meta: [
        { icon: 'fa-clock', text: 'Vence em 2 dias' },
        { icon: 'fa-industry', text: 'Produção' }
      ],
      severity: 'high',
      severityLabel: 'Alto',
      actionLabel: 'Revisar',
      actionIcon: 'fa-search',
      actionType: 'revisar'
    },
    {
      id: 'PED-1038',
      title: 'Pedido #1038 – Retrabalho solicitado',
      meta: [
        { icon: 'fa-calendar-times', text: 'Venceu há 3 dias' },
        { icon: 'fa-building', text: 'Qualidade' }
      ],
      severity: 'high',
      severityLabel: 'Alto',
      actionLabel: 'Revisar',
      actionIcon: 'fa-search',
      actionType: 'revisar'
    },
    {
      id: 'PED-1019',
      title: 'Pedido #1019 – Aguardando aprovação do cliente',
      meta: [
        { icon: 'fa-clock', text: 'Venceu há 1 dia' },
        { icon: 'fa-handshake', text: 'Comercial' }
      ],
      severity: 'medium',
      severityLabel: 'Médio',
      actionLabel: 'Revisar',
      actionIcon: 'fa-search',
      actionType: 'revisar'
    },
    {
      id: 'OP-2026-004',
      title: 'OP-2026-004 – Atraso na usinagem',
      meta: [
        { icon: 'fa-clock', text: 'Vence amanhã' },
        { icon: 'fa-industry', text: 'Produção' }
      ],
      severity: 'medium',
      severityLabel: 'Médio',
      actionLabel: 'Revisar',
      actionIcon: 'fa-search',
      actionType: 'revisar'
    }
  ];

  const LOGISTICO_DATA = [
    {
      id: 'EST-ACO',
      title: 'Estoque de aço abaixo do limite',
      meta: [
        { icon: 'fa-calendar', text: 'Vence em 8 dias' },
        { icon: 'fa-warehouse', text: 'Almoxarifado' }
      ],
      severity: 'medium',
      severityLabel: 'Médio',
      actionLabel: 'Ver Estoque',
      actionIcon: 'fa-warehouse',
      actionType: 'estoque'
    },
    {
      id: 'ENT-1047',
      title: 'Entrega #1047 em rota',
      meta: [
        { icon: 'fa-truck', text: 'Chegada prevista hoje' },
        { icon: 'fa-route', text: 'Rota 03' }
      ],
      severity: 'low',
      severityLabel: 'Baixo',
      actionLabel: 'Acompanhar',
      actionIcon: 'fa-truck',
      actionType: 'acompanhar'
    },
    {
      id: 'EST-INOX',
      title: 'Estoque crítico: Chapa Inox 304',
      meta: [
        { icon: 'fa-exclamation-circle', text: 'Reposição urgente' },
        { icon: 'fa-warehouse', text: 'Almoxarifado' }
      ],
      severity: 'critical',
      severityLabel: 'Crítico',
      actionLabel: 'Ver Estoque',
      actionIcon: 'fa-warehouse',
      actionType: 'estoque'
    },
    {
      id: 'EST-LUVA',
      title: 'Estoque crítico: Luva Nitrílica',
      meta: [
        { icon: 'fa-exclamation-circle', text: 'Reposição urgente' },
        { icon: 'fa-hard-hat', text: 'EPI' }
      ],
      severity: 'high',
      severityLabel: 'Alto',
      actionLabel: 'Ver Estoque',
      actionIcon: 'fa-warehouse',
      actionType: 'estoque'
    },
    {
      id: 'ENT-1052',
      title: 'Entrega #1052 atrasada',
      meta: [
        { icon: 'fa-calendar-times', text: 'Atraso de 2 dias' },
        { icon: 'fa-route', text: 'Rota 01' }
      ],
      severity: 'high',
      severityLabel: 'Alto',
      actionLabel: 'Acompanhar',
      actionIcon: 'fa-truck',
      actionType: 'acompanhar'
    },
    {
      id: 'TRANSP-01',
      title: 'Transportadora sem confirmação',
      meta: [
        { icon: 'fa-clock', text: 'Aguardando retorno' },
        { icon: 'fa-route', text: 'Logística' }
      ],
      severity: 'low',
      severityLabel: 'Baixo',
      actionLabel: 'Acompanhar',
      actionIcon: 'fa-truck',
      actionType: 'acompanhar'
    }
  ];

  const state = {
    activeTab: 'atraso',
    expanded: false
  };

  /* ==================================================================
     TOASTS
     ================================================================== */
  function showToast(message, type) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast' + (type === 'info' ? ' toast-info' : '');
    const icon = type === 'info' ? 'fa-circle-info' : 'fa-circle-check';
    toast.innerHTML = '<i class="fas ' + icon + '"></i><span></span>';
    toast.querySelector('span').textContent = message;
    container.appendChild(toast);
    requestAnimationFrame(function () {
      toast.classList.add('show');
    });
    setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () {
        toast.remove();
      }, 300);
    }, 3200);
  }

  /* ==================================================================
     MODAL GENÉRICO
     ================================================================== */
  const modalOverlay = document.getElementById('appModal');
  const modalTitleText = document.getElementById('modalTitleText');
  const modalTitleIcon = document.querySelector('#modalTitle i');
  const modalBody = document.getElementById('modalBody');
  const modalFooter = document.getElementById('modalFooter');
  const modalCloseBtn = document.getElementById('modalCloseBtn');

  function openModal(opts) {
    modalTitleText.textContent = opts.title || 'Detalhes';
    modalTitleIcon.className = 'fas ' + (opts.icon || 'fa-info-circle');
    modalBody.innerHTML = opts.bodyHtml || '';
    modalFooter.innerHTML = '';
    (opts.buttons || []).forEach(function (btn) {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'mbtn ' + (btn.primary ? 'mbtn-primary' : 'mbtn-secondary');
      el.textContent = btn.label;
      el.addEventListener('click', function () {
        if (btn.onClick) btn.onClick();
      });
      modalFooter.appendChild(el);
    });
    modalOverlay.classList.add('open');
  }

  function closeModal() {
    modalOverlay.classList.remove('open');
  }

  modalCloseBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', function (e) {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  function detailRow(k, v) {
    return (
      '<div class="detail-row"><span class="k">' +
      k +
      '</span><span class="v">' +
      v +
      '</span></div>'
    );
  }

  /* ==================================================================
     RENDER DOS ALERTAS (abas + lista)
     ================================================================== */
  function severityBadge(item) {
    return '<span class="severity-tag ' + item.severity + '">' + item.severityLabel + '</span>';
  }

  function renderAlertList(containerId, items) {
    const container = document.getElementById(containerId);
    container.innerHTML = items
      .map(function (item) {
        const metaHtml = item.meta
          .map(function (m) {
            return '<span><i class="fas ' + m.icon + '"></i>' + m.text + '</span>';
          })
          .join('');
        return (
          '<div class="alert-item" data-alert-id="' +
          item.id +
          '">' +
          '<div>' +
          '<div class="alert-title">' +
          item.title +
          '</div>' +
          '<div class="alert-meta">' +
          metaHtml +
          '</div>' +
          '</div>' +
          '<div class="alert-actions">' +
          severityBadge(item) +
          '<button class="alert-action-btn" type="button" data-action-type="' +
          item.actionType +
          '" data-alert-id="' +
          item.id +
          '"><i class="fas ' +
          item.actionIcon +
          '"></i> ' +
          item.actionLabel +
          '</button>' +
          '</div>' +
          '</div>'
        );
      })
      .join('');
  }

  function findAlertById(id) {
    return (
      ATRASO_DATA.find(function (a) { return a.id === id; }) ||
      LOGISTICO_DATA.find(function (a) { return a.id === id; })
    );
  }

  function updateCounts() {
    document.getElementById('countAtraso').textContent = ATRASO_DATA.length;
    document.getElementById('countLogistico').textContent = LOGISTICO_DATA.length;
    document.getElementById('alertsTotalBadge').textContent =
      ATRASO_DATA.length + LOGISTICO_DATA.length + ' alertas';
  }

  function initAlerts() {
    renderAlertList('listAtraso', ATRASO_DATA);
    renderAlertList('listLogistico', LOGISTICO_DATA);
    updateCounts();

    // Abas
    const tabs = document.querySelectorAll('.alert-tab');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        const target = tab.getAttribute('data-tab');
        if (target === state.activeTab) return;
        state.activeTab = target;

        tabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');

        document.querySelectorAll('.alert-panel').forEach(function (panel) {
          panel.classList.toggle('active', panel.getAttribute('data-panel') === target);
        });

        // Recolhe a lista ao trocar de aba
        state.expanded = false;
        applyExpandState();
      });
    });

    // Ver mais / Ver menos
    const verMaisBtn = document.getElementById('verMaisBtn');
    verMaisBtn.addEventListener('click', function () {
      state.expanded = !state.expanded;
      applyExpandState();
    });

    // Ações dos alertas (delegação de evento)
    document.querySelectorAll('.alert-panel').forEach(function (panel) {
      panel.addEventListener('click', function (e) {
        const btn = e.target.closest('.alert-action-btn');
        if (!btn) return;
        const alertId = btn.getAttribute('data-alert-id');
        const actionType = btn.getAttribute('data-action-type');
        handleAlertAction(actionType, alertId);
      });
    });
  }

  function applyExpandState() {
    const activeList = document.querySelector('.alert-panel.active .alert-list');
    const verMaisBtn = document.getElementById('verMaisBtn');
    const label = document.getElementById('verMaisLabel');
    if (!activeList) return;
    activeList.classList.toggle('expanded', state.expanded);
    verMaisBtn.classList.toggle('expanded', state.expanded);
    label.textContent = state.expanded ? 'Ver menos' : 'Ver mais';
  }

  function handleAlertAction(actionType, alertId) {
    const item = findAlertById(alertId);
    if (!item) return;

    if (actionType === 'estoque') {
      showToast('Redirecionando para o Estoque...', 'info');
      setTimeout(function () {
        window.location.href = 'itens.html';
      }, 500);
      return;
    }

    if (actionType === 'revisar') {
      openModal({
        title: item.title,
        icon: 'fa-search',
        bodyHtml:
          detailRow('Identificador', item.id) +
          detailRow('Status', item.severityLabel) +
          item.meta.map(function (m) { return detailRow('Info', m.text); }).join(''),
        buttons: [
          { label: 'Fechar', onClick: closeModal },
          {
            label: 'Marcar como revisado',
            primary: true,
            onClick: function () {
              closeModal();
              showToast('"' + item.title + '" marcado como revisado.');
            }
          }
        ]
      });
      return;
    }

    if (actionType === 'acompanhar') {
      openModal({
        title: item.title,
        icon: 'fa-truck',
        bodyHtml:
          detailRow('Identificador', item.id) +
          detailRow('Situação', item.severityLabel) +
          item.meta.map(function (m) { return detailRow('Info', m.text); }).join('') +
          '<div style="margin-top:14px;font-size:12.5px;color:var(--text-secondary)">' +
          'Acompanhamento em tempo real integra com o rastreio da transportadora.' +
          '</div>',
        buttons: [{ label: 'Fechar', onClick: closeModal, primary: true }]
      });
    }
  }

  /* ==================================================================
     FILTRO DA TABELA DE PEDIDOS
     ================================================================== */
  const filterBtn = document.querySelector('.filter-btn');
  const searchInput = document.querySelector('.search-input');
  const statusFilter = document.querySelector('.filter-select');

  function applyFilters() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const statusTerm = statusFilter ? statusFilter.value.toLowerCase() : '';

    const rows = document.querySelectorAll('.table-wrapper tbody tr');
    let visibleCount = 0;
    rows.forEach(function (row) {
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
          concluido: 'concluído',
          pendente: 'pendente',
          andamento: 'em andamento'
        };
        const mappedStatus = statusMap[statusTerm] || statusTerm;
        if (!statusText.includes(mappedStatus)) {
          show = false;
        }
      }
      row.style.display = show ? '' : 'none';
      if (show) visibleCount++;
    });

    showToast(visibleCount + ' pedido(s) encontrado(s).', 'info');
  }

  if (filterBtn) {
    filterBtn.addEventListener('click', applyFilters);
  }
  if (searchInput) {
    searchInput.addEventListener('keyup', function (e) {
      if (e.key === 'Enter') applyFilters();
    });
  }
  if (statusFilter) {
    statusFilter.addEventListener('change', applyFilters);
  }

  /* ==================================================================
     AÇÕES DA TABELA DE PEDIDOS (visualizar / editar / imprimir)
     ================================================================== */
  const statusOptions = [
    { value: 'success', label: 'Concluído' },
    { value: 'pending', label: 'Pendente' },
    { value: 'progress', label: 'Em andamento' }
  ];

  function getRowData(row) {
    const statusEl = row.querySelector('.status-badge');
    const statusClass = statusOptions.find(function (s) {
      return statusEl.classList.contains(s.value);
    });
    return {
      pedido: row.cells[0].textContent.trim(),
      cliente: row.cells[1].textContent.trim(),
      item: row.cells[2].textContent.trim(),
      setor: row.cells[3].textContent.trim(),
      data: row.cells[4].textContent.trim(),
      statusValue: statusClass ? statusClass.value : 'pending',
      statusLabel: statusEl.textContent.trim()
    };
  }

  function viewOrder(row) {
    const d = getRowData(row);
    openModal({
      title: d.pedido,
      icon: 'fa-eye',
      bodyHtml:
        detailRow('Cliente', d.cliente) +
        detailRow('Item / Produto', d.item) +
        detailRow('Setor', d.setor) +
        detailRow('Data', d.data) +
        detailRow('Status', d.statusLabel),
      buttons: [{ label: 'Fechar', onClick: closeModal, primary: true }]
    });
  }

  function editOrder(row) {
    const d = getRowData(row);
    const optionsHtml = statusOptions
      .map(function (s) {
        return (
          '<option value="' +
          s.value +
          '"' +
          (s.value === d.statusValue ? ' selected' : '') +
          '>' +
          s.label +
          '</option>'
        );
      })
      .join('');

    openModal({
      title: 'Editar ' + d.pedido,
      icon: 'fa-pen',
      bodyHtml:
        '<div class="form-group"><label>Cliente</label><input type="text" id="editCliente" value="' +
        d.cliente +
        '"></div>' +
        '<div class="form-group"><label>Item / Produto</label><input type="text" id="editItem" value="' +
        d.item +
        '"></div>' +
        '<div class="form-group"><label>Setor</label><input type="text" id="editSetor" value="' +
        d.setor +
        '"></div>' +
        '<div class="form-group"><label>Status</label><select id="editStatus">' +
        optionsHtml +
        '</select></div>',
      buttons: [
        { label: 'Cancelar', onClick: closeModal },
        {
          label: 'Salvar alterações',
          primary: true,
          onClick: function () {
            const newCliente = document.getElementById('editCliente').value.trim();
            const newItem = document.getElementById('editItem').value.trim();
            const newSetor = document.getElementById('editSetor').value.trim();
            const newStatusValue = document.getElementById('editStatus').value;
            const newStatusInfo = statusOptions.find(function (s) { return s.value === newStatusValue; });

            row.cells[1].textContent = newCliente;
            row.cells[2].textContent = newItem;
            row.cells[3].textContent = newSetor;

            const statusEl = row.querySelector('.status-badge');
            statusEl.className = 'status-badge ' + newStatusInfo.value;
            statusEl.textContent = newStatusInfo.label;

            closeModal();
            showToast('Pedido ' + d.pedido + ' atualizado com sucesso.');
          }
        }
      ]
    });
  }

  function printOrder(row) {
    const d = getRowData(row);
    const printWindow = window.open('', '_blank', 'width=640,height=760');
    if (!printWindow) {
      showToast('Permita pop-ups para imprimir o pedido.', 'info');
      return;
    }
    printWindow.document.write(
      '<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"><title>' +
        d.pedido +
        '</title><style>' +
        'body{font-family:Arial,sans-serif;padding:32px;color:#0a1f33}' +
        'h1{font-size:20px;margin-bottom:4px}' +
        'p.sub{color:#3d5f7e;margin-bottom:24px;font-size:13px}' +
        'table{width:100%;border-collapse:collapse}' +
        'td{padding:10px 0;border-bottom:1px solid #e2ecf6;font-size:14px}' +
        'td.k{color:#3d5f7e;width:160px}' +
        'td.v{font-weight:700}' +
        '</style></head><body>' +
        '<h1>Comprovante de Pedido — ' +
        d.pedido +
        '</h1>' +
        '<p class="sub">StockLog · gerado em ' +
        new Date().toLocaleString('pt-BR') +
        '</p>' +
        '<table>' +
        '<tr><td class="k">Cliente</td><td class="v">' + d.cliente + '</td></tr>' +
        '<tr><td class="k">Item / Produto</td><td class="v">' + d.item + '</td></tr>' +
        '<tr><td class="k">Setor</td><td class="v">' + d.setor + '</td></tr>' +
        '<tr><td class="k">Data</td><td class="v">' + d.data + '</td></tr>' +
        '<tr><td class="k">Status</td><td class="v">' + d.statusLabel + '</td></tr>' +
        '</table>' +
        '</body></html>'
    );
    printWindow.document.close();
    printWindow.focus();
    setTimeout(function () {
      printWindow.print();
    }, 300);
  }

  function initOrdersTable() {
    document.querySelectorAll('.table-wrapper tbody').forEach(function (tbody) {
      tbody.addEventListener('click', function (e) {
        const btn = e.target.closest('.action-btn[data-action]');
        if (!btn) return;
        const row = btn.closest('tr');
        const action = btn.getAttribute('data-action');
        if (action === 'view') viewOrder(row);
        if (action === 'edit') editOrder(row);
        if (action === 'print') printOrder(row);
      });
    });
  }

  /* ==================================================================
     ANIMAÇÃO DAS BARRAS
     ================================================================== */
  window.addEventListener('load', function () {
    const fills = document.querySelectorAll('.chart-fill');
    fills.forEach(function (bar) {
      const width = bar.style.width;
      bar.style.width = '0%';
      setTimeout(function () {
        bar.style.width = width;
      }, 200);
    });
  });

  /* ==================================================================
     CHAT TOGGLE (integra com components/js/chat.js quando presente)
     ================================================================== */
  function initChatToggle() {
    const chatToggle = document.getElementById('chatToggle') || document.querySelector('.chat-toggle');
    if (chatToggle) {
      chatToggle.addEventListener('click', function () {
        const chatEvent = new CustomEvent('toggleChat');
        document.dispatchEvent(chatEvent);
      });
    }
  }

  /* ==================================================================
     INIT
     ================================================================== */
  document.addEventListener('DOMContentLoaded', function () {
    initAlerts();
    initOrdersTable();
    initChatToggle();
    console.log('🚀 StockLog Dashboard carregado com sucesso!');
  });
})();