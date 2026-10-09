// ============================================================
// StockLog · Minha Conta - Firebase Compat v9
// Banco: /funcionarios/{idNumerico} → { id, uidAuth, nome, cpf, email, area, ... }
// ============================================================

let currentAuthUser = null;
let currentFuncId   = null;
let currentFuncData = null;

// ------------------------------------------------------------
// Aguarda autenticação e localiza o funcionário pelo uidAuth
// ------------------------------------------------------------
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  currentAuthUser = user;
  console.log('[perfil] usuário autenticado:', user.uid, user.email);

  const found = await localizarFuncionarioPorUid(user.uid);

  if (!found) {
    console.warn('[perfil] nenhum nó em /funcionarios com uidAuth =', user.uid);
    currentFuncData = {
      nome: user.displayName || (user.email ? user.email.split('@')[0] : 'Usuário'),
      email: user.email || '—',
      area: '—',
      cpf: '—',
      id: '—',
      status: 'ativo'
    };
    renderProfile(currentFuncData);
    showToast('error', 'Perfil não encontrado',
      'Sua conta existe no Auth, mas não há cadastro em /funcionarios.');
    return;
  }

  currentFuncId   = found.id;
  currentFuncData = found.data;
  renderProfile(currentFuncData);
  loadPreferences(currentFuncId);
});

// ------------------------------------------------------------
// Busca em /funcionarios o nó cujo uidAuth === uid
// ------------------------------------------------------------
async function localizarFuncionarioPorUid(uid) {
  const snap = await db.ref('funcionarios').once('value');
  if (!snap.exists()) return null;

  let resultado = null;
  snap.forEach((child) => {
    const data = child.val();
    if (data && data.uidAuth === uid) {
      resultado = { id: child.key, data };
      return true;
    }
  });
  return resultado;
}

// ------------------------------------------------------------
// Renderiza os dados reais
// ------------------------------------------------------------
function renderProfile(data) {
  const nome  = data.nome  || 'Usuário';
  const email = data.email || (currentAuthUser && currentAuthUser.email) || '—';
  const area  = data.area  || '—';

  const bannerH1 = document.getElementById('bannerGreeting');
  if (bannerH1) bannerH1.textContent = `Bem-vindo, ${nome.split(' ')[0]}!`;

  const nameEl = document.getElementById('profileName');
  if (nameEl) nameEl.textContent = nome;

  const roleEl = document.getElementById('profileRole');
  if (roleEl) roleEl.innerHTML = `<i class="fas fa-briefcase"></i> ${area}`;

  setText('profile-email',     email);
  setText('profile-role-text', area);
  setText('profile-setor',     data.setor || area || '—');
  setText('profile-cadastro',  formatarData(data.criadoEm));
  setText('profile-matricula', data.id || currentFuncId || '—');
  setText('profile-nivel',     data.nivelAcesso || 'Funcionário');

  // Modal de edição
  const editName  = document.getElementById('editName');
  const editEmail = document.getElementById('editEmail');
  const editArea  = document.getElementById('editArea');
  if (editName)  editName.value  = nome;
  if (editEmail) editEmail.value = email;
  if (editArea)  editArea.value  = area;

  // Banner "último acesso"
  const last = document.getElementById('lastAccessInfo');
  if (last) {
    last.innerHTML = `<i class="fas fa-clock"></i> <span>Sessão iniciada · ${new Date().toLocaleString('pt-BR')}</span>`;
  }

  // Segurança
  const sec = document.getElementById('securityInfo');
  if (sec) {
    sec.textContent = `Conta: ${email} · Status: ${data.status || 'ativo'} · Autenticação Firebase ativa`;
  }

  // Avatar
  if (data.foto) {
    const avatarImg  = document.getElementById('avatarImage');
    const avatarIcon = document.getElementById('avatarIcon');
    if (avatarImg && avatarIcon) {
      avatarIcon.style.display = 'none';
      avatarImg.style.display  = 'block';
      avatarImg.src = data.foto;
    }
  }
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function formatarData(valor) {
  if (!valor) return '—';
  if (typeof valor === 'number') return new Date(valor).toLocaleDateString('pt-BR');
  const d = new Date(valor);
  if (!isNaN(d.getTime())) return d.toLocaleDateString('pt-BR');
  return valor;
}

// ------------------------------------------------------------
// Avatar → /funcionarios/{id}/foto
// ------------------------------------------------------------
const avatarInput = document.getElementById('avatarUploadInput');
if (avatarInput) {
  avatarInput.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'Formato inválido', 'Selecione uma imagem (JPG, PNG, GIF).');
      this.value = '';
      return;
    }
    if (file.size > 1024 * 1024) {
      showToast('error', 'Imagem muito grande', 'Use uma imagem com menos de 1MB.');
      this.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const imageUrl = ev.target.result;

      const avatarImg  = document.getElementById('avatarImage');
      const avatarIcon = document.getElementById('avatarIcon');
      avatarIcon.style.display = 'none';
      avatarImg.style.display  = 'block';
      avatarImg.src = imageUrl;

      try {
        await db.ref(`funcionarios/${currentFuncId}/foto`).set(imageUrl);
        showToast('success', 'Foto atualizada!', 'Sua foto de perfil foi salva.');
      } catch (err) {
        console.error('[perfil] erro ao salvar foto:', err);
        showToast('error', 'Erro', 'Não foi possível salvar a foto no servidor.');
      }
    };
    reader.readAsDataURL(file);
  });
}

