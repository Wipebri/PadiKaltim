"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Coordinates, SoilParameters, EvaluationResult } from "@/types";
import { DEFAULT_SOIL_PARAMETERS, evaluateSoilSuitability } from "@/lib/fuzzyMamdani";
import EvaluationForm from "./EvaluationForm";
import ResultSection from "./ResultSection";

// Dynamic import for Leaflet Map to avoid SSR window errors
const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="workspace-col col-map">
      <div className="map-card-inner">
        <div className="map-toolbar">
          <div className="toolbar-title">
            <i className="fa-solid fa-map-location-dot"></i>
            <span>Peta Wilayah Kaltim</span>
          </div>
        </div>
        <div
          className="map-viewport"
          style={{
            height: "340px",
            minHeight: "320px",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#F5F6F8",
          }}
        >
          <span style={{ color: "#616E7A", fontSize: 13, fontWeight: 600 }}>
            Memuat Peta GIS Kaltim...
          </span>
        </div>
      </div>
    </div>
  ),
});

export default function EvaluationWorkspace() {
  const [coordinates, setCoordinates] = useState<Coordinates>({
    lat: -0.41824,
    lng: 117.02981,
    region: "Tenggarong, Kukar",
  });

  const [activePreset, setActivePreset] = useState<string>("kukar");
  const [parameters, setParameters] = useState<SoilParameters>(DEFAULT_SOIL_PARAMETERS);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const [syncStatus, setSyncStatus] = useState<string>("");
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

  // Auto-fetch real weather and soil parameters when coordinates change
  const fetchLocationEnvironment = async (lat: number, lng: number) => {
    try {
      setSyncStatus("Mengambil data cuaca & tanah real-time...");
      const [weatherRes, soilRes] = await Promise.allSettled([
        fetch(`${API_BASE}/api/weather?lat=${lat}&lng=${lng}`),
        fetch(`${API_BASE}/api/soil?lat=${lat}&lng=${lng}`),
      ]);

      let wData: any = null;
      let sData: any = null;

      if (weatherRes.status === "fulfilled" && weatherRes.value.ok) {
        wData = await weatherRes.value.json();
      }
      if (soilRes.status === "fulfilled" && soilRes.value.ok) {
        sData = await soilRes.value.json();
      }

      setParameters((prev) => {
        const next = { ...prev };
        if (wData) {
          if (wData.temperature !== undefined) next.temp = wData.temperature;
          if (wData.humidity !== undefined) next.humidity = wData.humidity;
          if (wData.rainfall !== undefined) next.rainfall = wData.rainfall;
        }
        if (sData) {
          if (sData.ph !== undefined) next.ph = sData.ph;
          if (sData.n !== undefined) next.n = sData.n;
          if (sData.p !== undefined) next.p = sData.p;
          if (sData.k !== undefined) next.k = sData.k;
        }
        return next;
      });

      setSyncStatus("Data cuaca & tanah otomatis diperbarui dari API satelit!");
      setTimeout(() => setSyncStatus(""), 3500);
    } catch (err) {
      console.warn("Auto-sync environment notice:", err);
      setSyncStatus("");
    }
  };

  // Fetch initial climate and soil on component mount
  useEffect(() => {
    fetchLocationEnvironment(coordinates.lat, coordinates.lng);
  }, []);

  const handleCoordinatesChange = (newCoords: Coordinates) => {
    setCoordinates(newCoords);
    fetchLocationEnvironment(newCoords.lat, newCoords.lng);
  };

  const handleSelectPreset = (lat: number, lng: number, region: string, key: string) => {
    setActivePreset(key);
    setCoordinates({ lat, lng, region });
    fetchLocationEnvironment(lat, lng);
  };

  const handleEvaluate = async () => {
    setIsEvaluating(true);

    try {
      // Send request to SPK REST API endpoint (Next.js serverless route on Vercel or FastAPI)
      const res = await fetch(`${API_BASE}/api/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ph: parameters.ph,
          n: parameters.n,
          p: parameters.p,
          k: parameters.k,
          temperature: parameters.temp,
          humidity: parameters.humidity,
          rainfall: parameters.rainfall,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const score = data.skor_kelayakan;

        let badgeBg = "#00A651";
        let badgeColor = "#FFFFFF";
        if (score >= 70.0) {
          badgeBg = "#00A651";
        } else if (score >= 50.0) {
          badgeBg = "#F7EB5F";
          badgeColor = "#182430";
        } else {
          badgeBg = "#E53935";
        }

        setEvaluationResult({
          score: score.toFixed(1),
          statusBadgeColor: badgeBg,
          statusBadgeTextColor: badgeColor,
          statusTitle: data.status_title,
          headline: data.headline,
          scoreCategory: `Kategori: ${data.kategori}`,
          summary: data.alasan,
          recommendations: {
            ph: data.rekomendasi.ph,
            npk: data.rekomendasi.npk,
            water: data.rekomendasi.water,
          },
        });
      } else {
        // Fallback to local engine
        const localResult = evaluateSoilSuitability(parameters);
        setEvaluationResult(localResult);
      }
    } catch (err) {
      console.warn("Backend error, falling back to local engine:", err);
      const localResult = evaluateSoilSuitability(parameters);
      setEvaluationResult(localResult);
    } finally {
      setIsEvaluating(false);
      setTimeout(() => {
        const resultEl = document.getElementById("result-section");
        if (resultEl) {
          resultEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  };

  const handleResetParameters = () => {
    setParameters(DEFAULT_SOIL_PARAMETERS);
  };

  const handleRetest = () => {
    setEvaluationResult(null);
    const evalEl = document.getElementById("evaluasi");
    if (evalEl) {
      evalEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="workspace-section" id="evaluasi">
      <div className="section-container">
        <div className="gopay-large-card">
          {/* Header */}
          <div className="workspace-header">
            <div className="workspace-header-main">
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                <span className="gopay-label-badge badge-green">Workspace Interaktif</span>
                {syncStatus && (
                  <span
                    className="gopay-label-badge"
                    style={{
                      backgroundColor: "#E8F5E9",
                      color: "#00AA13",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    <i className="fa-solid fa-cloud-arrow-down" style={{ marginRight: 6 }}></i>
                    {syncStatus}
                  </span>
                )}
              </div>
              <h2 className="workspace-title">Simulasi & Evaluasi Lahan</h2>
              <p className="workspace-subtitle">
                Pilih titik pada peta Kalimantan Timur atau gunakan GPS untuk mengisi
                parameter kelayakan tanam secara otomatis.
              </p>
            </div>

            {/* Preset chips in header */}
            <div className="preset-locations">
              <span className="preset-label">Pilihan Cepat:</span>
              <div className="preset-chips">
                <button
                  type="button"
                  className={`chip-btn ${activePreset === "kukar" ? "active" : ""}`}
                  onClick={() =>
                    handleSelectPreset(-0.41824, 117.02981, "Tenggarong, Kukar", "kukar")
                  }
                >
                  Kukar
                </button>
                <button
                  type="button"
                  className={`chip-btn ${activePreset === "ppu" ? "active" : ""}`}
                  onClick={() =>
                    handleSelectPreset(-1.26539, 116.8312, "Penajam Paser Utara", "ppu")
                  }
                >
                  PPU
                </button>
                <button
                  type="button"
                  className={`chip-btn ${activePreset === "samarinda" ? "active" : ""}`}
                  onClick={() =>
                    handleSelectPreset(-0.50218, 117.15371, "Samarinda", "samarinda")
                  }
                >
                  Samarinda
                </button>
                <button
                  type="button"
                  className={`chip-btn ${activePreset === "berau" ? "active" : ""}`}
                  onClick={() =>
                    handleSelectPreset(2.15582, 117.49479, "Berau", "berau")
                  }
                >
                  Berau
                </button>
                <button
                  type="button"
                  className={`chip-btn ${activePreset === "paser" ? "active" : ""}`}
                  onClick={() =>
                    handleSelectPreset(-1.89844, 116.14389, "Tanah Grogot, Paser", "paser")
                  }
                >
                  Paser
                </button>
              </div>
            </div>
          </div>

          {/* Grid: Map (Left) & Form (Right) */}
          <div className="workspace-grid">
            <MapComponent
              coordinates={coordinates}
              onCoordinatesChange={handleCoordinatesChange}
            />

            <EvaluationForm
              parameters={parameters}
              onChange={setParameters}
              onEvaluate={handleEvaluate}
              onReset={handleResetParameters}
              isEvaluating={isEvaluating}
            />
          </div>

          {/* Result Section */}
          {evaluationResult && (
            <ResultSection
              result={evaluationResult}
              onRetest={handleRetest}
            />
          )}
        </div>
      </div>
    </section>
  );
}
