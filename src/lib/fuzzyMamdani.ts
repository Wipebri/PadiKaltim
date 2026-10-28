import { SoilParameters, EvaluationResult, RiskFactor } from "@/types";

export const DEFAULT_SOIL_PARAMETERS: SoilParameters = {
  temp: 26.0,
  humidity: 75,
  rainfall: 220,
  ph: 6.5,
  n: 75,
  p: 45,
  k: 40,
};

/**
 * Fungsi Keanggotaan Trapesium (Trapezoidal Membership Function)
 * Meniru persis skfuzzy.trapmf pada universe kontinu
 */
function trapmf(x: number, [a, b, c, d]: [number, number, number, number]): number {
  if (x < a || x > d) return 0.0;
  if (x >= b && x <= c) return 1.0;
  if (a < x && x < b) return b > a ? (x - a) / (b - a) : 1.0;
  if (c < x && x < d) return d > c ? (d - x) / (d - c) : 1.0;
  return 0.0;
}

/**
 * Defuzzifikasi Centroid Geometris Segmen Linear
 * Meniru persis algoritma skfuzzy.defuzzify.centroid
 */
function calcCentroid(x: number[], mfx: number[]): number {
  let sumMomentArea = 0.0;
  let sumArea = 0.0;

  for (let i = 1; i < x.length; i++) {
    const x1 = x[i - 1];
    const x2 = x[i];
    const y1 = mfx[i - 1];
    const y2 = mfx[i];

    if (!(y1 === 0.0 && y2 === 0.0) && x1 !== x2) {
      let moment = 0.0;
      let area = 0.0;

      if (y1 === y2) {
        moment = 0.5 * (x1 + x2);
        area = (x2 - x1) * y1;
      } else if (y1 === 0.0 && y2 !== 0.0) {
        moment = (2.0 / 3.0) * (x2 - x1) + x1;
        area = 0.5 * (x2 - x1) * y2;
      } else if (y2 === 0.0 && y1 !== 0.0) {
        moment = (1.0 / 3.0) * (x2 - x1) + x1;
        area = 0.5 * (x2 - x1) * y1;
      } else {
        moment = ((2.0 / 3.0 * (x2 - x1) * (y2 + 0.5 * y1)) / (y1 + y2)) + x1;
        area = 0.5 * (x2 - x1) * (y1 + y2);
      }

      sumMomentArea += moment * area;
      sumArea += area;
    }
  }

  return sumArea > 1e-15 ? sumMomentArea / sumArea : 50.0;
}

// Pre-compute output universe & membership curves (0..100)
const Y_UNIVERSE: number[] = Array.from({ length: 101 }, (_, i) => i);
const MF_TIDAK_LAYAK = Y_UNIVERSE.map((yi) => trapmf(yi, [0, 0, 30, 50]));
const MF_LAYAK = Y_UNIVERSE.map((yi) => trapmf(yi, [45, 65, 100, 100]));

/** Setara np.arange(start, stop, step) */
function arange(start: number, stop: number, step: number): number[] {
  const len = Math.ceil((stop - start) / step);
  return Array.from({ length: len }, (_, i) => start + i * step);
}

// Universe input identik dengan notebook / backend skfuzzy (ctrl.Antecedent)
const U = {
  ph: arange(4.5, 8.51, 0.1),
  n: arange(5, 151, 1),
  p: arange(5, 91, 1),
  k: arange(10, 101, 1),
  temp: arange(10, 45.5, 0.5),
  humidity: arange(30, 101, 1),
  rainfall: arange(20, 401, 1),
};

/**
 * Derajat keanggotaan versi skfuzzy: kurva trapesium disampling pada universe diskret,
 * lalu nilai input diinterpolasi linear (np.interp) dan di-clip ke batas universe
 * (perilaku default ControlSystemSimulation, clip_to_bounds=True).
 */
function fuzzMembership(universe: number[], abcd: [number, number, number, number], x: number): number {
  const lo = universe[0];
  const hi = universe[universe.length - 1];
  const xc = Math.min(hi, Math.max(lo, x));
  for (let i = 1; i < universe.length; i++) {
    if (xc <= universe[i]) {
      const x0 = universe[i - 1];
      const x1 = universe[i];
      const y0 = trapmf(x0, abcd);
      const y1 = trapmf(x1, abcd);
      return x1 === x0 ? y1 : y0 + ((y1 - y0) * (xc - x0)) / (x1 - x0);
    }
  }
  return trapmf(hi, abcd);
}

