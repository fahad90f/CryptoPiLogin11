import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Bot, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface Insight {
  id: string;
  title: string;
  time: string;
  description: string;
  metric: string;
  metricValue: string;
  action: string;
  borderColor: string;
}

interface AIInsightsProps {
  insights: Insight[];
}

export function AIInsights({ insights }: AIInsightsProps) {
  const [question, setQuestion] = useState("");
  
  const handleAskAI = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the question to an AI API
    console.log("Asking AI:", question);
    setQuestion("");
  };

  return (
    <Card className="border border-muted/30">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-space font-semibold">DeepSeek AI Insights</h3>
          <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full border border-primary/50">
            <Brain className="h-3 w-3 inline mr-1" /> AI
          </span>
        </div>
        
        <div className="space-y-3">
          {insights.map((insight) => (
            <div 
              key={insight.id}
              className={`p-3 bg-muted/10 rounded-lg hover:bg-muted/20 transition-colors border-l-2 ${insight.borderColor}`}
            >
              <div className="flex justify-between items-start">
                <h4 className="font-medium mb-1">{insight.title}</h4>
                <span className="text-xs text-muted-foreground">{insight.time}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
              <div className="flex justify-between">
                <div className={`text-xs font-medium ${insight.borderColor.replace('border-', 'text-')}`}>
                  {insight.metric}: {insight.metricValue}
                </div>
                <Button variant="link" className="text-xs text-primary p-0 h-auto">
                  {insight.action}
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Bot className="text-primary h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="font-medium mb-1">Ask DeepSeek AI Assistant</div>
              <form onSubmit={handleAskAI} className="relative">
                <Input
                  type="text"
                  placeholder="Ask about crypto trends, security, or token strategies..."
                  className="w-full py-2 pl-3 pr-10 bg-muted/40 border border-muted/60"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
                <Button 
                  type="submit" 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary h-8 w-8 p-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
