/**
 * DỊCH VỤ THỜI TIẾT & BẢNG GIÁ NÔNG SẢN HÀNG NGÀY DI LINH - LÂM ĐỒNG
 */

function formatDateVi(date) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

export function getDailyWeatherAgriData(baseDate = new Date()) {
  const today = new Date(baseDate);
  const todayStr = formatDateVi(today);
  const dayOfWeek = today.getDay();
  const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const currentDayName = dayNames[dayOfWeek];

  // Dữ liệu thời tiết Di Linh hôm nay
  const weather = {
    location: 'Huyện Di Linh, Tỉnh Lâm Đồng',
    date_str: `${currentDayName}, ${todayStr}`,
    temp_current: 24,
    temp_min: 19,
    temp_max: 29,
    humidity: 78,
    rain_probability: 45,
    wind_speed: '12 km/h',
    uv_index: 6,
    condition: 'Mây thay đổi, ngày nắng, chiều tối có mưa rào rải rác',
    icon: '⛅',
    advice: 'Thời tiết thích hợp để bón phân đợt cuối và tỉa cành thông thoáng. Tránh xịt thuốc phòng nấm khi trời chuyển mây đen chiều tối.',
    forecast: [
      { time: 'Sáng', temp: '22°C', icon: '🌤️', desc: 'Nắng nhẹ, gió mát' },
      { time: 'Trưa', temp: '28°C', icon: '☀️', desc: 'Nắng ấm ráo' },
      { time: 'Chiều', temp: '25°C', icon: '🌦️', desc: 'Mưa rào cục bộ' },
      { time: 'Tối', temp: '20°C', icon: '🌙', desc: 'Trời mát mẻ, se lạnh' }
    ]
  };

  // Dữ liệu giá nông sản Di Linh hôm nay
  const agriPrices = {
    updated_at: `07:00 hôm nay (${todayStr})`,
    source: 'Hiệp hội Cà phê - Ca cao & Thương lái Di Linh',
    items: [
      {
        id: 'coffee-robusta',
        name: 'Cà phê Robusta (Nhân xô)',
        unit: 'kg',
        price_str: '119.500 – 122.000',
        avg_price: 121000,
        trend: 'up',
        change_str: '+1.500 đ/kg',
        note: 'Đạt mức giá cao kỷ lục, nhu cầu thu mua lớn',
        icon: '☕'
      },
      {
        id: 'coffee-fresh',
        name: 'Cà phê quả tươi chín (Hái chọn)',
        unit: 'kg',
        price_str: '24.000 – 26.500',
        avg_price: 25000,
        trend: 'up',
        change_str: '+500 đ/kg',
        note: 'Ưu tiên vườn hái chín trên 90%',
        icon: '🍒'
      },
      {
        id: 'durian-monthong',
        name: 'Sầu riêng Monthong (Loại 1)',
        unit: 'kg',
        price_str: '85.000 – 95.000',
        avg_price: 90000,
        trend: 'stable',
        change_str: 'Ổn định',
        note: 'Cắt tại vườn, thương lái đóng thùng xuất khẩu',
        icon: '🍈'
      },
      {
        id: 'durian-ri6',
        name: 'Sầu riêng Ri6 (Loại 1)',
        unit: 'kg',
        price_str: '60.000 – 68.000',
        avg_price: 65000,
        trend: 'stable',
        change_str: 'Ổn định',
        note: 'Cơm vàng hạt lép, chất lượng đồng đều',
        icon: '🍈'
      },
      {
        id: 'pepper-black',
        name: 'Hồ tiêu đen Di Linh',
        unit: 'kg',
        price_str: '148.000 – 152.000',
        avg_price: 150000,
        trend: 'up',
        change_str: '+2.000 đ/kg',
        note: 'Dung tích hạt chắc, tiêu khô bảo quản tốt',
        icon: '🌿'
      },
      {
        id: 'macadamia',
        name: 'Hạt Mắc ca tươi (Vỏ xanh)',
        unit: 'kg',
        price_str: '75.000 – 82.000',
        avg_price: 78000,
        trend: 'stable',
        change_str: 'Ổn định',
        note: 'Thu mua chế biến sấy nứt vỏ',
        icon: '🌰'
      }
    ]
  };

  return { weather, agriPrices };
}
