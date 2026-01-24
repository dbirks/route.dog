import { useRef } from "react"
import { Sheet, type SheetRef } from "react-modal-sheet"
import { useRouteStore } from "@/store/useRouteStore"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, Navigation, Edit, AlertTriangle } from "lucide-react"

// Snap points: peek (shows header), expanded (2/3 screen)
const snapPoints = [200, 0.66]
const initialSnap = 1 // Start expanded

export function StopDetailSheet() {
  const sheetRef = useRef<SheetRef>(null)

  const addresses = useRouteStore(state => state.addresses)
  const selectedStopIndex = useRouteStore(state => state.selectedStopIndex)
  const setSelectedStopIndex = useRouteStore(state => state.setSelectedStopIndex)
  const setEditingAddressIndex = useRouteStore(state => state.setEditingAddressIndex)

  const selectedAddress = selectedStopIndex !== null ? addresses[selectedStopIndex] : null
  const isOpen = selectedStopIndex !== null

  const handleClose = () => {
    setSelectedStopIndex(null)
  }

  const handleEdit = () => {
    if (selectedStopIndex !== null) {
      setEditingAddressIndex(selectedStopIndex)
    }
  }

  const handleNavigate = () => {
    if (selectedAddress) {
      // Open in Google Maps or Apple Maps
      const query = encodeURIComponent(selectedAddress.standardized || selectedAddress.original)
      const url = `https://www.google.com/maps/dir/?api=1&destination=${query}`
      window.open(url, '_blank')
    }
  }

  const goToPrevStop = () => {
    if (selectedStopIndex !== null && selectedStopIndex > 0) {
      setSelectedStopIndex(selectedStopIndex - 1)
    }
  }

  const goToNextStop = () => {
    if (selectedStopIndex !== null && selectedStopIndex < addresses.length - 1) {
      setSelectedStopIndex(selectedStopIndex + 1)
    }
  }

  if (!isOpen || !selectedAddress) return null

  const hasValidCoordinates = selectedAddress.latitude !== 0 && selectedAddress.longitude !== 0

  return (
    <Sheet
      ref={sheetRef}
      isOpen={isOpen}
      onClose={handleClose}
      snapPoints={snapPoints}
      initialSnap={initialSnap}
      style={{ zIndex: 30 }}
    >
      <Sheet.Container
        style={{
          backgroundColor: "transparent",
          boxShadow: "none",
        }}
      >
        {/* Custom styled container - full width on mobile */}
        <div className="bg-card/95 backdrop-blur-md border-t shadow-lg rounded-t-[28px] overflow-hidden h-full flex flex-col">
          {/* Header */}
          <Sheet.Header>
            <div className="pt-3 pb-2 px-4">
              {/* Drag indicator */}
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-3" />

              {/* Header row with back button */}
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 -ml-1"
                  onClick={handleClose}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>

                <div className="flex-1">
                  <p className="font-medium">Stop {selectedStopIndex! + 1} of {addresses.length}</p>
                </div>

                {/* Navigation between stops */}
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={goToPrevStop}
                    disabled={selectedStopIndex === 0}
                  >
                    ←
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={goToNextStop}
                    disabled={selectedStopIndex === addresses.length - 1}
                  >
                    →
                  </Button>
                </div>
              </div>
            </div>
          </Sheet.Header>

          {/* Content */}
          <Sheet.Content disableDrag>
            <div className="px-4 pb-4 space-y-4 overflow-y-auto">
              {/* Address card */}
              <div className={`p-4 rounded-xl border ${
                !hasValidCoordinates
                  ? 'border-destructive/50 bg-destructive/5'
                  : 'border-border bg-muted/30'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">
                      {selectedAddress.standardized || selectedAddress.original}
                    </p>

                    {selectedAddress.standardized && selectedAddress.standardized !== selectedAddress.original && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Original: {selectedAddress.original}
                      </p>
                    )}

                    {!hasValidCoordinates ? (
                      <div className="flex items-center gap-2 text-destructive mt-2 text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Could not geocode this address</span>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-2 font-mono">
                        {selectedAddress.latitude.toFixed(5)}, {selectedAddress.longitude.toFixed(5)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button
                  variant="default"
                  className="flex-1 gap-2"
                  onClick={handleNavigate}
                  disabled={!hasValidCoordinates}
                >
                  <Navigation className="w-4 h-4" />
                  Navigate
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={handleEdit}
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
              </div>
            </div>
          </Sheet.Content>
        </div>
      </Sheet.Container>
    </Sheet>
  )
}
