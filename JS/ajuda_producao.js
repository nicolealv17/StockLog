// Mock de itens em estoque (Simulando a base de dados de itens.js)
const MOCK_STOCK = [
  { codigo: "MP-1042", nome: "Chapa de Aço Inox 304", atual: 450, minimo: 200 },
  { codigo: "MP-1050", nome: "Chapa de Aço Carbono 10mm", atual: 180, minimo: 150 },
  { codigo: "MP-1088", nome: "Polímero ABS Virgem", atual: 80, minimo: 150 },
  { codigo: "MP-1102", nome: "Resina Epóxi Industrial", atual: 5, minimo: 20 },
  { codigo: "MP-1120", nome: "Barra de Bronze TM23", atual: 40, minimo: 25 },
  { codigo: "MP-1135", nome: "Perfil U Aço Galvanizado", atual: 96, minimo: 60 },
  { codigo: "MP-1140", nome: "Tinta Primer Anticorrosiva", atual: 18, minimo: 15 },
  { codigo: "CP-3011", nome: "Rolamento Blindado 6204-2RS", atual: 15, minimo: 100 },
  { codigo: "CP-3045", nome: "Parafuso Sextavado M8x30", atual: 620, minimo: 300 },
  { codigo: "CP-3050", nome: "Porca Sextavada M8", atual: 540, minimo: 300 },
  { codigo: "CP-3055", nome: "Arruela de Pressão M8", atual: 710, minimo: 300 },
  { codigo: "CP-3070", nome: "Anel de Vedação Viton", atual: 60, minimo: 40 },
  { codigo: "EM-5012", nome: "Caixa Papelão Duplo 40x30x30", atual: 310, minimo: 250 },
  { codigo: "EM-5020", nome: "Tambor Metálico Vazio 200L", atual: 22, minimo: 15 },
  { codigo: "EM-5030", nome: "Lacre de Segurança Industrial", atual: 8, minimo: 50 },
  { codigo: "CS-7023", nome: "Óleo Lubrificante ISO VG 68", atual: 2, minimo: 5 },
  { codigo: "CS-7040", nome: "Solda Eletrodo E6013", atual: 130, minimo: 80 },
];

// Categorias — label, ícone (FontAwesome) usado nos filtros
const CATEGORIES = {
  chapas:     { label: "Corte e Chapas",       icon: "fa-solid fa-scissors" },
  usinados:   { label: "Usinados",             icon: "fa-solid fa-gear" },
  conexoes:   { label: "Conexões",             icon: "fa-solid fa-link" },
  fixacao:    { label: "Fixação",              icon: "fa-solid fa-screwdriver" },
  estrutural: { label: "Estrutural",           icon: "fa-solid fa-building" },
  embalagem:  { label: "Embalagem Industrial", icon: "fa-solid fa-box" },
  pneus:      { label: "Pneus e Borracha",     icon: "fa-solid fa-circle-notch" },
};

