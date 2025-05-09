import { useWeb3 } from "@/hooks/use-web3";
import { WalletConnect, WalletDetails, TransferTokens } from "@/components/wallet";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet as WalletIcon, Send, History, BarChart3 } from "lucide-react";
import { Helmet } from "react-helmet";

export default function Wallet() {
  const { connected } = useWeb3();
  
  return (
    <>
      <Helmet>
        <title>Wallet | CryptoPilot</title>
        <meta name="description" content="Manage your cryptocurrency wallet, transfer tokens, and track your crypto assets" />
      </Helmet>
      
      <MainLayout title="Wallet" subtitle="Manage your crypto assets">
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <WalletDetails />
            </div>
            
            <div className="lg:col-span-2">
              <Tabs defaultValue="transfer" className="w-full">
                <TabsList className="w-full mb-6">
                  <TabsTrigger value="transfer" className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Transfer
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    History
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Analytics
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="transfer">
                  <Card>
                    <CardHeader>
                      <CardTitle>Transfer Tokens</CardTitle>
                      <CardDescription>
                        Send crypto tokens to another wallet
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <TransferTokens />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="history">
                  <Card>
                    <CardHeader>
                      <CardTitle>Transaction History</CardTitle>
                      <CardDescription>
                        View your recent transactions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {connected ? (
                        <div className="text-center py-6">
                          <History className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                          <h3 className="text-lg font-medium mb-1">Transaction history coming soon</h3>
                          <p className="text-muted-foreground">
                            We're working on bringing you a detailed view of your transaction history
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <WalletIcon className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">Connect your wallet</h3>
                          <p className="text-muted-foreground mb-6 max-w-md">
                            You need to connect your crypto wallet to view your transaction history
                          </p>
                          <WalletConnect />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="analytics">
                  <Card>
                    <CardHeader>
                      <CardTitle>Wallet Analytics</CardTitle>
                      <CardDescription>
                        Track your wallet performance
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {connected ? (
                        <div className="text-center py-6">
                          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                          <h3 className="text-lg font-medium mb-1">Analytics coming soon</h3>
                          <p className="text-muted-foreground">
                            We're working on bringing you detailed analytics for your crypto portfolio
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <WalletIcon className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">Connect your wallet</h3>
                          <p className="text-muted-foreground mb-6 max-w-md">
                            You need to connect your crypto wallet to view analytics
                          </p>
                          <WalletConnect />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </MainLayout>
    </>
  );
}