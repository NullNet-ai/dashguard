'use client'

import L, { type Map as LeafletMap, type Marker } from 'leaflet'
import React, { useEffect, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'

interface MapProps {
  country?: string
  state?: string
  city?: string
}

const Map: React.FC<MapProps> = ({ country, state, city }) => {
  const mapRef = useRef<LeafletMap | null>(null)
  const OPEN_STREET_MAP_API = process.env.OPEN_STREET_MAP_API ?? 'https://nominatim.openstreetmap.org/'
  const markerRef = useRef<Marker | null>(null)
  const initialLoadRef = useRef(false)
  const [previousState, setPreviousState] = useState(state)

  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    })
  }, [])

  const getZoomLevel = () => {
    if (city) return 13
    if (state) return 7
    if (country) return 5
    return 2
  }

  const getLocationQuery = () => {
    const parts = []
    if (city) parts.push(city)
    if (state) parts.push(state)
    if (country) parts.push(country)
    return parts.join(', ')
  }

  const updateMapLocation = async (locationQuery: string) => {
    if (!locationQuery || !mapRef.current) return

    try {
      const url = `${OPEN_STREET_MAP_API}search?q=${encodeURIComponent(locationQuery)}&format=json&limit=1`
      const response = await fetch(url)
      const data = await response.json()

      if (data && data.length > 0) {
        const { lat, lon } = data[0]
        const newLat = parseFloat(lat)
        const newLng = parseFloat(lon)

        // Clear existing marker
        if (markerRef.current) {
          mapRef.current.removeLayer(markerRef.current)
          markerRef.current = null
        }

        // Create new marker
        markerRef.current = L.marker([newLat, newLng])
          .addTo(mapRef.current)
          .bindPopup(locationQuery)
          .openPopup()

        // Update view with appropriate zoom
        const zoomLevel = getZoomLevel()

        mapRef.current.setView([newLat, newLng], zoomLevel, {
          animate: true,
          duration: 1,
        })
      }
    }
    catch (error) {
      console.error('❌ Error updating map location:', error)
    }
  }

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([20, 0], 2)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapRef.current)

      const initialQuery = getLocationQuery()
      if (initialQuery) {
        updateMapLocation(initialQuery).catch(error => console.error('❌ Error initializing map location:', error))
      }

      initialLoadRef.current = true
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Handle state changes
  useEffect(() => {
    if (!initialLoadRef.current) return
    if (state !== previousState) {
      setPreviousState(state)
      updateMapLocation(getLocationQuery()).catch(error => console.error('❌ Error updating map location:', error))
    }
  }, [state])

  // Handle city changes
  useEffect(() => {
    if (!initialLoadRef.current) return
    updateMapLocation(getLocationQuery()).catch(error => console.error('❌ Error updating map location:', error))
  }, [city])

  return <div className="h-full w-full rounded-lg" id="map" />
}

export default Map
