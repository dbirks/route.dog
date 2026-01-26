import { useRef, useState, useCallback } from "react"
import { Sheet, type SheetRef } from "react-modal-sheet"
import { motion } from "framer-motion"
import { useRouteStore } from "@/store/useRouteStore"
import { AddressItem } from "@/components/AddressItem"
import { AddStopsSheet } from "@/components/AddStopsSheet"
import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown, History, Plus, FileStack } from "lucide-react"

// Snap points as fractions: 0.3 (peek), 0.5 (half), 0.85 (full)
const snapPoints = [0.3, 0.5, 0.85]
const initialSnap = 1 // Start at half (0.5)

export function StopsBottomSheet() {
  const sheetRef = useRef<SheetRef>(null)
  const touchStartY = useRef<number | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isAddStopsOpen, setIsAddStopsOpen] = useState(false)

  const addresses = useRouteStore(state => state.addresses)
  const selectedStopIndex = useRouteStore(state => state.selectedStopIndex)
  const setPastRoutesOpen = useRouteStore(state => state.setPastRoutesOpen)
  const setImagesViewOpen = useRouteStore(state => state.setImagesViewOpen)

  // Touch handlers for swipe-up gesture (must be before early returns)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartY.current === null) return
    const touchEndY = e.changedTouches[0].clientY
    const deltaY = touchStartY.current - touchEndY
    // If swiped up more than 30px, open the sheet
    if (deltaY > 30) {
      setIsOpen(true)
    }
    touchStartY.current = null
  }, [])

  const hasAddresses = addresses.length > 0

  // Don't render if no addresses
  if (!hasAddresses) return null

  // Hide when a stop is selected (detail sheet is shown)
  if (selectedStopIndex !== null) return null

  return (
    <>
      {/* Floating button when sheet is closed - tap or swipe up to open */}
      {!isOpen && (
        <motion.div
          className="fixed bottom-6 left-1/2 z-20"
          initial={{ opacity: 0, y: 20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <button
            onClick={() => setIsOpen(true)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="bg-card/95 backdrop-blur-md border shadow-lg rounded-full px-5 py-3 flex items-center gap-2 hover:bg-accent/50 active:bg-accent transition-colors"
          >
            <span className="font-medium">{addresses.length} stops</span>
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          </button>
        </motion.div>
      )}

      {/* Bottom sheet */}
      <Sheet
        ref={sheetRef}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        snapPoints={snapPoints}
        initialSnap={initialSnap}
        detent="full"
        style={{ zIndex: 20 }}
      >
        <Sheet.Container className="!bg-card/95 !backdrop-blur-md !rounded-t-[28px] !shadow-lg">
          <div className="h-full flex flex-col">
            {/* Header */}
            <Sheet.Header>
              <div className="pt-3 pb-2 px-4">
                {/* Drag indicator */}
                <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-3" />

                {/* Header row */}
                <div className="flex items-center justify-between">
                  <span className="font-medium">{addresses.length} stops</span>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setIsAddStopsOpen(true)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setImagesViewOpen(true)}
                    >
                      <FileStack className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPastRoutesOpen(true)}
                    >
                      <History className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setIsOpen(false)}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Sheet.Header>

            {/* Scrollable content - drag enabled for pull-down gesture */}
            <Sheet.Content>
              <div className="px-4 pb-6 space-y-3 overflow-y-auto flex-1">
                {addresses.map((address, index) => (
                  <AddressItem
                    key={index}
                    address={address}
                    index={index}
                  />
                ))}
              </div>
            </Sheet.Content>
          </div>
        </Sheet.Container>
      </Sheet>

      {/* Add Stops Sheet */}
      <AddStopsSheet
        open={isAddStopsOpen}
        onOpenChange={setIsAddStopsOpen}
      />
    </>
  )
}
