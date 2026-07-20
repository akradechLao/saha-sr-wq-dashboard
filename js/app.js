let selectedFactoryId = null;

function initApp() {
  initMap();

  MOCK_DATA.forEach(factory => {
    addFactoryMarker(factory);
  });

  renderFactoryList(MOCK_DATA);
  updateSummary();
  updateCurrentDate();
  loadThemePreference();

  document.getElementById('search-factory').addEventListener('input', handleSearch);
  document.getElementById('close-detail').addEventListener('click', closeDetail);
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
  document.getElementById('sidebar-toggle').addEventListener('click', toggleSidebar);
  document.getElementById('sidebar-overlay').addEventListener('click', closeSidebar);

  document.querySelectorAll('.map-toggle-btn').forEach(btn => {
    btn.addEventListener('click', handleMapToggle);
  });

  window.addEventListener('resize', handleResize);
}

function handleResize() {
  invalidateMapSize();
}

/* ============ THEME ============ */
function loadThemePreference() {
  const saved = localStorage.getItem('dashboard-theme') || 'dark';
  setTheme(saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
  localStorage.setItem('dashboard-theme', next);
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const thumb = document.querySelector('.toggle-thumb');
  thumb.textContent = theme === 'dark' ? '🌙' : '☀️';
  invalidateMapSize();
}

/* ============ MAP TOGGLE ============ */
function handleMapToggle(e) {
  const type = e.target.dataset.tile;
  document.querySelectorAll('.map-toggle-btn').forEach(b => b.classList.remove('active'));
  e.target.classList.add('active');
  setTileLayer(type);
  invalidateMapSize();
}

/* ============ SIDEBAR MOBILE ============ */
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('active');
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  sidebar.classList.remove('open');
  overlay.classList.remove('active');
}

/* ============ DATE ============ */
function updateCurrentDate() {
  const now = new Date();
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  document.getElementById('current-date').textContent = now.toLocaleDateString('th-TH', options);
}

/* ============ SUMMARY ============ */
function updateSummary() {
  const passCount = MOCK_DATA.filter(f => isPass(f.current)).length;
  const failCount = MOCK_DATA.length - passCount;

  document.getElementById('total-count').textContent = MOCK_DATA.length;
  document.getElementById('pass-count').textContent = passCount;
  document.getElementById('fail-count').textContent = failCount;
}

/* ============ FACTORY LIST ============ */
function renderFactoryList(factories) {
  const list = document.getElementById('factory-list');

  if (factories.length === 0) {
    list.innerHTML = `
      <div style="text-align:center;padding:30px;color:var(--text-muted);font-size:0.85rem;">
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

  if (factoryMarkers[id]) {
    factoryMarkers[id].openPopup();
  }

  if (window.innerWidth <= 900) {
    closeSidebar();
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

/* ============ DETAIL PANEL ============ */
function showDetail(factory) {
  const panel = document.getElementById('detail-panel');
  panel.classList.remove('hidden');

  document.getElementById('detail-name').textContent = factory.name;
  document.getElementById('detail-name-th').textContent = `${factory.nameTh} — ${factory.industry}`;
  document.getElementById('detail-industry').textContent = factory.industry;

  renderParamGrid(factory);
  renderTrendChart(factory);

  invalidateMapSize();
}

function renderParamGrid(factory) {
  const d = factory.current;
  const checks = getParamChecks(d);

  const params = [
    { key: 'bod',  label: 'BOD',         value: d.bod,  unit: 'mg/L', pass: checks.bod,  standard: '≤ 20 mg/L' },
    { key: 'cod',  label: 'COD',         value: d.cod,  unit: 'mg/L', pass: checks.cod,  standard: '≤ 120 mg/L' },
    { key: 'do',   label: 'DO',          value: d.do,   unit: 'mg/L', pass: checks.do,   standard: '≥ 2 mg/L' },
    { key: 'ph',   label: 'pH',          value: d.ph,   unit: '',     pass: checks.ph,   standard: '6.0 – 9.0' },
    { key: 'temp', label: 'Temperature', value: d.temp, unit: '°C',   pass: checks.temp, standard: '≤ 40 °C' }
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
  invalidateMapSize();
}

document.addEventListener('DOMContentLoaded', initApp);
