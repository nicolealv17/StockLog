  document.addEventListener('DOMContentLoaded', () => {
      // =====================================================================
      // MAPEAMENTO DOS ELEMENTOS DA PÁGINA
      // =====================================================================
      const htmlElement = document.documentElement;
      const themeToggle = document.getElementById('themeToggle');
      const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;
      const mouseGlow = document.getElementById('mouseGlow');

      // Suporta múltiplos nomes de ID para flexibilidade
      const registerForm = document.getElementById('registerForm') || document.getElementById('form');
      const cpfInput = document.getElementById('cpfInput') || document.getElementById('cpf');
      const passwordInput = document.getElementById('passwordInput') || document.getElementById('senha');

      const togglePassword = document.getElementById('togglePassword');
      const btnRegister = document.getElementById('btnRegister');
      const btnText = document.getElementById('btnText');
      const btnSpinner = document.getElementById('btnSpinner');
      const cardContainer = document.getElementById('cardContainer');
      const mensagem = document.getElementById('mensagem');

      // Trava contra envios duplicados
      let enviando = false;

      // =====================================================================
      // A) GERENCIAMENTO DE TEMA (CLARO / ESCURO)
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
      // B) EFEITO GLOW SEGUINDO O MOUSE (otimizado com transform)
      // =====================================================================
      if (mouseGlow) {
          document.addEventListener('mousemove', (e) => {
              // Usa transform (GPU) em vez de left/top (reflow)
              mouseGlow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
          });
      }

      // =====================================================================
      // C) MÁSCARA AUTOMÁTICA DE CPF
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
      // D) EXIBIR / OCULTAR SENHA
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

              // Trava contra duplo envio
              if (enviando) return;
              enviando = true;

              // Reseta mensagem anterior
              if (mensagem) {
                  mensagem.innerText = '';
                  mensagem.style.color = 'inherit';
              }

              // Captura dos valores
              const cpfFormatado = cpfInput ? cpfInput.value.trim() : '';
              const cpfLimpo = cpfFormatado.replace(/\D/g, '');

              const emailInput = document.getElementById('emailInput');
              const emailFormatado = emailInput ? emailInput.value.trim().toLowerCase() : '';

              const senha = passwordInput ? passwordInput.value : '';

              const nomeInput = document.getElementById('nomeInput');
              const nome = nomeInput ? nomeInput.value.trim() : '';

              const setorInput = document.getElementById('setorSelect');
              const setor = setorInput ? setorInput.value.trim() : '';

              // --- VALIDAÇÕES ---
              if (!validarCPF(cpfLimpo)) {
                  exibirErro("Erro: Digite um CPF válido!");
                  enviando = false;
                  return;
              }

              const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!regexEmail.test(emailFormatado)) {
                  exibirErro("Erro: Digite um e-mail válido!");
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

              // Objeto a ser salvo
              const funcionario = {
                  nome: nome,
                  cpf: cpfFormatado,
                  setor: setor,
                  email: emailFormatado,
                  senha: senha,
                  dataCadastro: new Date().toISOString()
              };

              // Verifica se já existe cadastro com esse CPF antes de salvar
              db.ref('funcionarios/' + cpfLimpo).once('value')
                  .then(snap => {
                      if (snap.exists()) {
                          throw new Error('CPF_DUPLICADO');
                      }
                      return db.ref('funcionarios/' + cpfLimpo).set(funcionario);
                  })
                  .then(() => {
                      // Sucesso no salvamento
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
                      console.error("Erro ao salvar:", erro);

                      if (erro.message === 'CPF_DUPLICADO') {
                          exibirErro("Este CPF já possui cadastro!");
                      } else {
                          exibirErro("Erro ao realizar o cadastro. Tente novamente!");
                      }

                      ativarCarregamento(false);
                      enviando = false;
                  });
          });
      }

      // =====================================================================
      // FUNÇÕES AUXILIARES
      // =====================================================================

      // Validação real de CPF (com dígitos verificadores)
      function validarCPF(cpf) {
          cpf = cpf.replace(/\D/g, '');

          if (cpf.length !== 11) return false;

          // Rejeita CPFs com todos os dígitos iguais (000.000.000-00, 111.111.111-11, etc.)
          if (/^(\d)\1+$/.test(cpf)) return false;

          let soma = 0;
          let resto;

          // Valida primeiro dígito verificador
          for (let i = 1; i <= 9; i++) {
              soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
          }
          resto = (soma * 10) % 11;
          if (resto === 10 || resto === 11) resto = 0;
          if (resto !== parseInt(cpf.substring(9, 10))) return false;

          // Valida segundo dígito verificador
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