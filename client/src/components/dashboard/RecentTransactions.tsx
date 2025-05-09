import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ArrowDown, ArrowLeftRight, Send } from "lucide-react";

interface Transaction {
  id: string;
  type: 'generate' | 'convert' | 'transfer';
  name: string;
  time: string;
  amount: string;
  status: 'complete' | 'pending' | 'failed';
  blockchain?: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  onViewAll: () => void;
}

export function RecentTransactions({ transactions, onViewAll }: RecentTransactionsProps) {
  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'generate':
        return (
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
            <ArrowDown className="text-green-500 h-4 w-4" />
          </div>
        );
      case 'convert':
        return (
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <ArrowLeftRight className="text-primary h-4 w-4" />
          </div>
        );
      case 'transfer':
        return (
          <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
            <Send className="text-destructive h-4 w-4" />
          </div>
        );
    }
  };
  
  const getStatusClass = (status: Transaction['status']) => {
    switch (status) {
      case 'complete':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'failed':
        return 'text-destructive';
    }
  };

  return (
    <Card className="border border-muted/30">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-space font-semibold">Recent Transactions</h3>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
        
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div 
              key={transaction.id}
              className="flex items-center justify-between p-3 bg-muted/10 rounded-lg hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-center space-x-3">
                {getTransactionIcon(transaction.type)}
                <div>
                  <div className="font-medium">{transaction.name}</div>
                  <div className="text-xs text-muted-foreground">{transaction.time}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono font-medium">{transaction.amount}</div>
                <div className={`text-xs ${getStatusClass(transaction.status)}`}>
                  {transaction.status === 'complete' && 'Complete'}
                  {transaction.status === 'pending' && 'Pending'}
                  {transaction.status === 'failed' && 'Failed'}
                  {transaction.blockchain && ` • ${transaction.blockchain}`}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <Button 
          variant="link" 
          className="w-full mt-4 py-2 text-sm text-primary"
          onClick={onViewAll}
        >
          View All Transactions
        </Button>
      </CardContent>
    </Card>
  );
}
