import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";

export function AiBanner() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/80 to-destructive/80 p-6 mb-6">
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
        <div className="mb-4 md:mb-0">
          <h3 className="text-xl font-space font-bold mb-2">Unlock Advanced AI Capabilities</h3>
          <p className="text-white/80 mb-3">DeepSeek's neural networks can enhance your token generation by 47% and improve security protocols.</p>
          <Button className="py-2 px-4 bg-white text-primary font-medium rounded-lg hover:bg-white/90">
            Activate DeepSeek Engine
          </Button>
        </div>
        <div className="w-20 h-20 md:w-32 md:h-32 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
          <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-white/20 flex items-center justify-center animate-pulse-slow">
            <Brain className="h-8 w-8 md:h-10 md:w-10 text-white" />
          </div>
        </div>
      </div>
      
      {/* Background orbital paths */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] border border-white/30 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] border border-white/30 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-1/2 left-1/2 w-[200px] h-[200px] border border-white/30 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>
    </div>
  );
}
