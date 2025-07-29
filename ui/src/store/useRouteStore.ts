import { create } from 'zustand'

export interface Address {
  original: string
  standardized: string
  latitude: number
  longitude: number
}

export interface Route {
  id: string
  name?: string
  date: Date
  addresses: Address[]
  thumbnailPNG?: string
}

interface RouteStore {
  // Current route data
  addresses: Address[]
  currentRouteId?: string
  
  // UI state
  isAddressListOpen: boolean
  isPastRoutesOpen: boolean
  editingAddressIndex: number | null
  
  // Actions
  setAddresses: (addresses: Address[]) => void
  updateAddress: (index: number, address: Address) => void
  addAddress: (address: Address) => void
  removeAddress: (index: number) => void
  
  // UI actions
  setAddressListOpen: (open: boolean) => void
  setPastRoutesOpen: (open: boolean) => void
  setEditingAddressIndex: (index: number | null) => void
  
  // Route management
  setCurrentRoute: (route: Route) => void
  clearCurrentRoute: () => void
}

export const useRouteStore = create<RouteStore>((set) => ({
  // Initial state
  addresses: [],
  currentRouteId: undefined,
  isAddressListOpen: false,
  isPastRoutesOpen: false,
  editingAddressIndex: null,
  
  // Actions
  setAddresses: (addresses) => set({ addresses }),
  
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
  
  // Route management
  setCurrentRoute: (route) => set({
    addresses: route.addresses,
    currentRouteId: route.id,
  }),
  
  clearCurrentRoute: () => set({
    addresses: [],
    currentRouteId: undefined,
  }),
}))