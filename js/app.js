let selectedFactoryId = null;
let isAdmin = false;
const displayFactories = MOCK_DATA.filter(f => f.hasData !== false);

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function initApp() {
  initMap();

  displayFactories.forEach(factory => {
    addFactoryMarker(factory);
  });

  if (typeof MH_DATA !== 'undefined') {
    MH_DATA.forEach(mh => { addMHMarker(mh); });
    renderMHList(MH_DATA);
  }

  renderFactoryList(displayFactories);
  updateSummary();
  updateCurrentDate();
  loadThemePreference();

  document.getElementById('search-factory').addEventListener('input', handleSearch);
  document.getElementById('close-detail').addEventListener('click', closeDetail);
  document.getElementById('close-mh-detail').addEventListener('click', closeMHDetail);
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
  document.getElementById('sidebar-toggle').addEventListener('click', toggleSidebar);
  document.getElementById('sidebar-overlay').addEventListener('click', closeSidebar);

  document.querySelectorAll('.map-toggle-btn').forEach(btn => {
    btn.addEventListener('click', handleMapToggle);
  });

  document.getElementById('admin-btn').addEventListener('click', openAdminLogin);
  document.getElementById('admin-login-cancel').addEventListener('click', closeAdminLogin);
  document.getElementById('admin-login-ok').addEventListener('click', attemptAdminLogin);
  document.getElementById('admin-modal-overlay').addEventListener('click', function(e) {
    if (e.target === this) closeAdminLogin();
  });
  document.getElementById('admin-logout-btn').addEventListener('click', adminLogout);
  document.getElementById('admin-password').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') attemptAdminLogin();
  });

  window.addEventListener('resize', handleResize);

  // Load historical data in background, then re-setup year selector if a factory is selected
  if (typeof loadHistoricalData === 'function') {
    loadHistoricalData().then(data => {
      if (data) {
        console.log('Historical data loaded:', Object.keys(data).length, 'factories');
        if (selectedFactoryId) {
          const f = MOCK_DATA.find(x => x.id === selectedFactoryId);
          if (f) setupHistoryYearSelector(f);
        }
      }
    });
  }
}

function handleResize() {
  invalidateMapSize();
}

/* ============ ADMIN ============ */
function openAdminLogin() {
  if (isAdmin) {
    adminLogout();
    return;
  }
  document.getElementById('admin-modal-overlay').classList.remove('hidden');
  document.getElementById('admin-password').value = '';
  document.getElementById('admin-login-error').classList.add('hidden');
  setTimeout(() => document.getElementById('admin-password').focus(), 100);
}

function closeAdminLogin() {
  document.getElementById('admin-modal-overlay').classList.add('hidden');
}

function attemptAdminLogin() {
  const pw = document.getElementById('admin-password').value.trim();
  if (pw === '1975') {
    isAdmin = true;
    document.body.classList.add('admin-mode');
    document.getElementById('admin-bar').classList.remove('hidden');
    document.getElementById('admin-btn').classList.add('active');
    closeAdminLogin();
    enableCoordinatePicker();
  } else {
    document.getElementById('admin-login-error').classList.remove('hidden');
    document.getElementById('admin-password').value = '';
    document.getElementById('admin-password').focus();
  }
}

