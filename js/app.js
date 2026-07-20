let selectedFactoryId = null;

function initApp() {
  initMap();

  MOCK_DATA.forEach(factory => {
    addFactoryPolygon(factory);
  });

  renderFactoryList(MOCK_DATA);
  updateSummary();
  updateCurrentDate();

  document.getElementById('search-factory').addEventListener('input', handleSearch);
  document.getElementById('close-detail').addEventListener('click', closeDetail);
}

function updateCurrentDate() {
  const now = new Date();
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  document.getElementById('current-date').textContent = now.toLocaleDateString('th-TH', options);
}

function updateSummary() {
  const passCount = MOCK_DATA.filter(f => isPass(f.current)).length;
  const failCount = MOCK_DATA.length - passCount;

  document.getElementById('total-count').textContent = MOCK_DATA.length;
  document.getElementById('pass-count').textContent = passCount;
  document.getElementById('fail-count').textContent = failCount;
}

function renderFactoryList(factories) {
  const list = document.getElementById('factory-list');

  if (factories.length === 0) {
    list.innerHTML = `
      <div style="text-align:center;padding:30px;color:#64748b;font-size:0.85rem;">
        ไม่พบโรงงานที่ค้นหา
      </div>
    `;
    return;
  }

  list.innerHTML = factories.map(factory => {
    const pass = isPass(factory.current);
    const isActive = selectedFactoryId === factory.id;

    return `
      <div class="factory-item ${isActive ? 'active' : ''}"
           data-id="${factory.id}"
           onclick="selectFactory(${factory.id})">
        <div class="factory-item-info">
          <div class="factory-item-name">${factory.name}</div>
          <div class="factory-item-type">${factory.industry}</div>
        </div>
        <div class="status-indicator ${pass ? 'pass' : 'fail'}"
             title="${pass ? 'ผ่านเกณฑ์' : 'ไม่ผ่านเกณฑ์'}"></div>
      </div>
    `;
  }).join('');
}

function handleSearch(e) {
  const term = e.target.value.toLowerCase().trim();

  if (!term) {
    renderFactoryList(MOCK_DATA);
    return;
  }

  const filtered = MOCK_DATA.filter(f =>
    f.name.toLowerCase().includes(term) ||
    f.nameTh.includes(term) ||
    f.industry.includes(term)
  );

  renderFactoryList(filtered);
}

function selectFactory(id) {
  selectedFactoryId = id;
  const factory = MOCK_DATA.find(f => f.id === id);
  if (!factory) return;

  renderFactoryList(getFilteredFactories());
  highlightFactory(id);
  showDetail(factory);

  if (factoryPolygons[id]) {
    factoryPolygons[id].openPopup();
  }
}

function getFilteredFactories() {
  const term = (document.getElementById('search-factory').value || '').toLowerCase().trim();
  if (!term) return MOCK_DATA;
  return MOCK_DATA.filter(f =>
    f.name.toLowerCase().includes(term) ||
    f.nameTh.includes(term) ||
    f.industry.includes(term)
  );
}

function showDetail(factory) {
  const panel = document.getElementById('detail-panel');
  panel.classList.remove('hidden');

  document.getElementById('detail-name').textContent = factory.name;
  document.getElementById('detail-name-th').textContent = `${factory.nameTh} — ${factory.industry}`;
  document.getElementById('detail-industry').textContent = factory.industry;

  renderParamGrid(factory);
  renderTrendChart(factory);

  panel.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

function renderParamGrid(factory) {
  const d = factory.current;
  const checks = getParamChecks(d);

  const params = [
    { key: 'bod',  label: 'BOD',         value: d.bod,  unit: 'mg/L', pass: checks.bod,  standard: '≤ 20 mg/L',   method: 'Standard Methods 5210B' },
    { key: 'cod',  label: 'COD',         value: d.cod,  unit: 'mg/L', pass: checks.cod,  standard: '≤ 120 mg/L',  method: 'Standard Methods 5220D' },
    { key: 'do',   label: 'DO',          value: d.do,   unit: 'mg/L', pass: checks.do,   standard: '≥ 2 mg/L',    method: 'Electrode Method 4500-O' },
    { key: 'ph',   label: 'pH',          value: d.ph,   unit: '',     pass: checks.ph,   standard: '6.0 – 9.0',   method: 'Electrode Method 4500-H' },
    { key: 'temp', label: 'Temperature', value: d.temp, unit: '°C',   pass: checks.temp, standard: '≤ 40 °C',     method: 'Thermometric' }
  ];

  const grid = document.getElementById('param-grid');
  grid.innerHTML = params.map(p => `
    <div class="param-card ${p.key === 'temp' ? 'full-width' : ''}">
      <div class="param-label">${p.label}</div>
      <div class="param-value ${p.pass ? 'pass' : 'fail'}">
        ${p.value}<span class="param-unit">${p.unit}</span>
      </div>
      <div class="param-status ${p.pass ? 'pass' : 'fail'}">
        ${p.pass ? '✓ ผ่านเกณฑ์' : '✗ ไม่ผ่านเกณฑ์'} (${p.standard})
      </div>
    </div>
  `).join('');
}

function closeDetail() {
  const panel = document.getElementById('detail-panel');
  panel.classList.add('hidden');
  selectedFactoryId = null;
  resetHighlights();
  renderFactoryList(MOCK_DATA);
}

document.addEventListener('DOMContentLoaded', initApp);
