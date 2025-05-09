import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserProvider, JsonRpcProvider } from 'ethers';
import { Web3ReactProvider, useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import { ethers } from 'ethers';
import { useToast } from '@/hooks/use-toast';

// Define supported chain IDs (Ethereum Mainnet, BSC, Polygon, Arbitrum, Optimism)
const supportedChainIds = [1, 56, 137, 42161, 10];

// Create injected connector for MetaMask and other injected wallets
export const injected = new InjectedConnector({
  supportedChainIds,
});

// Define wallet types
export enum WalletType {
  MetaMask = 'MetaMask',
  TrustWallet = 'Trust Wallet',
  Unknown = 'Unknown'
}

type Web3ContextType = {
  account: string | null;
  chainId: number | undefined;
  active: boolean;
  library: BrowserProvider | undefined;
  connectWallet: (walletType: WalletType) => Promise<void>;
  disconnectWallet: () => void;
  walletType: WalletType;
  balance: string;
  ensName: string | null;
  isConnecting: boolean;
};

export const Web3Context = createContext<Web3ContextType | undefined>(undefined);

// Helper function to get Ethereum from window
export function getEthereum(): any {
  if (typeof window !== 'undefined' && window.ethereum) {
    return window.ethereum;
  }
  return null;
}

// Helper function to detect wallet type
function detectWalletType(): WalletType {
  const ethereum = getEthereum();
  if (!ethereum) return WalletType.Unknown;
  
  if (ethereum.isTrust) return WalletType.TrustWallet;
  if (ethereum.isMetaMask) return WalletType.MetaMask;
  
  return WalletType.Unknown;
}

function getLibrary(provider: any): BrowserProvider {
  const library = new BrowserProvider(provider);
  return library;
}

export function Web3ContextProvider({ children }: { children: React.ReactNode }) {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ProviderInternal>{children}</Web3ProviderInternal>
    </Web3ReactProvider>
  );
}

function Web3ProviderInternal({ children }: { children: React.ReactNode }) {
  const { active, account, library, chainId, activate, deactivate } = useWeb3React<BrowserProvider>();
  const [walletType, setWalletType] = useState<WalletType>(WalletType.Unknown);
  const [balance, setBalance] = useState<string>('0');
  const [ensName, setEnsName] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const { toast } = useToast();

  // Connect to wallet
  const connectWallet = async (type: WalletType) => {
    if (active) return;

    setIsConnecting(true);
    try {
      // All injected wallets use the injected connector
      await activate(injected, undefined, true);
      setWalletType(type);
      
      toast({
        title: 'Wallet Connected',
        description: `Successfully connected to ${type}`,
      });
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      toast({
        title: 'Connection Failed',
        description: 'Could not connect to wallet. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    try {
      deactivate();
      setWalletType(WalletType.Unknown);
      toast({
        title: 'Wallet Disconnected',
        description: 'Your wallet has been disconnected.',
      });
    } catch (error: any) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  // Get account balance when connected
  useEffect(() => {
    async function updateBalance() {
      if (active && library && account) {
        try {
          const balance = await library.getBalance(account);
          const etherBalance = parseFloat(
            ethers.formatEther(balance)
          ).toFixed(4);
          setBalance(etherBalance);
          
          // Try to get ENS name if on mainnet
          if (chainId === 1) {
            try {
              const name = await library.lookupAddress(account);
              if (name) setEnsName(name);
            } catch (error) {
              console.log("Error getting ENS name:", error);
              setEnsName(null);
            }
          }
        } catch (error) {
          console.log("Error getting balance:", error);
          setBalance('0');
        }
      } else {
        setBalance('0');
        setEnsName(null);
      }
    }
    
    updateBalance();
  }, [active, library, account, chainId]);

  // Auto-detect wallet on mount
  useEffect(() => {
    const detectedType = detectWalletType();
    setWalletType(detectedType);
    
    // Auto-connect if the user was previously connected
    if (window.localStorage.getItem('isWalletConnected') === 'true') {
      connectWallet(detectedType);
    }
  }, []);

  // Save connection state
  useEffect(() => {
    if (active) {
      window.localStorage.setItem('isWalletConnected', 'true');
    } else {
      window.localStorage.removeItem('isWalletConnected');
    }
  }, [active]);

  // Listen for account changes
  useEffect(() => {
    const ethereum = getEthereum();
    if (!ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0 && active) {
        window.location.reload();
      }
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, [active]);

  // Listen for chain changes
  useEffect(() => {
    const ethereum = getEthereum();
    if (!ethereum) return;

    const handleChainChanged = () => {
      window.location.reload();
    };

    ethereum.on('chainChanged', handleChainChanged);
    return () => {
      ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  const value = {
    account,
    chainId,
    active,
    library,
    connectWallet,
    disconnectWallet,
    walletType,
    balance,
    ensName,
    isConnecting,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

export function useWeb3Context() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3Context must be used within a Web3ContextProvider');
  }
  return context;
}