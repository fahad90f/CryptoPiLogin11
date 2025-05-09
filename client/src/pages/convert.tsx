import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeftRight, TrendingUp, Database, RefreshCcw, ChevronDown, ChevronUp } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Helmet } from "react-helmet";

export default function Convert() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1]);
  const fromParam = params.get("from") || "USDT";
  const toParam = params.get("to") || "BTC";
  
  // Conversion form state
  const [fromCrypto, setFromCrypto] = useState(fromParam);
  const [toCrypto, setToCrypto] = useState(toParam);
  const [fromAmount, setFromAmount] = useState("100");
  const [calculatedAmount, setCalculatedAmount] = useState("0.0023");
  
  // Fetch cryptocurrency list data
  const { data: cryptocurrencies, isLoading } = useQuery({ 
    queryKey: ['/api/cryptocurrencies'],
    retry: 1
  });
  
  // Extract relevant crypto info for conversion form
  const cryptoList = isLoading ? [] : (cryptocurrencies || []).map((crypto: any) => ({
    id: crypto.id.toString(),
    name: crypto.name,
    symbol: crypto.symbol,
    price: crypto.price
  }));
  
  // Handle conversion
  const handleConvertSubmit = () => {
    // Here you would actually perform the conversion
    console.log("Converting", {
      from: fromCrypto,
      to: toCrypto,
      amount: fromAmount
    });
  };
  
  // Swap currencies
  const handleSwapCurrencies = () => {
    const temp = fromCrypto;
    setFromCrypto(toCrypto);
    setToCrypto(temp);
  };

  return (
    <>
      <Helmet>
        <title>Convert Tokens | CryptoPilot</title>
        <meta name="description" content="Convert between different cryptocurrencies with real-time exchange rates. Secure and efficient conversion for flash tokens." />
      </Helmet>
      
      <div className="min-h-screen bg-[#070714] text-white">
        {/* Header Navigation */}
        <header className="border-b border-gray-800 flex items-center justify-between p-4">
          <div className="text-[#6366F1] font-bold text-2xl">CryptoPilot</div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="/dashboard" className="text-gray-400 hover:text-white">Dashboard</a>
            <a href="/generate" className="text-gray-400 hover:text-white">Generate</a>
            <a href="/convert" className="text-white font-medium">Convert</a>
            <a href="/transfer" className="text-gray-400 hover:text-white">Transfer</a>
            <a href="/settings" className="text-gray-400 hover:text-white">Settings</a>
          </nav>
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center">
              <span className="font-medium text-sm">J</span>
            </div>
          </div>
        </header>
        
        <main className="p-6">
          <h1 className="text-2xl font-bold mb-6">Convert Token</h1>
          
          {/* Conversion Form */}
          <Card className="bg-[#181830] border-[#2D2A66] mb-6 p-6">
            <h2 className="text-lg mb-4">Token Conversion</h2>
            
            <div className="space-y-6">
              {/* From Currency */}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">From</label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      className="bg-[#0F0F1A] border-[#2D2A66] w-full"
                      value={fromAmount}
                      onChange={(e) => setFromAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <Select value={fromCrypto} onValueChange={setFromCrypto}>
                      <SelectTrigger className="w-full bg-[#0F0F1A] border-[#2D2A66]">
                        <SelectValue placeholder="Select token" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0F0F1A] border-[#2D2A66]">
                        {cryptoList.map((crypto: any) => (
                          <SelectItem key={crypto.symbol} value={crypto.symbol}>
                            {crypto.symbol}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {/* Swap Button */}
              <div className="flex justify-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full h-10 w-10 p-0 bg-[#0F0F1A] border-[#2D2A66]"
                  onClick={handleSwapCurrencies}
                >
                  <ArrowLeftRight className="h-4 w-4 text-[#6366F1]" />
                </Button>
              </div>
              
              {/* To Currency */}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">To</label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <div className="bg-[#0F0F1A] border border-[#2D2A66] rounded-md p-3 flex justify-between items-center">
                      <span className="text-white">{calculatedAmount}</span>
                      <span className="text-gray-400">(estimated)</span>
                    </div>
                  </div>
                  <div>
                    <Select value={toCrypto} onValueChange={setToCrypto}>
                      <SelectTrigger className="w-full bg-[#0F0F1A] border-[#2D2A66]">
                        <SelectValue placeholder="Select token" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0F0F1A] border-[#2D2A66]">
                        {cryptoList.map((crypto: any) => (
                          <SelectItem key={crypto.symbol} value={crypto.symbol}>
                            {crypto.symbol}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {/* Exchange Rate */}
              <div className="bg-[#0F0F1A] border border-[#2D2A66] rounded-md p-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Exchange Rate</span>
                  <span>1 {fromCrypto} ≈ 0.000023 {toCrypto}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-400">Fee</span>
                  <span>0.5%</span>
                </div>
              </div>
              
              {/* Submit Button */}
              <Button 
                className="w-full bg-[#6366F1] hover:bg-[#5355D8] text-white"
                onClick={handleConvertSubmit}
              >
                Convert
              </Button>
            </div>
          </Card>
          
          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-[#181830] border-[#2D2A66] p-6">
              <h2 className="text-lg mb-4">Conversion Information</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <ArrowLeftRight className="h-5 w-5 text-[#6366F1]" />
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium text-sm">Real-Time Exchange Rates</h4>
                    <p className="text-sm text-gray-400">All conversion rates are fetched in real-time from multiple exchanges to ensure accuracy.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <TrendingUp className="h-5 w-5 text-[#6366F1]" />
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium text-sm">Market-based Pricing</h4>
                    <p className="text-sm text-gray-400">Conversion rates reflect current market prices with minimal spread.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <RefreshCcw className="h-5 w-5 text-[#6366F1]" />
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium text-sm">Instant Execution</h4>
                    <p className="text-sm text-gray-400">Conversions are processed immediately with blockchain confirmation.</p>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card className="bg-[#181830] border-[#2D2A66] p-6">
              <h2 className="text-lg mb-4">Price History</h2>
              
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-[150px] w-full bg-[#0F0F1A]" />
                </div>
              ) : (
                <div className="relative h-[150px] w-full">
                  <svg className="w-full h-full">
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#6366F1" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="#6366F1" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    <path 
                      d="M0,100 C50,70 100,90 150,75 C200,60 250,80 300,50" 
                      stroke="#6366F1"
                      strokeWidth="2" 
                      fill="none" 
                    />
                    <path 
                      d="M0,100 C50,70 100,90 150,75 C200,60 250,80 300,50 L300,150 L0,150" 
                      fill="url(#gradient)" 
                    />
                  </svg>
                  
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <div>Apr 10</div>
                    <div>Apr 17</div>
                    <div>Apr 24</div>
                    <div>May 1</div>
                    <div>May 8</div>
                  </div>
                </div>
              )}
              
              <div className="mt-4 text-sm">
                <h4 className="font-medium mb-2">Recent Rate Changes</h4>
                <ul className="space-y-1">
                  <li className="flex justify-between">
                    <span className="text-gray-400">24h Change:</span>
                    <span className="text-green-500">+0.35%</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-400">7d Average:</span>
                    <span>1 {fromCrypto} = 0.000023 {toCrypto}</span>
                  </li>
                </ul>
              </div>
            </Card>
          </div>
          
          {/* AI Alert */}
          <Alert className="bg-[#181830] border-[#6366F1] mb-6 mt-6">
            <TrendingUp className="h-4 w-4 text-[#6366F1]" />
            <AlertTitle>AI-Optimized Conversions</AlertTitle>
            <AlertDescription className="text-gray-400">
              DeepSeek AI analyzes market conditions to recommend the most efficient conversion paths, potentially saving up to 12% on fees.
            </AlertDescription>
          </Alert>
          
          {/* Footer */}
          <div className="text-center text-sm text-gray-500 mt-8">
            © 2025 CryptoPilot. All rights reserved.
          </div>
        </main>
      </div>
    </>
  );
}
