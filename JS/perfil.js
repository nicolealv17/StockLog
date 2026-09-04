// Upload de Avatar  document.getElementById('avatarUploadInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('error', 'Formato inválido', 'Por favor, selecione uma imagem (JPG, PNG, GIF, etc.)'); this.value = ''; return; }
    const reader = new FileReader();
    reader.onload = function(ev) {
      const imageUrl = ev.target.result;
      const avatarImg = document.getElementById('avatarImage');
      const avatarIcon = document.getElementById('avatarIcon');
      avatarIcon.style.display = 'none'; avatarImg.style.display = 'block'; avatarImg.src = imageUrl;
      try { localStorage.setItem('stocklog_profile_photo', imageUrl); window.dispatchEvent(new Event('profileUpdated')); } catch (e) { console.warn('Erro ao salvar foto', e); }
      showToast('success', 'Foto atualizada!', 'Sua foto de perfil foi alterada e salva com sucesso.');
    };
    reader.readAsDataURL(file);
  }

  // Salvar Perfil
  function saveProfile(event) {
    event.preventDefault();
    const name = document.getElementById('editName').value;
    const email = document.getElementById('editEmail').value;
    const role = document.getElementById('editRole').value;
    document.querySelector('.profile-name').textContent = name;
    document.getElementById('profile-email').textContent = email;
    document.getElementById('profile-role-text').textContent = role;
    try { localStorage.setItem('stocklog_profile_name', name); window.dispatchEvent(new Event('profileUpdated')); } catch (e) { console.warn('Erro ao salvar nome', e); }
    closeModal('editModal');
    showToast('success', 'Perfil atualizado', 'Suas informações foram salvas com sucesso!');
  }

  // Carregar dados salvos
  document.addEventListener('DOMContentLoaded', function() {
    try {
      const savedPhoto = localStorage.getItem('stocklog_profile_photo');
      if (savedPhoto) { const avatarImg = document.getElementById('avatarImage'); const avatarIcon = document.getElementById('avatarIcon'); avatarIcon.style.display = 'none'; avatarImg.style.display = 'block'; avatarImg.src = savedPhoto; }
      const savedName = localStorage.getItem('stocklog_profile_name');
      if (savedName && savedName.trim() !== '') { document.querySelector('.profile-name').textContent = savedName; document.getElementById('editName').value = savedName; }
    } catch (e) { console.warn('Erro ao carregar dados', e); }
  });

  // Modais
  function openEditModal() { document.getElementById('editModal').classList.add('active'); }
  function openPasswordModal() { document.getElementById('passwordModal').classList.add('active'); }
  function openPreferencesModal() { document.getElementById('preferencesModal').classList.add('active'); }
  function closeModal(modalId) { document.getElementById(modalId).classList.remove('active'); }
  document.querySelectorAll('.modal-overlay').forEach(overlay => { overlay.addEventListener('click', function(e) { if (e.target === this) { this.classList.remove('active'); } }); });

  // Toggle
  function toggleSwitch(element) { element.classList.toggle('active'); }
  function savePreferences() {
    const prefs = { notifications: document.querySelectorAll('.toggle-switch')[0].classList.contains('active'), emails: document.querySelectorAll('.toggle-switch')[1].classList.contains('active'), darkMode: document.querySelectorAll('.toggle-switch')[2].classList.contains('active'), reports: document.querySelectorAll('.toggle-switch')[3].classList.contains('active'), ai: document.querySelectorAll('.toggle-switch')[4].classList.contains('active') };
    if (prefs.darkMode) { document.body.classList.add('dark'); } else { document.body.classList.remove('dark'); }
    closeModal('preferencesModal');
    showToast('success', 'Preferências salvas', 'Suas preferências foram atualizadas com sucesso!');
  }

  // Senha
  function changePassword(event) {
    event.preventDefault();
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    if (newPassword !== confirmPassword) { showToast('error', 'Erro', 'As senhas não coincidem!'); return; }
    if (newPassword.length < 6) { showToast('error', 'Erro', 'A nova senha deve ter pelo menos 6 caracteres!'); return; }
    if (document.getElementById('currentPassword').value === '123456') { closeModal('passwordModal'); document.getElementById('passwordForm').reset(); showToast('success', 'Senha alterada', 'Sua senha foi atualizada com sucesso!'); } else { showToast('error', 'Erro', 'Senha atual incorreta!'); }
  }

  // Logout
  function confirmLogout() { if (confirm('Tem certeza que deseja sair?')) { showToast('success', 'Saindo...', 'Você será redirecionado para o login.'); setTimeout(() => { window.location.href = 'login.html'; }, 1500); } }

  // Toast
  function showToast(type, title, message) {
    const existingToast = document.querySelector('.toast'); if (existingToast) existingToast.remove();
    const toast = document.createElement('div'); toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    toast.innerHTML = `<i class="fas ${icon}"></i><div class="toast-content"><div class="toast-title">${title}</div><div class="toast-message">${message}</div></div><button class="modal-close" onclick="this.parentElement.remove()" style="width: 28px; height: 28px;"><i class="fas fa-times" style="font-size: 12px;"></i></button>`;
    document.body.appendChild(toast);
    setTimeout(() => { if (toast.parentElement) toast.remove(); }, 3000);
  }