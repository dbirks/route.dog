import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Loader2 } from "lucide-react"
import { useRouteStore, type Address } from "@/store/useRouteStore"

export function ImageUpload() {
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
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
      const response = await fetch('http://localhost:8080/v1/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to process image')
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      // Update the store with addresses
      const addresses: Address[] = data.addresses || []
      setAddresses(addresses)
      
      // Open the address list to show results
      if (addresses.length > 0) {
        setAddressListOpen(true)
      }
      
    } catch (error) {
      console.error('Error processing image:', error)
      // You could add a toast notification here
      alert(`Error processing image: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const base64 = reader.result as string
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64Data = base64.split(',')[1]
        resolve(base64Data)
      }
      reader.onerror = error => reject(error)
    })
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <Button 
        onClick={triggerFileSelect}
        disabled={isLoading}
        size="lg"
        className="gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            Upload Image
          </>
        )}
      </Button>
      
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        Upload an image containing addresses (delivery list, route sheet, etc.) 
        and we'll extract the addresses for you.
      </p>
    </div>
  )
}