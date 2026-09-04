let html5QrCode = null;
let isScanning = false;

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
  const clean = codigo.trim();

  // Se o QR Code tiver o link completo (ex: .../produto1.html) ou apenas o nome do arquivo
  if (clean.includes("produto1")) {
    window.location.href = "produto1.html";
  } 
  else if (clean.includes("produto2")) {
    window.location.href = "produto2.html";
  }
  else if (clean.includes("produto3")) {
    window.location.href = "produto3.html";
  }
  // Caso o QR Code seja um código de peça genérico (ex: MP-1042, P-0248)
  else {
    // Tenta abrir a página de detalhes genérica (se existir). 
    // Se não existir, você pode trocar para um alerta ou redirecionar para a home.
    window.location.href = `detalhe-peca.html?codigo=${encodeURIComponent(clean)}`;
  }
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
      { fps: 10, qrbox: { width: 230, height: 230 } },
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