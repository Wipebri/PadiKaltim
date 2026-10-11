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
  temp: number;      // °C (default 26.0, range 10-45)
  humidity: number;  // % (default 80, range 10-100)
  rainfall: number;  // mm (default 220, range 0-1000)
  ph: number;        // pH level (default 5.5, range 2.5-9.5)
  n: number;         // mg/kg (default 75, range 0-140)
  p: number;         // mg/kg (default 45, range 0-100)
  k: number;         // mg/kg (default 40, range 0-100)
}

export interface EvaluationResult {
  score: string;
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
}