function adminLogout() {
  isAdmin = false;
  document.body.classList.remove('admin-mode');
  document.getElementById('admin-bar').classList.add('hidden');
  document.getElementById('admin-btn').classList.remove('active');
  disableCoordinatePicker();
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
  const passCount = displayFactories.filter(f => isPass(f.current)).length;
  const failCount = displayFactories.length - passCount;

  document.getElementById('total-count').textContent = displayFactories.length;
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
    const hasCurrent = !!factory.current;
    const pass = hasCurrent ? isPass(factory.current) : null;
    const isActive = selectedFactoryId === factory.id;
    const photoHTML = factory.photo
      ? `<img class="factory-item-photo" src="${escapeHtml(factory.photo)}" alt="${escapeHtml(factory.name)}" loading="lazy" onerror="this.style.display='none'">`
      : `<div class="factory-item-photo-placeholder">🏭</div>`;

    return `
      <div class="factory-item ${isActive ? 'active' : ''}"
           data-id="${factory.id}"
           onclick="selectFactory(${factory.id})">
        ${photoHTML}
        <div class="factory-item-info">
          <div class="factory-item-name">${escapeHtml(factory.name)}</div>
          <div class="factory-item-type">${escapeHtml(factory.industry)}</div>
        </div>
        <div class="status-indicator ${hasCurrent ? (pass ? 'pass' : 'fail') : 'no-data'}"
             title="${hasCurrent ? (pass ? 'ผ่านเกณฑ์' : 'ไม่ผ่านเกณฑ์') : 'ยังไม่มีข้อมูล'}"></div>
      </div>
    `;
  }).join('');
}

