/* ================================================================
   StockLog · JS/ajuda_producao.js
   Ajuda de Produção — disponibilidade de insumos em tempo real
   Fonte de estoque: /itens (Firebase Realtime Database)
   ================================================================ */

// ---------- Categorias (labels/ícones) ----------
const CATEGORIES = {
  chapas:     { label: "Corte e Chapas",       icon: "fa-solid fa-scissors" },
  usinados:   { label: "Usinados",             icon: "fa-solid fa-gear" },
  conexoes:   { label: "Conexões",             icon: "fa-solid fa-link" },
  fixacao:    { label: "Fixação",              icon: "fa-solid fa-screwdriver" },
  estrutural: { label: "Estrutural",           icon: "fa-solid fa-building" },
  embalagem:  { label: "Embalagem Industrial", icon: "fa-solid fa-box" },
  pneus:      { label: "Pneus e Borracha",     icon: "fa-solid fa-circle-notch" },
};

const CATEGORY_COLORS_PDF = {
  chapas:     { text: [69, 96, 125],   bg: [233, 238, 244] },
  usinados:   { text: [109, 79, 163],  bg: [239, 233, 248] },
  conexoes:   { text: [0, 107, 179],   bg: [225, 238, 251] },
  fixacao:    { text: [196, 122, 31],  bg: [252, 243, 230] },
  estrutural: { text: [71, 88, 107],   bg: [238, 241, 244] },
  embalagem:  { text: [26, 123, 114],  bg: [230, 243, 241] },
  pneus:      { text: [90, 74, 63],    bg: [239, 236, 231] },
};

const STATUS_COLORS_PDF = {
  ready:   { text: [26, 123, 114],  bg: [230, 243, 241], label: "Pronto para produção" },
  partial: { text: [196, 122, 31],  bg: [252, 243, 230], label: "Parcial" },
  blocked: { text: [178, 67, 58],   bg: [250, 238, 237], label: "Bloqueado" },
};

const PRIMARY_PDF    = [0, 107, 179];
const TEXT_MAIN_PDF  = [10, 31, 51];
const TEXT_MUTED_PDF = [61, 95, 126];
const BORDER_PDF     = [226, 236, 246];

