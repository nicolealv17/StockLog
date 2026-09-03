document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  const mensagem = document.getElementById("mensagem");
  const btnRegister = document.getElementById("btnRegister");
  const btnSpinner = document.getElementById("btnSpinner");
  const btnText = document.getElementById("btnText");
  const passwordInput = document.getElementById("passwordInput");
  const togglePassword = document.getElementById("togglePassword");
  const strengthBars = document.querySelectorAll(".strength-bar");
  const strengthLabel = document.getElementById("strengthLabel");
  const listaContainer = document.getElementById("listaContainer");
  const listaBody = document.getElementById("listaBody");
  const contadorLista = document.getElementById("contadorLista");

  // --- 1. MOSTRAR / OCULTAR SENHA ---
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", () => {
      const isPassword = passwordInput.type === "password";
      passwordInput.type = isPassword ? "text" : "password";
      togglePassword.classList.toggle("fa-eye", !isPassword);
      togglePassword.classList.toggle("fa-eye-slash", isPassword);
    });
  }

  // --- 2. MEDIDOR DE FORÇA DA SENHA ---
  if (passwordInput && strengthBars.length > 0) {
    passwordInput.addEventListener("input", () => {
      const val = passwordInput.value;
      const result = calcularForcaSenha(val);
      atualizarMedidorSenha(result.score, result.texto, result.cor);
    });
  }

  function calcularForcaSenha(senha) {
    if (!senha) return { score: 0, texto: "", cor: "transparent" };
    
    let score = 0;
    if (senha.length >= 6) score++;
    if (senha.length >= 10) score++;
    if (/[A-Z]/.test(senha) && /[a-z]/.test(senha)) score++;
    if (/[0-9]/.test(senha) && /[^A-Za-z0-9]/.test(senha)) score++;

    let texto = "";
    let cor = "";

    switch (score) {
      case 1:
        texto = "Senha Fraca";
        cor = "var(--red-bar)";
        break;
      case 2:
        texto = "Senha Média";
        cor = "var(--amber-bar)";
        break;
      case 3:
        texto = "Senha Boa";
        cor = "var(--orange-bar)";
        break;
      case 4:
        texto = "Senha Forte";
        cor = "var(--green-bar)";
        break;
      default:
        texto = "Muito Fraca";
        cor = "var(--red-bar)";
    }

    return { score, texto, cor };
  }

  function atualizarMedidorSenha(score, texto, cor) {
    strengthBars.forEach((bar, index) => {
      if (index < score) {
        bar.style.backgroundColor = cor;
      } else {
        bar.style.backgroundColor = "var(--border)";
      }
    });

    if (strengthLabel) {
      strengthLabel.textContent = texto;
      strengthLabel.style.color = cor;
    }
  }

  // --- 3. SUBMISSÃO DO FORMULÁRIO E SALVAMENTO NO FIREBASE ---
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      ocultarMensagem();

      const nome = document.getElementById("nomeInput").value.trim();
      const cpf = document.getElementById("cpfInput").value.trim();
      const email = document.getElementById("emailInput").value.trim();
      const area = document.getElementById("areaSelect").value;
      const senha = passwordInput ? passwordInput.value : "";

      if (!nome || !cpf || !email || !area || !senha) {
        exibirMensagem("Preencha todos os campos obrigatórios (*).", "error");
        return;
      }

      setLoading(true);

      try {
        // Envia direto para o nó "usuarios" no Realtime Database do Firebase
        const novoUsuarioRef = firebase.database().ref("usuarios").push();

        await novoUsuarioRef.set({
          nome: nome,
          cpf: cpf,
          email: email,
          area: area,
          status: "Ativo",
          criadoEm: new Date().toISOString()
        });

        exibirMensagem("Funcionário cadastrado com sucesso!", "success");
        limparForm();
        carregarUsuariosListados();

      } catch (error) {
        console.error("Erro ao salvar no Firebase:", error);
        exibirMensagem("Erro ao salvar os dados: " + error.message, "error");
      } finally {
        setLoading(false);
      }
    });
  }

  // --- 4. RENDERIZAR E LISTAR FUNCIONÁRIOS DO FIREBASE ---
  function carregarUsuariosListados() {
    if (!listaBody) return;

    const dbRef = firebase.database().ref("usuarios");
    dbRef.on("value", (snapshot) => {
      listaBody.innerHTML = "";
      const data = snapshot.val();

      if (!data) {
        listaBody.innerHTML = '<div class="lista-vazia">Nenhum funcionário cadastrado até o momento.</div>';
        if (contadorLista) contadorLista.textContent = "0";
        return;
      }

      const lista = Object.values(data);
      if (contadorLista) contadorLista.textContent = lista.length;

      lista.reverse().forEach((user) => {
        const item = document.createElement("div");
        item.className = "lista-item";
        item.innerHTML = `
          <div class="info">
            <span class="nome">${escapeHtml(user.nome)}</span>
            <span class="detalhe">${escapeHtml(user.area)} · ${escapeHtml(user.email)}</span>
          </div>
          <span class="status-pill ${(user.status || 'ativo').toLowerCase()}">${escapeHtml(user.status || 'Ativo')}</span>
        `;
        listaBody.appendChild(item);
      });
    });
  }

  // Executa ao carregar a página para montar a lista
  carregarUsuariosListados();

  // --- FUNÇÕES AUXILIARES ---
  function exibirMensagem(texto, tipo) {
    if (!mensagem) return;
    mensagem.textContent = texto;
    mensagem.className = `mensagem-alerta ${tipo}`;
    mensagem.style.display = "flex";
  }

  function ocultarMensagem() {
    if (!mensagem) return;
    mensagem.className = "mensagem-alerta";
    mensagem.style.display = "none";
    mensagem.textContent = "";
  }

  function setLoading(carregando) {
    if (!btnRegister) return;
    if (carregando) {
      btnRegister.disabled = true;
      if (btnSpinner) btnSpinner.style.display = "inline-block";
      if (btnText) btnText.style.display = "none";
    } else {
      btnRegister.disabled = false;
      if (btnSpinner) btnSpinner.style.display = "none";
      if (btnText) btnText.style.display = "inline";
    }
  }

  function escapeHtml(string) {
    return String(string || "").replace(/[&<>"']/g, (s) => {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[s];
    });
  }
});

// --- FUNÇÕES GLOBAIS (Acessadas pelos botões inline HTML) ---
function mascaraCPF(input) {
  let v = input.value.replace(/\D/g, "");
  v = v.replace(/(\d{3})(\d)/, "$1.$2");
  v = v.replace(/(\d{3})(\d)/, "$1.$2");
  v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  input.value = v;
}

function limparForm() {
  const form = document.getElementById("registerForm");
  if (form) form.reset();

  const mensagem = document.getElementById("mensagem");
  if (mensagem) {
    mensagem.style.display = "none";
    mensagem.textContent = "";
  }

  const strengthBars = document.querySelectorAll(".strength-bar");
  strengthBars.forEach(bar => bar.style.backgroundColor = "var(--border)");
  
  const strengthLabel = document.getElementById("strengthLabel");
  if (strengthLabel) strengthLabel.textContent = "";
}

function toggleLista() {
  const lista = document.getElementById("listaContainer");
  if (lista) {
    lista.classList.toggle("visible");
  }
}