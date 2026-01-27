import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown, Camera, ImageIcon, Zap, History, MapPin, Loader2, Plus } from "lucide-react"
import { useRouteStore } from "@/store/useRouteStore"

interface DynamicIslandProps {
  onTryDemo: () => void
  isLoadingDemo: boolean
}

// Fixed heights to avoid animation glitches with "auto"
const COLLAPSED_HEIGHT = 56
const EXPANDED_HEIGHT_EMPTY = 160
const EXPANDED_HEIGHT_WITH_HISTORY = 200 // Extra row for "Resume last route"
const EXPANDED_HEIGHT_WITH_ADDRESSES = 180 // Extra row for "New Route"

export function DynamicIsland({ onTryDemo, isLoadingDemo }: DynamicIslandProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const addresses = useRouteStore(state => state.addresses)
  const pastRoutes = useRouteStore(state => state.pastRoutes)
  const setPastRoutesOpen = useRouteStore(state => state.setPastRoutesOpen)
  const setAddressListOpen = useRouteStore(state => state.setAddressListOpen)
  const clearCurrentRoute = useRouteStore(state => state.clearCurrentRoute)
  const loadRouteFromHistory = useRouteStore(state => state.loadRouteFromHistory)

  const hasAddresses = addresses.length > 0
  const hasPastRoutes = pastRoutes.length > 0
  const lastRoute = pastRoutes[0]

  const toggleExpanded = () => setIsExpanded(!isExpanded)

  const triggerCamera = () => {
    const cameraInput = document.querySelector('#camera-upload') as HTMLInputElement
    if (cameraInput) cameraInput.click()
    setIsExpanded(false)
  }

  const triggerFilePicker = () => {
    const fileInput = document.querySelector('#file-upload') as HTMLInputElement
    if (fileInput) fileInput.click()
    setIsExpanded(false)
  }

  const handleNewRoute = () => {
    if (confirm("Start a new route? Current stops will be saved to history.")) {
      clearCurrentRoute()
      setIsExpanded(false)
    }
  }

  const handleResumeLastRoute = () => {
    if (lastRoute) {
      loadRouteFromHistory(lastRoute.id)
      setIsExpanded(false)
    }
  }

  // Determine expanded height based on state
  const expandedHeight = hasAddresses
    ? EXPANDED_HEIGHT_WITH_ADDRESSES
    : hasPastRoutes
      ? EXPANDED_HEIGHT_WITH_HISTORY
      : EXPANDED_HEIGHT_EMPTY

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
      <motion.div
        className="bg-card/95 backdrop-blur-md border shadow-lg overflow-hidden rounded-[28px]"
        initial={false}
        animate={{
          width: isExpanded ? 300 : isLoadingDemo ? 200 : hasAddresses ? 160 : 200,
          height: isExpanded ? expandedHeight : COLLAPSED_HEIGHT,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 35,
          mass: 0.8
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {!isExpanded ? (
            // Collapsed state
            <motion.button
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              onClick={toggleExpanded}
              className="w-full h-full flex items-center justify-center gap-2 px-4 cursor-pointer hover:bg-accent/50 transition-colors"
            >
              {isLoadingDemo ? (
                <>
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  <span className="font-medium">Loading demo...</span>
                </>
              ) : hasAddresses ? (
                <>
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="font-medium">{addresses.length} stops</span>
                  <ChevronUp className="w-4 h-4 text-muted-foreground ml-1" />
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 text-primary" />
                  <span className="font-medium">Add route</span>
                  <ChevronUp className="w-4 h-4 text-muted-foreground ml-1" />
                </>
              )}
            </motion.button>
          ) : (
            // Expanded state
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="p-3 h-full flex flex-col"
            >
              {hasAddresses ? (
                // Has addresses - show stop management
                <div className="space-y-2 flex-1">
                  <Button
                    variant="default"
                    className="w-full gap-2"
                    onClick={() => {
                      setAddressListOpen(true)
                      setIsExpanded(false)
                    }}
                  >
                    <MapPin className="w-4 h-4" />
                    View {addresses.length} stops
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={handleNewRoute}
                  >
                    <Plus className="w-4 h-4" />
                    New Route
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 gap-1.5"
                      onClick={() => {
                        setPastRoutesOpen(true)
                        setIsExpanded(false)
                      }}
                    >
                      <History className="w-4 h-4" />
                      Route History
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleExpanded}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                // No addresses - show upload options
                <div className="space-y-2 flex-1">
                  {/* Resume last route - show prominently for returning users */}
                  {hasPastRoutes && lastRoute && (
                    <Button
                      variant="default"
                      className="w-full gap-2"
                      onClick={handleResumeLastRoute}
                    >
                      <History className="w-4 h-4" />
                      Resume last route ({lastRoute.addresses.length} stops)
                    </Button>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant={hasPastRoutes ? "outline" : "default"}
                      className="flex-1 gap-2"
                      onClick={triggerCamera}
                    >
                      <Camera className="w-4 h-4" />
                      Take Photo
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={triggerFilePicker}
                    >
                      <ImageIcon className="w-4 h-4" />
                      Choose
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 gap-1.5"
                      onClick={() => {
                        onTryDemo()
                        setIsExpanded(false)
                      }}
                      disabled={isLoadingDemo}
                    >
                      <Zap className="w-4 h-4" />
                      {isLoadingDemo ? "Loading..." : "Try demo"}
                    </Button>
                    {hasPastRoutes && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 gap-1.5"
                        onClick={() => {
                          setPastRoutesOpen(true)
                          setIsExpanded(false)
                        }}
                      >
                        <History className="w-4 h-4" />
                        All routes
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleExpanded}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