// Definição de "Receitas" de Produção — cada uma com uma foto real representando o insumo/produto
// qty agora em número + unidade, para conseguirmos comparar com o estoque
const RECIPES = [
  {
    id: "chapa-01",
    nome: "Chapa de Aço Carbono Cortada",
    descricao: "Corte a laser sob medida para estruturas metálicas",
    categoria: "chapas",
    imagem: "https://images.pexels.com/photos/8940223/pexels-photo-8940223.jpeg?auto=compress&cs=tinysrgb&w=600",
    ingredients: [
      { codigo: "MP-1050", qty: 1,    unidade: "un", label: "Chapa de Aço Carbono 10mm" },
      { codigo: "CS-7040", qty: 0.3,  unidade: "kg", label: "Solda de Acabamento" },
    ]
  },
  {
    id: "flange-01",
    nome: "Flange Industrial ø50mm",
    descricao: "Peça de conexão em aço inox para tubulações",
    categoria: "conexoes",
    imagem: "https://m.media-amazon.com/images/I/51RFJvy25EL._AC_UF894,1000_QL80_.jpg",
    ingredients: [
      { codigo: "MP-1042", qty: 5, unidade: "kg", label: "Chapa Inox 304" },
      { codigo: "CP-3045", qty: 4, unidade: "un", label: "Parafusos de Fixação" },
      { codigo: "CP-3070", qty: 1, unidade: "un", label: "Anel de Vedação" },
    ]
  },
  {
    id: "engrenagem-01",
    nome: "Engrenagem Usinada Z40",
    descricao: "Componente de transmissão em bronze usinado",
    categoria: "usinados",
    imagem: "https://www.policompcomponentes.com.br/content/images/1fecf3cc1c54531455341db57cd103a3.png",
    ingredients: [
      { codigo: "MP-1120", qty: 2,   unidade: "kg", label: "Barra de Bronze TM23" },
      { codigo: "CS-7023", qty: 0.5, unidade: "L",  label: "Óleo de Usinagem" },
    ]
  },
  {
    id: "rolamento-01",
    nome: "Mancal com Rolamento Blindado",
    descricao: "Conjunto de apoio para eixos em alta rotação",
    categoria: "usinados",
    imagem: "https://kohlerpneus.com.br/images/rolamentos/mancais-snt.png",
    ingredients: [
      { codigo: "CP-3011", qty: 100, unidade: "un", label: "Rolamento Blindado 6204-2RS" },
      { codigo: "MP-1120", qty: 1,   unidade: "kg", label: "Barra de Bronze TM23" },
    ]
  },
  {
    id: "parafusaria-01",
    nome: "Kit Parafusaria Sextavada M8",
    descricao: "Conjunto padronizado de fixação para montagem",
    categoria: "fixacao",
    imagem: "https://http2.mlstatic.com/D_NQ_NP_862287-MLB90049153639_082025-O-kit-10-parafusos-meia-rosca--parcial-sextavado-inox-m840mm.webp",
    ingredients: [
      { codigo: "CP-3045", qty: 20, unidade: "un", label: "Parafuso Sextavado M8x30" },
      { codigo: "CP-3050", qty: 20, unidade: "un", label: "Porca Sextavada M8" },
      { codigo: "CP-3055", qty: 20, unidade: "un", label: "Arruela de Pressão M8" },
    ]
  },
  {
    id: "perfil-01",
    nome: "Suporte Estrutural Perfil U",
    descricao: "Estrutura galvanizada para fixação de equipamentos",
    categoria: "estrutural",
    imagem: "https://www.paulisteel.com.br/blog/wp-content/uploads/2025/04/218909fb-d901-4894-a066-2fa8882af140.jpg",
    ingredients: [
      { codigo: "MP-1135", qty: 3,   unidade: "m",  label: "Perfil U Aço Galvanizado" },
      { codigo: "MP-1140", qty: 0.2, unidade: "L",  label: "Primer Anticorrosivo" },
      { codigo: "CP-3045", qty: 6,   unidade: "un", label: "Parafusos de Fixação" },
    ]
  },
  {
    id: "tambor-01",
    nome: "Tambor Metálico 200L Lacrado",
    descricao: "Envase e lacre para transporte de insumos líquidos",
    categoria: "embalagem",
    imagem: "https://images.pexels.com/photos/615670/pexels-photo-615670.jpeg?auto=compress&cs=tinysrgb&w=600",
    ingredients: [
      { codigo: "EM-5020", qty: 1, unidade: "un", label: "Tambor Metálico Vazio" },
      { codigo: "EM-5030", qty: 2, unidade: "un", label: "Lacre de Segurança" },
    ]
  },
  {
    id: "pneu-01",
    nome: "Pneu de Carga HeavyDuty",
    descricao: "Produção de pneu reforçado para caminhões",
    categoria: "pneus",
    imagem: "https://www.acheipneus.com.br/media/catalog/product/p/n/pneu-155r12-sunset-over-cargo-b3-8886q-8pr-1.png",
    ingredients: [
      { codigo: "MP-1088", qty: 50, unidade: "kg", label: "Borracha ABS/Polímero" },
      { codigo: "MP-1042", qty: 10, unidade: "kg", label: "Reforço de Aço" },
      { codigo: "CS-7023", qty: 2,  unidade: "L",  label: "Lubrificante de Molde" },
    ]
  },
  {
    id: "caixa-01",
    nome: "Kit de Embalagem Premium",
    descricao: "Conjunto de proteção reforçada para envio",
    categoria: "embalagem",
    imagem: "https://images.pexels.com/photos/6169028/pexels-photo-6169028.jpeg?auto=compress&cs=tinysrgb&w=600",
    ingredients: [
      { codigo: "EM-5012", qty: 1,   unidade: "un",  label: "Caixa de Papelão" },
      { codigo: "MP-1102", qty: 100, unidade: "ml",  label: "Resina de Selagem" },
    ]
  }
];

