/* ================================================================
   HEADER COMPONENT - StockLog
   Injeta o cabeçalho superior na div #header-root.
   Depende de: components/css/header.css
   Requer que este script seja carregado ANTES de components/js/sidebar.js,
   pois o botão #mobileMenuBtn (usado pela sidebar no mobile) é criado aqui.

   O botão de tema (#themeToggleBtn) é só a marcação — quem controla
   clique, ícone (sol/lua) e persistência é o components/js/modoescuro.js.
   Por isso este arquivo NÃO carrega nenhuma lógica de tema: se o
   modoescuro.js não estiver incluído na página, o botão simplesmente
   fica sem função (mas não gera erro).
   ================================================================ */

(function () {
  const headerRoot = document.getElementById("header-root");
  if (!headerRoot) return;

  headerRoot.innerHTML = `
    <header class="top-header" role="banner">
      <div class="header-left">
        <button
          class="mobile-menu-btn"
          id="mobileMenuBtn"
          type="button"
          aria-label="Abrir menu"
        >
          <i class="fas fa-bars"></i>
        </button>
        <div class="page-title">Stock<span>Log</span></div>
        <div class="search-box" role="search">
          <i class="fas fa-search"></i>
          <input type="search" placeholder="Buscar..." aria-label="Buscar" />
        </div>
      </div>
      <div class="header-right">
        <span class="notif-btn" aria-label="Notificações">
          <i class="fas fa-bell"></i>
          <span class="badge">3</span>
        </span>
        <button
          class="user-profile-link"
          onclick="window.location.href = 'pages/perfil.html'"
        >
          <i class="fas fa-user-circle"></i>
        </button>
        <button
          class="theme-btn"
          id="themeToggleBtn"
          type="button"
          aria-label="Alternar tema"
        >
          <i class="fas fa-moon"></i>
        </button>
      </div>
    </header>
  `;
})();

/* A alternância de tema (claro/escuro) é controlada pelo componente
   components/js/modoescuro.js, que detecta o botão #themeToggleBtn
   criado acima e assume o clique, o ícone e o salvamento da
   preferência — não é necessário nenhum código aqui. */