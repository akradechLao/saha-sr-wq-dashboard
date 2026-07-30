import xlrd, sys, json, re
from datetime import datetime, timedelta
sys.stdout.reconfigure(encoding='utf-8')

wb = xlrd.open_workbook('data/water-quality-history.xls')

DL = {
    'BOD': 2, 'COD': 40, 'FOG': 3, 'SS': 5, 'Surfactant': 0.4,
    'Color': 20, 'Ni': 0.03, 'TKN': 5, 'Zn': 0.03, 'Zinc': 0.03,
    'Cr6+': 0.05, 'Pb': 0.03, 'TDS': 3000, 'Chloride': 2000,
    'Ammonia': 1, 'Formaldehyde': 0.5, 'Phenol': 1, 'Sulfide': 1,
    'Copper': 0.03, 'Temperature': 45
}

PARAM_MAP = {
    'BOD5': 'BOD', 'BOD': 'BOD', 'COD': 'COD', 'DS': 'TDS', 'TDS': 'TDS',
    'SS': 'SS', 'pH': 'pH', 'Temperature': 'Temp', 'Temp': 'Temp',
    'Grease&Oil': 'FOG', 'Grease and Oil': 'FOG', 'Grease and oil': 'FOG',
    'Color': 'Color', 'Surfactant': 'Surfactant', 'Cr6+': 'Cr6+', 'Cr+6': 'Cr6+',
    'Pb': 'Pb', 'Ni': 'Ni', 'Zn': 'Zinc', 'Zinc': 'Zinc', 'TKN': 'TKN',
    'Chloride': 'Chloride', 'Choride': 'Chloride', 'Ammonia': 'Ammonia',
    'Folmaldehyde': 'Formaldehyde', 'Formaldehyde': 'Formaldehyde',
    'Phenol': 'Phenol', 'Sulfide': 'Sulfide', 'Cu': 'Copper',
}

SHEET_TO_FACTORY = {
    'RUC': {'id': 58, 'nameEn': 'Raja Uchino'},
    'RUC (2)': {'id': 58, 'nameEn': 'Raja Uchino'},
    'SSC': {'id': 60, 'nameEn': 'Sahachol Food Supplies'},
    'TAS': {'id': 47, 'nameEn': 'Thai Asahi Kasei Spandex'},
    'TF': {'id': 15, 'nameEn': 'Thai President Foods'},
    'TSE2': {'id': 14, 'nameEn': 'Thai Samsung Electronics'},
    'TSE1 ': {'id': 14, 'nameEn': 'Thai Samsung Electronics'},
    'ST(FG)': {'id': 65, 'nameEn': 'Saha Seiren'},
    'SEHWA': {'id': 64, 'nameEn': 'Saha Sewa'},
    'TSCC': {'id': 13, 'nameEn': 'Thai Silicate Chemical'},
    'SJI': {'id': 44, 'nameEn': 'Thai Kobashi'},
    'SJI (น้ำล้น)': {'id': 44, 'nameEn': 'Thai Kobashi'},
    'YHK': {'id': 1, 'nameEn': 'Yamahatsu (Thailand)'},
    'TK': {'id': None, 'nameEn': 'Torii Thai'},
    'TJC ': {'id': None, 'nameEn': 'Toyo Textile Thai'},
    'OIL': {'id': None, 'nameEn': 'Oil (Thailand)'},
    'TPC2': {'id': 90, 'nameEn': 'TPCs fac1'},
    'TPC3': {'id': 91, 'nameEn': 'TPCs fac3'},
    'TORA1010': {'id': 85, 'nameEn': 'ETC office 999'},
    'SFS': {'id': None, 'nameEn': 'Shin Foam Sci'},
    'KTS2': {'id': None, 'nameEn': 'Kita Tsukushi'},
    'MAPP': {'id': None, 'nameEn': 'Maha Chula Arkart'},
    'ARS (โรงใหม่)': {'id': None, 'nameEn': 'Alliance Recycling'},
    'LCT': {'id': None, 'nameEn': 'L.C. Tong Thai'},
    'LCT (507)': {'id': None, 'nameEn': 'L.C. Tong Thai 507'},
    'LCT (507-4)': {'id': None, 'nameEn': 'L.C. Tong Thai 507/4'},
    'TYSK': {'id': None, 'nameEn': 'Thai Kobunshi'},
    'SCG(EXist)': {'id': 80, 'nameEn': 'SCG Exist'},
    'SCG(Expan)': {'id': 80, 'nameEn': 'SCG Expan'},
    'ARS': {'id': None, 'nameEn': 'Alliance Recycling old'},
    'TSC': {'id': None, 'nameEn': 'TSC'},
    'ICF(EXQ)': {'id': None, 'nameEn': 'ICF EXQ'},
    'ATECH': {'id': None, 'nameEn': 'Atech'},
    'NFT': {'id': None, 'nameEn': 'NFT'},
    'PCB': {'id': None, 'nameEn': 'PCB'},
    'KDS': {'id': None, 'nameEn': 'KDS'},
    'PAF (ICF)': {'id': None, 'nameEn': 'PAF ICF'},
    'GGC': {'id': None, 'nameEn': 'GGC'},
    'TLC': {'id': None, 'nameEn': 'TLC'},
    'TNS': {'id': None, 'nameEn': 'TNS'},
    'TSB': {'id': None, 'nameEn': 'TSB'},
    'mOT': {'id': None, 'nameEn': 'mOT'},
    'TCT': {'id': None, 'nameEn': 'TCT'},
    'TNL': {'id': None, 'nameEn': 'TNL'},
    'SDC2': {'id': None, 'nameEn': 'SDC2'},
    'ETCWT': {'id': None, 'nameEn': 'ETCWT'},
    'KKG': {'id': 89, 'nameEn': 'K&K Package'},
}

