import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouteStore, type Address } from "@/store/useRouteStore"
import { API_ENDPOINTS, apiRequest } from "@/lib/api"

export function EditAddressDialog() {
  const editingIndex = useRouteStore(state => state.editingAddressIndex)
  const setEditingIndex = useRouteStore(state => state.setEditingAddressIndex)
  const addresses = useRouteStore(state => state.addresses)
  const updateAddress = useRouteStore(state => state.updateAddress)
  
  const [editText, setEditText] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const isOpen = editingIndex !== null
  const currentAddress = editingIndex !== null ? addresses[editingIndex] : null

  useEffect(() => {
    if (currentAddress) {
      setEditText(currentAddress.original)
    }
  }, [currentAddress])

  const handleClose = () => {
    setEditingIndex(null)
    setEditText("")
  }

  const handleSave = async () => {
    if (editingIndex === null || !editText.trim()) return

    setIsLoading(true)
    try {
      // Call the geocoding API using the new API configuration
      const data = await apiRequest<Address>(
        API_ENDPOINTS.geocodeAddress,
        {
          method: 'PUT',
          body: JSON.stringify({
            address: editText.trim()
          }),
        }
      )

      // Update the address in the store
      updateAddress(editingIndex, {
        original: editText.trim(),
        standardized: data.standardized || editText.trim(),
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
      })

      handleClose()
    } catch (error) {
      console.error('Error geocoding address:', error)
      // Still update with the new text, but no coordinates
      updateAddress(editingIndex, {
        original: editText.trim(),
        standardized: editText.trim(),
        latitude: 0,
        longitude: 0,
      })
      handleClose()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Address</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder="Enter address..."
              disabled={isLoading}
            />
          </div>
          
          {currentAddress && (
            <div className="text-sm text-muted-foreground">
              <p>Current: {currentAddress.standardized || currentAddress.original}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-row gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading || !editText.trim()} className="flex-1">
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}