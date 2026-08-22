/**
 * DỊCH VỤ XỬ LÝ DÒNG CHỮ LED QUANG BÁO ĐIỆN TỬ
 * Tự động tính toán nội dung theo thời gian thực (Giờ, Buổi, Thứ trong tuần, Ngày lễ lớn Việt Nam)
 */

// DANH SÁCH CÁC NGÀY LỄ LỚN CỦA ĐẤT NƯỚC (DƯƠNG LỊCH)
const SPECIAL_HOLIDAYS = [
  {
    month: 1,
    day: 1,
    message: '🎉 CHÀO MỪNG NĂM MỚI – KÍNH CHÚC BÀ CON THÔN 6 AN KHANG THỊNH VƯỢNG, VẠN SỰ NHƯ Ý! 🎊'
  },
  {
    month: 2,
    day: 3,
    message: '🚩 NHIỆT LIỆT CHÀO MỪNG NGÀY THÀNH LẬP ĐẢNG CỘNG SẢN VIỆT NAM (03/02/1930) – ĐẢNG QUANG VINH SOI ĐƯỜNG ĐỔI MỚI! 🇻🇳'
  },
  {
    month: 2,
    day: 27,
    message: '🩺 CHÀO MỪNG NGÀY THẦY THUỐC VIỆT NAM 27/02 – TRI ÂN CÁC Y BÁC SĨ VÀ CÁN BỘ TRẠM Y TẾ XÃ DI LINH! 💙'
  },
  {
    month: 3,
    day: 8,
    message: '💐 CHÚC MỪNG NGÀY QUỐC TẾ PHỤ NỮ 08/03 – KÍNH CHÚC CÁC BÀ, CÁC MẸ, CÁC CHỊ EM THÔN 6 LUÔN XINH ĐẸP, HẠNH PHÚC VÀ LÀM CHỦ CÔNG NGHỆ! 🌸'
  },
  {
    month: 3,
    day: 26,
    message: '⚡ NHIỆT LIỆT CHÀO MỪNG NGÀY THÀNH LẬP ĐOÀN TNCS HỒ CHÍ MINH (26/03/1931) – TUỔI TRẺ THÔN 6 TIÊN PHONG CHUYỂN ĐỔI SỐ CỘNG ĐỒNG! ✊'
  },
  {
    month: 4,
    day: 30,
    message: '🇻🇳 NHIỆT LIỆT CHÀO MỪNG KỶ NIỆM NGÀY GIẢI PHÓNG MIỀN NAM, THỐNG NHẤT ĐẤT NƯỚC (30/04/1975) – NON SÔNG THU VỀ MỘT MỐI! 🇻🇳'
  },
  {
    month: 5,
    day: 1,
    message: '🔨 CHÀO MỪNG NGÀY QUỐC TẾ LAO ĐỘNG (01/05) – TÔN VINH TINH THẦN LAO ĐỘNG SÁNG TẠO CỦA NHÂN DÂN THÔN 6! 🌾'
  },
  {
    month: 5,
    day: 19,
    message: '🌸 KỶ NIỆM NGÀY SINH CHỦ TỊCH HỒ CHÍ MINH VĨ ĐẠI (19/05/1890) – ĐỜI ĐỜI NHỚ ƠN BÁC HỒ KÍNH YÊU! 🇻🇳'
  },
  {
    month: 7,
    day: 27,
    message: '🕯️ KỶ NIỆM NGÀY THƯƠNG BINH - LIỆT SĨ (27/07) – ĐỜI ĐỜI NHỚ ƠN CÔNG LAO CÁC ANH HÙNG LIỆT SĨ ĐÃ HY SINH VÌ TỔ QUỐC! 🌹'
  },
  {
    month: 8,
    day: 19,
    message: '⭐ NHIỆT LIỆT CHÀO MỪNG KỶ NIỆM CÁCH MẠNG THÁNG TÁM THÀNH CÔNG VÀ NGÀY TRUYỀN THỐNG CÔNG AN NHÂN DÂN (19/08/1945)! 👮'
  },
  {
    month: 9,
    day: 2,
    message: '🇻🇳 NHIỆT LIỆT CHÀO MỪNG NGÀY QUỐC KHÁNH NƯỚC CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM (02/09/1945) – BẤT DIỆT TINH THẦN TUYÊN NGÔN ĐỘC LẬP! 🇻🇳'
  },
  {
    month: 10,
    day: 10,
    message: '💻 CHÀO MỪNG NGÀY CHUYỂN ĐỔI SỐ QUỐC GIA (10/10) – BÀ CON THÔN 6 TÍCH CỰC HỌC TẬP VÀ ỨNG DỤNG CÔNG NGHỆ SỐ VÀO CUỘC SỐNG! 🌐'
  },
  {
    month: 10,
    day: 20,
    message: '🌹 CHÀO MỪNG NGÀY PHỤ NỮ VIỆT NAM 20/10 – TÔN VINH VẺ ĐẸP VÀ ĐÓNG GÓP CỦA PHỤ NỮ VIỆT NAM TRONG KỶ NGUYÊN SỐ! 💖'
  },
  {
    month: 11,
    day: 18,
    message: '🤝 CHÀO MỪNG NGÀY HỘI ĐẠI ĐOÀN KẾT TOÀN DÂN TỘC (18/11) – NHÂN DÂN THÔN 6 ĐOÀN KẾT XÂY DỰNG NÔNG THÔN MỚI THÔNG MINH! 🏘️'
  },
  {
    month: 11,
    day: 20,
    message: '📚 NHIỆT LIỆT CHÀO MỪNG NGÀY NHÀ GIÁO VIỆT NAM 20/11 – KÍNH CHÚC CÁC THẦY CÔ GIÁO LUÔN MẠNH KHỎE VÀ HẠNH PHÚC! 💐'
  },
  {
    month: 12,
    day: 22,
    message: '🎖️ CHÀO MỪNG NGÀY THÀNH LẬP QUÂN ĐỘI NHÂN DÂN VIỆT NAM (22/12/1944) VÀ NGÀY HỘI QUỐC PHÒNG TOÀN DÂN! 🛡️'
  }
];

