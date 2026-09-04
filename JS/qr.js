let html5QrCode = null;
let isScanning = false;

// Dicionário que liga o código digitado/lido à página correta
const produtosMap = {
  "MP-1042": "produto1.html",
  "MP-1043": "produto2.html",
  "DS-7012": "produto3.html",
  "QT-3050": "produto4.html"
};

function setStatus(message, type) {
  const el = document.getElementById("scanStatus");
  el.className = "scan-status show " + type;
  el.innerHTML = message;
}

function clearStatus() {
  const el = document.getElementById("scanStatus");
  el.className = "scan-status";
  el.innerHTML = "";
}

// Função que identifica qual produto foi lido
function goToCode(codigo) {
  if (!codigo) return;
  const clean = codigo.trim().toUpperCase(); // Deixa tudo maiúsculo para não dar erro de digitação

  // 1. Verifica se é o link do QR Code (ex: .../produto4.html)
  if (clean.includes("PRODUTO1")) { window.location.href = "produto1.html"; return; }
  else if (clean.includes("PRODUTO2")) { window.location.href = "produto2.html"; return; }
  else if (clean.includes("PRODUTO3")) { window.location.href = "produto3.html"; return; }
  else if (clean.includes("PRODUTO4")) { window.location.href = "produto4.html"; return; }

  // 2. Verifica se o código digitado existe no nosso "dicionário"
  if (produtosMap[clean]) {
    window.location.href = produtosMap[clean];
  } 
  // 3. Se não existe, mostra o erro
  else {
    showErrorModal(clean);
  }
}

// Função que mostra o modal de erro (chamada quando o código não é encontrado)
function showErrorModal(codigoErrado) {
  const modal = document.getElementById("errorModal");
  const codigoSpan = document.getElementById("errorCodigo");
  
  if (codigoSpan) {
    codigoSpan.innerText = codigoErrado;
  }
  
  if (modal) {
    modal.style.display = "flex";
  } else {
    // Caso o modal não exista no HTML, usa um alerta simples
    alert(`O código "${codigoErrado}" não está cadastrado no sistema!`);
  }
}

// Função para fechar o modal (chamada no botão "Entendi")
function closeErrorModal() {
  const modal = document.getElementById("errorModal");
  if (modal) modal.style.display = "none";
}

function goToManualCode() {
  const input = document.getElementById("manualCode");
  if (input.value.trim()) goToCode(input.value);
}

document
  .getElementById("manualCode")
  .addEventListener("keyup", function (e) {
    if (e.key === "Enter") goToManualCode();
  });

async function startScanner() {
  clearStatus();

  const isSecure =
    window.location.protocol === "https:" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  if (!isSecure) {
    setStatus(
      '<i class="fas fa-triangle-exclamation"></i> A câmera só funciona em HTTPS ou localhost.',
      "error",
    );
    return;
  }

  if (typeof Html5Qrcode === "undefined") {
    setStatus(
      '<i class="fas fa-triangle-exclamation"></i> Biblioteca não carregada.',
      "error",
    );
    return;
  }

  document.getElementById("scanPlaceholder").style.display = "none";
  document.getElementById("reader").classList.add("active");
  document.getElementById("startBtn").style.display = "none";
  document.getElementById("stopBtn").style.display = "flex";

  html5QrCode = new Html5Qrcode("reader");

  try {
    await html5QrCode.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 300, height: 300 }, aspectRatio: 1.0 },
      onScanSuccess,
      onScanFailure,
    );
    isScanning = true;
  } catch (err) {
    console.error(err);
    resetScannerUI();
    if (
      String(err).toLowerCase().includes("permission") ||
      String(err).toLowerCase().includes("notallowed")
    ) {
      setStatus(
        '<i class="fas fa-ban"></i> Permissão da câmera negada.',
        "error",
      );
    } else {
      setStatus(
        '<i class="fas fa-triangle-exclamation"></i> Não foi possível acessar a câmera.',
        "error",
      );
    }
  }
}

function onScanSuccess(decodedText) {
  if (!isScanning) return;
  isScanning = false;
  
  setStatus(
    `<i class="fas fa-circle-check"></i> QR Code lido! Redirecionando...`,
    "success",
  );

  html5QrCode
    .stop()
    .then(() => {
      html5QrCode.clear();
      setTimeout(() => goToCode(decodedText), 500);
    })
    .catch(() => {
      setTimeout(() => goToCode(decodedText), 500);
    });
}

function onScanFailure() {
  // Silencioso
}

function stopScanner() {
  if (html5QrCode && isScanning) {
    html5QrCode
      .stop()
      .then(() => {
        html5QrCode.clear();
        resetScannerUI();
        clearStatus();
      })
      .catch(() => resetScannerUI());
  } else {
    resetScannerUI();
  }
  isScanning = false;
}

function resetScannerUI() {
  document.getElementById("scanPlaceholder").style.display = "flex";
  document.getElementById("reader").classList.remove("active");
  document.getElementById("startBtn").style.display = "flex";
  document.getElementById("stopBtn").style.display = "none";
}