import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouteStore } from "@/store/useRouteStore"
import { AddressItem } from "@/components/AddressItem"
import { Button } from "@/components/ui/button"
import { MapPin, ChevronUp, ChevronDown, History } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Moon, Sun } from "lucide-react"

export function StopsBottomSheet() {
  const [isOpen, setIsOpen] = useState(false)
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

  return (
    <>
      {/* Floating button when closed */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            className="fixed bottom-6 left-1/2 z-20"
            initial={{ opacity: 0, y: 20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <button
              onClick={() => setIsOpen(true)}
              className="bg-card/95 backdrop-blur-md border shadow-lg rounded-full px-5 py-3 flex items-center gap-2 hover:bg-accent/50 transition-colors"
            >
              <MapPin className="w-4 h-4 text-primary" />
              <span className="font-medium">{addresses.length} stops</span>
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom sheet when open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-x-0 bottom-0 z-20 bg-card/95 backdrop-blur-md border-t shadow-lg rounded-t-[28px]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            style={{ maxHeight: "70vh" }}
          >
            {/* Drag handle */}
            <div className="pt-3 pb-2 px-4">
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
                    onClick={() => setIsOpen(false)}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="px-4 pb-6 space-y-3 overflow-y-auto" style={{ maxHeight: "calc(70vh - 80px)" }}>
              {addresses.map((address, index) => (
                <AddressItem
                  key={index}
                  address={address}
                  index={index}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