export function evaluateSoilSuitability(params: SoilParameters): EvaluationResult {
  const { temp, humidity, rainfall, ph, n, p, k } = params;

  // 1. FUZZIFIKASI INPUT
  const muPhAsam = fuzzMembership(U.ph, [4.5, 4.5, 5.6, 6.4], ph);
  const muPhIdeal = fuzzMembership(U.ph, [5.6, 6.4, 7.6, 8.4], ph);
  const muPhBasa = fuzzMembership(U.ph, [7.6, 8.4, 8.5, 8.5], ph);

  const muNKurang = fuzzMembership(U.n, [5, 5, 34.2, 43.2], n);
  const muPKurang = fuzzMembership(U.p, [5, 5, 22.3, 30.3], p);
  const muKKurang = fuzzMembership(U.k, [10, 10, 28.4, 36.4], k);

  const muTempPanas = fuzzMembership(U.temp, [32, 40, 45, 45], temp);
  const muHumKering = fuzzMembership(U.humidity, [30, 30, 42, 50.6], humidity);
  const muHumTinggi = fuzzMembership(U.humidity, [78, 86.4, 100, 100], humidity);

  const muRainRendah = fuzzMembership(U.rainfall, [20, 20, 108.6, 138.6], rainfall);
  const muRainTinggi = fuzzMembership(U.rainfall, [292, 322, 400, 400], rainfall);

  // 2. BASIS ATURAN MAMDANI (8 ATURAN)
  const haraRendah = Math.max(
    Math.min(muNKurang, muPKurang),
    Math.min(muNKurang, muKKurang),
    Math.min(muPKurang, muKKurang)
  );

  const kekeringan = Math.min(muRainRendah, muTempPanas, muHumKering);
  const hujanBerlebih = Math.min(muRainTinggi, muHumTinggi);

  // Rule 1: Ideal dan TIDAK ADA kondisi risiko -> Layak
  const actLayak = Math.min(
    muPhIdeal,
    1.0 - haraRendah,
    1.0 - kekeringan,
    1.0 - hujanBerlebih
  );

  // Rules 2-8: Kondisi risiko -> Tidak Layak
  const actTidakLayak = Math.max(
    Math.min(muNKurang, muPKurang),
    Math.min(muNKurang, muKKurang),
    Math.min(muPKurang, muKKurang),
    muPhAsam,
    muPhBasa,
    kekeringan,
    hujanBerlebih
  );

  // 3. DEFUZZIFIKASI CENTROID
  // Sama seperti skfuzzy (CrispValueCalculator.find_memberships): universe output
  // di-upsample dengan titik potong tiap kurva terhadap level aktivasinya.
  const terms: Array<[number[], number]> = [
    [MF_TIDAK_LAYAK, actTidakLayak],
    [MF_LAYAK, actLayak],
  ];
  const extra: number[] = [];
  for (const [mf, cut] of terms) {
    for (let i = 0; i < mf.length - 1; i++) {
      const a = cut === 0 ? mf[i] > cut : mf[i] >= cut;
      const b = cut === 0 ? mf[i + 1] > cut : mf[i + 1] >= cut;
      if (a !== b) {
        extra.push(Y_UNIVERSE[i] + ((cut - mf[i]) * (Y_UNIVERSE[i + 1] - Y_UNIVERSE[i])) / (mf[i + 1] - mf[i]));
      }
    }
  }
  const upsUniverse = Array.from(new Set([...Y_UNIVERSE, ...extra])).sort((a, b) => a - b);
  const interpOut = (mf: number[], x: number): number => {
    const i = Math.min(Math.floor(x), Y_UNIVERSE.length - 2);
    return mf[i] + (mf[i + 1] - mf[i]) * (x - Y_UNIVERSE[i]);
  };
  const mfxAgg = upsUniverse.map((x) =>
    Math.max(...terms.map(([mf, cut]) => Math.min(cut, interpOut(mf, x))))
  );

  const rawScore = calcCentroid(upsUniverse, mfxAgg);
  const score = rawScore.toFixed(2); // hanya untuk tampilan
  const finalScoreNum = rawScore; // klasifikasi pakai skor asli (tanpa pembulatan), sama seperti notebook

  // 4. KATEGORISASI & STATUS KEPUTUSAN (Cell 11 Notebook)
  let statusBadgeColor = "#00AA13"; // GoPay Green
  let statusBadgeTextColor = "#FFFFFF";
  let statusTitle = "STATUS: SANGAT LAYAK TUMBUH (AMAN)";
  let headline = "Lahan Sangat Potensial untuk Pertumbuhan Padi";
  let scoreCategory = "Kategori: AMAN";
  let summary = "Kondisi mendukung. Pertahankan pengelolaan saat ini dan pantau rutin.";

  if (finalScoreNum >= 70.0) {
    statusBadgeColor = "#00AA13";
    statusBadgeTextColor = "#FFFFFF";
    statusTitle = "STATUS: SANGAT LAYAK TUMBUH (AMAN)";
    headline = "Lahan Sangat Potensial untuk Pertumbuhan Padi";
    scoreCategory = "Kategori: AMAN";
    summary = "Kondisi mendukung. Pertahankan pengelolaan saat ini dan pantau rutin.";
  } else if (finalScoreNum >= 50.0) {
    statusBadgeColor = "#F7EB5F";
    statusBadgeTextColor = "#182430";
    statusTitle = "STATUS: CUKUP LAYAK TUMBUH (WASPADA)";
    headline = "Lahan Layak dengan Tindakan Pemeliharaan Terarah";
    scoreCategory = "Kategori: WASPADA";
    summary = "Masih layak tetapi mendekati batas. Lakukan perbaikan pada faktor yang ditandai di bawah.";
  } else if (finalScoreNum >= 35.0) {
    statusBadgeColor = "#FF8000";
    statusBadgeTextColor = "#FFFFFF";
    statusTitle = "STATUS: KURANG LAYAK (BERISIKO)";
    headline = "Kondisi Lahan Berisiko, Diperlukan Intervensi Sebelum Tanam";
    scoreCategory = "Kategori: BERISIKO";
    summary = "Tidak layak. Perbaiki faktor risiko di bawah sebelum penanaman.";
  } else {
    statusBadgeColor = "#EE2737"; // GoPay Red
    statusBadgeTextColor = "#FFFFFF";
    statusTitle = "STATUS: TIDAK LAYAK (BERISIKO TINGGI)";
    headline = "Kondisi Lahan Berisiko Tinggi, Tunda Penanaman Sampai Faktor Diatasi";
    scoreCategory = "Kategori: BERISIKO TINGGI";
    summary = "Tidak layak. Tunda penanaman sampai faktor risiko utama diatasi.";
  }

  // 5. REKOMENDASI AGRONOMI SPESIFIK & MITIGASI (Cell 11 Notebook)
  // Rekomendasi pH
  let recPh = "";
  if (muPhAsam > 0) {
    if (ph < 5.0) {
      recPh = `pH tanah tergolong sangat masam (<strong>${ph.toFixed(1)}</strong>, derajat asam: ${muPhAsam.toFixed(2)}). Wajib aplikasikan kapur pertanian (Dolomit) <strong>2.5 - 3.5 ton/ha</strong> 3 minggu sebelum olah tanah untuk menonaktifkan racun aluminium Al-dd dan tambahkan bahan organik.`;
    } else {
      recPh = `pH tanah masam khas Ultisol Kaltim (<strong>${ph.toFixed(1)}</strong>, derajat asam: ${muPhAsam.toFixed(2)}). Naikkan pH dengan pengapuran (kapur/dolomit <strong>1.5 - 2.0 ton/ha</strong>) dan tambahkan bahan organik.`;
    }
  } else if (muPhBasa > 0) {
    recPh = `pH tanah tergolong basa (<strong>${ph.toFixed(1)}</strong>, derajat basa: ${muPhBasa.toFixed(2)}). Turunkan pH dengan penambahan bahan organik, belerang, atau gypsum serta perbaiki drainase lahan.`;
  } else {
    recPh = `pH tanah optimal (<strong>${ph.toFixed(1)}</strong>, kisaran ideal 5.6 - 8.4). Kondisi kemasaman tanah sangat mendukung penyerapan hara tanpa perlu pengapuran masif. Cukup pemeliharaan bahan organik rutin 2 ton/ha.`;
  }

  // Rekomendasi Pemupukan NPK
  const haraItems: string[] = [];
  if (muNKurang > 0) {
    const tag = muNKurang >= 0.5 ? "rendah" : "mendekati rendah";
    haraItems.push(`Nitrogen (N=${n.toFixed(0)} mg/kg, ${tag}): Tambah pupuk N (Urea 150-200 kg/ha terbagi 2-3 kali pemupukan). Hindari dosis berlebih.`);
  }
  if (muPKurang > 0) {
    const tag = muPKurang >= 0.5 ? "rendah" : "mendekati rendah";
    haraItems.push(`Fosfor (P=${p.toFixed(0)} mg/kg, ${tag}): Tambah pupuk P (SP-36 80-120 kg/ha) diaplikasikan seluruhnya saat tanam sebagai pupuk dasar.`);
  }
  if (muKKurang > 0) {
    const tag = muKKurang >= 0.5 ? "rendah" : "mendekati rendah";
    haraItems.push(`Kalium (K=${k.toFixed(0)} mg/kg, ${tag}): Tambah pupuk K (KCl 50-80 kg/ha) untuk memperkuat batang dan pengisian gabah.`);
  }

  const nRendahAktif = muNKurang >= 0.5;
  const pRendahAktif = muPKurang >= 0.5;
  const kRendahAktif = muKKurang >= 0.5;
  const jumlahHaraRendah = [nRendahAktif, pRendahAktif, kRendahAktif].filter(Boolean).length;

  let recNpk = "";
  if (jumlahHaraRendah >= 2) {
    recNpk = `<strong>Peringatan Defisiensi Hara Kritis (≥2 unsur rendah):</strong> Prioritaskan pemupukan lengkap N-P-K sesuai unsur yang defisit. ${haraItems.join(" ")}`;
  } else if (haraItems.length > 0) {
    recNpk = haraItems.join(" ");
  } else {
    recNpk = `Kandungan hara N (${n.toFixed(0)} mg/kg), P (${p.toFixed(0)} mg/kg), K (${k.toFixed(0)} mg/kg) berada dalam rentang cukup. Pertahankan kesuburan tanah dengan pemupukan berimbang teratur.`;
  }

  // Rekomendasi Manajemen Air & Iklim
  let recWater = "";
  if (kekeringan >= 0.25) {
    const derajatKet = kekeringan >= 0.5 ? "tinggi" : "waspada";
    recWater = `<strong>Indikasi Risiko Kekeringan (${derajatKet}, derajat: ${kekeringan.toFixed(2)}):</strong> Curah hujan ${rainfall.toFixed(0)} mm, suhu ${temp.toFixed(1)}°C, kelembapan ${humidity.toFixed(0)}%. Siapkan irigasi suplementer, gunakan mulsa jerami, geser jadwal tanam, atau pilih varietas toleran kekeringan/panas.`;
  } else if (hujanBerlebih >= 0.25) {
    const derajatKet = hujanBerlebih >= 0.5 ? "tinggi" : "waspada";
    recWater = `<strong>Indikasi Risiko Hujan Berlebih (${derajatKet}, derajat: ${hujanBerlebih.toFixed(2)}):</strong> Curah hujan ${rainfall.toFixed(0)} mm, kelembapan ${humidity.toFixed(0)}%. Perbaiki saluran drainase/saluran pembuangan air agar lahan tidak tergenang berlebih, pantau potensi penyakit jamur blast, dan pertimbangkan varietas toleran genangan.`;
  } else {
    recWater = `Kondisi curah hujan (${rainfall.toFixed(0)} mm), suhu (${temp.toFixed(1)}°C), dan kelembapan (${humidity.toFixed(0)}%) berada dalam zona aman iklim padi sawah. Terapkan pengairan basah-kering berselang (intermittent) untuk menghemat air dan memperkuat perakaran.`;
  }

  // Daftar Faktor Risiko Terdeteksi
  const riskFactors: RiskFactor[] = [];
  if (muPhAsam >= 0.5) {
    riskFactors.push({
      name: "pH Asam",
      degree: muPhAsam,
      advice: "Naikkan pH dengan pengapuran (kapur/dolomit) dan tambahkan bahan organik.",
      level: "aktif",
    });
  } else if (muPhAsam >= 0.25) {
    riskFactors.push({
      name: "pH Mendekati Asam",
      degree: muPhAsam,
      advice: "Pantau kemasaman tanah dan persiapkan dolomit jika pH terus turun.",
      level: "waspada",
    });
  }

  if (muPhBasa >= 0.5) {
    riskFactors.push({
      name: "pH Basa",
      degree: muPhBasa,
      advice: "Turunkan pH dengan bahan organik, belerang, atau gypsum; perbaiki drainase.",
      level: "aktif",
    });
  }

  if (kekeringan >= 0.25) {
    riskFactors.push({
      name: "Kekeringan",
      degree: kekeringan,
      advice: "Siapkan irigasi suplementer, gunakan mulsa, atau pilih varietas toleran kekeringan.",
      level: kekeringan >= 0.5 ? "aktif" : "waspada",
    });
  }

  if (hujanBerlebih >= 0.25) {
    riskFactors.push({
      name: "Hujan Berlebih",
      degree: hujanBerlebih,
      advice: "Perbaiki drainase saluran air dan pantau penyakit jamur tanaman.",
      level: hujanBerlebih >= 0.5 ? "aktif" : "waspada",
    });
  }

  if (jumlahHaraRendah >= 2) {
    riskFactors.push({
      name: "Kekurangan Hara (≥2 Unsur Rendah)",
      degree: Math.min(...[muNKurang, muPKurang, muKKurang].sort().slice(1)),
      advice: "Prioritaskan pemupukan lengkap N-P-K sesuai unsur yang defisit.",
      level: "aktif",
    });
  }

  const statusSpk: "Tumbuh" | "Tidak Tumbuh" = finalScoreNum >= 50.0 ? "Tumbuh" : "Tidak Tumbuh";

  return {
    score,
    statusSpk,
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
    riskFactors,
  };
}
