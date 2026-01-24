import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Camera, ImageIcon, Loader2 } from "lucide-react"
import { useRouteStore, type Address } from "@/store/useRouteStore"
import { API_ENDPOINTS, apiRequest } from "@/lib/api"

export function ImageUpload() {
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const setAddresses = useRouteStore(state => state.setAddresses)
  const setAddressListOpen = useRouteStore(state => state.setAddressListOpen)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const handleImageUpload = async (file: File) => {
    setIsLoading(true)

    try {
      // Convert file to base64
      const base64 = await fileToBase64(file)

      // Call the API
      const data = await apiRequest<{ addresses: Address[] }>(
        API_ENDPOINTS.parseAddresses,
        {
          method: 'POST',
          body: JSON.stringify({
            image: base64
          }),
        }
      )

      // Update the store with addresses
      const addresses: Address[] = data.addresses || []
      setAddresses(addresses)

      // Open the address list to show results
      if (addresses.length > 0) {
        setAddressListOpen(true)
      }

    } catch (error) {
      console.error('Error processing image:', error)
      alert(`Error processing image: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
      // Reset file inputs
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      if (cameraInputRef.current) {
        cameraInputRef.current.value = ''
      }
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const base64 = reader.result as string
        // Remove the data URL prefix
        const base64Data = base64.split(',')[1]
        resolve(base64Data)
      }
      reader.onerror = error => reject(error)
    })
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  const triggerCameraCapture = () => {
    cameraInputRef.current?.click()
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* File picker input (photo library) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        id="file-upload"
      />

      {/* Camera capture input */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
        id="camera-upload"
      />

      {isLoading ? (
        <Button disabled size="lg" className="gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Processing...
        </Button>
      ) : (
        <div className="flex gap-2">
          <Button
            onClick={triggerCameraCapture}
            size="lg"
            className="gap-2"
          >
            <Camera className="w-5 h-5" />
            Take Photo
          </Button>
          <Button
            onClick={triggerFileSelect}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <ImageIcon className="w-5 h-5" />
            Choose Photo
          </Button>
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        Works with photos of lists, printed sheets, or handwritten notes
      </p>
    </div>
  )
}
