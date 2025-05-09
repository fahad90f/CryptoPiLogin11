import { useState } from "react";
import { useWeb3 } from "@/hooks/use-web3";
import { WalletType } from "@/hooks/use-eth-wallet";
import { truncateAddress } from "@/lib/utils";
import { Wallet, Coins, LogOut, ChevronDown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function WalletConnect() {
  const { account, connected, connectWallet, disconnectWallet, walletType, balance, chainId, connecting } = useWeb3();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleConnect = async (type: WalletType) => {
    await connectWallet(type);
    setIsDialogOpen(false);
  };

  const getWalletIcon = (type: WalletType) => {
    return <Wallet className="h-6 w-6" />;
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

  // If connected, show wallet info and disconnect button
  if (connected && account) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-green-500"></div>
            <span className="hidden md:inline">{truncateAddress(account)}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Wallet</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium mb-1">Connected to {walletType}</p>
            <p className="text-xs text-muted-foreground">{getNetworkName(chainId)}</p>
          </div>
          <DropdownMenuSeparator />
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium mb-1">Balance</p>
            <p className="text-xs font-bold">{balance} ETH</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => window.open(`https://etherscan.io/address/${account}`, '_blank')}
            className="cursor-pointer flex items-center"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View on Explorer
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={disconnectWallet}
            className="cursor-pointer text-destructive flex items-center"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // If not connected, show connect button
  return (
    <>
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={() => setIsDialogOpen(true)}
        disabled={connecting}
      >
        <Wallet className="h-4 w-4" />
        <span>{connecting ? "Connecting..." : "Connect Wallet"}</span>
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect your wallet</DialogTitle>
            <DialogDescription>
              Connect your cryptocurrency wallet to interact with the blockchain.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4">
            <Card 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleConnect(WalletType.MetaMask)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">MetaMask</CardTitle>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 212 189" fill="none">
                  <path d="M201.254 0L118.903 58.242L133.607 26.488L201.254 0Z" fill="#E17726" stroke="#E17726" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10.9038 0L92.6123 58.783L78.6455 26.488L10.9038 0Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M172.009 135.611L150.496 166.607L196.717 178.26L209.995 136.151L172.009 135.611Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2.16406 136.151L15.3889 178.26L61.5578 166.607L40.0972 135.611L2.16406 136.151Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M59.2175 83.4211L46.968 101.476L92.6122 103.356L91.1297 54.3789L59.2175 83.4211Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M152.939 83.4225L120.485 53.8389L119.056 103.358L164.648 101.478L152.939 83.4225Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M61.5574 166.607L89.7508 154.088L65.7263 136.421L61.5574 166.607Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M122.406 154.088L150.495 166.607L146.38 136.421L122.406 154.088Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">The most popular Web3 wallet</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleConnect(WalletType.TrustWallet)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Trust Wallet</CardTitle>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 1024 1024" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M512 1024C512 1024 176 816.144 176 530.144V192.288L512 64L848 192.288V530.144C848 816.144 512 1024 512 1024Z" fill="#3375BB"/>
                  <path d="M568.822 475.071C574.978 464.086 580.478 453.766 586.311 443.623C592.144 433.479 598.644 423.159 604.8 412.174C605.755 410.41 606.589 408.579 606.4 406.438C606.211 404.298 604.533 402.345 603.511 400.47C603.511 400.47 602.633 399.224 601.755 397.722C599.566 394.138 597.377 392.074 593.066 391.341C589.644 390.632 585.711 391.074 582.478 392.686C571.289 398.147 560.444 404.419 549.911 411.182C549.978 411.026 550.044 410.87 550.111 410.715C556.866 400.693 563.6 390.737 570.6 380.715C576.889 371.561 583.489 362.452 590.089 353.409C590.666 352.609 591.666 351.809 591.2 350.676C590.733 349.542 589.155 348.742 588.133 347.998C588.133 347.998 586.089 346.776 584.755 346.087C580.444 343.865 577.511 343.42 572.644 345.865C563.466 350.676 554.244 355.609 545.088 360.498C545.688 359.409 546.288 358.321 546.888 357.232C554.244 342.932 561.6 328.609 568.955 314.309C569.866 312.398 571.555 310.31 570.755 308.154C569.955 305.998 567.066 304.643 565.466 303.599C565.466 303.599 562.466 301.909 560.8 301.243C556.422 299.599 553.222 299.687 548.711 302.909C539.533 309.109 530.688 315.732 521.577 322.043C482.844 348.665 449.533 380.76 424.577 419.398C417.911 429.265 411.977 439.487 406.355 449.932C405.577 451.31 404.755 453.221 405.177 454.754C405.6 456.288 407.177 457.61 408.488 458.588C408.488 458.588 409.977 459.832 411.022 460.565C415.422 463.209 418.422 463.987 423.466 461.142C429.111 457.965 434.711 454.687 440.266 451.31C441.422 450.554 442.533 449.754 443.688 448.954C443.066 450.299 442.444 451.598 441.822 452.943C438.355 459.943 434.888 466.943 431.511 473.92C431.511 473.92 424.577 488.897 424.577 491.798C424.577 494.698 425.777 497.298 428.533 498.454C431.288 499.609 434.888 499.121 435.533 499.01C436.177 498.898 438.888 498.565 441.133 497.832C450.422 494.92 460.666 489.21 469.533 483.876C486.711 473.498 503.022 461.343 518.444 448.365C535.689 434.065 551.822 418.143 565.778 400.182C566.877 398.766 567.866 397.094 568.822 395.343V475.071Z" fill="white"/>
                </svg>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Mobile-friendly cryptocurrency wallet</p>
              </CardContent>
            </Card>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}