// =====================================================================
// RECEITAS — array original completo (imagens + ingredientes + passos)
// =====================================================================
const RECIPES = [
  {
    id: "chapa-01",
    nome: "Chapa de Aço Carbono Cortada",
    descricao: "Corte a laser sob medida para estruturas metálicas",
    categoria: "chapas",
    imagem: "https://images.pexels.com/photos/8940223/pexels-photo-8940223.jpeg?auto=compress&cs=tinysrgb&w=600",
    ingredients: [
      { codigo: "MP-1050", qty: 1,   unidade: "un", label: "Chapa de Aço Carbono 10mm" },
      { codigo: "CS-7040", qty: 0.3, unidade: "kg", label: "Solda de Acabamento" },
    ],
    steps: [
      "Verificar o programa de corte a laser e confirmar as dimensões conforme o desenho técnico.",
      "Posicionar a chapa de aço carbono 10mm na mesa da máquina de corte a laser.",
      "Executar o corte a laser seguindo o contorno programado.",
      "Rebarbar as bordas cortadas para remover rebarbas e resíduos de corte.",
      "Aplicar a solda de acabamento nos pontos indicados no desenho.",
      "Inspecionar as dimensões finais com paquímetro e liberar para a próxima etapa.",
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
    ],
    steps: [
      "Selecionar a chapa de aço inox 304 e cortar o disco base conforme o diâmetro especificado.",
      "Furar os 4 pontos de fixação na furadeira de bancada, seguindo o gabarito.",
      "Usinar o rebaixo central para encaixe do tubo de ø50mm.",
      "Instalar os parafusos de fixação nos furos usinados.",
      "Posicionar o anel de vedação Viton na ranhura central.",
      "Realizar o teste de estanqueidade e liberar a peça para expedição.",
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
    ],
    steps: [
      "Cortar a barra de bronze TM23 no comprimento necessário para o disco da engrenagem.",
      "Fixar o material no torno CNC e usinar o diâmetro externo.",
      "Aplicar óleo de usinagem durante todo o processo de corte, para resfriamento.",
      "Fresar os 40 dentes conforme o módulo especificado no desenho.",
      "Rebarbar e polir os dentes usinados.",
      "Medir o passo e o diâmetro primitivo com equipamento de metrologia.",
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
    ],
    steps: [
      "Usinar o corpo do mancal em barra de bronze TM23 conforme o desenho.",
      "Furar o alojamento central com tolerância H7 para encaixe do rolamento.",
      "Pressionar o rolamento blindado 6204-2RS no alojamento, usando prensa manual.",
      "Verificar o giro livre do rolamento após a montagem.",
      "Aplicar graxa nos pontos de lubrificação, quando aplicável.",
      "Inspecionar a folga axial e liberar o conjunto.",
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
    ],
    steps: [
      "Separar 20 unidades de cada item: parafuso M8x30, porca M8 e arruela de pressão M8.",
      "Conferir a integridade da rosca de cada parafuso e porca.",
      "Organizar os itens em kits individuais de fixação (1 parafuso + 1 porca + 1 arruela).",
      "Embalar os kits em sacos plásticos identificados com etiqueta do lote.",
      "Registrar a quantidade produzida no sistema de estoque.",
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
    ],
    steps: [
      "Cortar o perfil U galvanizado nos 3 metros necessários, conforme o desenho.",
      "Furar os pontos de fixação para os parafusos M8.",
      "Aplicar o primer anticorrosivo nas áreas de corte e furação.",
      "Aguardar a secagem do primer conforme especificação do fabricante.",
      "Montar os parafusos de fixação nos furos preparados.",
      "Inspecionar visualmente o acabamento e liberar para o estoque.",
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
    ],
    steps: [
      "Inspecionar o tambor metálico vazio quanto a amassados ou corrosão.",
      "Realizar o envase do insumo líquido conforme o volume especificado.",
      "Posicionar a tampa do tambor e alinhar com o anel de vedação.",
      "Aplicar os 2 lacres de segurança industrial na tampa.",
      "Etiquetar o tambor com os dados do lote e a data de envase.",
      "Armazenar em área designada, aguardando expedição.",
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
    ],
    steps: [
      "Pesar e preparar a mistura de borracha ABS/polímero conforme a formulação.",
      "Aplicar o reforço de aço na carcaça do pneu durante a moldagem.",
      "Lubrificar o molde com lubrificante próprio antes da prensagem.",
      "Prensar e vulcanizar o pneu no molde aquecido, pelo tempo especificado.",
      "Resfriar o pneu gradualmente após a vulcanização.",
      "Inspecionar acabamento e balanceamento, e liberar para teste de qualidade.",
    ]
  },
  {
    id: "caixa-01",
    nome: "Kit de Embalagem Premium",
    descricao: "Conjunto de proteção reforçada para envio",
    categoria: "embalagem",
    imagem: "https://images.pexels.com/photos/6169028/pexels-photo-6169028.jpeg?auto=compress&cs=tinysrgb&w=600",
    ingredients: [
      { codigo: "EM-5012", qty: 1,   unidade: "un", label: "Caixa de Papelão" },
      { codigo: "MP-1102", qty: 100, unidade: "ml", label: "Resina de Selagem" },
    ],
    steps: [
      "Montar a caixa de papelão duplo conforme as dimensões do produto a proteger.",
      "Aplicar a resina de selagem nas abas e junções da caixa.",
      "Aguardar a cura da resina conforme o tempo indicado pelo fabricante.",
      "Reforçar os cantos da caixa com fita adequada.",
      "Inspecionar a resistência da embalagem antes da liberação.",
    ]
  }
];

// =====================================================================
// ESTOQUE — espelho do Firebase (/itens)
// =====================================================================
let STOCK = [];
let stockPronto = false;

