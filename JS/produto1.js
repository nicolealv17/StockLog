/* ================================================================
   SISTEMA DE CONTROLE DE ESTOQUE - PÁGINAS DE PRODUTO
   Este arquivo é compartilhado por produto1.html, produto2.html, etc.
   ================================================================ */

// Chave para persistência do estoque de produtos específicos
const STOCK_KEY_PREFIX = 'stocklog_product_qty_';

// Mapeamento de IDs para Nomes/Códigos (Sincronizado com itens.js)
const PRODUCT_MAP = {
  'produto1': { nome: 'Arduino Uno R3', codigo: 'MP-1042' },
  'produto2': { nome: 'Produto 2', codigo: 'MP-1050' },
  'produto3': { nome: 'Produto 3', codigo: 'MP-1088' },
  'produto4': { nome: 'Produto 4', codigo: 'MP-1102' },
};

function getProductId() {
  return document.body.getAttribute('data-product-id');
}

function getStockValue(productId) {
  const val = localStorage.getItem(STOCK_KEY_PREFIX + productId);
  return val ? parseInt(val) : 50; // Valor padrão 50 se não existir
}

function setStockValue(productId, value) {
  localStorage.setItem(STOCK_KEY_PREFIX + productId, value.toString());
}

function updateQtyDisplay(value) {
  const qtyEl = document.querySelector('.qty-box .value');
  if (qtyEl) {
    qtyEl.textContent = value + ' un.';
  }
}

function changeStock(delta) {
  const productId = getProductId();
  if (!productId) return;

  let currentQty = getStockValue(productId);
  let newQty = Math.max(0, currentQty + delta);

  setStockValue(productId, newQty);
  updateQtyDisplay(newQty);

  // Opcional: Mostrar um pequeno toast ou feedback visual
  console.log(`Estoque de ${productId} atualizado para ${newQty}`);
}

function init() {
  const productId = getProductId();
  if (!productId) {
    console.error('ID do produto não encontrado no corpo da página (data-product-id).');
    return;
  }

  const currentQty = getStockValue(productId);
  updateQtyDisplay(currentQty);
}

document.addEventListener('DOMContentLoaded', init);
