/* ================================================================
   StockLog · JS/itens.js
   Página de Itens em Estoque — integrada ao Firebase
   Coleção: /itens
   Chave do item = código digitado pelo usuário (sanitizado)
   + Exclusão de itens com modal de confirmação (injetado via JS)
   + Recebe ação externa vinda da Ajuda de Produção (?stocklog=...)
   ================================================================ */

(function () {
  'use strict';

  // =====================================================================
  // 0. Bootstrap — aguarda window.SL (configurado inline no HTML)
  // =====================================================================
  function quandoPronto(cb) {
    const tentar = (n = 0) => {
      if (window.SL && window.SL.db) return cb(window.SL);
      if (n > 50) return console.error('[StockLog] window.SL não apareceu.');
      setTimeout(() => tentar(n + 1), 100);
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => tentar());
    } else {
      tentar();
    }
  }

  // =====================================================================
  // 1. Estado local (espelho do Firebase)
  // =====================================================================
  let items = [];
  let currentStatus = 'todos';
  let itemParaExcluir = null;

  // =====================================================================
  // 2. Helpers
  // =====================================================================
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const CATEGORIES = [
    'Matéria-Prima',
    'Componentes',
    'Embalagens',
    'Consumíveis',
    'Ferramental'
  ];

  const CAT_COLORS = {
    'Matéria-Prima': 'var(--blue-bar)',
    'Componentes':   'var(--purple-bar)',
    'Embalagens':    'var(--teal-bar)',
    'Consumíveis':   'var(--amber-bar)',
    'Ferramental':   'var(--green-bar)'
  };

  function sanitizeKey(codigo) {
    return String(codigo || '')
      .trim()
      .toUpperCase()
      .replace(/[.#$\[\]\/]/g, '_')
      .replace(/\s+/g, '_');
  }

  function calcularStatus(atual, minimo) {
    if (atual <= Math.round(minimo * 0.3)) return 'critico';
    if (atual <= minimo) return 'baixo';
    return 'ok';
  }

  let toastTimer;
  function showToast(msg, danger = false) {
    const toast = $('#toastPopup');
    const span  = $('#toastMsg');
    if (!toast) return;
    if (span) span.textContent = msg;
    const icon = toast.querySelector('i');
    if (icon) {
      icon.className = danger ? 'fas fa-circle-xmark' : 'fas fa-circle-check';
      icon.style.fontSize = '18px';
    }
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
  }

  function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // =====================================================================
  // 2.1 Injeção de CSS + modal de exclusão
  // =====================================================================
  function injetarUIExclusao() {
    if (!$('#deleteStyles')) {
      const style = document.createElement('style');
      style.id = 'deleteStyles';
      style.textContent = `
        .action-cell { display: flex; align-items: flex-start; gap: 8px; }
        .btn-delete {
          width: 36px; height: 36px; border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--bg-soft); color: var(--red);
          cursor: pointer; font-size: 13px; transition: 0.15s;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .btn-delete:hover { background: var(--red); border-color: var(--red); color: #fff; }

        .modal.modal-confirm { max-width: 440px; text-align: center; }
        .confirm-icon {
          width: 56px; height: 56px; border-radius: 50%;
          background: var(--red-bg); color: var(--red);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; margin: 0 auto 14px;
        }
        .modal-confirm h2 { font-size: 1.15rem; margin-bottom: 8px; }
        .modal-confirm p { color: var(--text-secondary); font-size: 0.92rem; line-height: 1.5; }
        .modal-confirm p strong { color: var(--text-main); }
        .modal-confirm .form-actions { justify-content: center; }
        .btn-danger { background: var(--red); color: #fff; }
        .btn-danger:hover { filter: brightness(1.1); }
        .btn-danger:disabled { opacity: 0.6; cursor: not-allowed; }
      `;
      document.head.appendChild(style);
    }

    if (!$('#deleteItemModal')) {
      const overlay = document.createElement('div');
      overlay.id = 'deleteItemModal';
      overlay.className = 'modal-overlay';
      overlay.innerHTML = `
        <div class="modal modal-confirm" role="dialog" aria-modal="true" aria-labelledby="deleteTitle">
          <div class="confirm-icon"><i class="fas fa-trash-can"></i></div>
          <h2 id="deleteTitle">Excluir item?</h2>
          <p>Você está prestes a excluir <strong id="deleteItemName">—</strong>.
             Essa ação é permanente e não pode ser desfeita.</p>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" id="btnCancelDelete">Cancelar</button>
            <button type="button" class="btn btn-danger" id="btnConfirmDelete">
              <i class="fas fa-trash-can"></i> Excluir
            </button>
          </div>
        </div>`;
      document.body.appendChild(overlay);
    }
  }

  // =====================================================================
  // 3. Listeners Firebase em tempo real
  // =====================================================================
  function bindFirebase() {
    const { db } = window.SL;

    db.ref('itens').on('value', (snap) => {
      const val = snap.val() || {};
      items = Object.entries(val).map(([key, it]) => {
        const atual  = Number(it.atual) || 0;
        const minimo = Number(it.minimo) || 0;
        return {
          firebaseKey: key,
          codigo:    it.codigo    || key || '',
          nome:      it.nome      || '',
          sub:       it.sub       || '—',
          categoria: it.categoria || 'Matéria-Prima',
          local:     it.local     || '—',
          atual,
          minimo,
          maximo:   Number(it.maximo)   || 0,
          entradas: Number(it.entradas) || 0,
          saidas:   Number(it.saidas)   || 0,
          status:   calcularStatus(atual, minimo),
          dataCriacao: it.dataCriacao || 0
        };
      });
      renderAll();
      atualizarSyncLabel();
      console.log(`[StockLog] ${items.length} itens carregados do Firebase.`);
    });
  }

  // =====================================================================
  // 4. Render — Capacidade por categoria
  // =====================================================================
  function renderCatProgress() {
    const el = $('#catProgressList');
    if (!el) return;

    if (!items.length) {
      el.innerHTML = `<p style="color:var(--text-muted);font-size:13px;padding:8px 0">
        Nenhum item cadastrado ainda.
      </p>`;
      return;
    }

    el.innerHTML = CATEGORIES.map((cat) => {
      const catItems = items.filter((i) => i.categoria === cat);
      const totalAtual = catItems.reduce((a, i) => a + i.atual, 0);
      const totalMax   = catItems.reduce((a, i) => a + i.maximo, 0);
      const perc = totalMax > 0 ? Math.min(100, Math.round((totalAtual / totalMax) * 100)) : 0;

      return `
        <div class="cat-progress-item">
          <div class="cat-progress-info">
            <span>${cat} (${catItems.length} itens)</span>
            <strong>${perc}% (${totalAtual.toLocaleString('pt-BR')} / ${totalMax.toLocaleString('pt-BR')})</strong>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill"
                 style="width:${perc}%;background:${CAT_COLORS[cat] || 'var(--primary)'};"></div>
          </div>
        </div>`;
    }).join('');
  }

  // =====================================================================
  // 5. Render — Alertas de reposição
  // =====================================================================
  function renderAlerts() {
    const alertListEl = $('#alertList');
    const alertCountBadge = $('#alertCountBadge');
    if (!alertListEl) return;

    const alerts = items.filter((i) => i.status === 'critico' || i.status === 'baixo');

    if (alertCountBadge) {
      alertCountBadge.textContent = alerts.length
        ? `${alerts.length} pendente${alerts.length !== 1 ? 's' : ''}`
        : 'Nenhum';
    }

    if (!alerts.length) {
      alertListEl.innerHTML = `<p style="color:var(--text-muted);font-size:13px;padding:8px 0">
        Nenhum alerta de reposição no momento.
      </p>`;
      return;
    }

    alertListEl.innerHTML = alerts.slice(0, 4).map((item) => {
      const isCrit = item.status === 'critico';
      return `
        <div class="alert-item">
          <div class="alert-item-left">
            <div class="alert-icon ${isCrit ? 'critico' : 'baixo'}">
              <i class="fas ${isCrit ? 'fa-triangle-exclamation' : 'fa-circle-exclamation'}"></i>
            </div>
            <div class="alert-info">
              <span class="alert-title">${escapeHtml(item.nome)} (${escapeHtml(item.codigo)})</span>
              <span class="alert-sub">Mínimo: ${item.minimo} | Local: ${escapeHtml(item.local)}</span>
            </div>
          </div>
          <span class="alert-badge ${isCrit ? 'critico' : 'baixo'}">${item.atual} un</span>
        </div>`;
    }).join('');
  }

  // =====================================================================
  // 6. Render — Tabela
  // =====================================================================
  function renderTable() {
    const searchInput = $('#searchInput');
    const categoryFilter = $('#categoryFilter');
    const search = searchInput ? searchInput.value.toLowerCase() : '';
    const category = categoryFilter ? categoryFilter.value : 'todas';
    const resultsCount = $('#resultsCount');
    const tbody = $('#tableBody');
    if (!tbody) return;

    if (!items.length) {
      tbody.innerHTML = `
        <tr><td colspan="9">
          <div class="empty-state">
            <i class="fas fa-box-open"></i>
            Nenhum item cadastrado.
          </div>
        </td></tr>`;
      if (resultsCount) resultsCount.textContent = 'Nenhum item cadastrado.';
      return;
    }

    const filtered = items.filter((item) => {
      const blob = `${item.codigo} ${item.nome} ${item.sub}`.toLowerCase();
      const matchesSearch   = !search || blob.includes(search);
      const matchesCategory = category === 'todas' || item.categoria === category;
      const matchesStatus   = currentStatus === 'todos' || item.status === currentStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });

    if (!filtered.length) {
      tbody.innerHTML = `
        <tr><td colspan="9">
          <div class="empty-state">
            <i class="fas fa-magnifying-glass"></i>
            Nenhum item encontrado com os filtros selecionados.
          </div>
        </td></tr>`;
      if (resultsCount) resultsCount.textContent = `Mostrando 0 de ${items.length} itens`;
      return;
    }

    tbody.innerHTML = filtered.map((item) => {
      const perc = item.maximo > 0
        ? Math.min(100, Math.round((item.atual / item.maximo) * 100))
        : 0;

      let barColor = 'var(--green-bar)';
      if (item.status === 'baixo')   barColor = 'var(--amber-bar)';
      if (item.status === 'critico') barColor = 'var(--red-bar)';

      let catStyle = 'background:var(--blue-bg); color:var(--blue);';
      if (item.categoria === 'Componentes') catStyle = 'background:var(--purple-bg); color:var(--purple);';
      if (item.categoria === 'Embalagens')  catStyle = 'background:var(--teal-bg); color:var(--teal);';
      if (item.categoria === 'Consumíveis') catStyle = 'background:var(--amber-bg); color:var(--amber);';
      if (item.categoria === 'Ferramental') catStyle = 'background:var(--green-bg); color:var(--green);';

      let statusPill = `<span class="status-pill ok"><i class="fas fa-check-circle"></i> Normal</span>`;
      if (item.status === 'baixo')   statusPill = `<span class="status-pill baixo"><i class="fas fa-triangle-exclamation"></i> Baixo</span>`;
      if (item.status === 'critico') statusPill = `<span class="status-pill critico"><i class="fas fa-circle-exclamation"></i> Crítico</span>`;

      const keyEscaped = escapeHtml(item.firebaseKey);

      return `
        <tr>
          <td><span class="item-code">${escapeHtml(item.codigo)}</span></td>
          <td>
            <div class="item-name">${escapeHtml(item.nome)}</div>
            <div class="item-sub">${escapeHtml(item.sub)}</div>
          </td>
          <td><span class="cat-tag" style="${catStyle}">${escapeHtml(item.categoria)}</span></td>
          <td><div class="loc-cell"><i class="fas fa-location-dot"></i> ${escapeHtml(item.local)}</div></td>
          <td>
            <span class="qty-cell">${item.atual}</span>
            <span class="qty-min">/ min ${item.minimo}</span>
          </td>
          <td>
            <div class="table-progress-cell">
              <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width:${perc}%;background:${barColor};"></div>
              </div>
              <span class="progress-perc">${perc}%</span>
            </div>
          </td>
          <td>
            <div class="flow-cell">
              <span class="flow-in">+${item.entradas} entradas</span>
              <span class="flow-out">-${item.saidas} saídas</span>
            </div>
          </td>
          <td>${statusPill}</td>
          <td>
            <div class="action-cell">
              <div>
                <div class="qty-control" title="Informe quantas unidades deseja movimentar e use + ou −">
                  <button type="button" class="qty-btn" data-action="qty" data-delta="-1" data-key="${keyEscaped}" title="Retirar a quantidade informada">−</button>
                  <input type="number" class="qty-amount" data-qty-input="${keyEscaped}" min="1" step="1" value="1" aria-label="Quantidade para movimentar">
                  <button type="button" class="qty-btn" data-action="qty" data-delta="1" data-key="${keyEscaped}" title="Adicionar a quantidade informada">+</button>
                </div>
                <span class="qty-hint">quantidade por clique</span>
              </div>
              <button type="button" class="btn-delete" data-action="delete" data-key="${keyEscaped}" title="Excluir item" aria-label="Excluir item ${escapeHtml(item.codigo)}">
                <i class="fas fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>`;
    }).join('');

    if (resultsCount) {
      resultsCount.textContent = `Mostrando ${filtered.length} de ${items.length} itens`;
    }
  }

  function renderAll() {
    renderCatProgress();
    renderAlerts();
    renderTable();
  }

  // =====================================================================
  // 7. Ações — aumentar / diminuir quantidade
  // =====================================================================
  async function changeQty(key, direction, amount = 1) {
    const item = items.find((i) => i.firebaseKey === key);
    if (!item) return;

    amount = Math.max(1, Math.floor(Number(amount) || 1));
    const delta = direction * amount;
    const novaAtual = Math.max(0, item.atual + delta);
    const movimentado = direction < 0 ? Math.min(amount, item.atual) : amount;
    const novasEntradas = item.entradas + (direction > 0 ? amount : 0);
    const novasSaidas   = item.saidas   + (direction < 0 ? movimentado : 0);
    const novoStatus = calcularStatus(novaAtual, item.minimo);

    try {
      const { db, auth } = window.SL;
      await db.ref(`itens/${key}`).update({
        atual: novaAtual,
        entradas: novasEntradas,
        saidas: novasSaidas,
        status: novoStatus,
        atualizadoEm: Date.now()
      });

      await db.ref('logbot/eventos').push({
        tipo: 'info',
        texto: `${direction > 0 ? 'Entrada' : 'Saída'} de ${movimentado} un em ${item.codigo} (${item.nome}) por ${auth.currentUser?.email || 'sistema'}`,
        ref: key,
        timestamp: Date.now()
      });
    } catch (err) {
      console.error('[StockLog] Erro ao alterar quantidade:', err);
      showToast('Erro ao salvar. Verifique as permissões.', true);
    }
  }

  // =====================================================================
  // 7.1 Ações — excluir item
  // =====================================================================
  function openDeleteModal(key) {
    const item = items.find((i) => i.firebaseKey === key);
    if (!item) return;
    itemParaExcluir = key;
    const nameEl = $('#deleteItemName');
    if (nameEl) nameEl.textContent = `${item.nome} (${item.codigo})`;
    $('#deleteItemModal')?.classList.add('active');
    setTimeout(() => $('#btnCancelDelete')?.focus(), 100);
  }

  function closeDeleteModal() {
    itemParaExcluir = null;
    $('#deleteItemModal')?.classList.remove('active');
  }

  async function confirmDelete() {
    const key = itemParaExcluir;
    const item = items.find((i) => i.firebaseKey === key);
    if (!key || !item) { closeDeleteModal(); return; }

    const btn = $('#btnConfirmDelete');
    const originalHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Excluindo…';

    try {
      const { db, auth } = window.SL;
      await db.ref(`itens/${key}`).remove();

      await db.ref('logbot/eventos').push({
        tipo: 'aviso',
        texto: `Item ${item.codigo} (${item.nome}) excluído por ${auth.currentUser?.email || 'sistema'}`,
        ref: key,
        timestamp: Date.now()
      });

      closeDeleteModal();
      showToast(`Item "${item.nome}" excluído com sucesso!`);
    } catch (err) {
      console.error('[StockLog] Erro ao excluir item:', err);
      showToast('Erro ao excluir. Verifique as permissões.', true);
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalHtml;
    }
  }

  // =====================================================================
  // 8. Modal — abrir / fechar (adicionar)
  // =====================================================================
  function openAddModal() {
    const modal = $('#addItemModal');
    if (modal) modal.classList.add('active');
    setTimeout(() => $('#newCodigo')?.focus(), 100);
  }

  function closeAddModal() {
    const modal = $('#addItemModal');
    if (modal) modal.classList.remove('active');
    $('#addItemForm')?.reset();
  }

  // =====================================================================
  // 9. Submit — criar item no Firebase (chave = código do usuário)
  // =====================================================================
  async function handleAddItem(e) {
    e.preventDefault();

    const codigo = $('#newCodigo').value.trim();
    const nome   = $('#newNome').value.trim();
    const sub    = $('#newSub').value.trim();
    const categoria = $('#newCategoria').value;
    const local  = $('#newLocal').value.trim();
    const atual  = parseInt($('#newAtual').value) || 0;
    const minimo = parseInt($('#newMinimo').value) || 0;
    const maximo = parseInt($('#newMaximo').value) || 0;
    const entradas = parseInt($('#newEntradas').value) || 0;
    const saidas   = parseInt($('#newSaidas').value) || 0;

    if (!codigo || !nome || !categoria || !local) {
      showToast('Preencha Código, Nome, Categoria e Localização.', true);
      return;
    }
    if (minimo > maximo) {
      showToast('O estoque mínimo não pode ser maior que o máximo.', true);
      return;
    }

    const chave = sanitizeKey(codigo);
    if (!chave) {
      showToast('Código inválido.', true);
      return;
    }

    const novoStatus = calcularStatus(atual, minimo);
    const btn = $('#btnSaveItem');
    const originalHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando…';

    try {
      const { db, auth } = window.SL;

      const snap = await db.ref(`itens/${chave}`).once('value');
      if (snap.exists()) {
        showToast(`Já existe um item com o código "${codigo}".`, true);
        return;
      }

      const payload = {
        codigo,
        nome,
        sub: sub || '—',
        categoria,
        local,
        atual,
        minimo,
        maximo,
        entradas,
        saidas,
        status: novoStatus,
        dataCriacao: Date.now(),
        atualizadoEm: Date.now(),
        criadoPor: auth.currentUser?.uid || 'anonimo'
      };

      await db.ref(`itens/${chave}`).set(payload);

      await db.ref('logbot/eventos').push({
        tipo: 'info',
        texto: `Item ${codigo} (${nome}) cadastrado por ${auth.currentUser?.email || 'sistema'}`,
        ref: chave,
        timestamp: Date.now()
      });

      closeAddModal();
      showToast(`Item "${nome}" adicionado com sucesso!`);
    } catch (err) {
      console.error('[StockLog] Erro ao criar item:', err);
      showToast('Erro ao salvar. Verifique as permissões.', true);
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalHtml;
    }
  }

  // =====================================================================
  // 10. Sync label
  // =====================================================================
  function atualizarSyncLabel() {
    const el = $('#lastSync');
    if (el) el.textContent = new Date().toLocaleTimeString('pt-BR');
  }

  // =====================================================================
  // 11.1 Ação externa vinda da Ajuda de Produção (?stocklog=...)
  // =====================================================================
  function processarAcaoExterna() {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('stocklog');
    if (!raw) return;

    let dados;
    try { dados = JSON.parse(raw); } catch { return; }

    // Limpa a URL pra não reexecutar ao recarregar
    const url = new URL(window.location.href);
    url.searchParams.delete('stocklog');
    window.history.replaceState({}, '', url.toString());

    if (dados.acao === 'novo') {
      setTimeout(() => {
        openAddModal();
        const set = (id, val) => { const el = $(id); if (el && val != null) el.value = val; };
        set('#newCodigo', dados.codigo || '');
        set('#newNome',   dados.nome   || '');
        set('#newCategoria', dados.categoria || '');
        setTimeout(() => {
          if (!dados.nome) $('#newNome')?.focus();
          else if (!dados.categoria) $('#newCategoria')?.focus();
          else $('#newLocal')?.focus();
        }, 100);
      }, 400);
    }

    if (dados.acao === 'buscar') {
      setTimeout(() => {
        const input = $('#searchInput');
        if (input) {
          input.value = dados.codigo || '';
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }, 400);
    }
  }

  // =====================================================================
  // 11.2 Eventos de UI
  // =====================================================================
  function bindUI() {
    $('#searchInput')?.addEventListener('input', renderTable);
    $('#categoryFilter')?.addEventListener('change', renderTable);

    $$('.filter-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        $$('.filter-chip').forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        currentStatus = chip.dataset.status || 'todos';
        renderTable();
      });
    });

    $('#btnOpenAddModal')?.addEventListener('click', openAddModal);
    $('#btnCloseAddModal')?.addEventListener('click', closeAddModal);
    $('#btnCancelAdd')?.addEventListener('click', closeAddModal);
    $('#addItemModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'addItemModal') closeAddModal();
    });

    // Modal de exclusão
    $('#btnCancelDelete')?.addEventListener('click', closeDeleteModal);
    $('#btnConfirmDelete')?.addEventListener('click', confirmDelete);
    $('#deleteItemModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'deleteItemModal') closeDeleteModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAddModal();
        closeDeleteModal();
      }
    });

    $('#addItemForm')?.addEventListener('submit', handleAddItem);

    $('#tableBody')?.addEventListener('click', (e) => {
      // Excluir
      const delBtn = e.target.closest('[data-action="delete"]');
      if (delBtn) {
        openDeleteModal(delBtn.dataset.key);
        return;
      }

      // Aumentar / diminuir quantidade
      const btn = e.target.closest('[data-action="qty"]');
      if (!btn) return;
      const key = btn.dataset.key;
      const direction = parseInt(btn.dataset.delta, 10);
      const input = $('#tableBody').querySelector(`[data-qty-input="${CSS.escape(key)}"]`);
      const amount = input ? Math.max(1, parseInt(input.value, 10) || 1) : 1;
      if (key && (direction === 1 || direction === -1)) changeQty(key, direction, amount);
    });

    $('#tableBody')?.addEventListener('change', (e) => {
      const input = e.target.closest('[data-qty-input]');
      if (!input) return;
      const value = Math.max(1, parseInt(input.value, 10) || 1);
      input.value = value;
    });
  }

  // =====================================================================
  // 12. Boot
  // =====================================================================
  quandoPronto(() => {
    injetarUIExclusao();
    bindUI();
    processarAcaoExterna();
    bindFirebase();
    console.log(' [StockLog] Página de Itens conectada ao Firebase.');
  });

})();