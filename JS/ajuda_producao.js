/* ================================================================
   StockLog · JS/ajuda_producao.js
   Ajuda de Produção — disponibilidade de insumos em tempo real
   Fonte de estoque: /itens (Firebase Realtime Database)

   Sistema de DUAS CAMADAS de categorias:
   - Produção: chapas, usinados, conexoes, fixacao, estrutural, embalagem, pneus
   - Estoque:  Matéria-Prima, Componentes, Embalagens, Consumíveis, Ferramental
   O mapeamento PROD_TO_STOCK_CATEGORY conecta as duas.

   NOVO (qualidade + mídia por passo):
   - Cada passo agora é { texto, imagem, video } — use P("texto", "url-da-imagem", "url-do-video")
   - Cada receita tem `qualidade`: áreas de defeito, refugo (não conformidade),
     retrabalho (o que retorna ao processo) e destino do refugo (reciclagem)
   ================================================================ */

// ---------- Categorias de PRODUÇÃO (as que aparecem nos cards) ----------
const CATEGORIES = {
  chapas:     { label: "Corte e Chapas",       icon: "fa-solid fa-scissors" },
  usinados:   { label: "Usinados",             icon: "fa-solid fa-gear" },
  conexoes:   { label: "Conexões",             icon: "fa-solid fa-link" },
  fixacao:    { label: "Fixação",              icon: "fa-solid fa-screwdriver" },
  estrutural: { label: "Estrutural",           icon: "fa-solid fa-building" },
  embalagem:  { label: "Embalagem Industrial", icon: "fa-solid fa-box" },
  pneus:      { label: "Pneus e Borracha",     icon: "fa-solid fa-circle-notch" },
};

// ---------- Mapeamento: produção → estoque ----------
const PROD_TO_STOCK_CATEGORY = {
  chapas:     "Matéria-Prima",
  usinados:   "Componentes",
  conexoes:   "Componentes",
  fixacao:    "Consumíveis",     // parafusos, solda, etc.
  estrutural: "Componentes",
  embalagem:  "Embalagens",
  pneus:      "Matéria-Prima",
};

// ---------- Cores do PDF ----------
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
const RED_PDF        = [178, 67, 58];
const RED_BG_PDF     = [250, 238, 237];
const GREEN_PDF      = [26, 123, 114];

// Destino padrão do refugo (pode ser sobrescrito por receita em qualidade.destinoRefugo)
const DESTINO_REFUGO_PADRAO = "Segregar em coletor identificado e encaminhar para reciclagem.";

/** Cria um passo de produção: texto + imagem (opcional) + link de vídeo (opcional). */
function P(texto, imagem = "", video = "") {
  return { texto, imagem, video };
}

