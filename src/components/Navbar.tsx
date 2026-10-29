"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import BrandLogo from "./BrandLogo";

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["hero", "fitur", "evaluasi"];
      const scrollPos = window.scrollY + 120;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="gopay-nav">
      <div className="nav-container">
        <Link href="#hero" className="brand-logo" style={{ textDecoration: "none" }}>
          <BrandLogo size={32} />
        </Link>

        <nav className="nav-menu">
          <a
            href="#hero"
            className={`nav-link ${activeSection === "hero" ? "active" : ""}`}
          >
            Beranda
          </a>
          <a
            href="#fitur"
            className={`nav-link ${activeSection === "fitur" ? "active" : ""}`}
          >
            Fitur Terintegrasi
          </a>
          <a
            href="#evaluasi"
            className={`nav-link ${activeSection === "evaluasi" ? "active" : ""}`}
          >
            Evaluasi Lahan
          </a>
        </nav>

        <div className="nav-actions">
          <a href="#evaluasi" className="btn-gopay-primary btn-nav">
            <span>Mulai Evaluasi</span>
            <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </header>
  );
}
