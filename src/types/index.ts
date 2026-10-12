export interface Coordinates {
  lat: number;
  lng: number;
  region: string;
}

export interface PresetLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface SoilParameters {
  temp: number;      // °C (default 26.0, range 10-45.5)
  humidity: number;  // % (default 75, range 30-100)
  rainfall: number;  // mm (default 220, range 20-400)
  ph: number;        // pH level (default 6.5, range 4.5-8.5)
  n: number;         // mg/kg (default 75, range 5-150)
  p: number;         // mg/kg (default 45, range 5-90)
  k: number;         // mg/kg (default 40, range 10-100)
}

export interface RiskFactor {
  name: string;
  degree: number;
  advice: string;
  level: "aktif" | "waspada";
}

export interface EvaluationResult {
  score: string;
  statusSpk: "Tumbuh" | "Tidak Tumbuh";
  statusBadgeColor: string;
  statusBadgeTextColor?: string;
  statusTitle: string;
  headline: string;
  scoreCategory: string;
  summary: string;
  recommendations: {
    ph: string;
    npk: string;
    water: string;
  };
  riskFactors?: RiskFactor[];
}
