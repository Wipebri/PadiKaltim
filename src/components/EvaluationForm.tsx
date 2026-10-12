"use client";

import React, { useState } from "react";
import { SoilParameters } from "@/types";

interface EvaluationFormProps {
  parameters: SoilParameters;
  onChange: (params: SoilParameters) => void;
  onEvaluate: () => void;
  onReset: () => void;
  isEvaluating: boolean;
}

export default function EvaluationForm({
  parameters,
  onChange,
  onEvaluate,
  onReset,
  isEvaluating,
}: EvaluationFormProps) {
  const [resetFeedback, setResetFeedback] = useState(false);

  const handleStep = (field: keyof SoilParameters, step: number) => {
    let val = parameters[field] + step;

    // Bounds checking
    if (field === "temp") val = Math.max(10, Math.min(45, Math.round(val * 10) / 10));
    if (field === "humidity") val = Math.max(10, Math.min(100, Math.round(val)));
    if (field === "rainfall") val = Math.max(0, Math.min(1000, Math.round(val)));
    if (field === "ph") val = Math.max(2.5, Math.min(9.5, Math.round(val * 10) / 10));
    if (field === "n") val = Math.max(0, Math.min(150, Math.round(val)));
    if (field === "p") val = Math.max(0, Math.min(100, Math.round(val)));
    if (field === "k") val = Math.max(0, Math.min(100, Math.round(val)));

    onChange({
      ...parameters,
      [field]: val,
    });
  };

  const handleInputChange = (field: keyof SoilParameters, rawVal: string) => {
    const val = parseFloat(rawVal) || 0;
    onChange({
      ...parameters,
      [field]: val,
    });
  };

  const handleResetClick = () => {
    onReset();
    setResetFeedback(true);
    setTimeout(() => {
      setResetFeedback(false);
    }, 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEvaluate();
  };

  return (
    <div className="workspace-col col-form">
      <div className="form-card-inner">
        <div className="form-header-row">
          <div>
            <h3 className="form-section-title">7 Parameter Agronomi</h3>
            <p className="form-section-desc">
              Sesuaikan angka di bawah atau gunakan data rekomendasi otomatis.
            </p>
          </div>
          <button
            type="button"
            className="btn-reset-text"
            id="btn-reset"
            onClick={handleResetClick}
          >
            {resetFeedback ? (
              <>
                <i className="fa-solid fa-check"></i>
                <span>Reset Berhasil</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-arrow-rotate-left"></i>
                <span>Reset Ultisol</span>
              </>
            )}
          </button>
        </div>

        <form id="evaluation-form" onSubmit={handleSubmit}>
          {/* Group A: Iklim & Cuaca */}
          <div className="param-category-block">
            <div className="category-header">
              <i className="fa-solid fa-cloud-sun"></i>
              <span>Parameter Iklim & Cuaca</span>
            </div>

            <div className="inputs-grid-climate">
              {/* Param 1: Suhu */}
              <div className="input-card">
                <label
                  htmlFor="temp"
                  className="input-label"
                  title="Atmospheric temperature in degrees Celsius (°C)"
                >
                  Suhu Udara (°C)
                </label>
                <div className="stepper-input-row">
                  <button
                    type="button"
                    className="btn-step"
                    onClick={() => handleStep("temp", -0.5)}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="temp"
                    step="0.1"
                    value={parameters.temp}
                    onChange={(e) => handleInputChange("temp", e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn-step"
                    onClick={() => handleStep("temp", 0.5)}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Param 2: Kelembapan */}
              <div className="input-card">
                <label
                  htmlFor="humidity"
                  className="input-label"
                  title="Percentage of air humidity (%)"
                >
                  Kelembapan (%)
                </label>
                <div className="stepper-input-row">
                  <button
                    type="button"
                    className="btn-step"
                    onClick={() => handleStep("humidity", -1)}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="humidity"
                    step="1"
                    value={parameters.humidity}
                    onChange={(e) => handleInputChange("humidity", e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn-step"
                    onClick={() => handleStep("humidity", 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Param 3: Curah Hujan */}
              <div className="input-card">
                <label
                  htmlFor="rainfall"
                  className="input-label"
                  title="Annual rainfall in mm"
                >
                  Curah Hujan (mm)
                </label>
                <div className="stepper-input-row">
                  <button
                    type="button"
                    className="btn-step"
                    onClick={() => handleStep("rainfall", -5)}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="rainfall"
                    step="1"
                    value={parameters.rainfall}
                    onChange={(e) => handleInputChange("rainfall", e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn-step"
                    onClick={() => handleStep("rainfall", 5)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Group B: Kesuburan Tanah Ultisol */}
          <div className="param-category-block">
            <div className="category-header">
              <i className="fa-solid fa-mound"></i>
              <span>Karakteristik Tanah Ultisol</span>
            </div>

            <div className="inputs-grid-npk">
              {/* Param 4: pH */}
              <div className="input-card">
                <label
                  htmlFor="ph"
                  className="input-label"
                  title="Soil pH level"
                >
                  pH Tanah
                </label>
                <div className="stepper-input-row">
                  <button
                    type="button"
                    className="btn-step"
                    onClick={() => handleStep("ph", -0.1)}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="ph"
                    step="0.1"
                    value={parameters.ph}
                    onChange={(e) => handleInputChange("ph", e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn-step"
                    onClick={() => handleStep("ph", 0.1)}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Param 5: N */}
              <div className="input-card">
                <label
                  htmlFor="n"
                  className="input-label"
                  title="Amount of nitrogen in the soil (mg/kg)"
                >
                  Nitrogen (mg/kg)
                </label>
                <div className="stepper-input-row">
                  <button
                    type="button"
                    className="btn-step"
                    onClick={() => handleStep("n", -1)}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="n"
                    step="1"
                    value={parameters.n}
                    onChange={(e) => handleInputChange("n", e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn-step"
                    onClick={() => handleStep("n", 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Param 6: P */}
              <div className="input-card">
                <label
                  htmlFor="p"
                  className="input-label"
                  title="Amount of phosphorus in the soil (mg/kg)"
                >
                  Fosfor (mg/kg)
                </label>
                <div className="stepper-input-row">
                  <button
                    type="button"
                    className="btn-step"
                    onClick={() => handleStep("p", -1)}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="p"
                    step="1"
                    value={parameters.p}
                    onChange={(e) => handleInputChange("p", e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn-step"
                    onClick={() => handleStep("p", 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Param 7: K */}
              <div className="input-card">
                <label
                  htmlFor="k"
                  className="input-label"
                  title="Amount of potassium in the soil (mg/kg)"
                >
                  Kalium (mg/kg)
                </label>
                <div className="stepper-input-row">
                  <button
                    type="button"
                    className="btn-step"
                    onClick={() => handleStep("k", -1)}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="k"
                    step="1"
                    value={parameters.k}
                    onChange={(e) => handleInputChange("k", e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn-step"
                    onClick={() => handleStep("k", 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Primary CTA Button */}
          <button
            type="submit"
            className="btn-gopay-primary btn-massive-cta"
            id="btn-evaluate"
            disabled={isEvaluating}
          >
            {isEvaluating ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin"></i>
                <span>Menganalisis Parameter...</span>
              </>
            ) : (
              <>
                <span>Evaluasi Kelayakan Lahan Sekarang</span>
                <i className="fa-solid fa-calculator"></i>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
