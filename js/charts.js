let trendChart = null;
const MONTH_LABELS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

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

const PARAM_STYLES = {
  BOD:       { color: '#eab308', bg: 'rgba(234,179,8,0.10)',  dash: null,     width: 2.5, fill: true,  pointR: 4, y: 'y'  },
  COD:       { color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', dash: null,     width: 2.5, fill: false, pointR: 4, y: 'y1' },
  SS:        { color: '#f97316', bg: null,                     dash: [8, 3],   width: 1.8, fill: false, pointR: 3, y: 'y'  },
  pH:        { color: '#a855f7', bg: 'rgba(168,85,247,0.06)', dash: null,     width: 2,   fill: false, pointR: 3, y: 'y3', hidden: true },
  Temp:      { color: '#ef4444', bg: 'rgba(239,68,68,0.06)',  dash: [2, 2],   width: 2,   fill: false, pointR: 3, y: 'y1' },
  TDS:       { color: '#06b6d4', bg: null,                     dash: [10, 4],  width: 1.8, fill: false, pointR: 3, y: 'y2' },
  FOG:       { color: '#22c55e', bg: null,                     dash: [6, 2, 2, 2], width: 1.8, fill: false, pointR: 3, y: 'y2' },
  Surfactant:{ color: '#ec4899', bg: null,                     dash: [4, 4],   width: 1.8, fill: false, pointR: 3, y: 'y2' },
  Color:     { color: '#8b5cf6', bg: null,                     dash: [8, 3, 2, 3], width: 1.8, fill: false, pointR: 3, y: 'y2' },
};

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
  const labels = MONTH_LABELS.slice(0, 12);

  function padTo12(arr) {
    if (!arr) return new Array(12).fill(null);
    const padded = arr.map(v => v);
    while (padded.length < 12) padded.push(null);
    return padded;
  }

  function padDLTo12(arr) {
    if (!arr) return new Array(12).fill(false);
    const padded = arr.map(v => v);
    while (padded.length < 12) padded.push(false);
    return padded;
  }

  const dlPadded = {};
  if (dl) {
    Object.keys(dl).forEach(k => { dlPadded[k] = padDLTo12(dl[k]); });
  }

  const paramMap = { BOD: 'BOD', COD: 'COD', SS: 'SS', pH: 'pH', Temp: 'Temp', TDS: 'TDS', FOG: 'FOG', Surfactant: 'Surfactant', Color: 'Color' };

  const rawDefs = Object.keys(paramMap).filter(k => md[k]).map(k => {
    const s = PARAM_STYLES[k];
    return {
      label: k,
      raw: padTo12(md[k]),
      borderColor: s.color,
      backgroundColor: s.bg || 'transparent',
      borderWidth: s.width,
      borderDash: s.dash || [],
      tension: 0.35,
      fill: s.fill,
      pointRadius: s.pointR,
      pointHoverRadius: s.pointR + 3,
      yAxisID: s.y,
      spanGaps: true,
      hidden: s.hidden || false
    };
  });

  const datasets = rawDefs.map(def => processDatasetWithDL(def.label, def.raw, dlPadded, def, colors));
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
        y: { position: 'left', beginAtZero: true, title: { display: true, text: 'BOD / SS', color: data.colors.textMuted, font: { size: fs } }, ticks: { color: data.colors.textMuted, font: { size: fs } }, grid: { color: data.colors.grid, drawBorder: false } },
        y1: { position: 'right', beginAtZero: true, title: { display: true, text: 'COD / Temp', color: data.colors.textMuted, font: { size: fs } }, ticks: { color: data.colors.textMuted, font: { size: fs } }, grid: { drawOnChartArea: false } },
        y2: { display: false, position: 'right', beginAtZero: true, ticks: { color: data.colors.textMuted, font: { size: fs - 1 } }, grid: { drawOnChartArea: false } },
        y3: { display: false, position: 'left', min: 4, max: 10, ticks: { color: data.colors.textMuted, font: { size: fs - 1 } }, grid: { drawOnChartArea: false } }
      }
    }
  };
}

function renderTrendChart(factory, activeMonthIdx) {
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

  // For historical data, append year to month labels
  if (useHistory) {
    const buddhist = selectedYear + 543;
    data.labels = data.labels.map(l => l + ' ' + buddhist);
  }

  const cfg = createChartConfig(data, 9);
  if (activeMonthIdx != null) {
    const verticalLinePlugin = {
      id: 'factoryVerticalLine',
      afterDraw(chart) {
        const idx = chart.config._factoryActiveIdx;
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
    cfg.plugins = [verticalLinePlugin];
    cfg._factoryActiveIdx = activeMonthIdx;
    cfg.animation = { duration: 300 };
  }
  trendChart = new Chart(ctx, cfg);

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
    // Append year to labels for historical data
    if (data) {
      const buddhist = selectedYear + 543;
      data.labels = data.labels.map(l => l + ' ' + buddhist);
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
      return `เดือน ${items[0].label}`;
    };
  }
  expandChartInstance = new Chart(ctx, cfg);
}
