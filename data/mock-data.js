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

const MOCK_DATA = [
  {
    id: 1,
    name: 'Thai Samsung Electronics',
    nameTh: 'ไทยซัมซุง อิเลคโทรนิคส์',
    industry: 'อิเล็กทรอนิกส์',
    lat: 13.09498,
    lng: 100.96776,
    current: { bod: 8.2, cod: 32.5, do: 5.8, ph: 7.1, temp: 31.2 },
    history: generateHistory(8.2, 32.5, 5.8, 7.1, 31.2)
  },
  {
    id: 2,
    name: 'Lion (Thailand)',
    nameTh: 'ไลอ้อน (ประเทศไทย)',
    industry: 'ผลิตภัณฑ์ทำความสะอาด',
    lat: 13.0997,
    lng: 100.9553,
    current: { bod: 15.3, cod: 68.7, do: 3.2, ph: 7.8, temp: 33.5 },
    history: generateHistory(15.3, 68.7, 3.2, 7.8, 33.5)
  },
  {
    id: 3,
    name: 'Sahacogen (Chonburi)',
    nameTh: 'สหโคเจน (ชลบุรี)',
    industry: 'โรงไฟฟ้า',
    lat: 13.0988,
    lng: 100.9606,
    current: { bod: 22.1, cod: 125.3, do: 1.8, ph: 6.2, temp: 38.7 },
    history: generateHistory(22.1, 125.3, 1.8, 6.2, 38.7)
  },
  {
    id: 4,
    name: 'Saha Seiren',
    nameTh: 'สหเซเรน',
    industry: 'ชิ้นส่วนยานยนต์',
    lat: 13.0975,
    lng: 100.9645,
    current: { bod: 12.4, cod: 52.8, do: 4.5, ph: 7.3, temp: 32.8 },
    history: generateHistory(12.4, 52.8, 4.5, 7.3, 32.8)
  },
  {
    id: 5,
    name: 'Asahi Kasei Spunbond (Thailand)',
    nameTh: 'อาซาฮีเคเซ่ (ประเทศไทย)',
    industry: 'ผ้าไม่ถักทอ',
    lat: 13.0965,
    lng: 100.9650,
    current: { bod: 9.7, cod: 38.4, do: 5.2, ph: 7.0, temp: 30.5 },
    history: generateHistory(9.7, 38.4, 5.2, 7.0, 30.5)
  },
  {
    id: 6,
    name: 'Wacoal (Thailand)',
    nameTh: 'ไทยวาโก้',
    industry: 'ชุดชั้นใน/เสื้อผ้า',
    lat: 13.1005,
    lng: 100.9660,
    current: { bod: 7.8, cod: 28.3, do: 5.9, ph: 7.1, temp: 30.8 },
    history: generateHistory(7.8, 28.3, 5.9, 7.1, 30.8)
  },
  {
    id: 7,
    name: 'TopTrend Manufacturing',
    nameTh: 'ท้อปเทร็นด์ แมนูแฟคเจอริ่ง',
    industry: 'สินค้าอุปโภคบริโภค',
    lat: 13.090731,
    lng: 100.966427,
    current: { bod: 10.5, cod: 41.2, do: 5.0, ph: 7.4, temp: 32.1 },
    history: generateHistory(10.5, 41.2, 5.0, 7.4, 32.1)
  },
  {
    id: 8,
    name: 'Molten Asia Polymer Products',
    nameTh: 'มอลเท่น เอเชีย โพลิเมอร์ โปรดักส์',
    industry: 'พลาสติก/โพลิเมอร์',
    lat: 13.1010,
    lng: 100.9645,
    current: { bod: 16.8, cod: 78.4, do: 3.0, ph: 6.8, temp: 36.1 },
    history: generateHistory(16.8, 78.4, 3.0, 6.8, 36.1)
  },
  {
    id: 9,
    name: 'Toray Carbon Magic (Thailand)',
    nameTh: 'คาร์บอนเมจิก (ประเทศไทย)',
    industry: 'คาร์บอนไฟเบอร์',
    lat: 13.0955,
    lng: 100.9630,
    current: { bod: 4.2, cod: 15.8, do: 6.8, ph: 7.0, temp: 29.5 },
    history: generateHistory(4.2, 15.8, 6.8, 7.0, 29.5)
  },
  {
    id: 10,
    name: 'Kenmin Foods (Thailand)',
    nameTh: 'เค็นมิน ฟู้ดส์ (ประเทศไทย)',
    industry: 'อาหาร',
    lat: 13.1005,
    lng: 100.9640,
    current: { bod: 13.5, cod: 55.2, do: 4.0, ph: 7.5, temp: 33.0 },
    history: generateHistory(13.5, 55.2, 4.0, 7.5, 33.0)
  },
  {
    id: 11,
    name: 'Thai President Foods (MAMA)',
    nameTh: 'ไทยเพรซิเดนท์ฟูดส์ (มาม่า)',
    industry: 'อาหาร (บะหมี่กึ่งสำเร็จรูป)',
    lat: 13.0948,
    lng: 100.9580,
    current: { bod: 11.2, cod: 48.5, do: 4.2, ph: 7.3, temp: 32.5 },
    history: generateHistory(11.2, 48.5, 4.2, 7.3, 32.5)
  },
  {
    id: 12,
    name: 'Nissin Foods (Thailand)',
    nameTh: 'นิสชิน ฟู้ดส์ (ไทยแลนด์)',
    industry: 'อาหาร (บะหมี่สำเร็จรูป)',
    lat: 13.0955,
    lng: 100.9595,
    current: { bod: 10.8, cod: 45.2, do: 4.5, ph: 7.2, temp: 31.8 },
    history: generateHistory(10.8, 45.2, 4.5, 7.2, 31.8)
  },
  {
    id: 13,
    name: 'S&J International Enterprises',
    nameTh: 'เอสแอนด์เจ อินเตอร์เนชั่นแนลเอนเตอร์ไพรส์',
    industry: 'เครื่องสำอาง',
    lat: 13.0935,
    lng: 100.9565,
    current: { bod: 5.8, cod: 22.4, do: 6.0, ph: 7.0, temp: 30.5 },
    history: generateHistory(5.8, 22.4, 6.0, 7.0, 30.5)
  },
  {
    id: 14,
    name: 'Thai Arai',
    nameTh: 'ไทยอาราอิ',
    industry: 'ชิ้นส่วนพลาสติก',
    lat: 13.0942,
    lng: 100.9575,
    current: { bod: 7.5, cod: 32.8, do: 5.5, ph: 7.2, temp: 31.8 },
    history: generateHistory(7.5, 32.8, 5.5, 7.2, 31.8)
  },
  {
    id: 15,
    name: 'SPI Office & Outlet',
    nameTh: 'สำนักงานสหพัฒนาอินเตอร์โฮลดิ้ง',
    industry: 'สำนักงาน',
    lat: 13.1008,
    lng: 100.9661,
    current: { bod: 3.2, cod: 12.8, do: 7.0, ph: 7.2, temp: 29.5 },
    history: generateHistory(3.2, 12.8, 7.0, 7.2, 29.5)
  }
];