KNOWN_PARAMS = {'BOD5', 'COD', 'DS', 'pH', 'SS', 'Temperature', 'Grease&Oil',
                'Grease and Oil', 'Grease and oil', 'Color', 'Surfactant', 'Cr6+',
                'Pb', 'Ni', 'Zn', 'Zinc', 'TKN', 'Chloride', 'Choride',
                'Ammonia', 'Folmaldehyde', 'Formaldehyde', 'Phenol', 'Sulfide',
                'Cu', 'TDS', 'BOD', 'Temp'}


def cell_to_float(cell):
    """Force-read any cell as float, handling xlrd date misclassification."""
    v = cell.value
    if v is None or v == '':
        return None
    if isinstance(v, (int, float)):
        return float(v)
    s = str(v).strip()
    if s == '' or s == '-' or s == ' -':
        return None
    try:
        return float(s)
    except ValueError:
        return None


def detect_param_row(ws):
    for r in range(min(6, ws.nrows)):
        found = False
        for c in range(1, ws.ncols):
            v = str(ws.cell_value(r, c)).strip()
            if v in KNOWN_PARAMS:
                found = True
                break
        if found:
            return r
    return None


def excel_serial_to_ym(v):
    """Convert Excel serial number (float) to (year, month)."""
    try:
        iv = int(v)
        if iv < 30000 or iv > 60000:
            return None, None
        dt = datetime(1899, 12, 30) + timedelta(days=iv)
        return dt.year, dt.month
    except:
        return None, None


def parse_value(raw, param_name):
    """Parse value: < X -> X/2, ND -> DL, numeric -> float."""
    if raw is None:
        return None, False

    if isinstance(raw, str):
        s = raw.strip()
    else:
        s = str(raw).strip()

    if s == '' or s == '-' or s == ' -':
        return None, False

    m = re.match(r'^<\s*([\d.]+)', s)
    if m:
        limit = float(m.group(1))
        return round(limit / 2, 4), True

    if s.upper() == 'ND':
        dl_val = DL.get(param_name)
        return float(dl_val) if dl_val else None, True

    try:
        return float(s), False
    except ValueError:
        return None, False