// =====================================================================
// RECEITAS — cada receita tem categoria de produção,
// e cada insumo também declara sua categoria de produção.
// Em cada passo, preencha imagem e video quando tiver (ficam vazios por padrão).
// =====================================================================
const RECIPES = [
  {
    id: "chapa-01",
    nome: "Chapa de Aço Carbono Cortada",
    descricao: "Corte a laser sob medida para estruturas metálicas",
    categoria: "chapas",
    imagem: "https://images.pexels.com/photos/8940223/pexels-photo-8940223.jpeg?auto=compress&cs=tinysrgb&w=600",
    ingredients: [
      { codigo: "MP-1050", categoria: "chapas",   qty: 1,   unidade: "un", label: "Chapa de Aço Carbono 10mm" },
      { codigo: "CS-7040", categoria: "fixacao",  qty: 0.3, unidade: "kg", label: "Solda de Acabamento" },
    ],
    steps: [
      P("Verificar o programa de corte a laser e confirmar as dimensões conforme o desenho técnico."),
      P("Posicionar a chapa de aço carbono 10mm na mesa da máquina de corte a laser."),
      P("Executar o corte a laser seguindo o contorno programado."),
      P("Rebarbar as bordas cortadas para remover rebarbas e resíduos de corte."),
      P("Aplicar a solda de acabamento nos pontos indicados no desenho."),
      P("Inspecionar as dimensões finais com paquímetro e liberar para a próxima etapa."),
    ],
    qualidade: {
      defeitos: [
        { area: "Corte a laser", refugo: "Peça fora da tolerância dimensional ou com corte incompleto/queimado.", retrabalho: "Peça com rebarba ou sobrematerial retorna para rebarbação/acerto de borda." },
        { area: "Solda de acabamento", refugo: "Chapa empenada ou trincada pela solda.", retrabalho: "Solda com porosidade ou falha retorna para retoque." },
      ],
      destinoRefugo: "Sucata de aço carbono segregada e enviada para reciclagem de metais.",
    },
  },
  {
    id: "flange-01",
    nome: "Flange Industrial ø50mm",
    descricao: "Peça de conexão em aço inox para tubulações",
    categoria: "conexoes",
    imagem: "https://m.media-amazon.com/images/I/51RFJvy25EL._AC_UF894,1000_QL80_.jpg",
    ingredients: [
      { codigo: "MP-1042", categoria: "chapas",   qty: 5, unidade: "kg", label: "Chapa Inox 304" },
      { codigo: "CP-3045", categoria: "fixacao",  qty: 4, unidade: "un", label: "Parafusos de Fixação" },
      { codigo: "CP-3070", categoria: "fixacao",  qty: 1, unidade: "un", label: "Anel de Vedação" },
    ],
    steps: [
      P("Selecionar a chapa de aço inox 304 e cortar o disco base conforme o diâmetro especificado."),
      P("Furar os 4 pontos de fixação na furadeira de bancada, seguindo o gabarito."),
      P("Usinar o rebaixo central para encaixe do tubo de ø50mm."),
      P("Instalar os parafusos de fixação nos furos usinados."),
      P("Posicionar o anel de vedação Viton na ranhura central."),
      P("Realizar o teste de estanqueidade e liberar a peça para expedição."),
    ],
    qualidade: {
      defeitos: [
        { area: "Furação", refugo: "Furos fora de posição ou com diâmetro acima da tolerância.", retrabalho: "Furos com rebarba retornam para acabamento." },
        { area: "Rebaixo central / vedação", refugo: "Rebaixo usinado além da medida (não há como recuperar).", retrabalho: "Falha no teste de estanqueidade por vedação mal assentada: retorna para remontagem do anel." },
      ],
      destinoRefugo: "Sucata de inox separada de outros metais e enviada para reciclagem.",
    },
  },
  {
    id: "engrenagem-01",
    nome: "Engrenagem Usinada Z40",
    descricao: "Componente de transmissão em bronze usinado",
    categoria: "usinados",
    imagem: "https://www.policompcomponentes.com.br/content/images/1fecf3cc1c54531455341db57cd103a3.png",
    ingredients: [
      { codigo: "MP-1120", categoria: "usinados", qty: 2,   unidade: "kg", label: "Barra de Bronze TM23" },
      { codigo: "CS-7023", categoria: "fixacao",  qty: 0.5, unidade: "L",  label: "Óleo de Usinagem" },
    ],
    steps: [
      P("Cortar a barra de bronze TM23 no comprimento necessário para o disco da engrenagem."),
      P("Fixar o material no torno CNC e usinar o diâmetro externo."),
      P("Aplicar óleo de usinagem durante todo o processo de corte, para resfriamento."),
      P("Fresar os 40 dentes conforme o módulo especificado no desenho."),
      P("Rebarbar e polir os dentes usinados."),
      P("Medir o passo e o diâmetro primitivo com equipamento de metrologia."),
    ],
    qualidade: {
      defeitos: [
        { area: "Fresagem dos dentes", refugo: "Dentes com perfil/passo errado ou dente faltando.", retrabalho: "Dentes com rebarba ou acabamento ruim retornam para polimento." },
        { area: "Torneamento", refugo: "Diâmetro externo menor que o mínimo da tolerância.", retrabalho: "Diâmetro acima da medida retorna ao torno para novo passe." },
      ],
      destinoRefugo: "Cavaco e peças de bronze segregados e enviados para reciclagem de metais não ferrosos.",
    },
  },
  {
    id: "rolamento-01",
    nome: "Mancal com Rolamento Blindado",
    descricao: "Conjunto de apoio para eixos em alta rotação",
    categoria: "usinados",
    imagem: "https://kohlerpneus.com.br/images/rolamentos/mancais-snt.png",
    ingredients: [
      { codigo: "CP-3011", categoria: "usinados", qty: 100, unidade: "un", label: "Rolamento Blindado 6204-2RS" },
      { codigo: "MP-1120", categoria: "usinados", qty: 1,   unidade: "kg", label: "Barra de Bronze TM23" },
    ],
    steps: [
      P("Usinar o corpo do mancal em barra de bronze TM23 conforme o desenho."),
      P("Furar o alojamento central com tolerância H7 para encaixe do rolamento."),
      P("Pressionar o rolamento blindado 6204-2RS no alojamento, usando prensa manual."),
      P("Verificar o giro livre do rolamento após a montagem."),
      P("Aplicar graxa nos pontos de lubrificação, quando aplicável."),
      P("Inspecionar a folga axial e liberar o conjunto."),
    ],
    qualidade: {
      defeitos: [
        { area: "Alojamento do rolamento", refugo: "Alojamento fora da tolerância H7 (folga ou aperto excessivo).", retrabalho: "Peça com acabamento irregular retorna para nova usinagem." },
        { area: "Montagem do rolamento", refugo: "Rolamento danificado na prensagem (pista marcada).", retrabalho: "Giro travado ou folga axial fora do limite: retorna para desmontagem e remontagem." },
      ],
      destinoRefugo: "Bronze e aço dos rolamentos separados por tipo de material e enviados para reciclagem.",
    },
  },
  {
    id: "parafusaria-01",
    nome: "Kit Parafusaria Sextavada M8",
    descricao: "Conjunto padronizado de fixação para montagem",
    categoria: "fixacao",
    imagem: "https://http2.mlstatic.com/D_NQ_NP_862287-MLB90049153639_082025-O-kit-10-parafusos-meia-rosca--parcial-sextavado-inox-m840mm.webp",
    ingredients: [
      { codigo: "CP-3045", categoria: "fixacao", qty: 20, unidade: "un", label: "Parafuso Sextavado M8x30" },
      { codigo: "CP-3050", categoria: "fixacao", qty: 20, unidade: "un", label: "Porca Sextavada M8" },
      { codigo: "CP-3055", categoria: "fixacao", qty: 20, unidade: "un", label: "Arruela de Pressão M8" },
    ],
    steps: [
      P("Separar 20 unidades de cada item: parafuso M8x30, porca M8 e arruela de pressão M8."),
      P("Conferir a integridade da rosca de cada parafuso e porca."),
      P("Organizar os itens em kits individuais de fixação (1 parafuso + 1 porca + 1 arruela)."),
      P("Embalar os kits em sacos plásticos identificados com etiqueta do lote."),
      P("Registrar a quantidade produzida no sistema de estoque."),
    ],
    qualidade: {
      defeitos: [
        { area: "Conferência de rosca", refugo: "Parafuso ou porca com rosca danificada, oxidada ou deformada.", retrabalho: "Kit incompleto ou com item trocado retorna para a montagem do kit." },
        { area: "Embalagem / etiqueta", refugo: "Saco rasgado com perda de itens que não podem ser recontados.", retrabalho: "Etiqueta de lote errada ou ilegível retorna para reetiquetagem." },
      ],
      destinoRefugo: "Parafusos e porcas descartados segregados como sucata metálica e enviados para reciclagem.",
    },
  },
  {
    id: "perfil-01",
    nome: "Suporte Estrutural Perfil U",
    descricao: "Estrutura galvanizada para fixação de equipamentos",
    categoria: "estrutural",
    imagem: "https://www.paulisteel.com.br/blog/wp-content/uploads/2025/04/218909fb-d901-4894-a066-2fa8882af140.jpg",
    ingredients: [
      { codigo: "MP-1135", categoria: "estrutural", qty: 3,   unidade: "m",  label: "Perfil U Aço Galvanizado" },
      { codigo: "MP-1140", categoria: "fixacao",    qty: 0.2, unidade: "L",  label: "Primer Anticorrosivo" },
      { codigo: "CP-3045", categoria: "fixacao",    qty: 6,   unidade: "un", label: "Parafusos de Fixação" },
    ],
    steps: [
      P("Cortar o perfil U galvanizado nos 3 metros necessários, conforme o desenho."),
      P("Furar os pontos de fixação para os parafusos M8."),
      P("Aplicar o primer anticorrosivo nas áreas de corte e furação."),
      P("Aguardar a secagem do primer conforme especificação do fabricante."),
      P("Montar os parafusos de fixação nos furos preparados."),
      P("Inspecionar visualmente o acabamento e liberar para o estoque."),
    ],
    qualidade: {
      defeitos: [
        { area: "Corte do perfil", refugo: "Perfil cortado curto (abaixo dos 3 m) ou com perfil amassado/torcido.", retrabalho: "Corte desalinhado com sobra retorna para esquadrejamento." },
        { area: "Pintura / primer", refugo: "Perfil com corrosão avançada de origem.", retrabalho: "Escorrimento ou falha de cobertura do primer retorna para lixamento e nova aplicação." },
      ],
      destinoRefugo: "Sucata de aço galvanizado enviada para reciclagem de metais; sobras de primer seguem descarte de resíduo químico.",
    },
  },
  {
    id: "tambor-01",
    nome: "Tambor Metálico 200L Lacrado",
    descricao: "Envase e lacre para transporte de insumos líquidos",
    categoria: "embalagem",
    imagem: "https://images.pexels.com/photos/615670/pexels-photo-615670.jpeg?auto=compress&cs=tinysrgb&w=600",
    ingredients: [
      { codigo: "EM-5020", categoria: "embalagem", qty: 1, unidade: "un", label: "Tambor Metálico Vazio" },
      { codigo: "EM-5030", categoria: "embalagem", qty: 2, unidade: "un", label: "Lacre de Segurança" },
    ],
    steps: [
      P("Inspecionar o tambor metálico vazio quanto a amassados ou corrosão."),
      P("Realizar o envase do insumo líquido conforme o volume especificado."),
      P("Posicionar a tampa do tambor e alinhar com o anel de vedação."),
      P("Aplicar os 2 lacres de segurança industrial na tampa."),
      P("Etiquetar o tambor com os dados do lote e a data de envase."),
      P("Armazenar em área designada, aguardando expedição."),
    ],
    qualidade: {
      defeitos: [
        { area: "Inspeção do tambor", refugo: "Tambor amassado, perfurado ou com corrosão que compromete a estanqueidade.", retrabalho: "Tambor sujo por fora retorna para limpeza antes do envase." },
        { area: "Envase e lacre", refugo: "Produto contaminado durante o envase.", retrabalho: "Volume fora do especificado ou lacre mal aplicado retorna para ajuste/relacre." },
      ],
      destinoRefugo: "Tambor metálico inutilizado enviado para reciclagem de metais; resíduo líquido segue descarte ambiental adequado.",
    },
  },
  {
    id: "pneu-01",
    nome: "Pneu de Carga HeavyDuty",
    descricao: "Produção de pneu reforçado para caminhões",
    categoria: "pneus",
    imagem: "https://www.acheipneus.com.br/media/catalog/product/p/n/pneu-155r12-sunset-over-cargo-b3-8886q-8pr-1.png",
    ingredients: [
      { codigo: "MP-1088", categoria: "pneus",   qty: 50, unidade: "kg", label: "Borracha ABS/Polímero" },
      { codigo: "MP-1042", categoria: "pneus",   qty: 10, unidade: "kg", label: "Reforço de Aço" },
      { codigo: "CS-7023", categoria: "fixacao", qty: 2,  unidade: "L",  label: "Lubrificante de Molde" },
    ],
    steps: [
      P("Pesar e preparar a mistura de borracha ABS/polímero conforme a formulação."),
      P("Aplicar o reforço de aço na carcaça do pneu durante a moldagem."),
      P("Lubrificar o molde com lubrificante próprio antes da prensagem."),
      P("Prensar e vulcanizar o pneu no molde aquecido, pelo tempo especificado."),
      P("Resfriar o pneu gradualmente após a vulcanização."),
      P("Inspecionar acabamento e balanceamento, e liberar para teste de qualidade."),
    ],
    qualidade: {
      defeitos: [
        { area: "Vulcanização", refugo: "Pneu com bolhas, vulcanização incompleta ou reforço de aço exposto.", retrabalho: "Pneu com rebarba de borracha retorna para acabamento." },
        { area: "Balanceamento", refugo: "Pneu com deformação estrutural que não corrige.", retrabalho: "Desbalanceamento leve retorna para ajuste e novo teste." },
      ],
      destinoRefugo: "Borracha e aço separados e enviados para reciclagem (trituração de borracha / recuperação do aço).",
    },
  },
  {
    id: "caixa-01",
    nome: "Kit de Embalagem Premium",
    descricao: "Conjunto de proteção reforçada para envio",
    categoria: "embalagem",
    imagem: "https://images.pexels.com/photos/6169028/pexels-photo-6169028.jpeg?auto=compress&cs=tinysrgb&w=600",
    ingredients: [
      { codigo: "EM-5012", categoria: "embalagem", qty: 1,   unidade: "un", label: "Caixa de Papelão" },
      { codigo: "MP-1102", categoria: "fixacao",   qty: 100, unidade: "ml", label: "Resina de Selagem" },
    ],
    steps: [
      P("Montar a caixa de papelão duplo conforme as dimensões do produto a proteger."),
      P("Aplicar a resina de selagem nas abas e junções da caixa."),
      P("Aguardar a cura da resina conforme o tempo indicado pelo fabricante."),
      P("Reforçar os cantos da caixa com fita adequada."),
      P("Inspecionar a resistência da embalagem antes da liberação."),
    ],
    qualidade: {
      defeitos: [
        { area: "Montagem da caixa", refugo: "Caixa molhada, rasgada ou com papelão amassado sem recuperação.", retrabalho: "Caixa mal montada ou com aba desalinhada retorna para remontagem." },
        { area: "Selagem", refugo: "Resina contaminada ou vencida aplicada na caixa.", retrabalho: "Selagem incompleta ou fora do tempo de cura retorna para reaplicação." },
      ],
      destinoRefugo: "Papelão enviado para reciclagem de papel; resina seguindo descarte de resíduo químico.",
    },
  }
];

