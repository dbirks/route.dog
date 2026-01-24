import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useRouteStore } from '@/store/useRouteStore'
import { Crosshair } from 'lucide-react'

export function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const geolocateRef = useRef<maplibregl.GeolocateControl | null>(null)
  const [isLocating, setIsLocating] = useState(false)

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

      // Add collapsed attribution control (starts collapsed)
      mapRef.current.addControl(
        new maplibregl.AttributionControl({ compact: true, customAttribution: '' }),
        'bottom-left'
      )

      // Add hidden geolocate control (we'll trigger it via custom button)
      const geolocate = new maplibregl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserLocation: true
      })
      geolocateRef.current = geolocate

      // Track geolocate state
      geolocate.on('geolocate', () => setIsLocating(false))
      geolocate.on('error', () => setIsLocating(false))
      geolocate.on('trackuserlocationstart', () => setIsLocating(true))
      geolocate.on('trackuserlocationend', () => setIsLocating(false))

      // Add control but hide it with CSS
      mapRef.current.addControl(geolocate, 'top-right')
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

  const handleGeolocate = () => {
    if (geolocateRef.current) {
      geolocateRef.current.trigger()
    }
  }

  return (
    <>
      <div
        ref={mapContainer}
        className="w-full h-full"
        id="map"
      />
      {/* Custom geolocate button - bottom right, matching floating button style */}
      <button
        onClick={handleGeolocate}
        className={`fixed bottom-6 right-4 z-10 w-12 h-12 rounded-full bg-card/95 backdrop-blur-md border shadow-lg flex items-center justify-center hover:bg-accent/50 active:bg-accent transition-colors ${
          isLocating ? 'text-primary animate-pulse' : 'text-muted-foreground'
        }`}
        aria-label="Find my location"
      >
        <Crosshair className="w-5 h-5" />
      </button>
    </>
  )
}
