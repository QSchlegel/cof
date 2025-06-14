import { useWallet } from '@meshsdk/react'
import { useCallback, useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { getWalletBalance, getStakeAddress } from '@/lib/wallet'

export function useWalletOperations() {
  const { connected, connect, disconnect, wallet } = useWallet()
  const [isLoading, setIsLoading] = useState(false)
  const [balance, setBalance] = useState(0)
  const [stakeAddress, setStakeAddress] = useState<string | null>(null)
  const { toast } = useToast()

  // Update balance when wallet is connected
  useEffect(() => {
    if (connected && wallet) {
      const updateBalance = async () => {
        try {
          const newBalance = await getWalletBalance(wallet)
          setBalance(newBalance)
        } catch (error) {
          console.error('Failed to update balance:', error)
        }
      }
      updateBalance()
      // Set up periodic balance updates
      const interval = setInterval(updateBalance, 30000) // Update every 30 seconds
      return () => clearInterval(interval)
    }
  }, [connected, wallet])

  // Get stake address when wallet is connected
  useEffect(() => {
    if (connected && wallet) {
      const getAddress = async () => {
        try {
          const address = await getStakeAddress(wallet)
          setStakeAddress(address)
        } catch (error) {
          console.error('Failed to get stake address:', error)
        }
      }
      getAddress()
    } else {
      setStakeAddress(null)
    }
  }, [connected, wallet])

  const handleConnect = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Check if any wallet is available
      if (!wallet) {
        throw new Error('No wallet detected. Please install a Cardano wallet extension.')
      }

      await connect()
      
      // Get initial balance and stake address
      const initialBalance = await getWalletBalance(wallet)
      const address = await getStakeAddress(wallet)
      
      setBalance(initialBalance)
      setStakeAddress(address)

      toast({
        title: 'Wallet Connected',
        description: `Connected to ${wallet.name} wallet`,
        type: 'success',
      })
    } catch (error) {
      console.error('Connection failed:', error)
      toast({
        title: 'Connection Failed',
        description: error instanceof Error ? error.message : 'Failed to connect wallet. Please try again.',
        type: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }, [connect, wallet, toast])

  const handleDisconnect = useCallback(async () => {
    try {
      setIsLoading(true)
      await disconnect()
      setBalance(0)
      setStakeAddress(null)
      toast({
        title: 'Wallet Disconnected',
        description: 'Your wallet has been disconnected.',
        type: 'success',
      })
    } catch (error) {
      console.error('Disconnection failed:', error)
      toast({
        title: 'Disconnection Failed',
        description: 'Failed to disconnect wallet. Please try again.',
        type: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }, [disconnect, toast])

  const handleSendAda = useCallback(async (recipientAddress: string, amount: number) => {
    if (!wallet) {
      throw new Error('No wallet connected')
    }

    try {
      setIsLoading(true)
      
      // Validate amount
      if (amount <= 0) {
        throw new Error('Amount must be greater than 0')
      }

      // Check if user has enough balance
      if (amount > balance) {
        throw new Error('Insufficient balance')
      }

      // Send transaction
      const txHash = await wallet.sendLovelace({
        address: recipientAddress,
        amount: amount * 1000000, // Convert to Lovelace
      })

      // Update balance
      const newBalance = await getWalletBalance(wallet)
      setBalance(newBalance)

      toast({
        title: 'Transaction Successful',
        description: `Sent ${amount} ₳ to ${recipientAddress.slice(0, 8)}...`,
        type: 'success',
      })

      return txHash
    } catch (error) {
      console.error('Transaction failed:', error)
      toast({
        title: 'Transaction Failed',
        description: error instanceof Error ? error.message : 'Failed to send transaction',
        type: 'error',
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [wallet, balance, toast])

  return {
    connected,
    balance,
    stakeAddress,
    isLoading,
    connect: handleConnect,
    disconnect: handleDisconnect,
    sendAda: handleSendAda,
  }
} 