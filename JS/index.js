(function () {
  'use strict';

  /* ==================================================================
     1. DADOS UNIFICADOS (mock central)
     Em produção, substitua por chamadas de API reais.
     ================================================================== */
  const DASHBOARD_DATA = {
    // KPIs
    kpis: {
      pedidosAbertos: 42,
      taxaEntrega: 86,
      itensEstoque: 1247,
      opsAtivas: 24
    },

    // Pedidos recentes — agora com 3 registros visíveis + 39 extras
    // para bater com o total de 42 (a paginação pagina os 42).
    pedidos: [
      { id: 'PED-2026-001', cliente: 'Metalúrgica Souza', item: 'Flange Aço ABNT 1020', setor: 'Corte', data: '15/05/2026', prazo: '20/05/2026', prioridade: 'media', status: 'concluido', evidencia: 'anexada' },
      { id: 'PED-2026-002', cliente: 'Indústrias Ribeiro', item: 'Eixo Vazado 420mm', setor: 'Usinagem', data: '15/05/2026', prazo: '22/05/2026', prioridade: 'alta', status: 'pendente', evidencia: 'aguardando' },
      { id: 'PED-2026-003', cliente: 'Peças & Cia Ltda', item: 'Suporte Estrutural', setor: 'Solda', data: '15/05/2026', prazo: '25/05/2026', prioridade: 'alta', status: 'andamento', evidencia: 'processando' },
      // ... demais pedidos gerados abaixo para atingir 42
      ...Array.from({ length: 39 }, (_, i) => {
        const n = i + 4;
        const setores = ['Corte', 'Usinagem', 'Caldeiraria', 'Solda', 'Pintura', 'Montagem'];
        const clientes = ['Metalúrgica Souza', 'Indústrias Ribeiro', 'Peças & Cia Ltda', 'Ferro & Aço Norte', 'Usiforte Metal', 'Sigma Componentes'];
        const statuses = ['concluido', 'pendente', 'andamento'];
        const prioridades = ['media', 'alta', 'baixa', 'critica'];
        const dia = String(10 + (n % 20)).padStart(2, '0');
        const mes = String(5 + (n % 3)).padStart(2, '0');
        return {
          id: `PED-2026-${String(n).padStart(3, '0')}`,
          cliente: clientes[n % clientes.length],
          item: `Componente ${n}A`,
          setor: setores[n % setores.length],
          data: `${dia}/${mes}/2026`,
          prazo: `${String(20 + (n % 10)).padStart(2, '0')}/${mes}/2026`,
          prioridade: prioridades[n % prioridades.length],
          status: statuses[n % statuses.length],
          evidencia: ['anexada', 'aguardando', 'processando'][n % 3]
        };
      })
    ],

    // OPs — total real 24, sendo 2 exibidas na tabela de últimas
    ops: {
      total: 24,
      ativas: 24,
      ultimas: [
        { id: 'OP-2026-001', item: 'Flange Aço ABNT 1020 ø50mm', qtd: 500, operador: 'Gustavo', status: 'Em Produção', dataLimite: '24/06/2026', cor: 'green' },
        { id: 'OP-2026-002', item: 'Eixo Vazado 420mm', qtd: 120, operador: 'Ana Ferre', status: 'Controle QA', dataLimite: '11/06/2026', cor: 'purple' }
      ],
      // IDs reais para os alertas
      idsExistentes: ['OP-2026-001', 'OP-2026-002']
    },

    // Produção por setor (% da meta)
    setores: [
      { nome: 'Corte', pct: 91, cor: 'var(--green)' },
      { nome: 'Usinagem', pct: 86, cor: 'var(--primary)' },
      { nome: 'Caldeiraria', pct: 78, cor: 'var(--amber)' },
      { nome: 'Solda', pct: 72, cor: 'var(--purple)' },
      { nome: 'Pintura', pct: 65, cor: 'var(--orange)' },
      { nome: 'Montagem', pct: 58, cor: 'var(--red)' }
    ],

    // Status das OPs (ativas = 24)
    statusOps: [
      { label: 'Planejamento', dot: 'planej', count: 8 },
      { label: 'Aguard. Mat.', dot: 'aguard', count: 5 },
      { label: 'Em Produção', dot: 'prod', count: 12 },
      { label: 'Controle QA', dot: 'cq', count: 3 },
      { label: 'Concluído', dot: 'concl', count: 24 },
      { label: 'Cancelado', dot: 'canc', count: 2 }
    ],

    // Alertas de atraso — IDs alinhados com OPs reais e pedidos
    atraso: [
      {
        id: 'PED-2026-001',
        title: 'PED-2026-001 – Atraso na produção',
        motivo: 'Falha na máquina LASER-01 (corte a laser), parada para manutenção corretiva.',
        setor: 'Producao',
        meta: [
          { icon: 'fa-calendar-times', text: 'Venceu há 5 dias' },
          { icon: 'fa-industry', text: 'Produção' }
        ],
        severity: 'critical',
        severityLabel: 'Crítico',
        actionLabel: 'Revisar',
        actionIcon: 'fa-search',
        actionType: 'revisar'
      },
      {
        id: 'PED-2026-002',
        title: 'PED-2026-002 – Aguardando matéria-prima',
        motivo: 'Fornecedor não entregou o lote de aço ABNT 1045 no prazo combinado.',
        setor: 'Producao',
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
        id: 'OP-2026-001',
        title: 'OP-2026-001 – Prazo crítico de entrega',
        motivo: 'Fila de usinagem sobrecarregada por acúmulo de ordens simultâneas.',
        setor: 'Producao',
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
        id: 'PED-2026-005',
        title: 'PED-2026-005 – Retrabalho solicitado',
        motivo: 'Não conformidade dimensional identificada no controle de qualidade.',
        setor: 'Qualidade',
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
        id: 'PED-2026-007',
        title: 'PED-2026-007 – Aguardando aprovação do cliente',
        motivo: 'Cliente ainda não validou o desenho técnico revisado.',
        setor: 'Comercial',
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
        id: 'OP-2026-002',
        title: 'OP-2026-002 – Em controle de qualidade (TORNO-02)',
        motivo: 'TORNO-02 parado para inspeção dimensional; liberação prevista em 4h.',
        setor: 'Qualidade',
        meta: [
          { icon: 'fa-clock', text: 'Vence amanhã' },
          { icon: 'fa-industry', text: 'Produção' }
        ],
        severity: 'medium',
        severityLabel: 'Médio',
        actionLabel: 'Revisar',
        actionIcon: 'fa-search',
        actionType: 'revisar'
      },
      {
        id: 'PED-2026-009',
        title: 'PED-2026-009 – Atraso na soldagem',
        motivo: 'Falta de soldador certificado (nível 2) no turno da tarde.',
        setor: 'Producao',
        meta: [
          { icon: 'fa-calendar-times', text: 'Venceu há 2 dias' },
          { icon: 'fa-industry', text: 'Produção' }
        ],
        severity: 'high',
        severityLabel: 'Alto',
        actionLabel: 'Revisar',
        actionIcon: 'fa-search',
        actionType: 'revisar'
      },
      {
        id: 'PED-2026-011',
        title: 'PED-2026-011 – Pintura atrasada',
        motivo: 'Cabine de pintura em manutenção corretiva não programada.',
        setor: 'Producao',
        meta: [
          { icon: 'fa-clock', text: 'Vence em 4 dias' },
          { icon: 'fa-industry', text: 'Produção' }
        ],
        severity: 'medium',
        severityLabel: 'Médio',
        actionLabel: 'Revisar',
        actionIcon: 'fa-search',
        actionType: 'revisar'
      },
      {
        id: 'PED-2026-013',
        title: 'PED-2026-013 – Montagem parada',
        motivo: 'Aguardando componente importado, com previsão de 2 semanas em trânsito.',
        setor: 'Producao',
        meta: [
          { icon: 'fa-calendar-times', text: 'Venceu há 8 dias' },
          { icon: 'fa-industry', text: 'Produção' }
        ],
        severity: 'critical',
        severityLabel: 'Crítico',
        actionLabel: 'Revisar',
        actionIcon: 'fa-search',
        actionType: 'revisar'
      },
      {
        id: 'PED-2026-015',
        title: 'PED-2026-015 – Inspeção final pendente',
        motivo: 'Equipe de qualidade reduzida por período de férias coletivas.',
        setor: 'Qualidade',
        meta: [
          { icon: 'fa-clock', text: 'Vence em 1 dia' },
          { icon: 'fa-building', text: 'Qualidade' }
        ],
        severity: 'medium',
        severityLabel: 'Médio',
        actionLabel: 'Revisar',
        actionIcon: 'fa-search',
        actionType: 'revisar'
      },
      {
        id: 'PED-2026-017',
        title: 'PED-2026-017 – Caldeiraria parada',
        motivo: 'Parada não programada da prensa hidráulica PRENSA-01.',
        setor: 'Producao',
        meta: [
          { icon: 'fa-calendar-times', text: 'Venceu há 1 dia' },
          { icon: 'fa-industry', text: 'Produção' }
        ],
        severity: 'high',
        severityLabel: 'Alto',
        actionLabel: 'Revisar',
        actionIcon: 'fa-search',
        actionType: 'revisar'
      },
      {
        id: 'PED-2026-019',
        title: 'PED-2026-019 – Alteração de escopo do cliente',
        motivo: 'Cliente solicitou mudança de especificação após início da produção.',
        setor: 'Comercial',
        meta: [
          { icon: 'fa-clock', text: 'Vence em 6 dias' },
          { icon: 'fa-handshake', text: 'Comercial' }
        ],
        severity: 'low',
        severityLabel: 'Baixo',
        actionLabel: 'Revisar',
        actionIcon: 'fa-search',
        actionType: 'revisar'
      }
    ],

    logistico: [
      {
        id: 'EST-ACO',
        title: 'Estoque de aço abaixo do limite',
        motivo: 'Consumo acima da média nas últimas 2 semanas, sem reposição programada.',
        setor: 'Almoxarifado',
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
        motivo: 'Transporte segue dentro do previsto, sem ocorrências.',
        setor: 'Logistica',
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
        motivo: 'Pedido de compra ainda não aprovado pelo setor financeiro.',
        setor: 'Almoxarifado',
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
        motivo: 'Fornecedor principal sem estoque disponível no momento.',
        setor: 'EPI',
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
        motivo: 'Veículo com pane mecânica na Rota 01, reboque acionado.',
        setor: 'Logistica',
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
        motivo: 'Falha de comunicação com o sistema de rastreio da transportadora.',
        setor: 'Logistica',
        meta: [
          { icon: 'fa-clock', text: 'Aguardando retorno' },
          { icon: 'fa-route', text: 'Logística' }
        ],
        severity: 'low',
        severityLabel: 'Baixo',
        actionLabel: 'Acompanhar',
        actionIcon: 'fa-truck',
        actionType: 'acompanhar'
      },
      {
        id: 'EST-PARAF',
        title: 'Estoque baixo de parafusos M10',
        motivo: 'Alta demanda simultânea de múltiplas ordens de produção.',
        setor: 'Almoxarifado',
        meta: [
          { icon: 'fa-calendar', text: 'Vence em 5 dias' },
          { icon: 'fa-warehouse', text: 'Almoxarifado' }
        ],
        severity: 'medium',
        severityLabel: 'Médio',
        actionLabel: 'Ver Estoque',
        actionIcon: 'fa-warehouse',
        actionType: 'estoque'
      },
      {
        id: 'ENT-1060',
        title: 'Entrega #1060 devolvida',
        motivo: 'Cliente recusou o recebimento por divergência na nota fiscal.',
        setor: 'Logistica',
        meta: [
          { icon: 'fa-calendar-times', text: 'Ocorreu ontem' },
          { icon: 'fa-route', text: 'Rota 02' }
        ],
        severity: 'high',
        severityLabel: 'Alto',
        actionLabel: 'Acompanhar',
        actionIcon: 'fa-truck',
        actionType: 'acompanhar'
      },
      {
        id: 'ROTA-05',
        title: 'Rota 05 com atraso generalizado',
        motivo: 'Bloqueio de via por obras públicas na região central.',
        setor: 'Logistica',
        meta: [
          { icon: 'fa-clock', text: 'Atraso médio de 3h' },
          { icon: 'fa-route', text: 'Rota 05' }
        ],
        severity: 'medium',
        severityLabel: 'Médio',
        actionLabel: 'Acompanhar',
        actionIcon: 'fa-truck',
        actionType: 'acompanhar'
      },
      {
        id: 'EST-EPI',
        title: 'Estoque crítico: Capacete de segurança',
        motivo: 'Compra emergencial ainda em fase de cotação com fornecedores.',
        setor: 'EPI',
        meta: [
          { icon: 'fa-exclamation-circle', text: 'Reposição urgente' },
          { icon: 'fa-hard-hat', text: 'EPI' }
        ],
        severity: 'critical',
        severityLabel: 'Crítico',
        actionLabel: 'Ver Estoque',
        actionIcon: 'fa-warehouse',
        actionType: 'estoque'
      },
      {
        id: 'ENT-1065',
        title: 'Entrega #1065 aguardando liberação fiscal',
        motivo: 'Nota fiscal eletrônica pendente de emissão pelo setor fiscal.',
        setor: 'Logistica',
        meta: [
          { icon: 'fa-clock', text: 'Aguardando há 6h' },
          { icon: 'fa-route', text: 'Logística' }
        ],
        severity: 'low',
        severityLabel: 'Baixo',
        actionLabel: 'Acompanhar',
        actionIcon: 'fa-truck',
        actionType: 'acompanhar'
      }
    ]
  };

  // Ordenação por severidade (crítico > alto > médio > baixo)
  const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

  function sortBySeverity(items) {
    return [...items].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
  }

  /* ==================================================================
     2. ESTADO GLOBAL
     ================================================================== */
  const state = {
    activeTab: 'atraso',
    expanded: false,
    alertSetor: '',
    pedidoSearch: '',
    pedidoStatus: '',
    pedidoSort: { key: 'id', dir: 'asc' },
    pedidoPage: 1,
    pedidoPageSize: 8
  };

  /* ==================================================================
     3. TOASTS
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
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  /* ==================================================================
     4. MODAL GENÉRICO
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
    (opts.buttons || []).forEach((btn) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'mbtn ' + (btn.primary ? 'mbtn-primary' : 'mbtn-secondary');
      el.textContent = btn.label;
      el.addEventListener('click', () => { if (btn.onClick) btn.onClick(); });
      modalFooter.appendChild(el);
    });
    modalOverlay.classList.add('open');
  }

  function closeModal() { modalOverlay.classList.remove('open'); }

  modalCloseBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  function detailRow(k, v) {
    return '<div class="detail-row"><span class="k">' + k + '</span><span class="v">' + v + '</span></div>';
  }

  /* ==================================================================
     5. RENDER — KPIs
     ================================================================== */
  function renderKpis() {
    document.getElementById('kpiPedidosAbertos').textContent = DASHBOARD_DATA.kpis.pedidosAbertos;
    document.getElementById('kpiTaxaEntrega').textContent = DASHBOARD_DATA.kpis.taxaEntrega + '%';
    document.getElementById('kpiItensEstoque').textContent = DASHBOARD_DATA.kpis.itensEstoque.toLocaleString('pt-BR');
    document.getElementById('kpiOpsAtivas').textContent = DASHBOARD_DATA.kpis.opsAtivas;
  }

  /* ==================================================================
     6. RENDER — ALERTAS (abas + lista + filtro por setor)
     ================================================================== */
  function severityBadge(item) {
    return '<span class="severity-tag ' + item.severity + '">' + item.severityLabel + '</span>';
  }

  function renderAlertList(containerId, items, setorFilter) {
    const container = document.getElementById(containerId);
    let filtered = items;
    if (setorFilter) {
      filtered = items.filter((i) => i.setor === setorFilter);
    }
    filtered = sortBySeverity(filtered);

    if (!filtered.length) {
      container.innerHTML = '<div class="table-empty">Nenhum alerta para este setor.</div>';
      return;
    }

    container.innerHTML = filtered.map((item) => {
      const metaHtml = item.meta.map((m) =>
        '<span><i class="fas ' + m.icon + '"></i>' + m.text + '</span>'
      ).join('');
      const reasonHtml = item.motivo
        ? '<div class="alert-reason"><i class="fas fa-circle-info"></i><span><strong>Motivo:</strong> ' + item.motivo + '</span></div>'
        : '';
      return (
        '<div class="alert-item" data-alert-id="' + item.id + '">' +
          '<div>' +
            '<div class="alert-title">' + item.title + '</div>' +
            reasonHtml +
            '<div class="alert-meta">' + metaHtml + '</div>' +
          '</div>' +
          '<div class="alert-actions">' +
            severityBadge(item) +
            '<button class="alert-action-btn" type="button" data-action-type="' + item.actionType + '" data-alert-id="' + item.id + '">' +
              '<i class="fas ' + item.actionIcon + '"></i> ' + item.actionLabel +
            '</button>' +
          '</div>' +
        '</div>'
      );
    }).join('');
  }

  function findAlertById(id) {
    return (
      DASHBOARD_DATA.atraso.find((a) => a.id === id) ||
      DASHBOARD_DATA.logistico.find((a) => a.id === id)
    );
  }

  function updateAlertCounts() {
    const total = DASHBOARD_DATA.atraso.length + DASHBOARD_DATA.logistico.length;
    document.getElementById('countAtraso').textContent = DASHBOARD_DATA.atraso.length;
    document.getElementById('countLogistico').textContent = DASHBOARD_DATA.logistico.length;
    document.getElementById('alertsTotalBadge').textContent = total + ' alertas';
  }

  function applyExpandState() {
    const activeList = document.querySelector('.alert-panel.active .alert-list');
    const verMaisBtn = document.getElementById('verMaisBtn');
    const label = document.getElementById('verMaisLabel');
    if (!activeList) return;
    activeList.classList.toggle('expanded', state.expanded);
    verMaisBtn.classList.toggle('expanded', state.expanded);
    if (!state.expanded) activeList.scrollTop = 0;
    label.textContent = state.expanded ? 'Ver menos' : 'Ver mais';
  }

  function renderAlerts() {
    renderAlertList('listAtraso', DASHBOARD_DATA.atraso, state.alertSetor);
    renderAlertList('listLogistico', DASHBOARD_DATA.logistico, state.alertSetor);
    updateAlertCounts();
    applyExpandState();
  }

  function initAlerts() {
    // Abas
    const tabs = document.querySelectorAll('.alert-tab');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-tab');
        if (target === state.activeTab) return;
        state.activeTab = target;
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.alert-panel').forEach((panel) => {
          panel.classList.toggle('active', panel.getAttribute('data-panel') === target);
        });
        state.expanded = false;
        applyExpandState();
      });
    });

    // Filtro por setor
    const setorFilter = document.getElementById('alertSetorFilter');
    setorFilter.addEventListener('change', () => {
      state.alertSetor = setorFilter.value;
      renderAlerts();
    });

    // Ver mais / Ver menos
    document.getElementById('verMaisBtn').addEventListener('click', () => {
      state.expanded = !state.expanded;
      applyExpandState();
    });

    // Ações dos alertas
    document.querySelectorAll('.alert-panel').forEach((panel) => {
      panel.addEventListener('click', (e) => {
        const btn = e.target.closest('.alert-action-btn');
        if (!btn) return;
        handleAlertAction(btn.getAttribute('data-action-type'), btn.getAttribute('data-alert-id'));
      });
    });

    renderAlerts();
  }

  function handleAlertAction(actionType, alertId) {
    const item = findAlertById(alertId);
    if (!item) return;

    if (actionType === 'estoque') {
      showToast('Redirecionando para o Estoque...', 'info');
      setTimeout(() => { window.location.href = 'itens.html'; }, 500);
      return;
    }

    if (actionType === 'revisar') {
      openModal({
        title: item.title,
        icon: 'fa-search',
        bodyHtml:
          detailRow('Identificador', item.id) +
          detailRow('Setor', item.setor) +
          detailRow('Status', item.severityLabel) +
          (item.motivo ? detailRow('Motivo', item.motivo) : '') +
          item.meta.map((m) => detailRow('Info', m.text)).join(''),
        buttons: [
          { label: 'Fechar', onClick: closeModal },
          {
            label: 'Marcar como revisado',
            primary: true,
            onClick: () => {
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
          detailRow('Setor', item.setor) +
          detailRow('Situação', item.severityLabel) +
          (item.motivo ? detailRow('Motivo', item.motivo) : '') +
          item.meta.map((m) => detailRow('Info', m.text)).join('') +
          '<div style="margin-top:14px;font-size:12.5px;color:var(--text-secondary)">' +
          'Acompanhamento em tempo real integra com o rastreio da transportadora.</div>',
        buttons: [{ label: 'Fechar', onClick: closeModal, primary: true }]
      });
    }
  }

  /* ==================================================================
     7. RENDER — PRODUÇÃO POR SETOR
     ================================================================== */
  function renderSetores() {
    const container = document.getElementById('chartSetores');
    container.innerHTML = DASHBOARD_DATA.setores.map((s) => (
      '<div class="chart-bar">' +
        '<span class="chart-label">' + s.nome + '</span>' +
        '<div class="chart-track">' +
          '<div class="chart-fill" style="width: ' + s.pct + '%; background: ' + s.cor + ';"></div>' +
        '</div>' +
        '<span class="chart-value">' + s.pct + '%</span>' +
      '</div>'
    )).join('');

    // Animação
    setTimeout(() => {
      container.querySelectorAll('.chart-fill').forEach((bar) => {
        const w = bar.style.width;
        bar.style.width = '0%';
        setTimeout(() => { bar.style.width = w; }, 80);
      });
    }, 60);
  }

  /* ==================================================================
     8. RENDER — STATUS DAS OPs + LOGBOT
     ================================================================== */
  function renderOpsStatus() {
    const list = document.getElementById('opStatusList');
    list.innerHTML = DASHBOARD_DATA.statusOps.map((s) => (
      '<span class="op-status-item">' +
        '<span class="dot ' + s.dot + '"></span>' + s.label +
        ' <span class="count-badge">' + s.count + '</span>' +
      '</span>'
    )).join('');

    document.getElementById('opsAtivasBadge').textContent = DASHBOARD_DATA.ops.ativas + ' ativas';
  }

  function renderLogbot() {
    const feed = document.getElementById('logbotFeed');
    const itens = [
      { icon: 'fa-exclamation-circle', prefix: '<span class="critical">Estoque crítico:</span>', text: ' Chapa Inox 304' },
      { icon: 'fa-exclamation-circle', prefix: '<span class="critical">Estoque crítico:</span>', text: ' Luva Nitrílica' },
      { icon: 'fa-clock', prefix: '', text: 'Prazo crítico: OP-2026-001' },
      { icon: 'fa-plus-circle', prefix: '', text: 'OP-2026-002 criada por Ana Ferre' },
      { icon: 'fa-plus-circle', prefix: '', text: 'OP-2026-001 criada por Gustavo' }
    ];
    feed.innerHTML = itens.map((i) => (
      '<div class="event-item">' +
        '<i class="fas ' + i.icon + '"></i>' +
        '<span>' + i.prefix + i.text + '</span>' +
      '</div>'
    )).join('');
  }

  /* ==================================================================
     9. RENDER — ÚLTIMAS OPs
     ================================================================== */
  function renderUltimasOps() {
    const tbody = document.getElementById('opsTbody');
    const badge = document.getElementById('opsBadge');
    const cores = {
      green: { bg: 'var(--green-bg)', color: 'var(--green)' },
      purple: { bg: 'var(--purple-bg)', color: 'var(--purple)' }
    };
    tbody.innerHTML = DASHBOARD_DATA.ops.ultimas.map((op) => {
      const cor = cores[op.cor] || cores.green;
      return (
        '<tr>' +
          '<td><strong>' + op.id + '</strong></td>' +
          '<td>' + op.item + '</td>' +
          '<td>' + op.qtd + '</td>' +
          '<td>' + op.operador + '</td>' +
          '<td><span class="status-tag" style="background:' + cor.bg + ';color:' + cor.color + '">' + op.status + '</span></td>' +
          '<td>' + op.dataLimite + '</td>' +
        '</tr>'
      );
    }).join('');
    badge.textContent = DASHBOARD_DATA.ops.ultimas.length + ' emitidas (de ' + DASHBOARD_DATA.ops.total + ')';
  }

  /* ==================================================================
     10. RENDER — TABELA DE PEDIDOS (busca, ordenação, paginação)
     ================================================================== */
  const STATUS_LABEL = {
    concluido: 'Concluído',
    pendente: 'Pendente',
    andamento: 'Em andamento'
  };
  const STATUS_CLASS = {
    concluido: 'success',
    pendente: 'pending',
    andamento: 'progress'
  };
  const PRIORIDADE_LABEL = {
    critica: 'Crítica',
    alta: 'Alta',
    media: 'Média',
    baixa: 'Baixa'
  };
  const PRIORIDADE_ORDER = { critica: 0, alta: 1, media: 2, baixa: 3 };
  const EVIDENCIA_ICON = {
    anexada: { icon: 'fa-check-circle', color: 'var(--green)', title: 'Evidência anexada' },
    aguardando: { icon: 'fa-clock', color: 'var(--amber)', title: 'Aguardando evidência' },
    processando: { icon: 'fa-spinner', color: 'var(--primary)', title: 'Em processamento' }
  };

  function parseDateBR(str) {
    if (!str) return new Date(0);
    const [d, m, y] = str.split('/').map(Number);
    return new Date(y, m - 1, d);
  }

  function getFilteredPedidos() {
    let items = DASHBOARD_DATA.pedidos.slice();
    if (state.pedidoSearch) {
      const q = state.pedidoSearch.toLowerCase();
      items = items.filter(
        (p) => p.id.toLowerCase().includes(q) || p.cliente.toLowerCase().includes(q)
      );
    }
    if (state.pedidoStatus) {
      items = items.filter((p) => p.status === state.pedidoStatus);
    }
    // Ordenação
    const { key, dir } = state.pedidoSort;
    const mult = dir === 'asc' ? 1 : -1;
    items.sort((a, b) => {
      let va, vb;
      if (key === 'data') { va = parseDateBR(a.data).getTime(); vb = parseDateBR(b.data).getTime(); }
      else if (key === 'prazo') { va = PRIORIDADE_ORDER[a.prioridade]; vb = PRIORIDADE_ORDER[b.prioridade]; }
      else if (key === 'id' || key === 'cliente') { va = a[key]; vb = b[key]; }
      else { va = a[key]; vb = b[key]; }
      if (va < vb) return -1 * mult;
      if (va > vb) return 1 * mult;
      return 0;
    });
    return items;
  }

  function renderPedidosTable() {
    const items = getFilteredPedidos();
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / state.pedidoPageSize));
    if (state.pedidoPage > totalPages) state.pedidoPage = totalPages;
    const start = (state.pedidoPage - 1) * state.pedidoPageSize;
    const pageItems = items.slice(start, start + state.pedidoPageSize);

    const tbody = document.getElementById('pedidosTbody');
    if (!pageItems.length) {
      tbody.innerHTML = '<tr><td colspan="9" class="table-empty">Nenhum pedido encontrado.</td></tr>';
    } else {
      tbody.innerHTML = pageItems.map((p) => {
        const ev = EVIDENCIA_ICON[p.evidencia];
        return (
          '<tr>' +
            '<td><strong>' + p.id + '</strong></td>' +
            '<td>' + p.cliente + '</td>' +
            '<td>' + p.item + '</td>' +
            '<td>' + p.setor + '</td>' +
            '<td>' + p.data + '</td>' +
            '<td>' +
              '<div style="display:flex;flex-direction:column;gap:3px">' +
                '<span style="font-size:12.5px">' + p.prazo + '</span>' +
                '<span class="priority-tag p-' + p.prioridade + '">' + PRIORIDADE_LABEL[p.prioridade] + '</span>' +
              '</div>' +
            '</td>' +
            '<td><span class="status-badge ' + STATUS_CLASS[p.status] + '">' + STATUS_LABEL[p.status] + '</span></td>' +
            '<td><i class="fas ' + ev.icon + '" style="color:' + ev.color + '" title="' + ev.title + '"></i></td>' +
            '<td>' +
              '<div class="action-group">' +
                '<button class="action-btn" type="button" title="Visualizar" data-action="view" data-id="' + p.id + '"><i class="fas fa-eye"></i></button>' +
                '<button class="action-btn" type="button" title="Editar" data-action="edit" data-id="' + p.id + '"><i class="fas fa-pen"></i></button>' +
                '<button class="action-btn" type="button" title="Imprimir" data-action="print" data-id="' + p.id + '"><i class="fas fa-print"></i></button>' +
              '</div>' +
            '</td>' +
          '</tr>'
        );
      }).join('');
    }

    // Badge
    document.getElementById('pedidosBadge').textContent = total + ' registros';

    // Paginação
    const pag = document.getElementById('pedidosPagination');
    let html = '';
    html += '<button type="button" ' + (state.pedidoPage === 1 ? 'disabled' : '') + ' data-page="prev"><i class="fas fa-chevron-left"></i></button>';
    for (let i = 1; i <= totalPages; i++) {
      if (totalPages > 7 && i > 2 && i < totalPages - 1 && Math.abs(i - state.pedidoPage) > 1) {
        if (i === 3 || i === totalPages - 2) html += '<span style="padding:0 4px;color:var(--text-muted)">…</span>';
        continue;
      }
      html += '<button type="button" class="' + (i === state.pedidoPage ? 'active' : '') + '" data-page="' + i + '">' + i + '</button>';
    }
    html += '<button type="button" ' + (state.pedidoPage === totalPages ? 'disabled' : '') + ' data-page="next"><i class="fas fa-chevron-right"></i></button>';
    pag.innerHTML = html;

    pag.querySelectorAll('button[data-page]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const p = btn.getAttribute('data-page');
        if (p === 'prev') state.pedidoPage = Math.max(1, state.pedidoPage - 1);
        else if (p === 'next') state.pedidoPage = Math.min(totalPages, state.pedidoPage + 1);
        else state.pedidoPage = parseInt(p, 10);
        renderPedidosTable();
      });
    });
  }

  function initPedidosTable() {
    // Busca
    const searchInput = document.getElementById('pedidoSearch');
    const searchClear = document.getElementById('searchClear');
    searchInput.addEventListener('input', () => {
      state.pedidoSearch = searchInput.value.trim();
      state.pedidoPage = 1;
      searchClear.classList.toggle('visible', state.pedidoSearch.length > 0);
      renderPedidosTable();
    });
    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      state.pedidoSearch = '';
      state.pedidoPage = 1;
      searchClear.classList.remove('visible');
      searchInput.focus();
      renderPedidosTable();
    });

    // Status
    const statusFilter = document.getElementById('pedidoStatusFilter');
    statusFilter.addEventListener('change', () => {
      state.pedidoStatus = statusFilter.value;
      state.pedidoPage = 1;
      renderPedidosTable();
    });

    // Ordenação
    document.querySelectorAll('th.sortable').forEach((th) => {
      th.addEventListener('click', () => {
        const key = th.getAttribute('data-sort');
        if (state.pedidoSort.key === key) {
          state.pedidoSort.dir = state.pedidoSort.dir === 'asc' ? 'desc' : 'asc';
        } else {
          state.pedidoSort.key = key;
          state.pedidoSort.dir = 'asc';
        }
        // Atualiza ícones
        document.querySelectorAll('th.sortable').forEach((t) => {
          t.classList.remove('sorted');
          t.querySelector('.sort-icon').className = 'fas fa-sort sort-icon';
        });
        th.classList.add('sorted');
        th.querySelector('.sort-icon').className =
          'fas fa-sort-' + (state.pedidoSort.dir === 'asc' ? 'up' : 'down') + ' sort-icon';
        renderPedidosTable();
      });
    });

    // Ações da tabela (delegação)
    document.getElementById('pedidosTbody').addEventListener('click', (e) => {
      const btn = e.target.closest('.action-btn[data-action]');
      if (!btn) return;
      const id = btn.getAttribute('data-id');
      const pedido = DASHBOARD_DATA.pedidos.find((p) => p.id === id);
      if (!pedido) return;
      const action = btn.getAttribute('data-action');
      if (action === 'view') viewOrder(pedido);
      if (action === 'edit') editOrder(pedido);
      if (action === 'print') printOrder(pedido);
    });

    renderPedidosTable();
  }

  function viewOrder(p) {
    openModal({
      title: p.id,
      icon: 'fa-eye',
      bodyHtml:
        detailRow('Cliente', p.cliente) +
        detailRow('Item / Produto', p.item) +
        detailRow('Setor', p.setor) +
        detailRow('Data', p.data) +
        detailRow('Prazo', p.prazo) +
        detailRow('Prioridade', PRIORIDADE_LABEL[p.prioridade]) +
        detailRow('Status', STATUS_LABEL[p.status]),
      buttons: [{ label: 'Fechar', onClick: closeModal, primary: true }]
    });
  }

  function editOrder(p) {
    const statusOpts = Object.keys(STATUS_LABEL)
      .map((v) => '<option value="' + v + '"' + (v === p.status ? ' selected' : '') + '>' + STATUS_LABEL[v] + '</option>')
      .join('');
    const prioOpts = Object.keys(PRIORIDADE_LABEL)
      .map((v) => '<option value="' + v + '"' + (v === p.prioridade ? ' selected' : '') + '>' + PRIORIDADE_LABEL[v] + '</option>')
      .join('');

    openModal({
      title: 'Editar ' + p.id,
      icon: 'fa-pen',
      bodyHtml:
        '<div class="form-group"><label>Cliente</label><input type="text" id="editCliente" value="' + p.cliente + '"></div>' +
        '<div class="form-group"><label>Item / Produto</label><input type="text" id="editItem" value="' + p.item + '"></div>' +
        '<div class="form-group"><label>Setor</label><input type="text" id="editSetor" value="' + p.setor + '"></div>' +
        '<div class="form-group"><label>Status</label><select id="editStatus">' + statusOpts + '</select></div>' +
        '<div class="form-group"><label>Prioridade</label><select id="editPrioridade">' + prioOpts + '</select></div>',
      buttons: [
        { label: 'Cancelar', onClick: closeModal },
        {
          label: 'Salvar alterações',
          primary: true,
          onClick: () => {
            p.cliente = document.getElementById('editCliente').value.trim();
            p.item = document.getElementById('editItem').value.trim();
            p.setor = document.getElementById('editSetor').value.trim();
            p.status = document.getElementById('editStatus').value;
            p.prioridade = document.getElementById('editPrioridade').value;
            closeModal();
            renderPedidosTable();
            showToast('Pedido ' + p.id + ' atualizado com sucesso.');
          }
        }
      ]
    });
  }

  function printOrder(p) {
    const win = window.open('', '_blank', 'width=640,height=760');
    if (!win) {
      showToast('Permita pop-ups para imprimir o pedido.', 'info');
      return;
    }
    win.document.write(
      '<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"><title>' + p.id + '</title><style>' +
      'body{font-family:Arial,sans-serif;padding:32px;color:#0a1f33}' +
      'h1{font-size:20px;margin-bottom:4px}' +
      'p.sub{color:#3d5f7e;margin-bottom:24px;font-size:13px}' +
      'table{width:100%;border-collapse:collapse}' +
      'td{padding:10px 0;border-bottom:1px solid #e2ecf6;font-size:14px}' +
      'td.k{color:#3d5f7e;width:160px}' +
      'td.v{font-weight:700}' +
      '</style></head><body>' +
      '<h1>Comprovante de Pedido — ' + p.id + '</h1>' +
      '<p class="sub">StockLog · gerado em ' + new Date().toLocaleString('pt-BR') + '</p>' +
      '<table>' +
      '<tr><td class="k">Cliente</td><td class="v">' + p.cliente + '</td></tr>' +
      '<tr><td class="k">Item / Produto</td><td class="v">' + p.item + '</td></tr>' +
      '<tr><td class="k">Setor</td><td class="v">' + p.setor + '</td></tr>' +
      '<tr><td class="k">Data</td><td class="v">' + p.data + '</td></tr>' +
      '<tr><td class="k">Prazo</td><td class="v">' + p.prazo + '</td></tr>' +
      '<tr><td class="k">Prioridade</td><td class="v">' + PRIORIDADE_LABEL[p.prioridade] + '</td></tr>' +
      '<tr><td class="k">Status</td><td class="v">' + STATUS_LABEL[p.status] + '</td></tr>' +
      '</table></body></html>'
    );
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  }

  /* ==================================================================
     11. CHAT TOGGLE
     ================================================================== */
  function initChatToggle() {
    const chatToggle = document.getElementById('chatToggle') || document.querySelector('.chat-toggle');
    if (chatToggle) {
      chatToggle.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('toggleChat'));
      });
    }
  }

  /* ==================================================================
     12. INIT
     ================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    renderKpis();
    initAlerts();
    renderSetores();
    renderOpsStatus();
    renderLogbot();
    renderUltimasOps();
    initPedidosTable();
    initChatToggle();
    console.log('🚀 StockLog Dashboard carregado com sucesso!');
  });
})();