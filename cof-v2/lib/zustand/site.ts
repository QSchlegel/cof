import { create } from 'zustand'

interface SiteState {
  network: number
  setNetwork: (network: number) => void
}

export const useSiteStore = create<SiteState>((set) => ({
  network: 0,
  setNetwork: (network) => set({ network }),
})) 