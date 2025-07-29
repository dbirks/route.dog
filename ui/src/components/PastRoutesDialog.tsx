import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useRouteStore } from "@/store/useRouteStore"

export function PastRoutesDialog() {
  const isOpen = useRouteStore(state => state.isPastRoutesOpen)
  const setOpen = useRouteStore(state => state.setPastRoutesOpen)

  const handleClose = () => setOpen(false)

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Past Routes</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="text-center py-8 text-muted-foreground">
            <p>No past routes saved yet.</p>
            <p className="text-sm mt-2">Routes will appear here after you process images with addresses.</p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}