"use client";

import { MeshProvider, useWallet } from "@meshsdk/react";

function WalletButton() {
  const { connected, connect, wallet } = useWallet();

  const handleGetAddress = async () => {
    if (!connected) {
      await connect();
    }

    const usedAddresses = await wallet.getUsedAddresses();
    if (usedAddresses && usedAddresses.length > 0) {
      alert(usedAddresses[0]);
      console.log("Address:", usedAddresses[0]);
    } else {
      alert("No used address found.");
    }
  };

  return (
    <button type="button" onClick={handleGetAddress}>
      Get Address
    </button>
  );
}

export default function Home() {
  return (
    <MeshProvider>
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <WalletButton />
      </div>
    </MeshProvider>
  );
}
