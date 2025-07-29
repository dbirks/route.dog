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
        style: 'https://demotiles.maplibre.org/style.json',
        center: [0, 0],
        zoom: 2
      })

      // Add navigation controls
      mapRef.current.addControl(
        new maplibregl.NavigationControl({ showCompass: true }),
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
          // Create marker with custom color for first/last
          const marker = new maplibregl.Marker({
            color: index === 0 ? '#22c55e' : index === addresses.length - 1 ? '#ef4444' : '#3b82f6'
          })
            .setLngLat([address.longitude, address.latitude])
            .setPopup(
              new maplibregl.Popup({ offset: 25 })
                .setHTML(`
                  <div class="p-2">
                    <p class="font-medium">${address.standardized || address.original}</p>
                    <p class="text-sm text-gray-600">${index === 0 ? 'Start' : index === addresses.length - 1 ? 'End' : `Stop ${index + 1}`}</p>
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
          padding: 50,
          duration: 500
        })
      }
    }
  }, [addresses])

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-full"
      id="map"
    />
  )
}