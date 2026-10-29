import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat") || "-0.41824";
  const lng = searchParams.get("lng") || "117.02981";

  const fallback = {
    ph: 6.5,
    n: 75.0,
    p: 45.0,
    k: 40.0,
    source: "ultisol_kaltim_calibrated_profile",
  };

  try {
    const url = `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${lng}&lat=${lat}&property=phh2o&depth=0-5cm&value=mean`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 3600 },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const layers = data?.properties?.layers || [];

      let extractedPh: number | null = null;

      for (const layer of layers) {
        if (layer?.name === "phh2o") {
          const meanVal = layer?.depths?.[0]?.values?.mean;
          if (meanVal !== undefined && meanVal !== null) {
            extractedPh = Math.max(3.5, Math.min(8.5, meanVal / 10.0));
          }
        }
      }

      if (extractedPh === null) {
        return NextResponse.json(fallback);
      }

      return NextResponse.json({
        ph: Math.round(extractedPh * 10) / 10,
        n: 75.0,
        p: 45.0,
        k: 40.0,
        source: "soilgrids_isric_api",
      });
    }
  } catch (err) {
    console.warn("SoilGrids API route timeout/error:", err);
  }

  return NextResponse.json(fallback);
}
