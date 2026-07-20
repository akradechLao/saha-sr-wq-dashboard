let map;
let factoryMarkers = {};
let currentTileLayer = null;
let currentTileType = 'street';

const TILE_LAYERS = {
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    options: {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 18
    }
  }
};

function initMap() {
  map = L.map('map', {
    center: [13.0833, 100.9667],
    zoom: 15,
    zoomControl: true,
    attributionControl: true
  });

  setTileLayer('street');
  drawEstateBoundary();
}

function setTileLayer(type) {
  if (currentTileLayer) {
    map.removeLayer(currentTileLayer);
  }
  currentTileType = type;
  const tile = TILE_LAYERS[type];
  currentTileLayer = L.tileLayer(tile.url, tile.options).addTo(map);
}

function drawEstateBoundary() {
  const estateBoundary = L.polygon([
    [13.0960, 100.9540],
    [13.0960, 100.9820],
    [13.0730, 100.9820],
    [13.0730, 100.9540]
  ], {
    color: '#d4a017',
    weight: 2,
    fillColor: '#d4a017',
    fillOpacity: 0.04,
    dashArray: '8, 12',
    interactive: false
  }).addTo(map);

  estateBoundary.bindTooltip('สวนอุตสาหกรรมสหพัฒน์ ศรีราชา', {
    permanent: true,
    direction: 'center',
    className: 'estate-label'
  });
}

function addFactoryMarker(factory) {
  const pass = isPass(factory.current);
  const color = pass ? '#22c55e' : '#ef4444';
  const glowColor = pass ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)';

  const marker = L.circleMarker([factory.lat, factory.lng], {
    radius: 10,
    color: color,
    weight: 2.5,
    fillColor: color,
    fillOpacity: 0.7,
    className: 'factory-circle'
  }).addTo(map);

  marker.bindTooltip(factory.name, {
    sticky: true,
    className: 'factory-tooltip',
    direction: 'top',
    offset: [0, -12]
  });

  marker.on('mouseover', function () {
    this.setStyle({ radius: 13, weight: 3, fillOpacity: 0.85 });
    this.openTooltip();
  });

  marker.on('mouseout', function () {
    this.setStyle({ radius: 10, weight: 2.5, fillOpacity: 0.7 });
  });

  const popupHTML = buildPopupHTML(factory);
  marker.bindPopup(popupHTML, {
    maxWidth: 300,
    minWidth: 240,
    closeButton: true,
    autoPan: true,
    autoPanPadding: [40, 40]
  });

  marker.factoryId = factory.id;
  factoryMarkers[factory.id] = marker;
}

function buildPopupHTML(factory) {
  const d = factory.current;
  const checks = getParamChecks(d);

  const rows = [
    { label: 'BOD', value: d.bod, unit: 'mg/L', pass: checks.bod },
    { label: 'COD', value: d.cod, unit: 'mg/L', pass: checks.cod },
    { label: 'DO',  value: d.do,  unit: 'mg/L', pass: checks.do },
    { label: 'pH',  value: d.ph,  unit: '-',    pass: checks.ph },
    { label: 'Temp', value: d.temp, unit: '°C', pass: checks.temp }
  ];

  const paramsHTML = rows.map(r => `
    <div class="popup-param">
      <span class="param-name">${r.label}</span>
      <span class="param-val ${r.pass ? 'pass' : 'fail'}">
        ${r.value} ${r.unit}
        <span class="param-check">${r.pass ? '✓' : '✗'}</span>
      </span>
    </div>
  `).join('');

  const allPass = Object.values(checks).every(Boolean);

  return `
    <div class="popup-content">
      <div class="popup-header">
        <h3>${factory.name}</h3>
        <div class="popup-type">${factory.nameTh} — ${factory.industry}</div>
      </div>
      <div class="popup-params">
        ${paramsHTML}
      </div>
      <div style="margin-top:10px;padding-top:8px;border-top:1px solid var(--border);text-align:center;">
        <span style="font-size:0.72rem;color:${allPass ? 'var(--pass)' : 'var(--fail)'};font-weight:600;">
          ${allPass ? '✓ ผ่านเกณฑ์มาตรฐานทั้งหมด' : '✗ มีค่าไม่ผ่านเกณฑ์'}
        </span>
      </div>
    </div>
  `;
}

function isPass(d) {
  return d.bod <= 20 && d.cod <= 120 && d.do >= 2 && d.ph >= 6 && d.ph <= 9 && d.temp <= 40;
}

function getParamChecks(d) {
  return {
    bod: d.bod <= 20,
    cod: d.cod <= 120,
    do:  d.do >= 2,
    ph:  d.ph >= 6 && d.ph <= 9,
    temp: d.temp <= 40
  };
}

function highlightFactory(id) {
  Object.keys(factoryMarkers).forEach(key => {
    const m = factoryMarkers[key];
    const factory = MOCK_DATA.find(f => f.id === parseInt(key));
    if (factory) {
      const pass = isPass(factory.current);
      const color = pass ? '#22c55e' : '#ef4444';
      m.setStyle({ color, fillColor: color, radius: 10, weight: 2.5, fillOpacity: 0.7 });
    }
  });

  const selected = factoryMarkers[id];
  if (selected) {
    selected.setStyle({ color: '#f5d061', fillColor: '#f5d061', radius: 14, weight: 3, fillOpacity: 0.9 });
    const ll = selected.getLatLng();
    map.setView([ll.lat, ll.lng], 16, { animate: true });
  }
}

function resetHighlights() {
  Object.keys(factoryMarkers).forEach(key => {
    const m = factoryMarkers[key];
    const factory = MOCK_DATA.find(f => f.id === parseInt(key));
    if (factory) {
      const pass = isPass(factory.current);
      const color = pass ? '#22c55e' : '#ef4444';
      m.setStyle({ color, fillColor: color, radius: 10, weight: 2.5, fillOpacity: 0.7 });
    }
  });
}

function invalidateMapSize() {
  if (map) {
    setTimeout(() => map.invalidateSize(), 100);
  }
}
