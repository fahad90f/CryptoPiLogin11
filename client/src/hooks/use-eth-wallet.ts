import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider, JsonRpcSigner, ethers } from 'ethers';

// Define ethereum interface for window
declare global {
  interface Window {
    ethereum?: any;
  }
}

export enum WalletType {
  MetaMask = 'MetaMask',
  TrustWallet = 'Trust Wallet',
  Unknown = 'Unknown'
}

export interface WalletState {
  account: string | null;
  chainId: number | null;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  connected: boolean;
  connecting: boolean;
  walletType: WalletType;
  balance: string;
  ensName: string | null;
}

export function useEthWallet() {
  // Initialize without toast to avoid circular dependencies
  const [walletState, setWalletState] = useState<WalletState>({
    account: null,
    chainId: null,
    provider: null,
    signer: null,
    connected: false,
    connecting: false,
    walletType: WalletType.Unknown,
    balance: '0',
    ensName: null
  });

  // Helper function to get Ethereum from window
  const getEthereum = useCallback((): any => {
    if (typeof window !== 'undefined' && window.ethereum) {
      return window.ethereum;
    }
    return null;
  }, []);

  // Helper function to detect wallet type
  const detectWalletType = useCallback((): WalletType => {
    const ethereum = getEthereum();
    if (!ethereum) return WalletType.Unknown;
    
    if (ethereum.isTrust) return WalletType.TrustWallet;
    if (ethereum.isMetaMask) return WalletType.MetaMask;
    
    return WalletType.Unknown;
  }, [getEthereum]);

  // Update account info
  const updateAccountInfo = useCallback(async () => {
    const ethereum = getEthereum();
    if (!ethereum) return;

    try {
      const provider = new BrowserProvider(ethereum);
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      
      // Get accounts
      const accounts = await provider.send('eth_accounts', []);
      const account = accounts[0] || null;
      
      // Only continue if we have an account
      if (!account) {
        setWalletState(prev => ({
          ...prev,
          connected: false,
          account: null,
          chainId: null,
          provider: null,
          signer: null,
          balance: '0',
          ensName: null
        }));
        return;
      }
      
      // Get signer
      const signer = await provider.getSigner();
      
      // Get balance
      const balance = await provider.getBalance(account);
      const etherBalance = parseFloat(ethers.formatEther(balance)).toFixed(4);
      
      // Try to get ENS name if on mainnet
      let ensName = null;
      if (chainId === 1) {
        try {
          ensName = await provider.lookupAddress(account);
        } catch (error) {
          console.log("Error getting ENS name:", error);
        }
      }
      
      setWalletState(prev => ({
        ...prev,
        account,
        chainId,
        provider,
        signer,
        connected: true,
        balance: etherBalance,
        ensName,
        walletType: detectWalletType()
      }));
      
      // Store connection state
      localStorage.setItem('isWalletConnected', 'true');
    } catch (error) {
      console.error('Error updating account info:', error);
      setWalletState(prev => ({
        ...prev,
        connected: false
      }));
    }
  }, [getEthereum, detectWalletType]);

  // Connect wallet
  const connectWallet = useCallback(async (type: WalletType) => {
    const ethereum = getEthereum();
    if (!ethereum) {
      console.error('No wallet found');
      return;
    }
    
    setWalletState(prev => ({ ...prev, connecting: true }));
    
    try {
      // Request accounts
      await ethereum.request({ method: 'eth_requestAccounts' });
      
      // Update account info
      await updateAccountInfo();
      
      console.log(`Successfully connected to ${type}`);
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      setWalletState(prev => ({ 
        ...prev, 
        connected: false,
        connecting: false
      }));
    } finally {
      setWalletState(prev => ({ ...prev, connecting: false }));
    }
  }, [getEthereum, updateAccountInfo]);
  
  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    localStorage.removeItem('isWalletConnected');
    setWalletState({
      account: null,
      chainId: null,
      provider: null,
      signer: null,
      connected: false,
      connecting: false,
      walletType: WalletType.Unknown,
      balance: '0',
      ensName: null
    });
    
    console.log('Wallet disconnected');
  }, []);

  // Auto connect if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      if (localStorage.getItem('isWalletConnected') === 'true') {
        const walletType = detectWalletType();
        await connectWallet(walletType);
      }
    };
    
    autoConnect();
  }, [detectWalletType, connectWallet]);
  
  // Listen for account changes
  useEffect(() => {
    const ethereum = getEthereum();
    if (!ethereum) return;
    
    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected
        disconnectWallet();
      } else {
        // Account changed, update info
        await updateAccountInfo();
      }
    };
    
    const handleChainChanged = () => {
      // Chain changed, reload the page
      window.location.reload();
    };
    
    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);
    
    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [getEthereum, disconnectWallet, updateAccountInfo]);

  return {
    ...walletState,
    connectWallet,
    disconnectWallet
  };
}