import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Rocket, ArrowLeftRight, Filter } from "lucide-react";
import { CryptoIcon } from "@/components/ui/crypto-icon";
import { getPercentageClass } from "@/lib/utils";

export interface CryptoData {
  id: number;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  change7d: number;
  marketCap: number;
  isDefault?: boolean;
}

interface CryptoTableProps {
  data: CryptoData[];
  onGenerate: (crypto: CryptoData) => void;
  onConvert: (crypto: CryptoData) => void;
}

export function CryptoTable({ data, onGenerate, onConvert }: CryptoTableProps) {
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const filteredData = data.filter(crypto => 
    crypto.name.toLowerCase().includes(filter.toLowerCase()) || 
    crypto.symbol.toLowerCase().includes(filter.toLowerCase())
  );
  
  const pageCount = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Card className="border border-muted/30">
      <CardHeader className="p-5 border-b border-muted/30 flex-row justify-between items-center space-y-0">
        <h3 className="font-space font-semibold">Top Cryptocurrencies</h3>
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Filter tokens"
            className="w-40 md:w-auto bg-muted/40 border border-muted/60"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <Button variant="secondary" size="icon" className="bg-muted/40 border border-muted/60 hover:bg-muted/60">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto custom-scrollbar">
          <Table className="min-w-[800px]">
            <TableHeader className="bg-muted/20">
              <TableRow>
                <TableHead className="text-muted-foreground">#</TableHead>
                <TableHead className="text-muted-foreground">Name</TableHead>
                <TableHead className="text-muted-foreground">Price</TableHead>
                <TableHead className="text-muted-foreground">24h %</TableHead>
                <TableHead className="text-muted-foreground">7d %</TableHead>
                <TableHead className="text-muted-foreground">Market Cap</TableHead>
                <TableHead className="text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((crypto) => (
                <TableRow 
                  key={crypto.id} 
                  className={`border-b border-muted/20 hover:bg-muted/10 ${crypto.isDefault ? 'bg-primary/5' : ''}`}
                >
                  <TableCell className="font-mono text-sm">{crypto.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <CryptoIcon symbol={crypto.symbol} />
                      <div>
                        <div className="font-medium">{crypto.name}</div>
                        <div className="text-xs text-muted-foreground">{crypto.symbol}</div>
                      </div>
                      {crypto.isDefault && (
                        <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full border border-primary/50">
                          Default
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">${crypto.price.toLocaleString()}</TableCell>
                  <TableCell className={getPercentageClass(crypto.change24h)}>
                    {crypto.change24h > 0 ? '+' : ''}{crypto.change24h.toFixed(2)}%
                  </TableCell>
                  <TableCell className={getPercentageClass(crypto.change7d)}>
                    {crypto.change7d > 0 ? '+' : ''}{crypto.change7d.toFixed(2)}%
                  </TableCell>
                  <TableCell className="font-mono">${(crypto.marketCap / 1e9).toFixed(1)}B</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={crypto.isDefault 
                          ? "bg-primary text-white hover:bg-primary/90" 
                          : "bg-primary/20 text-primary hover:bg-primary/30"}
                        onClick={() => onGenerate(crypto)}
                      >
                        <Rocket className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="bg-muted/40 text-muted-foreground hover:bg-muted/60"
                        onClick={() => onConvert(crypto)}
                      >
                        <ArrowLeftRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 border-t border-muted/30 flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Showing {paginatedData.length} of {filteredData.length} cryptocurrencies
        </div>
        <div className="flex space-x-1">
          <Button 
            variant="outline" 
            size="icon" 
            className="w-8 h-8 bg-muted/40 border border-muted/60"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
            </svg>
          </Button>
          
          {Array.from({ length: Math.min(3, pageCount) }, (_, i) => (
            <Button
              key={i + 1}
              variant={currentPage === i + 1 ? "default" : "outline"}
              size="icon"
              className={`w-8 h-8 ${
                currentPage === i + 1 
                  ? "bg-primary text-white" 
                  : "bg-muted/40 border border-muted/60"
              }`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
          
          {pageCount > 3 && (
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 bg-muted/40 border border-muted/60"
              disabled
            >
              ...
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="icon" 
            className="w-8 h-8 bg-muted/40 border border-muted/60"
            onClick={() => setCurrentPage(p => Math.min(pageCount, p + 1))}
            disabled={currentPage === pageCount}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
