/* ================================================================
   SISTEMA DE CONTROLE DE ESTOQUE - PRODUTO 2 (Martelo de Unha)
   Movimentações de ENTRADA e SAÍDA com valores digitados.
   ================================================================ */

const STOCK_KEY_PREFIX = 'stocklog_product_qty_';

function getProductId() {
  return document.body.getAttribute('data-product-id');
}

function getStockValue(productId) {
  const val = localStorage.getItem(STOCK_KEY_PREFIX + productId);
  return val ? parseInt(val, 10) : 52; // Valor padrão inicial
}

function setStockValue(productId, value) {
  localStorage.setItem(STOCK_KEY_PREFIX + productId, value.toString());
}

function updateQtyDisplay(value) {
  const qtyEl = document.getElementById('qtyValue');
  if (qtyEl) qtyEl.textContent = value;

  const badge = document.getElementById('statusBadge');
  if (!badge) return;

  badge.classList.remove('ok', 'baixo', 'critico');

  if (value <= 0) {
    badge.classList.add('critico');
    badge.innerHTML = '<i class="fas fa-circle-xmark"></i> Sem estoque';
  } else if (value < 20) {
    badge.classList.add('critico');
    badge.innerHTML = '<i class="fas fa-triangle-exclamation"></i> Estoque crítico';
  } else if (value < 50) {
    badge.classList.add('baixo');
    badge.innerHTML = '<i class="fas fa-triangle-exclamation"></i> Estoque baixo';
  } else {
    badge.classList.add('ok');
    badge.innerHTML = '<i class="fas fa-circle-check"></i> Estoque normal';
  }
}

function showFeedback(elementId, message) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = message;
  el.style.opacity = '1';

  clearTimeout(el._timeout);
  el._timeout = setTimeout(() => {
    el.style.opacity = '0';
  }, 2200);
}

function lerQuantidade(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return null;

  const raw = input.value.replace(/\D/g, '');
  if (raw === '') return null;

  const n = parseInt(raw, 10);
  if (isNaN(n) || n <= 0) return null;
  return n;
}

function registrarEntrada() {
  const productId = getProductId();
  if (!productId) return;

  const qtd = lerQuantidade('entradaInput');
  const input = document.getElementById('entradaInput');

  if (!qtd) {
    showFeedback('entradaFeedback', 'Digite uma quantidade válida.');
    return;
  }

  const atual = getStockValue(productId);
  const novo = atual + qtd;

  setStockValue(productId, novo);
  updateQtyDisplay(novo);
  input.value = '';
  showFeedback('entradaFeedback', `+${qtd} adicionado · total: ${novo}`);
}

function registrarSaida() {
  const productId = getProductId();
  if (!productId) return;

  const qtd = lerQuantidade('saidaInput');
  const input = document.getElementById('saidaInput');

  if (!qtd) {
    showFeedback('saidaFeedback', 'Digite uma quantidade válida.');
    return;
  }

  const atual = getStockValue(productId);
  if (qtd > atual) {
    showFeedback('saidaFeedback', `Estoque insuficiente (disponível: ${atual})`);
    return;
  }

  const novo = atual - qtd;
  setStockValue(productId, novo);
  updateQtyDisplay(novo);
  input.value = '';
  showFeedback('saidaFeedback', `-${qtd} retirado · total: ${novo}`);
}

function init() {
  const productId = getProductId();
  if (!productId) {
    console.error('ID do produto não encontrado (data-product-id).');
    return;
  }

  const atual = getStockValue(productId);
  updateQtyDisplay(atual);

  const entradaInput = document.getElementById('entradaInput');
  const saidaInput = document.getElementById('saidaInput');

  if (entradaInput) {
    entradaInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        registrarEntrada();
      }
    });
  }

  if (saidaInput) {
    saidaInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        registrarSaida();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', init);