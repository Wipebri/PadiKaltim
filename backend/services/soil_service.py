import httpx
from typing import Dict, Any

DEFAULT_ULTISOL_FALLBACK = {
    "ph": 5.5,
    "n": 75.0,
    "p": 45.0,
    "k": 40.0,
    "source": "ultisol_kaltim_calibrated_profile",
}

async def fetch_soilgrids_nutrients(lat: float, lng: float) -> Dict[str, Any]:
    """
    Attempt to fetch soil nutrient profile from SoilGrids ISRIC Global REST API.
    Gracefully fall back to calibrated Kaltim Ultisol standard if timeout or error.
    """
    # SoilGrids REST endpoint for pH in water (phh2o) and nitrogen (nitrogen)
    url = "https://rest.isric.org/soilgrids/v2.0/properties/query"
    params = {
        "lon": lng,
        "lat": lat,
        "property": ["phh2o", "nitrogen"],
        "depth": ["0-5cm", "5-15cm"],
        "value": "mean",
    }

    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            response = await client.get(url, params=params)
            if response.status_code == 200:
                data = response.json()
                layers = data.get("properties", {}).get("layers", [])

                extracted_ph = 5.5
                extracted_n = 75.0

                for layer in layers:
                    prop_name = layer.get("name")
                    depths = layer.get("depths", [])
                    if depths:
                        mean_val = depths[0].get("values", {}).get("mean")
                        if mean_val is not None:
                            if prop_name == "phh2o":
                                # SoilGrids stores pH scaled by 10 (e.g. 55 -> 5.5)
                                extracted_ph = max(3.5, min(8.5, mean_val / 10.0))
                            elif prop_name == "nitrogen":
                                # Scaled cg/kg -> mg/kg
                                extracted_n = max(30.0, min(140.0, float(mean_val) / 10.0))

                return {
                    "ph": round(float(extracted_ph), 1),
                    "n": round(float(extracted_n), 0),
                    "p": 45.0,  # Phosphorus standard Ultisol
                    "k": 40.0,  # Potassium standard Ultisol
                    "source": "soilgrids_isric_api",
                }
    except Exception as e:
        print(f"[SoilService] SoilGrids API notice ({e}). Using Kaltim Ultisol standard profile.")

    return DEFAULT_ULTISOL_FALLBACK
