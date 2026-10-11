import numpy as np
from typing import Dict, Any

# --------------------------------------------------------------------------
# Membership Helper Functions (Triangular & Trapezoidal)
# --------------------------------------------------------------------------
def trimf(x: float, abc: list[float]) -> float:
    a, b, c = abc
    if x <= a or x >= c:
        return 0.0
    if a < x <= b:
        return (x - a) / (b - a) if b > a else 1.0
    if b < x < c:
        return (c - x) / (c - b) if c > b else 1.0
    return 0.0

def trapmf(x: float, abcd: list[float]) -> float:
    a, b, c, d = abcd
    if x <= a or x >= d:
        return 0.0
    if a < x < b:
        return (x - a) / (b - a) if b > a else 1.0
    if b <= x <= c:
        return 1.0
    if c < x < d:
        return (d - x) / (d - c) if d > c else 1.0
    return 0.0

# --------------------------------------------------------------------------
# Fuzzy Mamdani Inference Engine
# --------------------------------------------------------------------------
def evaluate_fuzzy_mamdani(
    temperature: float,
    humidity: float,
    rainfall: float,
    ph: float,
    n: float,
    p: float,
    k: float,
) -> Dict[str, Any]:
    """
    Evaluasi Kelayakan Tanam Padi Berbasis Fuzzy Mamdani (7 Input, 1 Output)
    Output Universe: 0 - 100
    Defuzzifikasi: Centroid (Pusat Gravitasi)
    """

    # 1. FUZZIFIKASI INPUT
    # Temperature (°C)
    t_rendah = trapmf(temperature, [0.0, 0.0, 15.0, 21.0])
    t_optimal = trimf(temperature, [19.0, 24.5, 28.5])
    t_tinggi = trapmf(temperature, [26.5, 32.0, 50.0, 50.0])

    # Humidity (%)
    h_rendah = trapmf(humidity, [0.0, 0.0, 55.0, 72.0])
    h_optimal = trimf(humidity, [68.0, 81.0, 89.0])
    h_tinggi = trapmf(humidity, [86.0, 93.0, 100.0, 100.0])

    # Rainfall (mm)
    r_rendah = trapmf(rainfall, [0.0, 0.0, 120.0, 175.0])
    r_optimal = trimf(rainfall, [160.0, 235.0, 310.0])
    r_tinggi = trapmf(rainfall, [285.0, 380.0, 1000.0, 1000.0])

    # pH Tanah
    ph_masam = trapmf(ph, [0.0, 0.0, 4.8, 5.5])
    ph_normal = trimf(ph, [5.1, 6.2, 7.5])
    ph_basa = trapmf(ph, [7.2, 8.2, 14.0, 14.0])

    # Nitrogen (mg/kg)
    n_kurang = trapmf(n, [0.0, 0.0, 45.0, 60.0])
    n_cukup = trimf(n, [55.0, 75.0, 95.0])
    n_lebih = trapmf(n, [88.0, 110.0, 140.0, 140.0])

    # Phosphorus (mg/kg)
    p_kurang = trapmf(p, [0.0, 0.0, 25.0, 36.0])
    p_cukup = trimf(p, [32.0, 46.0, 62.0])
    p_lebih = trapmf(p, [58.0, 75.0, 100.0, 100.0])

    # Potassium (mg/kg)
    k_kurang = trapmf(k, [0.0, 0.0, 25.0, 36.0])
    k_cukup = trimf(k, [32.0, 42.0, 52.0])
    k_lebih = trapmf(k, [48.0, 65.0, 100.0, 100.0])

    # 2. EVALUASI 15 ATURAN FUZZY (MAMDANI MIN IMPLICATION)
    # Target linguistic: 0 = Tidak Layak, 1 = Cukup Layak, 2 = Sangat Layak
    rules = [
        # R1: Semua optimal & cukup -> Sangat Layak
        (min(t_optimal, h_optimal, r_optimal, ph_normal, n_cukup, p_cukup, k_cukup), 2),
        # R2: Iklim optimal, tanah Ultisol agak masam tapi hara cukup -> Sangat Layak
        (min(t_optimal, r_optimal, ph_masam, n_cukup, p_cukup), 2),
        # R3: Suhu optimal, curah hujan tinggi, pH masam -> Cukup Layak
        (min(t_optimal, r_tinggi, ph_masam), 1),
        # R4: Suhu tinggi, curah hujan rendah -> Tidak Layak
        (min(t_tinggi, r_rendah), 0),
        # R5: Curah hujan sangat tinggi (banjir) -> Tidak Layak
        (min(r_tinggi, h_tinggi), 0),
        # R6: Curah hujan rendah (kekeringan) -> Tidak Layak
        (min(r_rendah, t_optimal), 0),
        # R7: pH sangat masam (ekstrem) & hara kurang -> Tidak Layak
        (min(ph_masam, n_kurang, p_kurang), 0),
        # R8: pH normal, iklim optimal, salah satu hara kurang -> Cukup Layak
        (min(ph_normal, t_optimal, max(n_kurang, p_kurang, k_kurang)), 1),
        # R9: Iklim optimal, N & P cukup, K kurang -> Cukup Layak
        (min(t_optimal, r_optimal, n_cukup, p_cukup, k_kurang), 1),
        # R10: Kelembapan sangat tinggi, suhu tinggi (rentan jamur/blast) -> Cukup Layak
        (min(h_tinggi, t_tinggi), 1),
        # R11: N berlebih, iklim optimal -> Cukup Layak
        (min(n_lebih, t_optimal, r_optimal), 1),
        # R12: pH basa ekstrem -> Tidak Layak
        (ph_basa, 0),
        # R13: Suhu rendah ekstrem -> Tidak Layak
        (t_rendah, 0),
        # R14: Iklim ideal, hara N P K lengkap cukup -> Sangat Layak
        (min(t_optimal, h_optimal, n_cukup, p_cukup, k_cukup), 2),
        # R15: Curah hujan optimal, pH normal, N cukup -> Sangat Layak
        (min(r_optimal, ph_normal, n_cukup), 2),
    ]

    # Agregasi Max untuk tiap kelas konsekuensi
    act_tidak_layak = max([act for act, cons in rules if cons == 0] + [0.0])
    act_cukup_layak = max([act for act, cons in rules if cons == 1] + [0.0])
    act_sangat_layak = max([act for act, cons in rules if cons == 2] + [0.0])

    # 3. DEFUZZIFIKASI CENTROID (DISKRITISASI 101 TITIK)
    x = np.linspace(0, 100, 101)
    
    # Fungsi keanggotaan output
    out_tidak = np.array([trapmf(xi, [0.0, 0.0, 25.0, 48.0]) for xi in x])
    out_cukup = np.array([trimf(xi, [38.0, 62.0, 78.0]) for xi in x])
    out_sangat = np.array([trapmf(xi, [68.0, 82.0, 100.0, 100.0]) for xi in x])

    # Clipping dengan tingkat aktivasi (Mamdani Min)
    clip_tidak = np.minimum(out_tidak, act_tidak_layak)
    clip_cukup = np.minimum(out_cukup, act_cukup_layak)
    clip_sangat = np.minimum(out_sangat, act_sangat_layak)

    # Agregasi Max kurva output
    aggregated = np.maximum(np.maximum(clip_tidak, clip_cukup), clip_sangat)

    sum_agg = np.sum(aggregated)
    if sum_agg > 1e-6:
        raw_score = float(np.sum(x * aggregated) / sum_agg)
    else:
        # Default fallback jika tidak ada aturan yang aktif
        raw_score = 50.0

    # Skala disesuaikan kalibrasi Kaltim (minimal 15.0, maksimal 98.5)
    skor_kelayakan = round(max(15.0, min(98.5, raw_score)), 1)

    # 4. KLASIFIKASI & NARASI
    status_spk = "Tumbuh" if skor_kelayakan >= 50.0 else "Tidak Tumbuh"

    if skor_kelayakan >= 70.0:
        kategori = "Sangat Baik"
        status_title = "STATUS: SANGAT LAYAK TUMBUH"
        headline = "Lahan Sangat Potensial untuk Musim Tanam Ini"
        alasan = (
            f"Kondisi suhu ({temperature:.1f}°C), kelembapan ({humidity:.0f}%), dan "
            f"curah hujan ({rainfall:.0f} mm) sangat mendukung fase vegetatif maupun generatif. "
            f"Kombinasi hara NPK memenuhi ambang kritis pertumbuhan padi unggul."
        )
    elif skor_kelayakan >= 50.0:
        kategori = "Cukup Baik"
        status_title = "STATUS: CUKUP LAYAK (PERLU REKAYASA)"
        headline = "Lahan Layak dengan Intervensi Agronomi Terarah"
        alasan = (
            f"Terdapat faktor pembatas pada derajat kemasaman tanah (pH {ph:.1f}) atau "
            f"ketersediaan hara N-P-K yang memerlukan pengapuran dolomit serta pemupukan berimbang terarah."
        )
    else:
        kategori = "Kurang Sesuai"
        status_title = "STATUS: KURANG LAYAK"
        headline = "Kondisi Lahan Berisiko Tinggi untuk Penanaman Padi"
        alasan = (
            f"Kombinasi parameter cuaca ekstrem atau tanah sangat masam (pH {ph:.1f}) "
            f"dapat memicu keracunan aluminium dan kegagalan panen tanpa perbaikan struktur tanah mendalam."
        )

    # Rekomendasi Dinamis
    if ph < 5.0:
        rec_ph = (
            f"pH tanah tergolong sangat masam (<strong>{ph:.1f}</strong>). Wajib aplikasikan "
            "kapur pertanian (Dolomit) <strong>2.5 - 3.5 ton/ha</strong> 3 minggu sebelum olah tanah "
            "untuk menonaktifkan racun ion Al-dd."
        )
    elif ph <= 5.5:
        rec_ph = (
            f"pH tanah khas Ultisol Kaltim (<strong>{ph:.1f}</strong>). Berikan kapur Dolomit "
            "<strong>1.5 - 2.0 ton/ha</strong> untuk menaikkan pH menuju kisaran optimal (5.5 - 6.5)."
        )
    else:
        rec_ph = (
            f"pH tanah optimal (<strong>{ph:.1f}</strong>). Tidak diperlukan pengapuran masif, "
            "cukup pemeliharaan bahan organik (kompos/pupuk kandang) 2 ton/ha."
        )

    urea_dose = 200 if n < 60 else 150
    sp36_dose = 120 if p < 35 else 80
    kcl_dose = 80 if k < 35 else 50
    rec_npk = (
        f"Kandungan hara N ({n:.0f} mg/kg), P ({p:.0f} mg/kg), K ({k:.0f} mg/kg). "
        f"Dosis rekomendasi: Urea {urea_dose} kg/ha, SP-36 {sp36_dose} kg/ha, dan "
        f"KCl {kcl_dose} kg/ha terbagi 3 tahap pemupukan."
    )

    if rainfall > 300:
        rec_water = (
            f"Curah hujan tinggi (<strong>{rainfall:.0f} mm</strong>). Perbaiki saluran drainase "
            "pembuangan air agar tanaman tidak tergenang lebih dari 5 cm saat anakan aktif."
        )
    elif rainfall < 180:
        rec_water = (
            f"Curah hujan rendah (<strong>{rainfall:.0f} mm</strong>). Siapkan pompa cadangan atau "
            "tampungan embung untuk memastikan kecukupan air fase bunting."
        )
    else:
        rec_water = (
            f"Curah hujan ideal (<strong>{rainfall:.0f} mm</strong>). Terapkan sistem pengairan "
            "basah-kering berselang (intermittent) untuk menghemat air dan memperkuat perakaran."
        )

    return {
        "skor_kelayakan": skor_kelayakan,
        "status_spk": status_spk,
        "kategori": kategori,
        "status_title": status_title,
        "headline": headline,
        "alasan": alasan,
        "rekomendasi": {
            "ph": rec_ph,
            "npk": rec_npk,
            "water": rec_water,
        },
    }
