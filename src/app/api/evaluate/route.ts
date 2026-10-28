import { NextRequest, NextResponse } from "next/server";
import { evaluateSoilSuitability } from "@/lib/fuzzyMamdani";
import { SoilParameters } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const params: SoilParameters = {
      ph: typeof body.ph === "number" ? body.ph : Number(body.ph) || 6.5,
      n: typeof body.n === "number" ? body.n : Number(body.n) || 75,
      p: typeof body.p === "number" ? body.p : Number(body.p) || 45,
      k: typeof body.k === "number" ? body.k : Number(body.k) || 40,
      temp: typeof body.temperature === "number"
        ? body.temperature
        : typeof body.temp === "number"
        ? body.temp
        : Number(body.temperature ?? body.temp) || 26.0,
      humidity: typeof body.humidity === "number" ? body.humidity : Number(body.humidity) || 75,
      rainfall: typeof body.rainfall === "number" ? body.rainfall : Number(body.rainfall) || 220,
    };

    const result = evaluateSoilSuitability(params);

    return NextResponse.json({
      skor_kelayakan: parseFloat(result.score),
      status_spk: result.statusSpk,
      kategori: result.scoreCategory.replace("Kategori: ", ""),
      status_title: result.statusTitle,
      headline: result.headline,
      alasan: result.summary,
      rekomendasi: {
        ph: result.recommendations.ph,
        npk: result.recommendations.npk,
        water: result.recommendations.water,
      },
      faktor_risiko: result.riskFactors || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Gagal memproses evaluasi fuzzy", details: error.message },
      { status: 500 }
    );
  }
}
