import { Button } from "@/components/ui/button";
import type { User } from "@/shared/types";

interface WalletConnectionProps {
  currentUser: User | null;
  onUserChange: (user: User | null) => void;
}

export function WalletConnection({ currentUser, onUserChange }: WalletConnectionProps) {
  const handleConnect = async () => {
    // TODO: Implement actual wallet connection
    onUserChange({
      id: "1",
      address: "addr1...",
      name: "Test User"
    });
  };

  const handleDisconnect = () => {
    onUserChange(null);
  };

  return (
    <div>
      {currentUser ? (
        <Button variant="outline" onClick={handleDisconnect}>
          Disconnect Wallet
        </Button>
      ) : (
        <Button onClick={handleConnect}>
          Connect Wallet
        </Button>
      )}
    </div>
  );
} 