// ------------------------------------------------------------
// Salvar perfil (nome + email)
// ------------------------------------------------------------
async function saveProfile(event) {
  event.preventDefault();

  const name  = document.getElementById('editName').value.trim();
  const email = document.getElementById('editEmail').value.trim();

  if (!name || !email) {
    showToast('error', 'Campos obrigatórios', 'Preencha nome e e-mail antes de salvar.');
    return;
  }

  try {
    if (currentAuthUser) {
      await currentAuthUser.updateProfile({ displayName: name });
    }

    if (currentFuncId) {
      await db.ref(`funcionarios/${currentFuncId}`).update({
        nome: name,
        email: email,
        atualizadoEm: new Date().toISOString()
      });
    }

    // UI
    document.getElementById('profileName').textContent = name;
    setText('profile-email', email);
    const bannerH1 = document.getElementById('bannerGreeting');
    if (bannerH1) bannerH1.textContent = `Bem-vindo, ${name.split(' ')[0]}!`;

    if (currentFuncData) {
      currentFuncData.nome  = name;
      currentFuncData.email = email;
    }

    closeModal('editModal');
    showToast('success', 'Perfil atualizado', 'Suas informações foram salvas com sucesso!');
  } catch (err) {
    console.error('[perfil] erro ao salvar:', err);
    showToast('error', 'Erro', 'Não foi possível salvar as alterações.');
  }
}
window.saveProfile = saveProfile;

// ------------------------------------------------------------
// Alterar senha
// ------------------------------------------------------------
async function changePassword(event) {
  event.preventDefault();

  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword     = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (newPassword !== confirmPassword) {
    showToast('error', 'Erro', 'As senhas não coincidem!');
    return;
  }
  if (newPassword.length < 6) {
    showToast('error', 'Erro', 'A nova senha deve ter pelo menos 6 caracteres!');
    return;
  }

  try {
    const credential = firebase.auth.EmailAuthProvider
      .credential(currentAuthUser.email, currentPassword);

    await currentAuthUser.reauthenticateWithCredential(credential);
    await currentAuthUser.updatePassword(newPassword);

    closeModal('passwordModal');
    document.getElementById('passwordForm').reset();
    showToast('success', 'Senha alterada', 'Sua senha foi atualizada com sucesso!');
  } catch (err) {
    console.error('[perfil] erro senha:', err);
    let msg = 'Não foi possível alterar a senha.';
    if (err.code === 'auth/wrong-password')        msg = 'Senha atual incorreta!';
    if (err.code === 'auth/weak-password')         msg = 'A nova senha é muito fraca.';
    if (err.code === 'auth/requires-recent-login') msg = 'Faça login novamente para alterar.';
    showToast('error', 'Erro', msg);
  }
}
window.changePassword = changePassword;

