import { Button } from "@/components/ui/button"
import { History } from "lucide-react"
import { MapView } from "@/components/MapView"
import { ModeToggle } from "@/components/ModeToggle"
import { AddressListPanel } from "@/components/AddressListPanel"
import { PastRoutesDialog } from "@/components/PastRoutesDialog"
import { EditAddressDialog } from "@/components/EditAddressDialog"
import { ImageUpload } from "@/components/ImageUpload"
import { DogMascot, PawPrint } from "@/components/DogMascot"
import { useRouteStore } from "@/store/useRouteStore"

function App() {
  const setPastRoutesOpen = useRouteStore(state => state.setPastRoutesOpen)
  const setAddressListOpen = useRouteStore(state => state.setAddressListOpen)
  const addresses = useRouteStore(state => state.addresses)

  const openPastRoutes = () => setPastRoutesOpen(true)
  const openAddressList = () => setAddressListOpen(true)

  const hasAddresses = addresses.length > 0

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Decorative paw prints - scattered around */}
      <PawPrint className="absolute top-[15%] left-[10%] rotate-12 opacity-10" size="lg" />
      <PawPrint className="absolute top-[25%] right-[15%] -rotate-12 opacity-10" size="md" />
      <PawPrint className="absolute bottom-[20%] left-[20%] rotate-45 opacity-10" size="md" />
      <PawPrint className="absolute bottom-[30%] right-[25%] -rotate-6 opacity-10" size="lg" />

      {/* Header - Sketch style */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-card/90 dark:bg-card/80 backdrop-blur-sm border-b-2 border-dashed border-border torn-edge">
        <div className="flex items-center gap-4 relative z-20">
          <div className="flex items-center gap-2">
            <DogMascot variant={hasAddresses ? 'excited' : 'happy'} size="sm" />
            <h1 className="handwritten text-3xl font-bold tracking-wide sketch-underline">
              Route.dog
            </h1>
          </div>
          {hasAddresses && (
            <Button
              variant="outline"
              size="sm"
              onClick={openAddressList}
              className="handwritten-alt text-base border-2 hover:scale-105 transition-transform"
            >
              📍 View Addresses ({addresses.length})
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 relative z-20">
          <Button
            variant="outline"
            size="icon"
            onClick={openPastRoutes}
            aria-label="View past routes"
            className="border-2 hover:rotate-6 transition-transform"
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
        <div className="absolute inset-0 z-5 flex items-center justify-center bg-background/90 backdrop-blur-sm">
          <div className="text-center space-y-6 p-8 relative">
            {/* Decorative sketch frame */}
            <div className="absolute inset-0 border-4 border-dashed border-muted-foreground/20 rounded-lg animate-pulse"
                 style={{ animationDuration: '3s' }} />

            <div className="relative z-10">
              <DogMascot variant="happy" size="lg" className="mx-auto mb-6" />
              <h2 className="handwritten text-4xl font-bold mb-2 text-foreground">
                Welcome to Route.dog!
              </h2>
              <p className="handwritten-alt text-xl text-muted-foreground mb-8 max-w-md mx-auto">
                Upload a photo of your delivery list and I'll help you map the best route! 🗺️
              </p>
              <ImageUpload />
            </div>

            {/* Decorative paw prints around the welcome area */}
            <PawPrint className="absolute top-4 left-4 rotate-12" size="sm" />
            <PawPrint className="absolute top-4 right-4 -rotate-12" size="sm" />
            <PawPrint className="absolute bottom-4 left-8 rotate-45" size="sm" />
            <PawPrint className="absolute bottom-4 right-8 -rotate-45" size="sm" />
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
