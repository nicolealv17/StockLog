<<<<<<< HEAD
/* ================================================================
   StockLog · JS/itens.js
   Página de Itens em Estoque — integrada ao Firebase
   Coleção: /itens
   ================================================================ */
=======
let items = [
  { id: 1, codigo: "MP-1042", nome: "Chapa de Aço Inox 304", sub: "Espessura 2mm - 1200x2400mm", categoria: "Matéria-Prima", local: "A-01-04", atual: 450, minimo: 200, maximo: 1000, entradas: 50, saidas: 12, status: "ok" },
  { id: 2, codigo: "MP-1088", nome: "Polímero ABS Virgem", sub: "Granulado - Sacos 25kg", categoria: "Matéria-Prima", local: "A-02-01", atual: 80, minimo: 150, maximo: 500, entradas: 0, saidas: 35, status: "baixo" },
  { id: 3, codigo: "CP-3011", nome: "Rolamento Blindado 6204-2RS", sub: "Diâmetro 20x47x14mm", categoria: "Componentes", local: "B-04-02", atual: 15, minimo: 100, maximo: 400, entradas: 0, saidas: 45, status: "critico" },
  { id: 4, codigo: "CP-3045", nome: "Parafuso Sextavado M8x30", sub: "Inox A2 - Caixa 500 un", categoria: "Componentes", local: "B-02-05", atual: 620, minimo: 300, maximo: 1200, entradas: 100, saidas: 80, status: "ok" },
  { id: 5, codigo: "EM-5012", nome: "Caixa Papelão Duplo 40x30x30", sub: "Onda BC Alta Resistência", categoria: "Embalagens", local: "C-01-01", atual: 310, minimo: 250, maximo: 800, entradas: 200, saidas: 110, status: "ok" },
  { id: 6, codigo: "EM-5089", nome: "Filme Stretch Manual 500mm", sub: "Bobina 3.5kg 25 micras", categoria: "Embalagens", local: "C-03-02", atual: 28, minimo: 50, maximo: 200, entradas: 0, saidas: 14, status: "baixo" },
  { id: 7, codigo: "CS-7023", nome: "Óleo Lubrificante ISO VG 68", sub: "Tambor 200 Litros", categoria: "Consumíveis", local: "D-01-03", atual: 2, minimo: 5, maximo: 15, entradas: 0, saidas: 1, status: "critico" },
  { id: 8, codigo: "CS-7050", nome: "Luva Nitrílica Tam. L", sub: "Caixa c/ 100 unidades", categoria: "Consumíveis", local: "D-02-01", atual: 140, minimo: 80, maximo: 300, entradas: 50, saidas: 22, status: "ok" },
  { id: 9, codigo: "FR-9010", nome: "Broca Metal Duro Ø8mm", sub: "Revestimento TiAlN", categoria: "Ferramental", local: "E-01-02", atual: 18, minimo: 10, maximo: 40, entradas: 5, saidas: 2, status: "ok" },
  { id: 10, codigo: "MP-1095", nome: "Tubo Alumínio Estrutural", sub: "Diâmetro 50mm x 3m", categoria: "Matéria-Prima", local: "A-03-05", atual: 95, minimo: 100, maximo: 300, entradas: 0, saidas: 18, status: "baixo" },
  { id: 11, codigo: "CP-3099", nome: "Sensor Indutivo M12 PNP", sub: "Alcance 4mm - Cabo 2m", categoria: "Componentes", local: "B-01-03", atual: 42, minimo: 20, maximo: 80, entradas: 10, saidas: 4, status: "ok" },
  { id: 12, codigo: "MP-1102", nome: "Resina Epóxi Industrial", sub: "Galão 5 Litros + Endurecedor", categoria: "Matéria-Prima", local: "A-04-01", atual: 5, minimo: 20, maximo: 60, entradas: 0, saidas: 8, status: "critico" },
  { id: 13, codigo: "PROD-01", nome: "PRODUTO 1 (Arduino)", sub: "Componente Especial", categoria: "Componentes", local: "E-05-01", atual: 50, minimo: 10, maximo: 200, entradas: 0, saidas: 0, status: "ok" },
  { id: 14, codigo: "PROD-02", nome: "PRODUTO 2", sub: "Componente Especial", categoria: "Componentes", local: "E-05-02", atual: 50, minimo: 10, maximo: 200, entradas: 0, saidas: 0, status: "ok" },
  { id: 15, codigo: "PROD-03", nome: "PRODUTO 3", sub: "Componente Especial", categoria: "Componentes", local: "E-05-03", atual: 50, minimo: 10, maximo: 200, entradas: 0, saidas: 0, status: "ok" },
  { id: 16, codigo: "PROD-04", nome: "PRODUTO 4", sub: "Componente Especial", categoria: "Componentes", local: "E-05-04", atual: 50, minimo: 10, maximo: 200, entradas: 0, saidas: 0, status: "ok" }
];
>>>>>>> f97aa55424b566cb32f43026c9d188fe3cc24644

