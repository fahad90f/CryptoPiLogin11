import { useState } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { Link } from "wouter";
import {
  Search,
  Bell,
  Menu,
  Plus,
  X,
  Wallet
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WalletConnect } from "@/components/wallet/WalletConnect";
import { Separator } from "@/components/ui/separator";

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function MainLayout({ children, title, subtitle }: MainLayoutProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar for desktop */}
      <Sidebar />
      
      {/* Mobile sidebar */}
      <Sheet>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon" className="text-white mr-2">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 bg-card">
          <Sidebar />
        </SheetContent>
      </Sheet>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-muted/30 py-4 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white mr-2">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64 bg-card">
                  <Sidebar />
                </SheetContent>
              </Sheet>
              <h1 className="font-space font-bold text-xl">CryptoPilot</h1>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search cryptocurrencies..."
                  className="py-2 pl-10 pr-4 w-80 bg-muted/40 border border-muted/60 rounded-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
              </Button>
              
              <div className="hidden md:flex items-center space-x-2 py-1 px-3 rounded-full bg-muted/40 border border-muted/60">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                <span className="text-xs">Network: Online</span>
              </div>
              
              {/* Wallet Connect Button */}
              <div className="hidden md:block">
                <WalletConnect />
              </div>
              
              <Button className="py-1.5 px-4 rounded-lg bg-accent text-accent-foreground font-medium text-sm">
                <Plus className="h-4 w-4 mr-1" /> New Flight
              </Button>
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-background to-card p-6 custom-scrollbar">
          <div className="mb-6">
            <h2 className="text-2xl font-space font-bold mb-1">{title}</h2>
            {subtitle && (
              <div className="flex items-center space-x-2">
                <p className="text-muted-foreground text-sm">{subtitle}</p>
                <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full border border-primary/50">
                  AI Enhanced
                </span>
              </div>
            )}
          </div>
          
          {children}
        </main>
      </div>
      
      {/* Quick Actions Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button className="w-14 h-14 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-lg hover:bg-accent/90 transition-transform hover:-translate-y-1">
          <Plus className="h-6 w-6" />
        </Button>
      </div>
      
      <Toaster />
    </div>
  );
}
