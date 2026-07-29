const UPLOAD_STORAGE_KEY = 'wq-dashboard-historical';

function openUploadModal() {
  if (!isAdmin) return;
  document.getElementById('upload-modal-overlay').classList.remove('hidden');
  resetUploadSteps();
}

function closeUploadModal() {
  document.getElementById('upload-modal-overlay').classList.add('hidden');
  resetUploadSteps();
}

function resetUploadSteps() {
  document.getElementById('upload-step-1').classList.remove('hidden');
  document.getElementById('upload-step-2').classList.add('hidden');
  document.getElementById('upload-step-3').classList.add('hidden');
  document.getElementById('upload-file-input').value = '';
  document.getElementById('upload-year').value = '';
  document.getElementById('upload-error').classList.add('hidden');
}

document.getElementById('upload-modal-overlay').addEventListener('click', function(e) {
  if (e.target === this) closeUploadModal();
});

const dropzone = document.getElementById('upload-dropzone');
const fileInput = document.getElementById('upload-file-input');

dropzone.addEventListener('click', () => fileInput.click());

dropzone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropzone.classList.add('dragover');
});

dropzone.addEventListener('dragleave', () => {
  dropzone.classList.remove('dragover');
});

dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) handleFileUpload(file);
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) handleFileUpload(file);
});

function handleFileUpload(file) {
  const yearInput = document.getElementById('upload-year').value.trim();
  if (!yearInput || isNaN(parseInt(yearInput))) {
    showUploadError('กรุณาใส่ปี พ.ศ. ก่อนเลือกไฟล์');
    return;
  }

  const year = parseInt(yearInput);

  if (!file.name.match(/\.xlsx?$/i)) {
    showUploadError('กรุณาเลือกไฟล์ .xlsx หรือ .xls เท่านั้น');
    return;
  }

  document.getElementById('upload-step-1').classList.add('hidden');
  document.getElementById('upload-step-2').classList.remove('hidden');

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      parseExcelFile(workbook, year, file.name);
    } catch (err) {
      showUploadError('ไม่สามารถอ่านไฟล์ได้: ' + err.message);
      document.getElementById('upload-step-1').classList.remove('hidden');
      document.getElementById('upload-step-2').classList.add('hidden');
    }
  };
  reader.readAsArrayBuffer(file);
}

function showUploadError(msg) {
  const el = document.getElementById('upload-error');
  el.textContent = msg;
  el.classList.remove('hidden');
}

function parseExcelFile(workbook, year, fileName) {
  const monthMap = { 'ม.ค.': 0, 'ก.พ.': 1, 'มี.ค.': 2, 'เม.ย.': 3, 'พ.ค.': 4, 'มิ.ย.': 5, 'ก.ค.': 6, 'ส.ค.': 7, 'ก.ย.': 8, 'ต.ค.': 9, 'พ.ย.': 10, 'ธ.ค.': 11 };

  let allRows = [];
  let headers = [];

  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    if (json.length < 2) return;

    const firstRow = json[0];
    const headerRow = firstRow.map(h => String(h || '').trim());

    const nameIdx = headerRow.findIndex(h => /โรงงาน|Factory|Name|ชื่อ/i.test(h));
    if (nameIdx === -1) return;

    for (let r = 1; r < json.length; r++) {
      const row = json[r];
      if (!row || !row[nameIdx]) continue;

      const factoryName = String(row[nameIdx] || '').trim();
      if (!factoryName) continue;

      const rowData = { name: factoryName, months: {} };

      headerRow.forEach((h, ci) => {
        if (ci === nameIdx) return;
        const monthNum = parseMonthLabel(h);
        if (monthNum !== null && row[ci] !== undefined) {
          rowData.months[monthNum] = parseFloat(row[ci]) || 0;
        }
      });

      allRows.push(rowData);
    }

    if (allRows.length === 0) {
      for (let r = 1; r < json.length; r++) {
        const row = json[r];
        if (!row || !row[0]) continue;

        const factoryName = String(row[0] || '').trim();
        if (!factoryName) continue;

        const rowData = { name: factoryName, months: {} };
        for (let c = 1; c < row.length; c++) {
          const monthNum = parseMonthLabel(headerRow[c]);
          if (monthNum !== null && row[c] !== undefined) {
            rowData.months[monthNum] = parseFloat(row[c]) || 0;
          }
        }
        allRows.push(rowData);
      }
    }
  });

  if (allRows.length === 0) {
    showUploadError('ไม่พบข้อมูลโรงงานในไฟล์ กรุณาตรวจสอบรูปแบบไฟล์');
    document.getElementById('upload-step-1').classList.remove('hidden');
    document.getElementById('upload-step-2').classList.add('hidden');
    return;
  }

  displayUploadResult(allRows, year, fileName);
}

