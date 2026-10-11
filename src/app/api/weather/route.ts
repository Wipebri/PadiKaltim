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
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation&daily=precipitation_sum&timezone=Asia/Makassar`;
    const res = await fetch(url, { next: { revalidate: 300 } });

    if (res.ok) {
      const data = await res.json();
      const current = data.current || {};
      const daily = data.daily || {};

      const temp = current.temperature_2m ?? 26.0;
      const hum = current.relative_humidity_2m ?? 80.0;
      const dailyPrecip = (daily.precipitation_sum && daily.precipitation_sum[0]) ?? (current.precipitation ?? 0.0);
      const estimatedRainfall = Math.max(100.0, Math.min(450.0, 200.0 + Number(dailyPrecip) * 10.0));

      return NextResponse.json({
        temperature: Math.round(Number(temp) * 10) / 10,
        humidity: Math.round(Number(hum)),
        rainfall: Math.round(Number(estimatedRainfall)),
        daily_precipitation_mm: Math.round(Number(dailyPrecip) * 10) / 10,
        source: "open_meteo_live",
      });
    }
  } catch (err) {
    console.warn("Open-Meteo API route error:", err);
  }

  return NextResponse.json(fallback);
}
