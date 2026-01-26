import { useRef, useState } from "react"
import { Sheet, type SheetRef } from "react-modal-sheet"
import { useRouteStore } from "@/store/useRouteStore"
import { Button } from "@/components/ui/button"
import { ChevronDown, Trash2, FileStack, MapPin } from "lucide-react"
import { ImagePreview } from "@/components/ImagePreview"
import { deleteImage } from "@/lib/imageStore"

export function UploadedImagesView() {
  const sheetRef = useRef<SheetRef>(null)
  const [previewImageId, setPreviewImageId] = useState<string | null>(null)

  const uploadedImages = useRouteStore(state => state.uploadedImages)
  const addresses = useRouteStore(state => state.addresses)
  const isImagesViewOpen = useRouteStore(state => state.isImagesViewOpen)
  const setImagesViewOpen = useRouteStore(state => state.setImagesViewOpen)
  const removeImage = useRouteStore(state => state.removeImage)

  const totalStops = addresses.length

  const handleRemoveImage = async (imageId: string) => {
    if (confirm("Remove this image and its addresses?")) {
      // Delete from IndexedDB first
      try {
        await deleteImage(imageId)
      } catch (error) {
        console.error("Failed to delete image from IndexedDB:", error)
      }
      // Then remove from Zustand store
      removeImage(imageId)
    }
  }

  return (
    <Sheet
      ref={sheetRef}
      isOpen={isImagesViewOpen}
      onClose={() => setImagesViewOpen(false)}
      snapPoints={[0.5, 0.7, 0.9]}
      initialSnap={0}
      detent="full"
      style={{ zIndex: 30 }}
    >
      <Sheet.Container className="!bg-card/95 !backdrop-blur-md !rounded-t-[28px] !shadow-lg">
        <div className="h-full flex flex-col max-h-[70vh]">
          {/* Header */}
          <Sheet.Header>
            <div className="pt-3 pb-2 px-4">
              {/* Drag indicator */}
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-3" />

              {/* Header row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileStack className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">Sheets</span>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setImagesViewOpen(false)}
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </div>

              {/* Summary */}
              <div className="mt-2 text-sm text-muted-foreground">
                {uploadedImages.length} sheet{uploadedImages.length !== 1 ? "s" : ""} • {totalStops} stop{totalStops !== 1 ? "s" : ""} total
              </div>
            </div>
          </Sheet.Header>

          {/* Scrollable content */}
          <Sheet.Content disableDrag>
            <div className="px-4 pb-6 space-y-3 overflow-y-auto flex-1">
              {/* Uploaded sheets */}
              {uploadedImages.map((image) => (
                <div
                  key={image.id}
                  className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg border"
                >
                  {/* Thumbnail - tap to preview */}
                  <button
                    className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0 hover:ring-2 hover:ring-primary transition-shadow"
                    onClick={() => setPreviewImageId(image.id)}
                  >
                    <img
                      src={image.thumbnail}
                      alt="Uploaded"
                      className="w-full h-full object-cover"
                    />
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">
                      {image.addressCount} stop{image.addressCount !== 1 ? "s" : ""}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(image.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  {/* Delete button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleRemoveImage(image.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              {/* Manually added stops (no source image) */}
              {(() => {
                const manualStops = addresses.filter(a => !a.sourceImageId)
                if (manualStops.length === 0) return null
                return (
                  <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg border">
                    <div className="w-16 h-16 rounded-md bg-muted flex-shrink-0 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">
                        {manualStops.length} manual stop{manualStops.length !== 1 ? "s" : ""}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Added individually
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* Empty state */}
              {uploadedImages.length === 0 && addresses.filter(a => !a.sourceImageId).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileStack className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No sheets uploaded yet</p>
                  <p className="text-sm mt-1">Use the + button to add photos of your route</p>
                </div>
              )}
            </div>
          </Sheet.Content>
        </div>
      </Sheet.Container>

      {/* Fullscreen image preview */}
      <ImagePreview
        imageId={previewImageId}
        onClose={() => setPreviewImageId(null)}
      />
    </Sheet>
  )
}
