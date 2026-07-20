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
    nameTh: 'ไทยซัมซุงอิเลคทรอนิคส์',
    industry: 'อิเล็กทรอนิกส์',
    lat: 13.09498,
    lng: 100.96776,
    current: { bod: 8.2, cod: 32.5, do: 5.8, ph: 7.1, temp: 31.2 },
    history: generateHistory(8.2, 32.5, 5.8, 7.1, 31.2)
  },
  {
    id: 2,
    name: 'Lion Corporation (Thailand)',
    nameTh: 'ไลอ้อน (ประเทศไทย)',
    industry: 'ผลิตภัณฑ์ทำความสะอาด',
    lat: 13.0997,
    lng: 100.9553,
    current: { bod: 15.3, cod: 68.7, do: 3.2, ph: 7.8, temp: 33.5 },
    history: generateHistory(15.3, 68.7, 3.2, 7.8, 33.5)
  },
  {
    id: 3,
    name: 'Sahakogen (Chonburi)',
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
    name: 'Asahi Kasei Spunbond',
    nameTh: 'อาซาฮีเคเซ่ (ประเทศไทย)',
    industry: 'ผ้าไม่ถักทอ',
    lat: 13.0965,
    lng: 100.9650,
    current: { bod: 9.7, cod: 38.4, do: 5.2, ph: 7.0, temp: 30.5 },
    history: generateHistory(9.7, 38.4, 5.2, 7.0, 30.5)
  },
  {
    id: 6,
    name: 'Racha Ushino',
    nameTh: 'ราชาอูชิโน',
    industry: 'ผ้าขนหนู',
    lat: 13.0985,
    lng: 100.9635,
    current: { bod: 11.8, cod: 45.6, do: 4.8, ph: 7.2, temp: 31.9 },
    history: generateHistory(11.8, 45.6, 4.8, 7.2, 31.9)
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
    name: 'Textile Prestige',
    nameTh: 'เท็กซ์ไทล์เพรสทีจ',
    industry: 'เสื้อผ้าสำเร็จรูป',
    lat: 13.0975,
    lng: 100.9655,
    current: { bod: 18.6, cod: 88.9, do: 2.8, ph: 8.2, temp: 35.4 },
    history: generateHistory(18.6, 88.9, 2.8, 8.2, 35.4)
  },
  {
    id: 9,
    name: 'Sankyu Leamchabang',
    nameTh: 'ซังคิว แหลมฉบัง',
    industry: 'โลจิสติกส์',
    lat: 13.0750,
    lng: 100.9150,
    current: { bod: 5.3, cod: 18.7, do: 6.5, ph: 7.0, temp: 29.8 },
    history: generateHistory(5.3, 18.7, 6.5, 7.0, 29.8)
  },
  {
    id: 10,
    name: 'Suea Fa Industry',
    nameTh: 'ซื่อฟ้าอุตสาหกรรม',
    industry: 'สนับสนุนอุตสาหกรรม',
    lat: 13.0990,
    lng: 100.9650,
    current: { bod: 14.2, cod: 62.5, do: 3.5, ph: 7.6, temp: 34.2 },
    history: generateHistory(14.2, 62.5, 3.5, 7.6, 34.2)
  },
  {
    id: 11,
    name: 'Enfant',
    nameTh: 'อองฟองต์',
    industry: 'เสื้อผ้าเด็ก',
    lat: 13.1005,
    lng: 100.9660,
    current: { bod: 7.8, cod: 28.3, do: 5.9, ph: 7.1, temp: 30.8 },
    history: generateHistory(7.8, 28.3, 5.9, 7.1, 30.8)
  },
  {
    id: 12,
    name: 'PURE CARE BSC',
    nameTh: 'เพียวแคร์ บีเอสซี',
    industry: 'เครื่องสำอาง',
    lat: 13.1000,
    lng: 100.9655,
    current: { bod: 6.4, cod: 24.1, do: 6.2, ph: 7.0, temp: 30.2 },
    history: generateHistory(6.4, 24.1, 6.2, 7.0, 30.2)
  },
  {
    id: 13,
    name: 'SPI Office & Outlet',
    nameTh: 'สำนักงานสหพัฒนาอินเตอร์โฮลดิ้ง',
    industry: 'สำนักงาน',
    lat: 13.1008,
    lng: 100.9661,
    current: { bod: 3.2, cod: 12.8, do: 7.0, ph: 7.2, temp: 29.5 },
    history: generateHistory(3.2, 12.8, 7.0, 7.2, 29.5)
  },
  {
    id: 14,
    name: 'Molten Asia Polymer',
    nameTh: 'มอลเท่น เอเชีย โพลิเมอร์',
    industry: 'พลาสติก/โพลิเมอร์',
    lat: 13.1010,
    lng: 100.9645,
    current: { bod: 16.8, cod: 78.4, do: 3.0, ph: 6.8, temp: 36.1 },
    history: generateHistory(16.8, 78.4, 3.0, 6.8, 36.1)
  },
  {
    id: 15,
    name: 'Kenmin Foods',
    nameTh: 'เค็นมิน ฟู้ดส์',
    industry: 'อาหาร',
    lat: 13.1005,
    lng: 100.9640,
    current: { bod: 13.5, cod: 55.2, do: 4.0, ph: 7.5, temp: 33.0 },
    history: generateHistory(13.5, 55.2, 4.0, 7.5, 33.0)
  }
];
