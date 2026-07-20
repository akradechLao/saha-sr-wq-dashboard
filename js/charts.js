let trendChart = null;

function renderTrendChart(factory) {
  const ctx = document.getElementById('trend-chart');
  if (!ctx) return;

  if (trendChart) {
    trendChart.destroy();
    trendChart = null;
  }

  const history = factory.history;
  const labels = history.map(h => h.dateShort);

  const datasets = [
    {
      label: 'BOD (mg/L)',
      data: history.map(h => h.bod),
      borderColor: '#d4a017',
      backgroundColor: 'rgba(212, 160, 23, 0.08)',
      borderWidth: 2.5,
      tension: 0.35,
      fill: true,
      pointRadius: 3,
      pointHoverRadius: 6,
      pointBackgroundColor: '#d4a017',
      pointBorderColor: '#0a0e27',
      pointBorderWidth: 2,
      yAxisID: 'y'
    },
    {
      label: 'COD (mg/L)',
      data: history.map(h => h.cod),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.06)',
      borderWidth: 2,
      tension: 0.35,
      fill: false,
      pointRadius: 3,
      pointHoverRadius: 6,
      pointBackgroundColor: '#3b82f6',
      pointBorderColor: '#0a0e27',
      pointBorderWidth: 2,
      yAxisID: 'y1'
    },
    {
      label: 'DO (mg/L)',
      data: history.map(h => h.do),
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34, 197, 94, 0.06)',
      borderWidth: 2,
      tension: 0.35,
      fill: false,
      pointRadius: 3,
      pointHoverRadius: 6,
      pointBackgroundColor: '#22c55e',
      pointBorderColor: '#0a0e27',
      pointBorderWidth: 2,
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
      pointRadius: 3,
      pointHoverRadius: 6,
      pointBackgroundColor: '#a855f7',
      pointBorderColor: '#0a0e27',
      pointBorderWidth: 2,
      yAxisID: 'y'
    },
    {
      label: 'Temp (°C)',
      data: history.map(h => h.temp),
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.06)',
      borderWidth: 2,
      borderDash: [5, 3],
      tension: 0.35,
      fill: false,
      pointRadius: 3,
      pointHoverRadius: 6,
      pointBackgroundColor: '#ef4444',
      pointBorderColor: '#0a0e27',
      pointBorderWidth: 2,
      yAxisID: 'y1'
    }
  ];

  const annotations = getStandardLines(factory);

  trendChart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          position: 'top',
          align: 'start',
          labels: {
            color: '#94a3b8',
            font: { size: 10.5, family: 'Segoe UI, system-ui, sans-serif' },
            padding: 12,
            usePointStyle: true,
            pointStyleWidth: 8,
            boxHeight: 6
          }
        },
        tooltip: {
          backgroundColor: 'rgba(17, 26, 58, 0.95)',
          titleColor: '#f5d061',
          bodyColor: '#e8e8e8',
          borderColor: '#d4a017',
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
            color: '#64748b',
            font: { size: 10.5 }
          },
          grid: {
            color: 'rgba(30, 41, 59, 0.5)',
            drawBorder: false
          }
        },
        y: {
          position: 'left',
          title: {
            display: true,
            text: 'BOD / DO / pH',
            color: '#64748b',
            font: { size: 10.5 }
          },
          ticks: {
            color: '#64748b',
            font: { size: 10.5 }
          },
          grid: {
            color: 'rgba(30, 41, 59, 0.5)',
            drawBorder: false
          }
        },
        y1: {
          position: 'right',
          title: {
            display: true,
            text: 'COD / Temperature',
            color: '#64748b',
            font: { size: 10.5 }
          },
          ticks: {
            color: '#64748b',
            font: { size: 10.5 }
          },
          grid: {
            drawOnChartArea: false
          }
        }
      }
    }
  });
}

function getStandardLines(factory) {
  return {};
}
