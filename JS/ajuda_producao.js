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

// Categorias (usadas para a cor do rótulo, não para ícones)
const CATEGORIES = {
  chapas:     { label: "Corte e Chapas" },
  usinados:   { label: "Usinados" },
  conexoes:   { label: "Conexões" },
  fixacao:    { label: "Fixação" },
  estrutural: { label: "Estrutural" },
  embalagem:  { label: "Embalagem Industrial" },
  pneus:      { label: "Pneus e Borracha" },
};

// Definição de "Receitas" de Produção — cada uma com uma foto real representando o insumo/produto
const RECIPES = [
  {
    id: "chapa-01",
    nome: "Chapa de Aço Carbono Cortada",
    descricao: "Corte a laser sob medida para estruturas metálicas",
    categoria: "chapas",
    imagem: "https://images.pexels.com/photos/8940223/pexels-photo-8940223.jpeg?auto=compress&cs=tinysrgb&w=600",
    ingredients: [
      { codigo: "MP-1050", qty: "1 un", label: "Chapa de Aço Carbono 10mm" },
      { codigo: "CS-7040", qty: "0.3kg", label: "Solda de Acabamento" },
    ]
  },
  {
    id: "flange-01",
    nome: "Flange Industrial ø50mm",
    descricao: "Peça de conexão em aço inox para tubulações",
    categoria: "conexoes",
    imagem: "https://images.pexels.com/photos/36325392/pexels-photo-36325392.jpeg?auto=compress&cs=tinysrgb&w=600",
    ingredients: [
      { codigo: "MP-1042", qty: "5kg", label: "Chapa Inox 304" },
      { codigo: "CP-3045", qty: "4 un", label: "Parafusos de Fixação" },
      { codigo: "CP-3070", qty: "1 un", label: "Anel de Vedação" },
    ]
  },
  {
    id: "engrenagem-01",
    nome: "Engrenagem Usinada Z40",
    descricao: "Componente de transmissão em bronze usinado",
    categoria: "usinados",
    imagem: "https://images.pexels.com/photos/9579221/pexels-photo-9579221.jpeg?auto=compress&cs=tinysrgb&w=600",
    ingredients: [
      { codigo: "MP-1120", qty: "2kg", label: "Barra de Bronze TM23" },
      { codigo: "CS-7023", qty: "0.5L", label: "Óleo de Usinagem" },
    ]
  },
  {
    id: "parafusaria-01",
    nome: "Kit Parafusaria Sextavada M8",
    descricao: "Conjunto padronizado de fixação para montagem",
    categoria: "fixacao",
    imagem: "https://images.pexels.com/photos/28119514/pexels-photo-28119514.jpeg?auto=compress&cs=tinysrgb&w=600",
    ingredients: [
      { codigo: "CP-3045", qty: "20 un", label: "Parafuso Sextavado M8x30" },
      { codigo: "CP-3050", qty: "20 un", label: "Porca Sextavada M8" },
      { codigo: "CP-3055", qty: "20 un", label: "Arruela de Pressão M8" },
    ]
  },
  {
    id: "perfil-01",
    nome: "Suporte Estrutural Perfil U",
    descricao: "Estrutura galvanizada para fixação de equipamentos",
    categoria: "estrutural",
    imagem: "https://images.pexels.com/photos/36003978/pexels-photo-36003978.jpeg?auto=compress&cs=tinysrgb&w=600",
    ingredients: [
      { codigo: "MP-1135", qty: "3m", label: "Perfil U Aço Galvanizado" },
      { codigo: "MP-1140", qty: "0.2L", label: "Primer Anticorrosivo" },
      { codigo: "CP-3045", qty: "6 un", label: "Parafusos de Fixação" },
    ]
  },
  {
    id: "tambor-01",
    nome: "Tambor Metálico 200L Lacrado",
    descricao: "Envase e lacre para transporte de insumos líquidos",
    categoria: "embalagem",
    imagem: "https://images.pexels.com/photos/615670/pexels-photo-615670.jpeg?auto=compress&cs=tinysrgb&w=600",
    ingredients: [
      { codigo: "EM-5020", qty: "1 un", label: "Tambor Metálico Vazio" },
      { codigo: "EM-5030", qty: "2 un", label: "Lacre de Segurança" },
    ]
  },
  {
    id: "pneu-01",
    nome: "Pneu de Carga HeavyDuty",
    descricao: "Produção de pneu reforçado para caminhões",
    categoria: "pneus",
    imagem: "https://images.pexels.com/photos/33653651/pexels-photo-33653651.jpeg?auto=compress&cs=tinysrgb&w=600",
    ingredients: [
      { codigo: "MP-1088", qty: "50kg", label: "Borracha ABS/Polímero" },
      { codigo: "MP-1042", qty: "10kg", label: "Reforço de Aço" },
      { codigo: "CS-7023", qty: "2L", label: "Lubrificante de Molde" },
    ]
  },
  {
    id: "caixa-01",
    nome: "Kit de Embalagem Premium",
    descricao: "Conjunto de proteção reforçada para envio",
    categoria: "embalagem",
    imagem: "https://images.pexels.com/photos/6169028/pexels-photo-6169028.jpeg?auto=compress&cs=tinysrgb&w=600",
    ingredients: [
      { codigo: "EM-5012", qty: "1 un", label: "Caixa de Papelão" },
      { codigo: "MP-1102", qty: "100ml", label: "Resina de Selagem" },
    ]
  }
];

