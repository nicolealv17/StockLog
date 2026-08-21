  document.addEventListener('DOMContentLoaded', () => {
      // =====================================================================
      // MAPEAMENTO DOS ELEMENTOS
      // =====================================================================
      const htmlElement = document.documentElement;
      const themeToggle = document.getElementById('themeToggle');
      const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;
      const mouseGlow = document.getElementById('mouseGlow');

      const loginForm = document.getElementById('loginForm') || document.getElementById('form-login');
      const cpfInput = document.getElementById('cpfInput') || document.getElementById('cpf');
      const passwordInput = document.getElementById('passwordInput') || document.getElementById('senha');

      const togglePassword = document.getElementById('togglePassword');
      const btnLogin = document.getElementById('btnLogin') || document.getElementById('btnRegister');
      const btnText = document.getElementById('btnText');
      const btnSpinner = document.getElementById('btnSpinner');
      const cardContainer = document.getElementById('cardContainer');
      const mensagem = document.getElementById('mensagem');

      let enviando = false;

      // =====================================================================
      // A) GERENCIAMENTO DE TEMA
      // =====================================================================
      const savedTheme = localStorage.getItem('stocklog-theme') || 'light';
      setTheme(savedTheme);

      if (themeToggle) {
          themeToggle.addEventListener('click', () => {
              const currentTheme = htmlElement.getAttribute('data-theme');
              const newTheme = currentTheme === 'light' ? 'dark' : 'light';
              setTheme(newTheme);
          });
      }

      function setTheme(theme) {
          htmlElement.setAttribute('data-theme', theme);
          localStorage.setItem('stocklog-theme', theme);

          if (themeIcon) {
              themeIcon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
          }
      }

      // =====================================================================
      // B) GLOW DO MOUSE (otimizado com transform)
      // =====================================================================
      if (mouseGlow) {
          document.addEventListener('mousemove', (e) => {
              mouseGlow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
          });
      }

      // =====================================================================
      // C) MÁSCARA DE CPF
      // =====================================================================
      if (cpfInput) {
          cpfInput.addEventListener('input', (e) => {
              let value = e.target.value.replace(/\D/g, '');
              if (value.length > 11) value = value.slice(0, 11);

              value = value.replace(/(\d{3})(\d)/, '$1.$2');
              value = value.replace(/(\d{3})(\d)/, '$1.$2');
              value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

              e.target.value = value;
          });
      }

      // =====================================================================
      // D) MOSTRAR / OCULTAR SENHA
      // =====================================================================
      if (togglePassword && passwordInput) {
          togglePassword.addEventListener('click', () => {
              const isPassword = passwordInput.getAttribute('type') === 'password';
              passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
              togglePassword.classList.toggle('fa-eye', !isPassword);
              togglePassword.classList.toggle('fa-eye-slash', isPassword);
          });
      }

      // =====================================================================
      // E) SUBMISSÃO DO LOGIN
      // =====================================================================
      if (loginForm) {
          loginForm.addEventListener('submit', (e) => {
              e.preventDefault();

              if (enviando) return;
              enviando = true;

              if (mensagem) {
                  mensagem.innerText = '';
                  mensagem.style.color = 'inherit';
              }

              const cpfFormatado = cpfInput ? cpfInput.value.trim() : '';
              const cpfLimpo = cpfFormatado.replace(/\D/g, '');
              const senha = passwordInput ? passwordInput.value : '';

              // Validação básica
              if (cpfLimpo.length !== 11) {
                  exibirErro("Digite um CPF válido!");
                  enviando = false;
                  return;
              }

              if (!senha) {
                  exibirErro("Digite sua senha!");
                  enviando = false;
                  return;
              }

              ativarCarregamento(true);

              // ============================================================
              // BUSCA O EMAIL ASSOCIADO AO CPF NO REALTIME DATABASE
              // ============================================================
              db.ref('funcionarios')
                  .orderByChild('cpf')
                  .equalTo(cpfFormatado)
                  .once('value')
                  .then((snapshot) => {
                      if (!snapshot.exists()) {
                          throw new Error('CREDENCIAIS_INVALIDAS');
                      }

                      // Pega o email do usuário
                      const funcionarios = snapshot.val();
                      const uid = Object.keys(funcionarios)[0];
                      const dados = funcionarios[uid];

                      if (!dados || !dados.email) {
                          throw new Error('CREDENCIAIS_INVALIDAS');
                      }

                      // Autentica com Firebase Auth usando o email encontrado
                      return auth.signInWithEmailAndPassword(dados.email, senha)
                          .then((userCredential) => {
                              return { user: userCredential.user, dados };
                          });
                  })
                  .then(({ user, dados }) => {
                      // Login bem-sucedido
                      if (btnSpinner) btnSpinner.style.display = 'none';
                      if (btnText) {
                          btnText.style.display = 'inline';
                          btnText.textContent = 'Acessando...';
                      }
                      if (btnLogin) {
                          btnLogin.style.background = '#16a34a';
                          btnLogin.disabled = true;
                      }

                      if (mensagem) {
                          mensagem.innerText = "Login realizado com sucesso! Redirecionando...";
                          mensagem.style.color = "green";
                      }

                      // Salva dados do usuário na sessão
                      sessionStorage.setItem('usuarioLogado', JSON.stringify({
                          uid: user.uid,
                          nome: dados.nome,
                          cpf: dados.cpf,
                          setor: dados.setor,
                          email: dados.email
                      }));

                      // Animação de saída
                      setTimeout(() => {
                          if (cardContainer) {
                              cardContainer.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
                              cardContainer.style.opacity = '0';
                              cardContainer.style.transform = 'translateY(-30px) scale(0.95)';
                          }

                          setTimeout(() => {
                              window.location.href = "dashboard.html";
                          }, 400);
                      }, 800);
                  })
                  .catch((erro) => {
                      console.error("Erro no login:", erro);
                      enviando = false;

                      let msgErro = "CPF ou senha incorretos.";

                      switch (erro.message) {
                          case 'CREDENCIAIS_INVALIDAS':
                              msgErro = "CPF ou senha incorretos.";
                              break;
                      }

                      if (erro.code === 'auth/wrong-password') {
                          msgErro = "CPF ou senha incorretos.";
                      } else if (erro.code === 'auth/user-not-found') {
                          msgErro = "CPF ou senha incorretos.";
                      } else if (erro.code === 'auth/invalid-email') {
                          msgErro = "CPF ou senha incorretos.";
                      } else if (erro.code === 'auth/network-request-failed') {
                          msgErro = "Erro de conexão. Verifique sua internet.";
                      } else if (erro.code === 'auth/too-many-requests') {
                          msgErro = "Muitas tentativas. Aguarde alguns minutos.";
                      }

                      exibirErro(msgErro);
                  });
          });
      }

      // =====================================================================
      // FUNÇÕES AUXILIARES
      // =====================================================================

      function ativarCarregamento(carregando) {
          if (carregando) {
              if (btnText) btnText.style.display = 'none';
              if (btnSpinner) btnSpinner.style.display = 'block';
              if (btnLogin) {
                  btnLogin.disabled = true;
                  btnLogin.style.pointerEvents = 'none';
              }
          } else {
              if (btnSpinner) btnSpinner.style.display = 'none';
              if (btnText) btnText.style.display = 'inline';
              if (btnLogin) {
                  btnLogin.disabled = false;
                  btnLogin.style.pointerEvents = 'auto';
              }
          }
      }

      function exibirErro(msg) {
          if (mensagem) {
              mensagem.innerText = msg;
              mensagem.style.color = "red";
          }

          if (cardContainer) {
              cardContainer.classList.add('shake');
              setTimeout(() => cardContainer.classList.remove('shake'), 400);
          }

          ativarCarregamento(false);
      }
  });