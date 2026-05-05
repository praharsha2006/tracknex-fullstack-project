'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function DashboardMap() {
  const mapContainer = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://api.maptiler.com/maps/streets-v2/style.json?key=yhN4ICJdXjtrl5bnWXFg',
      center: [77.5946, 12.9716], // Bangalore
      zoom: 12
    });

    return () => map.remove();
  }, []);

  return (
    <div
      ref={mapContainer}
      className="w-full h-[400px] rounded-xl shadow border"
    />
  );
}
