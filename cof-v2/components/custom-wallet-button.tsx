import { CardanoWallet } from '@meshsdk/react';
import { useWallet } from '@meshsdk/react';

export function CustomWalletButton() {
  const { connecting } = useWallet();

  return (
    <div className="relative">
      <div className="[&_svg]:[stroke-width:2] [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round]">
        <CardanoWallet
          label="Connect Wallet"
          persist={true}
          onConnected={() => {
            console.log('Wallet connected');
          }}
          cardanoPeerConnect={{
            dAppInfo: {
              name: "COF",
              url: "https://cof.com",
            },
            announce: [
              "wss://dev.btt.cf-identity-wallet.metadata.dev.cf-deployments.org",
            ],
          }}
        />
      </div>
      {connecting && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-lg">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
} 