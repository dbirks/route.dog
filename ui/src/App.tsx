import { Button } from "@/components/ui/button"
import { History } from "lucide-react"
import { MapView } from "@/components/MapView"
import { ModeToggle } from "@/components/ModeToggle"
import { AddressListPanel } from "@/components/AddressListPanel"
import { PastRoutesDialog } from "@/components/PastRoutesDialog"
import { EditAddressDialog } from "@/components/EditAddressDialog"
import { ImageUpload } from "@/components/ImageUpload"
import { useRouteStore } from "@/store/useRouteStore"

function App() {
  const setPastRoutesOpen = useRouteStore(state => state.setPastRoutesOpen)
  const setAddressListOpen = useRouteStore(state => state.setAddressListOpen)
  const addresses = useRouteStore(state => state.addresses)

  const openPastRoutes = () => setPastRoutesOpen(true)
  const openAddressList = () => setAddressListOpen(true)

  const hasAddresses = addresses.length > 0

  return (
    <div className="relative w-full h-full">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-white/80 dark:bg-neutral-800/80 backdrop-blur">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold">Route.dog</h1>
          {hasAddresses && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={openAddressList}
            >
              View Addresses ({addresses.length})
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={openPastRoutes}
            aria-label="View past routes"
          >
            <History className="w-4 h-4" />
          </Button>
          <ModeToggle />
        </div>
      </div>

      {/* Main Map View */}
      <MapView />

      {/* Upload overlay when no addresses */}
      {!hasAddresses && (
        <div className="absolute inset-0 z-5 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="text-center">
            <ImageUpload />
          </div>
        </div>
      )}

      {/* Address List Panel */}
      <AddressListPanel />

      {/* Past Routes Dialog */}
      <PastRoutesDialog />

      {/* Edit Address Dialog */}
      <EditAddressDialog />
    </div>
  )
}

export default App
