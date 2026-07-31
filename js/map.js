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
      if (!saved[id] || typeof saved[id].lat !== 'number' || typeof saved[id].lng !== 'number') return;
      const factory = MOCK_DATA.find(f => f.id === parseInt(id));
      const mh = typeof MH_DATA !== 'undefined' ? MH_DATA.find(m => m.id === id) : null;
      if (factory) {
        factory.lat = saved[id].lat;
        factory.lng = saved[id].lng;
      } else if (mh) {
        mh.lat = saved[id].lat;
        mh.lng = saved[id].lng;
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
    } else if (typeof MH_DATA !== 'undefined') {
      const mh = MH_DATA.find(m => m.id === id);
      if (mh) {
        code += `// ${mh.name} (${mh.nameTh})\nlat: ${saved[id].lat}, lng: ${saved[id].lng}\n\n`;
      }
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

function createFactoryIcon(color) {
  return L.divIcon({
    className: 'factory-icon-marker',
    html: `<svg width="24" height="28" viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C12 0 8 4 8 8V12H6V8C6 4 2 0 2 0L0 4V14H4V10H6V14H10V10H12V14H16V10H18V14H22V4L20 0C20 0 16 4 16 8V12H14V8C14 4 12 0 12 0Z" fill="${color}"/>
      <rect x="2" y="14" width="20" height="12" rx="2" fill="${color}"/>
      <rect x="5" y="17" width="4" height="3" rx="1" fill="#0a0e27"/>
      <rect x="15" y="17" width="4" height="3" rx="1" fill="#0a0e27"/>
      <rect x="5" y="22" width="4" height="3" rx="1" fill="#0a0e27"/>
      <rect x="15" y="22" width="4" height="3" rx="1" fill="#0a0e27"/>
    </svg>`,
    iconSize: [24, 28],
    iconAnchor: [12, 28],
    popupAnchor: [0, -28]
  });
}

function addFactoryMarker(factory) {
  const hasCurrent = !!factory.current;
  const pass = hasCurrent ? isPass(factory.current) : false;
  const color = !hasCurrent ? '#64748b' : (pass ? '#22c55e' : '#ef4444');

  const marker = L.marker([factory.lat, factory.lng], {
    icon: createFactoryIcon(color)
  }).addTo(map);

  marker.bindTooltip(factory.name, {
    sticky: true,
    className: 'factory-tooltip',
    direction: 'top',
    offset: [0, -12]
  });

  marker.on('mouseover', function () {
    this.openTooltip();
  });

  marker.on('mouseout', function () {
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
  if (!d) {
    return `<div class="popup-content">
      <div class="popup-header">
        <h3>${escapeHtml(factory.name)}</h3>
        <div class="popup-type">${escapeHtml(factory.nameTh)}</div>
        <span class="popup-industry-tag">${escapeHtml(factory.industry)}</span>
      </div>
      <div style="padding:12px;text-align:center;color:var(--text-muted);font-size:0.8rem;">
        ยังไม่มีข้อมูลตรวจวัด
      </div>
    </div>`;
  }
  const checks = getParamChecks(d);

  const rows = [
    { label: 'BOD',  value: d.bod,  unit: 'mg/L', pass: checks.bod,  standard: '≤ 120' },
    { label: 'COD',  value: d.cod,  unit: 'mg/L', pass: checks.cod,  standard: '≤ 500' },
    { label: 'DO',   value: d.do,   unit: 'mg/L', pass: checks.do,   standard: '≥ 2' },
    { label: 'pH',   value: d.ph,   unit: '',     pass: checks.ph,   standard: '5.5–9.0' },
    { label: 'Temp', value: d.temp, unit: '°C',   pass: checks.temp, standard: '≤ 45' }
  ];

  if (d.tds !== undefined) rows.push({ label: 'TDS', value: d.tds, unit: 'mg/L', pass: checks.tds, standard: '≤ 3000' });
  if (d.tss !== undefined) rows.push({ label: 'TSS', value: d.tss, unit: 'mg/L', pass: checks.tss, standard: '≤ 200' });
  if (d.oil !== undefined) rows.push({ label: 'FOG', value: d.oil, unit: 'mg/L', pass: checks.oil, standard: '≤ 10' });

  const paramsHTML = rows.map(r => `
    <div class="popup-param">
      <div class="popup-param-left">
        <span class="popup-param-label">${r.label}</span>
        <span class="popup-param-standard">(${r.standard} ${r.unit})</span>
      </div>
      <span class="param-val ${r.pass ? 'pass' : 'fail'}">
        ${r.value} ${r.unit}
        <span class="param-check">${r.pass ? '✓' : '✗'}</span>
      </span>
    </div>
  `).join('');

  const allPass = Object.values(checks).every(Boolean);

  const photoHTML = factory.photo
    ? `<div class="popup-photo"><img src="${escapeHtml(factory.photo)}" alt="${escapeHtml(factory.name)}" loading="lazy" onerror="this.style.display='none'"></div>`
    : '';

  return `
    <div class="popup-content">
      ${photoHTML}
      <div class="popup-header">
        <h3>${escapeHtml(factory.name)}</h3>
        <div class="popup-type">${escapeHtml(factory.nameTh)}</div>
        <span class="popup-industry-tag">${escapeHtml(factory.industry)}</span>
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
  if (!d) return false;
  return d.bod <= 120 && d.cod <= 500 && d.do >= 2 && d.ph >= 5.5 && d.ph <= 9 && d.temp <= 45
    && (d.tds === undefined || d.tds <= 3000)
    && (d.tss === undefined || d.tss <= 200)
    && (d.oil === undefined || d.oil <= 10);
}

function getParamChecks(d) {
  if (!d) return { bod: true, cod: true, do: true, ph: true, temp: true, tds: true, tss: true, oil: true };
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
    try {
      const m = factoryMarkers[key];
      const el = m.getElement();
      if (el) el.classList.remove('selected');
    } catch(e) {}
  });

  const selected = factoryMarkers[id];
  if (selected) {
    try {
      const el = selected.getElement();
      if (el) el.classList.add('selected');
    } catch(e) {}
    const ll = selected.getLatLng();
    map.panTo([ll.lat, ll.lng], { animate: false });
  }
}

function resetHighlights() {
  Object.keys(factoryMarkers).forEach(key => {
    try {
      const m = factoryMarkers[key];
      const el = m.getElement();
      if (el) el.classList.remove('selected');
    } catch(e) {}
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
    const mh = currentLayer === 'manhole' && selectedMHId ? MH_DATA.find(m => m.id === selectedMHId) : null;

    let html = `<div class="coord-picker-content">
      <div class="coord-label">พิกัดที่คลิก</div>
      <div class="coord-values">
        <span class="coord-item">lat: ${lat.toFixed(6)}</span>
        <span class="coord-item">lng: ${lng.toFixed(6)}</span>
      </div>`;

    if (factory) {
      html += `<div class="coord-divider"></div>
        <div class="coord-label">โรงงาน: ${factory.name}</div>
        <div class="coord-values">
          <span class="coord-item old">เดิม: ${factory.lat}, ${factory.lng}</span>
        </div>
        <div class="coord-code">lat: ${lat.toFixed(6)}, lng: ${lng.toFixed(6)}</div>
        <button class="coord-save-btn" onclick="saveNewCoords(${factory.id}, ${lat.toFixed(6)}, ${lng.toFixed(6)})">💾 บันทึกพิกัดนี้</button>
        <button class="coord-copy-btn" onclick="copyCoord('${lat.toFixed(6)}, ${lng.toFixed(6)}')">คัดลอกพิกัด</button>`;
    } else if (mh) {
      html += `<div class="coord-divider"></div>
        <div class="coord-label">Manhole: ${mh.name} — ${mh.nameTh}</div>
        <div class="coord-values">
          <span class="coord-item old">เดิม: ${mh.lat}, ${mh.lng}</span>
        </div>
        <div class="coord-code">lat: ${lat.toFixed(6)}, lng: ${lng.toFixed(6)}</div>
        <button class="coord-save-btn" onclick="saveNewCoords('${mh.id}', ${lat.toFixed(6)}, ${lng.toFixed(6)})">💾 บันทึกพิกัดนี้</button>
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

function saveNewCoords(id, lat, lng) {
  saveCoordsToStorage(id, lat, lng);

  const factory = MOCK_DATA.find(f => f.id === id);
  const mh = !factory && typeof MH_DATA !== 'undefined' ? MH_DATA.find(m => m.id === id) : null;

  if (factory) {
    factory.lat = lat;
    factory.lng = lng;
    if (factoryMarkers[id]) factoryMarkers[id].setLatLng([lat, lng]);
    const coordEl = document.getElementById('detail-coords');
    if (coordEl && selectedFactoryId === id) {
      coordEl.innerHTML = `<strong>พิกัด:</strong> ${escapeHtml(lat)}, ${escapeHtml(lng)} <span style="color:var(--pass);font-size:0.7rem;">✓ บันทึกแล้ว</span>`;
    }
    showSaveToast(factory.name);
  } else if (mh) {
    mh.lat = lat;
    mh.lng = lng;
    if (mhMarkers[id]) {
      mhMarkers[id].setLatLng([lat, lng]);
      mhMarkers[id].setPopupContent(buildMHPopupHTML(mh));
    }
    const coordEl = document.getElementById('mh-detail-coords');
    if (coordEl && selectedMHId === id) {
      coordEl.innerHTML = `พิกัด: ${escapeHtml(lat)}, ${escapeHtml(lng)} <span style="color:var(--pass);font-size:0.7rem;">✓ บันทึกแล้ว</span>`;
    }
    showSaveToast(mh.name);
  }

  if (coordPickerMarker) {
    map.removeLayer(coordPickerMarker);
    coordPickerMarker = null;
  }
}

function showSaveToast(name) {
  const existing = document.querySelector('.save-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'save-toast';
  toast.innerHTML = `✓ บันทึกพิกัด${name ? ' ' + escapeHtml(name) : ''}แล้ว`;
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

/* ============ MANHOLE LAYER ============ */
let mhMarkers = {};
let currentLayer = 'factory';
const MH_DL_DISPLAY = { BOD: 2, COD: 40, SS: 5, FOG: 3, TDS: 3000, pH: 5.5 };

function createMHIcon(color, label) {
  return L.divIcon({
    className: 'mh-icon-wrapper',
    html: `<svg width="36" height="22" viewBox="0 0 36 22" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="9" fill="${color}" fill-opacity="0.25" stroke="${color}" stroke-width="2"/>
      <circle cx="11" cy="11" r="4" fill="${color}"/>
      <text x="24" y="15" font-size="11" font-weight="700" fill="${color}" font-family="Segoe UI, system-ui, sans-serif">${escapeHtml(label)}</text>
    </svg>`,
    iconSize: [36, 22],
    iconAnchor: [11, 11],
    popupAnchor: [8, -12]
  });
}

function isMHPass(d) {
  if (!d) return false;
  return d.bod <= 120 && d.cod <= 500 && d.tss <= 200 && d.ph >= 5.5 && d.ph <= 9 && (d.fog === undefined || d.fog <= 10);
}

function buildMHPopupHTML(mh) {
  const d = mh.current;
  if (!d) {
    return `<div class="popup-content">
      <div class="popup-header">
        <h3>${escapeHtml(mh.name)}</h3>
        <div class="popup-type">${escapeHtml(mh.nameTh)}</div>
        <span class="popup-industry-tag">${escapeHtml(mh.zone)}</span>
      </div>
      <div style="padding:12px;text-align:center;color:var(--text-muted);font-size:0.8rem;">ยังไม่มีข้อมูลตรวจวัด</div>
    </div>`;
  }

  const checks = { bod: d.bod <= 120, cod: d.cod <= 500, ss: d.tss <= 200, ph: d.ph >= 5.5 && d.ph <= 9, fog: !d.fog || d.fog <= 10 };

  const rows = [
    { label: 'BOD', value: d.bod, unit: 'mg/L', pass: checks.bod, standard: '≤ 120' },
    { label: 'COD', value: d.cod, unit: 'mg/L', pass: checks.cod, standard: '≤ 500' },
    { label: 'SS', value: d.tss, unit: 'mg/L', pass: checks.ss, standard: '≤ 200' },
    { label: 'pH', value: d.ph, unit: '', pass: checks.ph, standard: '5.5–9.0' },
  ];
  if (d.fog !== undefined && d.fog > 0) {
    rows.push({ label: 'FOG', value: d.fog, unit: 'mg/L', pass: checks.fog, standard: '≤ 10' });
  }

  const paramsHTML = rows.map(r => `
    <div class="popup-param">
      <div class="popup-param-left">
        <span class="popup-param-label">${r.label}</span>
        <span class="popup-param-standard">(${r.standard} ${r.unit})</span>
      </div>
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
        <h3>${escapeHtml(mh.name)}</h3>
        <div class="popup-type">${escapeHtml(mh.nameTh)}</div>
        <span class="popup-industry-tag">${escapeHtml(mh.zone)}</span>
      </div>
      <div class="popup-params">${paramsHTML}</div>
      <div style="margin-top:10px;padding-top:8px;border-top:1px solid var(--border);text-align:center;">
        <span style="font-size:0.72rem;color:${allPass ? 'var(--pass)' : 'var(--fail)'};font-weight:600;">
          ${allPass ? '✓ ผ่านเกณฑ์มาตรฐานทั้งหมด' : '✗ มีค่าไม่ผ่านเกณฑ์'}
        </span>
      </div>
    </div>
  `;
}

function addMHMarker(mh) {
  const hasCurrent = !!mh.current;
  const pass = hasCurrent ? isMHPass(mh.current) : false;
  const color = !hasCurrent ? '#64748b' : (pass ? '#22c55e' : '#ef4444');

  const marker = L.marker([mh.lat, mh.lng], { icon: createMHIcon(color, mh.name) }).addTo(map);

  marker.bindTooltip(`${mh.name} — ${mh.nameTh}`, {
    sticky: true, className: 'factory-tooltip', direction: 'top', offset: [0, -12]
  });
  marker.on('mouseover', function () { this.openTooltip(); });

  const popupHTML = buildMHPopupHTML(mh);
  marker.bindPopup(popupHTML, { maxWidth: 300, minWidth: 240, closeButton: true, autoPan: true });
  marker.on('click', function () { selectMH(mh.id); });

  marker.mhId = mh.id;
  mhMarkers[mh.id] = marker;
}

function switchLayer(layer) {
  currentLayer = layer;

  document.querySelectorAll('.layer-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.layer-btn[data-layer="${layer}"]`).classList.add('active');

  const factoryList = document.getElementById('factory-list');
  const mhList = document.getElementById('mh-list');
  const searchInput = document.getElementById('search-factory');

  if (layer === 'factory') {
    Object.values(mhMarkers).forEach(m => map.removeLayer(m));
    Object.values(factoryMarkers).forEach(m => { try { m.addTo(map); } catch(e) {} });
    factoryList.classList.remove('hidden');
    mhList.classList.add('hidden');
    searchInput.placeholder = 'ค้นหาโรงงาน...';
    document.getElementById('sidebar-title').textContent = 'รายชื่อโรงงาน';
    closeMHDetail();
  } else {
    Object.values(factoryMarkers).forEach(m => map.removeLayer(m));
    Object.values(mhMarkers).forEach(m => { try { m.addTo(map); } catch(e) {} });
    factoryList.classList.add('hidden');
    mhList.classList.remove('hidden');
    searchInput.placeholder = 'ค้นหา Manhole...';
    document.getElementById('sidebar-title').textContent = 'จุดตรวจ Manhole';
    closeDetail();
  }

  handleSearch({ target: searchInput });
}
