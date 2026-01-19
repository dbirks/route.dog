import { useState } from "react"
import { Button } from "@/components/ui/button"
import { History, Sparkles, Zap } from "lucide-react"
import { MapView } from "@/components/MapView"
import { ModeToggle } from "@/components/ModeToggle"
import { AddressListPanel } from "@/components/AddressListPanel"
import { PastRoutesDialog } from "@/components/PastRoutesDialog"
import { EditAddressDialog } from "@/components/EditAddressDialog"
import { ImageUpload } from "@/components/ImageUpload"
import { useRouteStore, type Address } from "@/store/useRouteStore"
import { API_ENDPOINTS, apiRequest } from "@/lib/api"

function App() {
  const [isLoadingApi, setIsLoadingApi] = useState(false)
  const setPastRoutesOpen = useRouteStore(state => state.setPastRoutesOpen)
  const setAddressListOpen = useRouteStore(state => state.setAddressListOpen)
  const setAddresses = useRouteStore(state => state.setAddresses)
  const addresses = useRouteStore(state => state.addresses)

  const openPastRoutes = () => setPastRoutesOpen(true)
  const openAddressList = () => setAddressListOpen(true)

  const hasAddresses = addresses.length > 0

  // Demo button - loads sample addresses
  const loadDemo = () => {
    const demoAddresses = [
      {
        original: "1600 Amphitheatre Parkway, Mountain View, CA 94043",
        standardized: "1600 AMPHITHEATRE PKWY, MOUNTAIN VIEW CA 94043",
        latitude: 37.4224764,
        longitude: -122.0842499
      },
      {
        original: "1 Apple Park Way, Cupertino, CA 95014",
        standardized: "1 APPLE PARK WAY, CUPERTINO CA 95014",
        latitude: 37.3348859,
        longitude: -122.0090541
      },
      {
        original: "1355 Market St, San Francisco, CA 94103",
        standardized: "1355 MARKET ST, SAN FRANCISCO CA 94103",
        latitude: 37.7767653,
        longitude: -122.4170807
      },
      {
        original: "1 Hacker Way, Menlo Park, CA 94025",
        standardized: "1 HACKER WAY, MENLO PARK CA 94025",
        latitude: 37.484722,
        longitude: -122.148333
      }
    ];
    setAddresses(demoAddresses);
    setAddressListOpen(true);
  };

  // Test Full API - loads demo image through complete API flow
  const loadDemoWithAPI = async () => {
    setIsLoadingApi(true);

    try {
      // Fetch the demo image from public directory
      const response = await fetch('/demo-route.png');
      const blob = await response.blob();

      // Convert blob to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = () => {
          const base64Data = (reader.result as string).split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
      });

      // Call the API
      const data = await apiRequest<{ addresses: Address[] }>(
        API_ENDPOINTS.parseAddresses,
        {
          method: 'POST',
          body: JSON.stringify({
            image: base64
          }),
        }
      );

      // Update the store with addresses
      const addresses: Address[] = data.addresses || [];
      setAddresses(addresses);

      // Open the address list to show results
      if (addresses.length > 0) {
        setAddressListOpen(true);
      }

    } catch (error) {
      console.error('Error processing demo image:', error);
      alert(`Error processing demo image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoadingApi(false);
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Simple header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-3 bg-card/95 backdrop-blur-sm border-b">
        <div className="flex items-center gap-3">
          <h1 className="logo-sketch text-2xl tracking-wide">
            route.dog
          </h1>
          {hasAddresses && (
            <Button
              variant="outline"
              size="sm"
              onClick={openAddressList}
            >
              {addresses.length} stops
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadDemo}
            className="gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            Demo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadDemoWithAPI}
            disabled={isLoadingApi}
            className="gap-1.5"
          >
            <Zap className="w-4 h-4" />
            {isLoadingApi ? 'Testing...' : 'Test API'}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={openPastRoutes}
            aria-label="View past routes"
          >
            <History className="w-4 h-4" />
          </Button>
          <ModeToggle />
        </div>
      </div>

      {/* Main Map View */}
      <MapView />

      {/* Upload overlay when no addresses */}
      {!hasAddresses && (
        <div className="absolute inset-0 z-5 flex items-center justify-center bg-background/90 backdrop-blur-sm">
          <div className="text-center space-y-4 p-8">
            <h2 className="text-2xl font-semibold">
              Upload a route photo
            </h2>
            <p className="text-muted-foreground max-w-md">
              Take a photo of your delivery list and we'll extract the addresses
              and plot them on the map.
            </p>
            <ImageUpload />
            <div className="pt-4 flex gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={loadDemo}
                className="gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                Try with demo data
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadDemoWithAPI}
                disabled={isLoadingApi}
                className="gap-1.5"
              >
                <Zap className="w-4 h-4" />
                {isLoadingApi ? 'Testing API...' : 'Test Full API'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Address List Panel */}
      <AddressListPanel />

      {/* Past Routes Dialog */}
      <PastRoutesDialog />

      {/* Edit Address Dialog */}
      <EditAddressDialog />
    </div>
  )
}

export default App
