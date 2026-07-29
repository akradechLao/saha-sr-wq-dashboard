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

function renderTrendChart(factory) {
  const ctx = document.getElementById('trend-chart');
  if (!ctx) return;

  if (trendChart) {
    trendChart.destroy();
    trendChart = null;
  }

  const md = factory.monthlyData;
  if (!md || !md.BOD) return;

  const colors = getChartColors();
  const labels = MONTH_LABELS.slice(0, md.BOD.length);

  const datasets = [
    {
      label: 'BOD',
      data: md.BOD,
      borderColor: '#d4a017',
      backgroundColor: 'rgba(212, 160, 23, 0.08)',
      borderWidth: 2,
      tension: 0.35,
      fill: true,
      pointRadius: 3,
      pointHoverRadius: 6,
      pointBackgroundColor: '#d4a017',
      pointBorderColor: colors.pointBorder,
      pointBorderWidth: 1.5,
      yAxisID: 'y'
    },
    {
      label: 'COD',
      data: md.COD,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.06)',
      borderWidth: 2,
      tension: 0.35,
      fill: false,
      pointRadius: 3,
      pointHoverRadius: 6,
      pointBackgroundColor: '#3b82f6',
      pointBorderColor: colors.pointBorder,
      pointBorderWidth: 1.5,
      yAxisID: 'y1'
    }
  ];

  if (md.SS) {
    datasets.push({
      label: 'SS',
      data: md.SS,
      borderColor: '#f97316',
      borderWidth: 1.5,
      tension: 0.35,
      fill: false,
      pointRadius: 2,
      pointHoverRadius: 5,
      pointBackgroundColor: '#f97316',
      pointBorderColor: colors.pointBorder,
      pointBorderWidth: 1,
      yAxisID: 'y',
      borderDash: [4, 2]
    });
  }

  if (md.pH) {
    datasets.push({
      label: 'pH',
      data: md.pH,
      borderColor: '#a855f7',
      backgroundColor: 'rgba(168, 85, 247, 0.06)',
      borderWidth: 2,
      tension: 0.35,
      fill: false,
      pointRadius: 3,
      pointHoverRadius: 5,
      pointBackgroundColor: '#a855f7',
      pointBorderColor: colors.pointBorder,
      pointBorderWidth: 1.5,
      yAxisID: 'y3',
      hidden: true
    });
  }

  if (md.Temp) {
    datasets.push({
      label: 'Temp',
      data: md.Temp,
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
    });
  }

  if (md.TDS) {
    datasets.push({
      label: 'TDS',
      data: md.TDS,
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

  if (md.FOG) {
    datasets.push({
      label: 'FOG',
      data: md.FOG,
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
      animation: { duration: 600 },
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
            font: { size: 11, family: 'Segoe UI, system-ui, sans-serif' },
            padding: 10,
            usePointStyle: true,
            pointStyleWidth: 8,
            boxHeight: 7,
            cursor: 'pointer'
          },
          onHover: function(e) {
            e.native.target.style.cursor = 'pointer';
          }
        },
        tooltip: {
          backgroundColor: colors.tooltipBg,
          titleColor: colors.tooltipTitle,
          bodyColor: colors.tooltipBody,
          borderColor: colors.tooltipBorder,
          borderWidth: 1,
          cornerRadius: 8,
          padding: 14,
          titleFont: { weight: '600', size: 12 },
          bodySpacing: 8,
          bodyFont: { size: 11 },
          callbacks: {
            title: function (items) {
              return `เดือน ${items[0].label} 2569`;
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
            font: { size: 12 }
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
            text: 'BOD / SS',
            color: colors.textMuted,
            font: { size: 11 }
          },
          ticks: {
            color: colors.textMuted,
            font: { size: 11 }
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
            font: { size: 11 }
          },
          ticks: {
            color: colors.textMuted,
            font: { size: 11 }
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
            font: { size: 10 }
          },
          grid: {
            drawOnChartArea: false
          }
        },
        y3: {
          display: false,
          position: 'left',
          min: 4,
          max: 10,
          ticks: {
            color: colors.textMuted,
            font: { size: 10 }
          },
          grid: {
            drawOnChartArea: false
          }
        }
      }
    }
  });
}
