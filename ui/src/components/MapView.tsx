import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useRouteStore } from '@/store/useRouteStore'

export function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])

  const addresses = useRouteStore(state => state.addresses)

  // Initialize map
  useEffect(() => {
    if (mapContainer.current && !mapRef.current) {
      mapRef.current = new maplibregl.Map({
        container: mapContainer.current,
        // Use OSM Liberty style - open source with street details
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center: [-122.4, 37.8], // San Francisco Bay Area
        zoom: 10
      })

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
          // All markers same color - no special start/end
          const marker = new maplibregl.Marker({
            color: '#3b82f6' // Blue for all stops
          })
            .setLngLat([address.longitude, address.latitude])
            .setPopup(
              new maplibregl.Popup({ offset: 25 })
                .setHTML(`
                  <div class="p-2">
                    <p class="font-medium text-sm">Stop ${index + 1}</p>
                    <p class="text-xs">${address.standardized || address.original}</p>
                  </div>
                `)
            )
            .addTo(map)

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
  }, [addresses])

  return (
    <div
      ref={mapContainer}
      className="w-full h-full"
      style={{ paddingTop: '56px' }} // Account for nav bar height
      id="map"
    />
  )
}
