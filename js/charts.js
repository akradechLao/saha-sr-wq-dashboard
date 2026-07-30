let trendChart = null;
const MONTH_LABELS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.'];

function getChartColors() {
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  return {
    text: isDark ? '#94a3b8' : '#6b7280',
    textMuted: isDark ? '#64748b' : '#9ca3af',
    grid: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(229, 231, 235, 0.8)',
    tooltipBg: isDark ? 'rgba(17, 26, 58, 0.95)' : 'rgba(255, 255, 255, 0.98)',
    tooltipTitle: isDark ? '#f5d061' : '#b8860b',
    tooltipBody: isDark ? '#e8e8e8' : '#1a1a2e',
    tooltipBorder: isDark ? '#d4a017' : '#b8860b',
    pointBorder: isDark ? '#0a0e27' : '#ffffff'
  };
}

const DL_DISPLAY = { BOD: 2, COD: 40, TDS: 3000, SS: 5, FOG: 3, Surfactant: 0.4, Color: 20, Ni: 0.03, TKN: 5, Zn: 0.03, 'Cr6+': 0.05, Pb: 0.03 };

function processDatasetWithDL(label, rawData, belowDL, baseConfig, colors) {
  const dlLimit = DL_DISPLAY[label];
  const hasDL = belowDL && belowDL[label];
  const pointBg = [];
  const pointBorder = [];
  const pointStyles = [];
  const tooltipLabels = [];
  const processedData = [];

  for (let i = 0; i < rawData.length; i++) {
    const val = rawData[i];
    const isDL = hasDL && hasDL[i];
    if (isDL && dlLimit) {
      processedData.push(dlLimit / 2);
      pointBg.push('transparent');
      pointBorder.push(baseConfig.borderColor);
      pointStyles.push('rectRot');
      tooltipLabels.push(`< ${dlLimit}`);
    } else {
      processedData.push(val);
      pointBg.push(baseConfig.borderColor);
      pointBorder.push(colors.pointBorder);
      pointStyles.push('circle');
      tooltipLabels.push(String(val));
    }
  }

  return {
    ...baseConfig,
    data: processedData,
    pointBackgroundColor: pointBg,
    pointBorderColor: pointBorder,
    pointStyle: pointStyles,
    _tooltipLabels: tooltipLabels,
    _dlFlags: hasDL || []
  };
}

function buildChartDataFromMonthly(md, dl) {
  if (!md || !md.BOD) return null;
  const colors = getChartColors();
  const monthCount = md.BOD.length;
  const labels = MONTH_LABELS.slice(0, monthCount);

  const rawDefs = [
    { label: 'BOD', raw: md.BOD, borderColor: '#d4a017', backgroundColor: 'rgba(212, 160, 23, 0.08)', borderWidth: 2, tension: 0.35, fill: true, pointRadius: 3, pointHoverRadius: 6, yAxisID: 'y' },
    { label: 'COD', raw: md.COD, borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.06)', borderWidth: 2, tension: 0.35, fill: false, pointRadius: 3, pointHoverRadius: 6, yAxisID: 'y1' },
    md.SS ? { label: 'SS', raw: md.SS, borderColor: '#f97316', borderWidth: 1.5, tension: 0.35, fill: false, pointRadius: 2, pointHoverRadius: 5, yAxisID: 'y', borderDash: [4, 2] } : null,
    md.pH ? { label: 'pH', raw: md.pH, borderColor: '#a855f7', backgroundColor: 'rgba(168, 85, 247, 0.06)', borderWidth: 2, tension: 0.35, fill: false, pointRadius: 3, pointHoverRadius: 5, yAxisID: 'y3', hidden: true } : null,
    md.Temp ? { label: 'Temp', raw: md.Temp, borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.06)', borderWidth: 2, borderDash: [5, 3], tension: 0.35, fill: false, pointRadius: 2, pointHoverRadius: 5, yAxisID: 'y1' } : null,
    md.TDS ? { label: 'TDS', raw: md.TDS, borderColor: '#06b6d4', borderWidth: 1.5, tension: 0.35, fill: false, pointRadius: 2, pointHoverRadius: 4, yAxisID: 'y2', borderDash: [3, 2] } : null,
    md.FOG ? { label: 'FOG', raw: md.FOG, borderColor: '#84cc16', borderWidth: 1.5, tension: 0.35, fill: false, pointRadius: 2, pointHoverRadius: 4, yAxisID: 'y2', borderDash: [2, 2] } : null,
    md.Surfactant ? { label: 'Surfactant', raw: md.Surfactant, borderColor: '#ec4899', borderWidth: 1.5, tension: 0.35, fill: false, pointRadius: 2, pointHoverRadius: 4, yAxisID: 'y2', borderDash: [6, 2] } : null,
    md.Color ? { label: 'Color', raw: md.Color, borderColor: '#8b5cf6', borderWidth: 1.5, tension: 0.35, fill: false, pointRadius: 2, pointHoverRadius: 4, yAxisID: 'y2', borderDash: [2, 4] } : null,
  ].filter(Boolean);

  const datasets = rawDefs.map(def => processDatasetWithDL(def.label, def.raw, dl || {}, def, colors));
  return { labels, datasets, colors };
}

