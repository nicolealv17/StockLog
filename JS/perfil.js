// ============================================================
// StockLog · Minha Conta - Lógica Principal
// ============================================================

// Upload de Avatar
document.getElementById('avatarUploadInput').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showToast('error', 'Formato inválido', 'Por favor, selecione uma imagem (JPG, PNG, GIF, etc.)');
    this.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = function(ev) {
    const imageUrl = ev.target.result;
    const avatarImg = document.getElementById('avatarImage');
    const avatarIcon = document.getElementById('avatarIcon');
    avatarIcon.style.display = 'none';
    avatarImg.style.display = 'block';
    avatarImg.src = imageUrl;
    try {
      localStorage.setItem('stocklog_profile_photo', imageUrl);
    } catch (e) {
      console.warn('Erro ao salvar foto no localStorage:', e);
    }
    showToast('success', 'Foto atualizada!', 'Sua foto de perfil foi alterada e salva com sucesso.');
  };
  reader.readAsDataURL(file);
});

// Salvar Perfil (sem editar o cargo)
function saveProfile(event) {
  event.preventDefault();

  // Obtém apenas nome e e-mail
  const name = document.getElementById('editName').value.trim();
  const email = document.getElementById('editEmail').value.trim();

  // Valida apenas nome e e-mail
  if (!name || !email) {
    showToast('error', 'Campos obrigatórios', 'Preencha o nome e o e-mail antes de salvar.');
    return;
  }

  // Atualiza a interface (cargo NÃO é alterado)
  document.querySelector('.profile-name').textContent = name;
  document.getElementById('profile-email').textContent = email;
  // O cargo permanece o mesmo (não é atualizado)

  // Salva no localStorage (apenas nome e e-mail)
  try {
    localStorage.setItem('stocklog_profile_name', name);
    localStorage.setItem('stocklog_profile_email', email);
    // Não salva o cargo, pois ele é fixo
  } catch (e) {
    console.warn('Erro ao salvar perfil:', e);
  }

  closeModal('editModal');
  showToast('success', 'Perfil atualizado', 'Suas informações foram salvas com sucesso!');
}

// Carregar dados salvos ao iniciar
document.addEventListener('DOMContentLoaded', function() {
  try {
    // Avatar
    const savedPhoto = localStorage.getItem('stocklog_profile_photo');
    if (savedPhoto) {
      const avatarImg = document.getElementById('avatarImage');
      const avatarIcon = document.getElementById('avatarIcon');
      avatarIcon.style.display = 'none';
      avatarImg.style.display = 'block';
      avatarImg.src = savedPhoto;
    }

    // Nome
    const savedName = localStorage.getItem('stocklog_profile_name');
    if (savedName) {
      document.querySelector('.profile-name').textContent = savedName;
      document.getElementById('editName').value = savedName;
    }

    // E-mail
    const savedEmail = localStorage.getItem('stocklog_profile_email');
    if (savedEmail) {
      document.getElementById('profile-email').textContent = savedEmail;
      document.getElementById('editEmail').value = savedEmail;
    }

    // Cargo: NÃO é carregado do localStorage, pois é fixo.
    // Se quiser carregar, você pode definir um valor padrão, mas não é editável.
  } catch (e) {
    console.warn('Erro ao carregar dados do localStorage:', e);
  }
});

// Modais
function openEditModal() {
  document.getElementById('editModal').classList.add('active');
}
function openPasswordModal() {
  document.getElementById('passwordModal').classList.add('active');
}
function openPreferencesModal() {
  document.getElementById('preferencesModal').classList.add('active');
}
function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

// Fechar modal ao clicar no overlay
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', function(e) {
    if (e.target === this) {
      this.classList.remove('active');
    }
  });
});

// Toggle Switch
function toggleSwitch(element) {
  element.classList.toggle('active');
}

// Salvar Preferências
function savePreferences() {
  const toggles = document.querySelectorAll('.toggle-switch');
  const prefs = {
    notifications: toggles[0].classList.contains('active'),
    emails: toggles[1].classList.contains('active'),
    darkMode: toggles[2].classList.contains('active'),
    reports: toggles[3].classList.contains('active'),
    ai: toggles[4].classList.contains('active')
  };

  if (prefs.darkMode) {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }

  try {
    localStorage.setItem('stocklog_preferences', JSON.stringify(prefs));
  } catch (e) {
    console.warn('Erro ao salvar preferências:', e);
  }

  closeModal('preferencesModal');
  showToast('success', 'Preferências salvas', 'Suas preferências foram atualizadas com sucesso!');
}

// Alterar Senha
function changePassword(event) {
  event.preventDefault();
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (newPassword !== confirmPassword) {
    showToast('error', 'Erro', 'As senhas não coincidem!');
    return;
  }
  if (newPassword.length < 6) {
    showToast('error', 'Erro', 'A nova senha deve ter pelo menos 6 caracteres!');
    return;
  }
  if (currentPassword === '123456') {
    closeModal('passwordModal');
    document.getElementById('passwordForm').reset();
    showToast('success', 'Senha alterada', 'Sua senha foi atualizada com sucesso!');
  } else {
    showToast('error', 'Erro', 'Senha atual incorreta!');
  }
}

// Logout
function confirmLogout() {
  if (confirm('Tem certeza que deseja sair?')) {
    showToast('success', 'Saindo...', 'Você será redirecionado para o login.');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
  }
}

// Toast Notification
function showToast(type, title, message) {
  const existingToast = document.querySelector('.toast');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
  toast.innerHTML = `
    <i class="fas ${icon}"></i>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="modal-close" onclick="this.parentElement.remove()" style="width: 28px; height: 28px;">
      <i class="fas fa-times" style="font-size: 12px;"></i>
    </button>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) toast.remove();
  }, 3000);
}