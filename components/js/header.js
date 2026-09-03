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

  // ============================================
  // FUNÇÕES PARA GERENCIAR A FOTO DE PERFIL
  // ============================================
  function getProfilePhoto() {
    try {
      return localStorage.getItem('stocklog_profile_photo') || null;
    } catch (e) {
      return null;
    }
  }

  function getProfileName() {
    try {
      var name = localStorage.getItem('stocklog_profile_name');
      if (name && name.trim() !== '') {
        return name;
      }
      return 'Usuário';
    } catch (e) {
      return 'Usuário';
    }
  }

  function getProfilePhotoHTML() {
    var photo = getProfilePhoto();
    if (photo) {
      return '<img src="' + photo + '" alt="Avatar" class="header-avatar-img" />';
    }
    return '<i class="fas fa-user-circle"></i>';
  }

  // Dados iniciais das notificações
  var headerNotifications = [
    { id: 1, type: "atraso", title: "Pedido #PED-8942 atrasado", desc: "Atraso de 2 dias na entrega de Chapa Inox 304.", time: "Há 15 min", read: false },
    { id: 2, type: "maquina", title: "Linha 03 - Torno CNC Parado", desc: "Falha de pressão hidráulica detectada.", time: "Há 42 min", read: false },
    { id: 3, type: "estoque", title: "Estoque Baixo: Rolamento 6204", desc: "Apenas 12 unidades restantes.", time: "Há 1 hora", read: false },
    { id: 4, type: "entrega", title: "Carga agendada: Doca 02", desc: "Recebimento previsto para às 14:30.", time: "Há 2 horas", read: true }
  ];

  // Prepare profile values used in template
  var profilePhotoHTML = getProfilePhotoHTML();
  var profileName = getProfileName();

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
      "perfil.html": "Minha Conta"
    };
    var currentFile = window.location.pathname.split("/").pop() || "index.html";
    return titles[currentFile] || "StockLog";
  }

  function buildHeaderHTML() {
    var title = getPageTitle();
    var profileName = getProfileName();
    var profilePhotoHTML = getProfilePhotoHTML();
    
    return (
      '<header class="header" role="banner">' +
        '<div class="header-left">' +
          // Botão hambúrguer (mobile)
          '<button class="mobile-menu-btn" id="mobileMenuBtn" type="button" aria-label="Abrir menu">' +
            '<i class="fas fa-bars"></i>' +
          '</button>' +
          // Logo mobile (aparece apenas em telas pequenas)
          '<a href="' + basePath + 'index.html" class="header-logo-mobile" aria-label="StockLog - Página inicial">' +
            '<img src="' + LOGO_SRC + '" alt="StockLog" />' +
            'Stock<span>Log</span>' +
          '</a>' +
          // Título da página (desktop)
          '<div class="header-title">' + title + '</div>' +
        '</div>' +
        '<div class="header-right">' +
          '<div class="header-search" role="search">' +
            '<i class="fas fa-search"></i>' +
            '<input type="search" placeholder="Buscar..." aria-label="Buscar" />' +
          '</div>' +
          '<button class="header-btn" id="themeToggleBtn" aria-label="Alternar tema">' +
            '<i class="fas fa-moon"></i>' +
          '</button>' +
          // Componente Dropdown de Notificações
          '<div class="notif-wrapper">' +
            '<button class="header-btn" id="notifToggleBtn" type="button" aria-label="Notificações" style="position:relative;">' +
              '<i class="fas fa-bell"></i>' +
              '<span class="notif-badge" id="headerNotifBadge">0</span>' +
            '</button>' +
            '<div class="notif-dropdown" id="notifDropdown">' +
              '<div class="notif-dropdown-header">' +
                '<h4>Notificações</h4>' +
                '<button class="notif-btn-clear" id="notifClearAllBtn" type="button">Marcar todas como lidas</button>' +
              '</div>' +
              '<div class="notif-dropdown-body" id="headerNotifFeed"></div>' +
            '</div>' +
          '</div>' +
          '<a href="' + basePath + 'perfil.html" class="user-profile" aria-label="Perfil">' +
            '<span class="user-avatar-wrapper">' + profilePhotoHTML + '</span>' +
            '<span class="user-profile-name">' + profileName + '</span>' +
          '</a>' +
        '</div>' +
      '</header>'
    );
  }

  function renderHeaderNotifs() {
    var feed = document.getElementById("headerNotifFeed");
    var badge = document.getElementById("headerNotifBadge");
    if (!feed || !badge) return;

    var unreadCount = headerNotifications.filter(function (n) { return !n.read; }).length;
    badge.innerText = unreadCount;
    badge.style.display = unreadCount > 0 ? "inline-block" : "none";

    if (headerNotifications.length === 0) {
      feed.innerHTML = '<div style="text-align:center; padding: 20px; font-size:12px; color:var(--text-muted);">Sem notificações.</div>';
      return;
    }

    feed.innerHTML = headerNotifications.map(function (n) {
      var readBtnHTML = !n.read 
        ? '<button class="notif-read-btn" data-id="' + n.id + '" title="Marcar como lida" type="button" style="background:transparent; border:none; color:var(--primary); cursor:pointer; font-size:11px; padding:2px 4px;">' +
            '<i class="fas fa-check"></i>' +
          '</button>' 
        : '';

      return (
        '<div class="notif-item-sm type-' + n.type + ' ' + (!n.read ? 'unread' : '') + '">' +
          '<div class="notif-info-sm" data-id="' + n.id + '" style="cursor:pointer;" title="Clique para marcar como lida">' +
            '<div class="notif-title-sm">' + n.title + '</div>' +
            '<div class="notif-desc-sm">' + n.desc + '</div>' +
            '<div class="notif-time-sm"><i class="far fa-clock"></i> ' + n.time + '</div>' +
          '</div>' +
          '<div style="display:flex; align-items:center; gap:2px;">' +
            readBtnHTML +
            '<button class="notif-del-btn" data-id="' + n.id + '" title="Remover" type="button">' +
              '<i class="fas fa-times"></i>' +
            '</button>' +
          '</div>' +
        '</div>'
      );
    }).join("");
  }

  // Marcar UMA notificação como lida
  function markHeaderNotifRead(id) {
    headerNotifications.forEach(function (n) {
      if (n.id === id) {
        n.read = true;
      }
    });
    renderHeaderNotifs();
  }

  // Marcar TODAS as notificações como lidas
  function markAllHeaderNotifsRead() {
    headerNotifications.forEach(function (n) {
      n.read = true;
    });
    renderHeaderNotifs();
  }

  // Remover notificação da lista
  function removeHeaderNotif(id) {
    headerNotifications = headerNotifications.filter(function (n) { return n.id !== id; });
    renderHeaderNotifs();
  }

  function mount() {
    var placeholder = document.getElementById("header-root");
    if (!placeholder) {
      console.warn('[header.js] Não encontrei <div id="header-root"></div> na página.');
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

    // Elementos do Dropdown de Notificações
    var notifToggleBtn = header.querySelector("#notifToggleBtn");
    var notifDropdown = header.querySelector("#notifDropdown");
    var clearAllBtn = header.querySelector("#notifClearAllBtn");
    var feed = header.querySelector("#headerNotifFeed");

    if (notifToggleBtn && notifDropdown) {
      // Toggle abrir/fechar menu suspenso
      notifToggleBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        notifDropdown.classList.toggle("active");
      });

      // Fechar ao clicar em qualquer área externa
      document.addEventListener("click", function () {
        notifDropdown.classList.remove("active");
      });

      // Evitar que o clique interno no painel feche o menu
      notifDropdown.addEventListener("click", function (e) {
        e.stopPropagation();
      });
    }

    // Ação: Marcar TODAS como lidas
    if (clearAllBtn) {
      clearAllBtn.addEventListener("click", function () {
        markAllHeaderNotifsRead();
      });
    }

    // Ação: Delegação de eventos para o feed (Marcar 1 como lida ou Remover)
    if (feed) {
      feed.addEventListener("click", function (e) {
        var readBtn = e.target.closest(".notif-read-btn");
        var delBtn = e.target.closest(".notif-del-btn");
        var infoArea = e.target.closest(".notif-info-sm");

        if (readBtn) {
          var idRead = parseInt(readBtn.getAttribute("data-id"), 10);
          markHeaderNotifRead(idRead);
        } else if (delBtn) {
          var idDel = parseInt(delBtn.getAttribute("data-id"), 10);
          removeHeaderNotif(idDel);
        } else if (infoArea) {
          var idInfo = parseInt(infoArea.getAttribute("data-id"), 10);
          markHeaderNotifRead(idInfo);
        }
      });
    }

    // Renderiza a lista inicial
    renderHeaderNotifs();
    // Ações de busca
    var searchInput = header.querySelector('.header-search input');
    if (searchInput) {
 // ========== BUSCA FUNCIONAL ==========
function performSearch(query) {
  if (!query) {
    // Se a busca estiver vazia, mostra todos os itens novamente
    showAllItems();
    return;
  }

  // 1. Obtém o seletor de itens a partir do atributo data-search-items no body
  var itemsSelector = document.body.getAttribute('data-search-items');
  if (!itemsSelector) {
    // 2. Tentativa automática: detectar tabelas ou cards
    if (document.querySelector('table tbody')) {
      itemsSelector = 'table tbody tr';
    } else if (document.querySelector('.card')) {
      itemsSelector = '.card';
    } else if (document.querySelector('.item')) {
      itemsSelector = '.item';
    } else {
      // Fallback: busca em qualquer elemento que tenha texto e seja filho de main ou section
      itemsSelector = 'main > *, section > *';
    }
  }

  var items = document.querySelectorAll(itemsSelector);
  var found = 0;

  items.forEach(function (item) {
    var text = item.textContent || item.innerText || '';
    var matches = text.toLowerCase().includes(query.toLowerCase());
    if (matches) {
      item.style.display = ''; // mostra
      found++;
    } else {
      item.style.display = 'none'; // esconde
    }
  });

  // 3. Exibe mensagem se nenhum resultado
  var msgContainer = document.getElementById('search-feedback');
  if (!msgContainer) {
    msgContainer = document.createElement('div');
    msgContainer.id = 'search-feedback';
    msgContainer.style.cssText = 'padding:10px; text-align:center; color:var(--text-muted); font-size:14px; margin-top:10px;';
    var mainContent = document.querySelector('main') || document.body;
    mainContent.prepend(msgContainer);
  }

  if (found === 0) {
    msgContainer.textContent = 'Nenhum resultado encontrado para "' + query + '"';
    msgContainer.style.display = 'block';
  } else {
    msgContainer.textContent = '';
    msgContainer.style.display = 'none';
  }
}

function showAllItems() {
  var itemsSelector = document.body.getAttribute('data-search-items');
  if (!itemsSelector) {
    if (document.querySelector('table tbody')) itemsSelector = 'table tbody tr';
    else if (document.querySelector('.card')) itemsSelector = '.card';
    else if (document.querySelector('.item')) itemsSelector = '.item';
    else itemsSelector = 'main > *, section > *';
  }
  document.querySelectorAll(itemsSelector).forEach(function (el) {
    el.style.display = '';
  });
  var msg = document.getElementById('search-feedback');
  if (msg) msg.style.display = 'none';
}

// Agora, no evento keydown:
searchInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    var query = this.value.trim();
    performSearch(query);
  }
});

