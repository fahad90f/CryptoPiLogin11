import { Card, CardContent } from "@/components/ui/card";
import { formatCompactNumber, formatPercentage, getPercentageClass } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  change?: number;
  changePeriod?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  iconBgColor,
  iconColor,
  change,
  changePeriod = "vs last period"
}: StatsCardProps) {
  const formattedValue = typeof value === 'number' ? formatCompactNumber(value) : value;
  
  return (
    <Card className="border border-muted/30 hover:border-accent/50 transition-colors">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <h3 className="font-mono text-2xl font-bold">{formattedValue}</h3>
          </div>
          <div className={`p-2 rounded-lg ${iconBgColor}`}>
            <Icon className={`${iconColor} h-5 w-5`} />
          </div>
        </div>
        
        {typeof change !== 'undefined' && (
          <div className="flex items-center space-x-2">
            <span className={`flex items-center text-sm ${getPercentageClass(change)}`}>
              {change >= 0 ? (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor" 
                  className="w-4 h-4 mr-1"
                >
                  <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor" 
                  className="w-4 h-4 mr-1"
                >
                  <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
                </svg>
              )}
              {Math.abs(change).toFixed(1)}%
            </span>
            <span className="text-xs text-muted-foreground">{changePeriod}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
