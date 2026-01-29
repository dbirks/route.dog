import { useState, useRef } from "react"
import { Sheet, type SheetRef } from "react-modal-sheet"
import { Button } from "@/components/ui/button"
import {
  Camera,
  ImageIcon,
  Keyboard,
  ChevronDown,
  Check,
  Loader2,
  MapPin,
  RotateCcw
} from "lucide-react"
import { useRouteStore, type Address } from "@/store/useRouteStore"
import { API_ENDPOINTS, apiRequest } from "@/lib/api"
import { processImage, storeImage } from "@/lib/imageStore"
import { AddressAutocomplete } from "@/components/AddressAutocomplete"

const THUMBNAIL_SIZE = 100
const READABLE_SIZE = 800

interface ProcessedImage {
  id: string
  thumbnail: string
  addresses: Address[]
  fileName: string
}

type SheetState = "options" | "processing" | "typing" | "results"

interface AddStopsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddStopsSheet({ open, onOpenChange }: AddStopsSheetProps) {
  const sheetRef = useRef<SheetRef>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const [state, setState] = useState<SheetState>("options")
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([])
  const [processingProgress, setProcessingProgress] = useState({ current: 0, total: 0, currentFile: "" })
  const [typedAddress, setTypedAddress] = useState("")
  const [isTypingLoading, setIsTypingLoading] = useState(false)

  const addAddressesFromImage = useRouteStore(s => s.addAddressesFromImage)
  const addAddress = useRouteStore(s => s.addAddress)
  const clearCurrentRoute = useRouteStore(s => s.clearCurrentRoute)
  const uploadedImages = useRouteStore(s => s.uploadedImages)
  const addresses = useRouteStore(s => s.addresses)

