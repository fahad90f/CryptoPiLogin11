import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Send, Wallet } from "lucide-react";
import { CryptoIcon } from "@/components/ui/crypto-icon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface TransferTokenFormProps {
  cryptoList: { id: string; name: string; symbol: string; balance: number }[];
}

export function TransferTokenForm({ cryptoList }: TransferTokenFormProps) {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    cryptoSymbol: "USDT",
    amount: 100,
    recipientAddress: "",
    recipientName: "",
    network: "ethereum"
  });
  
  const [transferTab, setTransferTab] = useState<"address" | "contact">("address");
  const [isTransferring, setIsTransferring] = useState(false);
  
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const selectedCrypto = cryptoList.find(c => c.symbol === formData.cryptoSymbol);
  const hasEnoughBalance = selectedCrypto && selectedCrypto.balance >= formData.amount;
  
  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasEnoughBalance) {
      toast({
        title: "Insufficient balance",
        description: `You don't have enough ${formData.cryptoSymbol} to complete this transfer.`,
        variant: "destructive"
      });
      return;
    }
    
    if (formData.amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter an amount greater than zero.",
        variant: "destructive"
      });
      return;
    }
    
    if (transferTab === "address" && !formData.recipientAddress) {
      toast({
        title: "Missing recipient",
        description: "Please enter a valid recipient address.",
        variant: "destructive"
      });
      return;
    }
    
    if (transferTab === "contact" && !formData.recipientName) {
      toast({
        title: "Missing recipient",
        description: "Please select a contact.",
        variant: "destructive"
      });
      return;
    }
    
    setIsTransferring(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsTransferring(false);
      toast({
        title: "Transfer successful",
        description: `Transferred ${formData.amount} ${formData.cryptoSymbol} to ${
          transferTab === "address" ? formData.recipientAddress : formData.recipientName
        }.`,
        variant: "default"
      });
    }, 2000);
  };

  return (
    <Card className="border border-muted/30">
      <CardHeader>
        <CardTitle className="text-xl font-space">Transfer Tokens</CardTitle>
        <CardDescription>
          Send tokens to other wallets securely and efficiently
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleTransfer}>
          <div className="grid gap-6">
            <div className="grid gap-3">
              <Label>Token</Label>
              <Select 
                value={formData.cryptoSymbol} 
                onValueChange={(value) => handleChange("cryptoSymbol", value)}
              >
                <SelectTrigger className="bg-muted/40 border border-muted/60">
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  {cryptoList.map((crypto) => (
                    <SelectItem key={crypto.id} value={crypto.symbol}>
                      <div className="flex items-center">
                        <CryptoIcon symbol={crypto.symbol} size="sm" className="mr-2" />
                        <div>
                          <span className="mr-2">{crypto.name}</span>
                          <span className="text-muted-foreground">{crypto.symbol}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCrypto && (
                <div className="text-sm text-muted-foreground">
                  Available balance: {selectedCrypto.balance} {selectedCrypto.symbol}
                </div>
              )}
            </div>
            
            <div className="grid gap-3">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.000001"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => handleChange("amount", Number(e.target.value))}
                className="bg-muted/40 border border-muted/60"
              />
              {selectedCrypto && !hasEnoughBalance && (
                <p className="text-sm text-destructive">
                  Insufficient balance
                </p>
              )}
            </div>
            
            <div className="grid gap-3">
              <Label>Recipient</Label>
              <Tabs defaultValue="address" onValueChange={(v) => setTransferTab(v as "address" | "contact")}>
                <TabsList className="grid w-full grid-cols-2 bg-muted/20">
                  <TabsTrigger value="address">Address</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                </TabsList>
                <TabsContent value="address" className="mt-2">
                  <Input
                    placeholder="Enter wallet address"
                    value={formData.recipientAddress}
                    onChange={(e) => handleChange("recipientAddress", e.target.value)}
                    className="bg-muted/40 border border-muted/60"
                  />
                </TabsContent>
                <TabsContent value="contact" className="mt-2">
                  <Select 
                    value={formData.recipientName} 
                    onValueChange={(value) => handleChange("recipientName", value)}
                  >
                    <SelectTrigger className="bg-muted/40 border border-muted/60">
                      <SelectValue placeholder="Select contact" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alex">Alex (0x71C...1B2E)</SelectItem>
                      <SelectItem value="maria">Maria (0x82D...4F3A)</SelectItem>
                      <SelectItem value="sam">Sam (0x93E...5G7B)</SelectItem>
                    </SelectContent>
                  </Select>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="grid gap-3">
              <Label>Network</Label>
              <Select 
                value={formData.network} 
                onValueChange={(value) => handleChange("network", value)}
              >
                <SelectTrigger className="bg-muted/40 border border-muted/60">
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ethereum">Ethereum (ERC-20)</SelectItem>
                  <SelectItem value="binance">Binance Smart Chain (BEP-20)</SelectItem>
                  <SelectItem value="tron">Tron (TRC-20)</SelectItem>
                  <SelectItem value="solana">Solana (SPL)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Make sure the recipient address is compatible with the selected network
              </p>
            </div>
            
            <Alert variant="warning" className="bg-yellow-500/10 border-yellow-500/20 text-yellow-500">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Transfers are irreversible. Please double-check the recipient address and network.
              </AlertDescription>
            </Alert>
            
            <div className="grid gap-3">
              <div className="text-sm text-muted-foreground">
                <ul className="space-y-1">
                  <li className="flex justify-between">
                    <span>Network Fee:</span>
                    <span>~0.0003 ETH ($0.56)</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Expected Time:</span>
                    <span>~2 minutes</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  if (selectedCrypto) {
                    handleChange("amount", selectedCrypto.balance);
                  }
                }}
                className="bg-muted/40 border border-muted/60"
              >
                <Wallet className="mr-2 h-4 w-4" /> Use Max
              </Button>
              <Button 
                type="submit"
                disabled={isTransferring || !hasEnoughBalance || formData.amount <= 0}
              >
                {isTransferring ? (
                  <>
                    <svg 
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24"
                    >
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                      ></circle>
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> Send Tokens
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
