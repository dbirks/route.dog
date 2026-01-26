import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouteStore, type Address } from "@/store/useRouteStore"
import { API_ENDPOINTS, apiRequest } from "@/lib/api"

interface AddAddressDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddAddressDialog({ open, onOpenChange }: AddAddressDialogProps) {
  const addAddress = useRouteStore(state => state.addAddress)

  const [addressText, setAddressText] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleClose = () => {
    onOpenChange(false)
    setAddressText("")
  }

  const handleAdd = async () => {
    if (!addressText.trim()) return

    setIsLoading(true)
    try {
      // Call the geocoding API
      const data = await apiRequest<Address>(
        API_ENDPOINTS.geocodeAddress,
        {
          method: 'PUT',
          body: JSON.stringify({
            address: addressText.trim()
          }),
        }
      )

      // Add the address to the store
      addAddress({
        original: addressText.trim(),
        standardized: data.standardized || addressText.trim(),
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
      })

      handleClose()
    } catch (error) {
      console.error('Error geocoding address:', error)
      // Still add with no coordinates
      addAddress({
        original: addressText.trim(),
        standardized: addressText.trim(),
        latitude: 0,
        longitude: 0,
      })
      handleClose()
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading && addressText.trim()) {
      handleAdd()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="top-[20%] translate-y-0 sm:top-[50%] sm:-translate-y-1/2">
        <DialogHeader>
          <DialogTitle>Add Stop</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="new-address">Address</Label>
            <Input
              id="new-address"
              value={addressText}
              onChange={(e) => setAddressText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter address..."
              disabled={isLoading}
              autoFocus
            />
          </div>
        </div>

        <DialogFooter className="flex-row gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={isLoading || !addressText.trim()} className="flex-1">
            {isLoading ? "Adding..." : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
