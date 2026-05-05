'use client';

import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl, { LngLatLike, Map, Marker } from 'maplibre-gl';
import { useEffect, useRef } from 'react';

export default function AnimatedMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markerRef = useRef<Marker | null>(null);

  // A realistic winding route across Lucknow
  const route: [number, number][] = [
    [80.9462, 26.8467],
    [80.9501, 26.8479],
    [80.9555, 26.8492],
    [80.9607, 26.8506],
    [80.9649, 26.8519],
    [80.9692, 26.8534],
    [80.9731, 26.8550],
    [80.9773, 26.8573],
    [80.9752, 26.8611],
    [80.9709, 26.8630],
    [80.9662, 26.8648],
    [80.9616, 26.8662],
    [80.9567, 26.8681],
    [80.9521, 26.8698],
    [80.9472, 26.8713],
    [80.9423, 26.8732],
    [80.9379, 26.8745],
    [80.9333, 26.8759],
    [80.9290, 26.8775]
  ];

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://api.maptiler.com/maps/streets-v2/style.json?key=yhN4ICJdXjtrl5bnWXFg',
      center: route[0],
      zoom: 15.5,
    });

    mapRef.current = map;

    map.on('load', () => {
      // Add the route line
      map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: route,
          },
        },
      });

      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#007bff',
          'line-width': 4,
        },
      });

      // Create and place the marker at the start
      const marker = new maplibregl.Marker()
        .setLngLat(route[0] as LngLatLike)
        .addTo(map);

      markerRef.current = marker;

      let i = 0;

      const animate = () => {
        i = (i + 1) % route.length;
        const nextPoint = route[i];

        marker.setLngLat(nextPoint);
        map.easeTo({ center: nextPoint, duration: 3000 });

        setTimeout(animate, 3000); // Slow speed
      };

      animate();
    });

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div
      ref={mapContainer}
      className="w-full h-[600px] rounded-xl shadow"
    />
  );
}
