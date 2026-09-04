/**
 * StockLog - Lógica de Cadastro de Funcionários
 * Integração com Firebase Authentication + Realtime Database
 */

// Instância para criar novos usuários no Auth sem deslogar o admin atual
let secondaryAuth = null;

document.addEventListener('DOMContentLoaded', () => {
  initSecondaryApp();
  initFormEvents();
  initPasswordToggle();
  initPasswordStrength();
  carregarListaFuncionarios();
});

/**
 * Inicializa um app secundário do Firebase para evitar a troca automática
 * do usuário logado durante a criação da nova conta.
 */
function initSecondaryApp() {
  try {
    if (firebase.apps.length > 0) {
      const primaryConfig = firebase.app().options;
      // Cria a instância secundária se ainda não existir
      const secondaryApp = firebase.apps.find(app => app.name === "SecondaryApp") 
        || firebase.initializeApp(primaryConfig, "SecondaryApp");
      secondaryAuth = secondaryApp.auth();
    }
  } catch (err) {
    console.error("Erro ao inicializar Firebase Secundário:", err);
  }
}

/**
 * Gera um ID numérico aleatório de 6 dígitos (ex: 104829)
 */
function gerarIdNumerico() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Garante que o ID gerado de 6 dígitos não exista previamente no banco
 */
async function obterIdUnico() {
  let idProposto = gerarIdNumerico();
  let snapshot = await db.ref(`funcionarios/${idProposto}`).once('value');
  
  while (snapshot.exists()) {
    idProposto = gerarIdNumerico();
    snapshot = await db.ref(`funcionarios/${idProposto}`).once('value');
  }
  
  return idProposto;
}

/**
 * Configuração dos Eventos do Formulário
 */
function initFormEvents() {
  const form = document.getElementById('registerForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Elementos do Formulário
    const nome = document.getElementById('nomeInput').value.trim();
    const cpf = document.getElementById('cpfInput').value.trim();
    const email = document.getElementById('emailInput').value.trim();
    const area = document.getElementById('areaSelect').value;
    const password = document.getElementById('passwordInput').value;

    // Validações Básicas
    if (!nome || !cpf || !email || !area || !password) {
      exibirMensagem('Por favor, preencha todos os campos obrigatórios.', 'error');
      return;
    }

    if (cpf.length < 14) {
      exibirMensagem('Por favor, insira um CPF válido.', 'error');
      return;
    }

    if (password.length < 6) {
      exibirMensagem('A senha deve ter no mínimo 6 caracteres.', 'error');
      return;
    }

    setLoading(true);

    try {
      // 1. Criar credencial no Firebase Auth (gera a string UID do Auth)
      const authInstance = secondaryAuth || firebase.auth();
      const userCredential = await authInstance.createUserWithEmailAndPassword(email, password);
      const authUid = userCredential.user.uid;

      // 2. Gera o ID de 6 dígitos único
      const idCurto = await obterIdUnico();

      // 3. Salva no Realtime Database usando o ID curto de 6 dígitos como chave do nó
      await db.ref(`funcionarios/${idCurto}`).set({
        id: idCurto,
        uidAuth: authUid,
        nome: nome,
        cpf: cpf,
        email: email,
        area: area,
        status: 'ativo',
        criadoEm: new Date().toISOString()
      });

      // Encerra sessão do app secundário se existir
      if (secondaryAuth) {
        await secondaryAuth.signOut();
      }

      exibirMensagem(`Funcionário cadastrado com sucesso! ID: ${idCurto}`, 'success');
      limparForm();

    } catch (error) {
      console.error('Erro no cadastro:', error);
      let erroMsg = 'Erro ao cadastrar funcionário.';

      switch (error.code) {
        case 'auth/email-already-in-use':
          erroMsg = 'Este e-mail já está em uso por outro usuário.';
          break;
        case 'auth/invalid-email':
          erroMsg = 'O e-mail informado é inválido.';
          break;
        case 'auth/weak-password':
          erroMsg = 'A senha informada é muito fraca.';
          break;
        default:
          erroMsg = error.message || erroMsg;
      }

      exibirMensagem(erroMsg, 'error');
    } finally {
      setLoading(false);
    }
  });
}

/**
 * Máscara para Formatação de CPF (000.000.000-00)
 */
function mascaraCPF(input) {
  let value = input.value.replace(/\D/g, ''); // Remove não dígitos
  if (value.length > 11) value = value.slice(0, 11);

  value = value.replace(/(\d{3})(\d)/, '$1.$2');
  value = value.replace(/(\d{3})(\d)/, '$1.$2');
  value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

  input.value = value;
}

/**
 * Exibição/Ocultação de Senha
 */
function initPasswordToggle() {
  const toggleBtn = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('passwordInput');

  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      toggleBtn.classList.toggle('fa-eye');
      toggleBtn.classList.toggle('fa-eye-slash');
    });
  }
}

