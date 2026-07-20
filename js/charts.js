let trendChart = null;

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

function renderTrendChart(factory) {
  const ctx = document.getElementById('trend-chart');
  if (!ctx) return;

  if (trendChart) {
    trendChart.destroy();
    trendChart = null;
  }

  const history = factory.history;
  const labels = history.map(h => h.dateShort);
  const colors = getChartColors();
  const hasOil = history[0].oil !== undefined;

  const datasets = [
    {
      label: 'BOD',
      data: history.map(h => h.bod),
      borderColor: '#d4a017',
      backgroundColor: 'rgba(212, 160, 23, 0.08)',
      borderWidth: 2,
      tension: 0.35,
      fill: true,
      pointRadius: 2,
      pointHoverRadius: 5,
      pointBackgroundColor: '#d4a017',
      pointBorderColor: colors.pointBorder,
      pointBorderWidth: 1.5,
      yAxisID: 'y'
    },
    {
      label: 'COD',
      data: history.map(h => h.cod),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.06)',
      borderWidth: 2,
      tension: 0.35,
      fill: false,
      pointRadius: 2,
      pointHoverRadius: 5,
      pointBackgroundColor: '#3b82f6',
      pointBorderColor: colors.pointBorder,
      pointBorderWidth: 1.5,
      yAxisID: 'y1'
    },
    {
      label: 'DO',
      data: history.map(h => h.do),
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34, 197, 94, 0.06)',
      borderWidth: 2,
      tension: 0.35,
      fill: false,
      pointRadius: 2,
      pointHoverRadius: 5,
      pointBackgroundColor: '#22c55e',
      pointBorderColor: colors.pointBorder,
      pointBorderWidth: 1.5,
      yAxisID: 'y'
    },
    {
      label: 'pH',
      data: history.map(h => h.ph),
      borderColor: '#a855f7',
      backgroundColor: 'rgba(168, 85, 247, 0.06)',
      borderWidth: 2,
      tension: 0.35,
      fill: false,
      pointRadius: 2,
      pointHoverRadius: 5,
      pointBackgroundColor: '#a855f7',
      pointBorderColor: colors.pointBorder,
      pointBorderWidth: 1.5,
      yAxisID: 'y'
    },
    {
      label: 'Temp',
      data: history.map(h => h.temp),
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.06)',
      borderWidth: 2,
      borderDash: [5, 3],
      tension: 0.35,
      fill: false,
      pointRadius: 2,
      pointHoverRadius: 5,
      pointBackgroundColor: '#ef4444',
      pointBorderColor: colors.pointBorder,
      pointBorderWidth: 1.5,
      yAxisID: 'y1'
    }
  ];

  if (history[0].tds !== undefined) {
    datasets.push({
      label: 'TDS',
      data: history.map(h => h.tds),
      borderColor: '#06b6d4',
      borderWidth: 1.5,
      tension: 0.35,
      fill: false,
      pointRadius: 2,
      pointHoverRadius: 4,
      pointBackgroundColor: '#06b6d4',
      pointBorderColor: colors.pointBorder,
      pointBorderWidth: 1,
      yAxisID: 'y2',
      borderDash: [3, 2]
    });
  }

  if (history[0].tss !== undefined) {
    datasets.push({
      label: 'TSS',
      data: history.map(h => h.tss),
      borderColor: '#f97316',
      borderWidth: 1.5,
      tension: 0.35,
      fill: false,
      pointRadius: 2,
      pointHoverRadius: 4,
      pointBackgroundColor: '#f97316',
      pointBorderColor: colors.pointBorder,
      pointBorderWidth: 1,
      yAxisID: 'y2',
      borderDash: [6, 3]
    });
  }

  if (hasOil) {
    datasets.push({
      label: 'Oil',
      data: history.map(h => h.oil),
      borderColor: '#84cc16',
      borderWidth: 1.5,
      tension: 0.35,
      fill: false,
      pointRadius: 2,
      pointHoverRadius: 4,
      pointBackgroundColor: '#84cc16',
      pointBorderColor: colors.pointBorder,
      pointBorderWidth: 1,
      yAxisID: 'y2',
      borderDash: [2, 2]
    });
  }

  trendChart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 500 },
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          position: 'top',
          align: 'start',
          labels: {
            color: colors.text,
            font: { size: 9, family: 'Segoe UI, system-ui, sans-serif' },
            padding: 6,
            usePointStyle: true,
            pointStyleWidth: 6,
            boxHeight: 5
          }
        },
        tooltip: {
          backgroundColor: colors.tooltipBg,
          titleColor: colors.tooltipTitle,
          bodyColor: colors.tooltipBody,
          borderColor: colors.tooltipBorder,
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
          titleFont: { weight: '600' },
          bodySpacing: 6,
          callbacks: {
            title: function (items) {
              return `วันที่ ${items[0].label}`;
            },
            label: function (context) {
              const label = context.dataset.label || '';
              const value = context.parsed.y;
              return `  ${label}: ${value}`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: colors.textMuted,
            font: { size: 10 }
          },
          grid: {
            color: colors.grid,
            drawBorder: false
          }
        },
        y: {
          position: 'left',
          title: {
            display: true,
            text: 'BOD / DO / pH',
            color: colors.textMuted,
            font: { size: 10 }
          },
          ticks: {
            color: colors.textMuted,
            font: { size: 10 }
          },
          grid: {
            color: colors.grid,
            drawBorder: false
          }
        },
        y1: {
          position: 'right',
          title: {
            display: true,
            text: 'COD / Temp',
            color: colors.textMuted,
            font: { size: 10 }
          },
          ticks: {
            color: colors.textMuted,
            font: { size: 10 }
          },
          grid: {
            drawOnChartArea: false
          }
        },
        y2: {
          display: false,
          position: 'right',
          ticks: {
            color: colors.textMuted,
            font: { size: 9 }
          },
          grid: {
            drawOnChartArea: false
          }
        }
      }
    }
  });
}
