
document.getElementById('cpf').addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, ''); // Apaga tudo que não for número instantaneamente
    
    if (value.length > 11) value = value.slice(0, 11); // Corta qualquer número excedente

    // Aplica a formatação visual 000.000.000-00
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

    e.target.value = value;
});


document.getElementById('form-login').addEventListener('submit', async function(e) {
    e.preventDefault();

    const cpfFormatado = document.getElementById('cpf').value.trim();
    const senhaDigitada = document.getElementById('senha').value;
    const mensagem = document.getElementById('mensagem');
    const loader = document.getElementById('loader');

    // Limpa os números para consultar no banco
    const cpfLimpo = cpfFormatado.replace(/\D/g, '');

    try {
        // Exibe loader inicial
        if (loader) loader.classList.remove('escondido');

        // Busca o documento no Firebase
        const docRef = doc(db, "funcionarios", cpfLimpo);
        const docSnap = await getDoc(docRef);

        // Se o CPF não existir (ou se o usuário digitou menos de 11 dígitos)
        if (!docSnap.exists()) {
            mensagem.innerText = "CPF ou senha incorretos.";
            mensagem.style.color = "red";
            if (loader) loader.classList.add('escondido');
            return;
        }

        const funcionario = docSnap.data();

        // Compara a senha
        if (funcionario.senha === senhaDigitada) {
            mensagem.innerText = "Login realizado com sucesso! Redirecionando...";
            mensagem.style.color = "green";

            sessionStorage.setItem('usuarioLogado', JSON.stringify({
                nome: funcionario.nome,
                cpf: funcionario.cpf,
                setor: funcionario.setor
            }));

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1200);

        } else {
            // Senha incorreta
            mensagem.innerText = "CPF ou senha incorretos.";
            mensagem.style.color = "red";
            if (loader) loader.classList.add('escondido');
        }

    } catch (erro) {
        console.error("Erro ao autenticar:", erro);
        mensagem.innerText = "Erro ao tentar fazer login. Tente novamente!";
        mensagem.style.color = "red";
        if (loader) loader.classList.add('escondido');
    }
});