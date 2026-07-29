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

/* ============ LOCALSTORAGE COORDS ============ */
const STORAGE_KEY = 'wq-dashboard-coords';

function loadSavedCoords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (typeof saved !== 'object' || saved === null) return;
    Object.keys(saved).forEach(id => {
      const factory = MOCK_DATA.find(f => f.id === parseInt(id));
      if (factory && saved[id] && typeof saved[id].lat === 'number' && typeof saved[id].lng === 'number') {
        factory.lat = saved[id].lat;
        factory.lng = saved[id].lng;
      }
    });
  } catch (e) {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function saveCoordsToStorage(factoryId, lat, lng) {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  saved[factoryId] = { lat, lng, savedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
}

function getSavedCoords() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
}

function exportSavedCoords() {
  const saved = getSavedCoords();
  if (Object.keys(saved).length === 0) {
    alert('ยังไม่มีพิกัดที่บันทึกไว้');
    return;
  }
  let code = '';
  Object.keys(saved).forEach(id => {
    const f = MOCK_DATA.find(f => f.id === parseInt(id));
    if (f) {
      code += `// ${f.name}\nlat: ${saved[id].lat}, lng: ${saved[id].lng}\n\n`;
    }
  });
  navigator.clipboard.writeText(code).then(() => {
    alert('คัดลอกโค้ดพิกัดทั้งหมดแล้ว!\nนำไปวางใน mock-data.js แล้ว push');
  });
}

/* ============ MAP INIT ============ */
function initMap() {
  loadSavedCoords();

  map = L.map('map', {
    center: [13.0980, 100.9630],
    zoom: 15,
    zoomControl: true,
    attributionControl: true
  });

  setTileLayer('street');
  drawEstateBoundary();
  initCoordinatePicker();
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
  // ขอบเขตจะเพิ่มใหม่เมื่อได้พิกัดที่ตรงกับผังจริง
}

function addFactoryMarker(factory) {
  const pass = isPass(factory.current);
  const color = pass ? '#22c55e' : '#ef4444';

  const marker = L.circleMarker([factory.lat, factory.lng], {
    radius: 2.5,
    color: color,
    weight: 1,
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
    this.setStyle({ radius: 3.5, weight: 1.5, fillOpacity: 0.85 });
    this.openTooltip();
  });

  marker.on('mouseout', function () {
    this.setStyle({ radius: 2.5, weight: 1, fillOpacity: 0.7 });
  });

  marker.on('click', function () {
    selectFactory(factory.id);
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
    { label: 'BOD', value: d.bod, unit: 'mg/L', pass: checks.bod, standard: '≤ 120' },
    { label: 'COD', value: d.cod, unit: 'mg/L', pass: checks.cod, standard: '≤ 500' },
    { label: 'DO',  value: d.do,  unit: 'mg/L', pass: checks.do, standard: '≥ 2' },
    { label: 'pH',  value: d.ph,  unit: '-',    pass: checks.ph, standard: '5.5–9.0' },
    { label: 'Temp', value: d.temp, unit: '°C', pass: checks.temp, standard: '≤ 45' }
  ];

  if (d.tds !== undefined) rows.push({ label: 'TDS', value: d.tds, unit: 'mg/L', pass: checks.tds, standard: '≤ 3000' });
  if (d.tss !== undefined) rows.push({ label: 'TSS', value: d.tss, unit: 'mg/L', pass: checks.tss, standard: '≤ 200' });
  if (d.oil !== undefined) rows.push({ label: 'FOG', value: d.oil, unit: 'mg/L', pass: checks.oil, standard: '≤ 10' });

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

  const photoHTML = factory.photo
    ? `<div class="popup-photo"><img src="${factory.photo}" alt="${factory.name}" loading="lazy" onerror="this.style.display='none'"></div>`
    : '';

  return `
    <div class="popup-content">
      ${photoHTML}
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
  return d.bod <= 120 && d.cod <= 500 && d.do >= 2 && d.ph >= 5.5 && d.ph <= 9 && d.temp <= 45
    && (d.tds === undefined || d.tds <= 3000)
    && (d.tss === undefined || d.tss <= 200)
    && (d.oil === undefined || d.oil <= 10);
}

function getParamChecks(d) {
  return {
    bod:  d.bod <= 120,
    cod:  d.cod <= 500,
    do:   d.do >= 2,
    ph:   d.ph >= 5.5 && d.ph <= 9,
    temp: d.temp <= 45,
    tds:  d.tds === undefined || d.tds <= 3000,
    tss:  d.tss === undefined || d.tss <= 200,
    oil:  d.oil === undefined || d.oil <= 10
  };
}

function highlightFactory(id) {
  Object.keys(factoryMarkers).forEach(key => {
    const m = factoryMarkers[key];
    const factory = MOCK_DATA.find(f => f.id === parseInt(key));
    if (factory) {
      const pass = isPass(factory.current);
      const color = pass ? '#22c55e' : '#ef4444';
      m.setStyle({ color, fillColor: color, radius: 2.5, weight: 1, fillOpacity: 0.7 });
    }
  });

  const selected = factoryMarkers[id];
  if (selected) {
    selected.setStyle({ color: '#06b6d4', fillColor: '#06b6d4', radius: 4, weight: 1.5, fillOpacity: 0.9 });
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
      m.setStyle({ color, fillColor: color, radius: 2.5, weight: 1, fillOpacity: 0.7 });
    }
  });
}

function invalidateMapSize() {
  if (map) {
    setTimeout(() => map.invalidateSize(), 100);
  }
}

/* ============ COORDINATE PICKER ============ */
let coordPickerMarker = null;
let coordPickerEnabled = false;

function enableCoordinatePicker() {
  coordPickerEnabled = true;
}

function disableCoordinatePicker() {
  coordPickerEnabled = false;
  if (coordPickerMarker) {
    map.removeLayer(coordPickerMarker);
    coordPickerMarker = null;
  }
}

function initCoordinatePicker() {
  map.on('click', function(e) {
    if (!coordPickerEnabled || !isAdmin) return;

    const { lat, lng } = e.latlng;

    if (coordPickerMarker) {
      map.removeLayer(coordPickerMarker);
    }

    coordPickerMarker = L.circleMarker([lat, lng], {
      radius: 6,
      color: '#06b6d4',
      fillColor: '#06b6d4',
      fillOpacity: 0.9,
      weight: 2
    }).addTo(map);

    const factory = selectedFactoryId ? MOCK_DATA.find(f => f.id === selectedFactoryId) : null;

    let html = `<div class="coord-picker-content">
      <div class="coord-label">พิกัดที่คลิก</div>
      <div class="coord-values">
        <span class="coord-item">lat: ${lat.toFixed(6)}</span>
        <span class="coord-item">lng: ${lng.toFixed(6)}</span>
      </div>`;

    if (factory) {
      const hasSaved = getSavedCoords()[factory.id];
      html += `<div class="coord-divider"></div>
        <div class="coord-label">โรงงาน: ${factory.name}</div>
        <div class="coord-values">
          <span class="coord-item old">เดิม: ${factory.lat}, ${factory.lng}</span>
        </div>
        <div class="coord-code">lat: ${lat.toFixed(6)}, lng: ${lng.toFixed(6)}</div>
        <button class="coord-save-btn" onclick="saveNewCoords(${factory.id}, ${lat.toFixed(6)}, ${lng.toFixed(6)})">💾 บันทึกพิกัดนี้</button>
        <button class="coord-copy-btn" onclick="copyCoord('${lat.toFixed(6)}, ${lng.toFixed(6)}')">คัดลอกพิกัด</button>`;
    } else {
      html += `<button class="coord-copy-btn" onclick="copyCoord('${lat.toFixed(6)}, ${lng.toFixed(6)}')">คัดลอกพิกัด</button>`;
    }

    html += `</div>`;

    coordPickerMarker.bindPopup(html, {
      maxWidth: 280,
      minWidth: 200,
      closeButton: true,
      className: 'coord-picker-popup'
    }).openPopup();
  });
}

function saveNewCoords(factoryId, lat, lng) {
  saveCoordsToStorage(factoryId, lat, lng);

  const factory = MOCK_DATA.find(f => f.id === factoryId);
  if (factory) {
    factory.lat = lat;
    factory.lng = lng;

    if (factoryMarkers[factoryId]) {
      factoryMarkers[factoryId].setLatLng([lat, lng]);
    }

    const coordEl = document.getElementById('detail-coords');
    if (coordEl && selectedFactoryId === factoryId) {
      coordEl.innerHTML = `<strong>พิกัด:</strong> ${lat}, ${lng} <span style="color:var(--pass);font-size:0.7rem;">✓ บันทึกแล้ว</span>`;
    }
  }

  if (coordPickerMarker) {
    map.removeLayer(coordPickerMarker);
    coordPickerMarker = null;
  }

  showSaveToast(factory ? factory.name : '');
}

function showSaveToast(name) {
  const existing = document.querySelector('.save-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'save-toast';
  toast.innerHTML = `✓ บันทึกพิกัด${name ? ' ' + name : ''}แล้ว`;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

function copyCoord(text) {
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector('.coord-copy-btn');
    if (btn) {
      btn.textContent = 'คัดลอกแล้ว!';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = 'คัดลอกพิกัด';
        btn.classList.remove('copied');
      }, 1500);
    }
  });
}
