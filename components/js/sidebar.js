/* ================================================================
   COMPONENTE: SIDEBAR (StockLog)
   Injeta o menu lateral no lugar de <div id="sidebar-root"></div>,
   marca o link da página atual como ativo e controla abrir/fechar.
   ================================================================ */
(function () {
  "use strict";

  var inPagesFolder = window.location.pathname.includes("/pages/");
  var basePath = inPagesFolder ? "../" : "./";
  var LOGO_SRC = basePath + "IMG/logoo.png";

  // Itens agrupados por seção — cada grupo vira um bloco com rótulo no menu.
  var NAV_GROUPS = [
    {
      label: "Visão Geral",
      items: [
        { href: basePath + "index.html", icon: "fa-chart-pie", label: "Dashboard" },
        { href: basePath + "calendario.html", icon: "fa-calendar-alt", label: "Calendário" },
      ],
    },
    {
      label: "Operações & PCP",
      items: [
        { href: basePath + "pedidos.html", icon: "fa-clipboard-list", label: "Pedidos de Produção" },
        { href: basePath + "producao.html", icon: "fa-industry", label: "Controle de Produção" },
        { href: basePath + "kanban.html", icon: "fa-columns", label: "Kanban" },
        { href: basePath + "itens.html", icon: "fa-warehouse", label: "Itens em Estoque" },
      ],
    },
    {
      label: "Logística & Cadeia",
      items: [
        { href: basePath + "logistica.html", icon: "fa-truck", label: "Logística" },
        { href: basePath + "rastreamento.html", icon: "fa-route", label: "Rastreamento" },
        { href: basePath + "fornecedores.html", icon: "fa-handshake", label: "Fornecedores" },
      ],
    },
    {
      label: "Sistema & Análise",
      items: [
        { href: basePath + "relatorios.html", icon: "fa-chart-bar", label: "Relatórios" },
        { href: basePath + "cadastro.html", icon: "fa-address-card", label: "Cadastro" },
      ],
    },
  ];

  function isCurrentPage(href) {
    if (href === "#") return false;
    var currentFile = window.location.pathname.split("/").pop() || "index.html";
    var targetFile = href.split("/").pop();
    return currentFile === targetFile;
  }

  function buildNavHTML() {
    return NAV_GROUPS.map(function (group) {
      var itemsHTML = group.items
        .map(function (item) {
          var isActive = isCurrentPage(item.href);
          return (
            '<a href="' + item.href + '"' + (isActive ? ' class="active" aria-current="page"' : "") + ">" +
            '<i class="fas ' + item.icon + '"></i><span>' + item.label + "</span>" +
            "</a>"
          );
        })
        .join("");
      return (
        '<div class="sidebar-section">' +
        '<div class="sidebar-section-label">' + group.label + "</div>" +
        itemsHTML +
        "</div>"
      );
    }).join("");
  }

  function buildSidebarHTML() {
    return (
      '<aside class="sidebar" id="sidebar" role="navigation" aria-label="Menu principal">' +
      '<div class="sidebar-logo">' +
      '<img class="logo-icon" src="' + LOGO_SRC + '" alt="StockLog" />' +
      '<div class="logo-text">Stock<span>Log</span></div>' +
      '<button class="sidebar-toggle" type="button" aria-label="Recolher menu"><i class="fas fa-chevron-left"></i></button>' +
      "</div>" +
      '<button class="sidebar-open-btn" type="button" aria-label="Expandir menu"><i class="fas fa-bars"></i></button>' +
      "<nav>" + buildNavHTML() + "</nav>" +
      "</div>" +
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
      console.warn('[sidebar.js] Não encontrei <div id="sidebar-root"></div> na página. Inserindo o menu no início do <body> como alternativa.');
      document.body.insertBefore(asideEl, document.body.firstChild);
    }

    var overlay = document.createElement("div");
    overlay.className = "sidebar-overlay";
    overlay.id = "sidebarOverlay";
    asideEl.insertAdjacentElement("afterend", overlay);

    return { sidebar: asideEl, overlay: overlay };
  }

  var STORAGE_KEY = "stocklog_sidebar_open";

  function init() {
    var refs = mount();
    var sidebar = refs.sidebar;
    var overlay = refs.overlay;

    // matchMedia em vez de checar innerWidth a cada 'resize': o listener só
    // dispara quando o breakpoint realmente é cruzado. Isso corrige o bug de
    // o menu abrir/fechar sozinho e travar no mobile — antes, o evento
    // 'resize' disparava a cada pequena mudança de viewport (ex.: a barra de
    // endereço do navegador aparecendo/sumindo durante o scroll), o que
    // chamava closeSidebar() repetidamente e deixava a animação "presa".
    var mobileMQ = window.matchMedia("(max-width: 768px)");
    function isMobile() { return mobileMQ.matches; }

    var savedOpen = false;
    try { savedOpen = localStorage.getItem(STORAGE_KEY) === "1"; } catch (e) { /* sem storage disponível */ }
    if (savedOpen && !isMobile()) sidebar.classList.add("open");

    function persistState(isOpen) {
      try { localStorage.setItem(STORAGE_KEY, isOpen ? "1" : "0"); } catch (e) { /* sem storage disponível */ }
    }

    function openSidebar() {
      sidebar.classList.add("open");
      overlay.classList.add("visible");
      if (isMobile()) document.body.style.overflow = "hidden";
      persistState(true);
    }

    function closeSidebar() {
      sidebar.classList.remove("open");
      overlay.classList.remove("visible");
      document.body.style.overflow = "";
      persistState(false);
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
    if (mobileBtn) mobileBtn.addEventListener("click", window.toggleSidebar);

    overlay.addEventListener("click", closeSidebar);

    document.addEventListener("click", function (e) {
      var isOpen = sidebar.classList.contains("open");
      var isClickInside = sidebar.contains(e.target) || (mobileBtn && mobileBtn.contains(e.target));
      if (isOpen && !isClickInside && isMobile()) closeSidebar();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isMobile() && sidebar.classList.contains("open")) closeSidebar();
    });

    // Só reage quando o breakpoint muda de fato (desktop <-> mobile),
    // nunca a cada pixel de resize.
    function handleBreakpointChange() {
      if (isMobile()) {
        closeSidebar();
      } else {
        overlay.classList.remove("visible");
        document.body.style.overflow = "";
        var shouldBeOpen = false;
        try { shouldBeOpen = localStorage.getItem(STORAGE_KEY) === "1"; } catch (e) {}
        sidebar.classList.toggle("open", shouldBeOpen);
      }
    }
    if (mobileMQ.addEventListener) {
      mobileMQ.addEventListener("change", handleBreakpointChange);
    } else if (mobileMQ.addListener) {
      // Safari antigo
      mobileMQ.addListener(handleBreakpointChange);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();