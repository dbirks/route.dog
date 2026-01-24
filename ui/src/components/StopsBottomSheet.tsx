import { useRef, useState } from "react"
import { Sheet, type SheetRef } from "react-modal-sheet"
import { motion } from "framer-motion"
import { useRouteStore } from "@/store/useRouteStore"
import { AddressItem } from "@/components/AddressItem"
import { Button } from "@/components/ui/button"
import { MapPin, ChevronUp, ChevronDown, History } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Moon, Sun } from "lucide-react"

// Snap points as fractions: 0.15 (peek), 0.5 (half), 0.9 (full)
const snapPoints = [0.15, 0.5, 0.9]
const initialSnap = 0 // Start at peek (0.15)

export function StopsBottomSheet() {
  const sheetRef = useRef<SheetRef>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [currentSnap, setCurrentSnap] = useState(initialSnap)
  const { theme, setTheme } = useTheme()

  const addresses = useRouteStore(state => state.addresses)
  const selectedStopIndex = useRouteStore(state => state.selectedStopIndex)
  const setPastRoutesOpen = useRouteStore(state => state.setPastRoutesOpen)

  const hasAddresses = addresses.length > 0

  // Don't render if no addresses
  if (!hasAddresses) return null

  // Hide when a stop is selected (detail sheet is shown)
  if (selectedStopIndex !== null) return null

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark")

  const openSheet = () => setIsSheetOpen(true)
  const closeSheet = () => setIsSheetOpen(false)

  const snapTo = (index: number) => {
    sheetRef.current?.snapTo(index)
  }

  const isExpanded = currentSnap > 0

  // Show floating button when sheet is closed
  if (!isSheetOpen) {
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
        <motion.button
          onClick={openSheet}
          className="bg-card/95 backdrop-blur-md border shadow-lg rounded-full px-5 py-3 flex items-center gap-2 hover:bg-accent/50 transition-colors"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <MapPin className="w-4 h-4 text-primary" />
          <span className="font-medium">{addresses.length} stops</span>
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        </motion.button>
      </div>
    )
  }

  return (
    <Sheet
      ref={sheetRef}
      isOpen={isSheetOpen}
      onClose={closeSheet}
      snapPoints={snapPoints}
      initialSnap={initialSnap}
      onSnap={setCurrentSnap}
      detent="full"
      style={{ zIndex: 20 }}
    >
      <Sheet.Container className="!bg-card/95 !backdrop-blur-md !rounded-t-[28px] !shadow-lg">
        {/* Full width content */}
        <div className="h-full flex flex-col">
          {/* Header / drag handle area */}
          <Sheet.Header>
            <div className="pt-3 pb-2 px-4">
              {/* Drag indicator */}
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-3" />

              {/* Header row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="font-medium">{addresses.length} stops</span>
                </div>

                <div className="flex items-center gap-1">
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
                    onClick={toggleTheme}
                  >
                    {theme === "dark" ? (
                      <Sun className="w-4 h-4" />
                    ) : (
                      <Moon className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => isExpanded ? closeSheet() : snapTo(1)}
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronUp className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Sheet.Header>

          {/* Scrollable content */}
          <Sheet.Content disableDrag>
            <div className="px-4 pb-4 space-y-3 overflow-y-auto">
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
  )
}
