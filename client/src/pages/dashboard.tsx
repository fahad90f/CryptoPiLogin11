import { MainLayout } from "@/components/layouts/MainLayout";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { BlockchainActivity } from "@/components/dashboard/BlockchainActivity";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { CryptoTable, CryptoData } from "@/components/dashboard/CryptoTable";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { AIInsights } from "@/components/dashboard/AIInsights";
import { AiBanner } from "@/components/dashboard/AiBanner";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  ChartPie, 
  Rocket, 
  ArrowLeftRight, 
  Shield,
  Filter
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet";

// Performance chart data
const performanceData = [
  { name: "Mon", price: 1.00 },
  { name: "Tue", price: 1.005 },
  { name: "Wed", price: 1.002 },
  { name: "Thu", price: 0.998 },
  { name: "Fri", price: 1.004 },
  { name: "Sat", price: 1.008 },
  { name: "Sun", price: 1.01 }
];

// Blockchain activity data
const blockchainData = [
  { name: "Ethereum", percentage: 42.3, color: "bg-primary" },
  { name: "Binance SC", percentage: 28.7, color: "bg-accent" },
  { name: "Tron", percentage: 15.9, color: "bg-destructive" },
  { name: "Solana", percentage: 9.2, color: "bg-yellow-500" },
  { name: "Others", percentage: 3.9, color: "bg-muted-foreground" }
];

// Transactions data
const transactionsData = [
  { 
    id: "tx1", 
    type: "generate", 
    name: "Generated USDT", 
    time: "10 mins ago", 
    amount: "+1,000 USDT", 
    status: "complete",
    blockchain: "ERC-20"
  },
  { 
    id: "tx2", 
    type: "convert", 
    name: "Converted to BTC", 
    time: "25 mins ago", 
    amount: "-500 USDT", 
    status: "complete" 
  },
  { 
    id: "tx3", 
    type: "transfer", 
    name: "Transferred ETH", 
    time: "2 hours ago", 
    amount: "0.38 ETH", 
    status: "pending" 
  },
  { 
    id: "tx4", 
    type: "generate", 
    name: "Generated SOL", 
    time: "5 hours ago", 
    amount: "+25 SOL", 
    status: "complete",
    blockchain: "Solana"
  }
];

// AI Insights data
const insightsData = [
  {
    id: "ins1",
    title: "Flash Token Security Optimized",
    time: "1h ago",
    description: "AI has applied enhanced encryption to all generated tokens, resulting in a 23% security improvement.",
    metric: "Security Score",
    metricValue: "97.8%",
    action: "View Details",
    borderColor: "border-green-500"
  },
  {
    id: "ins2",
    title: "Market Volatility Alert",
    time: "3h ago",
    description: "Unusual BTC price movements detected. Consider adjusting your flash token distribution strategy.",
    metric: "Confidence",
    metricValue: "87.3%",
    action: "View Analysis",
    borderColor: "border-yellow-500"
  },
  {
    id: "ins3",
    title: "Conversion Rate Optimization",
    time: "8h ago",
    description: "AI has identified optimal conversion pathways that could save up to 12% on transaction fees.",
    metric: "Estimated Savings",
    metricValue: "$128.45",
    action: "Apply Now",
    borderColor: "border-primary"
  }
];

