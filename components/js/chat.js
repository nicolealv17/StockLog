const OPENROUTER_MODEL = "openai/gpt-4o-mini";

function obterChaveAPI() {
  if (typeof CONFIG !== "undefined" && CONFIG.OPENROUTER_API_KEY) {
    return CONFIG.OPENROUTER_API_KEY.trim();
  }
  if (typeof OPENROUTER_API_KEY !== "undefined" && OPENROUTER_API_KEY) {
    return OPENROUTER_API_KEY.trim();
  }
  return "";
}

document.addEventListener("DOMContentLoaded", () => {
  function inicializarDOMChatbot() {
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
          '<div class="chatbot-avatar">' +
            '<i class="fa-solid fa-robot"></i>' +
          '</div>' +
          '<div class="chatbot-info">' +
            '<h4>LogBot</h4>' +
            '<p>Assistente StockLog</p>' +
          '</div>' +
          '<button class="chatbot-close" id="chatbot-close-btn" aria-label="Fechar">' +
            '<i class="fa-solid fa-xmark"></i>' +
          '</button>' +
        '</div>' +
        '<div class="chatbot-messages" id="chatbot-messages"></div>' +
        '<div class="chatbot-input-area">' +
          '<input type="text" id="chatbot-input" class="chatbot-input" placeholder="Digite ou pergunte algo..." autocomplete="off" />' +
          '<button class="chatbot-voice" id="chatbot-voice-btn" title="Falar por Voz">' +
            '<i class="fa-solid fa-microphone"></i>' +
          '</button>' +
          '<button class="chatbot-send" id="chatbot-send-btn" title="Enviar Mensagem">' +
            '<i class="fa-solid fa-paper-plane"></i>' +
          '</button>' +
        '</div>' +
      '</div>';
  }

  inicializarDOMChatbot();

  const toggleBtn = document.getElementById("chatbot-toggle-btn");
  const closeBtn = document.getElementById("chatbot-close-btn");
  const chatWindow = document.getElementById("chatbot-window");
  const chatMessages = document.getElementById("chatbot-messages");
  const chatInput = document.getElementById("chatbot-input");
  const sendBtn = document.getElementById("chatbot-send-btn");
  const voiceBtn = document.getElementById("chatbot-voice-btn");

  const dadosSistema = {
    maquinas: [
      { nome: "Corte Laser 01 (Fiber)", status: "Operando", op: "OP-2024-88", operador: "Carlos Silva", eficiencias: "94%" },
      { nome: "Prensa Hidráulica 200T", status: "Operando", op: "OP-2024-91", operador: "João Souza", eficiencias: "88%" },
      { nome: "Torno CNC 02", status: "Manutenção", motivo: "Troca de pastilha de corte", previsao: "14:30" },
      { nome: "Centro de Usinagem 03", status: "Parada", motivo: "Aguardando matéria-prima (Aço Inox)", previsao: "16:00" },
      { nome: "Dobradeira CNC 01", status: "Operando", op: "OP-2024-89", operador: "Marcos Lima", eficiencias: "91%" }
    ],
    estoqueEmFalta: [
      { item: "Chapa de Aço Inox 304 (2mm)", quantidade: "12 un", minimo: "50 un", status: "🔴 Crítico" },
      { item: "Bobina de Alumínio 1.5mm", quantidade: "0 bobinas", minimo: "5 bobinas", status: "❌ Esgotado" },
      { item: "Parafuso Sextavado M8x30 Aço Inox", quantidade: "150 un", minimo: "500 un", status: "🟡 Atenção" },
      { item: "Tubo Industrial Quadrado 40x40", quantidade: "8 barras", minimo: "30 barras", status: "🔴 Crítico" }
    ],
    pedidosAndamento: [
      { op: "OP-2024-88", cliente: "Metalúrgica MetalSul", produto: "Flanges de Aço Carbono (500 un)", prazo: "Hoje, 17:00", progresso: "75%" },
      { op: "OP-2024-89", cliente: "AutoPeças Brasil", produto: "Suportes Estampados (1200 un)", prazo: "Amanhã", progresso: "40%" },
      { op: "OP-2024-91", cliente: "Indústria InduMet", produto: "Gabinete Metálico CNC (150 un)", prazo: "30/08", progresso: "20%" }
    ],
    entregasLogisticas: [
      { id: "LOG-104", destino: "Campinas - SP", motorista: "Roberto Alves", carga: "Estruturas de Aço", status: "Em Trânsito", previsao: "15:30" },
      { id: "LOG-102", destino: "Guarulhos - SP", motorista: "Sérgio Ramos", carga: "Bobinas usinadas", status: "Atrasado (Trânsito Rodoanel)", previsao: "16:45" }
    ]
  };

  const basePaginas = {
    dashboard: "KPIs de ordens, entregas e alertas de estoque.",
    pedidos: "Lista de OPs, criação e filtro de status.",
    kanban: "Quadro de tarefas (A Fazer, Em Andamento, Concluído).",
    controle: "Monitoramento de máquinas, OEE e paradas.",
    estoque: "Inventário de insumos com botões de entrada/saída.",
    logistica: "Expedição e gestão de frota/motoristas.",
    relatorios: "Exportação analítica em PDF ou Excel.",
    fornecedores: "Lista de parceiros e cotações.",
    rastreamento: "Mapa GPS dos veículos de entrega em tempo real.",
    calendario: "Cronograma de entregas e manutenções.",
    cadastro: "Registro de colaboradores com perfil Gestão ou Estoque."
  };

  const sugestoesPadrao = [
    "Quais máquinas estão operando?",
    "Quais materiais estão em falta?",
    "Status das Ordens de Produção",
    "Estoque em Nível Crítico",
    "Cadastro de Funcionários"
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

  /* Cria o balão inicial contendo as sugestões exclusivamente em seu interior */
  function iniciarConversa() {
    const msgDiv = document.createElement("div");
    msgDiv.className = "chatbot-msg bot";

    const textoBase = "Olá! Eu sou o <strong>LogBot</strong>, assistente inteligente do StockLog.<br><br>Como posso te ajudar com a fábrica, estoque ou sistema agora?";

    // Cria o bloco container das sugestões
    const suggestionsDiv = document.createElement("div");
    suggestionsDiv.className = "chatbot-suggestions";

    sugestoesPadrao.forEach((texto) => {
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

    // Adiciona elementos ordenadamente no mesmo balão de mensagem
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

  async function chamarOpenRouter(mensagemUsuario) {
    const apiKey = obterChaveAPI();

    if (!apiKey) {
      return gerarRespostaSimulada(mensagemUsuario);
    }

    const promptSistema =
      "Você é o LogBot, assistente do sistema industrial StockLog.\n" +
      "Responda dúvidas sobre o sistema, status em tempo real da fábrica, estoque, logística e metalurgia.\n\n" +
      "DADOS EM TEMPO REAL DO SISTEMA:\n" + JSON.stringify(dadosSistema, null, 2) + "\n\n" +
      "RESUMO DAS PÁGINAS DO SISTEMA:\n" + JSON.stringify(basePaginas, null, 2) + "\n\n" +
      "Regras:\n" +
      "1. Se a pergunta for fora de contexto de indústria, metalurgia, logística ou do sistema StockLog, recuse educadamente.\n" +
      "2. Mantenha respostas diretas e bem formatadas usando negrito e tópicos quando necessário.";

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + apiKey,
          "HTTP-Referer": window.location.origin,
          "X-Title": "StockLog",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          messages: [
            { role: "system", content: promptSistema },
            { role: "user", content: mensagemUsuario }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Erro da API OpenRouter:", response.status, errorData);
        return "⚠️ **Erro da API (" + response.status + "):** Verifique se a sua chave possui créditos suficientes.";
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Erro na comunicação com OpenRouter:", error);
      return "⚠️ **Erro de Conexão:** Não foi possível conectar ao servidor da OpenRouter.";
    }
  }

  function gerarRespostaSimulada(msg) {
    const texto = msg.toLowerCase();

    // 1. Saudações e Identidade
    if (texto.includes("olá") || texto.includes("oi") || texto.includes("quem é você") || texto.includes("seu nome")) {
      return "Olá! Eu sou o **LogBot**, seu assistente virtual inteligente do StockLog. <br><br>Estou operando em <b style='color: #006bb3;'>modo de simulação offline</b> porque a chave da API não foi configurada no <code>config.js</code>. Mas não se preocupe! Eu conheço todo o sistema e posso te dar informações reais sobre a fábrica e te guiar pelas páginas!";
    }

    // 2. Ajuda e Navegação Geral
    if (texto.includes("ajuda") || texto.includes("como usar") || texto.includes("o que você faz") || texto.includes("funcionalidades")) {
      return "Eu posso te ajudar a monitorar a fábrica rapidamente! Tente me perguntar sobre:<br>• <b>Máquinas:</b> 'Quais máquinas estão operando?'<br>• <b>Estoque:</b> 'O que está em falta no estoque?'<br>• <b>Pedidos:</b> 'Qual o status das OPs?'<br>• <b>Logística:</b> 'Onde estão as entregas?'<br>• <b>Navegação:</b> 'Para que serve a página de Relatórios?'";
    }

    // 3. Máquinas e Produção (Usa dadosSistema)
    if (texto.includes("máquina") || texto.includes("produção") || texto.includes("operando") || texto.includes("parada")) {
      const operando = dadosSistema.maquinas.filter(m => m.status === "Operando");
      const paradas = dadosSistema.maquinas.filter(m => m.status !== "Operando");

      let res = "<b>Status da Produção:</b><br>";
      res += `✅ <b>${operando.length} máquinas operando:</b> ${operando.map(m => m.nome).join(", ")}.<br>`;
      if (paradas.length > 0) {
        res += `<br>⚠️ <b>${paradas.length} máquinas com alerta:</b><br>`;
        paradas.forEach(m => res += `- ${m.nome}: ${m.motivo || m.status}<br>`);
      }
      return res;
    }

    // 4. Estoque e Insumos (Usa dadosSistema)
    if (texto.includes("estoque") || texto.includes("falta") || texto.includes("item") || texto.includes("matéria-prima")) {
      const criticos = dadosSistema.estoqueEmFalta.filter(i => i.status.includes("Crítico") || i.status.includes("Esgotado"));
      let res = "<b>Alerta de Estoque:</b><br>";
      if (criticos.length > 0) {
        res += "Identifiquei itens em nível <b>crítico</b>:<br>";
        criticos.forEach(i => res += `- ${i.item} (${i.quantidade}) - ${i.status}<br>`);
        res += "<br>Recomendo acessar a aba <b>Itens em Estoque</b> para realizar a reposição.";
      } else {
        res += "No momento, não há itens em nível crítico. Tudo sob controle!";
      }
      return res;
    }

    // 5. Pedidos e OPs (Usa dadosSistema)
    if (texto.includes("pedido") || texto.includes("op") || texto.includes("prazo") || texto.includes("andamento")) {
      let res = "<b>Ordens de Produção (OPs) em Andamento:</b><br>";
      dadosSistema.pedidosAndamento.forEach(p => {
        res += `- <b>${p.op}</b> (${p.cliente}): ${p.produto} - Progresso: ${p.progresso} (Prazo: ${p.prazo})<br>`;
      });
      return res;
    }

    // 6. Logística e Entregas (Usa dadosSistema)
    if (texto.includes("logística") || texto.includes("entrega") || texto.includes("motorista") || texto.includes("rastreamento")) {
      let res = "<b>Status de Logística:</b><br>";
      dadosSistema.entregasLogisticas.forEach(e => {
        res += `- <b>${e.id}</b> para ${e.destino}: ${e.status} (Motorista: ${e.motorista}) - Previsão: ${e.previsao}<br>`;
      });
      return res;
    }

    // 7. Guia de Páginas do Sistema (Usa basePaginas)
    for (const [pagina, descricao] of Object.entries(basePaginas)) {
      if (texto.includes(pagina) || texto.includes(pagina.charAt(0).toUpperCase() + pagina.slice(1))) {
        return `A página de <b>${pagina.charAt(0).toUpperCase() + pagina.slice(1)}</b> serve para: ${descricao}`;
      }
    }

    // 8. Fallback Inteligente
    return "Entendi que você quer saber sobre '" + msg + "'. <br><br>Como estou em <b>modo simulado</b>, não consigo processar essa pergunta complexa via IA, mas posso te dizer que a maioria das informações de gestão está concentrada nas abas de <b>Relatórios</b>, <b>Produção</b> ou <b>Estoque</b>. Tente perguntar sobre 'máquinas', 'estoque' ou 'entregas'!";
  }

  async function processarEnvio() {
    const texto = chatInput.value.trim();
    if (!texto) return;

    adicionarMensagem("user", texto);
    chatInput.value = "";

    mostrarTyping();

    const respostaIA = await chamarOpenRouter(texto);

    removerTyping();
    adicionarMensagem("bot", respostaIA);
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
      const transcricao = event.results[0][0].transcript;
      chatInput.value = transcricao;
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
});