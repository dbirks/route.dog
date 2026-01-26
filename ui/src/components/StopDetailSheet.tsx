import { useRef } from "react"
import { Sheet, type SheetRef } from "react-modal-sheet"
import { motion, type PanInfo } from "framer-motion"
import { useRouteStore } from "@/store/useRouteStore"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, AlertTriangle, ExternalLink } from "lucide-react"

// Snap points as fractions: 0.35 (peek), 0.65 (expanded)
const snapPoints = [0.35, 0.65]
const initialSnap = 1 // Start expanded (0.65)

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

  const handleSwipe = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50
    if (info.offset.x > swipeThreshold) {
      // Swiped right -> go to previous stop
      goToPrevStop()
    } else if (info.offset.x < -swipeThreshold) {
      // Swiped left -> go to next stop
      goToNextStop()
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
      detent="full"
      style={{ zIndex: 30 }}
    >
      <Sheet.Container className="!bg-card/95 !backdrop-blur-md !rounded-t-[28px] !shadow-lg">
        {/* Full width content */}
        <div className="h-full flex flex-col">
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
              {/* Address card - swipeable */}
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleSwipe}
                className={`p-4 rounded-xl border cursor-grab active:cursor-grabbing ${
                  !hasValidCoordinates
                    ? 'border-destructive/50 bg-destructive/5'
                    : 'border-border bg-muted/30'
                }`}
              >
                <p className="font-medium text-lg">
                  {selectedAddress.standardized || selectedAddress.original}
                </p>

                {!hasValidCoordinates && (
                  <div className="flex items-center gap-2 text-destructive mt-3 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Could not geocode this address</span>
                  </div>
                )}

                {/* Action buttons inside card */}
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-2"
                    onClick={handleNavigate}
                    disabled={!hasValidCoordinates}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in Maps
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={handleEdit}
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                </div>
              </motion.div>
            </div>
          </Sheet.Content>
        </div>
      </Sheet.Container>
    </Sheet>
  )
}
