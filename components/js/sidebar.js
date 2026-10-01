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
        { href: basePath + "index.html", icon: "fa-chart-pie", label: "Dashboard", roles: ["Gestão", "Produção", "Logística", "Estoque"] },
        { href: basePath + "calendario.html", icon: "fa-calendar-alt", label: "Calendário", roles: ["Gestão", "Produção", "Logística", "Estoque"] },
      ],
    },
    {
      label: "Operações & PCP",
      items: [
        { href: basePath + "pedidos.html", icon: "fa-clipboard-list", label: "Pedidos de Produção", roles: ["Gestão", "Produção"] },
        { href: basePath + "producao.html", icon: "fa-industry", label: "Controle de Produção", roles: ["Gestão", "Produção"] },
        { href: basePath + "ajuda_producao.html", icon: "fa-book-open", label: "Ajuda de Produção", roles: ["Gestão", "Produção"] },
        { href: basePath + "kanban.html", icon: "fa-columns", label: "Kanban", roles: ["Gestão", "Produção", "Estoque"] },
        { href: basePath + "qr.html", icon: "fa-qrcode", label: "QR Code", roles: ["Gestão", "Produção", "Estoque"] },
        { href: basePath + "itens.html", icon: "fa-warehouse", label: "Itens em Estoque", roles: ["Gestão", "Produção", "Estoque"] },
      ],
    },
    {
      label: "Logística & Cadeia",
      items: [
        { href: basePath + "logistica.html", icon: "fa-truck", label: "Logística", roles: ["Gestão", "Logística"] },
        { href: basePath + "rastreamento.html", icon: "fa-route", label: "Rastreamento", roles: ["Gestão", "Logística"] },
        { href: basePath + "fornecedores.html", icon: "fa-handshake", label: "Fornecedores", roles: ["Gestão", "Logística"] },
      ],
    },
    {
      label: "Sistema & Análise",
      items: [
        { href: basePath + "relatorios.html", icon: "fa-chart-bar", label: "Relatórios", roles: ["Gestão", "Produção", "Logística", "Estoque"] },
        { href: basePath + "cadastro.html", icon: "fa-address-card", label: "Cadastro", roles: ["Gestão"] },
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
    // Obtém a área do usuário do sessionStorage
    var userSession = JSON.parse(localStorage.getItem('usuarioLogado') || sessionStorage.getItem('usuarioLogado') || '{}');
    var userRole = userSession.area || 'Visitante';

    return NAV_GROUPS.map(function (group) {
      var filteredItems = group.items.filter(function(item) {
        return item.roles.indexOf(userRole) !== -1;
      });

      if (filteredItems.length === 0) return ""; // Não renderiza a seção se não houver itens permitidos

      var itemsHTML = filteredItems
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
      mobileMQ.addListener(handleBreakpointChange);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();