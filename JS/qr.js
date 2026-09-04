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

function goToCode(codigo) {
  if (!codigo) return;
  const clean = codigo.trim();
  window.location.href = `detalhe-peca.html?codigo=${encodeURIComponent(clean)}`;
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

  // Leitura de câmera exige HTTPS ou localhost (protocolo de segurança do navegador)
  const isSecure =
    window.location.protocol === "https:" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  if (!isSecure) {
    setStatus(
      '<i class="fas fa-triangle-exclamation"></i> A câmera só funciona em HTTPS ou localhost. Rode este arquivo com um servidor local (ex: Live Server) em vez de abrir direto do disco.',
      "error",
    );
    return;
  }

  if (typeof Html5Qrcode === "undefined") {
    setStatus(
      '<i class="fas fa-triangle-exclamation"></i> Não foi possível carregar a biblioteca de leitura. Verifique sua conexão com a internet.',
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
        '<i class="fas fa-ban"></i> Permissão da câmera negada. Habilite o acesso à câmera nas configurações do navegador e tente novamente.',
        "error",
      );
    } else {
      setStatus(
        '<i class="fas fa-triangle-exclamation"></i> Não foi possível acessar a câmera. Verifique se o dispositivo tem câmera disponível.',
        "error",
      );
    }
  }
}

function onScanSuccess(decodedText) {
  if (!isScanning) return;
  isScanning = false;
  setStatus(
    `<i class="fas fa-circle-check"></i> QR Code reconhecido: <strong>&nbsp;${decodedText}</strong> — redirecionando...`,
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
  // Chamado a cada frame sem QR detectado — silenciar, é o comportamento normal
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