function handleSearch(e) {
  const term = e.target.value.toLowerCase().trim();

  if (currentLayer === 'manhole') {
    if (!term) { renderMHList(MH_DATA); return; }
    const filtered = MH_DATA.filter(m =>
      m.name.toLowerCase().includes(term) || m.nameTh.includes(term) || m.zone.includes(term)
    );
    renderMHList(filtered);
    return;
  }

  if (!term) {
    renderFactoryList(displayFactories);
    return;
  }

  const filtered = displayFactories.filter(f =>
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
  showDetail(factory);
  highlightFactory(id);

  setTimeout(() => {
    if (factoryMarkers[id]) {
      factoryMarkers[id].openPopup();
    }
  }, 100);

  if (window.innerWidth <= 900) {
    closeSidebar();
  }
}

function getFilteredFactories() {
  const term = (document.getElementById('search-factory').value || '').toLowerCase().trim();
  if (!term) return displayFactories;
  return displayFactories.filter(f =>
    f.name.toLowerCase().includes(term) ||
    f.nameTh.includes(term) ||
    f.industry.includes(term)
  );
}

/* ============ DETAIL PANEL ============ */
function showDetail(factory) {
  const panel = document.getElementById('detail-panel');
  const sidebar = document.getElementById('sidebar');
  panel.classList.remove('hidden');
  sidebar.classList.add('has-detail');

  document.getElementById('detail-name').textContent = factory.name;
  document.getElementById('detail-name-th').textContent = `${factory.nameTh} — ${factory.industry}`;
  document.getElementById('detail-industry').textContent = factory.industry;

  // แสดงเดือน/ปี ของผลตรวจวัด
  const dateLabel = document.getElementById('detail-date-label');
  if (dateLabel && factory.current && factory.monthlyData && factory.monthlyData.BOD) {
    const fullMonthNames = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    const lastIdx = factory.monthlyData.BOD.length - 1;
    const year = typeof DATA_YEAR !== 'undefined' ? DATA_YEAR : 2569;
    const dateText = `📊 ผลตรวจวัด ณ เดือน${fullMonthNames[lastIdx]} ${year}`;
    dateLabel.textContent = dateText;
    dateLabel.style.display = 'block';
  } else if (dateLabel) {
    dateLabel.style.display = 'none';
  }

  const coordEl = document.getElementById('detail-coords');
  if (coordEl) {
    if (isAdmin) {
      coordEl.innerHTML = `<strong>พิกัด:</strong> ${factory.lat}, ${factory.lng} <span style="color:var(--accent-yellow);font-size:0.7rem;">(คลิกแผนที่เพื่อแก้)</span>`;
    } else {
      coordEl.textContent = `พิกัด: ${factory.lat}, ${factory.lng}`;
    }
  }

  const photoEl = document.getElementById('detail-photo');
  if (photoEl) {
    if (factory.photo) {
      photoEl.src = factory.photo;
      photoEl.style.display = 'block';
      photoEl.onerror = function() { this.style.display = 'none'; };
    } else {
      photoEl.style.display = 'none';
    }
  }

  renderParamGrid(factory);
  try { renderChartSummary(factory, 'chart-summary'); } catch(e) {}

  // Setup history year selector
  setupHistoryYearSelector(factory);
  renderTrendChart(factory);

  setTimeout(() => {
    if (map) map.invalidateSize();
  }, 200);
}

function renderChartSummary(factory, containerId) {
  const el = document.getElementById(containerId);
  if (!el || !factory.current) {
    if (el) el.innerHTML = '';
    return;
  }

  const d = factory.current;
  const checks = getParamChecks(d);
  const failed = [];

  if (!checks.bod) failed.push(`BOD ${d.bod} mg/L (เกณฑ์ ≤ 120)`);
  if (!checks.cod) failed.push(`COD ${d.cod} mg/L (เกณฑ์ ≤ 500)`);
  if (!checks.do) failed.push(`DO ${d.do} mg/L (เกณฑ์ ≥ 2)`);
  if (!checks.ph) failed.push(`pH ${d.ph} (เกณฑ์ 5.5–9.0)`);
  if (!checks.temp) failed.push(`Temp ${d.temp}°C (เกณฑ์ ≤ 45)`);
  if (!checks.tds) failed.push(`TDS ${d.tds} mg/L (เกณฑ์ ≤ 3000)`);
  if (!checks.tss) failed.push(`TSS ${d.tss} mg/L (เกณฑ์ ≤ 200)`);
  if (!checks.oil) failed.push(`FOG ${d.oil} mg/L (เกณฑ์ ≤ 10)`);

  const dl = factory.belowDL || {};
  const dlParams = Object.keys(dl).filter(p => dl[p] && dl[p].some(Boolean));

  if (failed.length === 0) {
    el.className = 'chart-summary pass';
    el.innerHTML = '<div class="summary-title">✓ ผ่านกฎหมายทุกรายการ</div>' +
      (dlParams.length ? '<div class="summary-detail" style="color:#94a3b8;margin-top:4px">◇ = ต่ำกว่า Detection Limit (' + dlParams.join(', ') + ')</div>' : '');
  } else {
    el.className = 'chart-summary fail';
    el.innerHTML = `<div class="summary-title">✗ มี ${failed.length} รายการเกินมาตรฐาน</div>
      <div class="summary-detail">${failed.join(' · ')}</div>` +
      (dlParams.length ? '<div class="summary-detail" style="color:#94a3b8;margin-top:4px">◇ = ต่ำกว่า Detection Limit (' + dlParams.join(', ') + ')</div>' : '');
  }
}

function renderExpandChartSummary(factory) {
  renderChartSummary(factory, 'chart-expand-summary');
}

function renderParamGrid(factory) {
  const d = factory.current;
  const checks = getParamChecks(d);

  const params = [
    { key: 'bod',  label: 'BOD',         value: d.bod,  unit: 'mg/L', pass: checks.bod,  standard: '≤ 120 mg/L' },
    { key: 'cod',  label: 'COD',         value: d.cod,  unit: 'mg/L', pass: checks.cod,  standard: '≤ 500 mg/L' },
    { key: 'do',   label: 'DO',          value: d.do,   unit: 'mg/L', pass: checks.do,   standard: '≥ 2 mg/L' },
    { key: 'ph',   label: 'pH',          value: d.ph,   unit: '',     pass: checks.ph,   standard: '5.5 – 9.0' },
    { key: 'temp', label: 'Temperature', value: d.temp, unit: '°C',   pass: checks.temp, standard: '≤ 45 °C' }
  ];

  if (d.tds !== undefined) params.push({ key: 'tds', label: 'TDS', value: d.tds, unit: 'mg/L', pass: checks.tds, standard: '≤ 3000 mg/L' });
  if (d.tss !== undefined) params.push({ key: 'tss', label: 'TSS', value: d.tss, unit: 'mg/L', pass: checks.tss, standard: '≤ 200 mg/L' });
  if (d.oil !== undefined) params.push({ key: 'oil', label: 'FOG', value: d.oil, unit: 'mg/L', pass: checks.oil, standard: '≤ 10 mg/L' });

  const grid = document.getElementById('param-grid');
  grid.innerHTML = params.map(p => {
    const ps = typeof PARAM_STYLES !== 'undefined' ? PARAM_STYLES[p.label] : null;
    const borderColor = ps ? ps.color : 'var(--border)';
    return `
    <div class="param-card ${p.key === 'temp' ? 'full-width' : ''}" style="border-left:3px solid ${borderColor};">
      <div class="param-label" style="color:${borderColor};">${p.label}</div>
      <div class="param-value ${p.pass ? 'pass' : 'fail'}">
        ${escapeHtml(p.value)}<span class="param-unit">${p.unit}</span>
      </div>
      <div class="param-status ${p.pass ? 'pass' : 'fail'}">
        ${p.pass ? '✓ ผ่านเกณฑ์' : '✗ ไม่ผ่านเกณฑ์'} (${p.standard})
      </div>
    </div>`;
  }).join('');
}

/* ============ HISTORY YEAR SELECTOR ============ */
let currentHistoryYear = null;

function setupHistoryYearSelector(factory) {
  const container = document.getElementById('chart-year-selector');
  const select = document.getElementById('history-year-select');
  if (!container || !select) return;

  const years = getHistoryYears(factory.name);
  if (!years || years.length === 0) {
    // If historical data hasn't loaded yet, wait for it
    if (historicalData === null && typeof loadHistoricalData === 'function') {
      container.style.display = 'none';
      loadHistoricalData().then(data => {
        if (data && selectedFactoryId === factory.id) {
          setupHistoryYearSelector(factory);
        }
      });
    } else {
      container.style.display = 'none';
      currentHistoryYear = null;
    }
    return;
  }

  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.gap = '6px';
  container.style.marginBottom = '6px';

  const currentVal = select.value ? Number(select.value) : null;

  select.innerHTML = years.slice().reverse().map(y => {
    const buddhist = y + 543;
    const isCurrent = y === (typeof DATA_YEAR !== 'undefined' ? DATA_YEAR - 543 : 2026);
    return `<option value="${y}" ${y === currentVal ? 'selected' : isCurrent && !currentVal ? 'selected' : ''}>${buddhist} (${y})</option>`;
  }).join('');

  currentHistoryYear = Number(select.value);
}

function onHistoryYearChange(yearStr) {
  currentHistoryYear = Number(yearStr);
  if (!selectedFactoryId) return;
  const factory = MOCK_DATA.find(f => f.id === selectedFactoryId);
  if (!factory) return;

  renderTrendChart(factory);
  try { renderChartSummary(factory, 'chart-summary'); } catch(e) {}

  // Also update expand chart if overlay is open
  const overlay = document.getElementById('chart-expand-overlay');
  if (overlay && !overlay.classList.contains('hidden')) {
    // Sync expand year selector
    const expandSelect = document.getElementById('history-year-select-expand');
    if (expandSelect) expandSelect.value = yearStr;
    try { renderExpandChartSummary(factory); } catch(e) {}
    try { renderExpandChart(factory); } catch(e) {}
  }
}

function getSelectedHistoryYear() {
  return currentHistoryYear;
}

function navHistoryYear(delta) {
  const select = document.getElementById('history-year-select');
  if (!select || select.options.length === 0) return;
  const idx = select.selectedIndex;
  const newIdx = Math.max(0, Math.min(select.options.length - 1, idx + delta));
  if (newIdx !== idx) {
    select.selectedIndex = newIdx;
    onHistoryYearChange(select.value);
  }
}

function navExpandYear(delta) {
  const select = document.getElementById('history-year-select-expand');
  if (!select || select.options.length === 0) return;
  const idx = select.selectedIndex;
  const newIdx = Math.max(0, Math.min(select.options.length - 1, idx + delta));
  if (newIdx !== idx) {
    select.selectedIndex = newIdx;
    onExpandYearChange(select.value);
  }
}

function closeDetail() {
  const panel = document.getElementById('detail-panel');
  const sidebar = document.getElementById('sidebar');
  panel.classList.add('hidden');
  sidebar.classList.remove('has-detail');
  selectedFactoryId = null;
  resetHighlights();
  renderFactoryList(displayFactories);
  invalidateMapSize();
}

/* ============ CHART EXPAND ============ */
let expandChartInstance = null;

function expandChart() {
  if (!selectedFactoryId) return;
  const factory = MOCK_DATA.find(f => f.id === selectedFactoryId);
  if (!factory) return;

  const overlay = document.getElementById('chart-expand-overlay');
  if (!overlay) return;

  overlay.classList.remove('hidden');
  document.getElementById('chart-expand-title').textContent = `📈 ${factory.name} — แนวโน้มค่ารายเดือนย้อนหลัง`;

  // Populate year selector in expand modal
  setupExpandYearSelector(factory);

  try { renderExpandChartSummary(factory); } catch(e) { console.warn('summary err', e); }

  setTimeout(() => {
    try { renderExpandChart(factory); } catch(e) { console.warn('chart err', e); }
  }, 100);
}

function setupExpandYearSelector(factory) {
  const container = document.getElementById('chart-expand-year-selector');
  const select = document.getElementById('history-year-select-expand');
  if (!container || !select) return;

  const years = getHistoryYears(factory.name);
  if (!years || years.length === 0) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.gap = '6px';

  // Sync with detail panel's current selection
  const currentVal = document.getElementById('history-year-select')
    ? Number(document.getElementById('history-year-select').value) : null;

  select.innerHTML = years.slice().reverse().map(y => {
    const buddhist = y + 543;
    const isCurrent = y === (typeof DATA_YEAR !== 'undefined' ? DATA_YEAR - 543 : 2026);
    return `<option value="${y}" ${y === currentVal ? 'selected' : isCurrent && !currentVal ? 'selected' : ''}>${buddhist} (${y})</option>`;
  }).join('');
}

function onExpandYearChange(yearStr) {
  // Sync back to detail panel's year selector
  const detailSelect = document.getElementById('history-year-select');
  if (detailSelect) detailSelect.value = yearStr;
  onHistoryYearChange(yearStr);

  // Re-render expand chart
  if (!selectedFactoryId) return;
  const factory = MOCK_DATA.find(f => f.id === selectedFactoryId);
  if (!factory) return;
  try { renderExpandChartSummary(factory); } catch(e) {}
  try { renderExpandChart(factory); } catch(e) {}
}

function closeExpandChart() {
  document.getElementById('chart-expand-overlay').classList.add('hidden');
  if (expandChartInstance) {
    expandChartInstance.destroy();
    expandChartInstance = null;
  }
}

document.getElementById('chart-expand-overlay').addEventListener('click', function(e) {
  if (e.target === this) closeExpandChart();
});

/* ============ MANHOLE ============ */
let selectedMHId = null;
let mhTrendChart = null;

function renderMHList(mhs) {
  const list = document.getElementById('mh-list');
  if (!list) return;

  if (mhs.length === 0) {
    list.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-muted);font-size:0.85rem;">ไม่พบจุดตรวจ</div>';
    return;
  }

  list.innerHTML = mhs.map(mh => {
    const pass = isMHPass(mh.current);
    const hasData = !!mh.current;
    const isActive = selectedMHId === mh.id;

    return `
      <div class="factory-item ${isActive ? 'active' : ''}"
           data-id="${mh.id}"
           onclick="selectMH(${mh.id})">
        <div class="factory-item-photo-placeholder">🕳️</div>
        <div class="factory-item-info">
          <div class="factory-item-name">${escapeHtml(mh.name)} <span style="color:var(--text-muted);font-size:0.7rem;">${escapeHtml(mh.nameTh)}</span></div>
          <div class="factory-item-type">${escapeHtml(mh.zone)}</div>
        </div>
        <div class="status-indicator ${hasData ? (pass ? 'pass' : 'fail') : 'no-data'}"
             title="${hasData ? (pass ? 'ผ่านเกณฑ์' : 'ไม่ผ่านเกณฑ์') : 'ยังไม่มีข้อมูล'}"></div>
      </div>
    `;
  }).join('');
}