/** Normaliza string para comparação (sem acento, minúsculo). */
function normalizar(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Converte o snapshot do Firebase em array. */
function snapshotParaArray(val) {
  const out = [];
  for (const key in val) {
    const it = val[key] || {};
    out.push({
      firebaseKey: key,
      codigo: it.codigo || key || '',
      nome:   it.nome   || '',
      atual:  Number(it.atual)  || 0,
      minimo: Number(it.minimo) || 0,
    });
  }
  return out;
}

/** Busca o item do estoque pelo código (case-insensitive, trim). */
function stockFor(codigo) {
  const alvo = String(codigo || '').trim().toLowerCase();
  if (!alvo) return null;
  return STOCK.find(s =>
    String(s.codigo).trim().toLowerCase() === alvo ||
    String(s.firebaseKey).trim().toLowerCase() === alvo
  );
}

/** Fallback: busca por nome aproximado (todos os tokens precisam bater). */
function stockForNome(label) {
  const alvo = normalizar(label);
  if (!alvo) return null;

  const stopwords = new Set([
    'de','da','do','das','dos','para','com','sem','e','ou','a','o','as','os',
    'un','und','kg','l','m','ml','industrial','padrao','linha'
  ]);
  const tokens = alvo.split(' ').filter(t => t.length >= 3 && !stopwords.has(t));
  if (!tokens.length) return null;

  return STOCK.find(s => {
    const nome = normalizar(s.nome);
    return tokens.every(t => nome.includes(t));
  }) || null;
}

/**
 * Regras de disponibilidade:
 *   - atual <= 0                → indisponível (zerado)
 *   - atual < qty requisitada    → indisponível (insuficiente)
 *   - atual <= mínimo            → disponível, mas com aviso
 */
function ingredientStatus(ing) {
  // 1) tenta por código
  let item = stockFor(ing.codigo);
  let via = 'codigo';

  // 2) fallback por nome
  if (!item) {
    item = stockForNome(ing.label);
    via = item ? 'nome' : null;
  }

  if (!item) {
    return { disponivel: false, motivo: "Item não cadastrado no estoque", item: null, via: null };
  }

  const base = { item, via };

  if (item.atual <= 0) {
    return { ...base, disponivel: false, motivo: "Estoque zerado" };
  }
  if (item.atual < ing.qty) {
    return {
      ...base,
      disponivel: false,
      motivo: `Estoque insuficiente — disponível ${item.atual} ${ing.unidade}, precisa ${ing.qty}`
    };
  }
  const baixo = item.minimo > 0 && item.atual <= item.minimo;
  return {
    ...base,
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
    return { cls: "blocked", icon: "fa-solid fa-circle-xmark",
             text: `Bloqueado · ${faltando} insumo${faltando > 1 ? 's' : ''} em falta` };
  }
  return { cls: "partial", icon: "fa-solid fa-triangle-exclamation",
           text: `Parcial · ${faltando} insumo${faltando > 1 ? 's' : ''} em falta` };
}

// ---------- Render: resumo + cards ----------
function renderSummary() {
  const el = document.getElementById('pageSummary');
  if (!el) return;
  const prontos = RECIPES.filter(r => availabilitySummary(r).pronto).length;
  el.innerHTML = `
    <span class="dot"><i class="fa-solid fa-circle-check"></i></span>
    ${prontos} de ${RECIPES.length} receitas prontas para produção
  `;
}

function renderRecipes(filtro = "todas") {
  const grid = document.getElementById('recipeGrid');
  if (!grid) return;

  const lista = filtro === "todas" ? RECIPES : RECIPES.filter(r => r.categoria === filtro);
  const cat = key => CATEGORIES[key] || { label: key };

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

// ---------- Modal ----------
let currentModalRecipeId = null;

function openRecipeModal(recipeId) {
  const recipe = RECIPES.find(r => r.id === recipeId);
  if (!recipe) return;
  currentModalRecipeId = recipeId;

  document.getElementById('modalTitle').textContent = recipe.nome;
  document.getElementById('modalSubtitle').textContent = recipe.descricao;
  document.getElementById('modalImage').src = recipe.imagem;
  document.getElementById('modalImage').alt = recipe.nome;

  const summary = availabilitySummary(recipe);
  const pct = summary.total ? Math.round((summary.disponiveis / summary.total) * 100) : 0;
  const fill = document.getElementById('modalProgressFill');
  fill.style.width = `${pct}%`;
  fill.style.background = summary.pronto ? 'var(--green)' : (summary.bloqueado ? 'var(--red)' : 'var(--amber)');
  document.getElementById('modalProgressLabel').textContent = `${summary.disponiveis}/${summary.total} disponíveis`;

  const ordenados = [...recipe.ingredients].sort((a, b) => {
    const aOk = ingredientStatus(a).disponivel;
    const bOk = ingredientStatus(b).disponivel;
    return (aOk === bOk) ? 0 : (aOk ? 1 : -1);
  });

  const listEl = document.getElementById('ingredientList');
  listEl.innerHTML = ordenados.map(ing => {
    const st = ingredientStatus(ing);
    const aviso = st.motivo
      ? `<small class="low-stock-warning"><i class="fa-solid fa-triangle-exclamation"></i> ${st.motivo}</small>`
      : '';

    const matchInfo = (st.via === 'nome' && st.item)
      ? `<small class="codigo-tag" style="margin-left:6px;opacity:.75;">(estoque: ${st.item.codigo})</small>`
      : '';

    return `
      <div class="ingredient-item ${st.disponivel ? '' : 'unavailable'}">
        <div class="ingredient-name">
          <div>
            <div>${ing.label} <small class="codigo-tag">${ing.codigo}</small>${matchInfo}</div>
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

  const stepsEl = document.getElementById('stepsList');
  if (stepsEl) {
    const steps = recipe.steps || [];
    stepsEl.innerHTML = steps.map((texto, i) => `
      <div class="step-item">
        <span class="step-number">${i + 1}</span>
        <span class="step-text">${texto}</span>
      </div>
    `).join('');
  }

  document.getElementById('recipeModal').classList.add('active');
}

function closeRecipeModal() {
  document.getElementById('recipeModal').classList.remove('active');
  currentModalRecipeId = null;
}

// =====================================================================
// Geração de PDF
// =====================================================================
async function loadImageAsDataURL(url) {
  try {
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    return null;
  }
}

async function generatePDF(recipeId) {
  const btn = document.getElementById('downloadPdfBtn');
  const recipe = RECIPES.find(r => r.id === recipeId);
  if (!recipe || !window.jspdf) return;

  const originalBtnHtml = btn ? btn.innerHTML : null;
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Gerando PDF...';
  }

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 15;
    const contentWidth = pageWidth - marginX * 2;
    const bottomLimit = pageHeight - 22;

    const catInfo = CATEGORIES[recipe.categoria];
    const summary = availabilitySummary(recipe);
    const status = summary.pronto ? "ready" : (summary.bloqueado ? "blocked" : "partial");
    const statusColor = STATUS_COLORS_PDF[status];

    const now = new Date();
    const dataEmissao = now.toLocaleDateString("pt-BR");
    const horaEmissao = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const codigoDoc = `POP-${recipe.id.toUpperCase()}`;
    const revisao = "02";

    let y = 0;
    const imgDataUrl = await loadImageAsDataURL(recipe.imagem);

    function drawHeader() {
      doc.setFillColor(...PRIMARY_PDF);
      doc.rect(0, 0, pageWidth, 28, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("STOCKLOG", marginX, 12);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.text("Sistema Integrado de Gestão de Estoque, Produção e Logística", marginX, 18);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("PROCEDIMENTO OPERACIONAL PADRÃO", pageWidth - marginX, 11, { align: "right" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.text(`Código: ${codigoDoc}`, pageWidth - marginX, 17, { align: "right" });
      doc.text(`Revisão: ${revisao}`, pageWidth - marginX, 21, { align: "right" });

      y = 36;
    }

    function drawFooter(pageNum, totalPages) {
      doc.setDrawColor(...BORDER_PDF);
      doc.setLineWidth(0.3);
      doc.line(marginX, pageHeight - 16, pageWidth - marginX, pageHeight - 16);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...TEXT_MUTED_PDF);

      const footerY = pageHeight - 13;
      const colWidth = contentWidth / 3;

      doc.text("Elaboração: José Correia", marginX, footerY);
      doc.text("Aprovação: José Correia", marginX + colWidth, footerY);
      doc.text(`Data: ${dataEmissao}`, marginX + colWidth * 2, footerY);

      doc.setFontSize(6.5);
      doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth - marginX, footerY, { align: "right" });
    }

    function checkPageBreak(neededHeight) {
      if (y + neededHeight > bottomLimit) {
        doc.addPage();
        drawHeader();
      }
    }

    function sectionTitle(text) {
      checkPageBreak(14);
      doc.setFillColor(...PRIMARY_PDF);
      doc.rect(marginX, y, 3, 6, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...TEXT_MAIN_PDF);
      doc.text(text, marginX + 6, y + 5);
      y += 12;
    }

    function drawInfoTable(rows, startY, col1Width = 38) {
      const rowHeight = 7.5;
      const col2Width = contentWidth - col1Width;

      rows.forEach((row, i) => {
        const rowY = startY + i * rowHeight;

        doc.setFillColor(...BORDER_PDF);
        doc.rect(marginX, rowY, col1Width, rowHeight, "F");
        doc.setDrawColor(...BORDER_PDF);
        doc.setLineWidth(0.2);
        doc.rect(marginX, rowY, col1Width, rowHeight, "S");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...TEXT_MAIN_PDF);
        doc.text(row.label, marginX + 2.5, rowY + 5);

        doc.setFillColor(255, 255, 255);
        doc.rect(marginX + col1Width, rowY, col2Width, rowHeight, "F");
        doc.rect(marginX + col1Width, rowY, col2Width, rowHeight, "S");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...TEXT_MUTED_PDF);
        doc.text(row.value, marginX + col1Width + 2.5, rowY + 5);
      });

      return startY + rows.length * rowHeight;
    }

    drawHeader();

    const identificacaoRows = [
      { label: "Aplicação", value: recipe.nome },
      { label: "Descrição", value: recipe.descricao },
      { label: "Categoria", value: catInfo ? catInfo.label : recipe.categoria },
      { label: "Código Interno", value: recipe.id.toUpperCase() },
      { label: "Data de Emissão", value: `${dataEmissao} às ${horaEmissao}` },
      { label: "Status", value: statusColor.label },
    ];

    y = drawInfoTable(identificacaoRows, y);
    y += 6;

    if (imgDataUrl) {
      checkPageBreak(40);
      try {
        const imgW = 55, imgH = 38;
        doc.setDrawColor(...BORDER_PDF);
        doc.setLineWidth(0.3);
        doc.roundedRect(marginX, y, imgW, imgH, 2, 2, "S");
        doc.addImage(imgDataUrl, "JPEG", marginX, y, imgW, imgH, undefined, "FAST");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...TEXT_MAIN_PDF);
        doc.text("REGISTRO FOTOGRÁFICO DO PRODUTO", marginX + imgW + 6, y + 6);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(...TEXT_MUTED_PDF);
        doc.text(
          doc.splitTextToSize(
            "Imagem ilustrativa do item produzido, conforme especificação técnica.",
            contentWidth - imgW - 10
          ),
          marginX + imgW + 6,
          y + 12
        );

        y += imgH + 8;
      } catch (e) { /* segue sem imagem */ }
    }

    sectionTitle("MATERIAIS E INSUMOS NECESSÁRIOS");

    const colCodigo = marginX;
    const colInsumo = marginX + 28;
    const colQtd = marginX + 120;
    const colStatus = marginX + contentWidth - 32;

    checkPageBreak(9);
    doc.setFillColor(...PRIMARY_PDF);
    doc.rect(marginX, y, contentWidth, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text("CÓDIGO", colCodigo + 2, y + 5.3);
    doc.text("INSUMO", colInsumo, y + 5.3);
    doc.text("QTD.", colQtd, y + 5.3);
    doc.text("STATUS", colStatus, y + 5.3);
    y += 8;

    recipe.ingredients.forEach((ing, idx) => {
      const st = ingredientStatus(ing);
      const rowHasWarning = !!st.motivo;
      const rowHeight = rowHasWarning ? 12 : 8.5;

      checkPageBreak(rowHeight);

      if (idx % 2 === 1) {
        doc.setFillColor(248, 251, 253);
        doc.rect(marginX, y, contentWidth, rowHeight, "F");
      }

      doc.setDrawColor(...BORDER_PDF);
      doc.setLineWidth(0.15);
      doc.rect(marginX, y, contentWidth, rowHeight, "S");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...TEXT_MAIN_PDF);
      doc.text(ing.codigo, colCodigo + 2, y + 5.5);

      doc.setFont("helvetica", "bold");
      doc.text(ing.label, colInsumo, y + 5.5);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(...TEXT_MUTED_PDF);
      doc.text(`${ing.qty} ${ing.unidade}`, colQtd, y + 5.5);

      const badgeColor = st.disponivel ? STATUS_COLORS_PDF.ready : STATUS_COLORS_PDF.blocked;
      const badgeLabel = st.disponivel ? "Disponível" : "Em falta";
      const badgeW = doc.getTextWidth(badgeLabel) + 5;
      doc.setFillColor(...badgeColor.bg);
      doc.roundedRect(colStatus - 1, y + 1.3, badgeW, 5.5, 2, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(...badgeColor.text);
      doc.text(badgeLabel, colStatus + 1.3, y + 5.1);

      if (rowHasWarning) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(7);
        doc.setTextColor(...STATUS_COLORS_PDF.partial.text);
        doc.text(st.motivo, colInsumo, y + 10);
      }

      y += rowHeight;
    });

    y += 8;

    sectionTitle("PASSO A PASSO DE PRODUÇÃO");

    const steps = recipe.steps || [];
    const stepTextWidth = contentWidth - 12;

    steps.forEach((texto, i) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const lines = doc.splitTextToSize(texto, stepTextWidth);
      const stepHeight = Math.max(8, lines.length * 4.6 + 3);

      checkPageBreak(stepHeight);

      doc.setFillColor(...PRIMARY_PDF);
      doc.circle(marginX + 3, y + 3, 3.2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(String(i + 1), marginX + 3, y + 4.2, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...TEXT_MAIN_PDF);
      doc.text(lines, marginX + 10, y + 4.2);

      if (i < steps.length - 1) {
        doc.setDrawColor(...BORDER_PDF);
        doc.setLineWidth(0.1);
        doc.setLineDashPattern([1, 1], 0);
        doc.line(marginX + 10, y + stepHeight - 1, marginX + contentWidth, y + stepHeight - 1);
        doc.setLineDashPattern([], 0);
      }

      y += stepHeight;
    });

    y += 10;

    checkPageBreak(20);
    doc.setFillColor(...BORDER_PDF);
    doc.roundedRect(marginX, y, contentWidth, 16, 2, 2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...TEXT_MAIN_PDF);
    doc.text("OBSERVAÇÕES:", marginX + 4, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...TEXT_MUTED_PDF);
    doc.text(
      "Este documento é de uso interno e deve ser seguido rigorosamente. Em caso de dúvidas, contatar o supervisor de produção.",
      marginX + 4,
      y + 11
    );

    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      drawFooter(p, totalPages);
    }

    doc.save(`procedimento-${recipe.id}.pdf`);
  } catch (err) {
    console.error("Erro ao gerar PDF:", err);
    alert("Não foi possível gerar o PDF. Tente novamente.");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalBtnHtml;
    }
  }
}

// =====================================================================
// Firebase — leitura em tempo real de /itens
// =====================================================================
function bindFirebase() {
  if (!window.SL || !window.SL.db) {
    console.warn('[Ajuda Produção] Firebase não inicializado. Cards ficarão sem estoque.');
    stockPronto = true;
    renderSummary();
    renderRecipes();
    return;
  }

  window.SL.db.ref('itens').on('value', (snap) => {
    STOCK = snapshotParaArray(snap.val() || {});
    stockPronto = true;
    renderSummary();
    renderRecipes();

    // Se o modal estiver aberto, atualiza com o novo estoque
    if (currentModalRecipeId) {
      openRecipeModal(currentModalRecipeId);
    }
  }, (err) => {
    console.error('[Ajuda Produção] Erro ao ler /itens:', err);
  });
}

// =====================================================================
// Boot
// =====================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Render imediato (mesmo sem estoque) — imagens aparecem na hora
  renderSummary();
  renderRecipes();

  // Conecta ao Firebase quando o SL estiver disponível
  const tentar = (n = 0) => {
    if (window.SL && window.SL.db) return bindFirebase();
    if (n > 50) return console.error('[Ajuda Produção] window.SL não apareceu.');
    setTimeout(() => tentar(n + 1), 100);
  };
  tentar();
});