/**
 * Lấy danh sách thông điệp LED theo thời gian thực
 */
export function getDynamicLedMessages(customDate = new Date()) {
  const now = customDate;
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const hour = now.getHours();
  const dayOfWeek = now.getDay(); // 0: Chủ Nhật, 1-6: Thứ 2 -> Thứ 7

  const messages = [];

  // 1. KIỂM TRA NGÀY LỄ LỚN (Chính ngày hoặc trước/sau 2 ngày)
  const holiday = SPECIAL_HOLIDAYS.find(h => {
    if (h.month === month && h.day === day) return true;
    const holidayDate = new Date(now.getFullYear(), h.month - 1, h.day);
    const diffDays = Math.abs((now - holidayDate) / (1000 * 60 * 60 * 24));
    return diffDays <= 2;
  });

  if (holiday) {
    messages.push(holiday.message);
  }

  // 2. THÔNG ĐIỆP THEO KHUNG GIỜ / BUỔI TRONG NGÀY
  let timeGreeting = '';
  if (hour >= 5 && hour < 11) {
    timeGreeting = '🌅 CHÀO BUỔI SÁNG BÀ CON THÔN 6! Chúc bà con ngày mới tràn đầy năng lượng, lao động sản xuất hiệu quả và tích cực học tập kỹ năng số!';
  } else if (hour >= 11 && hour < 14) {
    timeGreeting = '☀️ BUỔI TRƯA AN LÀNH! Kính chúc bà con bữa trưa ngon miệng, nghỉ ngơi giữ gìn sức khỏe. Mọi thắc mắc công nghệ số đã có Trợ lý AI và Tổ CNS sẵn sàng hỗ trợ 24/7.';
  } else if (hour >= 14 && hour < 18) {
    timeGreeting = '🌤️ CHÀO BUỔI CHIỀU! Cùng nhân dân Thôn 6 chung tay thực hiện phong trào "Học số – Giúp nhau – Lan tỏa", xây dựng cộng đồng số văn minh, hiện đại!';
  } else if (hour >= 18 && hour < 22) {
    timeGreeting = '🌙 CHÀO BUỔI TỐI ẤM ÁP! Thời điểm thuận tiện để cùng gia đình xem video học quét QR BHYT, kích hoạt VNeID và cảnh giác trước các thủ đoạn lừa đảo mạng!';
  } else {
    timeGreeting = '🌌 ĐÊM KHUYA THANH BÌNH! Kính chúc bà con Thôn 6 giấc ngủ ngon. Cảnh báo: Tuyệt đối KHÔNG cung cấp mã OTP, mật khẩu ngân hàng cho bất kỳ ai qua điện thoại!';
  }
  messages.push(timeGreeting);

  // 3. THÔNG ĐIỆP THEO NGÀY TRONG TUẦN (LỊCH TẬP HUẤN / THI ĐUA)
  if (dayOfWeek === 6 || dayOfWeek === 0) {
    // Thứ 7 hoặc Chủ Nhật
    messages.push('📅 HÔM NAY CUỐI TUẦN: Tổ Công nghệ số Cộng đồng Thôn 6 & Đội Thanh niên tổ chức hỗ trợ CẦM TAY CHỈ VIỆC tại Nhà sinh hoạt cộng đồng và đến tận nhà bà con. Hotline: 0943.849.295!');
  } else {
    // Ngày trong tuần
    messages.push('📢 THÔNG BÁO: Bà con Thôn 6 cần hỗ trợ cài đặt VNeID Mức 2, quét mã QR BHYT khám bệnh hoặc làm Dịch vụ công xin bấm nút "🆘 Gửi Yêu Cầu Hỗ Trợ Số" để được tình nguyện viên đến tận nhà giúp đỡ.');
  }

  // 4. THÔNG ĐIỆP CẢNH BÁO AN TOÀN SỐ & KHẨU HIỆU THÔN 6
  messages.push('🛡️ NGUYÊN TẮC VÀNG AN TOÀN SỐ: Cơ quan Công an, Viện kiểm sát, Tòa án, Ngân hàng KHÔNG BAO GIỜ gọi điện thoại yêu cầu chuyển tiền hoặc đòi mã OTP.');
  messages.push('✨ PHONG TRÀO CHUYỂN ĐỔI SỐ THÔN 6 XÃ DI LINH: "Người biết nhiều chỉ người biết ít – Người biết ít chỉ người chưa biết – Lan tỏa kỹ năng số tới từng hộ gia đình".');

  return messages;
}