function selectMH(id) {
  selectedMHId = id;
  const mh = MH_DATA.find(m => m.id === id);
  if (!mh) return;

  const term = (document.getElementById('search-factory').value || '').toLowerCase();
  const filtered = term ? MH_DATA.filter(m =>
    m.name.toLowerCase().includes(term) || m.nameTh.includes(term) || m.zone.includes(term)
  ) : MH_DATA;
  renderMHList(filtered);

  showMHDetail(mh);

  Object.keys(mhMarkers).forEach(key => {
    try { const el = mhMarkers[key].getElement(); if (el) el.classList.remove('selected'); } catch(e) {}
  });
  const marker = mhMarkers[id];
  if (marker) {
    try { const el = marker.getElement(); if (el) el.classList.add('selected'); } catch(e) {}
    map.panTo(marker.getLatLng(), { animate: false });
  }
}

function showMHDetail(mh) {
  const panel = document.getElementById('mh-detail-panel');
  const factoryPanel = document.getElementById('detail-panel');
  const sidebar = document.getElementById('sidebar');

  factoryPanel.classList.add('hidden');
  panel.classList.remove('hidden');
  sidebar.classList.add('has-detail');

  document.getElementById('mh-detail-name').textContent = `${mh.name} — ${mh.nameTh}`;
  document.getElementById('mh-detail-zone').textContent = mh.zone;
  document.getElementById('mh-detail-name-th').textContent = mh.nameTh;

  const coordEl = document.getElementById('mh-detail-coords');
  if (coordEl) coordEl.textContent = `พิกัด: ${mh.lat}, ${mh.lng}`;

  renderMHParamGrid(mh);
  renderMHChartSummary(mh, 'mh-chart-summary');

  if (mh.monthlyData && mh.monthlyData.BOD) {
    renderMHTrendChart(mh);
  }
}

