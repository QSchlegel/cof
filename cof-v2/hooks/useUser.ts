import { useWallet } from '@meshsdk/react'

export default function useUser() {
  const { connected, wallet } = useWallet()

  return {
    user: connected ? { wallet } : null,
  }
} 