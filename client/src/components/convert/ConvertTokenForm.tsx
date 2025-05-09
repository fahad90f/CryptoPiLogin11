import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowDown, ArrowLeftRight, RefreshCw } from "lucide-react";
import { CryptoIcon } from "@/components/ui/crypto-icon";

interface ConvertTokenFormProps {
  cryptoList: { id: string; name: string; symbol: string; price: number }[];
}

export function ConvertTokenForm({ cryptoList }: ConvertTokenFormProps) {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    fromCrypto: "USDT",
    toCrypto: "BTC",
    amount: 100,
    convertAll: false
  });
  
  const [isConverting, setIsConverting] = useState(false);
  const [calculatingRate, setCalculatingRate] = useState(false);
  
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // Get exchange rate between tokens
  const getExchangeRate = () => {
    const fromToken = cryptoList.find(c => c.symbol === formData.fromCrypto);
    const toToken = cryptoList.find(c => c.symbol === formData.toCrypto);
    
    if (!fromToken || !toToken) return 0;
    
    return toToken.price / fromToken.price;
  };
  
  const exchangeRate = getExchangeRate();
  const estimatedReceived = formData.amount * exchangeRate;
  
  const handleSwapCurrencies = () => {
    setCalculatingRate(true);
    
    // Simulate exchange rate calculation
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        fromCrypto: prev.toCrypto,
        toCrypto: prev.fromCrypto
      }));
      setCalculatingRate(false);
    }, 500);
  };
  
  const handleRefreshRate = () => {
    setCalculatingRate(true);
    
    // Simulate exchange rate refreshing
    setTimeout(() => {
      setCalculatingRate(false);
      toast({
        title: "Exchange rate updated",
        description: "Latest market rates have been applied.",
      });
    }, 700);
  };
  
  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsConverting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsConverting(false);
      toast({
        title: "Conversion successful",
        description: `Converted ${formData.amount} ${formData.fromCrypto} to ${estimatedReceived.toFixed(8)} ${formData.toCrypto}.`,
        variant: "default"
      });
    }, 2000);
  };

  return (
    <Card className="border border-muted/30">
      <CardHeader>
        <CardTitle className="text-xl font-space">Convert Tokens</CardTitle>
        <CardDescription>
          Convert between different cryptocurrencies with real-time exchange rates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleConvert}>
          <div className="grid gap-6">
            <div className="grid gap-3">
              <Label>From</Label>
              <div className="flex gap-3">
                <Select 
                  value={formData.fromCrypto} 
                  onValueChange={(value) => handleChange("fromCrypto", value)}
                >
                  <SelectTrigger className="w-[110px] bg-muted/40 border border-muted/60">
                    <SelectValue placeholder="Select token" />
                  </SelectTrigger>
                  <SelectContent>
                    {cryptoList.map((crypto) => (
                      <SelectItem key={crypto.id} value={crypto.symbol}>
                        <div className="flex items-center">
                          <CryptoIcon symbol={crypto.symbol} size="sm" className="mr-2" />
                          {crypto.symbol}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="0"
                  placeholder="Amount"
                  value={formData.amount}
                  onChange={(e) => handleChange("amount", Number(e.target.value))}
                  className="flex-1 bg-muted/40 border border-muted/60"
                />
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button 
                type="button" 
                variant="outline" 
                size="icon" 
                className="rounded-full bg-muted/40 border border-muted/60"
                onClick={handleSwapCurrencies}
                disabled={calculatingRate}
              >
                {calculatingRate ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowDown className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <div className="grid gap-3">
              <Label>To</Label>
              <div className="flex gap-3">
                <Select 
                  value={formData.toCrypto} 
                  onValueChange={(value) => handleChange("toCrypto", value)}
                >
                  <SelectTrigger className="w-[110px] bg-muted/40 border border-muted/60">
                    <SelectValue placeholder="Select token" />
                  </SelectTrigger>
                  <SelectContent>
                    {cryptoList.map((crypto) => (
                      <SelectItem key={crypto.id} value={crypto.symbol}>
                        <div className="flex items-center">
                          <CryptoIcon symbol={crypto.symbol} size="sm" className="mr-2" />
                          {crypto.symbol}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="text"
                  readOnly
                  value={calculatingRate ? "Calculating..." : estimatedReceived.toFixed(8)}
                  className="flex-1 bg-muted/10 border border-muted/30"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-muted/30">
              <div className="text-sm text-muted-foreground">
                Exchange Rate
              </div>
              <div className="flex items-center">
                <div className="font-mono">
                  1 {formData.fromCrypto} = {calculatingRate ? "..." : exchangeRate.toFixed(8)} {formData.toCrypto}
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="ml-2 h-8 w-8"
                  onClick={handleRefreshRate}
                  disabled={calculatingRate}
                >
                  <RefreshCw className={`h-4 w-4 ${calculatingRate ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
            
            <div className="grid gap-3">
              <div className="text-sm text-muted-foreground">
                <ul className="space-y-1">
                  <li className="flex justify-between">
                    <span>Network Fee:</span>
                    <span>~0.00025 ETH ($0.47)</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Execution Time:</span>
                    <span>~30 seconds</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <Button 
              type="submit"
              className="w-full"
              disabled={isConverting || formData.amount <= 0 || formData.fromCrypto === formData.toCrypto}
            >
              {isConverting ? (
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
                  Converting...
                </>
              ) : (
                <>
                  <ArrowLeftRight className="mr-2 h-4 w-4" /> Convert Tokens
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
