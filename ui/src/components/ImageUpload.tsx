import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Loader2 } from "lucide-react"
import { useRouteStore, type Address } from "@/store/useRouteStore"
import { API_ENDPOINTS, apiRequest } from "@/lib/api"

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

      // Call the API using the new API configuration
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
    <div className="flex flex-col items-center gap-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Sketch-style upload button */}
      <div className="relative">
        {/* Hand-drawn border decoration */}
        <svg
          className="absolute -inset-4 w-[calc(100%+2rem)] h-[calc(100%+2rem)] pointer-events-none opacity-30"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="4"
            y="4"
            width="calc(100% - 8px)"
            height="calc(100% - 8px)"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="5,3"
            rx="8"
            className="animate-pulse"
            style={{ animationDuration: '3s' }}
          />
        </svg>

        <Button
          onClick={triggerFileSelect}
          disabled={isLoading}
          size="lg"
          className="handwritten-alt text-xl gap-3 px-8 py-6 border-3 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group"
        >
          {/* Sketch background effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {isLoading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="handwritten text-2xl">Sniffing out addresses...</span>
              <span className="ml-2">🐕</span>
            </>
          ) : (
            <>
              <Upload className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="handwritten text-2xl">Upload Photo</span>
              <span className="ml-2 group-hover:animate-bounce">📸</span>
            </>
          )}
        </Button>
      </div>

      {/* Hand-drawn arrow pointing up */}
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        className="text-muted-foreground -mt-2"
      >
        <path
          d="M 20 35 Q 18 25 20 15 Q 22 5 20 3"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="3,2"
        />
        <path
          d="M 15 8 L 20 3 L 25 8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Friendly instruction text */}
      <div className="relative max-w-md">
        <p className="handwritten-alt text-lg text-muted-foreground text-center leading-relaxed">
          Snap a pic of your delivery list, route sheet, or any addresses you need to visit.
          I'll read 'em and plot the perfect route! 🗺️✨
        </p>

        {/* Small paw decorations */}
        <div className="absolute -left-6 top-0 opacity-20">🐾</div>
        <div className="absolute -right-6 bottom-0 opacity-20 rotate-12">🐾</div>
      </div>

      {/* Tips - sketch note style */}
      <div className="mt-4 p-4 border-2 border-dashed border-muted rounded-lg bg-muted/20 max-w-md">
        <p className="handwritten-alt text-sm text-muted-foreground text-center">
          <span className="font-bold">💡 Tip:</span> Works best with clear, well-lit photos.
          Handwritten or printed addresses both work great!
        </p>
      </div>
    </div>
  )
}