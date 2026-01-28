import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useRouteStore, type Route } from "@/store/useRouteStore"
import { MapPin, Trash2, Clock, ChevronRight, ChevronLeft, Navigation, FileImage } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

export function RouteOverview() {
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null)

  const isOpen = useRouteStore(state => state.isPastRoutesOpen)
  const setOpen = useRouteStore(state => state.setPastRoutesOpen)
  const pastRoutes = useRouteStore(state => state.pastRoutes)
  const uploadedImages = useRouteStore(state => state.uploadedImages)
  const loadRouteFromHistory = useRouteStore(state => state.loadRouteFromHistory)
  const deleteRouteFromHistory = useRouteStore(state => state.deleteRouteFromHistory)

  const selectedRoute = pastRoutes.find(r => r.id === selectedRouteId)

  const handleClose = () => {
    setOpen(false)
    setSelectedRouteId(null)
  }

  const handleLoadRoute = (routeId: string) => {
    loadRouteFromHistory(routeId)
    handleClose()
  }

  const handleDelete = (routeId: string) => {
    if (confirm("Delete this route from history?")) {
      deleteRouteFromHistory(routeId)
      if (selectedRouteId === routeId) {
        setSelectedRouteId(null)
      }
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  // Get images associated with a route
  const getRouteImages = (route: Route) => {
    const imageIds = new Set(route.addresses.map(a => a.sourceImageId).filter(Boolean))
    return uploadedImages.filter(img => imageIds.has(img.id))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0 gap-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-2">
            {selectedRoute && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 -ml-2"
                onClick={() => setSelectedRouteId(null)}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}
            <DialogTitle>
              {selectedRoute ? "Route Details" : "Past Routes"}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {!selectedRoute ? (
            // ROUTE LIST VIEW
            <ScrollArea className="h-full px-6 py-4">
              {pastRoutes.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No past routes saved yet.</p>
                  <p className="text-sm mt-2">Routes will appear here after you process images.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pastRoutes.map((route) => {
                    const routeImages = getRouteImages(route)
                    return (
                      <div
                        key={route.id}
                        className="group border rounded-lg hover:border-foreground/20 transition-all overflow-hidden"
                      >
                        <button
                          onClick={() => setSelectedRouteId(route.id)}
                          className="w-full p-4 text-left flex items-start gap-4"
                        >
                          {/* Thumbnail preview */}
                          <div className="flex-shrink-0">
                            {routeImages.length > 0 ? (
                              <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted grid grid-cols-2 gap-0.5">
                                {routeImages.slice(0, 4).map((img, idx) => (
                                  <img
                                    key={img.id}
                                    src={img.thumbnail}
                                    alt=""
                                    className="w-full h-full object-cover"
                                    style={{
                                      gridColumn: routeImages.length === 1 ? '1 / -1' : undefined,
                                      gridRow: routeImages.length === 1 ? '1 / -1' : undefined,
                                    }}
                                  />
                                ))}
                              </div>
                            ) : (
                              <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                                <MapPin className="w-6 h-6 text-primary" />
                              </div>
                            )}
                          </div>

                          {/* Route info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-medium">
                                {route.addresses.length} stop{route.addresses.length !== 1 ? 's' : ''}
                                {routeImages.length > 0 && (
                                  <span className="text-muted-foreground text-sm ml-2">
                                    • {routeImages.length} image{routeImages.length !== 1 ? 's' : ''}
                                  </span>
                                )}
                              </p>
                              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 truncate">
                              {route.addresses[0]?.standardized || route.addresses[0]?.original || 'Unknown'}
                              {route.addresses.length > 1 && ` → ${route.addresses[route.addresses.length - 1]?.standardized || route.addresses[route.addresses.length - 1]?.original}`}
                            </p>
                            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {formatDate(route.date)}
                            </div>
                          </div>
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          ) : (
            // ROUTE DETAIL VIEW
            <ScrollArea className="h-full">
              <div className="px-6 py-4 space-y-6">
                {/* Route header */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {formatDate(selectedRoute.date)}
                  </div>
                  <h3 className="text-2xl font-semibold">
                    {selectedRoute.addresses.length} Stop{selectedRoute.addresses.length !== 1 ? 's' : ''}
                  </h3>
                </div>

                {/* Images section */}
                {getRouteImages(selectedRoute).length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <FileImage className="w-4 h-4" />
                      IMAGES ({getRouteImages(selectedRoute).length})
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {getRouteImages(selectedRoute).map((img) => (
                        <div
                          key={img.id}
                          className="aspect-square rounded-lg overflow-hidden bg-muted border"
                        >
                          <img
                            src={img.thumbnail}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stops section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Navigation className="w-4 h-4" />
                    STOPS ({selectedRoute.addresses.length})
                  </div>
                  <div className="space-y-2">
                    {selectedRoute.addresses.map((address, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            {address.standardized || address.original}
                          </p>
                          {address.original !== address.standardized && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Original: {address.original}
                            </p>
                          )}
                          {address.latitude && address.longitude && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {address.latitude.toFixed(4)}, {address.longitude.toFixed(4)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleDelete(selectedRoute.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => handleLoadRoute(selectedRoute.id)}
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Load Route
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
