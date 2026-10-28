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
        "current": "temperature_2m,relative_humidity_2m",
        "daily": "precipitation_sum",
        "past_days": 30,
        "forecast_days": 1,
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
                
                sums = daily.get("precipitation_sum", [])
                past = [v for v in sums[:-1] if isinstance(v, (int, float))]
                rainfall30 = sum(past) if len(past) >= 25 else None

                if rainfall30 is None:
                    return DEFAULT_WEATHER_FALLBACK

                return {
                    "temperature": round(float(temp), 1),
                    "humidity": round(float(hum), 0),
                    "rainfall": round(float(rainfall30), 0),
                    "past_days_count": len(past),
                    "source": "open_meteo_live",
                }
    except Exception as e:
        print(f"[WeatherService] Open-Meteo API error: {e}. Utilizing fallback.")

    return DEFAULT_WEATHER_FALLBACK
