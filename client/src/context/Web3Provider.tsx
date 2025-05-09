import React, { createContext, useContext } from 'react';
import { useEthWallet, WalletType } from '@/hooks/use-eth-wallet';
import { BrowserProvider, JsonRpcSigner } from 'ethers';

type Web3ContextType = {
  account: string | null;
  chainId: number | null;
  connected: boolean;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  connectWallet: (walletType: WalletType) => Promise<void>;
  disconnectWallet: () => void;
  walletType: WalletType;
  balance: string;
  ensName: string | null;
  connecting: boolean;
};

export const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const {
    account,
    chainId,
    provider,
    signer,
    connected,
    connecting,
    walletType,
    balance,
    ensName,
    connectWallet,
    disconnectWallet
  } = useEthWallet();

  const value = {
    account,
    chainId,
    connected,
    provider,
    signer,
    connectWallet,
    disconnectWallet,
    walletType,
    balance,
    ensName,
    connecting,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}