/* ---------------------------------------------------------------
   Regras de disponibilidade
   - Se estoque atual <= 0               → indisponível (zerado)
   - Se estoque atual < quantidade req.  → indisponível (insuficiente)
   - Se estoque atual <= mínimo          → disponível, mas com aviso "abaixo do mínimo"
   --------------------------------------------------------------- */
function stockFor(codigo) {
  return MOCK_STOCK.find(s => s.codigo === codigo);
}

function ingredientStatus(ing) {
  const item = stockFor(ing.codigo);
  if (!item) return { disponivel: false, motivo: "Item não cadastrado no estoque" };
  if (item.atual <= 0) return { disponivel: false, motivo: "Estoque zerado" };
  if (item.atual < ing.qty) {
    return {
      disponivel: false,
      motivo: `Estoque insuficiente — restam ${item.atual} ${ing.unidade}, precisa ${ing.qty}`
    };
  }
  const baixo = item.atual <= item.minimo;
  return {
    disponivel: true,
    baixoMinimo: baixo,
    motivo: baixo ? `Abaixo do mínimo (mín. ${item.minimo})` : null
  };
}

function availabilitySummary(recipe) {
  const total = recipe.ingredients.length;
  const disponiveis = recipe.ingredients.filter(ing => ingredientStatus(ing).disponivel).length;
  const faltando = total - disponiveis;
  return {
    total,
    disponiveis,
    faltando,
    pronto: faltando === 0,
    bloqueado: disponiveis === 0
  };
}

function statusInfo({ total, disponiveis, faltando, pronto, bloqueado }) {
  if (pronto) {
    return { cls: "ready", icon: "fa-solid fa-circle-check", text: "Pronto para produção" };
  }
  if (bloqueado) {
    return { cls: "blocked", icon: "fa-solid fa-circle-xmark", text: `Bloqueado · ${faltando} insumo${faltando > 1 ? 's' : ''} em falta` };
  }
  return { cls: "partial", icon: "fa-solid fa-triangle-exclamation", text: `Parcial · ${faltando} insumo${faltando > 1 ? 's' : ''} em falta` };
}

function renderSummary() {
  const el = document.getElementById('pageSummary');
  if (!el) return;
  const prontos = RECIPES.filter(r => availabilitySummary(r).pronto).length;
  el.innerHTML = `
    <span class="dot"><i class="fa-solid fa-circle-check"></i></span>
    ${prontos} de ${RECIPES.length} receitas prontas para produção
  `;
}

function renderFilters() {
  const bar = document.getElementById('filterBar');
  if (!bar) return;

  const countFor = key => key === 'todas' ? RECIPES.length : RECIPES.filter(r => r.categoria === key).length;

  const chips = [
    `<button class="filter-chip active" data-categoria="todas">
      <i class="fa-solid fa-grip"></i> Todas <span class="count">${countFor('todas')}</span>
    </button>`
  ];
  Object.entries(CATEGORIES).forEach(([key, cat]) => {
    chips.push(`
      <button class="filter-chip" data-categoria="${key}">
        <i class="${cat.icon}"></i> ${cat.label} <span class="count">${countFor(key)}</span>
      </button>
    `);
  });
  bar.innerHTML = chips.join('');

  bar.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      bar.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      renderRecipes(chip.dataset.categoria);
    });
  });
}

