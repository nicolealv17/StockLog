/**
 * StockLog - Lógica de Cadastro, Edição e Exclusão de Funcionários
 * Integração com Firebase Authentication + Realtime Database
 */

let secondaryAuth = null;

document.addEventListener('DOMContentLoaded', () => {
    initSecondaryApp();
    initFormEvents();
    initPasswordToggle();
    initPasswordStrength();
    carregarFuncionarios();

    const editForm = document.getElementById('editForm');
    if (editForm) {
        editForm.addEventListener('submit', salvarEdicao);
    }
});

function initSecondaryApp() {
    try {
        if (firebase.apps.length > 0) {
            const primaryConfig = firebase.app().options;
            const secondaryApp = firebase.apps.find(app => app.name === "SecondaryApp") 
                || firebase.initializeApp(primaryConfig, "SecondaryApp");
            secondaryAuth = secondaryApp.auth();
        }
    } catch (err) {
        console.error("Erro ao inicializar Firebase Secundário:", err);
    }
}

/**
 * Gera um ID numérico aleatório de exatamente 6 dígitos (ex: 104829)
 */
function gerarIdNumerico() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Garante que o ID gerado de 6 dígitos não exista no banco de dados
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
 * Cadastro de Funcionário garantindo a gravação pela chave do ID curto
 */
function initFormEvents() {
    const form = document.getElementById('registerForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nome = document.getElementById('nomeInput').value.trim();
        const cpf = document.getElementById('cpfInput').value.trim();
        const email = document.getElementById('emailInput').value.trim();
        const area = document.getElementById('areaSelect').value;
        const password = document.getElementById('passwordInput').value;

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
            const authInstance = secondaryAuth || firebase.auth();
            const userCredential = await authInstance.createUserWithEmailAndPassword(email, password);
            const authUid = userCredential.user.uid;

            // Gera obrigatoriamente o ID único de 6 dígitos
            const idCurto = await obterIdUnico();

            // Salva no caminho funcionarios/{ID_DE_6_DIGITOS}
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
 * Carrega e exibe a lista dando preferência ao ID numérico de 6 dígitos
 */
function carregarFuncionarios() {
    const listaBody = document.getElementById('listaBody');
    const contador = document.getElementById('contadorLista');

    if (!listaBody) return;

    db.ref('funcionarios').on('value', (snapshot) => {
        listaBody.innerHTML = '';

        if (!snapshot.exists()) {
            if (contador) contador.textContent = '0';
            listaBody.innerHTML = `<tr><td colspan="5" class="lista-vazia" style="text-align:center; padding:20px;">Nenhum funcionário cadastrado.</td></tr>`;
            return;
        }

        let qtd = 0;
        snapshot.forEach((childSnapshot) => {
            qtd++;
            const chaveNode = childSnapshot.key;
            const func = childSnapshot.val();

            // Usa o atributo func.id (6 dígitos) ou a própria chave do nó
            const idExibicao = func.id || chaveNode;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${escapeHtml(func.nome)}</strong> <small style="color:var(--primary); display:block;">(ID: ${idExibicao})</small></td>
                <td>${escapeHtml(func.cpf)}</td>
                <td>${escapeHtml(func.email)}</td>
                <td>${escapeHtml(func.area)}</td>
                <td>
                    <div class="action-buttons">
                        <button type="button" class="btn-action" onclick="abrirModalEdicao('${chaveNode}')" title="Editar">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button type="button" class="btn-action btn-delete" onclick="excluirFuncionario('${chaveNode}')" title="Excluir">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            listaBody.appendChild(tr);
        });

        if (contador) contador.textContent = qtd;
    });
}

/**
 * Edição de Funcionário
 */
window.abrirModalEdicao = function(id) {
    db.ref(`funcionarios/${id}`).once('value').then((snapshot) => {
        const data = snapshot.val();
        if (data) {
            document.getElementById('editId').value = id;
            document.getElementById('editNome').value = data.nome || '';
            document.getElementById('editCpf').value = data.cpf || '';
            document.getElementById('editEmail').value = data.email || '';
            document.getElementById('editArea').value = data.area || 'Gestão';

            const modal = document.getElementById('editModal');
            if (modal) modal.classList.add('active');
        }
    }).catch(err => {
        exibirMensagem('Erro ao carregar dados do funcionário: ' + err.message, 'error');
    });
};

window.fecharModalEdicao = function() {
    const modal = document.getElementById('editModal');
    if (modal) modal.classList.remove('active');
};

function salvarEdicao(event) {
    event.preventDefault();
    const id = document.getElementById('editId').value;
    
    const dadosAtualizados = {
        nome: document.getElementById('editNome').value.trim(),
        cpf: document.getElementById('editCpf').value.trim(),
        email: document.getElementById('editEmail').value.trim(),
        area: document.getElementById('editArea').value
    };

    if (!dadosAtualizados.nome || !dadosAtualizados.cpf || !dadosAtualizados.email) {
        exibirMensagem('Preencha os campos obrigatórios no formulário de edição.', 'error');
        return;
    }

    db.ref(`funcionarios/${id}`).update(dadosAtualizados)
        .then(() => {
            exibirMensagem('Funcionário atualizado com sucesso!', 'success');
            fecharModalEdicao();
        })
        .catch((error) => {
            exibirMensagem('Erro ao atualizar no banco: ' + error.message, 'error');
        });
}

/**
 * Exclusão de Funcionário (Database + Firebase Auth no cliente)
 */
window.excluirFuncionario = async function(id) {
    if (!confirm("Deseja realmente excluir este funcionário?")) {
        return;
    }

    try {
        // 1. Busca os dados do funcionário para pegar o e-mail e uidAuth
        const snapshot = await db.ref(`funcionarios/${id}`).once('value');
        const dados = snapshot.val();

        if (!dados) {
            exibirMensagem("Funcionário não encontrado no banco de dados.", "error");
            return;
        }

        // 2. Remove do Realtime Database
        await db.ref(`funcionarios/${id}`).remove();

        // 3. Exclui a conta do Firebase Auth caso o usuário esteja ativo no secondaryAuth
        if (secondaryAuth && secondaryAuth.currentUser && secondaryAuth.currentUser.uid === dados.uidAuth) {
            await secondaryAuth.currentUser.delete();
        }

        exibirMensagem("Funcionário removido com sucesso!", "success");

    } catch (error) {
        console.error("Erro ao excluir:", error);
        exibirMensagem("Erro ao excluir: " + error.message, "error");
    }
};

/**
 * Utilitários de Interface
 */
window.toggleLista = function() {
    const container = document.getElementById('listaContainer');
    const btn = document.getElementById('btnToggleLista');
    if (!container) return;

    const isVisible = container.classList.toggle('visible');
    if (btn) {
        btn.innerHTML = isVisible 
            ? '<i class="fa-solid fa-eye-slash"></i> Ocultar lista' 
            : '<i class="fa-solid fa-users"></i> Ver cadastrados';
    }
};

window.mascaraCPF = function(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

    input.value = value;
};

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
    msgEl.style.display = 'flex';
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
    }, 4000);
}

function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, (m) => {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
}

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