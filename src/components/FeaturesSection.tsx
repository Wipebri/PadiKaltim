"use client";

import React from "react";
import { MapPin, Sliders, ClipboardCheck } from "lucide-react";

export default function FeaturesSection() {
  return (
    <section className="color-blocks-section" id="fitur">
      <div className="section-container">
        <div className="section-header">
          <span className="gopay-label-badge">Fitur Unggulan</span>
          <h2 className="section-title">Fitur Utama Web PadiKaltim</h2>
          <p className="section-subtitle">
            Tiga kapabilitas utama untuk membantu Anda menganalisis kelayakan
            lahan sawah secara mandiri dan akurat.
          </p>
        </div>

        <div className="bento-grid">
          {/* Block 1: Emerald Green Color Block */}
          <div className="bento-card card-green">
            <div className="card-top">
              <div className="card-icon-circle bg-white-translucent">
                <MapPin size={22} color="#00AA13" />
              </div>
              <span className="card-tag">Pemetaan Interaktif</span>
            </div>
            <div className="card-content">
              <h3 className="bento-card-title">Peta GIS & Deteksi GPS</h3>
              <p className="bento-card-desc">
                Tentukan titik pematang sawah langsung di peta interaktif, pilih
                dari preset wilayah Kaltim populer, atau gunakan fitur deteksi
                GPS perangkat Anda hanya dengan satu klik.
              </p>
            </div>
            <div className="card-footer">
              <span className="card-stat">Penentuan Lokasi Presisi</span>
            </div>
          </div>

          {/* Block 2: Yellow Color Block */}
          <div className="bento-card card-yellow">
            <div className="card-top">
              <div className="card-icon-circle bg-dark-translucent">
                <Sliders size={22} color="#182430" />
              </div>
              <span className="card-tag">Otomasi Parameter</span>
            </div>
            <div className="card-content">
              <h3 className="bento-card-title text-navy">
                Integrasi Cuaca & Tanah
              </h3>
              <p className="bento-card-desc text-navy">
                Sistem otomatis menarik prakiraan cuaca satelit real-time serta
                profil hara tanah Ultisol Kaltim, lengkap dengan kontrol stepper
                untuk penyesuaian nilai secara fleksibel.
              </p>
            </div>
            <div className="card-footer">
              <span className="card-stat text-navy">7 Parameter Terkalibrasi</span>
            </div>
          </div>

          {/* Block 3: Navy Color Block */}
          <div className="bento-card card-navy">
            <div className="card-top">
              <div className="card-icon-circle bg-white-translucent">
                <ClipboardCheck size={22} color="#FFFFFF" />
              </div>
              <span className="card-tag">Hasil Keputusan</span>
            </div>
            <div className="card-content">
              <h3 className="bento-card-title text-white">
                Skor & Rekomendasi Aksi
              </h3>
              <p className="bento-card-desc text-faint">
                Dapatkan perhitungan skor kelayakan (0–100) berbasis Fuzzy
                Mamdani, status potensi tumbuh, serta panduan dosis pemupukan
                dan pengapuran dolomit siap cetak.
              </p>
            </div>
            <div className="card-footer">
              <span className="card-stat text-white">Panduan Agronomi Nyata</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
