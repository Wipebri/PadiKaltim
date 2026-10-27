"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Coordinates } from "@/types";
import L from "leaflet";

function inferRegionFromCoords(lat: number, lng: number): string {
  // Check if inside East Kalimantan bounding box:
  // Kaltim coordinates: Lat ~ -2.6° to 2.8°, Lng ~ 114.5° to 119.5°
  const isKaltim = lat >= -2.6 && lat <= 2.8 && lng >= 114.5 && lng <= 119.5;

  if (!isKaltim) {
    // Check if within Java Island bounds: Lat ~ -9.0° to -5.5°, Lng ~ 105.0° to 115.5°
    if (lat <= -5.5 && lat >= -9.0 && lng >= 105.0 && lng <= 115.5) {
      if (lng < 108.5) return "Wilayah Jawa Barat / Banten";
      if (lng < 111.5) return "Wilayah Jawa Tengah / DIY";
      return "Wilayah Jawa Timur";
    }
    // Check Sumatra Island:
    if (lat >= -6.0 && lat <= 6.0 && lng >= 95.0 && lng <= 106.0) {
      return "Wilayah Sumatera";
    }
    // Check Sulawesi Island:
    if (lat >= -5.8 && lat <= 2.0 && lng >= 118.5 && lng <= 125.5) {
      return "Wilayah Sulawesi";
    }
    return "Di Luar Kalimantan Timur";
  }

  // Inside East Kalimantan:
  if (lat > 1.5) return "Kab. Berau";
  if (lat > 0.0 && lat <= 1.5) return "Kutai Timur / Bontang";
  if (lat < -0.3 && lat > -0.7 && lng > 117.0) return "Kota Samarinda";
  if (lat < -0.3 && lat > -0.7 && lng <= 117.0) return "Tenggarong, Kukar";
  if (lat < -0.8 && lat > -1.4 && lng >= 116.3 && lng <= 117.2) return "Penajam Paser Utara";
  if (lat <= -1.4 && lng >= 115.5 && lng <= 116.8) return "Kabupaten Paser";
  return "Kalimantan Timur";
}

interface MapComponentProps {
  coordinates: Coordinates;
  onCoordinatesChange: (coords: Coordinates) => void;
}

export default function MapComponent({
  coordinates,
  onCoordinatesChange,
}: MapComponentProps) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerInstanceRef = useRef<L.Marker | null>(null);
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  const updatePosition = useCallback(
    async (lat: number, lng: number, regionName?: string) => {
      const initialRegion = regionName || inferRegionFromCoords(lat, lng);
      onCoordinatesChange({ lat, lng, region: initialRegion });

      // Fetch precise reverse-geocoded location if not from an explicit preset
      if (!regionName) {
        try {
          const res = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`);
          if (res.ok) {
            const data = await res.json();
            if (data.region) {
              onCoordinatesChange({ lat, lng, region: data.region });
            }
          }
        } catch {
          // Keep heuristic initialRegion if offline or API unavailable
        }
      }
    },
    [onCoordinatesChange]
  );

  useEffect(() => {
    if (!mapElementRef.current) return;

    // Guard against re-initialization on hot-reload or StrictMode
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const container = mapElementRef.current;
    if ((container as unknown as { _leaflet_id?: number })._leaflet_id) {
      delete (container as unknown as { _leaflet_id?: number })._leaflet_id;
    }

    const map = L.map(container, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([coordinates.lat, coordinates.lng], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const customIcon = L.divIcon({
      className: "custom-leaflet-pin",
      html: `<div style="background-color: #00AA13; width: 22px; height: 22px; border: 3px solid #FFFFFF; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,170,19,0.4);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const marker = L.marker([coordinates.lat, coordinates.lng], {
      draggable: true,
      icon: customIcon,
    }).addTo(map);

    map.on("click", (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      updatePosition(e.latlng.lat, e.latlng.lng);
    });

    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      updatePosition(pos.lat, pos.lng);
    });

    mapInstanceRef.current = map;
    markerInstanceRef.current = marker;

    // Force Leaflet to recalculate container dimensions once rendered
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Run on initial mount

  // Sync external coordinate changes (e.g. from preset chips in parent)
  useEffect(() => {
    if (mapInstanceRef.current && markerInstanceRef.current) {
      const curPos = markerInstanceRef.current.getLatLng();
      if (
        Math.abs(curPos.lat - coordinates.lat) > 0.0001 ||
        Math.abs(curPos.lng - coordinates.lng) > 0.0001
      ) {
        markerInstanceRef.current.setLatLng([coordinates.lat, coordinates.lng]);
        mapInstanceRef.current.flyTo([coordinates.lat, coordinates.lng], 13, {
          duration: 0.8,
        });
      }
    }
  }, [coordinates.lat, coordinates.lng]);

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert("Browser Anda tidak mendukung geolokasi GPS.");
      return;
    }

    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingGps(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (mapInstanceRef.current && markerInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 14, { duration: 0.8 });
          markerInstanceRef.current.setLatLng([lat, lng]);
        }
        updatePosition(lat, lng, "Lokasi GPS Anda");
      },
      (err) => {
        setIsDetectingGps(false);
        console.warn("Geolocation error:", err.message);
        // Fallback to Kukar
        updatePosition(-0.41824, 117.02981, "Tenggarong, Kukar");
      },
      { timeout: 8000 }
    );
  };

  const latDir = coordinates.lat >= 0 ? "N" : "S";
  const lngDir = coordinates.lng >= 0 ? "E" : "W";

  return (
    <div className="workspace-col col-map">
      <div className="map-card-inner">
        <div className="map-toolbar">
          <div className="toolbar-title">
            <i className="fa-solid fa-map-location-dot"></i>
            <span>Peta Wilayah Kaltim</span>
          </div>
          <button
            type="button"
            id="btn-geolocation"
            className="btn-gps-prominent"
            onClick={handleGeolocation}
            disabled={isDetectingGps}
          >
            <i className="fa-solid fa-location-crosshairs"></i>
            <span>{isDetectingGps ? "Mencari GPS..." : "Deteksi GPS"}</span>
          </button>
        </div>

        {/* Leaflet Map Viewport */}
        <div
          ref={mapElementRef}
          id="map"
          className="map-viewport"
          style={{ height: "340px", minHeight: "320px", width: "100%" }}
        />

        {/* Coordinates Display Strip */}
        <div className="coords-display-strip">
          <div className="coord-box coord-box-region">
            <span className="coord-caption">Wilayah Terpilih</span>
            <span className="coord-val" id="coord-region">
              {coordinates.region}
            </span>
          </div>
          <div className="coord-divider"></div>
          <div className="coord-box">
            <span className="coord-caption">Latitude</span>
            <span className="coord-val" id="coord-lat">
              {Math.abs(coordinates.lat).toFixed(5)}° {latDir}
            </span>
          </div>
          <div className="coord-divider"></div>
          <div className="coord-box">
            <span className="coord-caption">Longitude</span>
            <span className="coord-val" id="coord-lng">
              {Math.abs(coordinates.lng).toFixed(5)}° {lngDir}
            </span>
          </div>
        </div>

        <div className="map-hint-row">
          <i className="fa-solid fa-hand-pointer"></i>
          <span>Klik atau geser pin di peta untuk memilih lokasi lahan manual.</span>
        </div>
      </div>
    </div>
  );
}
