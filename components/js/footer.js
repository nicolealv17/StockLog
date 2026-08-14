/* ================================================================
   FOOTER COMPONENT - StockLog
   Injeta o rodapé na div #footer-root.
   Depende de: components/css/footer.css
   ================================================================ */

(function () {
  const footerRoot = document.getElementById("footer-root");
  if (!footerRoot) return;

  footerRoot.innerHTML = `
    <footer class="footer" role="contentinfo">
      <div class="footer-left">
        <span><i class="fas fa-cube"></i>StockLog · v2.4 </span>
      </div>
      <div class="footer-right">
        <span
          style="
            background: var(--bg-soft);
            padding: 4px 14px;
            border-radius: 20px;
            font-weight: 500;
            font-size: 12px;
            border: 1px solid var(--border);
          "
        >
        </span>
<button
  class="logout-link"
  onclick="window.location.href = 'pages/login.html'"
>
  <i class="fas fa-sign-out-alt"></i> Sair do sistema
</button>
      </div>
    </footer>
  `;
})();