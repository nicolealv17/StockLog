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

// Função que decide para onde ir baseado no que foi lido
function goToCode(codigo) {
  if (!codigo) return;
  const clean = codigo.trim();

  // Se o QR Code contém o link completo do GitHub (ex: https://.../produto1.html)
  // Ou se contém apenas o nome do arquivo (ex: produto1.html)
  if (clean.includes("produto1") || clean.includes("produto2") || clean.includes("produto3")) {
    
    // Lógica para redirecionar para o arquivo certo
    if (clean.includes("produto1")) {
        window.location.href = `produto1.html`;
    } else if (clean.includes("produto2")) {
        window.location.href = `produto2.html`;
    } else {
        window.location.href = `produto3.html`;
    }
  } 
  // Se o QR Code tiver apenas o código da peça (ex: MP-1042 ou P-0248)
  else {
    // Aqui mantemos a lógica de ir para uma página de detalhes caso exista, 
    // ou você pode trocar para `produto1.html` se for o padrão.
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
  
  // Mostra na tela o que foi lido e que está redirecionando
  setStatus(
    `<i class="fas fa-circle-check"></i> QR Code reconhecido: <strong>&nbsp;${decodedText}</strong> — redirecionando...`,
    "success",
  );

  html5QrCode
    .stop()
    .then(() => {
      html5QrCode.clear();
      setTimeout(() => goToCode(decodedText), 800);
    })
    .catch(() => {
      setTimeout(() => goToCode(decodedText), 800);
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