"use client";

import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  TAMIL_NADU_DEFAULT,
  SELECTED_DISTRICT_ZOOM,
  getDistrictCenter
} from "@/lib/data/district-coordinates";
import TamilNaduLeafletMap from "./TamilNaduLeafletMap";

const CONTAINER_STYLE = { width: "100%", height: "100%", minHeight: "400px" };

interface Props {
  onDistrictSelect: (district: string) => void;
  selectedDistrict: string | null;
  performance?: { district: string; riskLevel: "Low" | "Medium" | "High" }[];
}

export default function TamilNaduDistrictMap({
  onDistrictSelect,
  selectedDistrict,
  performance = []
}: Props) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey || "",
    id: "tamilnadu-map"
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const hoveredFeatureRef = useRef<google.maps.Data.Feature | null>(null);

  const getFeatureStyle = useCallback(
    (feature: google.maps.Data.Feature) => {
      const district = feature.getProperty("district") as string;
      const perf = performance.find((p) => p.district === district);
      const risk = perf?.riskLevel ?? "Low";

      if (district === selectedDistrict) {
        return {
          fillColor: "#16a34a",
          strokeWeight: 2,
          strokeColor: "#065f46",
          fillOpacity: 0.7
        };
      }

      if (risk === "High") {
        return {
          fillColor: "#dc2626",
          strokeWeight: 1,
          strokeColor: "#991b1b",
          fillOpacity: 0.5
        };
      }

      if (risk === "Medium") {
        return {
          fillColor: "#eab308",
          strokeWeight: 1,
          strokeColor: "#a16207",
          fillOpacity: 0.4
        };
      }

      return {
        fillColor: "#94a3b8",
        strokeWeight: 1,
        strokeColor: "#334155",
        fillOpacity: 0.3
      };
    },
    [selectedDistrict, performance]
  );

  useEffect(() => {
    if (!map || !apiKey) return;

    fetch("/data/tamilnadu_districts.geojson")
      .then((res) => res.json())
      .then((data) => {
        const features: google.maps.Data.Feature[] = [];
        map.data.forEach((f) => features.push(f));
        features.forEach((f) => map.data.remove(f));

        map.data.addGeoJson(data);

        map.data.setStyle((feature) => getFeatureStyle(feature));

        map.data.addListener("click", (event: google.maps.Data.MouseEvent) => {
          const district = event.feature.getProperty("district") as string;
          if (district) onDistrictSelect(district);

          const geometry = event.feature.getGeometry();
          if (geometry) {
            const bounds = new google.maps.LatLngBounds();
            geometry.forEachLatLng((latlng) => bounds.extend(latlng));
            map.fitBounds(bounds, { top: 80, right: 80, bottom: 80, left: 80 });
          }
        });

        map.data.addListener("mouseover", (event: google.maps.Data.MouseEvent) => {
          hoveredFeatureRef.current = event.feature;
          map.data.overrideStyle(event.feature, {
            fillColor: "#facc15",
            fillOpacity: 0.6
          });
          map.getDiv().style.cursor = "pointer";
        });

        map.data.addListener("mouseout", (event: google.maps.Data.MouseEvent) => {
          hoveredFeatureRef.current = null;
          map.data.revertStyle(event.feature);
          map.getDiv().style.cursor = "";
        });
      })
      .catch(() => {
        console.warn("Could not load Tamil Nadu districts GeoJSON");
      });
  }, [map, apiKey, onDistrictSelect]);

  useEffect(() => {
    if (!map) return;
    map.data.setStyle((feature) => getFeatureStyle(feature));
  }, [map, selectedDistrict, getFeatureStyle]);

  useEffect(() => {
    if (!map) return;

    if (selectedDistrict) {
      const center = getDistrictCenter(selectedDistrict);
      map.panTo(center);
      map.setZoom(SELECTED_DISTRICT_ZOOM);
    } else {
      map.panTo(TAMIL_NADU_DEFAULT);
      map.setZoom(TAMIL_NADU_DEFAULT.zoom);
    }
  }, [map, selectedDistrict]);

  if (!apiKey) {
    return (
      <TamilNaduLeafletMap
        selectedDistrict={selectedDistrict}
        onDistrictSelect={onDistrictSelect}
        performance={performance}
      />
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-surface-100 bg-surface-50 p-8">
        <p className="text-sm text-slate-600">Failed to load Google Maps</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-surface-100 bg-surface-50">
        <p className="text-sm text-slate-500">Loading map…</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-surface-100 bg-white shadow-sm">
      <div className="absolute right-3 top-3 z-10 rounded-lg border border-surface-100 bg-white/95 px-3 py-2 shadow-sm backdrop-blur">
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
        <GoogleMap
          mapContainerStyle={CONTAINER_STYLE}
          center={TAMIL_NADU_DEFAULT}
          zoom={TAMIL_NADU_DEFAULT.zoom}
          onLoad={setMap}
          options={{
            gestureHandling: "greedy",
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: true,
            scaleControl: true,
            streetViewControl: false,
            rotateControl: true,
            fullscreenControl: true
          }}
        />
      </div>
    </div>
  );
}
