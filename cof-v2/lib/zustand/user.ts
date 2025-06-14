import { useState, useCallback, useEffect } from "react";
import { useWallet } from "@meshsdk/react";

const LOCAL_STORAGE_KEY = "fundingListsByWallet";

export interface Project {
  id: string;
  name: string;
  description?: string;
  repository: string;
  platform: string;
  stars: string;
  dependencies: string[];
  monthlyFunding: string;
  status: string;
  cardanoAddress?: string;
}

export interface FundingListProject {
  id: string;
  project: Project;
  distributionPercentage: number;
}

export interface FundingList {
  id: string;
  name: string;
  description?: string;
  monthlyBudget: string;
  userId: string;
  projects: FundingListProject[];
  createdAt: Date;
  updatedAt: Date;
}

function getStoredLists(): Record<string, FundingList[]> {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function persistListsToStorage(walletAddress: string, lists: FundingList[]) {
  const current = getStoredLists();
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ ...current, [walletAddress]: lists }));
}

function isWalletReady(connected: boolean, wallet: any, walletAddress: string | null): boolean {
  return connected && wallet && walletAddress !== null;
}

export function useFundingLists() {
  const [lists, setLists] = useState<FundingList[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { connected, wallet } = useWallet();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    if (connected && wallet) {
      wallet.getUsedAddresses().then(addresses => {
        if (addresses && addresses.length > 0) {
          const address = addresses[0];
          setWalletAddress(address);
          const stored = getStoredLists();
          if (stored[address]) {
            setLists(stored[address]);
          }
        }
      });
    } else {
      setWalletAddress(null);
    }
  }, [connected, wallet]);

  const fetchLists = useCallback(async () => {
    if (!isWalletReady(connected, wallet, walletAddress)) {
      setError("Wallet not connected");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/funding-lists?userId=${walletAddress}`);
      if (!response.ok) throw new Error("Failed to fetch funding lists");

      const data = await response.json();
      setLists(data);
      persistListsToStorage(walletAddress, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [connected, wallet, walletAddress]);

  const createList = useCallback(async (list: Omit<FundingList, "id" | "createdAt" | "updatedAt">) => {
    if (!isWalletReady(connected, wallet, walletAddress)) {
      setError("Wallet not connected");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/funding-lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...list, userId: walletAddress }),
      });

      if (!response.ok) throw new Error("Failed to create funding list");

      const newList = await response.json();
      setLists(prev => {
        const updated = [...prev, newList];
        persistListsToStorage(walletAddress, updated);
        return updated;
      });
      return newList;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [connected, wallet, walletAddress]);

  const updateList = useCallback(async (list: FundingList) => {
    if (!isWalletReady(connected, wallet, walletAddress)) {
      setError("Wallet not connected");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/funding-lists", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...list, userId: walletAddress }),
      });

      if (!response.ok) throw new Error("Failed to update funding list");

      const updatedList = await response.json();
      setLists(prev => {
        const updated = prev.map(l => l.id === updatedList.id ? updatedList : l);
        persistListsToStorage(walletAddress, updated);
        return updated;
      });
      return updatedList;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [connected, wallet, walletAddress]);

  const deleteList = useCallback(async (id: string) => {
    if (!isWalletReady(connected, wallet, walletAddress)) {
      setError("Wallet not connected");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/funding-lists?id=${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete funding list");

      setLists(prev => {
        const updated = prev.filter(list => list.id !== id);
        persistListsToStorage(walletAddress, updated);
        return updated;
      });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [connected, wallet, walletAddress]);

  return { lists, isLoading, error, fetchLists, createList, updateList, deleteList };
}