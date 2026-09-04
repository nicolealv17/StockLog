function toggleTheme() {
  document.body.classList.toggle("dark");
  const themeIcon = document.getElementById("themeIcon");
  if (themeIcon) {
    themeIcon.className = document.body.classList.contains("dark")
      ? "fas fa-sun"
      : "fas fa-moon";
  }
}

function atualizar() {
  alert("Dados atualizados com sucesso!");
}