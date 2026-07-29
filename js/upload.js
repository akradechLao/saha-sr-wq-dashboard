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
dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzone.classList.remove('dragover');
  if (e.dataTransfer.files.length > 0) handleFilesUpload(Array.from(e.dataTransfer.files));
});
fileInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) handleFilesUpload(Array.from(e.target.files));
});

function handleFilesUpload(files) {
  const yearInput = document.getElementById('upload-year').value.trim();
  if (!yearInput || isNaN(parseInt(yearInput))) {
    showUploadError('กรุณาใส่ปี พ.ศ. ก่อนเลือกไฟล์');
    return;
  }

  const validFiles = files.filter(f => f.name.match(/\.xlsx?$/i));
  if (validFiles.length === 0) {
    showUploadError('กรุณาเลือกไฟล์ .xlsx หรือ .xls เท่านั้น');
    return;
  }

  document.getElementById('upload-step-1').classList.add('hidden');
  document.getElementById('upload-step-2').classList.remove('hidden');

  const year = parseInt(yearInput);
  const allRows = [];
  let filesProcessed = 0;

  validFiles.forEach(file => {
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const rows = parseExcelWorkbook(workbook, file.name);
        allRows.push(...rows);
      } catch (err) {
        // ข้ามไฟล์ที่อ่านไม่ได้
      }
      filesProcessed++;
      if (filesProcessed === validFiles.length) {
        if (allRows.length === 0) {
          showUploadError('ไม่พบข้อมูลโรงงานในไฟล์ทั้งหมด กรุณาตรวจสอบรูปแบบไฟล์');
          document.getElementById('upload-step-1').classList.remove('hidden');
          document.getElementById('upload-step-2').classList.add('hidden');
          return;
        }
        generateFullCode(allRows, year, validFiles.map(f => f.name).join(', '));
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

function showUploadError(msg) {
  const el = document.getElementById('upload-error');
  el.textContent = msg;
  el.classList.remove('hidden');
}

function parseMonthLabel(label) {
  if (!label) return null;
  const s = String(label).trim();
  const m = [
    { re: /ม\.ค\.|jan/i, v: 0 }, { re: /ก\.พ\.|feb/i, v: 1 }, { re: /มี\.ค\.|mar/i, v: 2 },
    { re: /เม\.ย\.|apr/i, v: 3 }, { re: /พ\.ค\.|may/i, v: 4 }, { re: /มิ\.ย\.|jun/i, v: 5 },
    { re: /ก\.ค\.|jul/i, v: 6 }, { re: /ส\.ค\.|aug/i, v: 7 }, { re: /ก\.ย\.|sep/i, v: 8 },
    { re: /ต\.ค\.|oct/i, v: 9 }, { re: /พ\.ย\.|nov/i, v: 10 }, { re: /ธ\.ค\.|dec/i, v: 11 }
  ];
  for (const p of m) { if (p.re.test(s)) return p.v; }
  return null;
}

function parseExcelWorkbook(workbook, fileName) {
  const allRows = [];

  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    if (json.length < 2) return;

    const headerRow = json[0].map(h => String(h || '').trim());
    let nameIdx = headerRow.findIndex(h => /โรงงาน|Factory|Name|ชื่อ|ชื่อโรงงาน/i.test(h));

    // fallback: ถ้าหาไม่เจอ ลอง column แรก
    if (nameIdx === -1) nameIdx = 0;

    for (let r = 1; r < json.length; r++) {
      const row = json[r];
      if (!row || !row[nameIdx]) continue;
      const factoryName = String(row[nameIdx]).trim();
      if (!factoryName) continue;

      const rowData = { name: factoryName, months: {} };
      for (let c = 0; c < row.length; c++) {
        if (c === nameIdx) continue;
        const monthNum = parseMonthLabel(headerRow[c]);
        if (monthNum !== null && row[c] !== undefined && row[c] !== '') {
          rowData.months[monthNum] = parseFloat(row[c]) || 0;
        }
      }
      if (Object.keys(rowData.months).length > 0) allRows.push(rowData);
    }
  });

  return allRows;
}

function matchFactoryName(uploadName, mockName) {
  if (!uploadName || !mockName) return false;
  const a = uploadName.toLowerCase().replace(/[^a-z0-9\u0E00-\u0E7F]/g, '');
  const b = mockName.toLowerCase().replace(/[^a-z0-9\u0E00-\u0E7F]/g, '');
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  return false;
}

function generateFullCode(rows, year, fileName) {
  document.getElementById('upload-step-2').classList.add('hidden');
  document.getElementById('upload-step-3').classList.remove('hidden');

  // แสดง preview
  const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const monthCount = Math.min(12, Math.max(...rows.map(r => Object.keys(r.months).length).filter(n => n > 0)) || 6);

  let tableHTML = `<div style="margin-bottom:8px;font-size:0.75rem;color:var(--text-secondary);">
    ตรงกับ <strong id="upload-match-count" style="color:var(--pass);">0</strong> / ${rows.length} โรงงานใน MOCK_DATA
    <span style="color:var(--text-muted);margin-left:8px;">(${fileName})</span>
  </div>`;
  tableHTML += '<table><thead><tr><th>โรงงานในไฟล์</th><th>จับคู่กับ</th>';
  for (let i = 0; i < monthCount; i++) tableHTML += `<th>${monthNames[i]}</th>`;
  tableHTML += '</tr></thead><tbody>';

  let matchCount = 0;
  const matchedFactoryIds = new Set();

  rows.forEach(row => {
    // หา factory ที่ตรงกันใน MOCK_DATA
    let matched = null;
    for (const f of MOCK_DATA) {
      if (matchFactoryName(row.name, f.name) || matchFactoryName(row.name, f.nameTh)) {
        matched = f;
        break;
      }
    }

    const isMatch = !!matched;
    if (isMatch) matchCount++;

    tableHTML += `<tr style="${isMatch ? '' : 'opacity:0.5;'}">`;
    tableHTML += `<td style="font-weight:600;">${row.name}</td>`;
    tableHTML += `<td style="font-size:0.7rem;color:${isMatch ? 'var(--pass)' : 'var(--fail)'};">${isMatch ? matched.name : '❌ ไม่พบ'}</td>`;
    for (let i = 0; i < monthCount; i++) {
      const val = row.months[i] !== undefined ? row.months[i] : '-';
      tableHTML += `<td>${val}</td>`;
    }
    tableHTML += '</tr>';
  });
  tableHTML += '</tbody></table>';

  document.getElementById('upload-preview-table').innerHTML = tableHTML;
  document.getElementById('upload-match-count').textContent = matchCount;

  // Generate full mock-data.js code
  const yearShort = String(year - 543).slice(-2);
  const field = `monthlyData_${year}`;

  let code = `// ===== MOCK_DATA — คุณภาพน้ำเสีย สวนอุตสาหกรรมเครือสหพัฒน์ ศรีราชา =====\n`;
  code += `// อัพเดตอัตโนมัติเมื่อ ${new Date().toLocaleDateString('th-TH')} — ข้อมูลย้อนหลังปี ${year} จากไฟล์ ${fileName}\n\n`;
  code += `const STANDARDS = {\n`;
  code += `  bod:  { max: 120, unit: 'mg/L', label: 'BOD',        method: 'Standard Methods 5210B' },\n`;
  code += `  cod:  { max: 500, unit: 'mg/L', label: 'COD',        method: 'Standard Methods 5220D' },\n`;
  code += `  do:   { min: 2,   unit: 'mg/L', label: 'DO',         method: 'Electrode Method 4500-O' },\n`;
  code += `  ph:   { min: 5.5, max: 9, unit: '-', label: 'pH',     method: 'Electrode Method 4500-H' },\n`;
  code += `  temp: { max: 45,  unit: '°C',   label: 'Temperature', method: 'Thermometric' },\n`;
  code += `  tds:  { max: 3000, unit: 'mg/L', label: 'TDS',        method: 'Conductivity Method' },\n`;
  code += `  tss:  { max: 200, unit: 'mg/L', label: 'TSS',        method: 'Standard Methods 2540D' },\n`;
  code += `  oil:  { max: 10,  unit: 'mg/L', label: 'Oil & Grease', method: 'IR Spectrophotometry' }\n};\n\n`;
  code += `const MOCK_DATA = [\n`;

  let isFirst = true;
  MOCK_DATA.forEach(factory => {
    if (!isFirst) code += `,\n`;
    isFirst = false;

    // หาข้อมูลที่ตรงกัน
    let matchedRow = null;
    for (const row of rows) {
      if (matchFactoryName(row.name, factory.name) || matchFactoryName(row.name, factory.nameTh)) {
        matchedRow = row;
        break;
      }
    }

    code += `  {\n`;
    code += `    id: ${factory.id},\n`;
    code += `    name: '${factory.name}',\n`;
    code += `    nameTh: '${factory.nameTh}',\n`;
    code += `    industry: '${factory.industry}',\n`;
    if (factory.address) code += `    address: '${factory.address}',\n`;
    if (factory.lat !== undefined) code += `    lat: ${factory.lat}, lng: ${factory.lng},\n`;
    if (factory.photo) code += `    photo: '${factory.photo}',\n`;
    if (factory.hasData === false) code += `    hasData: false,\n`;

    // เขียน monthlyData ปัจจุบัน
    if (factory.current) {
      const c = factory.current;
      code += `    current: { bod: ${c.bod}, cod: ${c.cod}, do: ${c.do}, ph: ${c.ph}, temp: ${c.temp}`;
      if (c.tds !== undefined) code += `, tds: ${c.tds}`;
      if (c.tss !== undefined) code += `, tss: ${c.tss}`;
      if (c.oil !== undefined) code += `, oil: ${c.oil}`;
      code += ` },\n`;
    }

    // เขียน monthlyData ปัจจุบัน (ปี 2569)
    if (factory.monthlyData) {
      code += `    monthlyData: ${JSON.stringify(factory.monthlyData, null, 6).replace(/\n/g, '\n      ')},\n`;
    }

    // เพิ่ม monthlyData ย้อนหลัง ถ้ามีข้อมูลที่ตรงกัน
    if (matchedRow) {
      const monthCount = Math.max(...Object.keys(matchedRow.months).map(Number).filter(n => !isNaN(n))) + 1;
      const vals = [];
      for (let i = 0; i < monthCount; i++) {
        vals.push(matchedRow.months[i] !== undefined ? matchedRow.months[i] : 'null');
      }
      code += `    ${field}: [${vals.join(', ')}],\n`;
    }

    // ถ้า factory เดิมมี monthlyData_YYYY อื่นอยู่แล้ว ให้เก็บไว้
    // (ไม่ต้องทำ เพราะข้อมูลเดิมอยู่ใน mock-data.js ต้นฉบับอยู่แล้ว)

    code += `  }`;
  });

  code += `\n];\n`;

  document.getElementById('upload-code-output').value = code;
  document.getElementById('upload-code-output').rows = 20;
}

function copyUploadCode() {
  const textarea = document.getElementById('upload-code-output');
  textarea.select();
  textarea.setSelectionRange(0, 999999);
  navigator.clipboard.writeText(textarea.value).then(() => {
    const btn = document.querySelector('.upload-copy-btn');
    btn.textContent = '✓ คัดลอกแล้ว!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = '📋 คัดลอกโค้ดทั้งหมด';
      btn.classList.remove('copied');
    }, 2000);
  });
}

function saveUploadedData() {
  try {
    const code = document.getElementById('upload-code-output').value;
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mock-data.js';
    a.click();
    URL.revokeObjectURL(url);

    const btn = document.querySelector('.upload-save-local-btn');
    const orig = btn.textContent;
    btn.textContent = '✓ ดาวน์โหลดแล้ว!';
    setTimeout(() => { btn.textContent = orig; }, 2000);
  } catch (e) {
    alert('เกิดข้อผิดพลาด: ' + e.message);
  }
}
