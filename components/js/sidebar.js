/* ================================================================
   COMPONENTE: SIDEBAR (StockLog)
   Injeta o menu lateral no lugar de <div id="sidebar-root"></div>,
   marca o link da página atual como ativo e controla abrir/fechar
   (tanto no modo desktop — trilho recolhido/expandido — quanto no
   modo mobile — hambúrguer com overlay, abrindo como "gaveta").

   Requer: components/css/sidebar.css
   Uso: <div id="sidebar-root"></div>  +  <script src="components/js/sidebar.js"></script>
   ================================================================ */
(function () {
  "use strict";

  // Itens do menu. Para adicionar/remover/reordenar uma opção,
  // basta editar esta lista — ela é a única fonte de verdade.
  var NAV_ITEMS = [
    { href: "index.html", icon: "fa-chart-pie", label: "Dashboard" },
    { href: "#", icon: "fa-clipboard-list", label: "POPs" },
    { href: "#", icon: "fa-industry", label: "Produção" },
    { href: "#", icon: "fa-warehouse", label: "Estoque" },
    { href: "#", icon: "fa-truck", label: "Logística" },
    { href: "#", icon: "fa-robot", label: "LogBot" },
    { href: "#", icon: "fa-file-alt", label: "Relatórios" },
  ];

  // Caminho da logo usada no lugar do ícone genérico no topo do menu.
  var LOGO_SRC = "IMG/logo.png";

  function currentFile() {
    var path = window.location.pathname.split("/").pop();
    return path === "" ? "index.html" : path;
  }

  function buildNavHTML() {
    var current = currentFile();
    return NAV_ITEMS.map(function (item) {
      var isActive = item.href !== "#" && item.href === current;
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
          "Inserindo o menu no início do <body> como alternativa — confira se o HTML da página tem esse elemento.",
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

    // Mantido global para compatibilidade com onclick="toggleSidebar()"
    // que possa existir em outras partes da página.
    window.toggleSidebar = function () {
      if (sidebar.classList.contains("open")) closeSidebar();
      else openSidebar();
    };

    var toggleBtn = sidebar.querySelector(".sidebar-toggle");
    var openBtn = sidebar.querySelector(".sidebar-open-btn");
    if (toggleBtn) toggleBtn.addEventListener("click", window.toggleSidebar);
    if (openBtn) openBtn.addEventListener("click", window.toggleSidebar);

    // Botão hambúrguer do cabeçalho (mobile) — cada página só
    // precisa ter um elemento com id="mobileMenuBtn".
    var mobileBtn = document.getElementById("mobileMenuBtn");
    if (mobileBtn) {
      mobileBtn.addEventListener("click", window.toggleSidebar);
    } else {
      console.warn(
        '[sidebar.js] Não encontrei o botão com id="mobileMenuBtn" nesta página. ' +
          "O menu hambúrguer do cabeçalho não vai funcionar até esse botão existir no HTML.",
      );
    }

    // Clicar no overlay fecha o menu.
    overlay.addEventListener("click", closeSidebar);

    // Clicar fora do menu (mobile) também fecha.
    document.addEventListener("click", function (e) {
      var isOpen = sidebar.classList.contains("open");
      var isClickInside =
        sidebar.contains(e.target) ||
        (mobileBtn && mobileBtn.contains(e.target));
      if (isOpen && !isClickInside && isMobile()) closeSidebar();
    });

    // Tecla Esc fecha o menu no mobile — melhora a navegação por teclado.
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isMobile() && sidebar.classList.contains("open")) {
        closeSidebar();
      }
    });

    // Fecha o menu (e o overlay/scroll-lock) se a tela crescer
    // para desktop enquanto ele estava aberto no modo mobile.
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