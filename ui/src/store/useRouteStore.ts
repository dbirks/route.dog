import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Address {
  original: string
  standardized: string
  latitude: number
  longitude: number
  sourceImageId?: string // Links address to the image it was extracted from
}

export interface UploadedImage {
  id: string
  thumbnail: string // Base64 data URL
  addressCount: number
  createdAt: string
}

export interface Route {
  id: string
  name?: string
  date: string // ISO string for JSON serialization
  addresses: Address[]
  thumbnailPNG?: string
}

interface RouteStore {
  // Current route data
  addresses: Address[]
  currentRouteId?: string
  uploadedImages: UploadedImage[]

  // Past routes
  pastRoutes: Route[]

  // UI state
  isAddressListOpen: boolean
  isPastRoutesOpen: boolean
  isImagesViewOpen: boolean
  editingAddressIndex: number | null
  selectedStopIndex: number | null

  // Actions
  setAddresses: (addresses: Address[]) => void
  addAddressesFromImage: (addresses: Address[], imageId: string, thumbnail: string) => void
  updateAddress: (index: number, address: Address) => void
  addAddress: (address: Address) => void
  removeAddress: (index: number) => void
  removeImage: (imageId: string) => void

  // UI actions
  setAddressListOpen: (open: boolean) => void
  setPastRoutesOpen: (open: boolean) => void
  setImagesViewOpen: (open: boolean) => void
  setEditingAddressIndex: (index: number | null) => void
  setSelectedStopIndex: (index: number | null) => void

  // Route management
  setCurrentRoute: (route: Route) => void
  clearCurrentRoute: () => void
  saveCurrentRouteToHistory: () => void
  loadRouteFromHistory: (routeId: string) => void
  deleteRouteFromHistory: (routeId: string) => void
}

export const useRouteStore = create<RouteStore>()(
  persist(
    (set, get) => ({
      // Initial state
      addresses: [],
      currentRouteId: undefined,
      pastRoutes: [],
      uploadedImages: [],
      isAddressListOpen: false,
      isPastRoutesOpen: false,
      isImagesViewOpen: false,
      editingAddressIndex: null,
      selectedStopIndex: null,

      // Actions
      setAddresses: (addresses) => {
        const id = crypto.randomUUID()
        set({ addresses, currentRouteId: id })
        // Auto-save to history when addresses are set
        if (addresses.length > 0) {
          const state = get()
          const newRoute: Route = {
            id,
            date: new Date().toISOString(),
            addresses,
          }
          // Don't duplicate if same addresses already exist
          const isDuplicate = state.pastRoutes.some(r =>
            r.addresses.length === addresses.length &&
            r.addresses.every((a, i) =>
              a.original === addresses[i].original &&
              a.latitude === addresses[i].latitude &&
              a.longitude === addresses[i].longitude
            )
          )
          if (!isDuplicate) {
            set({ pastRoutes: [newRoute, ...state.pastRoutes].slice(0, 20) }) // Keep last 20
          }
        }
      },

      updateAddress: (index, address) => set((state) => ({
        addresses: state.addresses.map((addr, i) => i === index ? address : addr)
      })),

      addAddress: (address) => set((state) => ({
        addresses: [...state.addresses, address]
      })),

      removeAddress: (index) => set((state) => ({
        addresses: state.addresses.filter((_, i) => i !== index)
      })),

      addAddressesFromImage: (addresses, imageId, thumbnail) => {
        const state = get()
        // Add addresses with source image ID
        const addressesWithSource = addresses.map(addr => ({
          ...addr,
          sourceImageId: imageId,
        }))

        // Create the uploaded image record
        const newImage: UploadedImage = {
          id: imageId,
          thumbnail,
          addressCount: addresses.length,
          createdAt: new Date().toISOString(),
        }

        // Merge with existing addresses
        const allAddresses = [...state.addresses, ...addressesWithSource]
        const allImages = [...state.uploadedImages, newImage]

        set({
          addresses: allAddresses,
          uploadedImages: allImages,
          currentRouteId: state.currentRouteId || crypto.randomUUID(),
        })

        // Auto-save to history
        if (allAddresses.length > 0) {
          const newRoute: Route = {
            id: state.currentRouteId || crypto.randomUUID(),
            date: new Date().toISOString(),
            addresses: allAddresses,
          }
          const isDuplicate = state.pastRoutes.some(r =>
            r.addresses.length === allAddresses.length &&
            r.addresses.every((a, i) =>
              a.original === allAddresses[i].original &&
              a.latitude === allAddresses[i].latitude &&
              a.longitude === allAddresses[i].longitude
            )
          )
          if (!isDuplicate) {
            set({ pastRoutes: [newRoute, ...state.pastRoutes].slice(0, 20) })
          }
        }
      },

      removeImage: (imageId) => set((state) => ({
        addresses: state.addresses.filter(addr => addr.sourceImageId !== imageId),
        uploadedImages: state.uploadedImages.filter(img => img.id !== imageId),
      })),

      // UI actions
      setAddressListOpen: (open) => set({ isAddressListOpen: open }),
      setPastRoutesOpen: (open) => set({ isPastRoutesOpen: open }),
      setImagesViewOpen: (open) => set({ isImagesViewOpen: open }),
      setEditingAddressIndex: (index) => set({ editingAddressIndex: index }),
      setSelectedStopIndex: (index) => set({ selectedStopIndex: index }),

      // Route management
      setCurrentRoute: (route) => set({
        addresses: route.addresses,
        currentRouteId: route.id,
      }),

      clearCurrentRoute: () => set({
        addresses: [],
        currentRouteId: undefined,
        uploadedImages: [],
      }),

      saveCurrentRouteToHistory: () => {
        const state = get()
        if (state.addresses.length === 0) return

        const newRoute: Route = {
          id: state.currentRouteId || crypto.randomUUID(),
          date: new Date().toISOString(),
          addresses: state.addresses,
        }
        set({ pastRoutes: [newRoute, ...state.pastRoutes].slice(0, 20) })
      },

      loadRouteFromHistory: (routeId) => {
        const state = get()
        const route = state.pastRoutes.find(r => r.id === routeId)
        if (route) {
          set({
            addresses: route.addresses,
            currentRouteId: route.id,
            isPastRoutesOpen: false,
          })
        }
      },

      deleteRouteFromHistory: (routeId) => set((state) => ({
        pastRoutes: state.pastRoutes.filter(r => r.id !== routeId)
      })),
    }),
    {
      name: 'route-dog-storage',
      // Only persist data, not UI state
      partialize: (state) => ({
        addresses: state.addresses,
        currentRouteId: state.currentRouteId,
        pastRoutes: state.pastRoutes,
        uploadedImages: state.uploadedImages,
      }),
    }
  )
)