"use client";

import { useEffect, useRef } from "react";
import L, { Map as LeafletMap, Marker } from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapProps {
  country?: string;
  state?: string;
  city?: string;
  zoom?: number;
}

const Map: React.FC<MapProps> = ({ country, state, city, zoom = 5 }) => {
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);

  // Construct the search query dynamically
  const locationQuery = [city, state, country].filter(Boolean).join(", ");

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("map").setView([20, 0], zoom);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapRef.current);
    }
  }, []);

  useEffect(() => {
    if (!locationQuery) return;

    const updateMap = async () => {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationQuery)}&format=json&limit=1`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.length > 0) {
          const { lat, lon } = data[0];

          if (mapRef.current) {
            mapRef.current.setView([parseFloat(lat), parseFloat(lon)], zoom);
          }

          if (markerRef.current) {
            mapRef.current?.removeLayer(markerRef.current);
          }

          markerRef.current = L.marker([parseFloat(lat), parseFloat(lon)])
            .addTo(mapRef.current!)
            .bindPopup(locationQuery)
            .openPopup();
        } else {
          console.warn("Location not found:", locationQuery);
        }
      } catch (error) {
        console.error("Error fetching location:", error);
      }
    };

    updateMap();
  }, [country, state, city, zoom]); // Re-run when country, state, or city changes

  return <div id="map" className=" h-full w-full rounded-lg"></div>;
};

export default Map;
