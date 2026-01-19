import { Button } from "@/components/ui/button"
import { Edit, AlertTriangle, MapPin } from "lucide-react"
import { useRouteStore, type Address } from "@/store/useRouteStore"

interface AddressItemProps {
  address: Address
  index: number
}

export function AddressItem({ address, index }: AddressItemProps) {
  const setEditingAddressIndex = useRouteStore(state => state.setEditingAddressIndex)

  const hasValidCoordinates = address.latitude !== 0 && address.longitude !== 0

  const handleEdit = () => {
    setEditingAddressIndex(index)
  }

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${
      !hasValidCoordinates
        ? 'border-destructive/50 bg-destructive/5'
        : 'border-border bg-card hover:border-foreground/20'
    }`}>
      {/* Stop number */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-sm">
        {index + 1}
      </div>

      {/* Address content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </div>

        <p className="font-medium text-sm">
          {address.standardized || address.original}
        </p>

        {address.standardized && address.standardized !== address.original && (
          <p className="text-xs text-muted-foreground mt-1">
            Original: {address.original}
          </p>
        )}

        {!hasValidCoordinates ? (
          <div className="flex items-center gap-2 text-destructive mt-2 text-xs">
            <AlertTriangle className="w-3 h-3" />
            <span>Could not geocode this address</span>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            {address.latitude.toFixed(4)}, {address.longitude.toFixed(4)}
          </p>
        )}
      </div>

      {/* Edit button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleEdit}
        className="flex-shrink-0"
      >
        <Edit className="w-4 h-4" />
      </Button>
    </div>
  )
}
