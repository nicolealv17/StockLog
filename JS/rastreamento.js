const deliveries = [
  {
    id: 'SL-982347-BR',
    item: 'Lote Eletrônicos Industriais',
    driver: 'Marcos Oliveira',
    vehicle: 'Renault Master · ABC-4E89',
    dest: 'Campinas, SP',
    status: 'em_transito',
    step: 3,
    speed: '78 km/h',
    temp: '21°C',
    fuel: '84%',
    route: [[-23.5505, -46.6333], [-23.3251, -46.8582], [-22.9099, -47.0626]],
    currentPos: [-23.3251, -46.8582]
  },
  {
    id: 'SL-554102-BR',
    item: 'Chapas de Aço Inox (5 T)',
    driver: 'Roberto Alves',
    vehicle: 'Scania R450 · DEF-1A23',
    dest: 'Santos, SP',
    status: 'em_transito',
    step: 3,
    speed: '62 km/h',
    temp: 'N/A',
    fuel: '65%',
    route: [[-23.5505, -46.6333], [-23.7500, -46.5000], [-23.9618, -46.3322]],
    currentPos: [-23.7500, -46.5000]
  },
  {
    id: 'SL-120938-BR',
    item: 'Caixas de Óleo Lubrificante',
    driver: 'Ana Paula Souza',
    vehicle: 'VW Delivery · GHI-9012',
    dest: 'Guarulhos, SP',
    status: 'em_preparacao',
    step: 1,
    speed: '0 km/h',
    temp: '25°C',
    fuel: '100%',
    route: [[-23.5505, -46.6333], [-23.4628, -46.5333]],
    currentPos: [-23.5505, -46.6333]
  },
  {
    id: 'SL-773411-BR',
    item: 'Componentes Hidráulicos',
    driver: 'Carlos Eduardo',
    vehicle: 'Mercedes Sprinter · JKL-3456',
    dest: 'Sorocaba, SP',
    status: 'entregue',
    step: 4,
    speed: '0 km/h',
    temp: '20°C',
    fuel: '42%',
    route: [[-23.5505, -46.6333], [-23.5015, -47.4526]],
    currentPos: [-23.5015, -47.4526]
  }
];

let selectedId = 'SL-982347-BR';
let currentFilter = 'todos';
let map = null;
let mapPolyline = null;
let mapMarkers = [];
let tileLayer = null;

function ensureLeafletLoaded(callback) {
  if (typeof L !== 'undefined') {
    callback();
    return;
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(link);

  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js';
  script.onload = callback;
  script.onerror = () => {
    const mapEl = document.getElementById('map');
    if (mapEl) {
      mapEl.innerHTML = '<div style="display:grid;place-items:center;height:100%;color:#d97706;font-weight:700;padding:20px;text-align:center;">Sem conexão com o servidor de mapas. Verifique sua internet.</div>';
    }
  };
  document.head.appendChild(script);
}

function initMap() {
  renderList();

  ensureLeafletLoaded(() => {
    const mapEl = document.getElementById('map');
    if (!mapEl || map) return;

    map = L.map('map', { zoomControl: false }).setView([-23.5505, -46.6333], 9);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    updateMapTiles();
    selectDelivery(selectedId);

    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(() => {
        if (map) map.invalidateSize();
      });
      resizeObserver.observe(mapEl);
    }

    const themeObserver = new MutationObserver(() => updateMapTiles());
    themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    setTimeout(() => { if (map) map.invalidateSize(); }, 300);
    setTimeout(() => { if (map) map.invalidateSize(); }, 1000);
  });
}

function updateMapTiles() {
  if (!map || typeof L === 'undefined') return;
  if (tileLayer) map.removeLayer(tileLayer);

  const isDark = document.body.classList.contains('dark');

  // Espelho oficial OpenStreetMap (mesma estética original, sem bloqueio e sem API Key)
  tileLayer = L.tileLayer(
    'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
    {
      maxZoom: 19,
      subdomains: 'abc',
      attribution: '&copy; OpenStreetMap contributors'
    }
  ).addTo(map);

  // Fallback automático caso o servidor osmfr demore a responder
  tileLayer.on('tileerror', function () {
    if (!tileLayer._switchedToBackup) {
      tileLayer._switchedToBackup = true;
      tileLayer.setUrl('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png');
    }
  });

  const tilePane = map.getPane('tilePane');
  if (tilePane) {
    tilePane.style.filter = isDark
      ? 'invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)'
      : 'none';
  }
}