// =====================================================================
// ESTOQUE — espelho do Firebase (/itens)
// =====================================================================
let STOCK = [];
let stockPronto = false;

function normalizar(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizarCodigo(str) {
  return String(str || '')
    .toUpperCase()
    .replace(/[\s\-_]/g, '');
}

function snapshotParaArray(val) {
  const out = [];
  for (const key in val) {
    const it = val[key] || {};
    out.push({
      firebaseKey: key,
      codigo:    it.codigo    || key || '',
      nome:      it.nome      || '',
      categoria: it.categoria || '',       // categoria de ESTOQUE
      atual:     Number(it.atual)  || 0,
      minimo:    Number(it.minimo) || 0,
      local:     it.local     || '',
    });
  }
  return out;
}

/**
 * Busca item por código (normalização agressiva).
 * Ordena por "categoria bate": se o item tem a categoria de estoque
 * esperada pra produção, ele ganha preferência.
 */
function stockFor(codigo, categoriaProducao) {
  const alvo = normalizarCodigo(codigo);
  if (!alvo) return null;

  const esperada = categoriaProducao
    ? PROD_TO_STOCK_CATEGORY[categoriaProducao]
    : null;

  const candidatos = STOCK.filter(s =>
    normalizarCodigo(s.codigo) === alvo ||
    normalizarCodigo(s.firebaseKey) === alvo
  );
  if (!candidatos.length) return null;

  // Preferência: categoria de estoque esperada
  if (esperada) {
    const preferido = candidatos.find(s => s.categoria === esperada);
    if (preferido) return preferido;
  }
  return candidatos[0];
}

/**
 * Busca por nome com preferência por categoria de estoque.
 * Estratégia:
 *   1) Tenta todos os tokens na categoria esperada
 *   2) Se não achar, tenta todos os tokens em qualquer categoria
 */
function stockForNome(label, categoriaProducao) {
  const alvo = normalizar(label);
  if (!alvo) return null;

  const stopwords = new Set([
    'de','da','do','das','dos','para','com','sem','e','ou','a','o','as','os',
    'un','und','kg','l','m','ml','industrial','padrao','linha','tipo'
  ]);
  const tokens = alvo.split(' ').filter(t => t.length >= 3 && !stopwords.has(t));
  if (!tokens.length) return null;

  const esperada = categoriaProducao
    ? PROD_TO_STOCK_CATEGORY[categoriaProducao]
    : null;

  function melhorCandidato(lista) {
    let melhor = null, melhorScore = 0;
    for (const s of lista) {
      const nome = normalizar(s.nome);
      if (!nome) continue;
      let hits = 0;
      for (const t of tokens) if (nome.includes(t)) hits++;
      const score = hits / tokens.length;
      if (hits >= 1 && score > melhorScore) {
        melhor = s; melhorScore = score;
      }
    }
    return { item: melhor, score: melhorScore };
  }

  // 1) Tenta na categoria esperada
  if (esperada) {
    const pref = melhorCandidato(STOCK.filter(s => s.categoria === esperada));
    if (pref.item && pref.score >= 0.4) return pref.item;
  }

  // 2) Fallback geral
  const geral = melhorCandidato(STOCK);
  return (geral.item && geral.score >= 0.4) ? geral.item : null;
}

/**
 * Regras:
 *   - atual <= 0             → indisponível
 *   - atual < qty            → insuficiente
 *   - atual <= mínimo        → disponível com aviso
 */
function ingredientStatus(ing) {
  // 1) por código (com preferência de categoria)
  let item = stockFor(ing.codigo, ing.categoria);
  let via = 'codigo';

  // 2) fallback por nome (com preferência de categoria)
  if (!item) {
    item = stockForNome(ing.label, ing.categoria);
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
  return { total, disponiveis, faltando, pronto: faltando === 0, bloqueado: disponiveis === 0 };
}

function statusInfo({ faltando, pronto, bloqueado }) {
  if (pronto) return { cls: "ready", icon: "fa-solid fa-circle-check", text: "Pronto para produção" };
  if (bloqueado) return { cls: "blocked", icon: "fa-solid fa-circle-xmark",
    text: `Bloqueado · ${faltando} insumo${faltando > 1 ? 's' : ''} em falta` };
  return { cls: "partial", icon: "fa-solid fa-triangle-exclamation",
    text: `Parcial · ${faltando} insumo${faltando > 1 ? 's' : ''} em falta` };
}

// ---------- Helpers de passos / vídeo ----------
/** Aceita passo como string (formato antigo) ou objeto { texto, imagem, video }. */
function normalizarPasso(s) {
  if (typeof s === 'string') return { texto: s, imagem: '', video: '' };
  return { texto: s?.texto || '', imagem: s?.imagem || '', video: s?.video || '' };
}

/** Só aceita links http(s) — evita javascript: etc. */
function urlSegura(url) {
  const u = String(url || '').trim();
  return /^https?:\/\//i.test(u) ? u : '';
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ---------- Render ----------
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

/** Garante que o bloco "Controle de Qualidade" exista no modal (criado via JS, sem mexer no HTML). */
function garantirBlocoQualidade() {
  let box = document.getElementById('qualityBox');
  if (box) return box;
  const actions = document.querySelector('#recipeModal .modal-actions');
  if (!actions) return null;
  box = document.createElement('div');
  box.id = 'qualityBox';
  actions.parentNode.insertBefore(box, actions);
  return box;
}

function renderPasso(passoRaw, i) {
  const p = normalizarPasso(passoRaw);
  const img = urlSegura(p.imagem);
  const video = urlSegura(p.video);

  const midia = img
    ? `<img class="step-photo" src="${escapeHtml(img)}" alt="Passo ${i + 1}" loading="lazy"
            onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'step-photo step-photo-empty',innerHTML:'<i class=&quot;fa-regular fa-image&quot;></i> Imagem indisponível'}))" />`
    : `<div class="step-photo step-photo-empty"><i class="fa-regular fa-image"></i> Sem imagem para este passo</div>`;

  const botaoVideo = video
    ? `<a class="step-video-btn" href="${escapeHtml(video)}" target="_blank" rel="noopener noreferrer">
         <i class="fa-solid fa-circle-play"></i> Ver vídeo de como fazer
       </a>`
    : '';

  return `
    <div class="step-item step-item-media">
      <div class="step-head">
        <span class="step-number">${i + 1}</span>
        <span class="step-text">${escapeHtml(p.texto)}</span>
      </div>
      ${midia}
      ${botaoVideo}
    </div>
  `;
}

function renderQualidade(recipe) {
  const box = garantirBlocoQualidade();
  if (!box) return;
  const q = recipe.qualidade;
  if (!q || !(q.defeitos || []).length) { box.innerHTML = ''; return; }

  const destino = q.destinoRefugo || DESTINO_REFUGO_PADRAO;

  const cards = q.defeitos.map(d => `
    <div class="defect-card">
      <div class="defect-area"><i class="fa-solid fa-location-crosshairs"></i> Área de defeito: <strong>${escapeHtml(d.area)}</strong></div>
      <div class="defect-row defect-refugo">
        <span class="defect-label"><i class="fa-solid fa-ban"></i> Refugo (não conformidade)</span>
        <span class="defect-text">${escapeHtml(d.refugo)}</span>
      </div>
      <div class="defect-row defect-retrabalho">
        <span class="defect-label"><i class="fa-solid fa-rotate-left"></i> Retrabalho (retorna ao processo)</span>
        <span class="defect-text">${escapeHtml(d.retrabalho)}</span>
      </div>
    </div>
  `).join('');

  box.innerHTML = `
    <div class="modal-section-title">
      <i class="fa-solid fa-clipboard-check"></i> Controle de qualidade
    </div>
    <div class="defect-list">${cards}</div>
    <div class="defect-destino">
      <i class="fa-solid fa-recycle"></i>
      <div><strong>Destino do refugo:</strong> ${escapeHtml(destino)}</div>
    </div>
  `;
}

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
  listEl.innerHTML = ordenados.map(ing => renderIngredientItem(ing)).join('');

  const stepsEl = document.getElementById('stepsList');
  if (stepsEl) {
    stepsEl.innerHTML = (recipe.steps || []).map((s, i) => renderPasso(s, i)).join('');
  }

  renderQualidade(recipe);

  document.getElementById('recipeModal').classList.add('active');
}

/**
 * Renderiza um item de ingrediente no modal, com botões de ação:
 *  - "Cadastrar no estoque" se não existe
 *  - "Ver no estoque" se existe (mesmo que em falta)
 */
function renderIngredientItem(ing) {
  const st = ingredientStatus(ing);
  const catProd = CATEGORIES[ing.categoria]?.label || ing.categoria || '';
  const catEstoque = PROD_TO_STOCK_CATEGORY[ing.categoria] || '';

  const aviso = st.motivo
    ? `<small class="low-stock-warning"><i class="fa-solid fa-triangle-exclamation"></i> ${st.motivo}</small>`
    : '';

  const matchInfo = (st.via === 'nome' && st.item)
    ? `<small class="codigo-tag" style="margin-left:6px;opacity:.75;">(estoque: ${st.item.codigo})</small>`
    : '';

  // ---------- Botão de ação ----------
  let botaoAcao = '';
  if (!st.item) {
    // Não cadastrado → botão de cadastrar
    const payload = encodeURIComponent(JSON.stringify({
      acao: 'novo',
      codigo: ing.codigo,
      nome: ing.label,
      categoria: catEstoque,
    }));
    botaoAcao = `
      <a class="ingredient-action-btn action-cadastrar"
         href="itens.html?stocklog=${payload}"
         title="Cadastrar este insumo no estoque">
        <i class="fa-solid fa-plus"></i> Cadastrar no estoque
      </a>`;
  } else {
    // Existe → botão de ver no estoque
    const payload = encodeURIComponent(JSON.stringify({
      acao: 'buscar',
      codigo: st.item.codigo || st.item.firebaseKey,
    }));
    botaoAcao = `
      <a class="ingredient-action-btn action-ver"
         href="itens.html?stocklog=${payload}"
         title="Ver este item na tela de estoque">
        <i class="fa-solid fa-magnifying-glass"></i> Ver no estoque
      </a>`;
  }

  return `
    <div class="ingredient-item ${st.disponivel ? '' : 'unavailable'}">
      <div class="ingredient-name">
        <div>
          <div>
            ${ing.label}
            <small class="codigo-tag">${ing.codigo}</small>
            ${matchInfo}
          </div>
          <div class="ingredient-cats">
            <span class="cat-prod-chip cat-prod-${ing.categoria}">${catProd}</span>
            ${catEstoque ? `<span class="cat-arrow">→</span><span class="cat-estoque-chip">${catEstoque}</span>` : ''}
          </div>
          ${aviso}
        </div>
      </div>
      <div class="ingredient-right">
        <div class="ingredient-qty-line">
          <span class="ingredient-qty">${ing.qty} ${ing.unidade}</span>
          <span class="availability-badge ${st.disponivel ? 'avail-yes' : 'avail-no'}">
            ${st.disponivel ? 'Disponível' : 'Em falta'}
          </span>
        </div>
        ${botaoAcao}
      </div>
    </div>
  `;
}

function closeRecipeModal() {
  document.getElementById('recipeModal').classList.remove('active');
  currentModalRecipeId = null;
}

// =====================================================================
// CSS extra — botões, chips, passos com mídia e controle de qualidade
// =====================================================================
(function injetarEstilosModal() {
  if (document.getElementById('prod-modal-extra')) return;
  const s = document.createElement('style');
  s.id = 'prod-modal-extra';
  s.textContent = `
    .ingredient-item { flex-wrap: wrap; }
    .ingredient-right {
      display: flex; flex-direction: column;
      align-items: flex-end; gap: 6px;
    }
    .ingredient-qty-line { display: flex; align-items: center; gap: 10px; }

    .ingredient-cats {
      display: flex; align-items: center; gap: 6px;
      margin-top: 4px; font-size: 10.5px;
    }
    .cat-prod-chip {
      padding: 2px 8px; border-radius: 6px;
      background: var(--primary-light); color: var(--primary);
      font-weight: 700; letter-spacing: .02em;
    }
    .cat-prod-chapas     { background: var(--cat-chapas-bg);     color: var(--cat-chapas); }
    .cat-prod-usinados   { background: var(--cat-usinados-bg);   color: var(--cat-usinados); }
    .cat-prod-conexoes   { background: var(--cat-conexoes-bg);   color: var(--cat-conexoes); }
    .cat-prod-fixacao    { background: var(--cat-fixacao-bg);    color: var(--cat-fixacao); }
    .cat-prod-estrutural { background: var(--cat-estrutural-bg); color: var(--cat-estrutural); }
    .cat-prod-embalagem  { background: var(--cat-embalagem-bg);  color: var(--cat-embalagem); }
    .cat-prod-pneus      { background: var(--cat-pneus-bg);      color: var(--cat-pneus); }
    .cat-arrow { color: var(--text-muted); font-size: 11px; }
    .cat-estoque-chip {
      padding: 2px 8px; border-radius: 6px;
      background: var(--bg-soft); color: var(--text-secondary);
      border: 1px solid var(--border);
      font-weight: 600;
    }

    .ingredient-action-btn {
      display: inline-flex; align-items: center; gap: 5px;
      font-size: 11.5px; font-weight: 700;
      padding: 5px 10px; border-radius: 7px;
      text-decoration: none; cursor: pointer;
      transition: filter .15s, transform .1s;
      white-space: nowrap;
    }
    .ingredient-action-btn:hover { filter: brightness(1.08); }
    .ingredient-action-btn:active { transform: translateY(1px); }
    .ingredient-action-btn.action-cadastrar {
      background: var(--primary); color: #fff; border: 1px solid var(--primary);
    }
    .ingredient-action-btn.action-ver {
      background: var(--bg-soft); color: var(--primary);
      border: 1px solid var(--primary);
    }

    /* ----- Passos com imagem e vídeo ----- */
    .step-item.step-item-media { flex-direction: column; align-items: stretch; gap: 10px; }
    .step-head { display: flex; align-items: flex-start; gap: 10px; }
    .step-photo {
      width: 100%; aspect-ratio: 16 / 9; object-fit: cover; display: block;
      border-radius: 8px; border: 1px solid var(--border); background: var(--bg-card);
    }
    .step-photo-empty {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      color: var(--text-muted); font-size: 12px; font-weight: 600;
      border-style: dashed;
    }
    .step-video-btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      align-self: flex-start;
      font-size: 12px; font-weight: 700; text-decoration: none;
      color: var(--primary); background: var(--primary-light);
      border: 1px solid var(--primary); border-radius: 8px;
      padding: 7px 12px; transition: filter .15s;
    }
    .step-video-btn:hover { filter: brightness(1.06); }

    /* ----- Controle de qualidade ----- */
    .defect-list { display: flex; flex-direction: column; gap: var(--sp-3); }
    .defect-card {
      background: var(--bg-soft); border: 1px solid var(--border);
      border-radius: 10px; padding: var(--sp-3);
      display: flex; flex-direction: column; gap: var(--sp-2);
    }
    .defect-area { font-size: 13px; color: var(--text-main); }
    .defect-area i { color: var(--primary); margin-right: 4px; }
    .defect-row {
      display: flex; flex-direction: column; gap: 2px;
      padding: var(--sp-2) var(--sp-3); border-radius: 8px; font-size: 12.5px;
    }
    .defect-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .03em; }
    .defect-text { line-height: 1.45; color: var(--text-main); }
    .defect-refugo { background: var(--red-bg); }
    .defect-refugo .defect-label { color: var(--red); }
    .defect-retrabalho { background: var(--amber-bg); }
    .defect-retrabalho .defect-label { color: var(--amber); }
    .defect-destino {
      display: flex; align-items: flex-start; gap: 10px;
      margin-top: var(--sp-3); padding: var(--sp-3);
      background: var(--green-bg); color: var(--green);
      border-radius: 10px; font-size: 13px; line-height: 1.45;
    }
    .defect-destino i { font-size: 16px; margin-top: 2px; }
    .defect-destino div { color: var(--text-main); }
    .defect-destino strong { color: var(--green); }
  `;
  document.head.appendChild(s);
})();

// =====================================================================
// PDF — Ficha de Procedimento (agora com imagem/vídeo por passo e qualidade)
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
  } catch { return null; }
}

