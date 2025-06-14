import { CardanoWallet } from "@meshsdk/react";

export default function ConnectWallet() {
  return (
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
  );
}
