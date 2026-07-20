let map;
let factoryPolygons = {};

function initMap() {
  map = L.map('map', {
    center: [13.0833, 100.9667],
    zoom: 15,
    zoomControl: true,
    attributionControl: true
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 19,
    subdomains: 'abcd'
  }).addTo(map);

  const estateBoundary = L.polygon([
    [13.0960, 100.9540],
    [13.0960, 100.9820],
    [13.0730, 100.9820],
    [13.0730, 100.9540]
  ], {
    color: '#d4a017',
    weight: 2,
    fillColor: '#d4a017',
    fillOpacity: 0.03,
    dashArray: '8, 12',
    interactive: false
  }).addTo(map);

  estateBoundary.bindTooltip('สวนอุตสาหกรรมสหพัฒน์ ศรีราชา', {
    permanent: true,
    direction: 'center',
    className: 'estate-label'
  });
}

function addFactoryPolygon(factory) {
  const pass = isPass(factory.current);
  const color = pass ? '#22c55e' : '#ef4444';
  const fillOpacity = pass ? 0.25 : 0.35;

  const polygon = L.polygon(factory.polygon, {
    color: color,
    weight: 2,
    fillColor: color,
    fillOpacity: fillOpacity
  }).addTo(map);

  polygon.bindTooltip(factory.name, {
    sticky: true,
    className: 'factory-tooltip',
    direction: 'top',
    offset: [0, -10]
  });

  polygon.on('mouseover', function () {
    this.setStyle({ weight: 3, fillOpacity: fillOpacity + 0.15 });
  });

  polygon.on('mouseout', function () {
    this.setStyle({ weight: 2, fillOpacity: fillOpacity });
  });

  const popupHTML = buildPopupHTML(factory);
  polygon.bindPopup(popupHTML, {
    maxWidth: 300,
    minWidth: 260,
    closeButton: true,
    autoPan: true,
    autoPanPadding: [40, 40]
  });

  polygon.factoryId = factory.id;
  factoryPolygons[factory.id] = polygon;
}

function buildPopupHTML(factory) {
  const d = factory.current;
  const checks = getParamChecks(d);

  const rows = [
    { label: 'BOD', value: d.bod, unit: 'mg/L', pass: checks.bod, ref: '≤ 20' },
    { label: 'COD', value: d.cod, unit: 'mg/L', pass: checks.cod, ref: '≤ 120' },
    { label: 'DO',  value: d.do,  unit: 'mg/L', pass: checks.do,  ref: '≥ 2' },
    { label: 'pH',  value: d.ph,  unit: '-',    pass: checks.ph,  ref: '6.0–9.0' },
    { label: 'Temp', value: d.temp, unit: '°C', pass: checks.temp, ref: '≤ 40' }
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
      <div style="margin-top:10px;padding-top:8px;border-top:1px solid #1e293b;text-align:center;">
        <span style="font-size:0.72rem;color:${allPass ? '#22c55e' : '#ef4444'};font-weight:600;">
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
  Object.keys(factoryPolygons).forEach(key => {
    const poly = factoryPolygons[key];
    const factory = MOCK_DATA.find(f => f.id === parseInt(key));
    if (factory) {
      const pass = isPass(factory.current);
      const color = pass ? '#22c55e' : '#ef4444';
      poly.setStyle({ color: color, fillColor: color, weight: 2, fillOpacity: pass ? 0.25 : 0.35 });
    }
  });

  const selected = factoryPolygons[id];
  if (selected) {
    selected.setStyle({ color: '#f5d061', fillColor: '#f5d061', weight: 3, fillOpacity: 0.4 });
    map.setView([selected.getBounds().getCenter().lat, selected.getBounds().getCenter().lng], 16, { animate: true });
  }
}

function resetHighlights() {
  Object.keys(factoryPolygons).forEach(key => {
    const poly = factoryPolygons[key];
    const factory = MOCK_DATA.find(f => f.id === parseInt(key));
    if (factory) {
      const pass = isPass(factory.current);
      const color = pass ? '#22c55e' : '#ef4444';
      poly.setStyle({ color: color, fillColor: color, weight: 2, fillOpacity: pass ? 0.25 : 0.35 });
    }
  });
}