function closeMHDetail() {
  const panel = document.getElementById('mh-detail-panel');
  panel.classList.add('hidden');
  selectedMHId = null;
  document.getElementById('sidebar').classList.remove('has-detail');
}

function renderMHParamGrid(mh) {
  const grid = document.getElementById('mh-param-grid');
  if (!grid) return;
  if (!mh.current) { grid.innerHTML = '<div style="color:var(--text-muted);font-size:0.8rem;padding:10px;">ยังไม่มีข้อมูลตรวจวัด</div>'; return; }

  const d = mh.current;
  const checks = {
    bod: d.bod <= 120, cod: d.cod <= 500, ss: d.tss <= 200,
    ph: d.ph >= 5.5 && d.ph <= 9, fog: !d.fog || d.fog <= 10
  };

  const params = [
    { key: 'bod', label: 'BOD', value: d.bod, unit: 'mg/L', pass: checks.bod, standard: '≤ 120 mg/L' },
    { key: 'cod', label: 'COD', value: d.cod, unit: 'mg/L', pass: checks.cod, standard: '≤ 500 mg/L' },
    { key: 'ss', label: 'SS', value: d.tss, unit: 'mg/L', pass: checks.ss, standard: '≤ 200 mg/L' },
    { key: 'ph', label: 'pH', value: d.ph, unit: '', pass: checks.ph, standard: '5.5 – 9.0' },
  ];
  if (d.fog !== undefined && d.fog > 0) params.push({ key: 'fog', label: 'FOG', value: d.fog, unit: 'mg/L', pass: checks.fog, standard: '≤ 10 mg/L' });

  grid.innerHTML = params.map(p => {
    const ps = typeof PARAM_STYLES !== 'undefined' ? PARAM_STYLES[p.label] : null;
    const borderColor = ps ? ps.color : 'var(--border)';
    return `
    <div class="param-card" style="border-left:3px solid ${borderColor};">
      <div class="param-label" style="color:${borderColor};">${p.label}</div>
      <div class="param-value ${p.pass ? 'pass' : 'fail'}">${escapeHtml(p.value)}<span class="param-unit">${p.unit}</span></div>
      <div class="param-status ${p.pass ? 'pass' : 'fail'}">${p.pass ? '✓ ผ่านเกณฑ์' : '✗ ไม่ผ่านเกณฑ์'} (${p.standard})</div>
    </div>`;
  }).join('');
}

