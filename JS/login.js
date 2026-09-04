document.addEventListener('DOMContentLoaded', () => {

    // =====================================================================
    // 1. GERENCIAMENTO DE TEMA (CLARO / ESCURO)
    // =====================================================================
    const htmlElement = document.documentElement;
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');

    function applyTheme(theme) {
        htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem('stocklog-theme', theme);

        if (themeIcon) {
            themeIcon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        }
    }

    const savedTheme = localStorage.getItem('stocklog-theme') || 'light';
    applyTheme(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', (e) => {
            e.preventDefault();
            const currentTheme = htmlElement.getAttribute('data-theme') || 'light';
            applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
        });
    }

    // =====================================================================
    // 2. EFEITO MOUSE GLOW (BRILHO DO CURSOR)
    // =====================================================================
    const mouseGlow = document.getElementById('mouseGlow');

    if (mouseGlow) {
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let glowX = mouseX;
        let glowY = mouseY;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function animateGlow() {
            glowX += (mouseX - glowX) * 0.1;
            glowY += (mouseY - glowY) * 0.1;

            mouseGlow.style.left = '0px';
            mouseGlow.style.top = '0px';
            mouseGlow.style.transform = `translate3d(${glowX - 250}px, ${glowY - 250}px, 0px)`;

            requestAnimationFrame(animateGlow);
        }

        animateGlow();
    }

    // =====================================================================
    // 3. VISIBILIDADE DA SENHA
    // =====================================================================
    const passwordInput = document.getElementById('passwordInput');
    const togglePassword = document.getElementById('togglePassword');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const isPassword = passwordInput.getAttribute('type') === 'password';
            passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
            togglePassword.classList.toggle('fa-eye', !isPassword);
            togglePassword.classList.toggle('fa-eye-slash', isPassword);
        });
    }

    // =====================================================================
    // 4. AUTENTICAÇÃO VIA E-MAIL E SENHA (FIREBASE AUTH)
    // =====================================================================
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('emailInput');
    const btnLogin = document.getElementById('btnLogin');
    const btnText = document.getElementById('btnText');
    const btnSpinner = document.getElementById('btnSpinner');
    const cardContainer = document.getElementById('cardContainer');
    const mensagem = document.getElementById('mensagem');
    let enviando = false;

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            if (enviando) return;
            enviando = true;

            if (mensagem) {
                mensagem.textContent = '';
                mensagem.style.color = 'inherit';
            }

            const email = emailInput ? emailInput.value.trim() : '';
            const senha = passwordInput ? passwordInput.value : '';

            if (!email) {
                exibirErro("Digite seu e-mail!");
                enviando = false;
                return;
            }

            if (!senha) {
                exibirErro("Digite sua senha!");
                enviando = false;
                return;
            }

            ativarCarregamento(true);

            // Resgata a instância do Firebase Auth declarada no HTML
            const autenticacao = (typeof auth !== 'undefined') ? auth : firebase.auth();

            autenticacao.signInWithEmailAndPassword(email, senha)
                .then((userCredential) => {
                    const user = userCredential.user;

                    if (btnSpinner) btnSpinner.style.display = 'none';
                    if (btnText) {
                        btnText.style.display = 'inline';
                        btnText.textContent = 'Sucesso!';
                    }
                    if (btnLogin) {
                        btnLogin.style.background = '#16a34a';
                        btnLogin.disabled = true;
                    }

                    if (mensagem) {
                        mensagem.textContent = "Login realizado com sucesso! Redirecionando...";
                        mensagem.style.color = "#16a34a";
                    }

                    sessionStorage.setItem('usuarioLogado', JSON.stringify({
                        uid: user.uid,
                        email: user.email
                    }));

                    setTimeout(() => {
                        if (cardContainer) {
                            cardContainer.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
                            cardContainer.style.opacity = '0';
                            cardContainer.style.transform = 'translateY(-30px) scale(0.95)';
                        }

                        setTimeout(() => {
                            window.location.href = "index.html";
                        }, 400);
                    }, 500);
                })
                .catch((erro) => {
                    console.error("Erro no login:", erro);
                    enviando = false;

                    let msgErro = "E-mail ou senha incorretos.";
                    
                    if (erro.code === 'auth/invalid-email') {
                        msgErro = "E-mail inválido.";
                    } else if (erro.code === 'auth/user-not-found' || erro.code === 'auth/wrong-password') {
                        msgErro = "E-mail ou senha incorretos.";
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
    // 5. FUNÇÕES AUXILIARES DA INTERFACE
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
            if (btnText) {
                btnText.style.display = 'inline';
                btnText.textContent = 'Entrar';
            }
            if (btnLogin) {
                btnLogin.disabled = false;
                btnLogin.style.pointerEvents = 'auto';
                btnLogin.style.background = '';
            }
        }
    }

    function exibirErro(msg) {
        if (mensagem) {
            mensagem.textContent = msg;
            mensagem.style.color = "#ef4444";
        }

        if (cardContainer) {
            cardContainer.classList.add('shake');
            setTimeout(() => cardContainer.classList.remove('shake'), 400);
        }

        ativarCarregamento(false);
    }
});