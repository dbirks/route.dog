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

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsLoading(true)
    const allAddresses: Address[] = []

    try {
      // Process all selected files
      for (const file of Array.from(files)) {
        const base64 = await fileToBase64(file)

        const data = await apiRequest<{ addresses: Address[] }>(
          API_ENDPOINTS.parseAddresses,
          {
            method: 'POST',
            body: JSON.stringify({
              image: base64
            }),
          }
        )

        if (data.addresses) {
          allAddresses.push(...data.addresses)
        }
      }

      // Update the store with all addresses from all images
      if (allAddresses.length > 0) {
        setAddresses(allAddresses)
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
      {/* File picker input (photo library) - supports multiple selection */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
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
