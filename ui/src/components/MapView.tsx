import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useRouteStore } from '@/store/useRouteStore'

export function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])

  const addresses = useRouteStore(state => state.addresses)
  const selectedStopIndex = useRouteStore(state => state.selectedStopIndex)
  const setSelectedStopIndex = useRouteStore(state => state.setSelectedStopIndex)

  // Initialize map
  useEffect(() => {
    if (mapContainer.current && !mapRef.current) {
      mapRef.current = new maplibregl.Map({
        container: mapContainer.current,
        // Use Bright style - colorful map
        style: 'https://tiles.openfreemap.org/styles/bright',
        center: [-86.158, 39.768], // Indianapolis
        zoom: 10,
        attributionControl: false // We'll add our own collapsed one
      })

      // Add collapsed attribution control
      mapRef.current.addControl(
        new maplibregl.AttributionControl({ compact: true }),
        'bottom-right'
      )

      // Add navigation controls
      mapRef.current.addControl(
        new maplibregl.NavigationControl({ showCompass: true }),
        'top-right'
      )

      // Add geolocate control to track user location
      mapRef.current.addControl(
        new maplibregl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true
        }),
        'top-right'
      )
    }

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Update markers when addresses change
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Remove existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Add new markers and fit bounds
    if (addresses.length > 0) {
      const bounds = new maplibregl.LngLatBounds()

      addresses.forEach((address, index) => {
        if (address.longitude && address.latitude) {
          // All markers same color - red/white
          const marker = new maplibregl.Marker({
            color: '#dc2626' // Red for all stops
          })
            .setLngLat([address.longitude, address.latitude])
            .addTo(map)

          // On click, select the stop (no popup)
          marker.getElement().addEventListener('click', (e) => {
            e.stopPropagation()
            setSelectedStopIndex(index)
          })

          markersRef.current.push(marker)
          bounds.extend([address.longitude, address.latitude])
        }
      })

      // Fit map to show all markers
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, {
          padding: { top: 100, bottom: 50, left: 50, right: 50 }, // Extra top padding for nav bar
          duration: 500
        })
      }
    }
  }, [addresses, setSelectedStopIndex])

  // Center map on selected stop
  useEffect(() => {
    const map = mapRef.current
    if (!map || selectedStopIndex === null) return

    const address = addresses[selectedStopIndex]
    if (address && address.longitude && address.latitude) {
      map.flyTo({
        center: [address.longitude, address.latitude],
        zoom: 15,
        duration: 500,
        // Offset to account for bottom sheet (move center up)
        offset: [0, -100]
      })
    }
  }, [selectedStopIndex, addresses])

  return (
    <div
      ref={mapContainer}
      className="w-full h-full"
      id="map"
    />
  )
}
