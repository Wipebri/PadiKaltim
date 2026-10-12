from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional

from fuzzy_engine import evaluate_fuzzy_mamdani
from services.weather_service import fetch_open_meteo_weather
from services.soil_service import fetch_soilgrids_nutrients

app = FastAPI(
    title="PadiKaltim - REST API SPK Fuzzy Mamdani",
    description="Backend SPK Sistem Pendukung Keputusan untuk Identifikasi Tumbuh Kembang Padi Berbasis Fuzzy Mamdani untuk Wilayah Kalimantan Timur.",
    version="1.0.0",
)

# Enable CORS for Next.js and frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------------------------------
# Pydantic Schemas
# --------------------------------------------------------------------------
class SoilClimateInput(BaseModel):
    ph: float = Field(..., ge=2.0, le=14.0, description="Tingkat keasaman tanah (pH)")
    n: float = Field(..., ge=0.0, le=200.0, description="Kandungan Nitrogen tanah (mg/kg)")
    p: float = Field(..., ge=0.0, le=150.0, description="Kandungan Fosfor tanah (mg/kg)")
    k: float = Field(..., ge=0.0, le=150.0, description="Kandungan Kalium tanah (mg/kg)")
    temperature: float = Field(..., ge=5.0, le=55.0, description="Suhu udara rata-rata (°C)")
    humidity: float = Field(..., ge=10.0, le=100.0, description="Kelembapan udara (%)")
    rainfall: float = Field(..., ge=0.0, le=1200.0, description="Curah hujan representatif (mm)")

class Recommendations(BaseModel):
    ph: str
    npk: str
    water: str

class EvaluationResponse(BaseModel):
    skor_kelayakan: float
    status_spk: str
    kategori: str
    status_title: str
    headline: str
    alasan: str
    rekomendasi: Recommendations
    faktor_risiko: Optional[list] = []

# --------------------------------------------------------------------------
# API Endpoints
# --------------------------------------------------------------------------
@app.get("/")
def read_root():
    return {
        "app": "PadiKaltim SPK Backend",
        "description": "Fuzzy Mamdani Engine for East Kalimantan Rice Suitability Evaluation",
        "docs_url": "/docs",
        "status": "online",
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "padi-kaltim-fastapi"}

@app.post("/api/evaluate", response_model=EvaluationResponse)
def evaluate_land(payload: SoilClimateInput):
    """
    Evaluasi kelayakan lahan berdasarkan 7 parameter menggunakan algoritma Fuzzy Mamdani.
    """
    try:
        result = evaluate_fuzzy_mamdani(
            temperature=payload.temperature,
            humidity=payload.humidity,
            rainfall=payload.rainfall,
            ph=payload.ph,
            n=payload.n,
            p=payload.p,
            k=payload.k,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal melakukan inferensi fuzzy: {str(e)}")

@app.get("/api/weather")
async def get_weather(
    lat: float = Query(..., description="Latitude lokasi lahan"),
    lng: float = Query(..., description="Longitude lokasi lahan"),
):
    """
    Tarik prakiraan cuaca real-time dari Open-Meteo API berdasarkan koordinat.
    """
    weather_data = await fetch_open_meteo_weather(lat, lng)
    return weather_data

@app.get("/api/soil")
async def get_soil(
    lat: float = Query(..., description="Latitude lokasi lahan"),
    lng: float = Query(..., description="Longitude lokasi lahan"),
):
    """
    Tarik estimasi hara tanah dari SoilGrids ISRIC atau gunakan fallback standar Ultisol Kaltim.
    """
    soil_data = await fetch_soilgrids_nutrients(lat, lng)
    return soil_data

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
