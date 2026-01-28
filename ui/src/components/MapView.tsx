import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useRouteStore } from '@/store/useRouteStore'
import { useTheme } from '@/components/theme-provider'
import { Locate, LocateFixed } from 'lucide-react'

const MAP_STYLES = {
  light: 'https://tiles.openfreemap.org/styles/bright',
  dark: 'https://tiles.openfreemap.org/styles/dark'
}

export function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const geolocateRef = useRef<maplibregl.GeolocateControl | null>(null)
  const [isLocating, setIsLocating] = useState(false)

  const addresses = useRouteStore(state => state.addresses)
  const selectedStopIndex = useRouteStore(state => state.selectedStopIndex)
  const setSelectedStopIndex = useRouteStore(state => state.setSelectedStopIndex)
  const { effectiveTheme } = useTheme()

  // Initialize map
  useEffect(() => {
    if (mapContainer.current && !mapRef.current) {
      mapRef.current = new maplibregl.Map({
        container: mapContainer.current,
        style: MAP_STYLES[effectiveTheme],
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
      // Note: 'geolocate' event fires when position is obtained - we stay blue while tracking
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
  }, [effectiveTheme])

  // Update map style when theme changes
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const newStyle = MAP_STYLES[effectiveTheme]

    // Save current center and zoom
    const center = map.getCenter()
    const zoom = map.getZoom()

    map.setStyle(newStyle)

    // Re-add markers after style loads (setStyle removes them)
    map.once('style.load', () => {
      // Restore view
      map.setCenter(center)
      map.setZoom(zoom)

      // Re-add markers
      markersRef.current = []
      addresses.forEach((address, index) => {
        if (address.longitude && address.latitude) {
          const marker = new maplibregl.Marker({
            color: '#dc2626'
          })
            .setLngLat([address.longitude, address.latitude])
            .addTo(map)

          marker.getElement().addEventListener('click', (e) => {
            e.stopPropagation()
            setSelectedStopIndex(index)
          })

          markersRef.current.push(marker)
        }
      })
    })
  }, [effectiveTheme, addresses, setSelectedStopIndex])

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
        className={`fixed bottom-6 right-4 z-10 w-14 h-14 rounded-full bg-card/95 backdrop-blur-md border shadow-lg flex items-center justify-center hover:bg-accent/50 active:bg-accent transition-colors ${
          isLocating ? 'text-blue-500' : 'text-muted-foreground'
        }`}
        aria-label="Find my location"
      >
        {isLocating ? (
          <LocateFixed className="w-6 h-6" />
        ) : (
          <Locate className="w-6 h-6" />
        )}
      </button>
    </>
  )
}