function renderMHChartSummary(mh, containerId) {
  const el = document.getElementById(containerId);
  if (!el || !mh.current) { if (el) el.innerHTML = ''; return; }

  const d = mh.current;
  const checks = { bod: d.bod <= 120, cod: d.cod <= 500, ss: d.tss <= 200, ph: d.ph >= 5.5 && d.ph <= 9, fog: !d.fog || d.fog <= 10 };
  const failed = [];
  if (!checks.bod) failed.push(`BOD ${d.bod} mg/L (เกณฑ์ ≤ 120)`);
  if (!checks.cod) failed.push(`COD ${d.cod} mg/L (เกณฑ์ ≤ 500)`);
  if (!checks.ss) failed.push(`SS ${d.tss} mg/L (เกณฑ์ ≤ 200)`);
  if (!checks.ph) failed.push(`pH ${d.ph} (เกณฑ์ 5.5–9.0)`);
  if (!checks.fog) failed.push(`FOG ${d.fog} mg/L (เกณฑ์ ≤ 10)`);

  if (failed.length === 0) {
    el.className = 'chart-summary pass';
    el.innerHTML = '<div class="summary-title">✓ ผ่านกฎหมายทุกรายการ</div>';
  } else {
    el.className = 'chart-summary fail';
    el.innerHTML = `<div class="summary-title">✗ มี ${failed.length} รายการเกินมาตรฐาน</div>
      <div class="summary-detail">${failed.join(' · ')}</div>`;
  }
}

