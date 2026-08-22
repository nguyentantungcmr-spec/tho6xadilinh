import React, { useState, useEffect } from 'react';
import { 
  CloudSun, Droplets, Wind, TrendingUp, TrendingDown, Minus, 
  Sparkles, Calendar, ArrowUpRight, AlertCircle, Info, RefreshCw 
} from 'lucide-react';
import { getDailyWeatherAgriData, fetchLiveWeatherAgriData } from '../../services/weatherAgriService';

export default function WeatherAgriWidget() {
  const [data, setData] = useState(() => getDailyWeatherAgriData());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadLive();
  }, []);

  const loadLive = async () => {
    const live = await fetchLiveWeatherAgriData();
    if (live) setData(live);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const live = await fetchLiveWeatherAgriData();
    if (live) setData(live);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  const { weather, agriPrices } = data;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
      
      {/* 1. KHỐI THỜI TIẾT DI LINH (5 CỘT) */}
      <div className="lg:col-span-5 bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-800 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between border border-white/20">
        
        {/* NỀN TRANG TRÍ */}
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
        <div className="absolute -left-10 -top-10 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none"></div>

        <div>
          {/* HEADER */}
          <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-white/20 backdrop-blur-xs text-base">
                ⛅
              </span>
              <div>
                <h3 className="font-black text-sm text-white tracking-tight uppercase">
                  Thời Tiết Di Linh
                </h3>
                <span className="text-[11px] text-sky-200 font-bold">
                  {weather.date_str}
                </span>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              className="p-1.5 rounded-xl bg-white/15 hover:bg-white/30 text-white transition cursor-pointer"
              title="Làm mới thời tiết"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* NHIỆT ĐỘ CHÍNH & TỔNG QUAN */}
          <div className="flex items-center justify-between py-2 relative z-10">
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl sm:text-5xl font-black text-white drop-shadow-md">
                {weather.temp_current}°
              </span>
              <span className="text-sm font-bold text-sky-200">C</span>
              <div className="ml-2 text-xs font-semibold text-sky-100">
                <div>Cao: <strong className="text-amber-300">{weather.temp_max}°C</strong></div>
                <div>Thấp: <strong className="text-sky-200">{weather.temp_min}°C</strong></div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl mb-0.5">{weather.icon}</div>
              <div className="text-[11px] font-bold text-amber-300 max-w-[130px] leading-tight">
                {weather.condition}
              </div>
            </div>
          </div>

          {/* CHỈ SỐ PHỤ: ĐỘ ẨM, MƯA, GIÓ */}
          <div className="grid grid-cols-3 gap-2 py-3 border-t border-white/15 my-2 relative z-10 text-center">
            <div className="bg-white/10 rounded-xl p-1.5 backdrop-blur-2xs">
              <div className="text-[10px] text-sky-200 font-semibold flex items-center justify-center gap-1">
                <Droplets className="w-3 h-3 text-cyan-300" />
                <span>Độ ẩm</span>
              </div>
              <div className="font-black text-xs sm:text-sm mt-0.5 text-white">{weather.humidity}%</div>
            </div>

            <div className="bg-white/10 rounded-xl p-1.5 backdrop-blur-2xs">
              <div className="text-[10px] text-sky-200 font-semibold flex items-center justify-center gap-1">
                <CloudSun className="w-3 h-3 text-amber-300" />
                <span>Khả năng mưa</span>
              </div>
              <div className="font-black text-xs sm:text-sm mt-0.5 text-white">{weather.rain_probability}%</div>
            </div>

            <div className="bg-white/10 rounded-xl p-1.5 backdrop-blur-2xs">
              <div className="text-[10px] text-sky-200 font-semibold flex items-center justify-center gap-1">
                <Wind className="w-3 h-3 text-teal-300" />
                <span>Tốc độ gió</span>
              </div>
              <div className="font-black text-xs sm:text-sm mt-0.5 text-white">{weather.wind_speed}</div>
            </div>
          </div>

          {/* DỰ BÁO 4 BUỔI TRONG NGÀY */}
          <div className="grid grid-cols-4 gap-1.5 mb-3 relative z-10">
            {weather.forecast.map((f, i) => (
              <div key={i} className="bg-white/10 rounded-xl p-1.5 text-center text-[10px]">
                <div className="text-sky-200 font-bold">{f.time}</div>
                <div className="text-base my-0.5">{f.icon}</div>
                <div className="font-black text-white">{f.temp}</div>
              </div>
            ))}
          </div>
        </div>

        {/* LỜI KHUYÊN KHUYẾN NÔNG */}
        <div className="bg-white/15 backdrop-blur-md rounded-2xl p-2.5 border border-white/20 relative z-10 text-[11px] leading-relaxed text-sky-50">
          <span className="font-black text-amber-300 flex items-center gap-1 mb-0.5">
            <Sparkles className="w-3 h-3 text-amber-300" />
            Lưu ý canh tác:
          </span>
          <p>{weather.advice}</p>
        </div>

      </div>

      {/* 2. KHỐI BẢNG GIÁ NÔNG SẢN DI LINH HÔM NAY (7 CỘT) */}
      <div className="lg:col-span-7 bg-white rounded-3xl p-5 shadow-lg border border-slate-200 flex flex-col justify-between">
        
        <div>
          {/* HEADER BẢNG GIÁ */}
          <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-base shadow-xs">
                ☕
              </div>
              <div>
                <h3 className="font-black text-sm sm:text-base text-slate-900 tracking-tight uppercase flex items-center gap-1.5">
                  <span>Giá Nông Sản Di Linh Hôm Nay</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                    Trực Tiếp
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Cập nhật: <strong className="text-slate-800">{agriPrices.updated_at}</strong>
                </p>
              </div>
            </div>

            <span className="text-[10px] text-slate-400 font-bold hidden sm:inline-block">
              Đơn vị: VNĐ/kg
            </span>
          </div>

          {/* DANH SÁCH GIÁ NÔNG SẢN DẠNG LƯỚI / BẢNG GỌN GÀNG */}
          <div className="space-y-2">
            {agriPrices.items.map((item) => (
              <div 
                key={item.id}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 hover:bg-amber-50/60 border border-slate-100 hover:border-amber-200 transition group"
              >
                {/* TÊN VÀ BIỂU TƯỢNG */}
                <div className="flex items-center gap-2.5">
                  <span className="text-xl shrink-0 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </span>
                  <div>
                    <div className="font-black text-xs sm:text-sm text-slate-900 group-hover:text-amber-900 transition">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium truncate max-w-[200px] sm:max-w-[280px]">
                      {item.note}
                    </div>
                  </div>
                </div>

                {/* GIÁ TIỀN & XU HƯỚNG */}
                <div className="text-right shrink-0">
                  <div className="font-black text-xs sm:text-sm text-amber-700">
                    {item.price_str} <span className="text-[10px] font-bold text-slate-500">đ/{item.unit}</span>
                  </div>
                  <div className="flex items-center justify-end gap-1 text-[10px] font-bold">
                    {item.trend === 'up' && (
                      <span className="text-emerald-600 flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.2 rounded-md">
                        <TrendingUp className="w-2.5 h-2.5" />
                        <span>{item.change_str}</span>
                      </span>
                    )}
                    {item.trend === 'stable' && (
                      <span className="text-slate-500 flex items-center gap-0.5 bg-slate-100 px-1.5 py-0.2 rounded-md">
                        <Minus className="w-2.5 h-2.5" />
                        <span>{item.change_str}</span>
                      </span>
                    )}
                    {item.trend === 'down' && (
                      <span className="text-red-600 flex items-center gap-0.5 bg-red-50 px-1.5 py-0.2 rounded-md">
                        <TrendingDown className="w-2.5 h-2.5" />
                        <span>{item.change_str}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CHÂN BẢNG GIÁ */}
        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span>Nguồn: <strong>{agriPrices.source}</strong></span>
          <span className="text-amber-600 font-bold flex items-center gap-0.5">
            <span>Tổ CNS hỗ trợ kết nối đầu ra</span>
            <span>↗</span>
          </span>
        </div>

      </div>

    </div>
  );
}
