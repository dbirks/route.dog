import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Address {
  original: string
  standardized: string
  latitude: number
  longitude: number
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

  // Past routes
  pastRoutes: Route[]

  // UI state
  isAddressListOpen: boolean
  isPastRoutesOpen: boolean
  editingAddressIndex: number | null
  selectedStopIndex: number | null

  // Actions
  setAddresses: (addresses: Address[]) => void
  updateAddress: (index: number, address: Address) => void
  addAddress: (address: Address) => void
  removeAddress: (index: number) => void

  // UI actions
  setAddressListOpen: (open: boolean) => void
  setPastRoutesOpen: (open: boolean) => void
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
      isAddressListOpen: false,
      isPastRoutesOpen: false,
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

      // UI actions
      setAddressListOpen: (open) => set({ isAddressListOpen: open }),
      setPastRoutesOpen: (open) => set({ isPastRoutesOpen: open }),
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
      }),
    }
  )
)