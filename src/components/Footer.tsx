import React from "react";
import Link from "next/link";
import BrandLogo from "./BrandLogo";

export default function Footer() {
  return (
    <footer className="gopay-footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand-col">
            <Link href="#hero" style={{ textDecoration: "none", display: "inline-block", marginBottom: "16px" }}>
              <BrandLogo size={32} variant="light" />
            </Link>
            <p className="footer-about">
              Bantu Anda menilai kelayakan sawah secara instan sebelum masa tanam.
              Cukup tentukan titik lokasi lahan untuk mengetahui potensi
              keberhasilan panen, estimasi risiko cuaca & tanah, serta panduan
              rekomendasi pemupukan dan perbaikan tanah yang tepat.
            </p>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-col-title">Navigasi Cepat</h4>
            <ul className="footer-links-list">
              <li>
                <Link href="#hero">Beranda</Link>
              </li>
              <li>
                <Link href="#fitur">Fitur Satelit & Tanah</Link>
              </li>
              <li>
                <Link href="#evaluasi">Workspace Evaluasi</Link>
              </li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-col-title">Sumber Data</h4>
            <ul className="footer-links-list">
              <li>
                <a
                  href="https://open-meteo.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open-Meteo Weather API
                </a>
              </li>
              <li>
                <a
                  href="https://www.isric.org/explore/soilgrids"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  SoilGrids ISRIC Global Soil
                </a>
              </li>
              <li>
                <a
                  href="https://pertanian.kaltimprov.go.id"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Dinas Pangan & Pertanian Kaltim
                </a>
              </li>
              <li>
                <a
                  href="https://leafletjs.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Leaflet GIS Engine
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <p>&copy; 2026 PadiKaltim.</p>
        </div>
      </div>
    </footer>
  );
}
