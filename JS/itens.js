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
  { id: 12, codigo: "MP-1102", nome: "Resina Epóxi Industrial", sub: "Galão 5 Litros + Endurecedor", categoria: "Matéria-Prima", local: "A-04-01", atual: 5, minimo: 20, maximo: 60, entradas: 0, saidas: 8, status: "critico" }
];

let currentStatus = 'todos';

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
  }

  alertListEl.innerHTML = alerts.slice(0, 4).map(item => {
    const isCrit = item.status === 'critico';
    return `
      <div class="alert-item">
        <div class="alert-item-left">
          <div class="alert-icon ${isCrit ? 'critico' : 'baixo'}">
            <i class="fas ${isCrit ? 'fa-triangle-exclamation' : 'fa-circle-exclamation'}"></i>
          </div>
          <div class="alert-info">
            <span class="alert-title">${item.nome} (${item.codigo})</span>
            <span class="alert-sub">Mínimo: ${item.minimo} | Local: ${item.local}</span>
          </div>
        </div>
        <span class="alert-badge ${isCrit ? 'critico' : 'baixo'}">${item.atual} un</span>
      </div>
    `;
  }).join('');
}

function renderTable() {
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const search = searchInput ? searchInput.value.toLowerCase() : '';
  const category = categoryFilter ? categoryFilter.value : 'todas';

  let filtered = items.filter(item => {
    const matchesSearch = item.codigo.toLowerCase().includes(search) || 
                             item.nome.toLowerCase().includes(search) || 
                             item.sub.toLowerCase().includes(search);
    const matchesCategory = category === 'todas' || item.categoria === category;
    const matchesStatus = currentStatus === 'todos' || item.status === currentStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const tbody = document.getElementById('tableBody');
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9">
          <div class="empty-state">
            <i class="fas fa-box-open"></i>
            Nenhum item encontrado com os filtros selecionados.
          </div>
        </td>
      </tr>`;
  } else {
    tbody.innerHTML = filtered.map(item => {
      const perc = Math.min(100, Math.round((item.atual / item.maximo) * 100));
      let barColor = 'var(--green-bar)';
      if (item.status === 'baixo') barColor = 'var(--amber-bar)';
      if (item.status === 'critico') barColor = 'var(--red-bar)';

      let catStyle = 'background:var(--blue-bg); color:var(--blue);';
      if (item.categoria === 'Componentes') catStyle = 'background:var(--purple-bg); color:var(--purple);';
      if (item.categoria === 'Embalagens') catStyle = 'background:var(--teal-bg); color:var(--teal);';
      if (item.categoria === 'Consumíveis') catStyle = 'background:var(--amber-bg); color:var(--amber);';
      if (item.categoria === 'Ferramental') catStyle = 'background:var(--green-bg); color:var(--green);';

      let statusPill = `<span class="status-pill ok"><i class="fas fa-check-circle"></i> Normal</span>`;
      if (item.status === 'baixo') statusPill = `<span class="status-pill baixo"><i class="fas fa-triangle-exclamation"></i> Baixo</span>`;
      if (item.status === 'critico') statusPill = `<span class="status-pill critico"><i class="fas fa-circle-exclamation"></i> Crítico</span>`;

      return `
        <tr>
          <td><span class="item-code">${item.codigo}</span></td>
          <td>
            <div class="item-name">${item.nome}</div>
            <div class="item-sub">${item.sub}</div>
          </td>
          <td><span class="cat-tag" style="${catStyle}">${item.categoria}</span></td>
          <td><div class="loc-cell"><i class="fas fa-location-dot"></i> ${item.local}</div></td>
          <td>
            <span class="qty-cell">${item.atual}</span> 
            <span class="qty-min">/ min ${item.minimo}</span>
          </td>
          <td>
            <div class="table-progress-cell">
              <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: ${perc}%; background: ${barColor};"></div>
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
            <div class="qty-btns">
              <button class="qty-btn" onclick="changeQty(${item.id}, -1)" title="Diminuir 1">-</button>
              <button class="qty-btn" onclick="changeQty(${item.id}, 1)" title="Aumentar 1">+</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

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

function changeQty(id, delta) {
  const item = items.find(i => i.id === id);
  if (!item) return;
  item.atual = Math.max(0, item.atual + delta);
  if (delta > 0) item.entradas++;
  if (delta < 0) item.saidas++;

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
  }

  if (minimo > maximo) {
    alert('O estoque mínimo não pode ser maior que o máximo.');
    return;
  }

  if (items.some(item => item.codigo.toLowerCase() === codigo.toLowerCase())) {
    alert('Já existe um item com esse código. Use um código único.');
    return;
  }

  let status = 'ok';
  if (atual <= Math.round(minimo * 0.3)) {
    status = 'critico';
  } else if (atual <= minimo) {
    status = 'baixo';
  }

  const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;

  const newItem = {
    id: newId,
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
    status
  };

  items.push(newItem);
  closeAddModal();
  renderAll();

  const toast = document.getElementById('toastPopup');
  if (toast) {
    toast.innerHTML = `<i class="fas fa-circle-check" style="font-size: 18px;"></i><span>Item "${nome}" adicionado com sucesso!</span>`;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}

document.addEventListener('click', function(event) {
  const modal = document.getElementById('addItemModal');
  if (event.target === modal) {
    closeAddModal();
  }
});

document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeAddModal();
  }
});

document.addEventListener('DOMContentLoaded', renderAll);
