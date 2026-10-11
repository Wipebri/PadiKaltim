import { NextRequest, NextResponse } from "next/server";
import { evaluateSoilSuitability } from "@/lib/fuzzyMamdani";
import { SoilParameters } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const params: SoilParameters = {
      ph: Number(body.ph) || 5.5,
      n: Number(body.n) || 75,
      p: Number(body.p) || 45,
      k: Number(body.k) || 40,
      temp: Number(body.temperature ?? body.temp) || 26.0,
      humidity: Number(body.humidity) || 80,
      rainfall: Number(body.rainfall) || 220,
    };

    const result = evaluateSoilSuitability(params);

    return NextResponse.json({
      skor_kelayakan: parseFloat(result.score),
      status_spk: parseFloat(result.score) >= 50.0 ? "Tumbuh" : "Tidak Tumbuh",
      kategori: result.scoreCategory.replace("Kategori: ", ""),
      status_title: result.statusTitle,
      headline: result.headline,
      alasan: result.summary,
      rekomendasi: {
        ph: result.recommendations.ph,
        npk: result.recommendations.npk,
        water: result.recommendations.water,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Gagal memproses evaluasi fuzzy", details: error.message },
      { status: 500 }
    );
  }
}