function parseMonthLabel(label) {
  if (!label) return null;
  const s = String(label).trim();
  const monthPatterns = [
    { re: /ม\.ค\.|jan/i, m: 0 },
    { re: /ก\.พ\.|feb/i, m: 1 },
    { re: /มี\.ค\.|mar/i, m: 2 },
    { re: /เม\.ย\.|apr/i, m: 3 },
    { re: /พ\.ค\.|may/i, m: 4 },
    { re: /มิ\.ย\.|jun/i, m: 5 },
    { re: /ก\.ค\.|jul/i, m: 6 },
    { re: /ส\.ค\.|aug/i, m: 7 },
    { re: /ก\.ย\.|sep/i, m: 8 },
    { re: /ต\.ค\.|oct/i, m: 9 },
    { re: /พ\.ย\.|nov/i, m: 10 },
    { re: /ธ\.ค\.|dec/i, m: 11 }
  ];
  for (const p of monthPatterns) {
    if (p.re.test(s)) return p.m;
  }
  return null;
}

function displayUploadResult(rows, year, fileName) {
  document.getElementById('upload-step-2').classList.add('hidden');
  document.getElementById('upload-step-3').classList.remove('hidden');

  document.getElementById('upload-preview-count').textContent = `${rows.length} โรงงาน`;

  let tableHTML = '<table><thead><tr><th>โรงงาน</th>';
  const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const monthCount = Math.min(12, Math.max(...rows.map(r => Object.keys(r.months).length).filter(n => n > 0)) || 6);
  for (let i = 0; i < monthCount; i++) {
    tableHTML += `<th>${monthNames[i]}</th>`;
  }
  tableHTML += '</tr></thead><tbody>';

  rows.forEach(row => {
    tableHTML += `<tr><td style="white-space:nowrap;font-weight:600;">${row.name}</td>`;
    for (let i = 0; i < monthCount; i++) {
      const val = row.months[i] !== undefined ? row.months[i] : '-';
      tableHTML += `<td>${val}</td>`;
    }
    tableHTML += '</tr>';
  });
  tableHTML += '</tbody></table>';

  document.getElementById('upload-preview-table').innerHTML = tableHTML;

  const code = generateMockDataCode(rows, year);
  document.getElementById('upload-code-output').value = code;
}

function generateMockDataCode(rows, year) {
  const lines = [];
  lines.push(`// ===== ข้อมูลย้อนหลัง ปี ${year} (${year - 543}) =====`);
  lines.push(`// ไฟล์ต้นฉบับ: stat${String(year - 543).slice(-2)}.xlsx`);
  lines.push(`// เพิ่มลงในแต่ละ factory object ใน MOCK_DATA:`);
  lines.push('');

  rows.forEach(row => {
    const bom = [], cod = [], ss = [], ph = [], temp = [];
    const monthCount = Math.max(...Object.keys(row.months).map(Number).filter(n => !isNaN(n))) + 1;

    for (let i = 0; i < monthCount; i++) {
      const v = row.months[i];
      bom.push(v !== undefined ? v : 'null');
    }

    lines.push(`// ${row.name}`);
    lines.push(`monthlyData_${year}: {`);
    lines.push(`  BOD: [${bom.join(', ')}]`);
    lines.push(`},`);
    lines.push('');
  });

  return lines.join('\n');
}

function copyUploadCode() {
  const textarea = document.getElementById('upload-code-output');
  textarea.select();
  navigator.clipboard.writeText(textarea.value).then(() => {
    const btn = document.querySelector('.upload-copy-btn');
    btn.textContent = '✓ คัดลอกแล้ว!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = '📋 คัดลอกโค้ด';
      btn.classList.remove('copied');
    }, 2000);
  });
}

function saveUploadedData() {
  try {
    const code = document.getElementById('upload-code-output').value;
    const yearMatch = code.match(/ปี (\d+)/);
    if (!yearMatch) return;

    const year = yearMatch[1];
    const saved = JSON.parse(localStorage.getItem(UPLOAD_STORAGE_KEY) || '{}');
    saved[year] = { code, savedAt: new Date().toISOString() };
    localStorage.setItem(UPLOAD_STORAGE_KEY, JSON.stringify(saved));

    const btn = document.querySelector('.upload-save-local-btn');
    const orig = btn.textContent;
    btn.textContent = '✓ บันทึกแล้ว!';
    btn.style.background = 'var(--pass)';
    setTimeout(() => {
      btn.textContent = orig;
    }, 2000);
  } catch (e) {
    alert('เกิดข้อผิดพลาด: ' + e.message);
  }
}

function loadHistoricalData() {
  try {
    return JSON.parse(localStorage.getItem(UPLOAD_STORAGE_KEY) || '{}');
  } catch (e) {
    return {};
  }
}