/**
 * Medidor de Força da Senha
 */
function initPasswordStrength() {
  const passwordInput = document.getElementById('passwordInput');
  const bars = document.querySelectorAll('.strength-bar');
  const label = document.getElementById('strengthLabel');

  if (!passwordInput) return;

  passwordInput.addEventListener('input', () => {
    const val = passwordInput.value;
    let score = 0;

    if (val.length >= 6) score++;
    if (val.length >= 10) score++;
    if (/[A-Z]/.test(val) && /[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    bars.forEach((bar, idx) => {
      if (idx < score && val.length > 0) {
        if (score <= 1) bar.style.backgroundColor = 'var(--red-bar)';
        else if (score <= 3) bar.style.backgroundColor = 'var(--amber-bar)';
        else bar.style.backgroundColor = 'var(--green-bar)';
      } else {
        bar.style.backgroundColor = 'var(--border)';
      }
    });

    const labels = ['', 'Muito fraca', 'Fraca', 'Média', 'Forte'];
    label.textContent = val.length > 0 ? labels[score] || 'Muito Forte' : '';
    label.style.color = score <= 1 ? 'var(--red)' : score <= 3 ? 'var(--orange-bar)' : 'var(--green)';
  });
}

/**
 * Alterna visibilidade da lista de funcionários
 */
function toggleLista() {
  const lista = document.getElementById('listaContainer');
  const btn = document.getElementById('btnToggleLista');
  if (!lista) return;

  const isVisible = lista.classList.toggle('visible');
  btn.innerHTML = isVisible 
    ? '<i class="fa-solid fa-user-plus"></i> Ocultar lista' 
    : '<i class="fa-solid fa-users"></i> Ver cadastrados';
}

/**
 * Carrega a lista de funcionários do Realtime Database em tempo real
 */
function carregarListaFuncionarios() {
  const listaBody = document.getElementById('listaBody');
  const contador = document.getElementById('contadorLista');

  if (!listaBody) return;

  db.ref('funcionarios').on('value', (snapshot) => {
    listaBody.innerHTML = '';
    const data = snapshot.val();

    if (!data) {
      listaBody.innerHTML = '<div class="lista-vazia">Nenhum funcionário cadastrado.</div>';
      if (contador) contador.textContent = '0';
      return;
    }

    const funcionarios = Object.values(data);
    if (contador) contador.textContent = funcionarios.length;

    funcionarios.forEach(func => {
      const item = document.createElement('div');
      item.className = 'lista-item';
      item.innerHTML = `
        <div class="info">
          <span class="nome">${escapeHtml(func.nome)} <small style="color:var(--primary)">(ID: ${func.id || 'N/A'})</small></span>
          <span class="detalhe">${escapeHtml(func.email)} · ${escapeHtml(func.area)}</span>
        </div>
        <span class="status-pill ${func.status === 'ativo' ? 'ativo' : 'inativo'}">
          ${func.status || 'Ativo'}
        </span>
      `;
      listaBody.appendChild(item);
    });
  });
}

/**
 * Utilitários e Helpers
 */
function limparForm() {
  const form = document.getElementById('registerForm');
  if (form) form.reset();

  const bars = document.querySelectorAll('.strength-bar');
  bars.forEach(b => b.style.backgroundColor = 'var(--border)');

  const label = document.getElementById('strengthLabel');
  if (label) label.textContent = '';
}

function setLoading(isLoading) {
  const btnRegister = document.getElementById('btnRegister');
  const btnText = document.getElementById('btnText');
  const btnSpinner = document.getElementById('btnSpinner');

  if (btnRegister) btnRegister.disabled = isLoading;
  if (btnText) btnText.style.display = isLoading ? 'none' : 'inline-flex';
  if (btnSpinner) btnSpinner.style.display = isLoading ? 'inline-block' : 'none';
}

function exibirMensagem(texto, tipo) {
  const msgEl = document.getElementById('mensagem');
  if (!msgEl) return;

  msgEl.className = `mensagem-alerta ${tipo}`;
  msgEl.innerHTML = `
    <i class="fa-solid ${tipo === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'}"></i>
    <span>${texto}</span>
  `;

  if (tipo === 'error') {
    const card = document.getElementById('cardContainer');
    if (card) {
      card.classList.add('shake');
      setTimeout(() => card.classList.remove('shake'), 400);
    }
  }

  setTimeout(() => {
    msgEl.style.display = 'none';
    msgEl.className = 'mensagem-alerta';
  }, 5000);
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, (m) => {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
  });
}

// Função para aplicar máscara no CPF
function mascaraCPF(input) {
  let value = input.value.replace(/\D/g, "");
  if (value.length > 11) value = value.slice(0, 11);
  
  value = value.replace(/(\d{3})(\d)/, "$1.$2");
  value = value.replace(/(\d{3})(\d)/, "$1.$2");
  value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  
  input.value = value;
}

// Alternar exibição do painel da lista
function toggleLista() {
  const container = document.getElementById("listaContainer");
  container.classList.toggle("visible");
}

// Limpar formulário de cadastro
function limparForm() {
  document.getElementById("registerForm").reset();
  const label = document.getElementById("strengthLabel");
  if (label) label.textContent = "";
}

// Exibir alertas na tela
function exibirMensagem(texto, tipo) {
  const msgEl = document.getElementById("mensagem");
  msgEl.className = `mensagem-alerta ${tipo}`;
  msgEl.innerHTML = `<i class="fa-solid fa-${tipo === 'success' ? 'circle-check' : 'triangle-exclamation'}"></i> ${texto}`;
  
  setTimeout(() => {
    msgEl.className = "mensagem-alerta";
    msgEl.innerHTML = "";
  }, 4000);
}

// Carregar Lista em Tempo Real
function carregarFuncionarios() {
  db.ref("funcionarios").on("value", (snapshot) => {
    const listaBody = document.getElementById("listaBody");
    const contador = document.getElementById("contadorLista");
    listaBody.innerHTML = "";

    if (!snapshot.exists()) {
      contador.textContent = "0";
      listaBody.innerHTML = `<tr><td colspan="5" class="lista-vazia">Nenhum funcionário cadastrado.</td></tr>`;
      return;
    }

    let qtd = 0;
    snapshot.forEach((childSnapshot) => {
      qtd++;
      const id = childSnapshot.key;
      const func = childSnapshot.val();

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${func.nome}</strong></td>
        <td>${func.cpf}</td>
        <td>${func.email}</td>
        <td>${func.area}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-action" onclick="abrirModalEdicao('${id}')" title="Editar">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn-action btn-delete" onclick="excluirFuncionario('${id}')" title="Excluir">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      `;
      listaBody.appendChild(tr);
    });

    contador.textContent = qtd;
  });
}

// Abrir modal e carregar dados para edição
function abrirModalEdicao(id) {
  db.ref("funcionarios/" + id).once("value").then((snapshot) => {
    const data = snapshot.val();
    if (data) {
      document.getElementById("editId").value = id;
      document.getElementById("editNome").value = data.nome || "";
      document.getElementById("editCpf").value = data.cpf || "";
      document.getElementById("editEmail").value = data.email || "";
      document.getElementById("editArea").value = data.area || "Gestão";

      document.getElementById("editModal").classList.add("active");
    }
  });
}

// Fechar Modal
function fecharModalEdicao() {
  document.getElementById("editModal").classList.remove("active");
}

// Salvar as alterações no Firebase
function salvarEdicao(event) {
  event.preventDefault();
  const id = document.getElementById("editId").value;
  
  const dadosAtualizados = {
    nome: document.getElementById("editNome").value,
    cpf: document.getElementById("editCpf").value,
    email: document.getElementById("editEmail").value,
    area: document.getElementById("editArea").value
  };

  db.ref("funcionarios/" + id).update(dadosAtualizados)
    .then(() => {
      exibirMensagem("Funcionário atualizado com sucesso!", "success");
      fecharModalEdicao();
    })
    .catch((error) => {
      exibirMensagem("Erro ao atualizar: " + error.message, "error");
    });
}

// Excluir registro do Firebase
function excluirFuncionario(id) {
  if (confirm("Deseja realmente excluir este funcionário?")) {
    db.ref("funcionarios/" + id).remove()
      .then(() => {
        exibirMensagem("Funcionário removido com sucesso!", "success");
      })
      .catch((error) => {
        exibirMensagem("Erro ao excluir: " + error.message, "error");
      });
  }
}

// Evento de Submissão do Cadastro Inicial
document.getElementById("registerForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const nome = document.getElementById("nomeInput").value;
  const cpf = document.getElementById("cpfInput").value;
  const email = document.getElementById("emailInput").value;
  const area = document.getElementById("areaSelect").value;
  const pass = document.getElementById("passwordInput").value;

  if (!nome || !cpf || !email || !area || !pass) {
    exibirMensagem("Por favor, preencha todos os campos obrigatórios.", "error");
    return;
  }

  const novoRef = db.ref("funcionarios").push();
  novoRef.set({
    nome: nome,
    cpf: cpf,
    email: email,
    area: area
  }).then(() => {
    exibirMensagem("Funcionário cadastrado com sucesso!", "success");
    limparForm();
  }).catch((err) => {
    exibirMensagem("Erro ao cadastrar: " + err.message, "error");
  });
});

// Inicializar listagem ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
  carregarFuncionarios();
});