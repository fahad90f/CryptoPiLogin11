import { MainLayout } from "@/components/layouts/MainLayout";
import { GenerateTokenForm } from "@/components/generate/GenerateTokenForm";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ChevronRight, Shield, Zap, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

  return (
    <>
      <Helmet>
        <title>Generate Flash Tokens | CryptoPilot</title>
        <meta name="description" content="Generate secure flash tokens for cryptocurrency testing and fintech applications. Create tokens on Ethereum, Binance Smart Chain, Tron, or other blockchains." />
      </Helmet>
      <MainLayout title="Generate" subtitle="Create flash tokens for testing with secure blockchain integration">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <GenerateTokenForm defaultCrypto={selectedCrypto} />
          </div>
          
          <div className="space-y-6">
            <Card className="border border-muted/30">
              <CardContent className="p-5">
                <h3 className="text-lg font-space font-semibold mb-4">Flash Token Features</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </div>
                    <div className="ml-2">
                      <h4 className="font-medium text-sm">Blockchain-Compliant</h4>
                      <p className="text-sm text-muted-foreground">Tokens adhere to ERC-20, BEP-20, TRC-20, or SPL standards based on selected blockchain.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </div>
                    <div className="ml-2">
                      <h4 className="font-medium text-sm">Secure Minting</h4>
                      <p className="text-sm text-muted-foreground">Military-grade encryption for each token generation, secured by DeepSeek AI algorithms.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </div>
                    <div className="ml-2">
                      <h4 className="font-medium text-sm">Fully Convertible</h4>
                      <p className="text-sm text-muted-foreground">Seamlessly convert between different cryptocurrencies with real-time rates.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </div>
                    <div className="ml-2">
                      <h4 className="font-medium text-sm">Transferable</h4>
                      <p className="text-sm text-muted-foreground">Send tokens to any compatible wallet address with full transaction tracking.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Alert className="bg-primary/10 border-primary/20">
              <Zap className="h-4 w-4 text-primary" />
              <AlertTitle>AI-Enhanced Security</AlertTitle>
              <AlertDescription>
                DeepSeek's neural networks provide extra layers of security for all generated tokens, adapting to new threats in real-time.
              </AlertDescription>
            </Alert>
            
            <Card className="border border-muted/30">
              <CardContent className="p-5">
                <h3 className="text-lg font-space font-semibold mb-4">Security Levels</h3>
                
                <Tabs defaultValue="military" className="w-full">
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                    <TabsTrigger value="military">Military</TabsTrigger>
                  </TabsList>
                  <TabsContent value="basic" className="pt-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium">Basic Protection</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Standard encryption for non-critical testing environments. Suitable for development and internal testing only.
                    </p>
                  </TabsContent>
                  <TabsContent value="advanced" className="pt-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <h4 className="font-medium">Advanced Protection</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Enhanced security with multi-layer encryption and AI monitoring. Recommended for integration testing and partnerships.
                    </p>
                  </TabsContent>
                  <TabsContent value="military" className="pt-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <h4 className="font-medium">Military Grade</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Highest level of protection with quantum-resistant algorithms and continuous AI-powered security scanning. Required for fintech applications.
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    </>
  );
}
