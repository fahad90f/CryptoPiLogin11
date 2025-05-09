import { useWeb3 } from "@/hooks/use-web3";
import { truncateAddress } from "@/lib/utils";
import { ExternalLink, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { WalletConnect } from "./WalletConnect";

export function WalletDetails() {
  const { connected, account, balance, chainId, walletType } = useWeb3();
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getNetworkName = (chainId: number | undefined) => {
    switch (chainId) {
      case 1:
        return "Ethereum Mainnet";
      case 56:
        return "Binance Smart Chain";
      case 137:
        return "Polygon";
      case 42161:
        return "Arbitrum";
      case 10:
        return "Optimism";
      default:
        return "Unknown Network";
    }
  };

  // If not connected, show a prompt to connect
  if (!connected || !account) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Connect Wallet</CardTitle>
          <CardDescription>
            Connect your wallet to view your balance and transaction history
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 py-8">
          <p className="text-center text-muted-foreground">
            You need to connect your wallet to access this feature
          </p>
          <WalletConnect />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Wallet Details</CardTitle>
        <CardDescription>
          View and manage your connected wallet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Wallet Type</h3>
          <p className="font-medium">{walletType}</p>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Network</h3>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <p className="font-medium">{getNetworkName(chainId)}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
          <div className="flex items-center gap-2">
            <p className="font-medium font-mono">{truncateAddress(account, 10, 8)}</p>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => copyToClipboard(account)}
              className="h-8 w-8"
            >
              {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => window.open(`https://etherscan.io/address/${account}`, '_blank')}
              className="h-8 w-8"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Balance</h3>
          <p className="text-2xl font-bold">{balance} ETH</p>
        </div>
        
        <div className="pt-4">
          <WalletConnect />
        </div>
      </CardContent>
    </Card>
  );
}