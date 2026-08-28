/* =========================================================
   StockLog · Componente LogBot (Integrado ao OpenRouter)
   ========================================================= */

// 🔑 COLOQUE SUA CHAVE DA API DO OPEN ROUTER AQUI
const OPENROUTER_API_KEY = "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"; 
const OPENROUTER_MODEL = "openai/gpt-4o-mini"; // Ou o modelo de sua preferência (ex: "meta-llama/llama-3.1-8b-instruct")

document.addEventListener("DOMContentLoaded", () => {
  // 1. Injeção dinâmica do HTML do Chatbot
  function inicializarDOMChatbot() {
    let root = document.getElementById("chatbot-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "chatbot-root";
      document.body.appendChild(root);
    }

    root.innerHTML = `
      <button class="chatbot-toggle" id="chatbot-toggle-btn" aria-label="Abrir Chat LogBot">
        <i class="fa-solid fa-comments"></i>
      </button>

      <div class="chatbot-window" id="chatbot-window">
        <div class="chatbot-header">
          <div class="chatbot-avatar">
            <i class="fa-solid fa-comment-dots"></i>
          </div>
          <div class="chatbot-info">
            <h4>LogBot</h4>
            <p>Assistente StockLog</p>
          </div>
          <button class="chatbot-close" id="chatbot-close-btn" aria-label="Fechar">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="chatbot-messages" id="chatbot-messages"></div>

        <div class="chatbot-input-area">
          <input 
            type="text" 
            id="chatbot-input" 
            class="chatbot-input" 
            placeholder="Digite ou pergunte algo..."
            autocomplete="off"
          />
          <button class="chatbot-voice" id="chatbot-voice-btn" title="Falar por Voz">
            <i class="fa-solid fa-microphone"></i>
          </button>
          <button class="chatbot-send" id="chatbot-send-btn" title="Enviar Mensagem">
            <i class="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
    `;
  }

  inicializarDOMChatbot();

  // 2. Elementos DOM
  const toggleBtn = document.getElementById("chatbot-toggle-btn");
  const closeBtn = document.getElementById("chatbot-close-btn");
  const chatWindow = document.getElementById("chatbot-window");
  const chatMessages = document.getElementById("chatbot-messages");
  const chatInput = document.getElementById("chatbot-input");
  const sendBtn = document.getElementById("chatbot-send-btn");
  const voiceBtn = document.getElementById("chatbot-voice-btn");

  // 3. BASE DE DADOS DO SISTEMA (Fornecida como Contexto para a IA)
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

  function iniciarConversa() {
    const hora = obterHoraAtual();
    adicionarMensagem(
      "bot",
      `Olá! Eu sou o **LogBot**, assistente inteligente do StockLog.\n\nComo posso te ajudar com a fábrica, estoque ou sistema agora?`,
      hora
    );
    exibirSugestoes();
  }

  function obterHoraAtual() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function adicionarMensagem(autor, texto, hora) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `chatbot-msg ${autor}`;

    let textoFormatado = texto.replace(/\n/g, '<br>');
    textoFormatado = textoFormatado.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    msgDiv.innerHTML = `
      ${textoFormatado}
      <span class="msg-time">${hora || obterHoraAtual()}</span>
    `;

    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function exibirSugestoes() {
    const sugestaoAntiga = document.querySelector(".chatbot-suggestions");
    if (sugestaoAntiga) sugestaoAntiga.remove();

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

    chatMessages.appendChild(suggestionsDiv);
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

  // 4. FUNÇÃO QUE FAZ A CHAMADA À API DO OPEN ROUTER
  async function chamarOpenRouter(mensagemUsuario) {
    const promptSistema = `
      Você é o LogBot, assistente do sistema industrial StockLog.
      Responda dúvidas sobre o sistema, status em tempo real da fábrica, estoque, logística e metalurgia.
      
      DADOS EM TEMPO REAL DO SISTEMA:
      ${JSON.stringify(dadosSistema, null, 2)}
      
      RESUMO DAS PÁGINAS DO SISTEMA:
      ${JSON.stringify(basePaginas, null, 2)}
      
      Regras:
      1. Se a pergunta for fora de contexto de indústria, metalurgia, logística ou do sistema StockLog, recuse educadamente.
      2. Mantenha respostas diretas e bem formatadas usando negrito e tópicos quando necessário.
    `;

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
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
        throw new Error(`Erro API OpenRouter: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Erro na comunicação com OpenRouter:", error);
      return "⚠️ **Erro de Conexão:** Não foi possível consultar a API do OpenRouter. Verifique se a chave API foi configurada corretamente.";
    }
  }

  // 5. PROCESSAMENTO DE ENVIO ASSÍNCRONO
  async function processarEnvio() {
    const texto = chatInput.value.trim();
    if (!texto) return;

    const sugestaoAntiga = document.querySelector(".chatbot-suggestions");
    if (sugestaoAntiga) sugestaoAntiga.remove();

    adicionarMensagem("user", texto);
    chatInput.value = "";

    mostrarTyping();

    // Chamada à API OpenRouter
    const respostaIA = await chamarOpenRouter(texto);

    removerTyping();
    adicionarMensagem("bot", respostaIA);
    exibirSugestoes();
  }

  sendBtn.addEventListener("click", processarEnvio);
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") processarEnvio();
  });

  // 6. Reconhecimento de Voz
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