/* ================================================================
   StockLog · JS/pedidos.js
   Página de Pedidos de Produção — integrada ao Firebase
   Coleção: /ordensProducao  (chave = código da OP)
   ================================================================ */

(function () {
  'use strict';

  // =====================================================================
  // 0. Referências locais
  // =====================================================================
  let db = null;
  let auth = null;

  function quandoFirebasePronto(cb) {
    const tentar = (n = 0) => {
      if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length) {
        db = firebase.database();
        auth = firebase.auth();
        return cb();
      }
      if (n > 50) {
        console.error('[StockLog] Firebase não foi inicializado no HTML.');
        return;
      }
      setTimeout(() => tentar(n + 1), 100);
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => tentar());
    } else {
      tentar();
    }
  }

  // =====================================================================
  // 1. Metadados visuais
  // =====================================================================
  const STATUS_META = {
    planejamento: { label: 'Planejamento',     color: '#5890c0',         bg: 'var(--primary-light)' },
    aguardando:   { label: 'Aguard. Material', color: 'var(--amber)',    bg: 'var(--amber-bg)' },
    producao:     { label: 'Em Produção',      color: 'var(--green)',    bg: 'var(--green-bg)' },
    qa:           { label: 'Controle QA',      color: 'var(--purple)',   bg: 'var(--purple-bg)' },
    concluido:    { label: 'Concluído',        color: 'var(--blue2)',    bg: 'var(--blue2-bg)' },
    cancelado:    { label: 'Cancelado',        color: 'var(--red)',      bg: 'var(--red-bg)' }
  };
  const PRIORITY_META = {
    baixa:   { label: 'Baixa',   color: 'var(--green)',   bg: 'var(--green-bg)' },
    media:   { label: 'Média',   color: 'var(--primary)', bg: 'var(--primary-light)' },
    alta:    { label: 'Alta',    color: 'var(--amber)',   bg: 'var(--amber-bg)' },
    urgente: { label: 'Urgente', color: 'var(--red)',     bg: 'var(--red-bg)' }
  };

  // =====================================================================
  // 2. Estado local
  // =====================================================================
  let orders = [];
  let editingKey = null;    // agora é o próprio código (OP-2026-XXX)
  let editingCodigo = null;
  let viewMode = false;
  let toastTimer;

  // =====================================================================
  // 3. Helpers
  // =====================================================================
  const $ = (id) => document.getElementById(id);

  function fmtDate(iso) {
    if (!iso) return '—';
    if (typeof iso === 'number') {
      const d = new Date(iso);
      return isNaN(d) ? '—' : d.toLocaleDateString('pt-BR');
    }
    const [y, m, d] = String(iso).split('-');
    return `${d}/${m}/${y}`;
  }

  function isLate(o) {
    if (o.status === 'concluido' || o.status === 'cancelado') return false;
    if (!o.prazo) return false;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return new Date(o.prazo + 'T00:00:00') < hoje;
  }

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str ?? '';
    return d.innerHTML;
  }

  // =====================================================================
  // 4. Geração de código — agora retorna apenas o próximo código
  //    disponível (sem se preocupar com chave de push)
  // =====================================================================
  // Próximo número = MAIOR sequência existente no ano + 1
  // (contar os pedidos quebra quando há exclusões ou códigos fora de ordem)
  function proximaSequencia(chaves, ano) {
    const re = new RegExp(`^OP-${ano}-(\\d+)$`);
    let max = 0;
    chaves.forEach((k) => {
      const m = re.exec(k);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    });
    return max + 1;
  }

  const fmtCodigo = (ano, n) => `OP-${ano}-${String(n).padStart(3, '0')}`;

  // Reserva o código de forma atômica: só grava se a chave estiver livre.
  // Se outro usuário pegou o mesmo número ao mesmo tempo, tenta o próximo.
  async function criarOrdem(data, user) {
    const ano = new Date().getFullYear();
    const snap = await db.ref('ordensProducao').once('value');
    let n = proximaSequencia(Object.keys(snap.val() || {}), ano);

    for (let tentativa = 0; tentativa < 10; tentativa++, n++) {
      const codigo = fmtCodigo(ano, n);
      const nova = {
        codigo,
        ...data,
        dataCriacao: Date.now(),
        criadoPor: user?.uid || 'anonimo'
      };
      const res = await db.ref(`ordensProducao/${codigo}`).transaction(
        (atual) => (atual === null ? nova : undefined)   // undefined = aborta
      );
      if (res.committed) return codigo;
    }
    throw new Error('Não foi possível reservar um código de pedido livre.');
  }

  // =====================================================================
  // 5. LogBot
  // =====================================================================
  async function logEvento(tipo, texto, ref = null) {
    try {
      await db.ref('logbot/eventos').push({
        tipo, texto, ref, timestamp: Date.now()
      });
    } catch (e) {
      console.warn('[StockLog] Falha ao gravar log:', e);
    }
  }

  // =====================================================================
  // 6. Listeners Firebase
  // =====================================================================
  function bindFirebase() {
    db.ref('ordensProducao').on('value', (snap) => {
      const val = snap.val() || {};
      orders = Object.entries(val).map(([key, o]) => ({
        // A chave AGORA É o próprio código (OP-2026-XXX)
        firebaseKey: key,
        codigo:      o.codigo || key,   // fallback: se o campo codigo não existir, usa a chave
        ...o
      }));
      orders.sort((a, b) => (b.dataCriacao || 0) - (a.dataCriacao || 0));
      renderAll();
    });
  }

  // =====================================================================
  // 7. Render — KPIs
  // =====================================================================
  function renderKPIs() {
    $('kpiTotal').textContent      = orders.filter((o) => o.status !== 'cancelado').length;
    $('kpiProducao').textContent   = orders.filter((o) => o.status === 'producao').length;
    $('kpiAtrasados').textContent  = orders.filter(isLate).length;
    $('kpiConcluidos').textContent = orders.filter((o) => o.status === 'concluido').length;
  }

  // =====================================================================
  // 8. Render — Tabela
  // =====================================================================
  function renderTable() {
    const search    = $('searchInput').value.trim().toLowerCase();
    const statusF   = $('statusFilter').value;
    const priorityF = $('priorityFilter').value;

    const filtered = orders.filter((o) => {
      const txt = `${o.codigo || ''} ${o.produto || ''} ${o.responsavel || ''}`.toLowerCase();
      const matchesSearch   = !search || txt.includes(search);
      const matchesStatus   = !statusF   || o.status === statusF;
      const matchesPriority = !priorityF || o.prioridade === priorityF;
      return matchesSearch && matchesStatus && matchesPriority;
    });

    const tbody = $('ordersTableBody');
    tbody.innerHTML = '';
    $('emptyState').style.display = filtered.length ? 'none' : 'block';
    $('countBadge').textContent = `${orders.length} pedido${orders.length === 1 ? '' : 's'}`;

    filtered.forEach((o) => {
      const st = STATUS_META[o.status]      || STATUS_META.planejamento;
      const pr = PRIORITY_META[o.prioridade] || PRIORITY_META.media;
      const tr = document.createElement('tr');
      tr.className = 'order-row';
      tr.innerHTML = `
        <td><strong>${escapeHtml(o.codigo || o.firebaseKey)}</strong></td>
        <td class="prod-cell">
          <div class="prod-name">${escapeHtml(o.produto)}</div>
          <div class="prod-qty">${Number(o.quantidade || 0).toLocaleString('pt-BR')} unid.</div>
        </td>
        <td><span class="priority-tag" style="background:${pr.bg};color:${pr.color}">
          <span class="dot" style="background:${pr.color}"></span>${pr.label}
        </span></td>
        <td>${escapeHtml(o.responsavel || '—')}</td>
        <td>${fmtDate(o.prazo)}${isLate(o) ? ' <i class="fas fa-triangle-exclamation" style="color:var(--red)" title="Prazo vencido"></i>' : ''}</td>
        <td><span class="status-tag" style="background:${st.bg};color:${st.color}">
          <span class="dot" style="background:${st.color}"></span>${st.label}
        </span></td>
        <td>
          <div class="row-actions">
            <button class="icon-btn" title="Visualizar" data-action="view"   data-key="${o.firebaseKey}"><i class="fas fa-eye"></i></button>
            <button class="icon-btn" title="Editar"     data-action="edit"   data-key="${o.firebaseKey}"><i class="fas fa-pen"></i></button>
            <button class="icon-btn danger" title="Excluir" data-action="delete" data-key="${o.firebaseKey}"><i class="fas fa-trash"></i></button>
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

  // =====================================================================
  // 9. Delegação de eventos
  // =====================================================================
  function bindTableActions() {
    $('ordersTableBody').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const { action, key } = btn.dataset;
      if (action === 'view')   openViewModal(key);
      if (action === 'edit')   openEditModal(key);
      if (action === 'delete') deleteOrder(key);
    });
  }

  // =====================================================================
  // 10. Modal
  // =====================================================================
  const overlay = $('modalOverlay');
  const form    = $('orderForm');

  function resetForm() {
    form.reset();
    $('fPrioridade').value = 'media';
    $('fStatus').value = 'planejamento';
    [...form.querySelectorAll('.field')].forEach((f) => f.classList.remove('has-error'));
    setFieldsDisabled(false);
  }

  function setFieldsDisabled(disabled) {
    ['fProduto', 'fQuantidade', 'fPrioridade', 'fResponsavel', 'fPrazo', 'fStatus', 'fObs']
      .forEach((id) => { $(id).disabled = disabled; });
  }

  function fillForm(o) {
    $('fProduto').value      = o.produto || '';
    $('fQuantidade').value   = o.quantidade || '';
    $('fPrioridade').value   = o.prioridade || 'media';
    $('fResponsavel').value  = o.responsavel || '';
    $('fPrazo').value        = o.prazo || '';
    $('fStatus').value       = o.status || 'planejamento';
    $('fObs').value          = o.obs || '';
  }

  function openCreateModal() {
    editingKey = null;
    editingCodigo = null;
    viewMode = false;
    resetForm();
    $('modalTitle').innerHTML = '<i class="fas fa-plus"></i>Novo pedido';
    $('codeFieldWrap').style.display = 'none';
    $('saveBtn').style.display = 'inline-flex';
    $('editFromViewBtn').style.display = 'none';
    overlay.classList.add('open');
    $('fProduto').focus();
  }

  function openEditModal(key) {
    const o = orders.find((x) => x.firebaseKey === key);
    if (!o) return;
    editingKey = key;
    editingCodigo = o.codigo;
    viewMode = false;
    resetForm();
    fillForm(o);
    $('modalTitle').innerHTML = '<i class="fas fa-pen"></i>Editar pedido';
    $('codeFieldWrap').style.display = 'flex';
    $('viewCode').textContent = o.codigo;
    $('saveBtn').style.display = 'inline-flex';
    $('editFromViewBtn').style.display = 'none';
    overlay.classList.add('open');
  }

  function openViewModal(key) {
    const o = orders.find((x) => x.firebaseKey === key);
    if (!o) return;
    editingKey = key;
    editingCodigo = o.codigo;
    viewMode = true;
    resetForm();
    fillForm(o);
    setFieldsDisabled(true);
    $('modalTitle').innerHTML = '<i class="fas fa-eye"></i>Detalhes do pedido';
    $('codeFieldWrap').style.display = 'flex';
    $('viewCode').textContent = o.codigo;
    $('saveBtn').style.display = 'none';
    $('editFromViewBtn').style.display = 'inline-flex';
    overlay.classList.add('open');
  }

  function switchViewToEdit() {
    viewMode = false;
    setFieldsDisabled(false);
    $('modalTitle').innerHTML = '<i class="fas fa-pen"></i>Editar pedido';
    $('saveBtn').style.display = 'inline-flex';
    $('editFromViewBtn').style.display = 'none';
  }

  function closeModal() {
    overlay.classList.remove('open');
    editingKey = null;
    editingCodigo = null;
    viewMode = false;
  }

  // =====================================================================
  // 11. Validação
  // =====================================================================
  function validate() {
    let valid = true;
    const checks = [
      ['fProduto',     (v) => v.trim().length > 0],
      ['fQuantidade',  (v) => Number(v) > 0],
      ['fResponsavel', (v) => v.trim().length > 0],
      ['fPrazo',       (v) => v.trim().length > 0]
    ];
    checks.forEach(([id, test]) => {
      const el = $(id);
      const field = el.closest('.field');
      if (!test(el.value)) {
        field.classList.add('has-error');
        valid = false;
      } else {
        field.classList.remove('has-error');
      }
    });
    return valid;
  }

  // =====================================================================
  // 12. Submit — CREATE / UPDATE
  // =====================================================================
  async function onSubmit(e) {
    e.preventDefault();
    if (viewMode) return;
    if (!validate()) return;

    const user = auth.currentUser;
    const btn = $('saveBtn');
    const originalHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>Salvando…';

    const data = {
      produto:     $('fProduto').value.trim(),
      quantidade:  Number($('fQuantidade').value),
      prioridade:  $('fPrioridade').value,
      responsavel: $('fResponsavel').value.trim(),
      prazo:       $('fPrazo').value,
      status:      $('fStatus').value,
      obs:         $('fObs').value.trim()
    };

    try {
      if (editingKey) {
        // ---------- UPDATE ----------
        // editingKey já É o código (OP-2026-XXX)
        await db.ref(`ordensProducao/${editingKey}`).update(data);
        await logEvento('info', `${editingCodigo} atualizado por ${user?.email || 'sistema'}`, editingKey);
        showToast(`Pedido ${editingCodigo} atualizado.`);
      } else {
        // ---------- CREATE ----------
        const codigo = await criarOrdem(data, user);
        await logEvento('info', `${codigo} criada por ${user?.email || 'sistema'}`, codigo);
        showToast(`Pedido ${codigo} criado com sucesso.`);
      }
      closeModal();
    } catch (err) {
      console.error('[StockLog] Erro ao salvar:', err);
      showToast('Erro ao salvar. Verifique as permissões do Firebase.', true);
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalHtml;
    }
  }

  // =====================================================================
  // 13. Delete
  // =====================================================================
  async function deleteOrder(key) {
    const o = orders.find((x) => x.firebaseKey === key);
    if (!o) return;
    if (!confirm(`Excluir o pedido ${o.codigo}? Essa ação não pode ser desfeita.`)) return;

    try {
      await db.ref(`ordensProducao/${key}`).remove();
      await logEvento('alerta', `${o.codigo} excluído por ${auth.currentUser?.email || 'sistema'}`, key);
      showToast(`Pedido ${o.codigo} excluído.`, true);
    } catch (err) {
      console.error('[StockLog] Erro ao excluir:', err);
      showToast('Erro ao excluir. Verifique as permissões.', true);
    }
  }

  // =====================================================================
  // 14. Toast
  // =====================================================================
  function showToast(msg, danger = false) {
    const toast = $('toast');
    toast.classList.toggle('danger', danger);
    toast.querySelector('i').className = danger ? 'fas fa-trash' : 'fas fa-check-circle';
    $('toastMsg').textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  }

  // =====================================================================
  // 15. Filtros + eventos
  // =====================================================================
  function bindUI() {
    $('searchInput').addEventListener('input', renderTable);
    $('statusFilter').addEventListener('change', renderTable);
    $('priorityFilter').addEventListener('change', renderTable);

    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
    });

    form.addEventListener('submit', onSubmit);
  }

  // =====================================================================
  // 16. Expor funções para onclick inline do HTML
  // =====================================================================
  function exporGlobais() {
    window.toggleTheme      = function () {
      const isDark = document.body.classList.toggle('dark');
      const icon = document.getElementById('themeIcon');
      if (icon) icon.className = isDark ? 'fas fa-moon' : 'fas fa-sun';
    };
    window.openCreateModal  = openCreateModal;
    window.openEditModal    = openEditModal;
    window.openViewModal    = openViewModal;
    window.switchViewToEdit = switchViewToEdit;
    window.closeModal       = closeModal;
    window.deleteOrder      = function (codigoOuKey) {
      const byKey    = orders.find((o) => o.firebaseKey === codigoOuKey);
      const byCodigo = orders.find((o) => o.codigo      === codigoOuKey);
      const alvo = byKey || byCodigo;
      if (alvo) deleteOrder(alvo.firebaseKey);
    };
  }

  // =====================================================================
  // 17. Boot
  // =====================================================================
  quandoFirebasePronto(() => {
    bindUI();
    bindTableActions();
    exporGlobais();
    bindFirebase();
    console.log('🚀 [StockLog] Página de Pedidos conectada ao Firebase.');
  });

})();