function buildChartData(factory) {
  return buildChartDataFromMonthly(factory.monthlyData, factory.belowDL);
}

function buildHistoryChartData(factory, year) {
  const months = getHistoryMonths(factory.name, year);
  if (!months) return null;

  const monthKeys = Object.keys(months).sort((a, b) => Number(a) - Number(b));
  const md = {};
  monthKeys.forEach(m => {
    const d = months[m];
    Object.keys(d).forEach(k => {
      if (!md[k]) md[k] = [];
      md[k].push(d[k]);
    });
  });

  const histDL = getHistoryDL(factory.name, year) || {};
  const dl = {};
  monthKeys.forEach((m, i) => {
    const mDL = histDL[m];
    if (mDL) {
      Object.keys(mDL).forEach(k => {
        if (!dl[k]) dl[k] = new Array(monthKeys.length).fill(false);
        dl[k][i] = true;
      });
    }
  });

  return buildChartDataFromMonthly(md, dl);
}

function createChartConfig(data, fontSize) {
  const fs = fontSize || 10;
  return {
    type: 'line',
    data: { labels: data.labels, datasets: data.datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 500 },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'top',
          align: 'start',
          labels: {
            color: data.colors.text,
            font: { size: fs, family: 'Segoe UI, system-ui, sans-serif' },
            padding: fs < 11 ? 6 : 10,
            usePointStyle: true,
            pointStyleWidth: fs < 11 ? 6 : 8,
            boxHeight: fs < 11 ? 5 : 7,
            cursor: 'pointer'
          },
          onHover: function(e) { e.native.target.style.cursor = 'pointer'; }
        },
        tooltip: {
          backgroundColor: data.colors.tooltipBg,
          titleColor: data.colors.tooltipTitle,
          bodyColor: data.colors.tooltipBody,
          borderColor: data.colors.tooltipBorder,
          borderWidth: 1,
          cornerRadius: 8,
          padding: fs < 11 ? 12 : 14,
          titleFont: { weight: '600' },
          bodySpacing: fs < 11 ? 6 : 8,
          callbacks: {
            title: function (items) { const y = typeof DATA_YEAR !== 'undefined' ? DATA_YEAR : 2569; return `เดือน ${items[0].label} ${y}`; },
            label: function (context) {
              const dlLabels = context.dataset._tooltipLabels;
              const val = dlLabels ? dlLabels[context.dataIndex] : context.parsed.y;
              const isDL = context.dataset._dlFlags && context.dataset._dlFlags[context.dataIndex];
              return `  ${context.dataset.label}: ${val}${isDL ? ' (ต่ำกว่า DL)' : ''}`;
            }
          }
        }
      },
      scales: {
        x: { ticks: { color: data.colors.textMuted, font: { size: fs } }, grid: { color: data.colors.grid, drawBorder: false } },
        y: { position: 'left', title: { display: true, text: 'BOD / SS', color: data.colors.textMuted, font: { size: fs } }, ticks: { color: data.colors.textMuted, font: { size: fs } }, grid: { color: data.colors.grid, drawBorder: false } },
        y1: { position: 'right', title: { display: true, text: 'COD / Temp', color: data.colors.textMuted, font: { size: fs } }, ticks: { color: data.colors.textMuted, font: { size: fs } }, grid: { drawOnChartArea: false } },
        y2: { display: false, position: 'right', ticks: { color: data.colors.textMuted, font: { size: fs - 1 } }, grid: { drawOnChartArea: false } },
        y3: { display: false, position: 'left', min: 4, max: 10, ticks: { color: data.colors.textMuted, font: { size: fs - 1 } }, grid: { drawOnChartArea: false } }
      }
    }
  };
}

