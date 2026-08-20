/* ================================================================
   COMPONENTE: SIDEBAR (StockLog)
   Injeta o menu lateral no lugar de <div id="sidebar-root"></div>,
   marca o link da página atual como ativo e controla abrir/fechar.
   ================================================================ */
(function () {
  "use strict";

  // 1. Detecta se a página atual está dentro da pasta /pages/
  var inPagesFolder = window.location.pathname.includes("/pages/");
  var basePath = inPagesFolder ? "../" : "./";

  // 2. Caminho dinâmico da imagem da logo (funciona tanto na raiz quanto em /pages/)
  var LOGO_SRC = basePath + "IMG/logoo.png";

  // 3. Itens do menu — todas as páginas ficam na RAIZ do projeto (junto
  //    com index.html), então usam o mesmo basePath dele.
  var NAV_ITEMS = [
    { href: basePath + "index.html", icon: "fa-chart-pie", label: "Dashboard" },
    { href: basePath + "pedidos.html", icon: "fa-clipboard-list", label: "Pedidos de Produção" },
    { href: basePath + "kanban.html", icon: "fa-columns", label: "Kanban" },
    { href: basePath + "producao.html", icon: "fa-industry", label: "Controle de Produção" },
    { href: basePath + "itens.html", icon: "fa-warehouse", label: "Itens em Estoque" },
    { href: basePath + "logistica.html", icon: "fa-truck", label: "Logística" },
    { href: basePath + "relatorios.html", icon: "fa-file-download", label: "Baixar Relatórios" },
    { href: basePath + "fornecedores.html", icon: "fa-handshake", label: "Fornecedores" },
    { href: basePath + "rastreamento.html", icon: "fa-route", label: "Rastreamento" },
    { href: basePath + "calendario.html", icon: "fa-calendar-alt", label: "Calendário" },
  ];

  // Identifica o nome do arquivo da página atual para marcar o menu como ativo
  function isCurrentPage(href) {
    if (href === "#") return false;
    var currentFile = window.location.pathname.split("/").pop() || "index.html";
    var targetFile = href.split("/").pop();
    return currentFile === targetFile;
  }

  function buildNavHTML() {
    return NAV_ITEMS.map(function (item) {
      var isActive = isCurrentPage(item.href);
      return (
        '<a href="' +
        item.href +
        '"' +
        (isActive ? ' class="active" aria-current="page"' : "") +
        ">" +
        '<i class="fas ' +
        item.icon +
        '"></i><span>' +
        item.label +
        "</span>" +
        "</a>"
      );
    }).join("");
  }

  function buildSidebarHTML() {
    return (
      '<aside class="sidebar" id="sidebar" role="navigation" aria-label="Menu principal">' +
      '<div class="sidebar-logo">' +
      '<img class="logo-icon" src="' +
      LOGO_SRC +
      '" alt="StockLog" />' +
      '<div class="logo-text">Stock<span>Log</span></div>' +
      '<button class="sidebar-toggle" type="button" aria-label="Recolher menu"><i class="fas fa-chevron-left"></i></button>' +
      "</div>" +
      '<button class="sidebar-open-btn" type="button" aria-label="Expandir menu"><i class="fas fa-bars"></i></button>' +
      "<nav>" +
      buildNavHTML() +
      "</nav>" +
      '<div class="sidebar-user">' +
      '<i class="fas fa-user-circle"></i><span></span>' +
      "</div>" +
      "</aside>"
    );
  }

  function mount() {
    var placeholder = document.getElementById("sidebar-root");
    var wrapper = document.createElement("div");
    wrapper.innerHTML = buildSidebarHTML();
    var asideEl = wrapper.firstElementChild;

    if (placeholder) {
      placeholder.replaceWith(asideEl);
    } else {
      console.warn(
        '[sidebar.js] Não encontrei <div id="sidebar-root"></div> na página. ' +
          "Inserindo o menu no início do <body> como alternativa."
      );
      document.body.insertBefore(asideEl, document.body.firstChild);
    }

    var overlay = document.createElement("div");
    overlay.className = "sidebar-overlay";
    overlay.id = "sidebarOverlay";
    asideEl.insertAdjacentElement("afterend", overlay);

    return { sidebar: asideEl, overlay: overlay };
  }

  function init() {
    var refs = mount();
    var sidebar = refs.sidebar;
    var overlay = refs.overlay;

    function isMobile() {
      return window.innerWidth <= 768;
    }

    function openSidebar() {
      sidebar.classList.add("open");
      overlay.classList.add("visible");
      if (isMobile()) document.body.style.overflow = "hidden";
    }

    function closeSidebar() {
      sidebar.classList.remove("open");
      overlay.classList.remove("visible");
      document.body.style.overflow = "";
    }

    window.toggleSidebar = function () {
      if (sidebar.classList.contains("open")) closeSidebar();
      else openSidebar();
    };

    var toggleBtn = sidebar.querySelector(".sidebar-toggle");
    var openBtn = sidebar.querySelector(".sidebar-open-btn");
    if (toggleBtn) toggleBtn.addEventListener("click", window.toggleSidebar);
    if (openBtn) openBtn.addEventListener("click", window.toggleSidebar);

    var mobileBtn = document.getElementById("mobileMenuBtn");
    if (mobileBtn) {
      mobileBtn.addEventListener("click", window.toggleSidebar);
    }

    overlay.addEventListener("click", closeSidebar);

    document.addEventListener("click", function (e) {
      var isOpen = sidebar.classList.contains("open");
      var isClickInside =
        sidebar.contains(e.target) ||
        (mobileBtn && mobileBtn.contains(e.target));
      if (isOpen && !isClickInside && isMobile()) closeSidebar();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isMobile() && sidebar.classList.contains("open")) {
        closeSidebar();
      }
    });

    window.addEventListener("resize", function () {
      if (!isMobile()) closeSidebar();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();