// ------------------------------------------------------------
// Preferências
// ------------------------------------------------------------
async function loadPreferences(funcId) {
  try {
    const snap = await db.ref(`funcionarios/${funcId}/preferencias`).once('value');
    if (!snap.exists()) return;

    const prefs   = snap.val();
    const toggles = document.querySelectorAll('.toggle-switch');
    const keys    = ['notifications', 'emails', 'darkMode', 'reports', 'ai'];

    keys.forEach((k, i) => {
      if (!toggles[i]) return;
      if (prefs[k]) toggles[i].classList.add('active');
      else          toggles[i].classList.remove('active');
    });

    if (prefs.darkMode) document.body.classList.add('dark');
    else                document.body.classList.remove('dark');
  } catch (err) {
    console.warn('[perfil] erro ao carregar preferências:', err);
  }
}

async function savePreferences() {
  const toggles = document.querySelectorAll('.toggle-switch');
  const prefs = {
    notifications: toggles[0].classList.contains('active'),
    emails:        toggles[1].classList.contains('active'),
    darkMode:      toggles[2].classList.contains('active'),
    reports:       toggles[3].classList.contains('active'),
    ai:            toggles[4].classList.contains('active')
  };

  if (prefs.darkMode) document.body.classList.add('dark');
  else                document.body.classList.remove('dark');

  try {
    await db.ref(`funcionarios/${currentFuncId}/preferencias`).update(prefs);
    closeModal('preferencesModal');
    showToast('success', 'Preferências salvas', 'Suas preferências foram atualizadas!');
  } catch (err) {
    console.error('[perfil] erro ao salvar preferências:', err);
    showToast('error', 'Erro', 'Não foi possível salvar as preferências.');
  }
}
window.savePreferences = savePreferences;

// ------------------------------------------------------------
// Logout
// ------------------------------------------------------------
function confirmLogout() {
  if (!confirm('Tem certeza que deseja sair?')) return;
  auth.signOut()
    .then(() => {
      showToast('success', 'Saindo...', 'Você será redirecionado para o login.');
      setTimeout(() => { window.location.href = 'login.html'; }, 1200);
    })
    .catch((err) => {
      console.error('[perfil] erro ao sair:', err);
      showToast('error', 'Erro', 'Não foi possível encerrar a sessão.');
    });
}
window.confirmLogout = confirmLogout;

// ------------------------------------------------------------
// Modais / toggle
// ------------------------------------------------------------
window.openEditModal        = () => document.getElementById('editModal').classList.add('active');
window.openPasswordModal    = () => document.getElementById('passwordModal').classList.add('active');
window.openPreferencesModal = () => document.getElementById('preferencesModal').classList.add('active');
window.closeModal           = (id) => document.getElementById(id).classList.remove('active');
window.toggleSwitch         = (el) => el.classList.toggle('active');

document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', function (e) {
    if (e.target === this) this.classList.remove('active');
  });
});

// ------------------------------------------------------------
// Toast
// ------------------------------------------------------------
window.showToast = function (type, title, message) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
  toast.innerHTML = `
    <i class="fas ${icon}"></i>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="modal-close" onclick="this.parentElement.remove()" style="width:28px;height:28px;">
      <i class="fas fa-times" style="font-size:12px;"></i>
    </button>
  `;
  document.body.appendChild(toast);
  setTimeout(() => { if (toast.parentElement) toast.remove(); }, 3000);
};

console.log('[perfil] perfil.js carregado — Compat v9 + /funcionarios');