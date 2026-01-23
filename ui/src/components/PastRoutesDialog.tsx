import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useRouteStore } from "@/store/useRouteStore"
import { MapPin, Trash2, Clock } from "lucide-react"

export function PastRoutesDialog() {
  const isOpen = useRouteStore(state => state.isPastRoutesOpen)
  const setOpen = useRouteStore(state => state.setPastRoutesOpen)
  const pastRoutes = useRouteStore(state => state.pastRoutes)
  const loadRouteFromHistory = useRouteStore(state => state.loadRouteFromHistory)
  const deleteRouteFromHistory = useRouteStore(state => state.deleteRouteFromHistory)

  const handleClose = () => setOpen(false)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Past Routes</DialogTitle>
        </DialogHeader>

        <div className="py-2 flex-1 overflow-y-auto">
          {pastRoutes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No past routes saved yet.</p>
              <p className="text-sm mt-2">Routes will appear here after you process images with addresses.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pastRoutes.map((route) => (
                <div
                  key={route.id}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:border-foreground/20 transition-colors group"
                >
                  <button
                    onClick={() => loadRouteFromHistory(route.id)}
                    className="flex-1 flex items-start gap-3 text-left"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">
                        {route.addresses.length} stop{route.addresses.length !== 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {route.addresses[0]?.standardized || route.addresses[0]?.original || 'Unknown'}
                        {route.addresses.length > 1 && ` → ${route.addresses[route.addresses.length - 1]?.standardized || route.addresses[route.addresses.length - 1]?.original}`}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDate(route.date)}
                      </div>
                    </div>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                    onClick={() => deleteRouteFromHistory(route.id)}
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}