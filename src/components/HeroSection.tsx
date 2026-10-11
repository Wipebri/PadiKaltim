"use client";

import React from "react";
import { ArrowDown, Crosshair } from "lucide-react";

interface HeroSectionProps {
  onDetectLocation: () => void;
}

export default function HeroSection({ onDetectLocation }: HeroSectionProps) {
  return (
    <section className="gopay-hero" id="hero">
      <div className="hero-container">
        <h1 className="hero-display-title">
          Evaluasi Cerdas Kelayakan Tanam Padi di Kalimantan Timur
        </h1>

        <p className="hero-body-text">
          Bantu Anda <strong>menilai kelayakan sawah secara instan</strong>{" "}
          sebelum masa tanam. Cukup tentukan titik lokasi lahan untuk mengetahui
          potensi keberhasilan panen, estimasi risiko cuaca & tanah, serta{" "}
          <strong>panduan rekomendasi pemupukan dan perbaikan tanah</strong> yang
          tepat.
        </p>

        <div className="hero-cta-group">
          <a href="#evaluasi" className="btn-gopay-primary">
            <span>Mulai Evaluasi Lahan</span>
            <ArrowDown size={18} />
          </a>
          <button
            type="button"
            className="btn-gopay-yellow"
            onClick={onDetectLocation}
          >
            <Crosshair size={18} />
            <span>Deteksi Lokasi GPS</span>
          </button>
        </div>
      </div>
    </section>
  );
}