function renderRecipes(filtro = "todas") {
  const grid = document.getElementById('recipeGrid');
  if (!grid) return;

  const lista = filtro === "todas" ? RECIPES : RECIPES.filter(r => r.categoria === filtro);
  const cat = key => CATEGORIES[key];

  grid.innerHTML = lista.map(recipe => {
    const summary = availabilitySummary(recipe);
    const status = statusInfo(summary);
    return `
    <div class="recipe-card" data-cat="${recipe.categoria}" tabindex="0" role="button"
         aria-label="Ver detalhes de ${recipe.nome}"
         onclick="openRecipeModal('${recipe.id}')"
         onkeydown="if(event.key==='Enter'){openRecipeModal('${recipe.id}')}">
      <div class="recipe-image">
        <img src="${recipe.imagem}" alt="${recipe.nome}" loading="lazy" />
        <span class="category-tag cat-${recipe.categoria}">${cat(recipe.categoria).label}</span>
      </div>
      <div class="recipe-body">
        <h3>${recipe.nome}</h3>
        <p>${recipe.descricao}</p>
        <div class="insumo-meta"><i class="fa-solid fa-list-ul"></i> ${summary.total} insumo${summary.total > 1 ? 's' : ''}</div>
      </div>
      <div class="status-footer ${status.cls}">
        <i class="${status.icon}"></i> ${status.text}
      </div>
    </div>
  `;
  }).join('') || `
    <div class="empty-state">
      <i class="fa-solid fa-box-open"></i>
      <span>Nenhuma receita cadastrada nessa categoria.</span>
    </div>
  `;
}

function openRecipeModal(recipeId) {
  const recipe = RECIPES.find(r => r.id === recipeId);
  if (!recipe) return;

  document.getElementById('modalTitle').textContent = recipe.nome;
  document.getElementById('modalSubtitle').textContent = recipe.descricao;
  document.getElementById('modalImage').src = recipe.imagem;
  document.getElementById('modalImage').alt = recipe.nome;

  const summary = availabilitySummary(recipe);
  const pct = Math.round((summary.disponiveis / summary.total) * 100);
  const fill = document.getElementById('modalProgressFill');
  fill.style.width = `${pct}%`;
  fill.style.background = summary.pronto ? 'var(--green)' : (summary.bloqueado ? 'var(--red)' : 'var(--amber)');
  document.getElementById('modalProgressLabel').textContent = `${summary.disponiveis}/${summary.total} disponíveis`;

  // insumos indisponíveis aparecem primeiro, para chamar atenção do que falta
  const ordenados = [...recipe.ingredients].sort((a, b) => {
    const aOk = ingredientStatus(a).disponivel;
    const bOk = ingredientStatus(b).disponivel;
    return (aOk === bOk) ? 0 : (aOk ? 1 : -1);
  });

  const listEl = document.getElementById('ingredientList');
  listEl.innerHTML = ordenados.map(ing => {
    const st = ingredientStatus(ing);
    const aviso = !st.disponivel
      ? `<small class="low-stock-warning"><i class="fa-solid fa-triangle-exclamation"></i> ${st.motivo}</small>`
      : (st.baixoMinimo ? `<small class="low-stock-warning"><i class="fa-solid fa-triangle-exclamation"></i> ${st.motivo}</small>` : '');

    return `
      <div class="ingredient-item ${st.disponivel ? '' : 'unavailable'}">
        <div class="ingredient-name">
          <div>
            <div>${ing.label} <small class="codigo-tag">${ing.codigo}</small></div>
            ${aviso}
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:12px;">
          <span class="ingredient-qty">${ing.qty} ${ing.unidade}</span>
          <span class="availability-badge ${st.disponivel ? 'avail-yes' : 'avail-no'}">
            ${st.disponivel ? 'Disponível' : 'Em falta'}
          </span>
        </div>
      </div>
    `;
  }).join('');

  document.getElementById('recipeModal').classList.add('active');
}

function closeRecipeModal() {
  document.getElementById('recipeModal').classList.remove('active');
}

document.addEventListener('DOMContentLoaded', () => {
  renderSummary();
  renderFilters();
  renderRecipes();
});