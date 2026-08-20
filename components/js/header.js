/* ================================================================
   COMPONENTE: HEADER (StockLog)
   Injeta o cabeçalho no lugar de <div id="header-root"></div>
   ================================================================ */
(function () {
  "use strict";

  // Detecta se a página atual está dentro da pasta /pages/
  var inPagesFolder = window.location.pathname.includes("/pages/");
  var basePath = inPagesFolder ? "../" : "./";

  // Caminho dinâmico da imagem da logo
  var LOGO_SRC = basePath + "IMG/logoo.png";

  function getPageTitle() {
    var titles = {
      "index.html": "Dashboard",
      "pedidos.html": "Pedidos de Produção",
      "kanban.html": "Kanban",
      "producao.html": "Controle de Produção",
      "itens.html": "Itens em Estoque",
      "logistica.html": "Logística",
      "relatorios.html": "Relatórios",
      "fornecedores.html": "Fornecedores",
      "rastreamento.html": "Rastreamento",
      "calendario.html": "Calendário",
      "perfil.html": "Minha Conta",
    };
    var currentFile = window.location.pathname.split("/").pop() || "index.html";
    return titles[currentFile] || "StockLog";
  }

  function buildHeaderHTML() {
    var title = getPageTitle();
    return (
      '<header class="header" role="banner">' +
      '<div class="header-left">' +
      // Botão hambúrguer (mobile)
      '<button class="mobile-menu-btn" id="mobileMenuBtn" type="button" aria-label="Abrir menu">' +
      '<i class="fas fa-bars"></i>' +
      "</button>" +
      // Logo mobile (aparece apenas em telas pequenas)
      '<a href="' +
      basePath +
      'index.html" class="header-logo-mobile" aria-label="StockLog - Página inicial">' +
      '<img src="' +
      LOGO_SRC +
      '" alt="StockLog" />' +
      'Stock<span>Log</span>' +
      "</a>" +
      // Título da página (desktop)
      '<div class="header-title">' +
      title +
      "</div>" +
      "</div>" +
      '<div class="header-right">' +
      '<div class="header-search" role="search">' +
      '<i class="fas fa-search"></i>' +
      '<input type="search" placeholder="Buscar..." aria-label="Buscar" />' +
      "</div>" +
      '<button class="header-btn" id="themeToggleBtn" aria-label="Alternar tema">' +
      '<i class="fas fa-moon"></i>' +
      "</button>" +
      '<button class="header-btn" aria-label="Notificações">' +
      '<i class="fas fa-bell"></i>' +
      '<span class="badge">3</span>' +
      "</button>" +
      '<a href="' +
      basePath +
      'perfil.html" class="user-profile" aria-label="Perfil">' +
      '<i class="fas fa-user-circle"></i>' +
      "<span>Usuário</span>" +
      "</a>" +
      "</div>" +
      "</header>"
    );
  }

  function mount() {
    var placeholder = document.getElementById("header-root");
    if (!placeholder) {
      console.warn(
        '[header.js] Não encontrei <div id="header-root"></div> na página.'
      );
      return null;
    }

    var wrapper = document.createElement("div");
    wrapper.innerHTML = buildHeaderHTML();
    var headerEl = wrapper.firstElementChild;

    placeholder.replaceWith(headerEl);
    return headerEl;
  }

  function init() {
    var header = mount();
    if (!header) return;

    // Sincroniza o tema com o modo escuro do body
    var themeBtn = document.getElementById("themeToggleBtn");
    if (themeBtn) {
      themeBtn.addEventListener("click", function () {
        document.body.classList.toggle("dark");
        var icon = themeBtn.querySelector("i");
        if (document.body.classList.contains("dark")) {
          icon.className = "fas fa-sun";
        } else {
          icon.className = "fas fa-moon";
        }
      });

      // Define o ícone inicial baseado no tema atual
      var icon = themeBtn.querySelector("i");
      if (document.body.classList.contains("dark")) {
        icon.className = "fas fa-sun";
      } else {
        icon.className = "fas fa-moon";
      }
    }

    // Ações de busca
    var searchInput = header.querySelector('.header-search input');
    if (searchInput) {
      searchInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          var query = this.value.trim();
          if (query) {
            console.log("[StockLog] Busca:", query);
            // Você pode redirecionar para uma página de resultados ou filtrar algo
          }
        }
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();