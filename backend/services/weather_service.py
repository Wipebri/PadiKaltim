import httpx
from typing import Dict, Any

DEFAULT_WEATHER_FALLBACK = {
    "temperature": 26.0,
    "humidity": 80.0,
    "rainfall": 220.0,
    "source": "fallback_kaltim_climate_average",
}

async def fetch_open_meteo_weather(lat: float, lng: float) -> Dict[str, Any]:
    """
    Fetch real-time climate data from Open-Meteo API for specified coordinates.
    """
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lng,
        "current": "temperature_2m,relative_humidity_2m,precipitation",
        "daily": "precipitation_sum",
        "timezone": "Asia/Makassar",
    }

    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            response = await client.get(url, params=params)
            if response.status_code == 200:
                data = response.json()
                current = data.get("current", {})
                daily = data.get("daily", {})

                temp = current.get("temperature_2m", 26.0)
                hum = current.get("relative_humidity_2m", 80.0)
                
                # Daily precip or current precipitation scaled to model representation
                precip_sums = daily.get("precipitation_sum", [])
                daily_precip = precip_sums[0] if precip_sums else current.get("precipitation", 0.0)
                
                # Model calibrated rainfall estimate based on precipitation patterns (monthly scaled ~180-300mm)
                estimated_rainfall = max(100.0, min(450.0, 200.0 + (float(daily_precip) * 10.0)))

                return {
                    "temperature": round(float(temp), 1),
                    "humidity": round(float(hum), 0),
                    "rainfall": round(float(estimated_rainfall), 0),
                    "daily_precipitation_mm": round(float(daily_precip), 1),
                    "source": "open_meteo_live",
                }
    except Exception as e:
        print(f"[WeatherService] Open-Meteo API error: {e}. Utilizing fallback.")

    return DEFAULT_WEATHER_FALLBACK
