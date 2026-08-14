/* ================================================================
   COMPONENTE: MODO ESCURO (StockLog)
   Alterna entre tema claro/escuro adicionando/removendo a classe
   "dark" no <body>. As variáveis de cor de cada tema já existem
   no <style> do index.html (:root e body.dark).

   Como usar
   ---------
   1) Inclua o CSS no <head>, junto dos outros componentes:
        <link rel="stylesheet" href="components/css/modoescuro.css" />

   2) Inclua este script no fim do <body>, depois de sidebar.js:
        <script src="components/js/modoescuro.js"></script>

   3) Por padrão o componente cria um botão flutuante (canto
      inferior direito) para alternar o tema. Se preferir o botão
      dentro do header, basta criar, dentro do components/js/header.js,
      um elemento:
        <button id="themeToggleBtn"></button>
      O modoescuro.js detecta esse elemento automaticamente e passa
      a usá-lo no lugar do botão flutuante (não cria os dois).

   4) A escolha do usuário fica salva em localStorage e é reaplicada
      nas próximas visitas. Enquanto ele não escolher manualmente,
      o tema segue a preferência do sistema operacional
      (prefers-color-scheme) e acompanha mudanças em tempo real.
   ================================================================ */
(function () {
  "use strict";

  var STORAGE_KEY = "stocklog-theme";

  function getSavedTheme() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      return v === "dark" || v === "light" ? v : null;
    } catch (e) {
      return null;
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      /* localStorage indisponível (ex.: navegação privada) — segue sem salvar */
    }
  }

  function systemPrefersDark() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  }

  function getInitialTheme() {
    return getSavedTheme() || (systemPrefersDark() ? "dark" : "light");
  }

  function applyTheme(theme, btn) {
    document.body.classList.toggle("dark", theme === "dark");
    if (!btn) return;
    btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    btn.setAttribute(
      "aria-label",
      theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro",
    );
    var icon = btn.querySelector("i");
    if (icon) {
      icon.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon";
    }
  }

  function createFloatingButton() {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.id = "themeToggleBtn";
    btn.className = "theme-toggle-btn theme-toggle-floating";
    btn.title = "Alternar tema";
    btn.innerHTML = '<i class="fas fa-moon"></i>';
    document.body.appendChild(btn);
    return btn;
  }

  function init() {
    var btn = document.getElementById("themeToggleBtn");
    if (btn) {
      // Botão já existe na página (ex.: dentro do header) — só garante a marcação.
      btn.classList.add("theme-toggle-btn");
      if (!btn.querySelector("i")) {
        btn.innerHTML = '<i class="fas fa-moon"></i>';
      }
    } else {
      btn = createFloatingButton();
    }

    var theme = getInitialTheme();
    applyTheme(theme, btn);

    btn.addEventListener("click", function () {
      theme = document.body.classList.contains("dark") ? "light" : "dark";
      applyTheme(theme, btn);
      saveTheme(theme);
    });

    // Enquanto o usuário não escolher manualmente, acompanha o SO em tempo real.
    if (window.matchMedia) {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", function (e) {
          if (getSavedTheme()) return; // já escolheu manualmente, não sobrescreve
          applyTheme(e.matches ? "dark" : "light", btn);
        });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();