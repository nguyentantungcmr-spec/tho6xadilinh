import { supabase } from './supabaseClient';
import { REAL_INITIAL_DATA } from './dbSeederService';

/**
 * SERVICE THỜI TIẾT & BẢNG GIÁ NÔNG SẢN DI LINH (SUPABASE POSTGRESQL)
 */

export async function fetchLiveWeatherAgriData() {
  try {
    const [pricesRes, weatherRes] = await Promise.all([
      supabase.from('agri_market_prices').select('*').order('sort_order', { ascending: true }),
      supabase.from('weather_daily').select('*').eq('id', 'current_weather').single()
    ]);

    let agriItems = REAL_INITIAL_DATA.agri_market_prices;
    if (!pricesRes.error && pricesRes.data && pricesRes.data.length > 0) {
      agriItems = pricesRes.data;
    }

    let weatherData = REAL_INITIAL_DATA.weather_daily[0];
    if (!weatherRes.error && weatherRes.data) {
      weatherData = weatherRes.data;
    }

    return {
      weather: weatherData,
      agriPrices: {
        updated_at: `Cập nhật hôm nay (${new Date().toLocaleDateString('vi-VN')})`,
        source: 'Hiệp hội Nông Nghiệp & Thương lái Di Linh',
        items: agriItems
      }
    };
  } catch (err) {
    console.error('Error fetching live weather & agri data:', err);
    return getDailyWeatherAgriData();
  }
}

export function getDailyWeatherAgriData() {
  return {
    weather: REAL_INITIAL_DATA.weather_daily[0],
    agriPrices: {
      updated_at: `Cập nhật hôm nay (${new Date().toLocaleDateString('vi-VN')})`,
      source: 'Hiệp hội Nông Nghiệp & Thương lái Di Linh',
      items: REAL_INITIAL_DATA.agri_market_prices
    }
  };
}

export async function updateAgriPriceItem(id, updateData) {
  try {
    const { data, error } = await supabase
      .from('agri_market_prices')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    return { data: data[0], error: null };
  } catch (err) {
    console.error('Error updating agri price item:', err);
    return { data: null, error: err.message };
  }
}

export async function updateWeatherDaily(weatherData) {
  try {
    const { data, error } = await supabase
      .from('weather_daily')
      .update({
        ...weatherData,
        updated_at: new Date().toISOString()
      })
      .eq('id', 'current_weather')
      .select();

    if (error) throw error;
    return { data: data[0], error: null };
  } catch (err) {
    console.error('Error updating weather:', err);
    return { data: null, error: err.message };
  }
}
