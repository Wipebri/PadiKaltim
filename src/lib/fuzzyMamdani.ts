import { SoilParameters, EvaluationResult } from "@/types";

export const DEFAULT_SOIL_PARAMETERS: SoilParameters = {
  temp: 26.0,
  humidity: 80,
  rainfall: 220,
  ph: 5.5,
  n: 75,
  p: 45,
  k: 40,
};

export function evaluateSoilSuitability(params: SoilParameters): EvaluationResult {
  const { temp, humidity, rainfall, ph, n, p, k } = params;

  // 1. Suhu (°C): Optimal 20 - 27 °C
  let sTemp = 1.0;
  if (temp < 15 || temp > 35) sTemp = 0.25;
  else if (temp < 20) sTemp = 0.5 + (temp - 15) * 0.1;
  else if (temp > 27) sTemp = Math.max(0.3, 1.0 - (temp - 27) * 0.09);

  // 2. Kelembapan (%): Optimal 80 - 85 %
  let sHumidity = 1.0;
  if (humidity < 60 || humidity > 95) sHumidity = 0.3;
  else if (humidity < 80) sHumidity = 0.5 + (humidity - 60) * 0.025;
  else if (humidity > 85) sHumidity = Math.max(0.4, 1.0 - (humidity - 85) * 0.07);

  // 3. Curah Hujan (mm): Optimal 180 - 300 mm
  let sRainfall = 1.0;
  if (rainfall < 100 || rainfall > 450) sRainfall = 0.3;
  else if (rainfall < 180) sRainfall = 0.5 + (rainfall - 100) * 0.00625;
  else if (rainfall > 300) sRainfall = Math.max(0.3, 1.0 - (rainfall - 300) * 0.0046);

  // 4. pH Tanah: Optimal 5.5 - 7.5 (Ultisol Kaltim sering 5.0 - 5.5)
  let sPh = 1.0;
  if (ph < 4.0 || ph > 8.5) sPh = 0.2;
  else if (ph < 5.5) sPh = 0.5 + (ph - 4.0) * 0.33;
  else if (ph > 7.5) sPh = Math.max(0.3, 1.0 - (ph - 7.5) * 0.5);

  // 5. Nitrogen / N (mg/kg): Optimal 60 - 99 mg/kg
  let sN = 1.0;
  if (n < 40) sN = 0.4 + (n / 40) * 0.2;
  else if (n < 60) sN = 0.6 + ((n - 40) / 20) * 0.4;
  else if (n > 99) sN = Math.max(0.7, 1.0 - ((n - 99) / 40) * 0.3);

  // 6. Phosphorus / P (mg/kg): Optimal 35 - 60 mg/kg
  let sP = 1.0;
  if (p < 20) sP = 0.4 + (p / 20) * 0.2;
  else if (p < 35) sP = 0.6 + ((p - 20) / 15) * 0.4;
  else if (p > 60) sP = Math.max(0.7, 1.0 - ((p - 60) / 40) * 0.3);

  // 7. Potassium / K (mg/kg): Optimal 35 - 45 mg/kg
  let sK = 1.0;
  if (k < 20) sK = 0.4 + (k / 20) * 0.2;
  else if (k < 35) sK = 0.6 + ((k - 20) / 15) * 0.4;
  else if (k > 45) sK = Math.max(0.7, 1.0 - ((k - 45) / 40) * 0.3);

  const sNPK = (sN + sP + sK) / 3;

  // Weighted Mamdani Composite Centroid
  const compositeScore =
    (sTemp * 0.2 + sHumidity * 0.15 + sRainfall * 0.25 + sPh * 0.2 + sNPK * 0.2) * 100;
  const finalScoreNum = Math.min(98.5, Math.max(15.0, compositeScore));
  const score = finalScoreNum.toFixed(1);

  // Status & Recommendations
  let statusBadgeColor = "#00A651";
  let statusBadgeTextColor = "#FFFFFF";
  let statusTitle = "STATUS: SANGAT LAYAK TUMBUH";
  let headline = "Lahan Sangat Potensial untuk Musim Tanam Ini";
  let scoreCategory = "Kategori: Sangat Baik";
  let summary = `Kondisi suhu (${temp}°C), kelembapan (${humidity}%), dan curah hujan (${rainfall} mm) sangat mendukung fase vegetatif maupun generatif tanaman padi.`;

  if (finalScoreNum >= 70.0) {
    statusBadgeColor = "#00A651"; // GoPay Green
    statusBadgeTextColor = "#FFFFFF";
    statusTitle = "STATUS: SANGAT LAYAK TUMBUH";
    headline = "Lahan Sangat Potensial untuk Musim Tanam Ini";
    scoreCategory = "Kategori: Sangat Baik";
    summary = `Kondisi suhu (${temp}°C), kelembapan (${humidity}%), dan curah hujan (${rainfall} mm) sangat mendukung fase vegetatif maupun generatif tanaman padi.`;
  } else if (finalScoreNum >= 50.0) {
    statusBadgeColor = "#F7EB5F"; // GoPay Yellow
    statusBadgeTextColor = "#182430";
    statusTitle = "STATUS: CUKUP LAYAK (PERLU REKAYASA)";
    headline = "Lahan Layak dengan Intervensi Agronomi Terarah";
    scoreCategory = "Kategori: Cukup Baik";
    summary = `Terdapat faktor pembatas pada pH (${ph}) atau ketersediaan hara tanah yang memerlukan pengapuran dolomit dan penyesuaian pemupukan berimbang.`;
  } else {
    statusBadgeColor = "#E53935"; // Red
    statusBadgeTextColor = "#FFFFFF";
    statusTitle = "STATUS: KURANG LAYAK";
    headline = "Kondisi Lahan Berisiko Tinggi untuk Penanaman Padi";
    scoreCategory = "Kategori: Kurang Sesuai";
    summary = `Kombinasi parameter cuaca ekstrem atau tanah sangat masam (pH ${ph}) dapat menyebabkan kegagalan panen jika tidak dilakukan perbaikan struktur tanah mendalam.`;
  }

  // Dynamic recommendations
  let recPh = "";
  if (ph < 5.0) {
    recPh = `pH tanah tergolong sangat masam (<strong>${ph}</strong>). Wajib aplikasikan kapur pertanian (Dolomit) <strong>2.5 - 3.5 ton/ha</strong> 3 minggu sebelum olah tanah untuk menonaktifkan racun ion Al-dd.`;
  } else if (ph <= 5.5) {
    recPh = `pH tanah khas Ultisol Kaltim (<strong>${ph}</strong>). Berikan kapur Dolomit <strong>1.5 - 2.0 ton/ha</strong> untuk menaikkan pH menuju kisaran optimal (5.5 - 6.5).`;
  } else {
    recPh = `pH tanah optimal (<strong>${ph}</strong>). Tidak diperlukan pengapuran masif, cukup pemeliharaan bahan organik (kompos/pupuk kandang) 2 ton/ha.`;
  }

  const recNpk = `Kandungan hara N (${n} mg/kg), P (${p} mg/kg), K (${k} mg/kg). Dosis rekomendasi: Urea ${
    n < 60 ? 200 : 150
  } kg/ha, SP-36 ${p < 35 ? 120 : 80} kg/ha, dan KCl ${
    k < 35 ? 80 : 50
  } kg/ha terbagi 3 tahap pemupukan.`;

  let recWater = "";
  if (rainfall > 300) {
    recWater = `Curah hujan tinggi (<strong>${rainfall} mm</strong>). Perbaiki saluran drainase pembuangan air agar tanaman tidak tergenang lebih dari 5 cm saat anakan aktif.`;
  } else if (rainfall < 180) {
    recWater = `Curah hujan rendah (<strong>${rainfall} mm</strong>). Siapkan pompa cadangan atau tampungan embung untuk memastikan kecukupan air fase bunting.`;
  } else {
    recWater = `Curah hujan ideal (<strong>${rainfall} mm</strong>). Terapkan sistem pengairan basah-kering berselang (intermittent) untuk menghemat air dan memperkuat perakaran.`;
  }

  return {
    score,
    statusBadgeColor,
    statusBadgeTextColor,
    statusTitle,
    headline,
    scoreCategory,
    summary,
    recommendations: {
      ph: recPh,
      npk: recNpk,
      water: recWater,
    },
  };
}
