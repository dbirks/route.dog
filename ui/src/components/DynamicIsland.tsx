import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown, Upload, Zap, History, Moon, Sun, MapPin } from "lucide-react"
import { useRouteStore } from "@/store/useRouteStore"
import { useTheme } from "@/components/theme-provider"

interface DynamicIslandProps {
  onTryDemo: () => void
  isLoadingDemo: boolean
}

export function DynamicIsland({ onTryDemo, isLoadingDemo }: DynamicIslandProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { theme, setTheme } = useTheme()

  const addresses = useRouteStore(state => state.addresses)
  const setPastRoutesOpen = useRouteStore(state => state.setPastRoutesOpen)
  const setAddressListOpen = useRouteStore(state => state.setAddressListOpen)

  const hasAddresses = addresses.length > 0

  const toggleExpanded = () => setIsExpanded(!isExpanded)
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark")

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
      <motion.div
        layout
        className="bg-card/95 backdrop-blur-md border shadow-lg overflow-hidden"
        style={{ borderRadius: 28 }}
        initial={false}
        animate={{
          width: isExpanded ? 320 : hasAddresses ? 160 : 200,
          height: isExpanded ? "auto" : 56,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        {/* Collapsed state */}
        <AnimatePresence mode="wait">
          {!isExpanded && (
            <motion.button
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={toggleExpanded}
              className="w-full h-14 flex items-center justify-center gap-2 px-4 cursor-pointer hover:bg-accent/50 transition-colors"
            >
              {hasAddresses ? (
                <>
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="font-medium">{addresses.length} stops</span>
                  <ChevronUp className="w-4 h-4 text-muted-foreground ml-1" />
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-primary" />
                  <span className="font-medium">Upload route</span>
                  <ChevronUp className="w-4 h-4 text-muted-foreground ml-1" />
                </>
              )}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Expanded state */}
        <AnimatePresence mode="wait">
          {isExpanded && (
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="p-4"
            >
              {/* Header with collapse button */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="logo-sketch text-xl">route.dog</h2>
                <button
                  onClick={toggleExpanded}
                  className="p-2 hover:bg-accent rounded-full transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {hasAddresses ? (
                /* Has addresses - show stop management */
                <div className="space-y-3">
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

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5"
                      onClick={() => {
                        setPastRoutesOpen(true)
                        setIsExpanded(false)
                      }}
                    >
                      <History className="w-4 h-4" />
                      History
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={toggleTheme}
                    >
                      {theme === "dark" ? (
                        <Sun className="w-4 h-4" />
                      ) : (
                        <Moon className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                /* No addresses - show upload options */
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground text-center">
                    Upload a photo of your delivery list
                  </p>

                  <Button
                    variant="default"
                    className="w-full gap-2"
                    onClick={() => {
                      // Trigger file input click
                      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
                      if (fileInput) fileInput.click()
                      setIsExpanded(false)
                    }}
                  >
                    <Upload className="w-4 h-4" />
                    Choose photo
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => {
                      onTryDemo()
                      setIsExpanded(false)
                    }}
                    disabled={isLoadingDemo}
                  >
                    <Zap className="w-4 h-4" />
                    {isLoadingDemo ? "Loading..." : "Try a demo"}
                  </Button>

                  <div className="flex gap-2 pt-1">
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
                      History
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleTheme}
                    >
                      {theme === "dark" ? (
                        <Sun className="w-4 h-4" />
                      ) : (
                        <Moon className="w-4 h-4" />
                      )}
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
