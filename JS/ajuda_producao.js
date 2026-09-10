// Mock de itens em estoque (Simulando a base de dados de itens.js)
const MOCK_STOCK = [
  { codigo: "MP-1042", nome: "Chapa de Aço Inox 304", atual: 450, minimo: 200 },
  { codigo: "MP-1088", nome: "Polímero ABS Virgem", atual: 80, minimo: 150 },
  { codigo: "CP-3011", nome: "Rolamento Blindado 6204-2RS", atual: 15, minimo: 100 },
  { codigo: "CP-3045", nome: "Parafuso Sextavado M8x30", atual: 620, minimo: 300 },
  { codigo: "EM-5012", nome: "Caixa Papelão Duplo 40x30x30", atual: 310, minimo: 250 },
  { codigo: "CS-7023", nome: "Óleo Lubrificante ISO VG 68", atual: 2, minimo: 5 },
  { codigo: "MP-1102", nome: "Resina Epóxi Industrial", atual: 5, minimo: 20 },
];

// Definição de "Receitas" de Produção
const RECIPES = [
  {
    id: "pneu-01",
    nome: "Pneu de Carga HeavyDuty",
    descricao: "Produção de pneu reforçado para caminhões",
    icon: "fa-circle-notch",
    ingredients: [
      { codigo: "MP-1088", qty: "50kg", label: "Borracha ABS/Polímero" },
      { codigo: "MP-1042", qty: "10kg", label: "Reforço de Aço" },
      { codigo: "CS-7023", qty: "2L", label: "Lubrificante de Molde" },
    ]
  },
  {
    id: "flange-01",
    nome: "Flange Industrial ø50mm",
    descricao: "Peça de conexão em aço inox",
    icon: "fa-ring",
    ingredients: [
      { codigo: "MP-1042", qty: "5kg", label: "Chapa Inox 304" },
      { codigo: "CP-3045", qty: "4 un", label: "Parafusos de Fixação" },
    ]
  },
  {
    id: "caixa-01",
    nome: "Kit de Embalagem Premium",
    descricao: "Conjunto de proteção para envio",
    icon: "fa-box",
    ingredients: [
      { codigo: "EM-5012", qty: "1 un", label: "Caixa de Papelão" },
      { codigo: "MP-1102", qty: "100ml", label: "Resina de Selagem" },
    ]
  }
];

function renderRecipes() {
  const grid = document.getElementById('recipeGrid');
  if (!grid) return;

  grid.innerHTML = RECIPES.map(recipe => `
    <div class="recipe-card" onclick="openRecipeModal('${recipe.id}')">
      <div class="recipe-icon">
        <i class="fas ${recipe.icon}"></i>
      </div>
      <div class="recipe-info">
        <h3>${recipe.nome}</h3>
        <p>${recipe.descricao}</p>
      </div>
    </div>
  `).join('');
}

function openRecipeModal(recipeId) {
  const recipe = RECIPES.find(r => r.id === recipeId);
  if (!recipe) return;

  document.getElementById('modalTitle').innerHTML = `<i class="fas ${recipe.icon}"></i> ${recipe.nome}`;

  const listEl = document.getElementById('ingredientList');
  listEl.innerHTML = recipe.ingredients.map(ing => {
    const stockItem = MOCK_STOCK.find(s => s.codigo === ing.codigo);
    const isAvailable = stockItem && stockItem.atual > 0;

    return `
      <div class="ingredient-item">
        <div class="ingredient-name">
          <i class="fas ${isAvailable ? 'fa-circle-check' : 'fa-circle-exclamation'}" style="color: ${isAvailable ? 'var(--green)' : 'var(--red)'}"></i>
          ${ing.label} <small style="color:var(--text-muted)">(${ing.codigo})</small>
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

document.addEventListener('DOMContentLoaded', renderRecipes);
