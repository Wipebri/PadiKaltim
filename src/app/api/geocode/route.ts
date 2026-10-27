import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ error: "Missing lat/lng" }, { status: 400 });
  }

  const numLat = parseFloat(lat);
  const numLng = parseFloat(lng);

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${numLat}&lon=${numLng}&zoom=10`,
      {
        headers: {
          "User-Agent": "PadiKaltim-Academic-SPK/1.0 (student-project)",
        },
        next: { revalidate: 3600 },
      }
    );

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const city =
        addr.city ||
        addr.county ||
        addr.town ||
        addr.city_district ||
        addr.municipality ||
        "";
      const state = addr.state || "";

      let label = "";
      if (city && state) {
        label = `${city}, ${state}`;
      } else if (state) {
        label = state;
      } else if (city) {
        label = city;
      } else if (data.display_name) {
        label = data.display_name.split(",").slice(0, 2).join(", ").trim();
      }

      const isKaltim =
        state.toLowerCase().includes("kalimantan timur") ||
        (numLat >= -2.6 && numLat <= 2.8 && numLng >= 114.5 && numLng <= 119.5);

      if (label) {
        return NextResponse.json({
          region: label,
          isKaltim,
          state,
          city,
        });
      }
    }
  } catch (err) {
    console.warn("Geocode reverse lookup warning:", err);
  }

  // Fallback heuristic based on Indonesian geographic bounds
  const isKaltim = numLat >= -2.6 && numLat <= 2.8 && numLng >= 114.5 && numLng <= 119.5;
  if (!isKaltim) {
    if (numLat <= -5.5 && numLat >= -9.0 && numLng >= 105.0 && numLng <= 115.5) {
      if (numLng < 108.5) return NextResponse.json({ region: "Jawa Barat / Banten", isKaltim: false });
      if (numLng < 111.5) return NextResponse.json({ region: "Jawa Tengah / DIY", isKaltim: false });
      return NextResponse.json({ region: "Jawa Timur", isKaltim: false });
    }
    return NextResponse.json({ region: "Di Luar Kalimantan Timur", isKaltim: false });
  }

  return NextResponse.json({ region: "Kalimantan Timur", isKaltim: true });
}
