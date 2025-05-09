import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import {
  Rocket,
  LayoutDashboard,
  GitBranch,
  ArrowLeftRight,
  Send,
  Wallet,
  History,
  Brain,
  Settings,
  User
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

interface SidebarNavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const SidebarNavItem = ({ href, icon, label, active }: SidebarNavItemProps) => {
  return (
    <Link href={href}>
      <div
        className={cn(
          "flex items-center space-x-3 px-4 py-3 mb-1 rounded-lg transition-colors cursor-pointer",
          active
            ? "bg-primary/20 border border-primary/50"
            : "hover:bg-muted/30"
        )}
      >
        <span className={active ? "text-accent" : "text-muted-foreground"}>
          {icon}
        </span>
        <span>{label}</span>
      </div>
    </Link>
  );
};

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();

  return (
    <div className={cn("hidden md:flex flex-col w-64 bg-card", className)}>
      <div className="p-4 flex items-center space-x-3 border-b border-muted/30">
        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
          <Rocket className="text-accent-foreground h-5 w-5" />
        </div>
        <h1 className="font-space font-bold text-xl text-white">CryptoPilot</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="px-4 pt-6 pb-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Flight Deck</p>
        </div>
        
        <nav className="px-2">
          <SidebarNavItem 
            href="/dashboard" 
            icon={<LayoutDashboard size={16} />} 
            label="Dashboard" 
            active={location === "/" || location === "/dashboard"} 
          />
          <SidebarNavItem 
            href="/generate" 
            icon={<GitBranch size={16} />} 
            label="Generate" 
            active={location === "/generate"} 
          />
          <SidebarNavItem 
            href="/convert" 
            icon={<ArrowLeftRight size={16} />} 
            label="Convert" 
            active={location === "/convert"} 
          />
          <SidebarNavItem 
            href="/transfer" 
            icon={<Send size={16} />} 
            label="Transfer" 
            active={location === "/transfer"} 
          />
        </nav>
        
        <div className="px-4 pt-6 pb-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Control Center</p>
        </div>
        
        <nav className="px-2">
          <SidebarNavItem 
            href="/wallet" 
            icon={<Wallet size={16} />} 
            label="My Wallet" 
            active={location === "/wallet"} 
          />
          <SidebarNavItem 
            href="/history" 
            icon={<History size={16} />} 
            label="History" 
            active={location === "/history"} 
          />
          <SidebarNavItem 
            href="/ai-analysis" 
            icon={<Brain size={16} />} 
            label="AI Analysis" 
            active={location === "/ai-analysis"} 
          />
          <SidebarNavItem 
            href="/settings" 
            icon={<Settings size={16} />} 
            label="Settings" 
            active={location === "/settings"} 
          />
        </nav>
      </div>
      
      <div className="p-4 border-t border-muted/30">
        <div className="flex items-center p-2 space-x-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">Test Pilot</p>
            <p className="text-xs text-muted-foreground">pilot@cryptopilot.ai</p>
          </div>
        </div>
      </div>
    </div>
  );
}
