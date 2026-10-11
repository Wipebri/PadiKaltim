import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat") || "-0.41824";
  const lng = searchParams.get("lng") || "117.02981";

  const fallback = {
    ph: 5.5,
    n: 75.0,
    p: 45.0,
    k: 40.0,
    source: "ultisol_kaltim_calibrated_profile",
  };

  try {
    const url = `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${lng}&lat=${lat}&property=phh2o&property=nitrogen&depth=0-5cm&value=mean`;
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

      let extractedPh = 5.5;
      let extractedN = 75.0;

      for (const layer of layers) {
        const propName = layer?.name;
        const depths = layer?.depths || [];
        if (depths.length > 0) {
          const meanVal = depths[0]?.values?.mean;
          if (meanVal !== undefined && meanVal !== null) {
            if (propName === "phh2o") {
              extractedPh = Math.max(3.5, Math.min(8.5, meanVal / 10.0));
            } else if (propName === "nitrogen") {
              extractedN = Math.max(30.0, Math.min(140.0, Number(meanVal) / 10.0));
            }
          }
        }
      }

      return NextResponse.json({
        ph: Math.round(extractedPh * 10) / 10,
        n: Math.round(extractedN),
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