  const handleClose = () => {
    onOpenChange(false)
    // Reset state after animation
    setTimeout(() => {
      setState("options")
      setProcessedImages([])
      setTypedAddress("")
    }, 300)
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const base64 = reader.result as string
        const base64Data = base64.split(',')[1]
        resolve(base64Data)
      }
      reader.onerror = reject
    })
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setState("processing")
    const results: ProcessedImage[] = []
    const total = files.length

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const imageId = crypto.randomUUID()

        setProcessingProgress({
          current: i + 1,
          total,
          currentFile: file.name
        })

        // Create thumbnail, readable image, and base64 for API
        const [thumbnail, readableImage, base64] = await Promise.all([
          processImage(file, THUMBNAIL_SIZE, 0.5),
          processImage(file, READABLE_SIZE, 0.7),
          fileToBase64(file),
        ])

        // Store readable image in IndexedDB
        await storeImage(imageId, readableImage)

        // Call API
        const data = await apiRequest<{ addresses: Address[] }>(
          API_ENDPOINTS.parseAddresses,
          {
            method: 'POST',
            body: JSON.stringify({ image: base64 }),
          }
        )

        const addressList = data.addresses || []

        if (addressList.length > 0) {
          // Auto-add to store
          addAddressesFromImage(addressList, imageId, thumbnail)

          results.push({
            id: imageId,
            thumbnail,
            addresses: addressList,
            fileName: file.name,
          })
        }
      }

      setProcessedImages(results)
      setState("results")

    } catch (error) {
      console.error('Error processing images:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setState("options")
    } finally {
      // Reset file inputs
      if (fileInputRef.current) fileInputRef.current.value = ''
      if (cameraInputRef.current) cameraInputRef.current.value = ''
    }
  }

  const handleTypeAddress = async () => {
    if (!typedAddress.trim()) return

    setIsTypingLoading(true)
    try {
      // Try backend geocoding first
      const data = await apiRequest<Address>(
        API_ENDPOINTS.geocodeAddress,
        {
          method: 'PUT',
          body: JSON.stringify({ address: typedAddress.trim() }),
        }
      )

      addAddress({
        original: typedAddress.trim(),
        standardized: data.standardized || typedAddress.trim(),
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
      })

      handleClose()
    } catch (error) {
      console.error('Backend geocoding failed, trying Nominatim fallback:', error)

      // Fallback to Nominatim (same API as autocomplete)
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
          `format=json&addressdetails=1&limit=1&q=${encodeURIComponent(typedAddress.trim())}`,
          {
            headers: {
              'User-Agent': 'RouteDog/1.0'
            }
          }
        )
        const data = await response.json()

        if (data && data.length > 0) {
          // Successfully geocoded with Nominatim
          addAddress({
            original: typedAddress.trim(),
            standardized: data[0].display_name,
            latitude: parseFloat(data[0].lat),
            longitude: parseFloat(data[0].lon),
          })
        } else {
          // No results from Nominatim either
          addAddress({
            original: typedAddress.trim(),
            standardized: typedAddress.trim(),
            latitude: 0,
            longitude: 0,
          })
        }
        handleClose()
      } catch (nominatimError) {
        console.error('Nominatim fallback also failed:', nominatimError)
        // Add without coordinates as last resort
        addAddress({
          original: typedAddress.trim(),
          standardized: typedAddress.trim(),
          latitude: 0,
          longitude: 0,
        })
        handleClose()
      }
    } finally {
      setIsTypingLoading(false)
    }
  }

  const handleSelectSuggestion = (suggestion: { address: string; lat: number; lon: number }) => {
    // When user selects from autocomplete, add it immediately
    addAddress({
      original: suggestion.address,
      standardized: suggestion.address,
      latitude: suggestion.lat,
      longitude: suggestion.lon,
    })
    handleClose()
  }

  // Group all addresses by source image for results view
  const imageGroups = uploadedImages.map(img => ({
    ...img,
    addresses: addresses.filter(a => a.sourceImageId === img.id)
  }))

  // Addresses without a source image (manually typed or from demo)
  const ungroupedAddresses = addresses.filter(a => !a.sourceImageId)

  const totalAddresses = addresses.length

  return (
    <>
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      <Sheet
        ref={sheetRef}
        isOpen={open}
        onClose={handleClose}
        snapPoints={[0.5, 0.85, 1]}
        initialSnap={1}
        style={{ zIndex: 30 }}
      >
        <Sheet.Container className="!bg-card/95 !backdrop-blur-md !rounded-t-[28px] !shadow-lg">
          <div className="h-full flex flex-col">
            <Sheet.Header>
              <div className="pt-3 pb-2 px-4">
                <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-3" />
                <div className="flex items-center justify-between">
                  <span className="font-medium text-lg">
                    {state === "options" && "Add Stops"}
                    {state === "processing" && "Processing..."}
                    {state === "typing" && "Type Address"}
                    {state === "results" && "Your Route"}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleClose}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </Sheet.Header>

            <Sheet.Content disableDrag>
              <div className="px-4 pb-6 overflow-y-auto flex-1">

                {/* OPTIONS STATE */}
                {state === "options" && (
                  <div className="space-y-3 pt-4">
                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      className="w-full flex items-center gap-4 p-4 bg-accent/50 rounded-xl border hover:bg-accent transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Camera className="w-6 h-6 text-primary" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Take Photo</div>
                        <div className="text-sm text-muted-foreground">
                          Capture a list or document
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center gap-4 p-4 bg-accent/50 rounded-xl border hover:bg-accent transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Choose Photos</div>
                        <div className="text-sm text-muted-foreground">
                          Select one or more images
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setState("typing")}
                      className="w-full flex items-center gap-4 p-4 bg-accent/50 rounded-xl border hover:bg-accent transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Keyboard className="w-6 h-6 text-primary" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Type Address</div>
                        <div className="text-sm text-muted-foreground">
                          Enter an address manually
                        </div>
                      </div>
                    </button>

                    {/* Divider */}
                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-card px-2 text-muted-foreground">or</span>
                      </div>
                    </div>

                    {/* Start New Route */}
                    <button
                      onClick={() => {
                        if (confirm("Start a new route? This will clear all current stops.")) {
                          clearCurrentRoute()
                          handleClose()
                        }
                      }}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border border-dashed hover:bg-accent/30 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <RotateCcw className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-muted-foreground">Start New Route</div>
                        <div className="text-sm text-muted-foreground">
                          Clear current route and start fresh
                        </div>
                      </div>
                    </button>
                  </div>
                )}

                {/* PROCESSING STATE */}
                {state === "processing" && (
                  <div className="pt-8 space-y-6">
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary mb-4" />
                      <div className="text-lg font-medium">
                        Processing {processingProgress.current} of {processingProgress.total}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 truncate px-4">
                        {processingProgress.currentFile}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary h-full transition-all duration-300"
                        style={{
                          width: `${(processingProgress.current / processingProgress.total) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* TYPING STATE */}
                {state === "typing" && (
                  <div className="pt-4 space-y-4">
                    <div className="space-y-2">
                      <AddressAutocomplete
                        value={typedAddress}
                        onChange={setTypedAddress}
                        onSelect={handleSelectSuggestion}
                        onSubmit={handleTypeAddress}
                        disabled={isTypingLoading}
                        placeholder="Start typing an address..."
                      />
                      <p className="text-xs text-muted-foreground">
                        Start typing to see suggestions, or enter a full address and press Add
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setState("options")}
                      >
                        Back
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={handleTypeAddress}
                        disabled={!typedAddress.trim() || isTypingLoading}
                      >
                        {isTypingLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Add"
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* RESULTS STATE */}
                {state === "results" && (
                  <div className="pt-4 space-y-4">
                    {/* Summary */}
                    <div className="text-center py-4">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-3">
                        <Check className="w-8 h-8 text-green-500" />
                      </div>
                      <div className="text-xl font-medium">
                        {processedImages.reduce((sum, img) => sum + img.addresses.length, 0)} addresses added
                      </div>
                      <div className="text-sm text-muted-foreground">
                        from {processedImages.length} image{processedImages.length !== 1 ? 's' : ''}
                      </div>
                    </div>

                    {/* Newly added images */}
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-muted-foreground">Just Added</div>
                      {processedImages.map((img) => (
                        <div
                          key={img.id}
                          className="flex items-center gap-3 p-3 bg-green-500/10 rounded-xl border border-green-500/20"
                        >
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            <img
                              src={img.thumbnail}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">
                              {img.addresses.length} address{img.addresses.length !== 1 ? 'es' : ''}
                            </div>
                            <div className="text-sm text-muted-foreground truncate">
                              {img.fileName}
                            </div>
                          </div>
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        </div>
                      ))}
                    </div>

                    {/* All route images */}
                    {imageGroups.length > processedImages.length && (
                      <div className="space-y-3 pt-2">
                        <div className="text-sm font-medium text-muted-foreground">All Images</div>
                        {imageGroups
                          .filter(img => !processedImages.find(p => p.id === img.id))
                          .map((img) => (
                            <div
                              key={img.id}
                              className="flex items-center gap-3 p-3 bg-accent/50 rounded-xl border"
                            >
                              <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                <img
                                  src={img.thumbnail}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium">
                                  {img.addresses.length} address{img.addresses.length !== 1 ? 'es' : ''}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Ungrouped addresses (typed or demo) */}
                    {ungroupedAddresses.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <div className="text-sm font-medium text-muted-foreground">Other Stops</div>
                        <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-xl border">
                          <div className="w-14 h-14 rounded-lg bg-muted flex-shrink-0 flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">
                              {ungroupedAddresses.length} address{ungroupedAddresses.length !== 1 ? 'es' : ''}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Manually added
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Total and actions */}
                    <div className="pt-4 border-t space-y-3">
                      <div className="text-center text-sm text-muted-foreground">
                        Total: {totalAddresses} stops in route
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setState("options")}
                        >
                          Add More
                        </Button>
                        <Button
                          className="flex-1"
                          onClick={handleClose}
                        >
                          View Map
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </Sheet.Content>
          </div>
        </Sheet.Container>
      </Sheet>
    </>
  )
}