export default function Dashboard() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Campaign filter state
  const [campaign, setCampaign] = useState("all");
  const [token, setToken] = useState("USDT");
  const [timeFrame, setTimeFrame] = useState("24h");
  
  // Fetch top cryptocurrencies
  const { data: cryptoList, isLoading: isLoadingCryptos } = useQuery({
    queryKey: ['/api/cryptocurrencies'],
    retry: 1
  });
  
  // Handle crypto actions
  const handleGenerateToken = (crypto: CryptoData) => {
    navigate(`/generate?symbol=${crypto.symbol}`);
  };
  
  const handleConvertToken = (crypto: CryptoData) => {
    navigate(`/convert?from=USDT&to=${crypto.symbol}`);
  };
  
  const handleViewAllTransactions = () => {
    navigate('/history');
  };
  
  // Export analytics data
  const handleExportData = () => {
    toast({
      title: "Exporting analytics data",
      description: "Your data is being prepared for download."
    });
  };
  
  // Get AI insights
  const handleAiInsights = () => {
    toast({
      title: "AI Analysis in progress",
      description: "Analyzing current market conditions and your token portfolio."
    });
  };
  
  return (
    <>
      <Helmet>
        <title>Dashboard | CryptoPilot</title>
        <meta name="description" content="CryptoPilot dashboard for monitoring, generating, converting, and transferring top 500 cryptocurrencies with AI-enhanced security." />
      </Helmet>
      <MainLayout title="Dashboard" subtitle="Mission Control for Top 500 Cryptocurrencies">
        {/* Filter Bar */}
        <div className="bg-card rounded-xl p-4 mb-6 flex flex-col md:flex-row justify-between space-y-4 md:space-y-0">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Select 
                value={campaign} 
                onValueChange={setCampaign}
              >
                <SelectTrigger className="py-2 pl-3 pr-8 bg-muted/40 border border-muted/60 rounded-lg">
                  <SelectValue placeholder="All Campaigns" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campaigns</SelectItem>
                  <SelectItem value="q2">Q2 Testing</SelectItem>
                  <SelectItem value="fintech">Fintech Integration</SelectItem>
                  <SelectItem value="pilot">Pilot Program</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="relative">
              <Select 
                value={token} 
                onValueChange={setToken}
              >
                <SelectTrigger className="py-2 pl-3 pr-8 bg-muted/40 border border-muted/60 rounded-lg">
                  <SelectValue placeholder="USDT" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USDT">USDT</SelectItem>
                  <SelectItem value="BTC">BTC</SelectItem>
                  <SelectItem value="ETH">ETH</SelectItem>
                  <SelectItem value="SOL">SOL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="relative">
              <Select 
                value={timeFrame} 
                onValueChange={setTimeFrame}
              >
                <SelectTrigger className="py-2 pl-3 pr-8 bg-muted/40 border border-muted/60 rounded-lg">
                  <SelectValue placeholder="Last 24h" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              className="py-2 px-3 rounded-lg bg-muted/40 border border-muted/60 text-sm"
              onClick={handleExportData}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor" 
                className="w-4 h-4 mr-1"
              >
                <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
              </svg>
              Export
            </Button>
            <Button 
              variant="default" 
              className="py-2 px-3 rounded-lg bg-primary text-white text-sm"
              onClick={handleAiInsights}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor" 
                className="w-4 h-4 mr-1"
              >
                <path d="M6.293 9.293a1 1 0 011.414 0L10 11.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" />
              </svg>
              AI Insights
            </Button>
          </div>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <StatsCard 
            title="USDT Market Cap"
            value="$89.2B"
            icon={ChartPie}
            iconBgColor="bg-primary/20"
            iconColor="text-primary"
            change={1.2}
          />
          
          <StatsCard 
            title="Active Flash Tokens"
            value="128"
            icon={Rocket}
            iconBgColor="bg-destructive/20"
            iconColor="text-destructive"
            change={8.4}
          />
          
          <StatsCard 
            title="Conversions (24h)"
            value="327"
            icon={ArrowLeftRight}
            iconBgColor="bg-accent/20"
            iconColor="text-accent"
            change={-2.3}
          />
          
          <StatsCard 
            title="AI Safety Score"
            value="97.8/100"
            icon={Shield}
            iconBgColor="bg-primary/20"
            iconColor="text-primary"
            change={0.5}
          />
        </div>
        
        {/* Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <PerformanceChart 
              data={performanceData} 
              title="USDT Performance" 
            />
          </div>
          
          <div>
            <BlockchainActivity 
              data={blockchainData} 
              latestBlock="#14,372,905" 
            />
          </div>
        </div>
        
        {/* Top Cryptocurrencies */}
        <div className="mb-6">
          <CryptoTable 
            data={cryptoList || [
              { id: 1, name: "Bitcoin", symbol: "BTC", price: 42389.25, change24h: 1.42, change7d: -2.18, marketCap: 824500000000 },
              { id: 2, name: "Ethereum", symbol: "ETH", price: 2486.17, change24h: 3.21, change7d: 7.84, marketCap: 298900000000 },
              { id: 3, name: "Tether", symbol: "USDT", price: 1.00, change24h: 0.01, change7d: -0.02, marketCap: 89200000000, isDefault: true },
              { id: 4, name: "Binance Coin", symbol: "BNB", price: 352.89, change24h: -0.87, change7d: 2.34, marketCap: 54700000000 },
              { id: 5, name: "Solana", symbol: "SOL", price: 102.63, change24h: 8.94, change7d: 21.37, marketCap: 44300000000 }
            ]}
            onGenerate={handleGenerateToken}
            onConvert={handleConvertToken}
          />
        </div>
        
        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <RecentTransactions 
            transactions={transactionsData}
            onViewAll={handleViewAllTransactions}
          />
          
          <AIInsights insights={insightsData} />
        </div>
        
        {/* AI-Enhanced Banner */}
        <AiBanner />
      </MainLayout>
    </>
  );
}
