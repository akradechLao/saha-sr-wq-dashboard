/* ============ HISTORICAL DATA LOADER ============ */
let historicalData = null;
let historyLoadPromise = null;

function loadHistoricalData() {
  if (historicalData) return Promise.resolve(historicalData);
  if (historyLoadPromise) return historyLoadPromise;

  historyLoadPromise = fetch('data/water-quality-history.json')
    .then(r => r.json())
    .then(data => {
      historicalData = data;
      return data;
    })
    .catch(err => {
      console.warn('Failed to load historical data:', err);
      historyLoadPromise = null;
      return null;
    });

  return historyLoadPromise;
}

function getHistoryForFactory(factoryName) {
  if (!historicalData) return null;
  return historicalData[factoryName] || null;
}

function getHistoryYears(factoryName) {
  const h = getHistoryForFactory(factoryName);
  return h ? h.years : [];
}

function getHistoryMonths(factoryName, year) {
  const h = getHistoryForFactory(factoryName);
  if (!h || !h.data[year]) return null;
  return h.data[year];
}

function getHistoryDL(factoryName, year) {
  const h = getHistoryForFactory(factoryName);
  if (!h || !h.belowDL || !h.belowDL[year]) return null;
  return h.belowDL[year];
}

const HISTORY_MONTH_NAMES = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

function getHistoryChartLabels(factoryName, year) {
  const months = getHistoryMonths(factoryName, year);
  if (!months) return [];
  return Object.keys(months).sort((a, b) => Number(a) - Number(b)).map(m => HISTORY_MONTH_NAMES[Number(m) - 1]);
}

function getHistoryChartData(factoryName, year, paramName) {
  const months = getHistoryMonths(factoryName, year);
  if (!months) return [];
  return Object.keys(months).sort((a, b) => Number(a) - Number(b)).map(m => {
    const md = months[m];
    return md[paramName] !== undefined ? md[paramName] : null;
  });
}
