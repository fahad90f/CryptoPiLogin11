import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Rocket, Shield, Zap } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CryptoIcon } from "@/components/ui/crypto-icon";

const blockchains = [
  { id: "ethereum", name: "Ethereum", type: "ERC-20" },
  { id: "binance", name: "Binance Smart Chain", type: "BEP-20" },
  { id: "tron", name: "Tron", type: "TRC-20" },
  { id: "solana", name: "Solana", type: "SPL" },
  { id: "polygon", name: "Polygon", type: "ERC-20" }
];

interface GenerateTokenFormProps {
  defaultCrypto?: { name: string; symbol: string };
}

export function GenerateTokenForm({ defaultCrypto = { name: "Tether", symbol: "USDT" } }: GenerateTokenFormProps) {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    cryptocurrency: defaultCrypto.name,
    symbol: defaultCrypto.symbol,
    amount: 1000,
    blockchain: "ethereum",
    useAI: true,
    securityLevel: 2, // 0 = Basic, 1 = Advanced, 2 = Military Grade
    confirmedCheck: false
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.confirmedCheck) {
      toast({
        title: "Confirmation required",
        description: "Please confirm that you understand the security implications.",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "Token generated successfully",
        description: `Generated ${formData.amount} ${formData.symbol} tokens on ${
          blockchains.find(b => b.id === formData.blockchain)?.name
        }.`,
        variant: "default"
      });
    }, 2500);
  };

  return (
    <Card className="border border-muted/30">
      <CardHeader>
        <CardTitle className="text-xl font-space">Generate Flash Tokens</CardTitle>
        <CardDescription>
          Create flash tokens with secure blockchain integration for testing purposes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleGenerate}>
          <div className="grid gap-6">
            <div className="grid gap-3">
              <div className="flex items-center space-x-3">
                <CryptoIcon symbol={formData.symbol} size="lg" />
                <div>
                  <h4 className="font-medium">{formData.cryptocurrency}</h4>
                  <p className="text-sm text-muted-foreground">{formData.symbol}</p>
                </div>
              </div>
            </div>
            
            <div className="grid gap-3">
              <Label htmlFor="amount">Token Amount</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                max="1000000"
                value={formData.amount}
                onChange={(e) => handleChange("amount", Number(e.target.value))}
                className="bg-muted/40 border border-muted/60"
              />
              <p className="text-sm text-muted-foreground">
                Maximum amount: 1,000,000 tokens
              </p>
            </div>
            
            <div className="grid gap-3">
              <Label htmlFor="blockchain">Blockchain Network</Label>
              <Select 
                value={formData.blockchain} 
                onValueChange={(value) => handleChange("blockchain", value)}
              >
                <SelectTrigger id="blockchain" className="bg-muted/40 border border-muted/60">
                  <SelectValue placeholder="Select Blockchain" />
                </SelectTrigger>
                <SelectContent>
                  {blockchains.map((blockchain) => (
                    <SelectItem key={blockchain.id} value={blockchain.id}>
                      {blockchain.name} ({blockchain.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                The blockchain network determines the token standard
              </p>
            </div>
            
            <div className="grid gap-3">
              <Label>Security Level</Label>
              <RadioGroup
                value={formData.securityLevel.toString()}
                onValueChange={(value) => handleChange("securityLevel", Number(value))}
                className="flex flex-col md:flex-row gap-3"
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-muted/60 hover:border-muted cursor-pointer">
                  <RadioGroupItem value="0" id="security-basic" />
                  <Label htmlFor="security-basic" className="cursor-pointer flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                    Basic
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-muted/60 hover:border-muted cursor-pointer">
                  <RadioGroupItem value="1" id="security-advanced" />
                  <Label htmlFor="security-advanced" className="cursor-pointer flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-primary" />
                    Advanced
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-primary/50 bg-primary/5 hover:border-primary cursor-pointer">
                  <RadioGroupItem value="2" id="security-military" />
                  <Label htmlFor="security-military" className="cursor-pointer flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-primary" />
                    Military Grade
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="flex items-center justify-between space-x-2 p-4 rounded-lg bg-primary/10 border border-primary/30">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-medium">AI-Enhanced Security</h4>
                  <p className="text-sm text-muted-foreground">Optimize token security with DeepSeek AI</p>
                </div>
              </div>
              <Switch
                checked={formData.useAI}
                onCheckedChange={(checked) => handleChange("useAI", checked)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="confirm"
                checked={formData.confirmedCheck}
                onCheckedChange={(checked) => handleChange("confirmedCheck", checked)}
              />
              <Label htmlFor="confirm" className="text-sm text-muted-foreground">
                I understand the security implications of generating flash tokens
              </Label>
            </div>
            
            <Button 
              type="submit"
              className="w-full"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <svg 
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    ></circle>
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-4 w-4" /> Generate Tokens
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
