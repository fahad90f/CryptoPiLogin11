import { Card, CardContent } from "@/components/ui/card";
import { Send, ShieldAlert, History, Wallet, ChevronsRight } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Helmet } from "react-helmet";
import { WalletConnect, WalletDetails, TransferTokens } from "@/components/wallet";
import { useWeb3 } from "@/hooks/use-web3";

// Dummy wallet balances - in a real app, this would come from the API
const walletBalances = [
  { id: "btc", name: "Bitcoin", symbol: "BTC", balance: 0.056 },
  { id: "eth", name: "Ethereum", symbol: "ETH", balance: 1.45 },
  { id: "usdt", name: "Tether", symbol: "USDT", balance: 5000 },
  { id: "bnb", name: "Binance Coin", symbol: "BNB", balance: 12.3 },
  { id: "sol", name: "Solana", symbol: "SOL", balance: 85.7 }
];

export default function Transfer() {
  const [location, navigate] = useLocation();
  
  // Form state
  const [selectedToken, setSelectedToken] = useState("USDT");
  const [amount, setAmount] = useState("100");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [memo, setMemo] = useState("");
  
  // Fetch cryptocurrency data
  const { data: cryptocurrencies, isLoading } = useQuery({ 
    queryKey: ['/api/cryptocurrencies'],
    retry: 1
  });
  
  // Recent transfers
  const recentTransfers = [
    { id: 1, amount: "250 USDT", recipient: "0x71C...1B2E", time: "2 hours ago", status: "Completed" },
    { id: 2, amount: "0.5 ETH", recipient: "0x82D...4F3A", time: "Yesterday", status: "Completed" },
    { id: 3, amount: "10 SOL", recipient: "5Hw7...j9oe", time: "3 days ago", status: "Completed" }
  ];
  
  // Calculate token value in USD
  const getTokenUsdValue = (symbol: string, amount: number) => {
    const crypto = cryptocurrencies?.find((c: any) => c.symbol === symbol);
    return crypto ? (crypto.price * amount).toFixed(2) : "0.00";
  };
  
  // Handle transfer
  const handleTransfer = () => {
    if (!selectedToken || !amount || !recipientAddress) {
      // Show validation error
      return;
    }
    
    console.log("Transferring token", {
      token: selectedToken,
      amount,
      recipient: recipientAddress,
      memo
    });
  };

  return (
    <>
      <Helmet>
        <title>Transfer Tokens | CryptoPilot</title>
        <meta name="description" content="Transfer cryptocurrency tokens securely to any compatible wallet. Send tokens across multiple blockchain networks with real-time tracking." />
      </Helmet>
      
      <div className="min-h-screen bg-[#070714] text-white">
        {/* Header Navigation */}
        <header className="border-b border-gray-800 flex items-center justify-between p-4">
          <div className="text-[#6366F1] font-bold text-2xl">CryptoPilot</div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="/dashboard" className="text-gray-400 hover:text-white">Dashboard</a>
            <a href="/generate" className="text-gray-400 hover:text-white">Generate</a>
            <a href="/convert" className="text-gray-400 hover:text-white">Convert</a>
            <a href="/transfer" className="text-white font-medium">Transfer</a>
            <a href="/settings" className="text-gray-400 hover:text-white">Settings</a>
          </nav>
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center">
              <span className="font-medium text-sm">J</span>
            </div>
          </div>
        </header>
        
        <main className="p-6">
          <h1 className="text-2xl font-bold mb-6">Transfer Token</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Transfer Form */}
            <div className="lg:col-span-2">
              <TransferTokens />
              
              {/* Security Alert */}
              <Alert className="bg-[#181830] border-[#FF4351] mb-6">
                <ShieldAlert className="h-4 w-4 text-[#FF4351]" />
                <AlertTitle>Important Security Notice</AlertTitle>
                <AlertDescription className="text-gray-400">
                  Always double-check recipient addresses. Blockchain transactions cannot be reversed once confirmed.
                </AlertDescription>
              </Alert>
            </div>
            
            {/* Side Information */}
            <div className="space-y-6">
              {/* Wallet Details Component */}
              <WalletDetails />
              
              {/* Recent Transfers */}
              <Card className="bg-[#181830] border-[#2D2A66] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg">Recent Transfers</h3>
                  <Button variant="ghost" size="sm" className="h-8 text-[#6366F1] hover:bg-[#2D2A66]">View All</Button>
                </div>
                
                <div className="space-y-2">
                  {recentTransfers.map((transfer) => (
                    <div key={transfer.id} className="flex items-center justify-between p-3 bg-[#0F0F1A] rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-[#FF4351]/20 flex items-center justify-center mr-3">
                          <Send className="h-4 w-4 text-[#FF4351]" />
                        </div>
                        <div>
                          <div className="font-medium">{transfer.amount}</div>
                          <div className="text-xs text-gray-400">{transfer.time}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-sm">{transfer.recipient}</div>
                        <div className="text-xs text-green-500">{transfer.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              
              {/* Network Fees */}
              <Card className="bg-[#181830] border-[#2D2A66] p-6">
                <h3 className="text-lg mb-4">Network Fees</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-[#2D2A66] flex items-center justify-center mr-2">
                        <span className="text-xs">ETH</span>
                      </div>
                      <span>Ethereum</span>
                    </div>
                    <div className="text-right text-sm">
                      <div>~0.003 ETH</div>
                      <div className="text-xs text-gray-400">($5.60)</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-2">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-[#2D2A66] flex items-center justify-center mr-2">
                        <span className="text-xs">BSC</span>
                      </div>
                      <span>Binance Smart Chain</span>
                    </div>
                    <div className="text-right text-sm">
                      <div>~0.0005 BNB</div>
                      <div className="text-xs text-gray-400">($0.18)</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-2">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-[#2D2A66] flex items-center justify-center mr-2">
                        <span className="text-xs">SOL</span>
                      </div>
                      <span>Solana</span>
                    </div>
                    <div className="text-right text-sm">
                      <div>~0.00001 SOL</div>
                      <div className="text-xs text-gray-400">($0.001)</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
          
          {/* Footer */}
          <div className="text-center text-sm text-gray-500 mt-8">
            © 2025 CryptoPilot. All rights reserved.
          </div>
        </main>
      </div>
    </>
  );
}
