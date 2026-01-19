import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { useRouteStore } from "@/store/useRouteStore"
import { AddressItem } from "@/components/AddressItem"
import { PawPrint } from "@/components/DogMascot"

export function AddressListPanel() {
  const isOpen = useRouteStore(state => state.isAddressListOpen)
  const setOpen = useRouteStore(state => state.setAddressListOpen)
  const addresses = useRouteStore(state => state.addresses)

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent
        side="bottom"
        className="h-[70%] overflow-y-auto border-t-4 border-dashed bg-card/95 backdrop-blur"
      >
        <SheetHeader className="relative">
          {/* Notebook ring binding decoration */}
          <div className="absolute -top-4 left-0 right-0 flex justify-around">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full border-2 border-border bg-background shadow-inner"
              />
            ))}
          </div>

          <div className="flex items-center gap-3 mt-4">
            <SheetTitle className="handwritten text-3xl">
              📍 Delivery Stops
            </SheetTitle>
            <PawPrint size="md" className="opacity-30" />
          </div>

          <SheetDescription className="handwritten-alt text-base">
            {addresses.length === 0
              ? "No stops yet. Upload an image to extract addresses! 📸"
              : `${addresses.length} stop${addresses.length === 1 ? '' : 's'} on this route 🗺️`
            }
          </SheetDescription>

          {/* Decorative line under header */}
          <svg className="w-full h-2 mt-2" preserveAspectRatio="none">
            <path
              d="M 0 1 Q 10 2 20 1 T 40 1 T 60 1 T 80 1 T 100 1"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              vectorEffect="non-scaling-stroke"
              className="text-border"
            />
          </svg>
        </SheetHeader>

        <div className="mt-6 space-y-3 relative">
          {addresses.length === 0 ? (
            <div className="text-center py-12">
              <div className="handwritten-alt text-lg text-muted-foreground mb-4">
                <p>No addresses yet!</p>
                <p className="mt-2">Upload a photo to get started 🐕</p>
              </div>
              {/* Empty state decoration */}
              <div className="flex justify-center gap-4 mt-6 opacity-20">
                <PawPrint size="lg" className="rotate-12" />
                <PawPrint size="lg" className="-rotate-12" />
              </div>
            </div>
          ) : (
            <>
              {addresses.map((address, index) => (
                <AddressItem
                  key={index}
                  address={address}
                  index={index}
                />
              ))}

              {/* Decorative paw at the end of list */}
              <div className="flex justify-center py-4 opacity-20">
                <PawPrint size="lg" />
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}