/** Descobre o formato de uma data URL para o jsPDF (JPEG/PNG). */
function formatoImagemPDF(dataUrl) {
  const m = /^data:image\/(\w+)/i.exec(dataUrl || '');
  const f = (m ? m[1] : 'jpeg').toUpperCase();
  return f === 'JPG' ? 'JPEG' : f;
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
    const revisao = "03";

    let y = 0;
    const imgDataUrl = await loadImageAsDataURL(recipe.imagem);

    // Passos normalizados + imagens carregadas em paralelo
    const passos = (recipe.steps || []).map(normalizarPasso);
    const imagensPassos = await Promise.all(
      passos.map(p => (urlSegura(p.imagem) ? loadImageAsDataURL(p.imagem) : Promise.resolve(null)))
    );

    function drawHeader() {
      doc.setFillColor(...PRIMARY_PDF);
      doc.rect(0, 0, pageWidth, 28, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold"); doc.setFontSize(16);
      doc.text("STOCKLOG", marginX, 12);
      doc.setFont("helvetica", "normal"); doc.setFontSize(7.5);
      doc.text("Sistema Integrado de Gestão de Estoque, Produção e Logística", marginX, 18);
      doc.setFont("helvetica", "bold"); doc.setFontSize(10);
      doc.text("PROCEDIMENTO OPERACIONAL PADRÃO", pageWidth - marginX, 11, { align: "right" });
      doc.setFont("helvetica", "normal"); doc.setFontSize(7.5);
      doc.text(`Código: ${codigoDoc}`, pageWidth - marginX, 17, { align: "right" });
      doc.text(`Revisão: ${revisao}`, pageWidth - marginX, 21, { align: "right" });
      y = 36;
    }

    function drawFooter(pageNum, totalPages) {
      doc.setDrawColor(...BORDER_PDF); doc.setLineWidth(0.3);
      doc.line(marginX, pageHeight - 16, pageWidth - marginX, pageHeight - 16);
      doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(...TEXT_MUTED_PDF);
      const footerY = pageHeight - 13;
      const colWidth = contentWidth / 3;
      doc.text("Elaboração: José Correia", marginX, footerY);
      doc.text("Aprovação: José Correia", marginX + colWidth, footerY);
      doc.text(`Data: ${dataEmissao}`, marginX + colWidth * 2, footerY);
      doc.setFontSize(6.5);
      doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth - marginX, footerY, { align: "right" });
    }

    function checkPageBreak(h) {
      if (y + h > bottomLimit) { doc.addPage(); drawHeader(); }
    }

    function sectionTitle(text) {
      checkPageBreak(14);
      doc.setFillColor(...PRIMARY_PDF); doc.rect(marginX, y, 3, 6, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(...TEXT_MAIN_PDF);
      doc.text(text, marginX + 6, y + 5); y += 12;
    }

    function drawInfoTable(rows, startY, col1Width = 38) {
      const rowHeight = 7.5;
      const col2Width = contentWidth - col1Width;
      rows.forEach((row, i) => {
        const rowY = startY + i * rowHeight;
        doc.setFillColor(...BORDER_PDF); doc.rect(marginX, rowY, col1Width, rowHeight, "F");
        doc.setDrawColor(...BORDER_PDF); doc.setLineWidth(0.2);
        doc.rect(marginX, rowY, col1Width, rowHeight, "S");
        doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...TEXT_MAIN_PDF);
        doc.text(row.label, marginX + 2.5, rowY + 5);
        doc.setFillColor(255, 255, 255);
        doc.rect(marginX + col1Width, rowY, col2Width, rowHeight, "F");
        doc.rect(marginX + col1Width, rowY, col2Width, rowHeight, "S");
        doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...TEXT_MUTED_PDF);
        doc.text(row.value, marginX + col1Width + 2.5, rowY + 5);
      });
      return startY + rows.length * rowHeight;
    }

    drawHeader();

    y = drawInfoTable([
      { label: "Aplicação", value: recipe.nome },
      { label: "Descrição", value: recipe.descricao },
      { label: "Categoria", value: catInfo ? catInfo.label : recipe.categoria },
      { label: "Código Interno", value: recipe.id.toUpperCase() },
      { label: "Data de Emissão", value: `${dataEmissao} às ${horaEmissao}` },
      { label: "Status", value: statusColor.label },
    ], y);
    y += 6;

    if (imgDataUrl) {
      checkPageBreak(40);
      try {
        const imgW = 55, imgH = 38;
        doc.setDrawColor(...BORDER_PDF); doc.setLineWidth(0.3);
        doc.roundedRect(marginX, y, imgW, imgH, 2, 2, "S");
        doc.addImage(imgDataUrl, formatoImagemPDF(imgDataUrl), marginX, y, imgW, imgH, undefined, "FAST");
        doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...TEXT_MAIN_PDF);
        doc.text("REGISTRO FOTOGRÁFICO DO PRODUTO", marginX + imgW + 6, y + 6);
        doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(...TEXT_MUTED_PDF);
        doc.text(doc.splitTextToSize(
          "Imagem ilustrativa do item produzido, conforme especificação técnica.",
          contentWidth - imgW - 10
        ), marginX + imgW + 6, y + 12);
        y += imgH + 8;
      } catch {}
    }

    sectionTitle("MATERIAIS E INSUMOS NECESSÁRIOS");
    const colCodigo = marginX;
    const colInsumo = marginX + 28;
    const colQtd = marginX + 120;
    const colStatus = marginX + contentWidth - 32;

    checkPageBreak(9);
    doc.setFillColor(...PRIMARY_PDF); doc.rect(marginX, y, contentWidth, 8, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(255, 255, 255);
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
      doc.setDrawColor(...BORDER_PDF); doc.setLineWidth(0.15);
      doc.rect(marginX, y, contentWidth, rowHeight, "S");
      doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...TEXT_MAIN_PDF);
      doc.text(ing.codigo, colCodigo + 2, y + 5.5);
      doc.setFont("helvetica", "bold"); doc.text(ing.label, colInsumo, y + 5.5);
      doc.setFont("helvetica", "normal"); doc.setTextColor(...TEXT_MUTED_PDF);
      doc.text(`${ing.qty} ${ing.unidade}`, colQtd, y + 5.5);

      const badgeColor = st.disponivel ? STATUS_COLORS_PDF.ready : STATUS_COLORS_PDF.blocked;
      const badgeLabel = st.disponivel ? "Disponível" : "Em falta";
      const badgeW = doc.getTextWidth(badgeLabel) + 5;
      doc.setFillColor(...badgeColor.bg);
      doc.roundedRect(colStatus - 1, y + 1.3, badgeW, 5.5, 2, 2, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(...badgeColor.text);
      doc.text(badgeLabel, colStatus + 1.3, y + 5.1);

      if (rowHasWarning) {
        doc.setFont("helvetica", "italic"); doc.setFontSize(7);
        doc.setTextColor(...STATUS_COLORS_PDF.partial.text);
        doc.text(st.motivo, colInsumo, y + 10);
      }
      y += rowHeight;
    });
    y += 8;

    // ---------- Passo a passo (com imagem e link de vídeo) ----------
    sectionTitle("PASSO A PASSO DE PRODUÇÃO");
    const stepTextWidth = contentWidth - 12;
    const stepImgW = 60, stepImgH = 34;

    passos.forEach((passo, i) => {
      doc.setFont("helvetica", "normal"); doc.setFontSize(9);
      const lines = doc.splitTextToSize(passo.texto, stepTextWidth);
      const imgStep = imagensPassos[i];
      const video = urlSegura(passo.video);

      let stepHeight = Math.max(8, lines.length * 4.6 + 3);
      if (imgStep) stepHeight += stepImgH + 3;
      if (video) stepHeight += 5;
      checkPageBreak(stepHeight);

      doc.setFillColor(...PRIMARY_PDF);
      doc.circle(marginX + 3, y + 3, 3.2, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(255, 255, 255);
      doc.text(String(i + 1), marginX + 3, y + 4.2, { align: "center" });
      doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...TEXT_MAIN_PDF);
      doc.text(lines, marginX + 10, y + 4.2);

      let cursor = y + Math.max(8, lines.length * 4.6 + 3);

      if (imgStep) {
        try {
          doc.setDrawColor(...BORDER_PDF); doc.setLineWidth(0.3);
          doc.roundedRect(marginX + 10, cursor, stepImgW, stepImgH, 1.5, 1.5, "S");
          doc.addImage(imgStep, formatoImagemPDF(imgStep), marginX + 10, cursor, stepImgW, stepImgH, undefined, "FAST");
        } catch {}
        cursor += stepImgH + 3;
      }

      if (video) {
        doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(...PRIMARY_PDF);
        doc.textWithLink("Vídeo de como fazer: " + video, marginX + 10, cursor + 2.5, { url: video });
        cursor += 5;
      }

      if (i < passos.length - 1) {
        doc.setDrawColor(...BORDER_PDF); doc.setLineWidth(0.1);
        doc.setLineDashPattern([1, 1], 0);
        doc.line(marginX + 10, y + stepHeight - 1, marginX + contentWidth, y + stepHeight - 1);
        doc.setLineDashPattern([], 0);
      }
      y += stepHeight;
    });
    y += 8;

    // ---------- Controle de qualidade ----------
    const q = recipe.qualidade;
    if (q && (q.defeitos || []).length) {
      sectionTitle("CONTROLE DE QUALIDADE");
      const textW = contentWidth - 8;

      q.defeitos.forEach(d => {
        doc.setFont("helvetica", "normal"); doc.setFontSize(8);
        const refLines = doc.splitTextToSize(d.refugo, textW);
        const retLines = doc.splitTextToSize(d.retrabalho, textW);
        const blockH = 8 + (refLines.length * 3.8 + 6) + (retLines.length * 3.8 + 6) + 2;
        checkPageBreak(blockH);

        doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...TEXT_MAIN_PDF);
        doc.text(`Área de defeito: ${d.area}`, marginX, y + 4);
        y += 8;

        // Refugo
        const refH = refLines.length * 3.8 + 6;
        doc.setFillColor(...RED_BG_PDF); doc.roundedRect(marginX, y, contentWidth, refH, 1.5, 1.5, "F");
        doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(...RED_PDF);
        doc.text("REFUGO (NÃO CONFORMIDADE)", marginX + 4, y + 4);
        doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...TEXT_MAIN_PDF);
        doc.text(refLines, marginX + 4, y + 8);
        y += refH + 2;

        // Retrabalho
        const retH = retLines.length * 3.8 + 6;
        doc.setFillColor(...STATUS_COLORS_PDF.partial.bg); doc.roundedRect(marginX, y, contentWidth, retH, 1.5, 1.5, "F");
        doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(...STATUS_COLORS_PDF.partial.text);
        doc.text("RETRABALHO (RETORNA AO PROCESSO)", marginX + 4, y + 4);
        doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...TEXT_MAIN_PDF);
        doc.text(retLines, marginX + 4, y + 8);
        y += retH + 5;
      });

      const destinoLines = doc.splitTextToSize(q.destinoRefugo || DESTINO_REFUGO_PADRAO, textW);
      const destH = destinoLines.length * 3.8 + 8;
      checkPageBreak(destH + 4);
      doc.setFillColor(...STATUS_COLORS_PDF.ready.bg); doc.roundedRect(marginX, y, contentWidth, destH, 1.5, 1.5, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(...GREEN_PDF);
      doc.text("DESTINO DO REFUGO", marginX + 4, y + 4.5);
      doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...TEXT_MAIN_PDF);
      doc.text(destinoLines, marginX + 4, y + 9);
      y += destH + 10;
    }

    checkPageBreak(20);
    doc.setFillColor(...BORDER_PDF);
    doc.roundedRect(marginX, y, contentWidth, 16, 2, 2, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(...TEXT_MAIN_PDF);
    doc.text("OBSERVAÇÕES:", marginX + 4, y + 6);
    doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(...TEXT_MUTED_PDF);
    doc.text(
      "Este documento é de uso interno e deve ser seguido rigorosamente. Em caso de dúvidas, contatar o supervisor de produção.",
      marginX + 4, y + 11
    );

    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p); drawFooter(p, totalPages);
    }

    doc.save(`procedimento-${recipe.id}.pdf`);
  } catch (err) {
    console.error("Erro ao gerar PDF:", err);
    alert("Não foi possível gerar o PDF. Tente novamente.");
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = originalBtnHtml; }
  }
}

// =====================================================================
// Firebase — leitura em tempo real de /itens
// =====================================================================
function bindFirebase() {
  if (!window.SL || !window.SL.db) {
    console.warn('[Ajuda Produção] Firebase não inicializado.');
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
    if (currentModalRecipeId) openRecipeModal(currentModalRecipeId);
  }, (err) => {
    console.error('[Ajuda Produção] Erro ao ler /itens:', err);
  });
}

// =====================================================================
// Boot
// =====================================================================
document.addEventListener('DOMContentLoaded', () => {
  garantirBlocoQualidade();
  renderSummary();
  renderRecipes();
  const tentar = (n = 0) => {
    if (window.SL && window.SL.db) return bindFirebase();
    if (n > 50) return console.error('[Ajuda Produção] window.SL não apareceu.');
    setTimeout(() => tentar(n + 1), 100);
  };
  tentar();
});