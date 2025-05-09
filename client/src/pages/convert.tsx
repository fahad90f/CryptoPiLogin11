import { MainLayout } from "@/components/layouts/MainLayout";
import { ConvertTokenForm } from "@/components/convert/ConvertTokenForm";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeftRight, TrendingUp, Database, RefreshCcw } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Helmet } from "react-helmet";

export default function Convert() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1]);
  const fromParam = params.get("from");
  const toParam = params.get("to");
  
  // Fetch cryptocurrency list data
  const { data: cryptocurrencies, isLoading } = useQuery({ 
    queryKey: ['/api/cryptocurrencies'],
    retry: 1
  });
  
  // Extract relevant crypto info for conversion form
  const formattedCryptoList = isLoading ? [] : (cryptocurrencies || []).map((crypto: any) => ({
    id: crypto.id.toString(),
    name: crypto.name,
    symbol: crypto.symbol,
    price: crypto.price
  }));

  return (
    <>
      <Helmet>
        <title>Convert Tokens | CryptoPilot</title>
        <meta name="description" content="Convert between different cryptocurrencies with real-time exchange rates. Secure and efficient conversion for flash tokens." />
      </Helmet>
      <MainLayout title="Convert" subtitle="Convert between different cryptocurrencies with real-time exchange rates">
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
                  <Skeleton className="h-8 w-8 mx-auto" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ) : (
              <ConvertTokenForm cryptoList={formattedCryptoList} />
            )}
          </div>
          
          <div className="space-y-6">
            <Card className="border border-muted/30">
              <CardContent className="p-5">
                <h3 className="text-lg font-space font-semibold mb-4">Conversion Information</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <ArrowLeftRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="ml-3">
                      <h4 className="font-medium text-sm">Real-Time Exchange Rates</h4>
                      <p className="text-sm text-muted-foreground">All conversion rates are fetched in real-time from multiple exchanges to ensure accuracy.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <TrendingUp className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="ml-3">
                      <h4 className="font-medium text-sm">Market-based Pricing</h4>
                      <p className="text-sm text-muted-foreground">Conversion rates reflect current market prices with minimal spread.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Database className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="ml-3">
                      <h4 className="font-medium text-sm">Cross-Chain Compatibility</h4>
                      <p className="text-sm text-muted-foreground">Convert between tokens on different blockchains with automated bridge technology.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <RefreshCcw className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="ml-3">
                      <h4 className="font-medium text-sm">Instant Execution</h4>
                      <p className="text-sm text-muted-foreground">Conversions are processed immediately with blockchain confirmation.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Alert className="bg-primary/10 border-primary/20">
              <AlertTitle>AI-Optimized Conversions</AlertTitle>
              <AlertDescription>
                DeepSeek AI analyzes market conditions to recommend the most efficient conversion paths, potentially saving up to 12% on fees.
              </AlertDescription>
            </Alert>
            
            <Card className="border border-muted/30">
              <CardContent className="p-5">
                <h3 className="text-lg font-space font-semibold mb-4">Price History</h3>
                
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-[150px] w-full" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-10" />
                      <Skeleton className="h-4 w-10" />
                      <Skeleton className="h-4 w-10" />
                      <Skeleton className="h-4 w-10" />
                      <Skeleton className="h-4 w-10" />
                    </div>
                  </div>
                ) : (
                  <div className="relative h-[150px] w-full">
                    <svg className="w-full h-full">
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.7"/>
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      <path 
                        d="M0,100 C50,70 100,90 150,75 C200,60 250,80 300,50" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth="3" 
                        fill="none" 
                        className="chart-line"
                      />
                      <path 
                        d="M0,100 C50,70 100,90 150,75 C200,60 250,80 300,50 L300,100 L0,100" 
                        fill="url(#gradient)" 
                        className="chart-line"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none text-xs text-muted-foreground">
                      <div>$1.02</div>
                      <div>$1.00</div>
                      <div>$0.98</div>
                    </div>
                  </div>
                )}
                
                <div className="mt-4 text-sm">
                  <h4 className="font-medium mb-2">Recent Rate Fluctuations</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li className="flex justify-between">
                      <span>24h Change:</span>
                      <span className="text-green-500">+0.35%</span>
                    </li>
                    <li className="flex justify-between">
                      <span>7d Average:</span>
                      <span>1 USDT = 0.000023 BTC</span>
                    </li>
                    <li className="flex justify-between">
                      <span>30d Volatility:</span>
                      <span>Low</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    </>
  );
}
