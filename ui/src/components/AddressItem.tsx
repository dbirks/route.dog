import { AlertTriangle, MapPin, ChevronRight } from "lucide-react"
import { useRouteStore, type Address } from "@/store/useRouteStore"

interface AddressItemProps {
  address: Address
  index: number
}

export function AddressItem({ address, index }: AddressItemProps) {
  const setSelectedStopIndex = useRouteStore(state => state.setSelectedStopIndex)

  const hasValidCoordinates = address.latitude !== 0 && address.longitude !== 0

  const handleSelect = () => {
    setSelectedStopIndex(index)
  }

  return (
    <button
      onClick={handleSelect}
      className={`w-full flex items-start gap-3 p-4 rounded-lg border transition-colors text-left ${
        !hasValidCoordinates
          ? 'border-destructive/50 bg-destructive/5'
          : 'border-border bg-card hover:border-foreground/20 active:bg-accent'
      }`}
    >
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

        {!hasValidCoordinates && (
          <div className="flex items-center gap-2 text-destructive mt-2 text-xs">
            <AlertTriangle className="w-3 h-3" />
            <span>Could not geocode</span>
          </div>
        )}
      </div>

      {/* Chevron indicator */}
      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-2" />
    </button>
  )
}
