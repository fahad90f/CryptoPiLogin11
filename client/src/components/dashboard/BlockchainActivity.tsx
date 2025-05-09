import { Card, CardContent } from "@/components/ui/card";
import { MoreHorizontal, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BlockchainActivityProps {
  data: {
    name: string;
    percentage: number;
    color: string;
  }[];
  latestBlock: string;
}

export function BlockchainActivity({ data, latestBlock }: BlockchainActivityProps) {
  return (
    <Card className="border border-muted/30">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-space font-semibold">Blockchain Activity</h3>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
        
        <div className="space-y-4">
          {data.map((item, index) => (
            <div className="flex items-center" key={index}>
              <div className="w-1/3">
                <div className="text-xs text-muted-foreground mb-1">{item.name}</div>
                <div className="text-sm font-medium">{item.percentage.toFixed(1)}%</div>
              </div>
              <div className="w-2/3 h-2 bg-muted/40 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${item.color} rounded-full`} 
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-muted/30">
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-muted-foreground">Latest Block:</span>
              <span className="font-mono ml-2">{latestBlock}</span>
            </div>
            <span className="text-accent flex items-center">
              <span className="h-2 w-2 bg-accent rounded-full mr-1.5 animate-pulse-slow"></span>
              Live
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
