"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import { useCallback, useEffect, useState } from "react";
import type { GeoJsonObject, Feature, GeoJsonProperties } from "geojson";
import type { PathOptions } from "leaflet";
import {
  TAMIL_NADU_DEFAULT,
  SELECTED_DISTRICT_ZOOM,
  getDistrictCenter
} from "@/lib/data/district-coordinates";

interface Props {
  onDistrictSelect: (district: string) => void;
  selectedDistrict: string | null;
  performance?: { district: string; riskLevel: "Low" | "Medium" | "High" }[];
}

function MapController({
  selectedDistrict
}: {
  selectedDistrict: string | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedDistrict) {
      const center = getDistrictCenter(selectedDistrict);
      map.setView([center.lat, center.lng], SELECTED_DISTRICT_ZOOM);
    } else {
      map.setView(
        [TAMIL_NADU_DEFAULT.lat, TAMIL_NADU_DEFAULT.lng],
        TAMIL_NADU_DEFAULT.zoom
      );
    }
  }, [map, selectedDistrict]);

  return null;
}

export default function TamilNaduLeafletMap({
  onDistrictSelect,
  selectedDistrict,
  performance = []
}: Props) {
  const [geoData, setGeoData] = useState<GeoJsonObject | null>(null);

  useEffect(() => {
    fetch("/data/tamilnadu_districts.geojson")
      .then((res) => res.json())
      .then(setGeoData)
      .catch(() => console.warn("Could not load Tamil Nadu districts GeoJSON"));
  }, []);

  const getStyle = useCallback(
    (feature?: { properties?: GeoJsonProperties }) => {
      const district = feature?.properties?.district as string | undefined;
      if (!district) return { fillColor: "#94a3b8", fillOpacity: 0.3 };

      const perf = performance.find((p) => p.district === district);
      const risk = perf?.riskLevel ?? "Low";

      const base: PathOptions = { weight: 1, fillOpacity: 0.4 };
      if (district === selectedDistrict) {
        return {
          ...base,
          fillColor: "#16a34a",
          color: "#065f46",
          weight: 2,
          fillOpacity: 0.7
        };
      }
      if (risk === "High") {
        return { ...base, fillColor: "#dc2626", color: "#991b1b", fillOpacity: 0.5 };
      }
      if (risk === "Medium") {
        return { ...base, fillColor: "#eab308", color: "#a16207" };
      }
      return { ...base, fillColor: "#94a3b8", color: "#334155", fillOpacity: 0.3 };
    },
    [selectedDistrict, performance]
  );

  const onEachFeature = useCallback(
    (feature: Feature, layer: { on: (ev: string, fn: () => void) => void }) => {
      layer.on("click", () => {
        const district = (feature.properties as { district?: string })?.district;
        if (district) onDistrictSelect(district);
      });
    },
    [onDistrictSelect]
  );

  if (!geoData) {
    return (
      <div
        className="flex items-center justify-center bg-slate-50"
        style={{ minHeight: "min(600px, 70vh)" }}
      >
        <p className="text-sm text-slate-500">Loading map…</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-surface-100 bg-white shadow-sm">
      <div className="absolute right-3 top-3 z-[1000] rounded-lg border border-surface-100 bg-white/95 px-3 py-2 shadow-sm backdrop-blur">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Legend
        </p>
        <div className="space-y-1 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-emerald-500" /> Selected
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-slate-400" /> Low risk
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-amber-400" /> Medium risk
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-rose-500" /> High risk
          </div>
        </div>
      </div>
      <div style={{ height: "min(600px, 70vh)" }} className="w-full">
        <MapContainer
          center={[TAMIL_NADU_DEFAULT.lat, TAMIL_NADU_DEFAULT.lng]}
          zoom={TAMIL_NADU_DEFAULT.zoom}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController selectedDistrict={selectedDistrict} />
          <GeoJSON
            data={geoData}
            style={(feature) => getStyle(feature)}
            onEachFeature={onEachFeature}
          />
        </MapContainer>
      </div>
    </div>
  );
}