function renderStats() {
  const totalReceitas = RECIPES.length;
  const codigosUnicos = new Set(RECIPES.flatMap(r => r.ingredients.map(i => i.codigo)));
  let alertas = 0;
  codigosUnicos.forEach(codigo => {
    const item = MOCK_STOCK.find(s => s.codigo === codigo);
    if (item && item.atual <= item.minimo) alertas++;
  });

  document.getElementById('statReceitas').textContent = totalReceitas;
  document.getElementById('statInsumos').textContent = codigosUnicos.size;
  document.getElementById('statAlertas').textContent = alertas;
}

function renderFilters() {
  const bar = document.getElementById('filterBar');
  if (!bar) return;

  const chips = [`<button class="filter-chip active" data-categoria="todas">Todas</button>`];
  Object.entries(CATEGORIES).forEach(([key, cat]) => {
    chips.push(`<button class="filter-chip" data-categoria="${key}">${cat.label}</button>`);
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

function availabilitySummary(recipe) {
  const total = recipe.ingredients.length;
  const disponiveis = recipe.ingredients.filter(ing => {
    const item = MOCK_STOCK.find(s => s.codigo === ing.codigo);
    return item && item.atual > 0;
  }).length;
  return { total, disponiveis, pronto: disponiveis === total };
}

function renderRecipes(filtro = "todas") {
  const grid = document.getElementById('recipeGrid');
  if (!grid) return;

  const lista = filtro === "todas" ? RECIPES : RECIPES.filter(r => r.categoria === filtro);
  const cat = key => CATEGORIES[key];

  grid.innerHTML = lista.map(recipe => {
    const { total, disponiveis, pronto } = availabilitySummary(recipe);
    return `
    <div class="recipe-card" data-cat="${recipe.categoria}" onclick="openRecipeModal('${recipe.id}')">
      <div class="recipe-image">
        <img src="${recipe.imagem}" alt="${recipe.nome}" loading="lazy" />
        <span class="category-tag cat-${recipe.categoria}">${cat(recipe.categoria).label}</span>
      </div>
      <div class="recipe-body">
        <h3>${recipe.nome}</h3>
        <p>${recipe.descricao}</p>
        <div class="recipe-footer">
          <span class="insumo-count">${total} insumos</span>
          <span class="availability-badge ${pronto ? 'avail-yes' : 'avail-no'}">
            ${pronto ? 'Pronto para produção' : `${disponiveis}/${total} disponíveis`}
          </span>
        </div>
      </div>
    </div>
  `;
  }).join('') || `<p class="empty-state">Nenhuma receita cadastrada nessa categoria.</p>`;
}

function openRecipeModal(recipeId) {
  const recipe = RECIPES.find(r => r.id === recipeId);
  if (!recipe) return;

  document.getElementById('modalTitle').textContent = recipe.nome;
  document.getElementById('modalSubtitle').textContent = recipe.descricao;
  document.getElementById('modalImage').src = recipe.imagem;
  document.getElementById('modalImage').alt = recipe.nome;

  const listEl = document.getElementById('ingredientList');
  listEl.innerHTML = recipe.ingredients.map(ing => {
    const stockItem = MOCK_STOCK.find(s => s.codigo === ing.codigo);
    const isAvailable = stockItem && stockItem.atual > 0;
    const isLow = stockItem && stockItem.atual <= stockItem.minimo;

    return `
      <div class="ingredient-item">
        <div class="ingredient-name">
          <div>
            <div>${ing.label} <small class="codigo-tag">${ing.codigo}</small></div>
            ${isLow ? '<small class="low-stock-warning">Abaixo do estoque mínimo</small>' : ''}
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:12px;">
          <span class="ingredient-qty">${ing.qty}</span>
          <span class="availability-badge ${isAvailable ? 'avail-yes' : 'avail-no'}">
            ${isAvailable ? 'Disponível' : 'Indisponível'}
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
  renderStats();
  renderFilters();
  renderRecipes();
});