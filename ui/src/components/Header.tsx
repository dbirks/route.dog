import { useState } from "react"
import { Settings, Moon, Sun, X, Trash2 } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { useRouteStore } from "@/store/useRouteStore"

export function Header() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  const addresses = useRouteStore(state => state.addresses)
  const clearCurrentRoute = useRouteStore(state => state.clearCurrentRoute)

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark")

  const handleClearRoute = () => {
    if (confirm("Clear current route? This will remove all stops.")) {
      clearCurrentRoute()
      setIsSettingsOpen(false)
    }
  }

  return (
    <>
      {/* Header bar - fixed at top */}
      <header className="fixed top-0 left-0 right-0 z-40 h-12 bg-rose-300/90 backdrop-blur-sm flex items-center justify-between px-4 shadow-sm">
        {/* Logo */}
        <span className="text-rose-900 font-semibold tracking-tight">
          route.dog
        </span>

        {/* Settings button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-rose-900/80 hover:text-rose-900 hover:bg-rose-900/10"
          onClick={() => setIsSettingsOpen(true)}
        >
          <Settings className="w-4 h-4" />
        </Button>
      </header>

      {/* Settings panel - slides down from top */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsSettingsOpen(false)}
          />

          {/* Settings panel */}
          <div className="absolute top-0 left-0 right-0 bg-card border-b shadow-lg">
            {/* Header */}
            <div className="h-12 bg-rose-300/90 flex items-center justify-between px-4">
              <span className="text-rose-900 font-semibold">Settings</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-rose-900/80 hover:text-rose-900 hover:bg-rose-900/10"
                onClick={() => setIsSettingsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Settings content */}
            <div className="p-4 space-y-4">
              {/* Theme toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Appearance</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={toggleTheme}
                >
                  {theme === "dark" ? (
                    <>
                      <Sun className="w-4 h-4" />
                      Light mode
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4" />
                      Dark mode
                    </>
                  )}
                </Button>
              </div>

              {/* Clear route */}
              {addresses.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current Route</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleClearRoute}
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear Route
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Spacer to push content below header */}
      <div className="h-12" />
    </>
  )
}
