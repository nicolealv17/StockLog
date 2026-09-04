const STORAGE_KEY = 'stocklog_estoque_itens_v1';

function getCodigoFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return (params.get('codigo') || '').trim();
}

function loadItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Falha ao ler localStorage.', e);
  }
  return [];
}

function renderNotFound(codigo) {
  document.getElementById('detailCard').innerHTML = `
    <div class="not-found">
      <i class="fas fa-box-open"></i>
      <h2>Peça não encontrada</h2>
      <p>Nenhum item de estoque corresponde ao código ${codigo ? `<code>${codigo}</code>` : 'informado'}.</p>
      <a class="back-link" href="leitor-qr.html" style="display:inline-flex;">
        <i class="fas fa-qrcode"></i> Voltar ao leitor de QR Code
      </a>
    </div>
  `;
}

function statusLabel(status) {
  if (status === 'critico') return { text: 'Crítico', icon: 'fa-circle-exclamation' };
  if (status === 'baixo') return { text: 'Baixo', icon: 'fa-triangle-exclamation' };
  return { text: 'Normal', icon: 'fa-check-circle' };
}

function renderDetail(item) {
  const perc = Math.min(100, Math.round((item.atual / item.maximo) * 100));
  let barColor = 'var(--green-bar)';
  if (item.status === 'baixo') barColor = 'var(--amber-bar)';
  if (item.status === 'critico') barColor = 'var(--red-bar)';

  const st = statusLabel(item.status);

  document.getElementById('detailCard').innerHTML = `
    <div class="detail-header">
      <div>
        <span class="item-code-big">${item.codigo}</span>
        <h1>${item.nome}</h1>
        <div class="item-sub-big">${item.sub}</div>
      </div>
      <span class="status-pill-big ${item.status}"><i class="fas ${st.icon}"></i> ${st.text}</span>
    </div>
    <div class="detail-body">
      <div class="qty-hero">
        <div class="qty-number">${item.atual}</div>
        <div class="qty-label">unidades em estoque</div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width:${perc}%; background:${barColor};"></div>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-block">
          <div class="label">Categoria</div>
          <div class="value">${item.categoria}</div>
        </div>
        <div class="info-block">
          <div class="label">Localização</div>
          <div class="value"><i class="fas fa-location-dot" style="color:var(--text-muted); font-size:0.8em;"></i> ${item.local}</div>
        </div>
        <div class="info-block">
          <div class="label">Mínimo</div>
          <div class="value">${item.minimo} un</div>
        </div>
        <div class="info-block">
          <div class="label">Máximo</div>
          <div class="value">${item.maximo} un</div>
        </div>
      </div>

      <div class="flow-row">
        <span class="flow-in"><i class="fas fa-arrow-down"></i> +${item.entradas} entradas hoje</span>
        <span class="flow-out"><i class="fas fa-arrow-up"></i> -${item.saidas} saídas hoje</span>
      </div>

      <a class="back-link" href="leitor-qr.html">
        <i class="fas fa-qrcode"></i> Ler outro QR Code
      </a>
    </div>
  `;
}

function init() {
  const codigo = getCodigoFromUrl();
  if (!codigo) {
    renderNotFound(null);
    return;
  }
  const items = loadItems();
  const item = items.find(i => i.codigo.toLowerCase() === codigo.toLowerCase());
  if (!item) {
    renderNotFound(codigo);
    return;
  }
  renderDetail(item);
}

document.addEventListener('DOMContentLoaded', init);
