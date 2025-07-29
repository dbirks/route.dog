import { Button } from "@/components/ui/button"
import { Edit, AlertTriangle } from "lucide-react"
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
    <div className={`flex items-center justify-between p-3 rounded-lg border ${
      !hasValidCoordinates ? 'border-destructive/50 bg-destructive/5' : 'border-border'
    }`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {isStartOrEnd && (
            <span className={`px-2 py-1 text-xs font-medium rounded ${
              index === 0 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {index === 0 ? 'Start' : 'End'}
            </span>
          )}
          {!hasValidCoordinates && (
            <div className="flex items-center gap-1 text-destructive">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-medium">Geocoding failed</span>
            </div>
          )}
        </div>
        
        <p className="font-medium text-sm mb-1">
          {address.standardized || address.original}
        </p>
        
        {address.standardized && address.standardized !== address.original && (
          <p className="text-xs text-muted-foreground">
            Original: {address.original}
          </p>
        )}
        
        {hasValidCoordinates && (
          <p className="text-xs text-muted-foreground">
            {address.latitude.toFixed(6)}, {address.longitude.toFixed(6)}
          </p>
        )}
      </div>
      
      <Button 
        variant="ghost" 
        size="sm"
        onClick={handleEdit}
        className="ml-2"
      >
        <Edit className="w-4 h-4" />
      </Button>
    </div>
  )
}