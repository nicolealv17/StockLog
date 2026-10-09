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

function initMap() {
  if (map) return;

  map = L.map('map', { zoomControl: false }).setView([-23.5505, -46.6333], 9);
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  
  updateMapTiles();
  renderList();
  selectDelivery(selectedId);

  setTimeout(() => { if (map) map.invalidateSize(); }, 200);
  setTimeout(() => { if (map) map.invalidateSize(); }, 600);
}

function updateMapTiles() {
  if (tileLayer) map.removeLayer(tileLayer);
  
  // Utiliza OpenStreetMap padrão (Totalmente gratuito e sem necessidade de API Key)
  const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  tileLayer = L.tileLayer(tileUrl, {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
}

function renderList() {
  const searchInput = document.getElementById('searchInput');
  const search = searchInput ? searchInput.value.toLowerCase() : '';
  const container = document.getElementById('deliveryList');
  if (!container) return;

  const filtered = deliveries.filter(d => {
    const matchFilter = currentFilter === 'todos' || d.status === currentFilter;
    const matchSearch = d.id.toLowerCase().includes(search) || d.driver.toLowerCase().includes(search) || d.dest.toLowerCase().includes(search);
    return matchFilter && matchSearch;
  });

  container.innerHTML = filtered.map(d => {
    const badgeClass = d.status === 'em_preparacao' ? 'status-preparacao' : d.status === 'em_transito' ? 'status-transito' : 'status-entregue';
    const statusText = d.status === 'em_preparacao' ? 'Em Preparação' : d.status === 'em_transito' ? 'Em Trânsito' : 'Entregue';

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

function selectDelivery(id) {
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

  if (!map) return;

  mapMarkers.forEach(m => map.removeLayer(m));
  mapMarkers = [];
  if (mapPolyline) map.removeLayer(mapPolyline);

  mapPolyline = L.polyline(data.route, {
    color: '#006bb3',
    weight: 5,
    dashArray: '6, 6'
  }).addTo(map);

  const truckIcon = L.divIcon({
    className: 'custom-icon',
    html: `<div class="marker-truck"><i class="fas fa-truck"></i></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });

  const marker = L.marker(data.currentPos, { icon: truckIcon }).addTo(map).bindPopup(`<b>${data.driver}</b><br>${data.vehicle}`);
  mapMarkers.push(marker);

  map.fitBounds(mapPolyline.getBounds(), { padding: [40, 40] });
}

function filterStatus(status, btn) {
  currentFilter = status;
  document.querySelectorAll('.filter-chips .chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  renderList();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMap);
} else {
  initMap();
}

window.addEventListener('resize', () => {
  if (map) map.invalidateSize();
});