def parse_sheet(sheet_name, ws):
    param_row = detect_param_row(ws)
    if param_row is None:
        return None

    params = []
    for c in range(1, ws.ncols):
        raw = str(ws.cell_value(param_row, c)).strip()
        mapped = PARAM_MAP.get(raw, raw)
        params.append(mapped)

    data = {}
    below_dl = {}

    for r in range(param_row + 2, ws.nrows):
        date_val = cell_to_float(ws.cell(r, 0))
        if date_val is None:
            continue
        year, month = excel_serial_to_ym(date_val)
        if not year or not month:
            continue
        if year < 2000 or year > 2100:
            continue
        if year == 5209:
            continue

        month_data = {}
        month_dl = {}
        has_data = False

        for c, param in enumerate(params):
            col_idx = c + 1
            if col_idx >= ws.ncols:
                break
            raw = cell_to_float(ws.cell(r, col_idx))
            raw_str = str(ws.cell_value(r, col_idx)).strip() if ws.cell_value(r, col_idx) is not None else ''

            # Check for < or ND in the original text
            if raw_str.startswith('<') or raw_str.upper() == 'ND' or raw_str == '-' or raw_str == ' -':
                val, is_dl = parse_value(raw_str, param)
            elif raw is not None:
                val, is_dl = raw, False
            else:
                val, is_dl = None, False

            if val is not None:
                month_data[param] = round(val, 4)
                has_data = True
            if is_dl:
                month_dl[param] = True

        if has_data:
            ym_key = str(month)
            if year not in data:
                data[year] = {}
            data[year][ym_key] = month_data
            if month_dl:
                if year not in below_dl:
                    below_dl[year] = {}
                below_dl[year][ym_key] = month_dl

    return data, below_dl


# Process all sheets
all_data = {}
skipped = ['story', 'Sheet3']

for sheet_name in wb.sheet_names():
    if sheet_name in skipped:
        continue

    ws = wb.sheet_by_name(sheet_name)
    if ws.nrows < 6:
        continue

    factory_info = SHEET_TO_FACTORY.get(sheet_name.strip(), {
        'id': None, 'name': sheet_name.strip(), 'nameEn': sheet_name.strip()
    })

    result = parse_sheet(sheet_name, ws)
    if result is None:
        print(f'SKIP (no params): {sheet_name}')
        continue

    data, below_dl = result
    if not data:
        print(f'SKIP (no data): {sheet_name}')
        continue

    years = sorted(data.keys())
    total_months = sum(len(data[y]) for y in years)

    factory_key = factory_info['nameEn']
    if factory_key in all_data:
        existing = all_data[factory_key]
        for y in data:
            if y not in existing['data']:
                existing['data'][y] = data[y]
            else:
                for m in data[y]:
                    existing['data'][y][m] = data[y][m]
        if below_dl:
            if 'belowDL' not in existing:
                existing['belowDL'] = {}
            for y in below_dl:
                if y not in existing['belowDL']:
                    existing['belowDL'][y] = below_dl[y]
                else:
                    for m in below_dl[y]:
                        existing['belowDL'][y][m] = below_dl[y][m]
        existing['years'] = sorted(existing['data'].keys())
        existing['totalMonths'] = sum(len(existing['data'][y]) for y in existing['years'])
        print(f'MERGE: {sheet_name:20s} -> {factory_info["nameEn"]:40s}  now years={existing["years"][0]}-{existing["years"][-1]}  months={existing["totalMonths"]}')
    else:
        all_data[factory_key] = {
            'sheetName': sheet_name.strip(),
            'factoryId': factory_info['id'],
            'nameEn': factory_info['nameEn'],
            'years': years,
            'totalMonths': total_months,
            'data': data,
            'belowDL': below_dl
        }
        print(f'OK: {sheet_name:20s} -> {factory_info["nameEn"]:40s}  years={years[0]}-{years[-1]}  months={total_months}')

with open('data/water-quality-history.json', 'w', encoding='utf-8') as f:
    json.dump(all_data, f, ensure_ascii=False, indent=2)

print(f'\nTotal: {len(all_data)} factories exported')
