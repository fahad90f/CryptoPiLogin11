import { MainLayout } from "@/components/layouts/MainLayout";
import { TransferTokenForm } from "@/components/transfer/TransferTokenForm";
import { Card, CardContent } from "@/components/ui/card";
import { Send, ShieldAlert, History, Wallet } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Helmet } from "react-helmet";

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
  
  // Combine cryptocurrency data with balance information
  const cryptosWithBalance = walletBalances.map(balance => {
    const crypto = cryptocurrencies?.find((c: any) => c.symbol === balance.symbol);
    return {
      ...balance,
      price: crypto?.price || 0
    };
  });

  return (
    <>
      <Helmet>
        <title>Transfer Tokens | CryptoPilot</title>
        <meta name="description" content="Transfer cryptocurrency tokens securely to any compatible wallet. Send tokens across multiple blockchain networks with real-time tracking." />
      </Helmet>
      <MainLayout title="Transfer" subtitle="Send tokens to other wallets securely and efficiently">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {isLoading ? (
              <Card className="border border-muted/30">
                <CardContent className="p-5 space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <div className="grid grid-cols-2 gap-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <TransferTokenForm cryptoList={cryptosWithBalance} />
            )}
          </div>
          
          <div className="space-y-6">
            <Card className="border border-muted/30">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-space font-semibold">My Wallet</h3>
                  <Button variant="outline" size="sm" className="h-8">View All</Button>
                </div>
                
                <div className="space-y-3">
                  {walletBalances.map((crypto) => (
                    <div key={crypto.id} className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                          <span className="text-xs font-medium">{crypto.symbol}</span>
                        </div>
                        <div>
                          <div className="font-medium">{crypto.name}</div>
                          <div className="text-xs text-muted-foreground">{crypto.symbol}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono">{crypto.balance} {crypto.symbol}</div>
                        <div className="text-xs text-muted-foreground">
                          ${(crypto.balance * (cryptocurrencies?.find((c: any) => c.symbol === crypto.symbol)?.price || 0)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Transfer Security</AlertTitle>
              <AlertDescription>
                Always double-check recipient addresses. Blockchain transactions cannot be reversed once confirmed.
              </AlertDescription>
            </Alert>
            
            <Card className="border border-muted/30">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-space font-semibold">Recent Transfers</h3>
                  <Button variant="ghost" size="sm" className="h-8 text-primary">View All</Button>
                </div>
                
                <div className="space-y-2">
                  {recentTransfers.map((transfer) => (
                    <div key={transfer.id} className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center mr-3">
                          <Send className="h-4 w-4 text-destructive" />
                        </div>
                        <div>
                          <div className="font-medium">{transfer.amount}</div>
                          <div className="text-xs text-muted-foreground">{transfer.time}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-sm">{transfer.recipient}</div>
                        <div className="text-xs text-green-500">{transfer.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-muted/30">
              <CardContent className="p-5">
                <h3 className="text-lg font-space font-semibold mb-4">Network Fees</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                        <span className="text-xs">ETH</span>
                      </div>
                      <span>Ethereum</span>
                    </div>
                    <div className="text-right text-sm">
                      <div>~0.003 ETH</div>
                      <div className="text-xs text-muted-foreground">($5.60)</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-2">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                        <span className="text-xs">BSC</span>
                      </div>
                      <span>Binance Smart Chain</span>
                    </div>
                    <div className="text-right text-sm">
                      <div>~0.0005 BNB</div>
                      <div className="text-xs text-muted-foreground">($0.18)</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-2">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                        <span className="text-xs">TRX</span>
                      </div>
                      <span>Tron</span>
                    </div>
                    <div className="text-right text-sm">
                      <div>~5 TRX</div>
                      <div className="text-xs text-muted-foreground">($0.05)</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-2">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                        <span className="text-xs">SOL</span>
                      </div>
                      <span>Solana</span>
                    </div>
                    <div className="text-right text-sm">
                      <div>~0.00001 SOL</div>
                      <div className="text-xs text-muted-foreground">($0.001)</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    </>
  );
}
