function generateHistory(bod, cod, doVal, ph, temp) {
  const days = [];
  const now = new Date();
  const dayNames = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push({
      date: d.toISOString().split('T')[0],
      dateShort: `${d.getDate()}/${d.getMonth() + 1}`,
      dayName: dayNames[d.getDay()],
      bod: +(bod + (Math.random() - 0.5) * 6).toFixed(1),
      cod: +(cod + (Math.random() - 0.5) * 20).toFixed(1),
      do: +(doVal + (Math.random() - 0.5) * 2).toFixed(1),
      ph: +(ph + (Math.random() - 0.5) * 1).toFixed(1),
      temp: +(temp + (Math.random() - 0.5) * 3).toFixed(1)
    });
  }
  return days;
}

const STANDARDS = {
  bod:  { max: 20,  unit: 'mg/L', label: 'BOD',        method: 'Standard Methods 5210B' },
  cod:  { max: 120, unit: 'mg/L', label: 'COD',        method: 'Standard Methods 5220D' },
  do:   { min: 2,   unit: 'mg/L', label: 'DO',         method: 'Electrode Method 4500-O' },
  ph:   { min: 6,   max: 9, unit: '-', label: 'pH',     method: 'Electrode Method 4500-H' },
  temp: { max: 40,  unit: '°C',   label: 'Temperature', method: 'Thermometric' }
};

