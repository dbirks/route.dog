import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, Loader2 } from "lucide-react"
import { getImage } from "@/lib/imageStore"

interface ImagePreviewProps {
  imageId: string | null
  onClose: () => void
}

export function ImagePreview({ imageId, onClose }: ImagePreviewProps) {
  const [imageData, setImageData] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!imageId) {
      setImageData(null)
      return
    }

    setIsLoading(true)
    getImage(imageId)
      .then((data) => {
        setImageData(data)
      })
      .catch((error) => {
        console.error("Failed to load image:", error)
        setImageData(null)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [imageId])

  return (
    <Dialog open={!!imageId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 bg-black/95 border-none">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10 h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>

        {/* Image container */}
        <div className="flex items-center justify-center min-h-[50vh] p-4">
          {isLoading ? (
            <Loader2 className="w-8 h-8 animate-spin text-white/50" />
          ) : imageData ? (
            <img
              src={imageData}
              alt="Uploaded document"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          ) : (
            <div className="text-white/50 text-center">
              <p>Image not found</p>
              <p className="text-sm mt-1">It may have been removed to free up space</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
