import { useRef, useState } from "react"
import { Sheet, type SheetRef } from "react-modal-sheet"
import { useRouteStore } from "@/store/useRouteStore"
import { AddressItem } from "@/components/AddressItem"
import { Button } from "@/components/ui/button"
import { MapPin, ChevronUp, ChevronDown, History } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Moon, Sun } from "lucide-react"

// Snap points: 0 = closed (but we keep it at peek), 0.5 = half, 1 = full
const snapPoints = [80, 0.5, 1] // 80px peek, 50% half, 100% full
const initialSnap = 0 // Start at peek

export function StopsBottomSheet() {
  const sheetRef = useRef<SheetRef>(null)
  const [currentSnap, setCurrentSnap] = useState(initialSnap)
  const { theme, setTheme } = useTheme()

  const addresses = useRouteStore(state => state.addresses)
  const setPastRoutesOpen = useRouteStore(state => state.setPastRoutesOpen)

  const hasAddresses = addresses.length > 0

  // Don't render if no addresses
  if (!hasAddresses) return null

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark")

  const snapTo = (index: number) => {
    sheetRef.current?.snapTo(index)
  }

  const isExpanded = currentSnap > 0

  return (
    <Sheet
      ref={sheetRef}
      isOpen={true}
      onClose={() => snapTo(0)}
      snapPoints={snapPoints}
      initialSnap={initialSnap}
      onSnap={setCurrentSnap}
      // Non-modal: no backdrop blocking
      style={{ zIndex: 20 }}
    >
      <Sheet.Container
        style={{
          backgroundColor: "transparent",
          boxShadow: "none",
        }}
      >
        {/* Custom styled container to match DynamicIsland */}
        <div className="mx-4 mb-4 bg-card/95 backdrop-blur-md border shadow-lg rounded-[28px] overflow-hidden h-full flex flex-col">
          {/* Header / drag handle area */}
          <Sheet.Header>
            <div className="pt-3 pb-2 px-4">
              {/* Drag indicator */}
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-3" />

              {/* Collapsed header row */}
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
                    onClick={() => {
                      setPastRoutesOpen(true)
                    }}
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
                    onClick={() => snapTo(isExpanded ? 0 : 1)}
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

      {/* No backdrop - we want non-modal behavior */}
    </Sheet>
  )
}