function renderList() {
  const searchInput = document.getElementById('searchInput');
  const search = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const container = document.getElementById('deliveryList');
  if (!container) return;

  const filtered = deliveries.filter(d => {
    const matchFilter = currentFilter === 'todos' || d.status === currentFilter;
    const matchSearch =
      d.id.toLowerCase().includes(search) ||
      d.driver.toLowerCase().includes(search) ||
      d.vehicle.toLowerCase().includes(search) ||
      d.item.toLowerCase().includes(search) ||
      d.dest.toLowerCase().includes(search);
    return matchFilter && matchSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:32px 16px; color:var(--text-muted); font-size:13.5px;">
        Nenhuma entrega encontrada para os filtros selecionados.
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(d => {
    const badgeClass =
      d.status === 'em_preparacao'
        ? 'status-preparacao'
        : d.status === 'em_transito'
        ? 'status-transito'
        : 'status-entregue';
    const statusText =
      d.status === 'em_preparacao'
        ? 'Em Preparação'
        : d.status === 'em_transito'
        ? 'Em Trânsito'
        : 'Entregue';

    return `
      <div class="delivery-card ${d.id === selectedId ? 'selected' : ''}" onclick="selectDelivery('${d.id}')">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <strong style="font-size:14px; color:var(--text-main);">${d.id}</strong>
          <span class="status-badge ${badgeClass}">${statusText}</span>
        </div>
        <div style="font-size:13px; font-weight:700; color:var(--text-secondary); margin-bottom:6px;">${d.item}</div>
        <div style="font-size:12px; color:var(--text-muted);"><i class="fas fa-user-circle"></i> ${d.driver} · ${d.vehicle}</div>
        <div style="font-size:12px; color:var(--text-muted); margin-top:2px;"><i class="fas fa-location-dot"></i> Destino: <strong>${d.dest}</strong></div>
      </div>
    `;
  }).join('');
}

async function getRoadRoute(waypoints) {
  try {
    const coordsString = waypoints.map(p => `${p[1]},${p[0]}`).join(';');
    const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`);
    if (!response.ok) throw new Error('Falha OSRM');
    const json = await response.json();
    if (json.routes && json.routes[0]) {
      return json.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
    }
  } catch (e) {
    // Fallback silencioso para as coordenadas originais
  }
  return waypoints;
}

async function selectDelivery(id) {
  selectedId = id;
  renderList();

  const data = deliveries.find(d => d.id === id);
  if (!data) return;

  const selectedCode = document.getElementById('selectedCode');
  const teleSpeed = document.getElementById('teleSpeed');
  const teleTemp = document.getElementById('teleTemp');
  const teleFuel = document.getElementById('teleFuel');

  if (selectedCode) selectedCode.innerText = data.id;
  if (teleSpeed) teleSpeed.innerText = data.speed;
  if (teleTemp) teleTemp.innerText = data.temp;
  if (teleFuel) teleFuel.innerText = data.fuel;

  const steps = document.querySelectorAll('#stepperContainer .step-item');
  steps.forEach((el, idx) => {
    el.classList.remove('completed', 'active');
    if (idx + 1 < data.step) el.classList.add('completed');
    else if (idx + 1 === data.step) el.classList.add('active');
  });

  if (!map || typeof L === 'undefined') return;

  mapMarkers.forEach(m => map.removeLayer(m));
  mapMarkers = [];
  if (mapPolyline) map.removeLayer(mapPolyline);

  const originPoint = data.route[0];
  const originMarker = L.circleMarker(originPoint, {
    radius: 6,
    fillColor: '#006bb3',
    color: '#ffffff',
    weight: 2,
    fillOpacity: 1
  }).addTo(map).bindPopup('<b>Centro de Distribuição</b><br>São Paulo, SP');
  mapMarkers.push(originMarker);

  const destPoint = data.route[data.route.length - 1];
  const destMarker = L.circleMarker(destPoint, {
    radius: 7,
    fillColor: '#16a34a',
    color: '#ffffff',
    weight: 2,
    fillOpacity: 1
  }).addTo(map).bindPopup(`<b>Destino:</b> ${data.dest}`);
  mapMarkers.push(destMarker);

  const truckIcon = L.divIcon({
    className: 'custom-icon',
    html: `<div class="marker-truck"><i class="fas fa-truck"></i></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });

  const marker = L.marker(data.currentPos, { icon: truckIcon })
    .addTo(map)
    .bindPopup(`<b>${data.driver}</b><br>${data.vehicle}<br><small>${data.dest}</small>`);
  mapMarkers.push(marker);

  const roadCoords = await getRoadRoute(data.route);
  if (selectedId !== id) return;

  mapPolyline = L.polyline(roadCoords, {
    color: '#006bb3',
    weight: 5,
    opacity: 0.85
  }).addTo(map);

  map.invalidateSize();
  map.fitBounds(mapPolyline.getBounds(), { padding: [50, 50], maxZoom: 13 });
}

function filterStatus(status, btn) {
  currentFilter = status;
  document.querySelectorAll('.filter-chips .chip').forEach(c => c.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderList();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMap);
} else {
  initMap();
}