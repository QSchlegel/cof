import { create } from 'zustand'
import { Asset } from '@meshsdk/core'

interface UserState {
  pastWallet: string | undefined
  setPastWallet: (wallet: string | undefined) => void
  userAssets: Asset[]
  setUserAssets: (assets: Asset[]) => void
  userAssetMetadata: Record<string, { name: string; decimals: number }>
  setUserAssetMetadata: (unit: string, name: string, decimals: number) => void
}

export const useUserStore = create<UserState>((set) => ({
  pastWallet: undefined,
  setPastWallet: (wallet) => set({ pastWallet: wallet }),
  userAssets: [],
  setUserAssets: (assets) => set({ userAssets: assets }),
  userAssetMetadata: {},
  setUserAssetMetadata: (unit, name, decimals) =>
    set((state) => ({
      userAssetMetadata: {
        ...state.userAssetMetadata,
        [unit]: { name, decimals },
      },
    })),
})) 