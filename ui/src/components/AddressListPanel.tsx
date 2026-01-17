import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { useRouteStore } from "@/store/useRouteStore"
import { AddressItem } from "@/components/AddressItem"

export function AddressListPanel() {
  const isOpen = useRouteStore(state => state.isAddressListOpen)
  const setOpen = useRouteStore(state => state.setAddressListOpen)
  const addresses = useRouteStore(state => state.addresses)

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent 
        side="bottom" 
        className="h-[70%] overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>Addresses</SheetTitle>
          <SheetDescription>
            {addresses.length === 0 
              ? "No addresses yet. Upload an image to extract addresses."
              : `${addresses.length} address${addresses.length === 1 ? '' : 'es'} in this route.`
            }
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-4 space-y-2">
          {addresses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Upload an image containing addresses to get started.</p>
            </div>
          ) : (
            addresses.map((address, index) => (
              <AddressItem 
                key={index}
                address={address}
                index={index}
              />
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}