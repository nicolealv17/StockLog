/* ================================================================
   COMPONENTE: MODO ESCURO (StockLog)
   Alterna entre tema claro/escuro adicionando/removendo a classe
   "dark" no <body>. Usa o botão #themeToggleBtn do header.
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
      /* localStorage indisponível */
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
      theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"
    );
    var icon = btn.querySelector("i");
    if (icon) {
      icon.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon";
    }
  }

  function init() {
    // Procura o botão criado pelo header.js
    var btn = document.getElementById("themeToggleBtn");

    // Se não encontrar, NÃO cria botão flutuante (usa o do header)
    // Isso evita duplicação

    var theme = getInitialTheme();
    applyTheme(theme, btn);

    if (btn) {
      btn.addEventListener("click", function () {
        theme = document.body.classList.contains("dark") ? "light" : "dark";
        applyTheme(theme, btn);
        saveTheme(theme);
      });
    } else {
      console.warn("⚠️ Botão de tema (#themeToggleBtn) não encontrado no header.");
    }

    // Acompanha preferência do sistema (se o usuário nunca escolheu manualmente)
    if (window.matchMedia) {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", function (e) {
          if (getSavedTheme()) return; // já escolheu manualmente
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