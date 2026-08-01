let selectedFactoryId = null;
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
  document.getElementById('mh-nav-prev').addEventListener('click', () => navigateMH(-1));
  document.getElementById('mh-nav-next').addEventListener('click', () => navigateMH(1));
  document.getElementById('mh-month-prev').addEventListener('click', () => navigateMonth(-1));
  document.getElementById('mh-month-next').addEventListener('click', () => navigateMonth(1));
  document.getElementById('factory-month-prev').addEventListener('click', () => navigateFactoryMonth(-1));
  document.getElementById('factory-month-next').addEventListener('click', () => navigateFactoryMonth(1));
  document.getElementById('summary-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeSummary();
  });
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
  document.getElementById('sidebar-toggle').addEventListener('click', toggleSidebar);
  document.getElementById('sidebar-overlay').addEventListener('click', closeSidebar);

  document.querySelectorAll('.map-toggle-btn').forEach(btn => {
    btn.addEventListener('click', handleMapToggle);
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

  factoryCurrentMonthIdx = 0;

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
    coordEl.textContent = `พิกัด: ${factory.lat}, ${factory.lng}`;
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

  const summaryBtn = document.getElementById('factory-summary-btn');
  if (summaryBtn) summaryBtn.style.display = (factory.monthlyData && factory.monthlyData.BOD) ? '' : 'none';

  // Setup history year selector
  setupHistoryYearSelector(factory);
  renderTrendChart(factory, factory.monthlyData && factory.monthlyData.BOD ? factoryCurrentMonthIdx : undefined);
  showFactoryMonthStepper(factory);

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
  factoryCurrentMonthIdx = 0;
  if (!selectedFactoryId) return;
  const factory = MOCK_DATA.find(f => f.id === selectedFactoryId);
  if (!factory) return;

  renderTrendChart(factory, factoryCurrentMonthIdx);
  showFactoryMonthStepper(factory);
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

let factoryCurrentMonthIdx = 0;

function showFactoryMonthStepper(factory) {
  const el = document.getElementById('factory-month-stepper');
  if (!el) return;
  if (!factory.monthlyData || !factory.monthlyData.BOD) { el.style.display = 'none'; return; }
  const count = factory.monthlyData.BOD.length;
  if (count === 0) { el.style.display = 'none'; return; }
  el.style.display = '';
  if (factoryCurrentMonthIdx >= count) factoryCurrentMonthIdx = count - 1;
  updateFactoryMonthStepperUI(count);
  renderFactoryMonthStatus(factory, factoryCurrentMonthIdx);
}

function updateFactoryMonthStepperUI(count) {
  const MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  const label = document.getElementById('factory-month-label');
  const idxEl = document.getElementById('factory-month-idx');
  const prevBtn = document.getElementById('factory-month-prev');
  const nextBtn = document.getElementById('factory-month-next');
  if (!label) return;
  const y = typeof DATA_YEAR !== 'undefined' ? DATA_YEAR : 2569;
  label.textContent = `${MONTHS[factoryCurrentMonthIdx]} ${y}`;
  if (idxEl) idxEl.textContent = `${factoryCurrentMonthIdx + 1} / ${count}`;
  if (prevBtn) prevBtn.style.visibility = factoryCurrentMonthIdx > 0 ? 'visible' : 'hidden';
  if (nextBtn) nextBtn.style.visibility = factoryCurrentMonthIdx < count - 1 ? 'visible' : 'hidden';
}

function navigateFactoryMonth(dir) {
  const factory = MOCK_DATA.find(f => f.id === selectedFactoryId);
  if (!factory || !factory.monthlyData || !factory.monthlyData.BOD) return;
  const count = factory.monthlyData.BOD.length;
  const next = factoryCurrentMonthIdx + dir;
  if (next < 0 || next >= count) return;
  factoryCurrentMonthIdx = next;
  updateFactoryMonthStepperUI(count);
  renderFactoryMonthStatus(factory, next);
  highlightFactoryMonth(next);
}

function highlightFactoryMonth(idx) {
  if (!trendChart) return;
  trendChart.config._factoryActiveIdx = idx;
  trendChart.update('none');
}

function renderFactoryMonthStatus(factory, monthIdx) {
  const el = document.getElementById('factory-month-status');
  if (!el) return;
  if (!factory.monthlyData || !factory.monthlyData.BOD) { el.innerHTML = ''; return; }

  const md = factory.monthlyData;
  const params = [
    { key: 'BOD', label: 'BOD', val: md.BOD ? md.BOD[monthIdx] : null, max: 120, unit: 'mg/L' },
    { key: 'COD', label: 'COD', val: md.COD ? md.COD[monthIdx] : null, max: 500, unit: 'mg/L' },
    { key: 'SS', label: 'SS', val: md.SS ? md.SS[monthIdx] : null, max: 200, unit: 'mg/L' },
    { key: 'pH', label: 'pH', val: md.pH ? md.pH[monthIdx] : null, min: 5.5, max: 9, unit: '' },
    { key: 'FOG', label: 'FOG', val: md.FOG ? md.FOG[monthIdx] : null, max: 10, unit: 'mg/L' },
    { key: 'Temp', label: 'Temp', val: md.Temp ? md.Temp[monthIdx] : null, max: 45, unit: '°C' },
    { key: 'TDS', label: 'TDS', val: md.TDS ? md.TDS[monthIdx] : null, max: 3000, unit: 'mg/L' },
    { key: 'Color', label: 'Color', val: md.Color ? md.Color[monthIdx] : null, max: 200, unit: 'TCU' },
    { key: 'Surfactant', label: 'Surfactant', val: md.Surfactant ? md.Surfactant[monthIdx] : null, max: 20, unit: 'mg/L' },
  ].filter(p => p.val !== null && p.val !== undefined);

  const results = params.map(p => {
    if (p.val === null || p.val === undefined || p.val === '-' || p.val === '—') return { ...p, pass: true, na: true };
    const v = Number(p.val);
    if (isNaN(v)) return { ...p, pass: true, na: true };
    let pass = true;
    if (p.key === 'pH') { pass = v >= p.min && v <= p.max; }
    else { pass = v <= p.max; }
    return { ...p, pass, na: false };
  });

  const allPass = results.every(r => r.pass || r.na);
  const failedCount = results.filter(r => !r.pass).length;
  const MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  const y = typeof DATA_YEAR !== 'undefined' ? DATA_YEAR : 2569;

  let html = `<div class="mh-month-status-card ${allPass ? 'pass' : 'fail'}">`;
  html += `<div class="mh-month-status-title ${allPass ? 'pass' : 'fail'}">`;
  html += allPass ? `✓ ผ่านเกณฑ์ — ${MONTHS[monthIdx]} ${y}` : `✗ ไม่ผ่านเกณฑ์ ${failedCount} รายการ — ${MONTHS[monthIdx]} ${y}`;
  html += '</div>';

  results.forEach(r => {
    if (r.na) return;
    const v = Number(r.val);
    const display = r.key === 'pH' ? v.toFixed(1) : (Number.isInteger(v) ? v : v.toFixed(1));
    const std = r.key === 'pH' ? `${r.min}–${r.max}` : `≤ ${r.max}`;
    html += `<div class="mh-month-param-row">`;
    html += `<span class="mh-month-param-name">${r.label}</span>`;
    html += `<span class="mh-month-param-val ${r.pass ? 'pass' : 'fail'}">${display} ${r.unit}</span>`;
    html += `<span class="mh-month-param-std">${std}</span>`;
    html += `<span class="mh-month-param-badge ${r.pass ? 'pass' : 'fail'}">${r.pass ? '✓' : '✗'}</span>`;
    html += `</div>`;
  });

  html += '</div>';
  el.innerHTML = html;
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

document.getElementById('mh-detail-panel').addEventListener('click', function(e) {
  if (e.target === this) closeMHDetail();
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
           onclick="selectMH('${mh.id}')">
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

  showMHDetail(mh);

  Object.keys(mhMarkers).forEach(key => {
    try { const el = mhMarkers[key].getElement(); if (el) el.classList.remove('selected'); } catch(e) {}
  });
  const marker = mhMarkers[id];
  if (marker) {
    try { const el = marker.getElement(); if (el) el.classList.add('selected'); } catch(e) {}
    map.panTo(marker.getLatLng(), { animate: false });
    setTimeout(() => { marker.openPopup(); }, 100);
  }

  if (window.innerWidth <= 900) {
    closeSidebar();
  }
}

function showMHDetail(mh) {
  const panel = document.getElementById('mh-detail-panel');
  if (!panel) return;
  panel.classList.remove('hidden');

  mhCurrentMonthIdx = 0;

  document.getElementById('mh-detail-name').textContent = `${mh.name} — ${mh.nameTh}`;
  document.getElementById('mh-detail-zone').textContent = mh.zone;
  document.getElementById('mh-detail-name-th').textContent = mh.nameTh;

  const coordEl = document.getElementById('mh-detail-coords');
  if (coordEl) coordEl.textContent = `พิกัด: ${mh.lat}, ${mh.lng}`;

  renderMHParamGrid(mh);
  renderMHChartSummary(mh, 'mh-chart-summary');

  const mhSummaryBtn = document.getElementById('mh-summary-btn');
  if (mhSummaryBtn) mhSummaryBtn.style.display = (mh.monthlyData && mh.monthlyData.BOD) ? '' : 'none';

  const chartArea = document.getElementById('mh-detail-chart');
  if (mh.monthlyData && mh.monthlyData.BOD) {
    if (chartArea && !document.getElementById('mh-trend-chart')) {
      chartArea.innerHTML = '<div class="chart-container"><canvas id="mh-trend-chart"></canvas></div>';
    }
    setTimeout(() => { renderMHTrendChart(mh); }, 50);
  } else {
    if (mhTrendChartInstance) { mhTrendChartInstance.destroy(); mhTrendChartInstance = null; }
    if (chartArea) {
      chartArea.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);font-size:0.85rem;">ไม่มีข้อมูลกราฟ</div>';
    }
    const stepper = document.getElementById('mh-month-stepper');
    if (stepper) stepper.style.display = 'none';
    const statusEl = document.getElementById('mh-month-status');
    if (statusEl) statusEl.innerHTML = '';
  }
  updateMHNavArrows();
}

function closeMHDetail() {
  const panel = document.getElementById('mh-detail-panel');
  if (panel) panel.classList.add('hidden');
  selectedMHId = null;
}

function updateMHNavArrows() {
  const prevBtn = document.getElementById('mh-nav-prev');
  const nextBtn = document.getElementById('mh-nav-next');
  if (!prevBtn || !nextBtn) return;
  const idx = MH_DATA.findIndex(m => m.id === selectedMHId);
  prevBtn.style.visibility = idx > 0 ? 'visible' : 'hidden';
  nextBtn.style.visibility = idx < MH_DATA.length - 1 ? 'visible' : 'hidden';
}

function navigateMH(dir) {
  const idx = MH_DATA.findIndex(m => m.id === selectedMHId);
  if (idx === -1) return;
  const nextIdx = idx + dir;
  if (nextIdx < 0 || nextIdx >= MH_DATA.length) return;
  selectMH(MH_DATA[nextIdx].id);
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
let mhCurrentMonthIdx = 0;

const MH_MONTH_STANDARDS = {
  BOD: 120, COD: 500, SS: 200, pH_max: 9, pH_min: 5.5, FOG: 10, Temp: 45, TDS: 3000,
  Surfactant: 20, Color: 200, TKN: 100, Ni: 1, Zn: 5, 'Cr6+': 0.5, Pb: 0.5
};

function renderMHTrendChart(mh) {
  if (mhTrendChartInstance) { mhTrendChartInstance.destroy(); mhTrendChartInstance = null; }
  const ctx = document.getElementById('mh-trend-chart');
  if (!ctx || !mh.monthlyData) return;

  const data = buildChartDataFromMonthly(mh.monthlyData, mh.belowDL);
  if (!data) return;

  const activeIdx = mhCurrentMonthIdx;
  const verticalLinePlugin = {
    id: 'mhVerticalLine',
    afterDraw(chart) {
      const idx = chart.config._mhActiveIdx;
      if (idx == null) return;
      const meta = chart.getDatasetMeta(0);
      if (!meta || !meta.data[idx]) return;
      const x = meta.data[idx].x;
      const yAxis = chart.scales.y;
      const c = chart.ctx;
      c.save();
      c.beginPath();
      c.setLineDash([5, 3]);
      c.strokeStyle = 'rgba(250,204,21,0.7)';
      c.lineWidth = 2;
      c.moveTo(x, yAxis.top);
      c.lineTo(x, yAxis.bottom);
      c.stroke();
      c.restore();
    }
  };

  const cfg = createChartConfig(data, 9);
  cfg.plugins = [verticalLinePlugin];
  cfg._mhActiveIdx = activeIdx;
  cfg.animation = { duration: 300 };
  mhTrendChartInstance = new Chart(ctx, cfg);

  showMonthStepper(mh);
  renderMHMonthStatus(mh, activeIdx);
  highlightMHMonth(activeIdx);
}

function showMonthStepper(mh) {
  const el = document.getElementById('mh-month-stepper');
  if (!el) return;
  if (!mh.monthlyData || !mh.monthlyData.BOD) { el.style.display = 'none'; return; }
  const count = mh.monthlyData.BOD.length;
  if (count === 0) { el.style.display = 'none'; return; }
  el.style.display = '';
  if (mhCurrentMonthIdx >= count) mhCurrentMonthIdx = count - 1;
  updateMonthStepperUI(count);
}

function updateMonthStepperUI(count) {
  const MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  const label = document.getElementById('mh-month-label');
  const idxEl = document.getElementById('mh-month-idx');
  const prevBtn = document.getElementById('mh-month-prev');
  const nextBtn = document.getElementById('mh-month-next');
  if (!label) return;
  const y = typeof DATA_YEAR !== 'undefined' ? DATA_YEAR : 2569;
  label.textContent = `${MONTHS[mhCurrentMonthIdx]} ${y}`;
  if (idxEl) idxEl.textContent = `${mhCurrentMonthIdx + 1} / ${count}`;
  if (prevBtn) prevBtn.style.visibility = mhCurrentMonthIdx > 0 ? 'visible' : 'hidden';
  if (nextBtn) nextBtn.style.visibility = mhCurrentMonthIdx < count - 1 ? 'visible' : 'hidden';
}

function navigateMonth(dir) {
  const mh = MH_DATA.find(m => m.id === selectedMHId);
  if (!mh || !mh.monthlyData || !mh.monthlyData.BOD) return;
  const count = mh.monthlyData.BOD.length;
  const next = mhCurrentMonthIdx + dir;
  if (next < 0 || next >= count) return;
  mhCurrentMonthIdx = next;
  updateMonthStepperUI(count);
  renderMHMonthStatus(mh, next);
  highlightMHMonth(next);
}

function highlightMHMonth(idx) {
  if (!mhTrendChartInstance) return;
  mhTrendChartInstance.config._mhActiveIdx = idx;
  mhTrendChartInstance.update('none');
}

function renderMHMonthStatus(mh, monthIdx) {
  const el = document.getElementById('mh-month-status');
  if (!el) return;
  if (!mh.monthlyData || !mh.monthlyData.BOD) { el.innerHTML = ''; return; }

  const md = mh.monthlyData;
  const params = [
    { key: 'BOD', label: 'BOD', val: md.BOD ? md.BOD[monthIdx] : null, max: MH_MONTH_STANDARDS.BOD, unit: 'mg/L' },
    { key: 'COD', label: 'COD', val: md.COD ? md.COD[monthIdx] : null, max: MH_MONTH_STANDARDS.COD, unit: 'mg/L' },
    { key: 'SS', label: 'SS', val: md.SS ? md.SS[monthIdx] : null, max: MH_MONTH_STANDARDS.SS, unit: 'mg/L' },
    { key: 'pH', label: 'pH', val: md.pH ? md.pH[monthIdx] : null, min: MH_MONTH_STANDARDS.pH_min, max: MH_MONTH_STANDARDS.pH_max, unit: '' },
    { key: 'FOG', label: 'FOG', val: md.FOG ? md.FOG[monthIdx] : null, max: MH_MONTH_STANDARDS.FOG, unit: 'mg/L' },
    { key: 'Temp', label: 'Temp', val: md.Temp ? md.Temp[monthIdx] : null, max: MH_MONTH_STANDARDS.Temp, unit: '°C' },
    { key: 'TDS', label: 'TDS', val: md.TDS ? md.TDS[monthIdx] : null, max: MH_MONTH_STANDARDS.TDS, unit: 'mg/L' },
  ].filter(p => p.val !== null && p.val !== undefined);

  const results = params.map(p => {
    let pass = true;
    if (p.val === null || p.val === undefined || p.val === '-' || p.val === '—') return { ...p, pass: true, na: true };
    const v = Number(p.val);
    if (isNaN(v)) return { ...p, pass: true, na: true };
    if (p.key === 'pH') { pass = v >= p.min && v <= p.max; }
    else { pass = v <= p.max; }
    return { ...p, pass, na: false };
  });

  const allPass = results.every(r => r.pass || r.na);
  const failedCount = results.filter(r => !r.pass).length;
  const MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  const y = typeof DATA_YEAR !== 'undefined' ? DATA_YEAR : 2569;

  let html = `<div class="mh-month-status-card ${allPass ? 'pass' : 'fail'}">`;
  html += `<div class="mh-month-status-title ${allPass ? 'pass' : 'fail'}">`;
  html += allPass ? `✓ ผ่านเกณฑ์ — ${MONTHS[monthIdx]} ${y}` : `✗ ไม่ผ่านเกณฑ์ ${failedCount} รายการ — ${MONTHS[monthIdx]} ${y}`;
  html += '</div>';

  results.forEach(r => {
    if (r.na) return;
    const v = Number(r.val);
    const display = r.key === 'pH' ? v.toFixed(1) : (Number.isInteger(v) ? v : v.toFixed(1));
    const std = r.key === 'pH' ? `${r.min}–${r.max}` : `≤ ${r.max}`;
    html += `<div class="mh-month-param-row">`;
    html += `<span class="mh-month-param-name">${r.label}</span>`;
    html += `<span class="mh-month-param-val ${r.pass ? 'pass' : 'fail'}">${display} ${r.unit}</span>`;
    html += `<span class="mh-month-param-std">${std}</span>`;
    html += `<span class="mh-month-param-badge ${r.pass ? 'pass' : 'fail'}">${r.pass ? '✓' : '✗'}</span>`;
    html += `</div>`;
  });

  html += '</div>';
  el.innerHTML = html;
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

/* ============ SUMMARY PANEL ============ */
const SUMMARY_STANDARDS = {
  BOD: { max: 120, unit: 'mg/L' },
  COD: { max: 500, unit: 'mg/L' },
  SS: { max: 200, unit: 'mg/L' },
  pH: { min: 5.5, max: 9, unit: '' },
  FOG: { max: 10, unit: 'mg/L' },
  Temp: { max: 45, unit: '°C' },
  TDS: { max: 3000, unit: 'mg/L' },
  Color: { max: 200, unit: 'TCU' },
  Surfactant: { max: 20, unit: 'mg/L' },
};

function checkParamPass(key, val) {
  const s = SUMMARY_STANDARDS[key];
  if (!s || val === null || val === undefined || val === '-' || val === '—') return null;
  const v = Number(val);
  if (isNaN(v)) return null;
  if (key === 'pH') return v >= s.min && v <= s.max;
  return v <= s.max;
}

function openFactorySummary() {
  const factory = MOCK_DATA.find(f => f.id === selectedFactoryId);
  if (!factory) return;

  const titleEl = document.getElementById('summary-title');
  titleEl.textContent = `📊 สรุปสถิติ — ${factory.name} (${factory.nameTh})`;

  const body = document.getElementById('summary-body');
  let html = '';

  const allMonths = [];
  const hist = getHistoryForFactory(factory.name);
  if (hist && hist.years) {
    hist.years.forEach(year => {
      const months = getHistoryMonths(factory.name, year);
      if (months) {
        Object.keys(months).forEach(m => {
          allMonths.push({ year, month: Number(m), data: months[m] });
        });
      }
    });
  }

  if (factory.monthlyData && factory.monthlyData.BOD) {
    const y = typeof DATA_YEAR !== 'undefined' ? DATA_YEAR : 2569;
    factory.monthlyData.BOD.forEach((_, i) => {
      const monthData = {};
      Object.keys(factory.monthlyData).forEach(k => {
        if (factory.monthlyData[k] && factory.monthlyData[k][i] !== undefined) {
          monthData[k] = factory.monthlyData[k][i];
        }
      });
      allMonths.push({ year: y - 543, month: i + 1, data: monthData });
    });
  }

  if (allMonths.length === 0) {
    body.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:40px;">ไม่มีข้อมูลย้อนหลัง</div>';
    document.getElementById('summary-overlay').classList.remove('hidden');
    return;
  }

  const paramKeys = Object.keys(SUMMARY_STANDARDS);
  const stats = {};
  paramKeys.forEach(k => { stats[k] = { pass: 0, fail: 0, na: 0, values: [] }; });

  allMonths.forEach(m => {
    paramKeys.forEach(k => {
      const val = m.data[k];
      if (val === null || val === undefined || val === '-' || val === '—') { stats[k].na++; return; }
      const v = Number(val);
      if (isNaN(v)) { stats[k].na++; return; }
      stats[k].values.push(v);
      const pass = checkParamPass(k, val);
      if (pass === true) stats[k].pass++;
      else if (pass === false) stats[k].fail++;
    });
  });

  const totalMonths = allMonths.length;
  const totalPass = Object.values(stats).reduce((s, p) => s + p.pass, 0);
  const totalFail = Object.values(stats).reduce((s, p) => s + p.fail, 0);
  const totalTests = totalPass + totalFail;
  const overallPct = totalTests > 0 ? Math.round((totalPass / totalTests) * 100) : 0;

  html += '<div class="summary-overview">';
  html += `<div class="summary-stat-card total"><div class="stat-value">${totalMonths}</div><div class="stat-label">เดือนที่วัดทั้งหมด</div></div>`;
  html += `<div class="summary-stat-card pass"><div class="stat-value">${overallPct}%</div><div class="stat-label">อัตราผ่านเกณฑ์</div></div>`;
  html += `<div class="summary-stat-card fail"><div class="stat-value">${totalFail}</div><div class="stat-label">รายการเกินมาตรฐาน</div></div>`;
  html += '</div>';

  html += '<table class="summary-table"><thead><tr>';
  html += '<th>ตัววัด</th><th>เกณฑ์</th><th>จำนวนครั้ง</th><th>ผ่าน / ไม่ผ่าน</th><th></th><th>% ผ่าน</th>';
  html += '</tr></thead><tbody>';

  paramKeys.forEach(k => {
    const s = stats[k];
    const std = SUMMARY_STANDARDS[k];
    const tested = s.pass + s.fail;
    if (tested === 0) return;
    const pct = Math.round((s.pass / tested) * 100);
    const barPassW = tested > 0 ? (s.pass / tested * 100) : 0;
    const barFailW = tested > 0 ? (s.fail / tested * 100) : 0;
    const stdLabel = std.min !== undefined ? `${std.min}–${std.max}` : `≤ ${std.max}`;

    html += '<tr>';
    html += `<td class="param-name">${k}</td>`;
    html += `<td>${stdLabel} ${std.unit}</td>`;
    html += `<td>${tested} ครั้ง</td>`;
    html += `<td><span style="color:var(--success)">${s.pass} ผ่าน</span> / <span style="color:var(--fail)">${s.fail} ไม่ผ่าน</span></td>`;
    html += `<td class="bar-cell"><div class="summary-bar"><div class="summary-bar-pass" style="width:${barPassW}%"></div><div class="summary-bar-fail" style="width:${barFailW}%"></div></div></td>`;
    html += `<td class="summary-pct ${pct >= 80 ? 'good' : 'bad'}">${pct}%</td>`;
    html += '</tr>';
  });

  html += '</tbody></table>';

  if (hist && hist.years && hist.years.length > 1) {
    html += '<div class="summary-year-section">';
    html += '<div class="summary-year-title">📅 สถิติรายปี</div>';
    html += '<div class="summary-year-grid">';

    hist.years.forEach(year => {
      const months = getHistoryMonths(factory.name, year);
      if (!months) return;
      let yPass = 0, yFail = 0;
      Object.values(months).forEach(md => {
        paramKeys.forEach(k => {
          const pass = checkParamPass(k, md[k]);
          if (pass === true) yPass++;
          else if (pass === false) yFail++;
        });
      });
      const buddhist = year + 543;
      html += `<div class="summary-year-card">`;
      html += `<div class="year-label">พ.ศ. ${buddhist} (${year})</div>`;
      html += `<div class="year-detail"><span class="pass-count">✓ ${yPass} ผ่าน</span> · <span class="fail-count">✗ ${yFail} ไม่ผ่าน</span></div>`;
      html += `</div>`;
    });

    if (factory.monthlyData && factory.monthlyData.BOD) {
      const y = typeof DATA_YEAR !== 'undefined' ? DATA_YEAR : 2569;
      let yPass = 0, yFail = 0;
      factory.monthlyData.BOD.forEach((_, i) => {
        paramKeys.forEach(k => {
          const arr = factory.monthlyData[k];
          if (arr && arr[i] !== undefined) {
            const pass = checkParamPass(k, arr[i]);
            if (pass === true) yPass++;
            else if (pass === false) yFail++;
          }
        });
      });
      html += `<div class="summary-year-card" style="border-color:var(--accent-blue);">`;
      html += `<div class="year-label">พ.ศ. ${y} (ปัจจุบัน)</div>`;
      html += `<div class="year-detail"><span class="pass-count">✓ ${yPass} ผ่าน</span> · <span class="fail-count">✗ ${yFail} ไม่ผ่าน</span></div>`;
      html += `</div>`;
    }

    html += '</div></div>';
  }

  body.innerHTML = html;
  document.getElementById('summary-overlay').classList.remove('hidden');
}

function openMHSummary() {
  const mh = MH_DATA.find(m => m.id === selectedMHId);
  if (!mh) return;

  const titleEl = document.getElementById('summary-title');
  titleEl.textContent = `📊 สรุปสถิติ — ${mh.name} (${mh.nameTh})`;

  const body = document.getElementById('summary-body');
  let html = '';

  if (!mh.monthlyData || !mh.monthlyData.BOD) {
    body.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:40px;">ไม่มีข้อมูลตรวจวัด</div>';
    document.getElementById('summary-overlay').classList.remove('hidden');
    return;
  }

  const md = mh.monthlyData;
  const paramKeys = Object.keys(SUMMARY_STANDARDS);
  const totalMonths = md.BOD.length;
  const y = typeof DATA_YEAR !== 'undefined' ? DATA_YEAR : 2569;
  const MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

  const stats = {};
  paramKeys.forEach(k => { stats[k] = { pass: 0, fail: 0, values: [] }; });

  for (let i = 0; i < totalMonths; i++) {
    paramKeys.forEach(k => {
      const arr = md[k];
      if (!arr || arr[i] === undefined || arr[i] === null) return;
      const val = arr[i];
      if (val === '-' || val === '—') return;
      const v = Number(val);
      if (isNaN(v)) return;
      stats[k].values.push(v);
      const pass = checkParamPass(k, val);
      if (pass === true) stats[k].pass++;
      else if (pass === false) stats[k].fail++;
    });
  }

  const totalPass = Object.values(stats).reduce((s, p) => s + p.pass, 0);
  const totalFail = Object.values(stats).reduce((s, p) => s + p.fail, 0);
  const totalTests = totalPass + totalFail;
  const overallPct = totalTests > 0 ? Math.round((totalPass / totalTests) * 100) : 0;

  html += '<div class="summary-overview">';
  html += `<div class="summary-stat-card total"><div class="stat-value">${totalMonths}</div><div class="stat-label">เดือนที่วัด (ม.ค.–${MONTHS[totalMonths - 1]} ${y})</div></div>`;
  html += `<div class="summary-stat-card pass"><div class="stat-value">${overallPct}%</div><div class="stat-label">อัตราผ่านเกณฑ์</div></div>`;
  html += `<div class="summary-stat-card fail"><div class="stat-value">${totalFail}</div><div class="stat-label">รายการเกินมาตรฐาน</div></div>`;
  html += '</div>';

  html += '<table class="summary-table"><thead><tr>';
  html += '<th>ตัววัด</th><th>เกณฑ์</th><th>ค่าเฉลี่ย</th><th>ผ่าน / ไม่ผ่าน</th><th></th><th>% ผ่าน</th>';
  html += '</tr></thead><tbody>';

  paramKeys.forEach(k => {
    const s = stats[k];
    const std = SUMMARY_STANDARDS[k];
    const tested = s.pass + s.fail;
    if (tested === 0) return;
    const pct = Math.round((s.pass / tested) * 100);
    const barPassW = tested > 0 ? (s.pass / tested * 100) : 0;
    const barFailW = tested > 0 ? (s.fail / tested * 100) : 0;
    const avg = s.values.length > 0 ? (s.values.reduce((a, b) => a + b, 0) / s.values.length) : 0;
    const avgDisplay = k === 'pH' ? avg.toFixed(1) : (Number.isInteger(avg) ? avg : avg.toFixed(1));
    const stdLabel = std.min !== undefined ? `${std.min}–${std.max}` : `≤ ${std.max}`;

    html += '<tr>';
    html += `<td class="param-name">${k}</td>`;
    html += `<td>${stdLabel} ${std.unit}</td>`;
    html += `<td>${avgDisplay}</td>`;
    html += `<td><span style="color:var(--success)">${s.pass} ผ่าน</span> / <span style="color:var(--fail)">${s.fail} ไม่ผ่าน</span></td>`;
    html += `<td class="bar-cell"><div class="summary-bar"><div class="summary-bar-pass" style="width:${barPassW}%"></div><div class="summary-bar-fail" style="width:${barFailW}%"></div></div></td>`;
    html += `<td class="summary-pct ${pct >= 80 ? 'good' : 'bad'}">${pct}%</td>`;
    html += '</tr>';
  });

  html += '</tbody></table>';

  html += '<div class="summary-year-section">';
  html += `<div class="summary-year-title">📅 รายเดือน — พ.ศ. ${y}</div>`;
  html += '<table class="summary-table"><thead><tr><th>เดือน</th>';
  paramKeys.forEach(k => { if (stats[k].pass + stats[k].fail > 0) html += `<th>${k}</th>`; });
  html += '</tr></thead><tbody>';

  for (let i = 0; i < totalMonths; i++) {
    html += `<tr><td style="font-weight:600;">${MONTHS[i]}</td>`;
    paramKeys.forEach(k => {
      const arr = md[k];
      if (!arr || arr[i] === undefined || arr[i] === null) { html += '<td style="color:var(--text-muted)">—</td>'; return; }
      const val = arr[i];
      if (val === '-' || val === '—') { html += '<td style="color:var(--text-muted)">—</td>'; return; }
      const pass = checkParamPass(k, val);
      const v = Number(val);
      const display = k === 'pH' ? v.toFixed(1) : (Number.isInteger(v) ? v : v.toFixed(1));
      const color = pass === true ? 'var(--success)' : pass === false ? 'var(--fail)' : 'var(--text-muted)';
      html += `<td style="color:${color};font-weight:600;">${display}</td>`;
    });
    html += '</tr>';
  }
  html += '</tbody></table></div>';

  body.innerHTML = html;
  document.getElementById('summary-overlay').classList.remove('hidden');
}

function closeSummary() {
  document.getElementById('summary-overlay').classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', initApp);

document.addEventListener('keydown', e => {
  const summaryOverlay = document.getElementById('summary-overlay');
  if (summaryOverlay && !summaryOverlay.classList.contains('hidden')) {
    if (e.key === 'Escape') { closeSummary(); return; }
    return;
  }
  if (selectedMHId) {
    const stepper = document.getElementById('mh-month-stepper');
    const monthVisible = stepper && stepper.style.display !== 'none';
    if (e.key === 'ArrowLeft') { e.preventDefault(); monthVisible ? navigateMonth(-1) : navigateMH(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); monthVisible ? navigateMonth(1) : navigateMH(1); }
    if (e.key === 'Escape') closeMHDetail();
  } else if (selectedFactoryId) {
    const stepper = document.getElementById('factory-month-stepper');
    const monthVisible = stepper && stepper.style.display !== 'none';
    if (monthVisible) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); navigateFactoryMonth(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); navigateFactoryMonth(1); }
      if (e.key === 'Escape') closeDetail();
    }
  }
});