function renderTrendChart(factory) {
  if (trendChart) { trendChart.destroy(); trendChart = null; }
  const ctx = document.getElementById('trend-chart');
  if (!ctx) return;

  const selectedYear = typeof getSelectedHistoryYear === 'function' ? getSelectedHistoryYear() : null;
  const histYears = typeof getHistoryYears === 'function' ? getHistoryYears(factory.name) : [];
  const useHistory = selectedYear && histYears.includes(selectedYear);

  let data;
  if (useHistory) {
    data = buildHistoryChartData(factory, selectedYear);
  } else {
    data = buildChartData(factory);
  }
  if (!data) return;

  // For historical data with >12 months, show YYYY labels
  if (useHistory && data.labels.length > 12) {
    const buddhist = selectedYear + 543;
    const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const months = getHistoryMonths(factory.name, selectedYear);
    if (months) {
      const monthKeys = Object.keys(months).sort((a, b) => Number(a) - Number(b));
      data.labels = monthKeys.map(m => monthNames[Number(m) - 1] + ' ' + buddhist);
    }
  }

  trendChart = new Chart(ctx, createChartConfig(data, 9));

  // Override tooltip year for historical data
  if (useHistory && trendChart) {
    const buddhist = selectedYear + 543;
    trendChart.options.plugins.tooltip.callbacks.title = function(items) {
      return `เดือน ${items[0].label} ${buddhist}`;
    };
    trendChart.update('none');
  }
}

function renderExpandChart(factory) {
  if (expandChartInstance) { expandChartInstance.destroy(); expandChartInstance = null; }
  const ctx = document.getElementById('trend-chart-expand');
  if (!ctx) return;

  const selectedYear = typeof getSelectedHistoryYear === 'function' ? getSelectedHistoryYear() : null;
  const histYears = typeof getHistoryYears === 'function' ? getHistoryYears(factory.name) : [];
  const useHistory = selectedYear && histYears.includes(selectedYear);

  let data;
  if (useHistory) {
    data = buildHistoryChartData(factory, selectedYear);
    // Update labels with year for historical data
    if (data && data.labels.length > 12) {
      const buddhist = selectedYear + 543;
      const months = getHistoryMonths(factory.name, selectedYear);
      if (months) {
        const monthKeys = Object.keys(months).sort((a, b) => Number(a) - Number(b));
        data.labels = monthKeys.map(m => HISTORY_MONTH_NAMES[Number(m) - 1] + ' ' + buddhist);
      }
    }
  } else {
    data = buildChartData(factory);
  }
  if (!data) return;

  const cfg = createChartConfig(data, 12);
  // Override tooltip title to show correct year
  if (useHistory) {
    const buddhist = selectedYear + 543;
    cfg.options.plugins.tooltip.callbacks.title = function(items) {
      return `เดือน ${items[0].label} ${buddhist}`;
    };
  }
  expandChartInstance = new Chart(ctx, cfg);
}
