"use client";

import React from "react";
import { EvaluationResult } from "@/types";
import { CheckCircle2, FlaskConical, Wheat, Droplets, ArrowLeft, AlertTriangle } from "lucide-react";

interface ResultSectionProps {
  result: EvaluationResult;
  onRetest: () => void;
}

export default function ResultSection({ result, onRetest }: ResultSectionProps) {
  return (
    <div id="result-section" className="result-container">
      {/* Result Status Banner */}
      <div className="result-banner">
        <div className="banner-left">
          <div
            className="banner-badge-status"
            style={{
              backgroundColor: result.statusBadgeColor,
              color: result.statusBadgeTextColor || "#FFFFFF",
            }}
          >
            <CheckCircle2 size={16} />
            <span>{result.statusTitle}</span>
          </div>
          <h3 className="banner-headline">{result.headline}</h3>
          <p className="banner-summary">{result.summary}</p>
        </div>

        <div className="banner-right">
          <div className="score-circular-card">
            <span className="score-label">SKOR KELAYAKAN FUZZY</span>
            <div className="score-number-display">
              <span className="score-big">{result.score}</span>
              <span className="score-denom">/ 100</span>
            </div>
            <span className="score-tag">{result.scoreCategory}</span>
          </div>
        </div>
      </div>

      {/* Risk Factors Detection & Early Warning (jika ada faktor risiko aktif/waspada) */}
      {result.riskFactors && result.riskFactors.length > 0 && (
        <div className="risk-factors-wrap" style={{ marginTop: "24px" }}>
          <h4 className="rec-heading" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertTriangle size={18} color="#FF8000" />
            <span>Faktor Risiko &amp; Peringatan Dini Terdeteksi (Basis Aturan Mamdani)</span>
          </h4>
          <div
            className="risk-factors-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "16px",
              marginTop: "12px",
            }}
          >
            {result.riskFactors.map((rf, idx) => (
              <div
                key={idx}
                className="risk-factor-item"
                style={{
                  backgroundColor:
                    rf.level === "aktif" ? "rgba(238, 39, 55, 0.06)" : "rgba(255, 128, 0, 0.08)",
                  border: `1px solid ${
                    rf.level === "aktif" ? "rgba(238, 39, 55, 0.25)" : "rgba(255, 128, 0, 0.25)"
                  }`,
                  borderRadius: "16px",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: "14px",
                      color: rf.level === "aktif" ? "#EE2737" : "#B45309",
                    }}
                  >
                    {rf.name}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: "12px",
                      backgroundColor: rf.level === "aktif" ? "#EE2737" : "#FF8000",
                      color: "#FFFFFF",
                    }}
                  >
                    Derajat: {rf.degree.toFixed(2)}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--color-neutral-2)",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {rf.advice}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agronomic Action Recommendation Cards */}
      <div className="recommendations-wrap">
        <h4 className="rec-heading">Rekomendasi Tindakan Agronomi Lapangan</h4>

        <div className="rec-grid">
          {/* Card 1: pH Koreksi */}
          <div className="rec-card">
            <div className="rec-card-header">
              <span className="rec-icon icon-lime">
                <FlaskConical size={18} />
              </span>
              <h5>Koreksi Keasaman Tanah (Dolomit)</h5>
            </div>
            <p
              className="rec-body"
              dangerouslySetInnerHTML={{ __html: result.recommendations.ph }}
            />
          </div>

          {/* Card 2: Pemupukan NPK */}
          <div className="rec-card">
            <div className="rec-card-header">
              <span className="rec-icon icon-emerald">
                <Wheat size={18} />
              </span>
              <h5>Pemupukan Berimbang N-P-K</h5>
            </div>
            <p
              className="rec-body"
              dangerouslySetInnerHTML={{ __html: result.recommendations.npk }}
            />
          </div>

          {/* Card 3: Manajemen Air */}
          <div className="rec-card">
            <div className="rec-card-header">
              <span className="rec-icon icon-yellow">
                <Droplets size={18} />
              </span>
              <h5>Manajemen Tata Air Sawah</h5>
            </div>
            <p
              className="rec-body"
              dangerouslySetInnerHTML={{ __html: result.recommendations.water }}
            />
          </div>
        </div>
      </div>

      {/* Action buttons: Centered prominent GoPay Primary CTA */}
      <div className="result-actions-strip">
        <button
          type="button"
          className="btn-gopay-primary btn-retest-cta"
          onClick={onRetest}
        >
          <ArrowLeft size={18} />
          <span>Uji Titik Lahan Baru</span>
        </button>
      </div>
    </div>
  );
}
