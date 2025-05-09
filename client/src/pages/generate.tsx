import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ChevronRight, Shield, Zap, Info, RefreshCcw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Helmet } from "react-helmet";

export default function Generate() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1]);
  const symbolParam = params.get("symbol");
  
  // Fetch cryptocurrency details
  const { data: cryptocurrencies } = useQuery({ 
    queryKey: ['/api/cryptocurrencies'],
    retry: 1
  });
  
  // Find the selected cryptocurrency
  const [selectedCrypto, setSelectedCrypto] = useState<{ name: string; symbol: string } | undefined>(
    undefined
  );
  
  useEffect(() => {
    if (cryptocurrencies && cryptocurrencies.length > 0) {
      if (symbolParam) {
        const found = cryptocurrencies.find((crypto: any) => crypto.symbol === symbolParam);
        if (found) {
          setSelectedCrypto({ name: found.name, symbol: found.symbol });
        } else {
          // Default to USDT if symbol not found
          const defaultCrypto = cryptocurrencies.find((crypto: any) => crypto.symbol === "USDT");
          setSelectedCrypto({ 
            name: defaultCrypto ? defaultCrypto.name : "Tether", 
            symbol: defaultCrypto ? defaultCrypto.symbol : "USDT" 
          });
        }
      } else {
        // Default to USDT if no symbol parameter
        const defaultCrypto = cryptocurrencies.find((crypto: any) => crypto.symbol === "USDT");
        setSelectedCrypto({ 
          name: defaultCrypto ? defaultCrypto.name : "Tether", 
          symbol: defaultCrypto ? defaultCrypto.symbol : "USDT" 
        });
      }
    }
  }, [cryptocurrencies, symbolParam]);

  // State for the generate form
  const [blockchain, setBlockchain] = useState("ethereum");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenAmount, setTokenAmount] = useState("10000");
  const [securityLevel, setSecurityLevel] = useState("military");
  
  const handleGenerateToken = () => {
    // Validation
    if (!tokenSymbol || !tokenName || !tokenAmount) {
      // Show validation error
      return;
    }
    
    // Submit token generation
    console.log("Generating token", {
      blockchain,
      tokenSymbol,
      tokenName,
      tokenAmount,
      securityLevel
    });
  };
  
  return (
    <>
      <Helmet>
        <title>Generate Flash Tokens | CryptoPilot</title>
        <meta name="description" content="Generate secure flash tokens for cryptocurrency testing and fintech applications. Create tokens on Ethereum, Binance Smart Chain, Tron, or other blockchains." />
      </Helmet>
      
      <div className="min-h-screen bg-[#070714] text-white">
        {/* Header Navigation */}
        <header className="border-b border-gray-800 flex items-center justify-between p-4">
          <div className="text-[#6366F1] font-bold text-2xl">CryptoPilot</div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="/dashboard" className="text-gray-400 hover:text-white">Dashboard</a>
            <a href="/generate" className="text-white font-medium">Generate</a>
            <a href="/convert" className="text-gray-400 hover:text-white">Convert</a>
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
          <h1 className="text-2xl font-bold mb-6">Generate Flash Token</h1>
          
          {/* Generate Token Form */}
          <Card className="bg-[#181830] border-[#2D2A66] mb-6 p-6">
            <h2 className="text-lg mb-4">Token Configuration</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Blockchain</label>
                  <Select value={blockchain} onValueChange={setBlockchain}>
                    <SelectTrigger className="w-full bg-[#0F0F1A] border-[#2D2A66]">
                      <SelectValue placeholder="Select blockchain" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0F0F1A] border-[#2D2A66]">
                      <SelectItem value="ethereum">Ethereum (ERC-20)</SelectItem>
                      <SelectItem value="bsc">Binance Smart Chain (BEP-20)</SelectItem>
                      <SelectItem value="solana">Solana (SPL)</SelectItem>
                      <SelectItem value="polygon">Polygon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Token Symbol</label>
                  <Input 
                    type="text" 
                    placeholder="e.g. TKN" 
                    className="bg-[#0F0F1A] border-[#2D2A66]"
                    value={tokenSymbol}
                    onChange={(e) => setTokenSymbol(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Token Name</label>
                  <Input 
                    type="text" 
                    placeholder="e.g. Test Token" 
                    className="bg-[#0F0F1A] border-[#2D2A66]"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Token Amount</label>
                  <Input 
                    type="number" 
                    placeholder="10000" 
                    className="bg-[#0F0F1A] border-[#2D2A66]"
                    value={tokenAmount}
                    onChange={(e) => setTokenAmount(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Security Level</label>
                  <Select value={securityLevel} onValueChange={setSecurityLevel}>
                    <SelectTrigger className="w-full bg-[#0F0F1A] border-[#2D2A66]">
                      <SelectValue placeholder="Select security level" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0F0F1A] border-[#2D2A66]">
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="military">Military Grade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="pt-5">
                  <Button 
                    className="w-full bg-[#6366F1] hover:bg-[#5355D8] text-white"
                    onClick={handleGenerateToken}
                  >
                    Generate Token
                  </Button>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Token Features */}
          <Card className="bg-[#181830] border-[#2D2A66] mb-6 p-6">
            <h2 className="text-lg mb-4">Flash Token Features</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <ChevronRight className="h-4 w-4 text-[#6366F1]" />
                  </div>
                  <div className="ml-2">
                    <h4 className="font-medium text-sm">Blockchain-Compliant</h4>
                    <p className="text-sm text-gray-400">Tokens adhere to ERC-20, BEP-20, TRC-20, or SPL standards.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <ChevronRight className="h-4 w-4 text-[#6366F1]" />
                  </div>
                  <div className="ml-2">
                    <h4 className="font-medium text-sm">Secure Minting</h4>
                    <p className="text-sm text-gray-400">Military-grade encryption for each token generation.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <ChevronRight className="h-4 w-4 text-[#6366F1]" />
                  </div>
                  <div className="ml-2">
                    <h4 className="font-medium text-sm">Fully Convertible</h4>
                    <p className="text-sm text-gray-400">Convert between different cryptocurrencies with real-time rates.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <ChevronRight className="h-4 w-4 text-[#6366F1]" />
                  </div>
                  <div className="ml-2">
                    <h4 className="font-medium text-sm">Transferable</h4>
                    <p className="text-sm text-gray-400">Send tokens to any compatible wallet address.</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Security Levels */}
          <Card className="bg-[#181830] border-[#2D2A66] mb-6 p-6">
            <h2 className="text-lg mb-4">Security Levels</h2>
            
            <Tabs defaultValue="military" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4 bg-[#0F0F1A]">
                <TabsTrigger value="basic" className="data-[state=active]:bg-[#2D2A66]">Basic</TabsTrigger>
                <TabsTrigger value="advanced" className="data-[state=active]:bg-[#2D2A66]">Advanced</TabsTrigger>
                <TabsTrigger value="military" className="data-[state=active]:bg-[#2D2A66]">Military</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="pt-2">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <h4 className="font-medium">Basic Protection</h4>
                </div>
                <p className="text-sm text-gray-400">
                  Standard encryption for non-critical testing environments. Suitable for development and internal testing only.
                </p>
              </TabsContent>
              <TabsContent value="advanced" className="pt-2">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-4 w-4 text-[#6366F1]" />
                  <h4 className="font-medium">Advanced Protection</h4>
                </div>
                <p className="text-sm text-gray-400">
                  Enhanced security with multi-layer encryption and AI monitoring. Recommended for integration testing and partnerships.
                </p>
              </TabsContent>
              <TabsContent value="military" className="pt-2">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-4 w-4 text-[#6366F1]" />
                  <h4 className="font-medium">Military Grade</h4>
                </div>
                <p className="text-sm text-gray-400">
                  Highest level of protection with quantum-resistant algorithms and continuous AI-powered security scanning. Required for fintech applications.
                </p>
              </TabsContent>
            </Tabs>
          </Card>
          
          {/* AI Alert */}
          <Alert className="bg-[#181830] border-[#6366F1] mb-6">
            <Zap className="h-4 w-4 text-[#6366F1]" />
            <AlertTitle>AI-Enhanced Security</AlertTitle>
            <AlertDescription className="text-gray-400">
              DeepSeek's neural networks provide extra layers of security for all generated tokens, adapting to new threats in real-time.
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
