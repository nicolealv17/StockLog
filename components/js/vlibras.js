// components/js/vlibras.js

function carregarVLibras() {
  // 1. Cria a estrutura HTML exigida pelo VLibras
  const vlibrasDiv = document.createElement('div');
  vlibrasDiv.innerHTML = `
    <div vw class="enabled">
      <div vw-access-button class="active"></div>
      <div vw-plugin-wrapper>
        <div class="vw-plugin-top-wrapper"></div>
      </div>
    </div>
  `;
  document.body.appendChild(vlibrasDiv);

  // 2. Carrega o script oficial da API do VLibras
  const script = document.createElement('script');
  script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
  script.async = true;
  script.onload = () => {
    if (window.VLibras) {
      new window.VLibras.Widget('https://vlibras.gov.br/app');
    }
  };

  document.body.appendChild(script);
}

// Executa assim que o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', carregarVLibras);
} else {
  carregarVLibras();
}