(function () {
  'use strict';

<<<<<<< HEAD
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
=======
// ===================== FUNÇÕES DE RENDERIZAÇÃO =====================

function renderCatProgress() {
  const catListEl = document.getElementById('catProgressList');
  if (!catListEl) return;

  const categories = ["Matéria-Prima", "Componentes", "Embalagens", "Consumíveis", "Ferramental"];
  const colors = {
    "Matéria-Prima": "var(--blue-bar)",
    "Componentes": "var(--purple-bar)",
    "Embalagens": "var(--teal-bar)",
    "Consumíveis": "var(--amber-bar)",
    "Ferramental": "var(--green-bar)"
  };

  catListEl.innerHTML = categories.map(cat => {
    const catItems = items.filter(i => i.categoria === cat);
    const totalAtual = catItems.reduce((acc, i) => acc + i.atual, 0);
    const totalMax = catItems.reduce((acc, i) => acc + i.maximo, 0);
    const perc = totalMax > 0 ? Math.min(100, Math.round((totalAtual / totalMax) * 100)) : 0;

    return `
      <div class="cat-progress-item">
        <div class="cat-progress-info">
          <span>${cat} (${catItems.length} itens)</span>
          <strong>${perc}% (${totalAtual.toLocaleString()} / ${totalMax.toLocaleString()})</strong>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${perc}%; background: ${colors[cat] || 'var(--primary)'};"></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderAlerts() {
  const alertListEl = document.getElementById('alertList');
  const badgeEl = document.getElementById('notifBadge');
  const alertCountBadge = document.getElementById('alertCountBadge');
  if (!alertListEl) return;

  const alerts = items.filter(i => i.status === 'critico' || i.status === 'baixo');

  if (badgeEl) badgeEl.innerText = alerts.length;
  if (alertCountBadge) alertCountBadge.innerText = `${alerts.length} pendentes`;

  if (alerts.length === 0) {
    alertListEl.innerHTML = `<div class="empty-state" style="padding:15px;"><i class="fas fa-circle-check" style="color:var(--green); font-size:18px;"></i> Nenhum alerta de reposição no momento.</div>`;
    return;
>>>>>>> f97aa55424b566cb32f43026c9d188fe3cc24644
  }

  // =====================================================================
  // 1. Estado local (espelho do Firebase)
  // =====================================================================
  let items = [];          // array de objetos { firebaseKey, codigo, nome, ... }
  let currentStatus = 'todos';

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

  // Recalcula status com base em atual/minimo
  function calcularStatus(atual, minimo) {
    if (atual <= Math.round(minimo * 0.3)) return 'critico';
    if (atual <= minimo) return 'baixo';
    return 'ok';
  }

  // Toast
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

  // Segurança
  function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
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
          codigo:    it.codigo    || '',
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

<<<<<<< HEAD
    const alerts = items.filter((i) => i.status === 'critico' || i.status === 'baixo');
=======
  // Sincroniza quantidades dos produtos específicos via localStorage
  const productsMap = {
    "PROD-01": "produto1",
    "PROD-02": "produto2",
    "PROD-03": "produto3",
    "PROD-04": "produto4"
  };

  let syncedItems = items.map(item => {
    const productKey = productsMap[item.codigo];
    if (productKey) {
      const savedQty = localStorage.getItem('stocklog_product_qty_' + productKey);
      if (savedQty !== null) {
        return { ...item, atual: parseInt(savedQty) };
      }
    }
    return item;
  });

  let filtered = syncedItems.filter(item => {
    const matchesSearch = item.codigo.toLowerCase().includes(search) ||
                         item.nome.toLowerCase().includes(search) ||
                         item.sub.toLowerCase().includes(search);
    const matchesCategory = category === 'todas' || item.categoria === category;
    const matchesStatus = currentStatus === 'todos' || item.status === currentStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });
>>>>>>> f97aa55424b566cb32f43026c9d188fe3cc24644

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

    // ---------- Nada cadastrado ----------
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

    // ---------- Filtros ----------
    const filtered = items.filter((item) => {
      const blob = `${item.codigo} ${item.nome} ${item.sub}`.toLowerCase();
      const matchesSearch   = !search || blob.includes(search);
      const matchesCategory = category === 'todas' || item.categoria === category;
      const matchesStatus   = currentStatus === 'todos' || item.status === currentStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });

    // ---------- Tem itens, mas filtro não bateu ----------
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

    // ---------- Linhas ----------
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
<<<<<<< HEAD
            <div class="qty-btns">
              <button class="qty-btn" data-action="qty" data-delta="-1" data-key="${item.firebaseKey}" title="Diminuir 1">-</button>
              <button class="qty-btn" data-action="qty" data-delta="1"  data-key="${item.firebaseKey}" title="Aumentar 1">+</button>
=======
            <div class="qty-btns" style="align-items: center; gap: 5px;">
              <input type="number" id="qty-input-${item.id}" value="1" min="1" style="width: 45px; padding: 4px; border-radius: 4px; border: 1px solid var(--border); background: var(--bg-card); color: var(--text-main); font-size: 12px; text-align: center;">
              <button class="qty-btn" onclick="updateQtyCustom(${item.id}, 'in')" title="Entrada" style="color: var(--green);"><i class="fas fa-plus"></i></button>
              <button class="qty-btn" onclick="updateQtyCustom(${item.id}, 'out')" title="Saída" style="color: var(--red);"><i class="fas fa-minus"></i></button>
>>>>>>> f97aa55424b566cb32f43026c9d188fe3cc24644
            </div>
          </td>
        </tr>`;
    }).join('');

    if (resultsCount) {
      resultsCount.textContent = `Mostrando ${filtered.length} de ${items.length} itens`;
    }
  }

<<<<<<< HEAD
  function renderAll() {
    renderCatProgress();
    renderAlerts();
    renderTable();
=======
  const resultsCount = document.getElementById('resultsCount');
  if (resultsCount) {
    resultsCount.innerText = `Mostrando ${filtered.length} de ${items.length} itens`;
  }
}

function renderAll() {
  renderCatProgress();
  renderAlerts();
  renderTable();
}

// ===================== FUNÇÕES DE INTERAÇÃO =====================

function updateQtyCustom(id, type) {
  const input = document.getElementById(`qty-input-${id}`);
  const amount = parseInt(input.value) || 1;
  const item = items.find(i => i.id === id);
  if (!item) return;

  if (type === 'in') {
    item.atual += amount;
    item.entradas += amount;
  } else {
    item.atual = Math.max(0, item.atual - amount);
    item.saidas += amount;
  }

  // Sincroniza com localStorage para produtos específicos
  const productsMap = {
    "PROD-01": "produto1",
    "PROD-02": "produto2",
    "PROD-03": "produto3",
    "PROD-04": "produto4"
  };
  const productKey = productsMap[item.codigo];
  if (productKey) {
    localStorage.setItem('stocklog_product_qty_' + productKey, item.atual.toString());
  }

  if (item.atual <= Math.round(item.minimo * 0.3)) {
    item.status = 'critico';
  } else if (item.atual <= item.minimo) {
    item.status = 'baixo';
  } else {
    item.status = 'ok';
  }
  renderAll();
}

function changeQty(id, delta) {
  const item = items.find(i => i.id === id);
  if (!item) return;
  item.atual = Math.max(0, item.atual + delta);
  if (delta > 0) item.entradas++;
  if (delta < 0) item.saidas++;

  // Sincroniza com localStorage para produtos específicos
  const productsMap = {
    "PROD-01": "produto1",
    "PROD-02": "produto2",
    "PROD-03": "produto3",
    "PROD-04": "produto4"
  };
  const productKey = productsMap[item.codigo];
  if (productKey) {
    localStorage.setItem('stocklog_product_qty_' + productKey, item.atual.toString());
  }

  if (item.atual <= Math.round(item.minimo * 0.3)) {
    item.status = 'critico';
  } else if (item.atual <= item.minimo) {
    item.status = 'baixo';
  } else {
    item.status = 'ok';
  }
  renderAll();
}

function setStatusFilter(status, btn) {
  currentStatus = status;
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderTable();
}

function toggleTheme() {
  document.body.classList.toggle('dark');
  const icon = document.getElementById('themeIcon');
  if (icon) {
    icon.className = document.body.classList.contains('dark') ? 'fas fa-sun' : 'fas fa-moon';
  }
}

function atualizar() {
  const lastSync = document.getElementById('lastSync');
  if (lastSync) {
    const now = new Date();
    lastSync.innerText = now.toLocaleTimeString('pt-BR');
  }
  renderAll();
  showToast();
}

function showToast() {
  const toast = document.getElementById('toastPopup');
  if (toast) {
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}

// ===================== FUNÇÕES DO MODAL DE ADICIONAR =====================

function openAddModal() {
  const modal = document.getElementById('addItemModal');
  if (modal) modal.classList.add('active');
  setTimeout(() => {
    const firstInput = document.getElementById('newCodigo');
    if (firstInput) firstInput.focus();
  }, 100);
}

function closeAddModal() {
  const modal = document.getElementById('addItemModal');
  if (modal) modal.classList.remove('active');
  document.getElementById('addItemForm').reset();
}

function handleAddItem(event) {
  event.preventDefault();

  const codigo = document.getElementById('newCodigo').value.trim();
  const nome = document.getElementById('newNome').value.trim();
  const sub = document.getElementById('newSub').value.trim();
  const categoria = document.getElementById('newCategoria').value;
  const local = document.getElementById('newLocal').value.trim();
  const atual = parseInt(document.getElementById('newAtual').value) || 0;
  const minimo = parseInt(document.getElementById('newMinimo').value) || 0;
  const maximo = parseInt(document.getElementById('newMaximo').value) || 0;
  const entradas = parseInt(document.getElementById('newEntradas').value) || 0;
  const saidas = parseInt(document.getElementById('newSaidas').value) || 0;

  if (!codigo || !nome || !categoria || !local) {
    alert('Preencha todos os campos obrigatórios (Código, Nome, Categoria e Localização).');
    return;
>>>>>>> f97aa55424b566cb32f43026c9d188fe3cc24644
  }

  // =====================================================================
  // 7. Ações — aumentar / diminuir quantidade
  // =====================================================================
  async function changeQty(key, delta) {
    const item = items.find((i) => i.firebaseKey === key);
    if (!item) return;

    const novaAtual = Math.max(0, item.atual + delta);
    const novasEntradas = item.entradas + (delta > 0 ? 1 : 0);
    const novasSaidas   = item.saidas   + (delta < 0 ? 1 : 0);
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
        texto: `${delta > 0 ? 'Entrada' : 'Saída'} de 1 un em ${item.codigo} (${item.nome}) por ${auth.currentUser?.email || 'sistema'}`,
        ref: key,
        timestamp: Date.now()
      });
    } catch (err) {
      console.error('[StockLog] Erro ao alterar quantidade:', err);
      showToast('Erro ao salvar. Verifique as permissões.', true);
    }
  }

  // =====================================================================
  // 8. Modal — abrir / fechar
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
  // 9. Submit — criar item no Firebase
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
    if (items.some((i) => i.codigo.toLowerCase() === codigo.toLowerCase())) {
      showToast('Já existe um item com esse código.', true);
      return;
    }

    const novoStatus = calcularStatus(atual, minimo);
    const btn = $('#btnSaveItem');
    const originalHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando…';

    try {
      const { db, auth } = window.SL;
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

      const ref = await db.ref('itens').push(payload);

      await db.ref('logbot/eventos').push({
        tipo: 'info',
        texto: `Item ${codigo} (${nome}) cadastrado por ${auth.currentUser?.email || 'sistema'}`,
        ref: ref.key,
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
  // 11. Eventos de UI
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
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAddModal();
    });

    $('#addItemForm')?.addEventListener('submit', handleAddItem);

    $('#tableBody')?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action="qty"]');
      if (!btn) return;
      const key   = btn.dataset.key;
      const delta = parseInt(btn.dataset.delta, 10);
      if (key && !isNaN(delta)) changeQty(key, delta);
    });
  }

  // =====================================================================
  // 12. Boot
  // =====================================================================
  quandoPronto(() => {
    bindUI();
    bindFirebase();
    console.log('🚀 [StockLog] Página de Itens conectada ao Firebase.');
  });

})();