// ข้อมูลโรงงานทั้งหมดจาก SPI Official Website: industrial-park.spi.co.th
// สาขาศรีราชา (65 แห่ง) — ที่อยู่จาก SPI, พิกัดประมาณจากผังเมือง
const MOCK_DATA = [
  {
    id: 1,
    name: 'Yamahatsu (Thailand)',
    nameTh: 'ยามาฮัทสึ (ประเทศไทย)',
    industry: 'เครื่องยนต์',
    address: '600/4 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.1002, lng: 100.9560,
    current: { bod: 5.2, cod: 18.5, do: 6.2, ph: 7.1, temp: 30.2 },
    history: generateHistory(5.2, 18.5, 6.2, 7.1, 30.2)
  },
  {
    id: 2,
    name: 'Well Pack Innovation',
    nameTh: 'เวลแพคอินโนเวชั่น',
    industry: 'บรรจุภัณฑ์',
    address: '602 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.1005, lng: 100.9568,
    current: { bod: 4.8, cod: 15.2, do: 6.5, ph: 7.0, temp: 29.8 },
    history: generateHistory(4.8, 15.2, 6.5, 7.0, 29.8)
  },
  {
    id: 3,
    name: 'Value Added Textile',
    nameTh: 'แวลูแอ็ด เด็ดเท็กซ์ไทล์',
    industry: 'สิ่งทอ',
    address: '600/3 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0998, lng: 100.9555,
    current: { bod: 12.5, cod: 52.8, do: 3.8, ph: 7.4, temp: 32.5 },
    history: generateHistory(12.5, 52.8, 3.8, 7.4, 32.5)
  },
  {
    id: 4,
    name: 'Toyo Textile Thai',
    nameTh: 'โตโย เท็กซ์ไทล์ไทย',
    industry: 'สิ่งทอ',
    address: '622/3-4 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20280',
    lat: 13.0990, lng: 100.9580,
    current: { bod: 11.8, cod: 48.5, do: 4.0, ph: 7.3, temp: 32.0 },
    history: generateHistory(11.8, 48.5, 4.0, 7.3, 32.0)
  },
  {
    id: 5,
    name: 'Torii Thai',
    nameTh: 'โทรี่ ไทย',
    industry: 'เคมีภัณฑ์',
    address: '600/22 หมู่ 11 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0985, lng: 100.9575,
    current: { bod: 8.2, cod: 35.5, do: 5.2, ph: 7.2, temp: 31.5 },
    history: generateHistory(8.2, 35.5, 5.2, 7.2, 31.5)
  },
  {
    id: 6,
    name: 'Totalway Image',
    nameTh: 'โทเทิลเวย์อิมเมจ',
    industry: 'สิ่งพิมพ์',
    address: '687 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0978, lng: 100.9600,
    current: { bod: 6.5, cod: 25.8, do: 5.8, ph: 7.1, temp: 30.5 },
    history: generateHistory(6.5, 25.8, 5.8, 7.1, 30.5)
  },
  {
    id: 7,
    name: 'TopTrend Manufacturing',
    nameTh: 'ท้อปเทร็นด์ แมนูแฟคเจอริ่ง',
    industry: 'สินค้าอุปโภคบริโภค',
    address: '334 หมู่ 1 สวนอุตสาหกรรมศรีราชา ต.บึง อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0907, lng: 100.9664,
    current: { bod: 10.5, cod: 41.2, do: 5.0, ph: 7.4, temp: 32.1 },
    history: generateHistory(10.5, 41.2, 5.0, 7.4, 32.1)
  },
  {
    id: 8,
    name: 'Time Ventures',
    nameTh: 'ไทม์เว็นเจอร์ส',
    industry: 'พลาสติก',
    address: '311/1 หมู่ 1 ถ.สุขาภิบาล 8 ต.บึง อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0912, lng: 100.9655,
    current: { bod: 7.8, cod: 32.5, do: 5.5, ph: 7.2, temp: 31.0 },
    history: generateHistory(7.8, 32.5, 5.5, 7.2, 31.0)
  },
  {
    id: 9,
    name: 'Thai Tomato',
    nameTh: 'ไทยโทมาโด',
    industry: 'อาหาร',
    address: '620/4 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0972, lng: 100.9590,
    current: { bod: 14.2, cod: 58.5, do: 3.5, ph: 7.5, temp: 33.0 },
    history: generateHistory(14.2, 58.5, 3.5, 7.5, 33.0)
  },
  {
    id: 10,
    name: 'Thai Takaya',
    nameTh: 'ไทยทาคายา',
    industry: 'อิเล็กทรอนิกส์',
    address: '688 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0968, lng: 100.9610,
    current: { bod: 4.5, cod: 16.8, do: 6.5, ph: 7.0, temp: 29.5 },
    history: generateHistory(4.5, 16.8, 6.5, 7.0, 29.5)
  },
  {
    id: 11,
    name: 'Thai Staflex',
    nameTh: 'ไทยสเตเฟล็กซ์',
    industry: 'สิ่งทอ',
    address: '626 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0965, lng: 100.9618,
    current: { bod: 10.2, cod: 42.8, do: 4.5, ph: 7.3, temp: 32.0 },
    history: generateHistory(10.2, 42.8, 4.5, 7.3, 32.0)
  },
  {
    id: 12,
    name: 'Thai Shikibo',
    nameTh: 'ไทยชิกิโบ',
    industry: 'สิ่งทอ',
    address: '311 หมู่ 1 ถ.สุขาภิบาล 8 ต.บึง อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0910, lng: 100.9648,
    current: { bod: 9.8, cod: 38.5, do: 4.8, ph: 7.2, temp: 31.8 },
    history: generateHistory(9.8, 38.5, 4.8, 7.2, 31.8)
  },
  {
    id: 13,
    name: 'Thai Silicate Chemical',
    nameTh: 'ไทยซิลิเกตเคมิคัล',
    industry: 'เคมีภัณฑ์',
    address: '602/1 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0995, lng: 100.9562,
    current: { bod: 6.8, cod: 28.5, do: 5.8, ph: 7.1, temp: 30.8 },
    history: generateHistory(6.8, 28.5, 5.8, 7.1, 30.8)
  },
  {
    id: 14,
    name: 'Thai Samsung Electronics',
    nameTh: 'ไทยซัมซุง อิเลคโทรนิคส์',
    industry: 'อิเล็กทรอนิกส์',
    address: '313 หมู่ 1 ถ.สุขาภิบาล 8 ต.บึง อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0950, lng: 100.9678,
    current: { bod: 8.2, cod: 32.5, do: 5.8, ph: 7.1, temp: 31.2 },
    history: generateHistory(8.2, 32.5, 5.8, 7.1, 31.2)
  },
  {
    id: 15,
    name: 'Thai President Foods',
    nameTh: 'ไทยเพรซิเดนท์ฟูดส์',
    industry: 'อาหาร (มาม่า)',
    address: '601 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0948, lng: 100.9580,
    current: { bod: 11.2, cod: 48.5, do: 4.2, ph: 7.3, temp: 32.5 },
    history: generateHistory(11.2, 48.5, 4.2, 7.3, 32.5)
  },
  {
    id: 16,
    name: 'P.F. Intertech',
    nameTh: 'พี เอฟ อินเตอร์เทค',
    industry: 'ชิ้นส่วนโลหะ',
    address: '507 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0942, lng: 100.9555,
    current: { bod: 5.5, cod: 22.8, do: 6.0, ph: 7.0, temp: 30.0 },
    history: generateHistory(5.5, 22.8, 6.0, 7.0, 30.0)
  },
  {
    id: 17,
    name: 'Pack Industry',
    nameTh: 'เพค อินดัสทรี',
    industry: 'บรรจุภัณฑ์',
    address: '626/1 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20280',
    lat: 13.0962, lng: 100.9622,
    current: { bod: 4.2, cod: 15.5, do: 6.5, ph: 7.0, temp: 29.5 },
    history: generateHistory(4.2, 15.5, 6.5, 7.0, 29.5)
  },
  {
    id: 18,
    name: 'PanTech R&D',
    nameTh: 'แพนเทคอาร์ แอนด์ ดี',
    industry: 'วิจัยและพัฒนา',
    address: '620/5 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0970, lng: 100.9595,
    current: { bod: 3.8, cod: 12.5, do: 6.8, ph: 7.0, temp: 29.2 },
    history: generateHistory(3.8, 12.5, 6.8, 7.0, 29.2)
  },
  {
    id: 19,
    name: 'PanAsia Footwear',
    nameTh: 'แพนเอเซียฟุตแวร์',
    industry: 'รองเท้า',
    address: '507 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0940, lng: 100.9550,
    current: { bod: 8.5, cod: 35.2, do: 5.0, ph: 7.3, temp: 31.5 },
    history: generateHistory(8.5, 35.2, 5.0, 7.3, 31.5)
  },
  {
    id: 20,
    name: 'Osot Inter laboratories',
    nameTh: 'โอสถ อินเตอร์แลบบอราทอรีส์',
    industry: 'ยาและเวชภัณฑ์',
    address: '600/9 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0992, lng: 100.9572,
    current: { bod: 3.5, cod: 10.8, do: 7.0, ph: 7.0, temp: 29.0 },
    history: generateHistory(3.5, 10.8, 7.0, 7.0, 29.0)
  },
  {
    id: 21,
    name: 'Nissin Foods (Thailand)',
    nameTh: 'นิสชิน ฟู้ดส์ (ไทยแลนด์)',
    industry: 'อาหาร (บะหมี่)',
    address: '631 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0955, lng: 100.9595,
    current: { bod: 10.8, cod: 45.2, do: 4.5, ph: 7.2, temp: 31.8 },
    history: generateHistory(10.8, 45.2, 4.5, 7.2, 31.8)
  },
  {
    id: 22,
    name: 'Molten (Thailand)',
    nameTh: 'มอลเทน (ไทยแลนด์)',
    industry: 'พลาสติก',
    address: '666 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.1010, lng: 100.9645,
    current: { bod: 16.8, cod: 78.4, do: 3.0, ph: 6.8, temp: 36.1 },
    history: generateHistory(16.8, 78.4, 3.0, 6.8, 36.1)
  },
  {
    id: 23,
    name: 'Molds Furutani (Thailand)',
    nameTh: 'โมลด์ส ฟุรุตานิ (ไทยแลนด์)',
    industry: 'แม่พิมพ์',
    address: '600/38-39 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0988, lng: 100.9568,
    current: { bod: 5.8, cod: 22.5, do: 6.0, ph: 7.1, temp: 30.2 },
    history: generateHistory(5.8, 22.5, 6.0, 7.1, 30.2)
  },
  {
    id: 24,
    name: 'Lion (Thailand)',
    nameTh: 'ไลอ้อน (ประเทศไทย)',
    industry: 'ผลิตภัณฑ์ทำความสะอาด',
    address: '602 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0997, lng: 100.9553,
    current: { bod: 15.3, cod: 68.7, do: 3.2, ph: 7.8, temp: 33.5 },
    history: generateHistory(15.3, 68.7, 3.2, 7.8, 33.5)
  },
  {
    id: 25,
    name: 'KRS Logistics',
    nameTh: 'เคอาร์เอส ลอจิสติคส์',
    industry: 'โลจิสติกส์',
    address: '311 หมู่ 1 ต.บึง อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0915, lng: 100.9652,
    current: { bod: 2.8, cod: 8.5, do: 7.2, ph: 7.0, temp: 29.0 },
    history: generateHistory(2.8, 8.5, 7.2, 7.0, 29.0)
  },
  {
    id: 26,
    name: 'Kenmin Foods (Thailand)',
    nameTh: 'เคนมินฟู้ดส์ (ไทยแลนด์)',
    industry: 'อาหาร',
    address: '600/45 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.1005, lng: 100.9640,
    current: { bod: 13.5, cod: 55.2, do: 4.0, ph: 7.5, temp: 33.0 },
    history: generateHistory(13.5, 55.2, 4.0, 7.5, 33.0)
  },
  {
    id: 27,
    name: 'Kobinpattana',
    nameTh: 'กบินทร์พัฒนกิจ',
    industry: 'จัดจำหน่ายสินค้า',
    address: '629 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0982, lng: 100.9605,
    current: { bod: 2.5, cod: 7.8, do: 7.5, ph: 7.0, temp: 28.8 },
    history: generateHistory(2.5, 7.8, 7.5, 7.0, 28.8)
  },
  {
    id: 28,
    name: 'K&K Package (Thailand)',
    nameTh: 'เคแอนด์เค แพ็คเกจ (ประเทศไทย)',
    industry: 'บรรจุภัณฑ์',
    address: '676 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0975, lng: 100.9612,
    current: { bod: 4.5, cod: 16.2, do: 6.2, ph: 7.0, temp: 29.8 },
    history: generateHistory(4.5, 16.2, 6.2, 7.0, 29.8)
  },
  {
    id: 29,
    name: 'Asahi Kasei Spunbond (Thailand)',
    nameTh: 'อาซาฮี คาเซอิ สปันบอนด์ (ประเทศไทย)',
    industry: 'ผ้าไม่ถักทอ',
    address: 'ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0965, lng: 100.9650,
    current: { bod: 9.7, cod: 38.4, do: 5.2, ph: 7.0, temp: 30.5 },
    history: generateHistory(9.7, 38.4, 5.2, 7.0, 30.5)
  },
  {
    id: 30,
    name: 'Bangkok Tokyo Socks',
    nameTh: 'บางกอกโตเกียวซ็อคส์',
    industry: 'ถุงเท้า',
    address: '673 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0970, lng: 100.9608,
    current: { bod: 8.8, cod: 35.5, do: 5.0, ph: 7.3, temp: 31.5 },
    history: generateHistory(8.8, 35.5, 5.0, 7.3, 31.5)
  },
  {
    id: 31,
    name: 'Dome Composite (Thailand)',
    nameTh: 'โดม คอมโพสิต (ประเทศไทย)',
    industry: 'วัสดุคอมโพสิต',
    address: '173/5 ม.5 ถ.สุขาภิบาล 8 ต.บึง อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0905, lng: 100.9660,
    current: { bod: 5.2, cod: 20.5, do: 6.0, ph: 7.1, temp: 30.0 },
    history: generateHistory(5.2, 20.5, 6.0, 7.1, 30.0)
  },
  {
    id: 32,
    name: 'Eastern Silicate',
    nameTh: 'อีสเทิร์นซิลิเกต',
    industry: 'เคมีภัณฑ์',
    address: '602 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0993, lng: 100.9565,
    current: { bod: 6.5, cod: 28.2, do: 5.5, ph: 7.2, temp: 30.8 },
    history: generateHistory(6.5, 28.2, 5.5, 7.2, 30.8)
  },
  {
    id: 33,
    name: 'Eastern Thai Consulting 1992',
    nameTh: 'อีสเทิร์นไทยคอนซัลติ้ง 1992',
    industry: 'ที่ปรึกษา',
    address: '683 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0960, lng: 100.9615,
    current: { bod: 2.0, cod: 5.5, do: 7.5, ph: 7.0, temp: 28.5 },
    history: generateHistory(2.0, 5.5, 7.5, 7.0, 28.5)
  },
  {
    id: 34,
    name: 'Family Glove',
    nameTh: 'แฟมิลี่โกลฟ',
    industry: 'ถุงมือ',
    address: '624/1-4 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0958, lng: 100.9620,
    current: { bod: 7.2, cod: 30.5, do: 5.5, ph: 7.2, temp: 31.0 },
    history: generateHistory(7.2, 30.5, 5.5, 7.2, 31.0)
  },
  {
    id: 35,
    name: 'First United Industry',
    nameTh: 'เฟิสท์ยูไนเต็ดอินดัสตรี',
    industry: 'สิ่งทอ',
    address: '333 หมู่ 1 ถ.สุขาภิบาล 8 ต.บึง อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0908, lng: 100.9658,
    current: { bod: 11.5, cod: 48.8, do: 4.2, ph: 7.4, temp: 32.5 },
    history: generateHistory(11.5, 48.8, 4.2, 7.4, 32.5)
  },
  {
    id: 36,
    name: 'General Glass',
    nameTh: 'เจนเนอร์รัลกลาส',
    industry: 'กระจก',
    address: '507/3 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0945, lng: 100.9558,
    current: { bod: 4.8, cod: 18.5, do: 6.2, ph: 7.0, temp: 30.0 },
    history: generateHistory(4.8, 18.5, 6.2, 7.0, 30.0)
  },
  {
    id: 37,
    name: 'Hiraiseimitsu (Thailand)',
    nameTh: 'ฮิไรเซมิสึ (ประเทศไทย)',
    industry: 'พลาสติกฉีดขึ้นรูป',
    address: '621 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0968, lng: 100.9602,
    current: { bod: 5.5, cod: 22.8, do: 5.8, ph: 7.1, temp: 30.5 },
    history: generateHistory(5.5, 22.8, 5.8, 7.1, 30.5)
  },
  {
    id: 38,
    name: 'International Quality Footwear',
    nameTh: 'อินเตอร์เนชั่นแนล คิวริตี้ ฟุตแวร์',
    industry: 'รองเท้า',
    address: '626/1 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0963, lng: 100.9625,
    current: { bod: 9.2, cod: 38.8, do: 4.8, ph: 7.3, temp: 32.0 },
    history: generateHistory(9.2, 38.8, 4.8, 7.3, 32.0)
  },
  {
    id: 39,
    name: 'International Leather Fashion',
    nameTh: 'อินเตอร์เนชั่นแนลเลทเธอร์แฟชั่น',
    industry: 'หนัง',
    address: '687 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0976, lng: 100.9605,
    current: { bod: 12.8, cod: 55.2, do: 3.5, ph: 7.5, temp: 33.5 },
    history: generateHistory(12.8, 55.2, 3.5, 7.5, 33.5)
  },
  {
    id: 40,
    name: 'Janome (Thailand)',
    nameTh: 'จาโนเม่ (ประเทศไทย)',
    industry: 'จักรเย็บผ้า',
    address: '312 หมู่ 1 ถ.สุขาภิบาล 8 ต.บึง อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0918, lng: 100.9645,
    current: { bod: 3.8, cod: 12.5, do: 6.8, ph: 7.0, temp: 29.2 },
    history: generateHistory(3.8, 12.5, 6.8, 7.0, 29.2)
  },
  {
    id: 41,
    name: 'Thai Nihol Seal',
    nameTh: 'ไทยนิฮอลซีล',
    industry: 'ซีลยาง',
    address: '227/7 หมู่ 11 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0952, lng: 100.9588,
    current: { bod: 4.5, cod: 16.8, do: 6.2, ph: 7.0, temp: 29.8 },
    history: generateHistory(4.5, 16.8, 6.2, 7.0, 29.8)
  },
  {
    id: 42,
    name: 'Thai Monster',
    nameTh: 'ไทยมอนสเตอร์',
    industry: 'เครื่องจักร',
    address: '688 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0966, lng: 100.9612,
    current: { bod: 5.8, cod: 24.5, do: 5.8, ph: 7.1, temp: 30.5 },
    history: generateHistory(5.8, 24.5, 5.8, 7.1, 30.5)
  },
  {
    id: 43,
    name: 'Thai Lotte',
    nameTh: 'ไทยลอตเต้',
    industry: 'ขนมหวาน',
    address: '600/8 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0940, lng: 100.9570,
    current: { bod: 9.5, cod: 38.8, do: 5.0, ph: 7.1, temp: 31.2 },
    history: generateHistory(9.5, 38.8, 5.0, 7.1, 31.2)
  },
  {
    id: 44,
    name: 'Thai Kobashi',
    nameTh: 'ไทยโคบาชิ',
    industry: 'ชิ้นส่วนโลหะ',
    address: '670-672 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0972, lng: 100.9598,
    current: { bod: 5.2, cod: 20.8, do: 6.0, ph: 7.1, temp: 30.2 },
    history: generateHistory(5.2, 20.8, 6.0, 7.1, 30.2)
  },
  {
    id: 45,
    name: 'Thai Kamaya',
    nameTh: 'ไทยคามาย่า',
    industry: 'ชิ้นส่วนโลหะ',
    address: '314 หมู่ 1 ถ.สุขาภิบาล 8 ต.บึง อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0920, lng: 100.9650,
    current: { bod: 4.8, cod: 18.2, do: 6.2, ph: 7.0, temp: 30.0 },
    history: generateHistory(4.8, 18.2, 6.2, 7.0, 30.0)
  },
  {
    id: 46,
    name: 'Thai Cubic Technology',
    nameTh: 'ไทยคิวบิคเทคโนโลยี',
    industry: 'พลาสติก',
    address: '620/2 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0973, lng: 100.9592,
    current: { bod: 6.5, cod: 28.5, do: 5.5, ph: 7.2, temp: 31.0 },
    history: generateHistory(6.5, 28.5, 5.5, 7.2, 31.0)
  },
  {
    id: 47,
    name: 'Thai Asahi Kasei Spandex',
    nameTh: 'ไทยอาซาฮี คาเซอิ สแปนเด็กซ์',
    industry: 'เส้นใยสแปนเด็กซ์',
    address: '919 หมู่ 11 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0958, lng: 100.9630,
    current: { bod: 8.5, cod: 35.8, do: 5.0, ph: 7.3, temp: 31.8 },
    history: generateHistory(8.5, 35.8, 5.0, 7.3, 31.8)
  },
  {
    id: 48,
    name: 'Thai Arai',
    nameTh: 'ไทยอาราอิ',
    industry: 'ชิ้นส่วนพลาสติก',
    address: '623/1-2 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0942, lng: 100.9575,
    current: { bod: 7.5, cod: 32.8, do: 5.5, ph: 7.2, temp: 31.8 },
    history: generateHistory(7.5, 32.8, 5.5, 7.2, 31.8)
  },
  {
    id: 49,
    name: 'Textile Prestige Factory 3',
    nameTh: 'เท็กซ์ไทล์เพรสทีจ โรงงาน 3',
    industry: 'เสื้อผ้าสำเร็จรูป',
    address: '600/3 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0995, lng: 100.9570,
    current: { bod: 14.5, cod: 62.8, do: 3.5, ph: 7.6, temp: 33.8 },
    history: generateHistory(14.5, 62.8, 3.5, 7.6, 33.8)
  },
  {
    id: 50,
    name: 'Textile Prestige Factory 2',
    nameTh: 'เท็กซ์ไทล์เพรสทีจ โรงงาน 2',
    industry: 'เสื้อผ้าสำเร็จรูป',
    address: '624/5-6 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0955, lng: 100.9625,
    current: { bod: 13.8, cod: 58.5, do: 3.8, ph: 7.5, temp: 33.2 },
    history: generateHistory(13.8, 58.5, 3.8, 7.5, 33.2)
  },
  {
    id: 51,
    name: 'T&M Manufacturing (Thailand)',
    nameTh: 'ที แอนด์ เอ็ม แมนูแฟคเจอริ่ง (ประเทศไทย)',
    industry: 'อาหาร',
    address: '622/1 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0988, lng: 100.9585,
    current: { bod: 12.5, cod: 52.8, do: 4.0, ph: 7.4, temp: 32.8 },
    history: generateHistory(12.5, 52.8, 4.0, 7.4, 32.8)
  },
  {
    id: 52,
    name: 'Sriracha Aviation',
    nameTh: 'ศรีราชา เอวิเอชั่น',
    industry: 'การบิน',
    address: '304 หมู่ 1 ต.บึง อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0902, lng: 100.9665,
    current: { bod: 1.5, cod: 4.2, do: 7.8, ph: 7.0, temp: 28.0 },
    history: generateHistory(1.5, 4.2, 7.8, 7.0, 28.0)
  },
  {
    id: 53,
    name: 'Sriracha Transport',
    nameTh: 'ศรีราชาขนส่ง',
    industry: 'ขนส่ง',
    address: '661/11 หมู่ 11 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0950, lng: 100.9635,
    current: { bod: 2.2, cod: 6.5, do: 7.5, ph: 7.0, temp: 28.5 },
    history: generateHistory(2.2, 6.5, 7.5, 7.0, 28.5)
  },
  {
    id: 54,
    name: 'Suea Fa Industry (Thailand)',
    nameTh: 'ซื่อฟ้าอุตสาหกรรม (ประเทศไทย)',
    industry: 'สนับสนุนอุตสาหกรรม',
    address: '600/46 หมู่ 11 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.1000, lng: 100.9650,
    current: { bod: 6.8, cod: 28.5, do: 5.5, ph: 7.2, temp: 31.0 },
    history: generateHistory(6.8, 28.5, 5.5, 7.2, 31.0)
  },
  {
    id: 55,
    name: 'Chardong (Thailand)',
    nameTh: 'ชาล์ดอง (ประเทศไทย)',
    industry: 'อาหาร',
    address: '600/4 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0990, lng: 100.9562,
    current: { bod: 10.5, cod: 42.8, do: 4.5, ph: 7.3, temp: 32.0 },
    history: generateHistory(10.5, 42.8, 4.5, 7.3, 32.0)
  },
  {
    id: 56,
    name: 'Pitakit',
    nameTh: 'พิทักษ์กิจ',
    industry: 'โลจิสติกส์',
    address: '300 หมู่ 1 ถ.สุขาภิบาล 8 ต.บึง อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0900, lng: 100.9655,
    current: { bod: 2.0, cod: 5.8, do: 7.5, ph: 7.0, temp: 28.5 },
    history: generateHistory(2.0, 5.8, 7.5, 7.0, 28.5)
  },
  {
    id: 57,
    name: 'PTK Multiservice',
    nameTh: 'พี ที เค มัลติเซอร์วิส',
    industry: 'บริการ',
    address: '300/1 หมู่ 1 ถ.สุขาภิบาล 8 ต.บึง อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0903, lng: 100.9658,
    current: { bod: 1.8, cod: 4.5, do: 7.8, ph: 7.0, temp: 28.2 },
    history: generateHistory(1.8, 4.5, 7.8, 7.0, 28.2)
  },
  {
    id: 58,
    name: 'Racha Ushino',
    nameTh: 'ราชาอูชิโน',
    industry: 'ผ้าขนหนู',
    address: '630 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0985, lng: 100.9635,
    current: { bod: 11.8, cod: 45.6, do: 4.8, ph: 7.2, temp: 31.9 },
    history: generateHistory(11.8, 45.6, 4.8, 7.2, 31.9)
  },
  {
    id: 59,
    name: 'S&J International Enterprises',
    nameTh: 'เอสแอนด์เจ อินเตอร์เนชั่นแนลเอนเตอร์ไพรส์',
    industry: 'เครื่องสำอาง',
    address: '600/4 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0935, lng: 100.9565,
    current: { bod: 5.8, cod: 22.4, do: 6.0, ph: 7.0, temp: 30.5 },
    history: generateHistory(5.8, 22.4, 6.0, 7.0, 30.5)
  },
  {
    id: 60,
    name: 'Sahachon Phuet Pha',
    nameTh: 'สหชลผลพืช',
    industry: 'อาหาร',
    address: '600/1 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0995, lng: 100.9558,
    current: { bod: 12.2, cod: 52.5, do: 4.0, ph: 7.4, temp: 32.5 },
    history: generateHistory(12.2, 52.5, 4.0, 7.4, 32.5)
  },
  {
    id: 61,
    name: 'Sahacogen (Chonburi)',
    nameTh: 'สหโคเจน (ชลบุรี)',
    industry: 'โรงไฟฟ้า',
    address: '636 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0988, lng: 100.9606,
    current: { bod: 22.1, cod: 125.3, do: 1.8, ph: 6.2, temp: 38.7 },
    history: generateHistory(22.1, 125.3, 1.8, 6.2, 38.7)
  },
  {
    id: 62,
    name: 'SPI Office & Outlet',
    nameTh: 'สหพัฒนาอินเตอร์โฮลดิ้ง',
    industry: 'สำนักงาน',
    address: '999 หมู่ 11 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.1008, lng: 100.9661,
    current: { bod: 3.2, cod: 12.8, do: 7.0, ph: 7.2, temp: 29.5 },
    history: generateHistory(3.2, 12.8, 7.0, 7.2, 29.5)
  },
  {
    id: 63,
    name: 'Saha Pathanapiboon',
    nameTh: 'สหพัฒนพิบูล',
    industry: 'อาหารและเครื่องดื่ม',
    address: '682 หมู่ 5 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0955, lng: 100.9640,
    current: { bod: 10.8, cod: 45.5, do: 4.5, ph: 7.3, temp: 32.2 },
    history: generateHistory(10.8, 45.5, 4.5, 7.3, 32.2)
  },
  {
    id: 64,
    name: 'Saha Sewa',
    nameTh: 'สหเซวา',
    industry: 'อาหารทะเล',
    address: '666/2 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.1008, lng: 100.9648,
    current: { bod: 15.5, cod: 68.2, do: 3.0, ph: 7.5, temp: 34.0 },
    history: generateHistory(15.5, 68.2, 3.0, 7.5, 34.0)
  },
  {
    id: 65,
    name: 'Saha Seiren',
    nameTh: 'สหเซเรน',
    industry: 'ชิ้นส่วนยานยนต์',
    address: '592 หมู่ 11 ถ.สุขาภิบาล 8 ต.หนองขาม อ.ศรีราชา จ.ชลบุรี 20230',
    lat: 13.0975, lng: 100.9645,
    current: { bod: 12.4, cod: 52.8, do: 4.5, ph: 7.3, temp: 32.8 },
    history: generateHistory(12.4, 52.8, 4.5, 7.3, 32.8)
  }
];
