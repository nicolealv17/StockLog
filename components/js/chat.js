/**
 * StockLog v2.4 · Assistente Virtual Hiperinteligente (LogBot)
 * -------------------------------------------------------------------------
 * - 100% Client-Side (Sem APIs pagas, sem necessidade de chaves ou servidor)
 * - Mapeamento completo de Módulos, Páginas, OPs, Máquinas, Estoque e Logística
 * - Guia detalhado de OBJETIVO e COMO USAR cada uma das 14 páginas do sistema
 * - Redirecionamento e orientação inteligente para a Agenda/Calendário
 * - Filtro automático para desconsiderar dados de teste (ex: AAAAA, FDDSF, sddfs)
 */

(function () {
  "use strict";

  // Normalizador de texto (ignora maiúsculas, acentos e pontuação)
  function normalizarTexto(texto) {
    if (!texto) return "";
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  // Sanitizador: verifica se o texto é dado de teste/lixo
  function ehDadoValido(texto) {
    if (!texto) return false;
    const t = texto.trim().toLowerCase();
    const padroesLixo = [
      /^a+$/i, /^s+$/i, /^d+$/i, /^f+$/i, /^z+$/i, /^x+$/i,
      /aaaaa/i, /aasa/i, /ssss/i, /fddsf/i, /sddfs/i, /wwwww/i, /gfew/i, /rhhh/i
    ];
    return !padroesLixo.some(p => p.test(t));
  }

  /* ==========================================================================
     1. DICIONÁRIO E GUIA COMPLETO DAS 14 PÁGINAS DO STOCKLOG
     ========================================================================== */
  const PaginasSistema = {
    dashboard: {
      nome: "Dashboard (Visão Geral)",
      chaves: ["dashboard", "inicio", "painel principal", "visao geral", "kpis"],
      objetivo: "Apresentar uma visão executiva em tempo real com os principais KPIs de produção, taxa de entrega, saldo de estoque e alertas prioritários.",
      comoUsar: "1. Acompanhe os cards no topo com totais de Pedidos em Aberto (42), Taxa de Entrega (86%), Itens em Estoque (1.247) e OPs (24).\n2. Consulte a lista de 'Alertas' para identificar pedidos atrasados por quebra de máquina ou falta de insumo.\n3. Monitore o gráfico de 'Produção por Setor' (Corte, Usinagem, Caldeiraria, Solda, Pintura e Montagem).\n4. Utilize a tabela de 'Pedidos recentes' para filtrar por cliente ou status."
    },

    agenda: {
      nome: "Agenda / Calendário",
      chaves: ["agenda", "calendario", "compromissos", "reuniao", "treinamento", "vencimento"],
      objetivo: "Centralizar o cronograma de eventos, treinamentos, reuniões de alinharmento, manutenções preventivas e prazos de vencimento de OPs.",
      comoUsar: "1. Alterne a visualização entre Mês, Semana e Dia.\n2. Utilize os filtros de categoria (Reuniões, Treinamentos, Urgentes, Prazos OPs, Manutenções ou Google).\n3. Clique no botão '+ Novo compromisso' para agendar um evento.\n4. Utilize o botão 'Sincronizar agenda' para integrar os dados com o Google Calendar."
    },

    pedidos: {
      nome: "Pedidos de Produção",
      chaves: ["pedidos de producao", "pedidos", "ordens de producao", "ops", "novo pedido"],
      objetivo: "Gerenciar a emissão, priorização, prazos de entrega e ciclo de vida de todos os pedidos e ordens de fabricação.",
      comoUsar: "1. Verifique os indicadores superiores: Pedidos Ativos, Em Produção, Atrasados e Concluídos.\n2. Utilize o campo de busca por código ou insumo e filtre por status/prioridade.\n3. Clique no botão '+ Novo pedido' para cadastrar uma nova ordem.\n4. Na tabela, utilize as ações rápidas para visualizar detalhes (ícone de olho), editar ou excluir."
    },

    controle: {
      nome: "Controle de Produção / Máquinas",
      chaves: ["controle de producao", "maquinas", "prensa", "torno", "laser", "ritmo", "progresso das ordens"],
      objetivo: "Monitorar a operação das máquinas no chão de fábrica ao vivo, ritmos de fabricação, quantidade produzida vs meta e falhas elétricas/mecânicas.",
      comoUsar: "1. Observe os cards de 'Máquinas em operação' para identificar o status (Operando, Parada, Manutenção) e o operador responsável.\n2. Verifique o painel de 'Problemas ativos' à direita para agir sobre gargalos ou falta de chapa.\n3. Acompanhe a tabela 'Progresso das ordens ativas' para ver o tempo decorrido e porcentagem de conclusão de cada lote."
    },

    ajuda: {
      nome: "Ajuda de Produção (Fichas Técnicas)",
      chaves: ["ajuda de producao", "fichas tecnicas", "passo a passo", "instrucoes", "fichas", "pop"],
      objetivo: "Servir como biblioteca técnica interativa com imagens, insumos necessários e o passo a passo detalhado para fabricação de cada item.",
      comoUsar: "1. Navegue pelos cards ilustrados divididos por categoria (Corte e Chapas, Conexões, Usinados, Fixação, etc.).\n2. Verifique a etiqueta de status do produto ('Pronto para produção' ou 'Parcial - insumo em falta').\n3. Clique sobre qualquer produto para abrir o modal com a lista de componentes, roteiro de montagem e botão 'Baixar Ficha de Procedimento (PDF)'."
    },

    kanban: {
      nome: "Kanban Industrial",
      chaves: ["kanban", "quadro kanban", "esteira kanban", "tarefas"],
      objetivo: "Proporcionar uma gestão visual ágil do fluxo de trabalho industrial, dividindo os cartões por etapas de evolução.",
      comoUsar: "1. Alterne no topo entre 'Kanban de Produção (OPs)' e 'Tarefas Operacionais / Suporte'.\n2. Aplique filtros rápidos por prioridade, operador ou categoria.\n3. Acompanhe os cartões organizados nas colunas: Planejamento, Em Produção, Controle QA e Pronto / Expedição.\n4. Clique no botão '+ Nova OP' para inserir uma ordem diretamente na esteira."
    },

    qrcode: {
      nome: "Leitor de QR Code / Código de Barras",
      chaves: ["qr code", "qrcode", "leitor", "escanear", "codigo de barras", "leitura manual"],
      objetivo: "Agilizar a consulta e validação de peças, insumos e lotes através de leitura óptica de câmera ou busca rápida por código.",
      comoUsar: "1. Para leitura por câmera: Clique no botão azul 'Iniciar leitura' e aponte a câmera do dispositivo para o código colado na peça.\n2. Para busca manual: Digite o código do insumo (ex: MP-1042 ou P-0248) no bloco 'Entrada Manual' e clique em 'Buscar'.\n3. Consulte o histórico recente na lista 'Leituras Recentes'."
    },

    estoque: {
      nome: "Itens em Estoque / Almoxarifado",
      chaves: ["itens em estoque", "estoque", "almoxarifado", "insumos", "materia prima", "saldo", "capacidade"],
      objetivo: "Controlar o saldo físico, movimentações diárias, capacidade de armazenamento por categoria e alertas de ponto de reordem.",
      comoUsar: "1. Consulte as barras de 'Capacidade por Categoria' (Matéria-Prima, Componentes, Embalagens, etc.).\n2. Verifique os 'Alertas de Reposição' no card superior direito para identificar produtos com saldo crítico.\n3. Na tabela 'Consulta de itens', utilize os filtros por nível (Normal, Baixo, Crítico) ou busque por código.\n4. Dê baixas ou entradas rápidas clicando nos botões '+' e '-' da coluna 'Ação Rápida'."
    },

    logistica: {
      nome: "Logística & Expedição",
      chaves: ["logistica", "expedicao", "esteira de separacao", "embalagem", "ocupacao de carga", "atividade recente"],
      objetivo: "Gerenciar a esteira de preparação de cargas para envio, alocação de motoristas por veículo e histórico de movimentação da expedição.",
      comoUsar: "1. Acompanhe os pedidos nas colunas da esteira: Aguardando Separação, Em Separação, Embalagem, Em Expedição e Entregue.\n2. Clique nos botões 'Avançar' ou 'Voltar' no card do pedido para movimentá-lo entre as etapas.\n3. No painel 'Frota & Motoristas', verifique o percentual de ocupação de carga de cada veículo.\n4. Consulte o feed 'Atividade recente' para ver horários de saída de cargas e entregas."
    },

    rastreamento: {
      nome: "Rastreamento GPS & Telemetria",
      chaves: ["rastreamento", "gps", "telemetria", "mapa", "velocidade", "temperatura", "tanque"],
      objetivo: "Monitorar a localização exata da frota em rota no mapa interativo com dados de velocidade, temperatura do baú e combustível em tempo real.",
      comoUsar: "1. Filtre a lista por status (Em Preparação, Em Trânsito, Entregues) ou pesquise por motorista/código no campo de busca.\n2. Clique em qualquer entrega na lista à esquerda (ex: SL-982347-BR) para traçar a rota no mapa.\n3. Acompanhe a linha do tempo no card 'Progresso da Entrega' (Preparação -> Coletado -> Em Trânsito -> Entregue).\n4. Consulte os relógios do bloco 'Telemetria' para ver velocidade (km/h), temperatura (°C) e nível de bateria/tanque (%)."
    },

    fornecedores: {
      nome: "Gestão de Fornecedores",
      chaves: ["fornecedores", "parceiros", "homologados", "cotacao", "cnpj", "compras do mes"],
      objetivo: "Cadastrar e homologar parceiros comerciais, acompanhar o histórico de compras e consultar insumos fornecidos por empresa.",
      comoUsar: "1. Verifique os indicadores no topo: Total Cadastrados (6), Ativos/Homologados (4), Compras do Mês (R$ 142.800) e Pedidos Pendentes (3).\n2. Filtre por situação: Ativos, Homologados, Em Análise ou Bloqueados.\n3. Digite a Razão Social ou CNPJ no campo de busca.\n4. Clique em '+ Novo Fornecedor' para cadastrar um parceiro ou utilize os ícones da coluna 'Ações' para editar/excluir."
    },

    relatorios: {
      nome: "Relatórios & Exportação Analítica",
      chaves: ["relatorios", "exportacao", "exportar pdf", "exportar excel", "consolidado", "dre"],
      objetivo: "Consolidar dados operacionais e financeiros em relatórios gerenciais prontos para impressão ou exportação em PDF e Excel.",
      comoUsar: "1. Escolha o período desejado (Data inicial / final) e filtre por setor no cabeçalho.\n2. Selecione o relatório específico que deseja emitir (Produção, Pedidos, Estoque, Logística ou Desempenho).\n3. Clique no botão 'PDF' ou 'Excel' no card correspondente para baixar o arquivo.\n4. Para um documento completo de auditoria, utilize o botão 'Baixar consolidado'."
    },

    cadastro: {
      nome: "Cadastro de Funcionários",
      chaves: ["cadastro de funcionarios", "cadastrar usuario", "novo funcionario", "colaboradores", "permissao"],
      objetivo: "Registrar novos colaboradores no sistema, definir setor de atuação, CPF, e-mail e credenciais de acesso.",
      comoUsar: "1. Preencha os campos obrigatórios: Nome Completo, CPF, E-mail e selecione a Área de Atuação.\n2. Digite uma senha de acesso e verifique o medidor de força da senha.\n3. Clique no botão azul 'Cadastrar' para salvar ou em 'Limpar' para resetar o formulário.\n4. Clique no botão 'Ver cadastrados' no canto superior direito para ver a lista de colaboradores ativos."
    },

    perfil: {
      nome: "Minha Conta / Perfil",
      chaves: ["minha conta", "perfil", "meu perfil", "usuario logado", "alterar senha", "preferencias"],
      objetivo: "Exibir o resumo do usuário conectado, matrícula, setor, eficiências da equipe e gerenciar configurações de segurança da conta.",
      comoUsar: "1. Consulte seus dados no cabeçalho principal e no bloco 'Informações Pessoais' (E-mail, Cargo, Setor, Matrícula e Nível de Acesso).\n2. Verifique suas estatísticas individuais (Ordens criadas, Eficiência da equipe e Alertas resolvidos).\n3. Utilize os botões inferiores para 'Editar perfil', 'Alterar senha', ajustar 'Preferências' do sistema ou clicar em 'Sair'."
    }
  };

  /* ==========================================================================
     2. DICIONÁRIO CONCEITUAL TÉCNICO
     ========================================================================== */
  const DicionarioConceitos = {
    objetivo_sistema: {
      termo: "StockLog v2.4 — Sistema de Gestão Industrial & Logística (ERP/MES)",
      definicao: "O StockLog é uma plataforma integrada de gestão industrial (MES) e logística (ERP) desenvolvida para conectar e automatizar toda a cadeia de suprimentos e fabricação de uma empresa em tempo real.",
      oQueFaz: [
        "🏭 **Chão de Fábrica & OPs:** Controla o ciclo de vida das Ordens de Produção, Kanban, máquinas ativas e índice OEE.",
        "📦 **Estoque & Insumos:** Gerencia a capacidade de armazenamento, matéria-prima, alertas de nível crítico e leitura por QR Code.",
        "🚚 **Logística & Expedição:** Acompanha a esteira de separação, embalagem, alocação de motoristas e frotas.",
        "📡 **Telemetria GPS:** Monitora veículos em rota com dados de velocidade, temperatura do baú e combustível ao vivo.",
        "📊 **Relatórios & DRE:** Emite balanços consolidados em PDF e Excel para auditoria e tomada de decisão.",
        "📅 **Agenda Integrada:** Sincroniza compromissos, treinamentos, manutenções e prazos de entregas."
      ]
    },
    logistica: {
      termo: "Logística e Expedição",
      definicao: "Gerenciamento do fluxo de transporte, separação de pedidos, embalagem, expedição e entrega de produtos.",
      noStockLog: "No StockLog, o módulo de Logística monitora a esteira de expedição (Aguardando Separação, Em Separação, Embalagem, Em Expedição e Entregue), além de controlar a ocupação da frota e a telemetria GPS em tempo real."
    },
    oee: {
      termo: "OEE (Overall Equipment Effectiveness)",
      definicao: "Indicador global que mede a eficiência das máquinas multiplicando: Disponibilidade (%) × Performance (%) × Qualidade (%). A meta padrão da indústria é ≥ 85%.",
      noStockLog: "No painel de Controle de Produção, o StockLog calcula a eficiência e o ritmo de produção por máquina, identificando problemas como falha elétrica, vibração fora do padrão e falta de insumo."
    },
    estoque: {
      termo: "Gestão de Estoque e Curva ABC",
      definicao: "Controle físico e financeiro do saldo de matérias-primas, componentes, embalagens, consumíveis e ferramentas.",
      noStockLog: "O StockLog exibe a capacidade por categoria, alerta reposições críticas (ex: Martelo MT-8888) e permite dar entrada/saída rápida com leitor de QR Code."
    },
    op: {
      termo: "Ordem de Produção (OP)",
      definicao: "Instrução de fabricação que define o produto, lote, setor responsável, prazo limite e roteiro de usinagem/corte/montagem.",
      noStockLog: "As OPs são acompanhadas no Kanban industrial, Pedidos de Produção e no gráfico de 'Produção por Setor' (Corte 91%, Usinagem 86%, Caldeiraria 78%, Solda 72%, Pintura 65%, Montagem 58%)."
    },
    qr_code: {
      termo: "Leitor de QR Code & Código de Barras",
      definicao: "Módulo de leitura óptica para identificação rápida de peças e insumos.",
      noStockLog: "Permite escanear etiquetas coladas nas peças via câmera ou busca manual por códigos (ex: MP-1042, P-0248) para rastrear o histórico e saldo do lote."
    }
  };

  /* ==========================================================================
     3. BANCO DE DADOS OFICIAL VALIDADO (EXTRAÍDO DAS TELAS REAIS)
     ========================================================================== */
  const BancoDadosOficial = {
    dashboard: {
      pedidosEmAberto: 42,
      taxaEntrega: "86%",
      itensEstoqueTotal: 1247,
      opsAtivas: 24,
      alertasAtivos: 23,
      alertasCriticos: [
        { id: "#1042", tipo: "Atraso na Produção", detalhe: "Falha na máquina de corte a laser, parada para manutenção corretiva. Venceu há 5 dias.", gravidade: "Crítico" },
        { id: "#1031", tipo: "Aguardando Matéria-Prima", detalhe: "Fornecedor não entregou o lote de aço ABNT 1045 no prazo. Venceu há 12 dias.", gravidade: "Crítico" },
        { id: "OP-2026-007", tipo: "Prazo Crítico", detalhe: "Fila de usinagem sobrecarregada por acúmulo de ordens simultâneas. Vence em 2 dias.", gravidade: "Alto" }
      ]
    },

    agenda: {
      totalCompromissos: 10,
      urgentes: 1,
      nosProximos7Dias: 0,
      prazosVencimentos: 5,
      linkPagina: "calendario.html"
    },

    pedidosValidos: [
      { op: "OP-2026-001", cliente: "Metalúrgica Souza", produto: "Flange Aço ABNT 1020 ø50mm", qtd: 500, setor: "Corte / Prensa", dataLimite: "24/06/2026", status: "Em Produção", responsavel: "Gustavo" },
      { op: "OP-2026-002", cliente: "Indústrias Ribeiro", produto: "Eixo Vazado 420mm", qtd: 120, setor: "Usinagem / Torno", dataLimite: "11/06/2026", status: "Controle QA", responsavel: "Ana Ferre" },
      { op: "PED-2026-003", cliente: "Peças & Cia Ltda", produto: "Suporte Estrutural Perfil U", qtd: 80, setor: "Solda / Caldeiraria", dataLimite: "15/05/2026", status: "Em Andamento", responsavel: "Carlos" },
      { op: "OP-2026-003", cliente: "Cliente Geral", produto: "Arduino (Kit de Controle)", qtd: 500, setor: "Eletrônica", dataLimite: "09/09/2026", status: "Em Produção", responsavel: "Ana" }
    ],

    maquinasValidas: [
      { nome: "Prensa Hidráulica 01", status: "Operando", op: "OP-2025-001", operador: "Gustavo Lima", progresso: "620 / 800 pçs (77%)" },
      { nome: "Torno CNC 02", status: "Operando", op: "OP-2025-002", operador: "Ana Ferreira", progresso: "95 / 120 pçs (79%)" },
      { nome: "Solda Robotizada 03", status: "Parada", op: "Nenhuma", operador: "Ricardo Ribeiro", detalhe: "Falha elétrica detectada há 30 min (Gravidade: Crítico)" },
      { nome: "Injetora Plástica 04", status: "Operando", op: "OP-2025-004", operador: "Vinicius Carvalho", progresso: "1.480 / 2.000 pçs (74%)" },
      { nome: "Corte a Laser 05", status: "Manutenção", op: "Preventiva", operador: "Bruno Ferreira", detalhe: "Parada para manutenção preventiva programada" },
      { nome: "Embaladora 06", status: "Operando", op: "OP-2025-005", operador: "Camila Souza", progresso: "270 / 300 pçs (90%)" }
    ],

    estoqueValido: [
      { cod: "MT-8888", item: "Martelo Industrial", categoria: "Embalagens / Ferramental", saldo: 1, minimo: 20, status: "🔴 Crítico (Apenas 1 un em estoque)" },
      { cod: "MP-1042", item: "Chapa de Aço Inox 304", categoria: "Matéria-Prima", saldo: 12, minimo: 50, status: "🔴 Crítico (Atraso de 2 dias no lote)" },
      { cod: "P-0248", item: "Luva Nitrílica Reforçada", categoria: "Consumíveis", saldo: 40, minimo: 100, status: "🟡 Baixo" }
    ],

    logistica: {
      rastreamentoGPS: [
        { id: "SL-982347-BR", carga: "Lote Eletrônicos Industriais", motorista: "Marcos Oliveira (Renault Master ABC-4E89)", destino: "Campinas - SP", vel: "78 km/h", temp: "21°C", tanque: "84%", status: "Em Trânsito" },
        { id: "SL-554102-BR", carga: "Chapas de Aço Inox (5 T)", motorista: "Roberto Alves (Scania R450 DEF-1A23)", destino: "Santos - SP", vel: "62 km/h", temp: "N/A", tanque: "65%", status: "Em Trânsito" },
        { id: "SL-120938-BR", carga: "Caixas de Óleo Lubrificante", motorista: "Ana Paula Souza (VW Delivery GHI-9012)", destino: "Guarulhos - SP", vel: "0 km/h", temp: "25°C", tanque: "100%", status: "Em Preparação" },
        { id: "SL-773411-BR", carga: "Componentes Hidráulicos", motorista: "Carlos Eduardo (Mercedes Sprinter JKL-3456)", destino: "Sorocaba - SP", vel: "0 km/h", temp: "20°C", tanque: "42%", status: "Entregue" }
      ]
    },

    fornecedores: [
      { nome: "Metalúrgica Silva Ltda", cnpj: "12.345.678/0001-90", contato: "Carlos Eduardo (11 98765-4321)", produtos: "Chapa Aço Inox 304, Perfil de Alumínio", compras: "R$ 84.500 (28 pedidos)", status: "Ativo" },
      { nome: "Rolamentos & Cia Indústria", cnpj: "98.765.432/0001-10", contato: "Fernanda Lima (19 3412-8800)", produtos: "Rolamento 6204-ZZ, Retentor de Borracha", compras: "R$ 32.100 (14 pedidos)", status: "Homologado" },
      { nome: "Química Industrial Nordeste", cnpj: "45.123.890/0001-55", contato: "Ricardo Santos (81 99123-0044)", produtos: "Resina Epóxi, Solvente Degraxe", compras: "R$ 18.200 (5 pedidos)", status: "Em Análise" }
    ],

    usuarioLogado: {
      nome: "Gabriel Silva",
      cargo: "Gestão",
      email: "visitante@gmail.com",
      setor: "Gestão / Operações",
      matricula: "979361",
      cadastro: "01/10/2026"
    }
  };

  /* ==========================================================================
     4. INSPEÇÃO DO DOM EM TEMPO REAL
     ========================================================================== */
  const InspectorDOM = {
    obterEstadoAtual() {
      const inputs = Array.from(document.querySelectorAll("input, select, textarea"))
        .filter(i => ehDadoValido(i.value))
        .map(i => {
          const label = document.querySelector(`label[for="${i.id}"]`) || i.closest(".form-group")?.querySelector("label");
          const nomeCampo = label ? label.innerText.replace("*", "").trim() : (i.name || i.id || "campo");
          return {
            campo: nomeCampo,
            valor: i.type === "password" ? (i.value ? "••••••••" : "[Vazio]") : i.value
          };
        });

      const alerta = document.querySelector(".mensagem-alerta");
      const textoAlerta = (alerta && window.getComputedStyle(alerta).display !== "none") ? alerta.innerText.trim() : null;

      return { inputs, textoAlerta };
    }
  };

  /* ==========================================================================
     5. MOTOR PROCESSADOR DE INTENÇÃO E RESPOSTAS HIPERINTELIGENTE
     ========================================================================== */
  function processarPergunta(pergunta) {
    const p = normalizarTexto(pergunta);
    const dom = InspectorDOM.obterEstadoAtual();

    // ------------------------------------------------------------------------
    // REGRA 1: REDIRECIONAMENTO DE AGENDA / COMPROMISSOS (REQUISITO OBRIGATÓRIO)
    // ------------------------------------------------------------------------
    if (
      p.includes("agenda") || p.includes("compromisso") || p.includes("calendario") ||
      p.includes("reuniao") || p.includes("treinamento") || p.includes("evento") ||
      p.includes("sincronizar") || (p.includes("vencimento") && p.includes("proximo"))
    ) {
      return `📅 <b>Agenda & Calendário do StockLog:</b><br><br>` +
             `Para visualizar, agendar ou editar seus compromissos, acesse a página de <b>Agenda</b> pelo menu lateral ou clique no link abaixo:<br><br>` +
             `• <b>Total de Compromissos:</b> ${BancoDadosOficial.agenda.totalCompromissos}<br>` +
             `• <b>Urgentes:</b> ${BancoDadosOficial.agenda.urgentes}<br>` +
             `• <b>Prazos / Vencimentos de OPs:</b> ${BancoDadosOficial.agenda.prazosVencimentos}<br><br>` +
             `👉 <a href="${BancoDadosOficial.agenda.linkPagina}" style="color:var(--primary); font-weight:700; text-decoration:underline;">Clique aqui para abrir a Agenda Completa</a>`;
    }

    // ------------------------------------------------------------------------
    // REGRA 2: CONSULTA DE PÁGINA ESPECÍFICA (OBJETIVO E COMO USAR)
    // ------------------------------------------------------------------------
    for (const [key, info] of Object.entries(PaginasSistema)) {
      const matchKey = info.chaves.some(chave => p.includes(normalizarTexto(chave)));
      if (matchKey && (p.includes("como usa") || p.includes("como usar") || p.includes("objetivo") || p.includes("para que serve") || p.includes("pagina") || p.includes("tela") || p.includes("expliqu"))) {
        let passosFormatados = info.comoUsar.replace(/\n/g, "<br>");
        return `📌 <b>Página: ${info.nome}</b><br><br>` +
               `🎯 <b>Objetivo Principal:</b><br>${info.objetivo}<br><br>` +
               `🛠️ <b>Como Utilizar Passo a Passo:</b><br>${passosFormatados}`;
      }
    }

    // ------------------------------------------------------------------------
    // REGRA 3: LISTA DE TODAS AS PÁGINAS E TELAS DO SISTEMA
    // ------------------------------------------------------------------------
    if (p.includes("quais sao as paginas") || p.includes("todas as paginas") || p.includes("todas as telas") || p.includes("lista de paginas") || p.includes("menu")) {
      let res = `<b>📋 Guia de Páginas e Telas do StockLog v2.4 (14 Módulos):</b><br><br>`;
      Object.values(PaginasSistema).forEach((item, index) => {
        res += `<b>${index + 1}. ${item.nome}:</b><br>└ <i>${item.objetivo}</i><br><br>`;
      });
      res += `💡 <i>Para saber como usar qualquer uma dessas telas, basta me perguntar por exemplo: "Como usar a página de Rastreamento?" ou "Qual o objetivo da página Kanban?".</i>`;
      return res;
    }

    // ------------------------------------------------------------------------
    // REGRA 4: OBJETIVO E FUNCIONALIDADE DO SISTEMA ("O que o sistema faz?")
    // ------------------------------------------------------------------------
    if (
      p.includes("o que esse sistema faz") || p.includes("qual o objetivo") || p.includes("para que serve") ||
      p.includes("sobre o sistema") || p.includes("o que e o stocklog") || p.includes("o que e esse sistema") ||
      p.includes("funcionalidade") || p.includes("recursos do sistema") || p.includes("resumo do sistema")
    ) {
      let res = `<b>${DicionarioConceitos.objetivo_sistema.termo}</b><br><br>` +
                `${DicionarioConceitos.objetivo_sistema.definicao}<br><br>` +
                `📌 <b>Principais Módulos e Recursos:</b><br><br>`;
      DicionarioConceitos.objetivo_sistema.oQueFaz.forEach(item => {
        res += `${item}<br><br>`;
      });
      res += `💡 <i>Você pode me perguntar o objetivo e como usar cada uma das 14 telas do sistema a qualquer momento!</i>`;
      return res;
    }

    // ------------------------------------------------------------------------
    // REGRA 5: DÚVIDAS CONCEITUAIS ("O que é X?")
    // ------------------------------------------------------------------------
    if (p.startsWith("o que e") || p.startsWith("o que significa") || p.startsWith("conceito") || p.startsWith("defina")) {
      if (p.includes("logistica")) {
        return `<b>${DicionarioConceitos.logistica.termo}:</b><br><br>${DicionarioConceitos.logistica.definicao}<br><br>📦 <b>No StockLog:</b><br>${DicionarioConceitos.logistica.noStockLog}`;
      }
      if (p.includes("oee")) {
        return `<b>${DicionarioConceitos.oee.termo}:</b><br><br>${DicionarioConceitos.oee.definicao}<br><br>⚙️ <b>No StockLog:</b><br>${DicionarioConceitos.oee.noStockLog}`;
      }
      if (p.includes("estoque")) {
        return `<b>${DicionarioConceitos.estoque.termo}:</b><br><br>${DicionarioConceitos.estoque.definicao}<br><br>🏭 <b>No StockLog:</b><br>${DicionarioConceitos.estoque.noStockLog}`;
      }
      if (p.includes("op") || p.includes("ordem de producao")) {
        return `<b>${DicionarioConceitos.op.termo}:</b><br><br>${DicionarioConceitos.op.definicao}<br><br>📋 <b>No StockLog:</b><br>${DicionarioConceitos.op.noStockLog}`;
      }
      if (p.includes("qr code") || p.includes("codigo")) {
        return `<b>${DicionarioConceitos.qr_code.termo}:</b><br><br>${DicionarioConceitos.qr_code.definicao}<br><br>📱 <b>No StockLog:</b><br>${DicionarioConceitos.qr_code.noStockLog}`;
      }
    }

    // ------------------------------------------------------------------------
    // REGRA 6: INSPECIONAR TELA ATUAL E FORMULÁRIO
    // ------------------------------------------------------------------------
    if (p.includes("analisar o que esta na tela") || p.includes("tela") || p.includes("formulario") || p.includes("erro")) {
      let res = "<b>Diagnóstico da Tela Atual:</b><br><br>";
      if (dom.textoAlerta) {
        res += `⚠️ <b>Alerta na Tela:</b> "${dom.textoAlerta}"<br><br>`;
      }
      if (dom.inputs.length > 0) {
        res += "<b>Campos Preenchidos Detectados:</b><br>";
        dom.inputs.forEach(i => {
          res += `• <b>${i.campo}:</b> <code>${i.valor}</code><br>`;
        });
      } else {
        res += "Não há campos preenchidos com valores ativos na tela neste momento.";
      }
      return res;
    }

    // ------------------------------------------------------------------------
    // REGRA 7: ESTOQUE (PRODUTOS EM FALTA VS PRODUTOS COM SOBRA/DEMORA DE REPOSIÇÃO)
    // ------------------------------------------------------------------------
    if (p.includes("demorar") || p.includes("demora") || p.includes("nao precisa") || p.includes("sobrando") || p.includes("alto")) {
      return `<b>Análise de Estoque Confortável (Alta Duração):</b><br><br>` +
             `Com base na capacidade atual dos setores:<br>` +
             `• <b>Embalagens:</b> Capacidade em 100% (223 / 112 itens armazenados).<br>` +
             `• <b>Ferramental:</b> Capacidade em 62% (62 / 100 itens).<br><br>` +
             `Estes grupos possuem cobertura de estoque suficiente e <b>não necessitam de reposição nos próximos dias</b>.`;
    }

    if (p.includes("falta") || p.includes("critico") || p.includes("urgente") || p.includes("comprar") || p.includes("baixo")) {
      let res = `<b>Itens em Nível Crítico e Alertas de Reposição:</b><br><br>`;
      BancoDadosOficial.estoqueValido.forEach(i => {
        res += `• <b>${i.item} (${i.cod}):</b> ${i.status}<br>`;
      });
      res += `<br>⚠️ <i>Alerta ativo: Atraso de 2 dias na entrega de Chapa Inox 304 pelo fornecedor.</i>`;
      return res;
    }

    // ------------------------------------------------------------------------
    // REGRA 8: MÁQUINAS, CHÃO DE FÁBRICA E PROBLEMAS ATIVOS
    // ------------------------------------------------------------------------
    if (p.includes("maquina") || p.includes("operando") || p.includes("torno") || p.includes("prensa") || p.includes("solda") || p.includes("problema")) {
      let res = `<b>Status do Chão de Fábrica (7 Máquinas Registradas):</b><br><br>`;
      BancoDadosOficial.maquinasValidas.forEach(m => {
        if (m.status === "Operando") {
          res += `🟢 <b>${m.nome}:</b> Operando (${m.op}) | Op: ${m.operador} | Progresso: ${m.progresso}<br>`;
        } else {
          res += `🔴 <b>${m.nome}:</b> ${m.status} (${m.detalhe})<br>`;
        }
      });
      res += `<br>🚨 <b>Problema Alerta:</b> Falha de pressão hidráulica detectada na Linha 03 (Torno CNC) há 42 min.`;
      return res;
    }

    // ------------------------------------------------------------------------
    // REGRA 9: PEDIDOS, OPS E ATRASOS DE PRODUÇÃO
    // ------------------------------------------------------------------------
    if (p.includes("pedido") || p.includes("op") || p.includes("atraso") || p.includes("prazo") || p.includes("andamento")) {
      let res = `<b>Ordens de Produção e Pedidos Recentes:</b><br><br>`;
      BancoDadosOficial.pedidosValidos.forEach(p => {
        res += `• <b>${p.op}:</b> ${p.produto} (${p.qtd} un) | Cliente: ${p.cliente} | Prazo: <b>${p.dataLimite}</b> | Status: ${p.status}<br>`;
      });
      res += `<br>⚠️ <b>IA Alerta:</b> Gargalo previsto na OP-2026-001 por sobrecarga na fila de usinagem.`;
      return res;
    }

    // ------------------------------------------------------------------------
    // REGRA 10: LOGÍSTICA, ENTREGAS, FROTA E RASTREAMENTO GPS
    // ------------------------------------------------------------------------
    if (p.includes("logistica") || p.includes("entrega") || p.includes("frota") || p.includes("motorista") || p.includes("rastre") || p.includes("gps") || p.includes("sl-")) {
      let res = `<b>Rastreamento de Frota & Telemetria em Tempo Real:</b><br><br>`;
      BancoDadosOficial.logistica.rastreamentoGPS.forEach(r => {
        res += `🚚 <b>${r.id}</b> (${r.carga}): ${r.status}<br>` +
               `   └ Destino: ${r.destino} | Motorista: ${r.motorista}<br>` +
               `   └ Telemetria: ${r.vel} | Temp Baú: ${r.temp} | Combustível: ${r.tanque}<br><br>`;
      });
      return res;
    }

    // ------------------------------------------------------------------------
    // REGRA 11: FORNECEDORES E HOMOLOGAÇÃO
    // ------------------------------------------------------------------------
    if (p.includes("fornecedor") || p.includes("homologado") || p.includes("compras") || p.includes("cnpj")) {
      let res = `<b>Parceiros e Fornecedores Cadastrados (4 Homologados / 6 Total):</b><br><br>`;
      BancoDadosOficial.fornecedores.forEach(f => {
        res += `• <b>${f.nome}:</b> ${f.produtos} (${f.compras}) - Status: <b>${f.status}</b><br>`;
      });
      return res;
    }

    // ------------------------------------------------------------------------
    // REGRA 12: CADASTRO DE FUNCIONÁRIOS
    // ------------------------------------------------------------------------
    if (p.includes("cadastrar") || p.includes("usuario") || p.includes("funcionario") || p.includes("perfil")) {
      return `<b>Cadastro de Funcionários e Acessos:</b><br><br>` +
             `Para registrar um novo colaborador no StockLog:<br>` +
             `1. Preencha Nome Completo, CPF e E-mail corporativo.<br>` +
             `2. Selecione a <b>Área de Atuação</b> (Gestão, Corte, Usinagem, Solda, Logística).<br>` +
             `3. Digite uma Senha de Acesso segura.<br>` +
             `4. Clique no botão azul <b>Cadastrar</b>.<br><br>` +
             `👤 <b>Seu Usuário Atual:</b> ${BancoDadosOficial.usuarioLogado.nome} (${BancoDadosOficial.usuarioLogado.cargo}) | Matrícula: ${BancoDadosOficial.usuarioLogado.matricula}`;
    }

    // ------------------------------------------------------------------------
    // SAUDAÇÕES E FALLBACK
    // ------------------------------------------------------------------------
    if (p.includes("ola") || p.includes("oi") || p.includes("bom dia") || p.includes("boa tarde") || p.includes("boa noite")) {
      return `Olá, <b>${BancoDadosOficial.usuarioLogado.nome}</b>! Sou o **LogBot**, assistente oficial do StockLog v2.4.<br><br>Como posso te ajudar hoje com as OPs, frota, máquinas, agenda ou com o guia de uso de alguma página?`;
    }

    return `Compreendi sua dúvida sobre <b>"${pergunta}"</b>.<br><br>` +
           `Como assistente do StockLog v2.4, posso responder com dados reais do seu sistema. Tente perguntar:<br>` +
           `• <i>"O que esse sistema faz?"</i><br>` +
           `• <i>"Como usar a página de Rastreamento?"</i><br>` +
           `• <i>"Quais são todas as páginas do sistema?"</i><br>` +
           `• <i>"Analisar o que está na tela"</i><br>` +
           `• <i>"Quais compromissos tenho na agenda?"</i>`;
  }

  /* ==========================================================================
     6. RENDERIZAÇÃO DA INTERFACE DO CHATBOT E EVENTOS
     ========================================================================== */
  function inicializarChatbot() {
    let root = document.getElementById("chatbot-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "chatbot-root";
      document.body.appendChild(root);
    }

    root.innerHTML =
      '<button class="chatbot-toggle" id="chatbot-toggle-btn" aria-label="Abrir Chat LogBot">' +
        '<i class="fa-solid fa-comments"></i>' +
      '</button>' +
      '<div class="chatbot-window" id="chatbot-window">' +
        '<div class="chatbot-header">' +
          '<div class="chatbot-avatar"><i class="fa-solid fa-robot"></i></div>' +
          '<div class="chatbot-info"><h4>LogBot</h4><p>Assistente StockLog v2.4</p></div>' +
          '<button class="chatbot-close" id="chatbot-close-btn" aria-label="Fechar"><i class="fa-solid fa-xmark"></i></button>' +
        '</div>' +
        '<div class="chatbot-messages" id="chatbot-messages"></div>' +
        '<div class="chatbot-input-area">' +
          '<input type="text" id="chatbot-input" class="chatbot-input" placeholder="Digite ou pergunte algo..." autocomplete="off" />' +
          '<button class="chatbot-voice" id="chatbot-voice-btn" title="Falar por Voz"><i class="fa-solid fa-microphone"></i></button>' +
          '<button class="chatbot-send" id="chatbot-send-btn" title="Enviar Mensagem"><i class="fa-solid fa-paper-plane"></i></button>' +
        '</div>' +
      '</div>';

    const toggleBtn = document.getElementById("chatbot-toggle-btn");
    const closeBtn = document.getElementById("chatbot-close-btn");
    const chatWindow = document.getElementById("chatbot-window");
    const chatMessages = document.getElementById("chatbot-messages");
    const chatInput = document.getElementById("chatbot-input");
    const sendBtn = document.getElementById("chatbot-send-btn");
    const voiceBtn = document.getElementById("chatbot-voice-btn");

    // Sugestões padrão do topo mantidas rigorosamente
    const sugestoesPrincipais = [
      "Analisar o que está na tela",
      "Quais máquinas estão operando?",
      "Materiais em falta no estoque",
      "Status das entregas e frota",
      "Como cadastrar um usuário?"
    ];

    let chatIniciado = false;

    function abrirChat() {
      chatWindow.classList.add("open");
      toggleBtn.classList.add("open");
      if (!chatIniciado) {
        iniciarConversa();
        chatIniciado = true;
      }
    }

    function fecharChat() {
      chatWindow.classList.remove("open");
      toggleBtn.classList.remove("open");
    }

    toggleBtn.addEventListener("click", abrirChat);
    closeBtn.addEventListener("click", fecharChat);

    function obterHoraAtual() {
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function iniciarConversa() {
      const msgDiv = document.createElement("div");
      msgDiv.className = "chatbot-msg bot";

      const textoBase = "Olá! Eu sou o <strong>LogBot</strong>, assistente inteligente do StockLog.<br><br>Como posso te ajudar com a fábrica, estoque ou sistema agora?";

      const suggestionsDiv = document.createElement("div");
      suggestionsDiv.className = "chatbot-suggestions";

      sugestoesPrincipais.forEach((texto) => {
        const btn = document.createElement("button");
        btn.className = "chatbot-suggestion";
        btn.innerText = texto;
        btn.onclick = () => {
          chatInput.value = texto;
          processarEnvio();
        };
        suggestionsDiv.appendChild(btn);
      });

      const timeSpan = document.createElement("span");
      timeSpan.className = "msg-time";
      timeSpan.innerText = obterHoraAtual();

      msgDiv.innerHTML = textoBase;
      msgDiv.appendChild(suggestionsDiv);
      msgDiv.appendChild(timeSpan);

      chatMessages.appendChild(msgDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function adicionarMensagem(autor, texto, hora) {
      const msgDiv = document.createElement("div");
      msgDiv.className = "chatbot-msg " + autor;

      let textoFormatado = texto.replace(/\n/g, "<br>");
      textoFormatado = textoFormatado.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

      msgDiv.innerHTML = textoFormatado + '<span class="msg-time">' + (hora || obterHoraAtual()) + "</span>";

      chatMessages.appendChild(msgDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function mostrarTyping() {
      const typingDiv = document.createElement("div");
      typingDiv.className = "chatbot-typing";
      typingDiv.id = "chatbot-typing-indicator";
      typingDiv.innerHTML = "<span></span><span></span><span></span>";
      chatMessages.appendChild(typingDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removerTyping() {
      const typing = document.getElementById("chatbot-typing-indicator");
      if (typing) typing.remove();
    }

    function processarEnvio() {
      const texto = chatInput.value.trim();
      if (!texto) return;

      adicionarMensagem("user", texto);
      chatInput.value = "";

      mostrarTyping();

      setTimeout(() => {
        const resposta = processarPergunta(texto);
        removerTyping();
        adicionarMensagem("bot", resposta);
      }, 350);
    }

    sendBtn.addEventListener("click", processarEnvio);
    chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") processarEnvio();
    });

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "pt-BR";
      recognition.continuous = false;
      recognition.interimResults = false;

      voiceBtn.addEventListener("click", () => {
        if (voiceBtn.classList.contains("listening")) {
          recognition.stop();
        } else {
          recognition.start();
        }
      });

      recognition.onstart = () => {
        voiceBtn.classList.add("listening");
        chatInput.placeholder = "Ouvindo você...";
      };

      recognition.onresult = (event) => {
        chatInput.value = event.results[0][0].transcript;
        processarEnvio();
      };

      recognition.onerror = () => {
        voiceBtn.classList.remove("listening");
        chatInput.placeholder = "Digite ou pergunte algo...";
      };

      recognition.onend = () => {
        voiceBtn.classList.remove("listening");
        chatInput.placeholder = "Digite ou pergunte algo...";
      };
    } else {
      voiceBtn.style.display = "none";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializarChatbot);
  } else {
    inicializarChatbot();
  }
})();