// Opcional: adicionar um botão "limpar" ao lado da busca
var searchWrapper = searchInput.closest('.header-search');
if (searchWrapper) {
  var clearBtn = document.createElement('button');
  clearBtn.type = 'button';
  clearBtn.innerHTML = '<i class="fas fa-times-circle"></i>';
  clearBtn.style.cssText = 'background:transparent; border:none; color:var(--text-muted); cursor:pointer; padding:0 4px; font-size:14px;';
  clearBtn.setAttribute('aria-label', 'Limpar busca');
  clearBtn.addEventListener('click', function () {
    searchInput.value = '';
    performSearch('');
    searchInput.focus();
  });
  searchWrapper.appendChild(clearBtn);
}
    }

    // Atualiza o header quando o perfil for atualizado
    window.addEventListener('profileUpdated', function() {
      var oldHeader = document.querySelector('.header');
      if (oldHeader) {
        var placeholder = document.createElement('div');
        placeholder.id = 'header-root';
        oldHeader.replaceWith(placeholder);
        mount();
        // Reaplica os listeners
        var newHeader = document.querySelector('.header');
        if (newHeader) {
          var newSearchInput = newHeader.querySelector('.header-search input');
          if (newSearchInput) {
            newSearchInput.addEventListener("keydown", function (e) {
              if (e.key === "Enter") {
                e.preventDefault();
                var query = this.value.trim();
                if (query) {
                  console.log("[StockLog] Busca:", query);
                }
              }
            });
          }
        }
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();