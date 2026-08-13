/**
 * SIDEBAR FUNCTIONS — StockLog
 */

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const hamburger = document.getElementById('sidebarHamburger');

  if (!sidebar) return;

  sidebar.classList.toggle('open');

  if (overlay) {
    overlay.classList.toggle('active');
  }

  if (hamburger) {
    hamburger.classList.toggle('active');
  }
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const hamburger = document.getElementById('sidebarHamburger');

  if (window.innerWidth <= 768) {
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    if (hamburger) hamburger.classList.remove('active');
  }
}

function toggleTheme() {
  const isDark = document.body.classList.toggle('dark');
  const icon = document.getElementById('themeIcon');
  if (icon) {
    icon.className = isDark ? 'fas fa-moon' : 'fas fa-sun';
  }
  localStorage.setItem('stocklog-theme', isDark ? 'dark' : 'light');
}

function initTheme() {
  const savedTheme = localStorage.getItem('stocklog-theme');
  const icon = document.getElementById('themeIcon');

  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
    if (icon) icon.className = 'fas fa-moon';
  } else {
    document.body.classList.remove('dark');
    if (icon) icon.className = 'fas fa-sun';
  }
}

function initSidebar() {
  const hamburger = document.getElementById('sidebarHamburger');

  if (window.innerWidth > 768) {
    if (hamburger) hamburger.style.display = 'none';
  } else {
    if (hamburger) hamburger.style.display = 'flex';
  }
}

// Fechar sidebar ao redimensionar para desktop
window.addEventListener('resize', function() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const hamburger = document.getElementById('sidebarHamburger');

  if (window.innerWidth > 768) {
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    if (hamburger) {
      hamburger.style.display = 'none';
      hamburger.classList.remove('active');
    }
  } else {
    if (hamburger) {
      hamburger.style.display = 'flex';
    }
  }
});

// Fechar sidebar com ESC
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeSidebar();
  }
});

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
  initTheme();
  initSidebar();
});