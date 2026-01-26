import { useState } from "react"
import { MapView } from "@/components/MapView"
import { Header } from "@/components/Header"
import { StopsBottomSheet } from "@/components/StopsBottomSheet"
import { StopDetailSheet } from "@/components/StopDetailSheet"
import { PastRoutesDialog } from "@/components/PastRoutesDialog"
import { EditAddressDialog } from "@/components/EditAddressDialog"
import { UploadedImagesView } from "@/components/UploadedImagesView"
import { ImageUpload } from "@/components/ImageUpload"
import { DynamicIsland } from "@/components/DynamicIsland"
import { useRouteStore, type Address } from "@/store/useRouteStore"
import { API_ENDPOINTS, apiRequest } from "@/lib/api"

function App() {
  const [isLoadingApi, setIsLoadingApi] = useState(false)
  const setAddresses = useRouteStore(state => state.setAddresses)
  const addresses = useRouteStore(state => state.addresses)
  const hasAddresses = addresses.length > 0

  // Try Demo - loads demo image through complete API flow
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
      const addressList: Address[] = data.addresses || [];
      setAddresses(addressList);

    } catch (error) {
      console.error('Error processing demo image:', error);
      alert(`Error processing demo image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoadingApi(false);
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Header bar */}
      <Header />

      {/* Full-screen Map View */}
      <MapView />

      {/* Hidden file upload input - triggered from DynamicIsland */}
      <div className="hidden">
        <ImageUpload />
      </div>

      {/* Dynamic Island - shows when no addresses */}
      {!hasAddresses && (
        <DynamicIsland
          onTryDemo={loadDemoWithAPI}
          isLoadingDemo={isLoadingApi}
        />
      )}

      {/* Stops Bottom Sheet - shows when there are addresses */}
      <StopsBottomSheet />

      {/* Stop Detail Sheet - shows when a stop is selected */}
      <StopDetailSheet />

      {/* Past Routes Dialog */}
      <PastRoutesDialog />

      {/* Uploaded Images View */}
      <UploadedImagesView />

      {/* Edit Address Dialog */}
      <EditAddressDialog />
    </div>
  )
}

export default App
