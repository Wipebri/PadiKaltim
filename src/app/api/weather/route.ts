import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat") || "-0.41824";
  const lng = searchParams.get("lng") || "117.02981";

  const fallback = {
    temperature: 26.0,
    humidity: 80.0,
    rainfall: 220.0,
    source: "fallback_kaltim_climate_average",
  };

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
      `&current=temperature_2m,relative_humidity_2m` +
      `&daily=precipitation_sum&past_days=30&forecast_days=1&timezone=Asia/Makassar`;
    const res = await fetch(url, { next: { revalidate: 300 } });

    if (res.ok) {
      const data = await res.json();
      const current = data.current || {};
      const daily = data.daily || {};

      const temp = current.temperature_2m ?? 26.0;
      const hum = current.relative_humidity_2m ?? 80.0;

      const sums: Array<number | null> = daily.precipitation_sum ?? [];
      const past = sums.slice(0, -1).filter((v): v is number => typeof v === "number"); // 30 hari terakhir, tanpa hari ini
      const rainfall30 = past.length >= 25 ? past.reduce((a, b) => a + b, 0) : null;

      if (rainfall30 === null) {
        return NextResponse.json(fallback);
      }

      return NextResponse.json({
        temperature: Math.round(Number(temp) * 10) / 10,
        humidity: Math.round(Number(hum)),
        rainfall: Math.round(rainfall30),
        past_days_count: past.length,
        source: "open_meteo_live",
      });
    }
  } catch (err) {
    console.warn("Open-Meteo API route error:", err);
  }

  return NextResponse.json(fallback);
}
