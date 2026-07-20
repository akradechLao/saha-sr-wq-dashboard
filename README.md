# Dashboard คุณภาพน้ำเสีย — สวนอุตสาหกรรมสหพัฒน์ ศรีราชา

> ระบบติดตามคุณภาพน้ำเสียออกจากโรงงานในสวนอุตสาหกรรมสหพัฒน์ ศรีราชา จ.ชลบุรี

## ฟีเจอร์

- **แผนที่โรงงาน** — Polygon สีทอง/เขียว/แดง บน Leaflet.js (dark theme)
- **Hover Popup** — ชี้ที่โรงงาน → แสดงชื่อ + ค่าพารามิเตอร์น้ำเสีย
- **Sidebar รายชื่อ** — รายชื่อ 15 โรงงาน + ค้นหา + สถานะผ่าน/ไม่ผ่าน
- **กราฟแนวโน้ม** — Chart.js แสดงค่า BOD, COD, DO, pH, Temperature 7 วันย้อนหลัง
- **ธีมสีหรูหรา** — น้ำเงินเข้ม + ทอง + เหลือง

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
│   └── styles.css          ← ธีมสีเหลือง-ทอง-น้ำเงิน
├── js/
│   ├── app.js              ← Controller หลัก
│   ├── map.js              ← Leaflet map + polygon + popup
│   └── charts.js           ← Chart.js trend lines
├── data/
│   └── mock-data.js        ← ข้อมูลจำลอง 15 โรงงาน
└── README.md
```

## Tech Stack

- **Leaflet.js 1.9** — แผนที่ interactive
- **Chart.js 4.x** — กราฟแนวโน้ม
- **Vanilla JS** — ไม่ต้อง build, ไม่ต้อง npm
- **CSS Grid + Flexbox** — Responsive layout

## วิธีใช้งาน

เปิด `index.html` ในเบราว์เซอร์ หรือเข้าผ่าน GitHub Pages:

```
https://akradechLao.github.io/saha-sr-wq-dashboard/
```

## ข้อมูลโรงงาน (15 แห่ง)

| # | โรงงาน | อุตสาหกรรม |
|---|--------|-----------|
| 1 | Thai Samsung Electronics | อิเล็กทรอนิกส์ |
| 2 | Lion Corporation (Thailand) | ผลิตภัณฑ์ทำความสะอาด |
| 3 | Sahakogen (Chonburi) | โรงไฟฟ้า |
| 4 | Saha Seiren | ชิ้นส่วนยานยนต์ |
| 5 | Asahi Kasei Spunbond | ผ้าไม่ถักทอ |
| 6 | Racha Ushino | ผ้าขนหนู |
| 7 | TopTrend Manufacturing | สินค้าอุปโภคบริโภค |
| 8 | Textile Prestige | เสื้อผ้าสำเร็จรูป |
| 9 | Sankyu Leamchabang | โลจิสติกส์ |
| 10 | Suea Fa Industry | สนับสนุนอุตสาหกรรม |
| 11 | Enfant | เสื้อผ้าเด็ก |
| 12 | PURE CARE BSC | เครื่องสำอาง |
| 13 | SPI Office & Outlet | สำนักงาน |
| 14 | Molten Asia Polymer | พลาสติก/โพลิเมอร์ |
| 15 | Kenmin Foods | อาหาร |

## License

MIT
