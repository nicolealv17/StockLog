  document.addEventListener('DOMContentLoaded', () => {
      // =====================================================================
      // MAPEAMENTO DOS ELEMENTOS
      // =====================================================================
      const htmlElement = document.documentElement;
      const themeToggle = document.getElementById('themeToggle');
      const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;
      const mouseGlow = document.getElementById('mouseGlow');

      const registerForm = document.getElementById('registerForm');
      const cpfInput = document.getElementById('cpfInput');
      const passwordInput = document.getElementById('passwordInput');

      const togglePassword = document.getElementById('togglePassword');
      const btnRegister = document.getElementById('btnRegister');
      const btnText = document.getElementById('btnText');
      const btnSpinner = document.getElementById('btnSpinner');
      const cardContainer = document.getElementById('cardContainer');
      const mensagem = document.getElementById('mensagem');

      // Trava contra envios duplicados
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
      // B) EFEITO GLOW NO MOUSE
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
      // E) SUBMISSÃO DO FORMULÁRIO
      // =====================================================================
      if (registerForm) {
          registerForm.addEventListener('submit', (e) => {
              e.preventDefault();

              if (enviando) return;
              enviando = true;

              if (mensagem) {
                  mensagem.innerText = '';
                  mensagem.style.color = 'inherit';
              }

              // Captura dos valores
              const cpfFormatado = cpfInput ? cpfInput.value.trim() : '';
              const cpfLimpo = cpfFormatado.replace(/\D/g, '');

              const nomeInput = document.getElementById('nomeInput');
              const nome = nomeInput ? nomeInput.value.trim() : '';

              const emailInput = document.getElementById('emailInput');
              const email = emailInput ? emailInput.value.trim().toLowerCase() : '';

              const setorInput = document.getElementById('setorSelect');
              const setor = setorInput ? setorInput.value : '';

              const senha = passwordInput ? passwordInput.value : '';

              // --- VALIDAÇÕES ---
              if (!validarCPF(cpfLimpo)) {
                  exibirErro("Erro: Digite um CPF válido!");
                  enviando = false;
                  return;
              }

              const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!regexEmail.test(email)) {
                  exibirErro("Erro: Digite um e-mail válido!");
                  enviando = false;
                  return;
              }

              if (!nome) {
                  exibirErro("Erro: Digite seu nome completo!");
                  enviando = false;
                  return;
              }

              if (!setor) {
                  exibirErro("Erro: Selecione um setor!");
                  enviando = false;
                  return;
              }

              const regexSenhaForte = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#._-])[A-Za-z\d@$!%*?&#._-]{8,}$/;
              if (!regexSenhaForte.test(senha)) {
                  exibirErro("A senha deve ter no mínimo 8 caracteres, com maiúsculas, minúsculas, números e símbolos.");
                  enviando = false;
                  return;
              }

              // Ativa estado de carregamento
              ativarCarregamento(true);

              // ============================================================
              // CADASTRO COM FIREBASE AUTHENTICATION
              // ============================================================
              auth.createUserWithEmailAndPassword(email, senha)
                  .then((userCredential) => {
                      // Usuário criado no Firebase Auth (senha hasheada lá dentro)
                      const user = userCredential.user;

                      // Salva os dados NÃO sensíveis no Realtime Database
                      const dadosUsuario = {
                          uid: user.uid,
                          nome: nome,
                          cpf: cpfFormatado,
                          setor: setor,
                          email: email,
                          dataCadastro: new Date().toISOString()
                          // senha NÃO é salva aqui
                      };

                      return db.ref('funcionarios/' + user.uid).set(dadosUsuario);
                  })
                  .then(() => {
                      // Sucesso total
                      if (btnSpinner) btnSpinner.style.display = 'none';
                      if (btnText) {
                          btnText.style.display = 'inline';
                          btnText.textContent = 'Conta Criada com Sucesso!';
                      }
                      if (btnRegister) {
                          btnRegister.style.background = '#16a34a';
                          btnRegister.disabled = true;
                      }

                      if (mensagem) {
                          mensagem.innerText = "Cadastro realizado! Redirecionando...";
                          mensagem.style.color = "green";
                      }

                      registerForm.reset();

                      // Animação de saída + redirecionamento
                      setTimeout(() => {
                          if (cardContainer) {
                              cardContainer.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
                              cardContainer.style.opacity = '0';
                              cardContainer.style.transform = 'translateY(-30px) scale(0.95)';
                          }

                          setTimeout(() => {
                              window.location.href = "login.html";
                          }, 400);
                      }, 800);
                  })
                  .catch((erro) => {
                      console.error("Erro no cadastro:", erro);
                      enviando = false;

                      // Traduz erros comuns do Firebase Auth
                      let msgErro = "Erro ao realizar o cadastro. Tente novamente!";

                      switch (erro.code) {
                          case 'auth/email-already-in-use':
                              msgErro = "Este e-mail já está cadastrado!";
                              break;
                          case 'auth/invalid-email':
                              msgErro = "E-mail inválido!";
                              break;
                          case 'auth/weak-password':
                              msgErro = "Senha muito fraca! Use letras, números e símbolos.";
                              break;
                          case 'auth/network-request-failed':
                              msgErro = "Erro de conexão. Verifique sua internet.";
                              break;
                      }

                      exibirErro(msgErro);
                  });
          });
      }

      // =====================================================================
      // FUNÇÕES AUXILIARES
      // =====================================================================

      function validarCPF(cpf) {
          cpf = cpf.replace(/\D/g, '');

          if (cpf.length !== 11) return false;
          if (/^(\d)\1+$/.test(cpf)) return false;

          let soma = 0;
          let resto;

          for (let i = 1; i <= 9; i++) {
              soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
          }
          resto = (soma * 10) % 11;
          if (resto === 10 || resto === 11) resto = 0;
          if (resto !== parseInt(cpf.substring(9, 10))) return false;

          soma = 0;
          for (let i = 1; i <= 10; i++) {
              soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
          }
          resto = (soma * 10) % 11;
          if (resto === 10 || resto === 11) resto = 0;
          if (resto !== parseInt(cpf.substring(10, 11))) return false;

          return true;
      }

      function ativarCarregamento(carregando) {
          if (carregando) {
              if (btnText) btnText.style.display = 'none';
              if (btnSpinner) btnSpinner.style.display = 'block';
              if (btnRegister) {
                  btnRegister.disabled = true;
                  btnRegister.style.pointerEvents = 'none';
              }
          } else {
              if (btnSpinner) btnSpinner.style.display = 'none';
              if (btnText) btnText.style.display = 'inline';
              if (btnRegister) {
                  btnRegister.disabled = false;
                  btnRegister.style.pointerEvents = 'auto';
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