let mhTrendChartInstance = null;

function renderMHTrendChart(mh) {
  if (mhTrendChartInstance) { mhTrendChartInstance.destroy(); mhTrendChartInstance = null; }
  const ctx = document.getElementById('mh-trend-chart');
  if (!ctx || !mh.monthlyData) return;

  const data = buildChartDataFromMonthly(mh.monthlyData, mh.belowDL);
  if (!data) return;

  mhTrendChartInstance = new Chart(ctx, createChartConfig(data, 9));
}

let expandMHChartInstance = null;

function expandMHChart() {
  if (!selectedMHId) return;
  const mh = MH_DATA.find(m => m.id === selectedMHId);
  if (!mh || !mh.monthlyData) return;

  const overlay = document.getElementById('chart-expand-overlay');
  overlay.classList.remove('hidden');
  document.getElementById('chart-expand-title').textContent = `📈 ${mh.name} — ${mh.nameTh}`;

  try { renderExpandChartSummary({ current: mh.current, name: mh.name }, 'chart-expand-summary'); } catch(e) {}

  setTimeout(() => {
    if (expandChartInstance) { expandChartInstance.destroy(); expandChartInstance = null; }
    const ctx = document.getElementById('trend-chart-expand');
    if (!ctx) return;
    const data = buildChartDataFromMonthly(mh.monthlyData, mh.belowDL);
    if (!data) return;
    expandChartInstance = new Chart(ctx, createChartConfig(data, 12));
  }, 100);
}

document.addEventListener('DOMContentLoaded', initApp);
