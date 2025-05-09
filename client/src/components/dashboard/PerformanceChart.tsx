import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface PerformanceChartProps {
  data: any[];
  title: string;
  height?: number;
}

export function PerformanceChart({ 
  data = [], 
  title,
  height = 250 
}: PerformanceChartProps) {
  const [period, setPeriod] = useState<"1D" | "1W" | "1M" | "1Y">("1W");
  const [chartData, setChartData] = useState(data);
  
  useEffect(() => {
    // In a real app, you would fetch data based on the selected period
    // For this demo, we'll just use the same data but could adjust it based on period
    // This would be where you'd make an API call to get different time-period data
    setChartData(data);
  }, [period, data]);

  return (
    <Card className="border border-muted/30">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-space font-semibold">{title}</h3>
          <div className="flex space-x-2">
            <Button 
              variant={period === "1D" ? "default" : "secondary"} 
              size="sm"
              className={period === "1D" ? "bg-primary text-white" : "bg-muted/40 text-xs hover:bg-muted/60"}
              onClick={() => setPeriod("1D")}
            >
              1D
            </Button>
            <Button 
              variant={period === "1W" ? "default" : "secondary"} 
              size="sm"
              className={period === "1W" ? "bg-primary text-white" : "bg-muted/40 text-xs hover:bg-muted/60"}
              onClick={() => setPeriod("1W")}
            >
              1W
            </Button>
            <Button 
              variant={period === "1M" ? "default" : "secondary"} 
              size="sm"
              className={period === "1M" ? "bg-primary text-white" : "bg-muted/40 text-xs hover:bg-muted/60"}
              onClick={() => setPeriod("1M")}
            >
              1M
            </Button>
            <Button 
              variant={period === "1Y" ? "default" : "secondary"} 
              size="sm"
              className={period === "1Y" ? "bg-primary text-white" : "bg-muted/40 text-xs hover:bg-muted/60"}
              onClick={() => setPeriod("1Y")}
            >
              1Y
            </Button>
          </div>
        </div>
        
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 5, left: 10, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  borderColor: 'hsl(var(--border))',
                  color: 'white'
                }}
                labelStyle={{ color: 'white' }}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
                fillOpacity={1}
                fill="url(#colorPrice)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 flex justify-between text-xs text-muted-foreground">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>
      </CardContent>
    </Card>
  );
}
