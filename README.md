# Dashboard คุณภาพน้ำเสีย — สวนอุตสาหกรรมสหพัฒน์ ศรีราชา

> ระบบติดตามคุณภาพน้ำเสียออกจากโรงงานในสวนอุตสาหกรรมสหพัฒน์ ศรีราชา จ.ชลบุรี

## ฟีเจอร์

- **แผนที่จริง** — OpenStreetMap (Street) + ArcGIS (Satellite) สลับได้
- **Circle Marker** — สีเขียว (ผ่าน) / แดง (ไม่ผ่าน) + glow effect
- **Hover Popup** — ชี้ที่โรงงาน → แสดงชื่อ + ค่าพารามิเตอร์น้ำเสีย
- **Sidebar รายชื่อ** — รายชื่อ 15 โรงงาน + ค้นหา + สถานะผ่าน/ไม่ผ่าน
- **กราฟแนวโน้ม** — Chart.js แสดงค่า BOD, COD, DO, pH, Temperature 7 วันย้อนหลัง
- **ธีมสว่าง/มืด** — สลับธีมได้ + บันทึก preference
- **Responsive** — รองรับ Desktop, Tablet, Mobile

## พารามิเตอร์ที่แสดง

| ค่า | หน่วย | เกณฑ์มาตรฐาน | วิธีตรวจสอบ |
|-----|-------|-------------|------------|
| BOD | mg/L | ≤ 20 | Standard Methods 5210B |
| COD | mg/L | ≤ 120 | Standard Methods 5220D |
| DO | mg/L | ≥ 2 | Electrode Method 4500-O |
| pH | - | 6.0 – 9.0 | Electrode Method 4500-H |
| Temperature | °C | ≤ 40 | Thermometric |

## โครงสร้างโปรเจค

```
saha-sr-wq-dashboard/
├── index.html              ← หน้าจอหลัก
├── css/
│   └── styles.css          ← ธีมสีเหลือง-ทอง-น้ำเงิน (Light/Dark)
├── js/
│   ├── app.js              ← Controller หลัก + Theme Toggle
│   ├── map.js              ← Leaflet map + circle markers
│   └── charts.js           ← Chart.js trend lines
├── data/
│   └── mock-data.js        ← ข้อมูลจำลอง 15 โรงงาน
└── README.md
```

## Tech Stack

- **Leaflet.js 1.9** — แผนที่ interactive (OpenStreetMap + ArcGIS Satellite)
- **Chart.js 4.x** — กราฟแนวโน้ม
- **Vanilla JS** — ไม่ต้อง build, ไม่ต้อง npm
- **CSS Grid + Flexbox** — Responsive layout
- **CSS Variables** — รองรับ Light/Dark Theme

## วิธีใช้งาน

เปิด `index.html` ในเบราว์เซอร์ หรือเข้าผ่าน GitHub Pages:

```
https://akradechLao.github.io/saha-sr-wq-dashboard/
```

## ข้อมูลโรงงาน (15 แห่ง)

ตรวจสอบจาก SPI Official Website: `industrial-park.spi.co.th` สาขาศรีราชา

| # | โรงงาน | อุตสาหกรรม | ที่อยู่ |
|---|--------|-----------|--------|
| 1 | Thai Samsung Electronics | อิเล็กทรอนิกส์ | 313 หมู่ 1 ถ.สุขาภิบาล 8 ต.บึง อ.ศรีราชา |
| 2 | Lion (Thailand) | ผลิตภัณฑ์ทำความสะอาด | 602 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา |
| 3 | Sahacogen (Chonburi) | โรงไฟฟ้า | 636 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา |
| 4 | Saha Seiren | ชิ้นส่วนยานยนต์ | 592 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา |
| 5 | Asahi Kasei Spunbond (Thailand) | ผ้าไม่ถักทอ | ต.หนองขาม อ.ศรีราชา |
| 6 | TopTrend Manufacturing | สินค้าอุปโภคบริโภค | 334 หมู่ 1 ต.บึง อ.ศรีราชา |
| 7 | Molten (Thailand) | พลาสติก/โพลิเมอร์ | 666 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา |
| 8 | Kenmin Foods (Thailand) | อาหาร | 600/45 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา |
| 9 | Thai President Foods | บะหมี่กึ่งสำเร็จรูป (มาม่า) | 601 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา |
| 10 | Nissin Foods (Thailand) | บะหมี่สำเร็จรูป | 631 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา |
| 11 | S&J International Enterprises | เครื่องสำอาง | 600/4 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา |
| 12 | Thai Arai | ชิ้นส่วนพลาสติก | 623/1-2 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา |
| 13 | Racha Ushino | ผ้าขนหนู | 630 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา |
| 14 | Thai Lotte | ขนมหวาน/อาหารว่าง | 600/8 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา |
| 15 | SPI Office & Outlet | สำนักงาน | 999 หมู่ 11 ต.หนองขาม อ.ศรีราชา |

## แหล่งข้อมูล

- SPI Official Website: https://industrial-park.spi.co.th
- กรมควบคุมมลพิษ: เกณฑ์มาตรฐานน้ำทิ้งจากโรงงานอุตสาหกรรม
- OpenStreetMap + ArcGIS: แผนที่

## License

MIT
