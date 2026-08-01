# Dashboard คุณภาพน้ำเสีย — สวนอุตสาหกรรมเครือสหพัฒน์ ศรีราชา

> ระบบติดตามคุณภาพน้ำเสียออกจากโรงงานในสวนอุตสาหกรรม เครือสหพัฒน์ ศรีราชา จ. ชลบุรี

## ฟีเจอร์

- **แผนที่จริง** — OpenStreetMap (Street) + ArcGIS (Satellite) สลับได้
- **Circle Marker** — สีเขียว (ผ่าน) / แดง (ไม่ผ่าน) + glow effect + SVG icons
- **Manhole Layer** — 18 จุดตรวจ Manhole พร้อม toggle สลับระหว่างโรงงาน/Manhole
- **Hover Popup** — ชี้ที่โรงงาน/จุดตรวจ → แสดงชื่อ + ค่าพารามิเตอร์น้ำเสีย
- **Sidebar รายชื่อ** — รายชื่อโรงงาน + จุดตรวจ Manhole + ค้นหา
- **Detail Panel** — ข้อมูลครบถ้วน พร้อมรูปถ่าย + กราฟแนวโน้ม
- **กราฟแนวโน้ม** — Chart.js แสดงค่า BOD, COD, SS, pH, FOG, Temp, TDS, Color, Surfactant รายเดือนย้อนหลัง
- **Month Stepper** — ◀ ▶ เลื่อนดูข้อมูลทีละเดือน พร้อม status card ผ่าน/ไม่ผ่านเกณฑ์
- **Vertical Line** — เส้นประสีเหลืองบนกราฟ ชี้เดือนที่กำลังดู
- **Summary Statistics** — สรุปสถิติย้อนหลังทั้งหมด (ผ่าน/ไม่ผ่าน, %, รายปี, รายเดือน)
- **Admin Mode** — แก้ไขพิกัด + export ข้อมูล (รหัส: admin_k / 1975)
- **Year Selector** — เลือกดูข้อมูลย้อนหลังหลายปี
- **Chart Expand** — คลิกกราฟเพื่อขยายเต็มจอ
- **Detection Limit Visualization** — ค่าต่ำกว่า DL แสดงเป็น ◇ (hollow diamond)
- **ธีมสว่าง/มืด** — สลับธีมได้ + บันทึก preference
- **Responsive** — รองรับ Desktop, Tablet, Mobile
- **Keyboard Navigation** — `←` `→` เลื่อนเดือน/MH, `Esc` ปิด

## พารามิเตอร์ที่แสดง

| ค่า | หน่วย | เกณฑ์มาตรฐาน | วิธีตรวจสอบ |
|-----|-------|-------------|------------|
| BOD | mg/L | ≤ 120 | Standard Methods 5210B |
| COD | mg/L | ≤ 500 | Standard Methods 5220D |
| SS | mg/L | ≤ 200 | Standard Methods 2540D |
| pH | - | 5.5 – 9.0 | Electrode Method 4500-H |
| Temperature | °C | ≤ 45 | Thermometric |
| TDS | mg/L | ≤ 3000 | Conductivity Method |
| FOG | mg/L | ≤ 10 | IR Spectrophotometry |
| Color | TCU | ≤ 200 | - |
| Surfactant | mg/L | ≤ 20 | - |

## โครงสร้างโปรเจค

```
saha-sr-wq-dashboard/
├── index.html                ← หน้าจอหลัก + overlay modals
├── css/
│   └── styles.css            ← ธีมสีเหลือง-ทอง-น้ำเงิน (Light/Dark)
├── js/
│   ├── app.js                ← Controller หลัก + Month Stepper + Summary
│   ├── map.js                ← Leaflet map + factory/MH markers + coord picker
│   ├── charts.js             ← Chart.js config + trend lines + PARAM_STYLES
│   ├── history.js            ← โหลดข้อมูลประวัติย้อนหลัง (JSON)
│   └── upload.js             ← อัพโหลดไฟล์ Excel
├── data/
│   ├── mock-data.js          ← ข้อมูลโรงงาน + Manhole + Standards
│   ├── stat69.xlsx           ← ไฟล์ต้นฉบับผลวิเคราะห์คุณภาพน้ำ ปี 2569
│   ├── water-quality-history.xls   ← ข้อมูลประวัติย้อนหลัง (49 sheets, ตั้งแต่ 2008)
│   ├── water-quality-history.json  ← ข้อมูลประวัติที่ parse แล้ว (~1.4MB)
│   └── photos/               ← รูปถ่ายโรงงาน + Manhole
└── README.md
```

## ข้อมูล

- **โรงงาน**: 27 แห่งที่มีผลตรวจวัดจริง (จาก 45+ แห่งใน Excel)
- **Manhole**: 18 จุดตรวจ (MH1–MH18)
- **ข้อมูลย้อนหลัง**: 45 โรงงาน, ตั้งแต่ พ.ศ. 2008–2569
- **Detection Limits**: BOD=2, COD=40, FOG=3, SS=5, Surfactant=0.4, Color=20, Ni=0.03, TKN=5, Zn=0.03, Cr6+=0.05, Pb=0.03

## Tech Stack

- **Leaflet.js 1.9** — แผนที่ interactive (OpenStreetMap + ArcGIS Satellite)
- **Chart.js 4.4** — กราฟแนวโน้ม + inline plugins (vertical line)
- **Vanilla JS** — ไม่ต้อง build, ไม่ต้อง npm
- **CSS Grid + Flexbox** — Responsive layout
- **CSS Variables** — รองรับ Light/Dark Theme

## วิธีใช้งาน

เปิด `index.html` ในเบราว์เซอร์ หรือเข้าผ่าน GitHub Pages:

```
https://akradechLao.github.io/saha-sr-wq-dashboard/
```

### Admin Mode

คลิกปุ่ม 🔒 แล้วเข้ารหัส: `admin_k` / `1975`
- คลิกแผนที่เพื่อแก้ไขพิกัด
- Export ข้อมูลที่แก้ไขแล้วกลับไปเก็บใน mock-data.js

## แหล่งข้อมูล

- SPI Official Website: https://industrial-park.spi.co.th
- กรมควบคุมมลพิษ: เกณฑ์มาตรฐานน้ำทิ้งจากโรงงานอุตสาหกรรม
- OpenStreetMap + ArcGIS: แผนที่

## License

MIT
