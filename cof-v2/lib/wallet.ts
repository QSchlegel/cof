import { ForgeScript, Transaction } from '@meshsdk/core'
import { useWallet } from '@meshsdk/react'

export const LOVELACE = 1000000 // 1 ADA = 1,000,000 Lovelace

export async function sendAda(
  wallet: any,
  recipientAddress: string,
  amount: number
): Promise<string> {
  try {
    const tx = new Transaction({ initiator: wallet })
      .sendLovelace(
        recipientAddress,
        (amount * LOVELACE).toString()
      )

    const unsignedTx = await tx.build()
    const signedTx = await wallet.signTx(unsignedTx)
    const txHash = await wallet.submitTx(signedTx)

    return txHash
  } catch (error) {
    console.error('Transaction failed:', error)
    throw error
  }
}

export async function getWalletBalance(wallet: any): Promise<number> {
  try {
    // Get all UTXOs from the wallet
    const utxos = await wallet.getUtxos()
    
    // Calculate total lovelace from UTXOs
    const totalLovelace = utxos.reduce((sum: number, utxo: any) => {
      const lovelace = utxo.output.amount.find((a: any) => a.unit === 'lovelace')
      return sum + (lovelace ? Number(lovelace.quantity) : 0)
    }, 0)

    return totalLovelace / LOVELACE
  } catch (error) {
    console.error('Failed to get wallet balance:', error)
    throw error
  }
}

export async function getStakeAddress(wallet: any): Promise<string> {
  try {
    // Get the reward address from the wallet
    const rewardAddresses = await wallet.getRewardAddresses()
    if (!rewardAddresses || rewardAddresses.length === 0) {
      throw new Error('No reward address found in wallet')
    }
    return rewardAddresses[0]
  } catch (error) {
    console.error('Failed to get stake address:', error)
    throw error
  }
} 