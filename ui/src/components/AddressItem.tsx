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
  const isStartOrEnd = index === 0 || index === useRouteStore.getState().addresses.length - 1

  const handleEdit = () => {
    setEditingAddressIndex(index)
  }

  return (
    <div className={`relative flex items-start gap-3 p-4 rounded-lg border-2 transition-all hover:shadow-md ${
      !hasValidCoordinates
        ? 'border-destructive/50 bg-destructive/5 hover:border-destructive'
        : 'border-border bg-card hover:border-foreground/30'
    }`}>
      {/* Stop number badge - hand-drawn circle */}
      <div className="relative flex-shrink-0">
        <svg width="40" height="40" viewBox="0 0 40 40" className="text-foreground">
          {/* Hand-drawn circle */}
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="currentColor"
            opacity="0.1"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="2,1"
          />
          <text
            x="20"
            y="25"
            textAnchor="middle"
            className="handwritten text-lg font-bold"
            fill="currentColor"
          >
            {index + 1}
          </text>
        </svg>

        {/* Start/End indicators */}
        {isStartOrEnd && (
          <div className="absolute -top-1 -right-1">
            {index === 0 ? (
              <span className="text-lg" title="Start">🏁</span>
            ) : (
              <span className="text-lg" title="End">🎯</span>
            )}
          </div>
        )}
      </div>

      {/* Address content */}
      <div className="flex-1 min-w-0">
        {/* Address text - handwritten style */}
        <div className="flex items-start gap-2 mb-2">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
          <div className="flex-1">
            <p className="handwritten-alt text-base leading-relaxed font-medium">
              {address.standardized || address.original}
            </p>

            {address.standardized && address.standardized !== address.original && (
              <p className="text-xs text-muted-foreground mt-1 line-through opacity-60">
                {address.original}
              </p>
            )}
          </div>
        </div>

        {/* Coordinates or error */}
        {!hasValidCoordinates ? (
          <div className="flex items-center gap-2 text-destructive mt-2 p-2 rounded bg-destructive/10 border border-dashed border-destructive/30">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs handwritten-alt">
              Couldn't find this address on the map 🤔
            </span>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
            <span className="opacity-60">📍</span>
            <span className="font-mono">
              {address.latitude.toFixed(4)}, {address.longitude.toFixed(4)}
            </span>
          </div>
        )}
      </div>

      {/* Edit button - sketch style */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleEdit}
        className="flex-shrink-0 border border-dashed hover:border-solid hover:bg-accent transition-all"
        title="Edit address"
      >
        <Edit className="w-4 h-4" />
        <span className="sr-only">Edit address</span>
      </Button>

      {/* Sketch underline decoration */}
      <svg className="absolute bottom-0 left-4 right-4 h-1" preserveAspectRatio="none">
        <path
          d="M 0 0.5 Q 2 1 4 0.5 T 8 0.5 T 12 0.5"
          stroke="currentColor"
          strokeWidth="0.5"
          fill="none"
          className="text-border opacity-30"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  )
}