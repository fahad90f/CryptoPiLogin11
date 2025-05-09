import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Helmet } from "react-helmet";

// Sample token data
const tokens = [
  { 
    symbol: "BTC", 
    name: "Bitcoin", 
    blockchain: "Bitcoin",
    balance: 0.98,
    price: 60000,
    change24h: 0
  },
  { 
    symbol: "ETH", 
    name: "Ethereum", 
    blockchain: "Ethereum",
    balance: 7.703,
    price: 0,
    change24h: 0
  }
];

export default function Dashboard() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Campaign filter state
  const [campaign, setCampaign] = useState("test");
  
  // Handle view token details
  const handleViewToken = (symbol: string) => {
    toast({
      title: "Token details",
      description: `Viewing details for ${symbol}`
    });
  };
  
  // Handle generate, convert, transfer actions
  const handleGenerate = () => {
    navigate("/generate");
  };
  
  const handleConvert = () => {
    navigate("/convert");
  };
  
  const handleTransfer = () => {
    navigate("/transfer");
  };
  
  return (
    <>
      <Helmet>
        <title>Dashboard | CryptoPilot</title>
        <meta name="description" content="CryptoPilot dashboard for monitoring, generating, converting, and transferring top 500 cryptocurrencies with AI-enhanced security." />
      </Helmet>
      
      <div className="min-h-screen bg-[#070714] text-white">
        {/* Header Navigation */}
        <header className="border-b border-gray-800 flex items-center justify-between p-4">
          <div className="text-[#6366F1] font-bold text-2xl">CryptoPilot</div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="/dashboard" className="text-white font-medium">Dashboard</a>
            <a href="/generate" className="text-gray-400 hover:text-white">Generate</a>
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
          <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
          
          {/* Campaign Selection */}
          <Card className="bg-[#181830] border-[#2D2A66] mb-6 p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg mb-2">Select Campaign</h2>
                <Select value={campaign} onValueChange={setCampaign}>
                  <SelectTrigger className="w-full bg-[#0F0F1A] border-[#2D2A66]">
                    <SelectValue placeholder="Select campaign" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F0F1A] border-[#2D2A66]">
                    <SelectItem value="test">Test (active)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <h2 className="text-lg mb-2">Campaign Details</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Test</span>
                    <span className="text-white"></span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Created:</span>
                    <span className="text-white">15/04/2025</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span></span>
                    <span className="px-2 py-1 text-xs bg-green-500/20 text-green-500 rounded">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Search Tokens */}
          <Card className="bg-[#181830] border-[#2D2A66] mb-6 p-6">
            <h2 className="text-lg mb-4">Search Tokens</h2>
            <Input 
              type="text" 
              placeholder="Search by name or symbol..." 
              className="bg-[#0F0F1A] border-[#2D2A66] w-full"
            />
          </Card>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Campaign Status */}
            <Card className="bg-[#181830] border-[#2D2A66] p-6">
              <h2 className="text-lg mb-4">Campaign Status</h2>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Active</h3>
                <div className="text-sm text-gray-400">Started: 15/04/2025</div>
                <div className="mt-4 space-y-1">
                  <div className="text-sm text-gray-400">Tokens: 2</div>
                  <div className="text-sm text-gray-400">Transactions: 2</div>
                </div>
              </div>
            </Card>
            
            {/* Token Generation */}
            <Card className="bg-[#181830] border-[#2D2A66] p-6">
              <h2 className="text-lg mb-4">Token Generation</h2>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">2</h3>
                <div className="mt-4">
                  <Progress value={60} className="h-2 bg-[#2D2A66]" indicatorClassName="bg-[#6366F1]" />
                </div>
              </div>
            </Card>
            
            {/* Transaction Volume */}
            <Card className="bg-[#181830] border-[#2D2A66] p-6">
              <h2 className="text-lg mb-4">Transaction Volume</h2>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">4</h3>
                <div className="mt-4 grid grid-cols-3 gap-1">
                  <div className="text-center">
                    <div className="text-xs text-gray-400">Generate:</div>
                    <div className="font-medium">2</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-400">Convert:</div>
                    <div className="font-medium">2</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-400">Transfer:</div>
                    <div className="font-medium">0</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Tokens Table */}
          <Card className="bg-[#181830] border-[#2D2A66] p-6 mb-6">
            <h2 className="text-lg mb-4">Tokens</h2>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800 hover:bg-transparent">
                  <TableHead className="text-gray-400 font-normal">Symbol</TableHead>
                  <TableHead className="text-gray-400 font-normal">Name</TableHead>
                  <TableHead className="text-gray-400 font-normal">Blockchain</TableHead>
                  <TableHead className="text-gray-400 font-normal text-right">Balance</TableHead>
                  <TableHead className="text-gray-400 font-normal text-right">Price</TableHead>
                  <TableHead className="text-gray-400 font-normal text-right">24h Change</TableHead>
                  <TableHead className="text-gray-400 font-normal text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tokens.map((token) => (
                  <TableRow key={token.symbol} className="border-gray-800 hover:bg-[#1E1E3F]">
                    <TableCell className="font-medium">{token.symbol}</TableCell>
                    <TableCell>{token.name}</TableCell>
                    <TableCell>{token.blockchain}</TableCell>
                    <TableCell className="text-right">{token.balance}</TableCell>
                    <TableCell className="text-right">${token.price}</TableCell>
                    <TableCell className="text-right text-green-500">+{token.change24h}%</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-transparent hover:bg-[#2D2A66] border-[#2D2A66] text-white"
                        onClick={() => handleViewToken(token.symbol)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          
          {/* Footer */}
          <div className="text-center text-sm text-gray-500 mt-8">
            © 2025 CryptoPilot. All rights reserved.
          </div>
        </main>
      </div>
    </>
  );
}
