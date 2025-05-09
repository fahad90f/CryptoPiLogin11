import { useState } from "react";
import { useWeb3 } from "@/hooks/use-web3";
import { ethers } from "ethers";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Wallet, ArrowRight, AlertCircle } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { WalletConnect } from "./WalletConnect";

// Define the form schema with validation
const transferFormSchema = z.object({
  recipient: z
    .string()
    .min(42, {
      message: "Please enter a valid Ethereum address (42 characters).",
    })
    .regex(/^0x[a-fA-F0-9]{40}$/, {
      message: "Please enter a valid Ethereum address starting with 0x.",
    }),
  amount: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Please enter a valid amount greater than 0.",
    }),
});

type TransferFormValues = z.infer<typeof transferFormSchema>;

export function TransferTokens() {
  const { connected, account, provider, signer, balance } = useWeb3();
  const { toast } = useToast();
  const [isTransferring, setIsTransferring] = useState(false);

  // Initialize the form
  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
      recipient: "",
      amount: "",
    },
  });

  const handleTransfer = async (values: TransferFormValues) => {
    if (!connected || !account || !provider || !signer) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to transfer tokens.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsTransferring(true);
      
      // Convert the amount to wei (smallest unit of Ether)
      const amountInWei = ethers.parseEther(values.amount);
      
      // Check if the user has enough balance
      const walletBalance = await provider.getBalance(account);
      if (BigInt(walletBalance) < BigInt(amountInWei)) {
        toast({
          title: "Insufficient balance",
          description: "You don't have enough ETH to complete this transfer.",
          variant: "destructive",
        });
        setIsTransferring(false);
        return;
      }
      
      // Create a transaction object
      const tx = {
        to: values.recipient,
        value: amountInWei,
      };
      
      // Send the transaction
      // In ethers v6, the signer object directly has the sendTransaction method
      const transaction = await signer.sendTransaction(tx);
      
      toast({
        title: "Transaction Sent",
        description: "Your transfer has been submitted to the network.",
      });
      
      // Wait for confirmation
      const receipt = await transaction.wait(1);
      
      toast({
        title: "Transfer Complete",
        description: `Successfully transferred ${values.amount} ETH to ${values.recipient.slice(0, 6)}...${values.recipient.slice(-4)}`,
      });
      
      // Reset the form
      form.reset();
    } catch (error: any) {
      console.error("Transfer error:", error);
      toast({
        title: "Transfer Failed",
        description: error.message || "There was an error processing your transfer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTransferring(false);
    }
  };

  // Show connection prompt if not connected
  if (!connected || !account) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transfer Tokens</CardTitle>
          <CardDescription>
            Connect your wallet to transfer tokens to other addresses.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 py-8">
          <Wallet className="h-12 w-12 text-muted-foreground" />
          <p className="text-center text-muted-foreground">
            You need to connect a wallet to transfer tokens.
          </p>
          <WalletConnect />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transfer Tokens</CardTitle>
        <CardDescription>
          Send Ethereum or other tokens directly from your wallet.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4 border">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Be careful!</AlertTitle>
          <AlertDescription>
            Cryptocurrency transactions are irreversible. Double-check the recipient address before sending.
          </AlertDescription>
        </Alert>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleTransfer)} className="space-y-6">
            <FormField
              control={form.control}
              name="recipient"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient Address</FormLabel>
                  <FormControl>
                    <Input placeholder="0x..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the Ethereum address of the recipient.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="0.0" 
                        {...field} 
                        type="number"
                        step="0.00001"
                      />
                      <div className="absolute right-3 top-2 text-sm text-muted-foreground">
                        ETH
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Your balance: {balance} ETH
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                disabled={isTransferring}
                className="w-full md:w-auto"
              >
                {isTransferring ? (
                  "Processing Transfer..."
                ) : (
                  <span className="flex items-center gap-2">
                    Transfer <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}