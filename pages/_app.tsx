import "tailwindcss/tailwind.css";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import React, { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  BackpackWalletAdapter,
  BraveWalletAdapter,
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  SolletExtensionWalletAdapter,
  SolletWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { QueryClient, QueryClientProvider } from "react-query";
import { Toaster } from "react-hot-toast";
// import { getGenesysGoToken, tokenAuthFetchMiddleware } from "src/config/rpc";
import { Commitment } from "@solana/web3.js";
import "react-datetime/css/react-datetime.css";
// Default styles that can be overridden by your app
require("@solana/wallet-adapter-react-ui/styles.css");

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const App = ({ Component, pageProps }: AppProps) => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Mainnet;

  const endpoint = "https://rest-api.hellomoon.io/v0/rpc";
  const config = {
    commitment: "confirmed" as Commitment,
    httpHeaders: {
      "Authorization": "Bearer 3bd84347-2f2a-4be2-9653-bf99cce560c0"
    }
  };

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new BackpackWalletAdapter(),
      new BraveWalletAdapter(),
      new LedgerWalletAdapter(),
      new SolletWalletAdapter({ network }),
      new SolletExtensionWalletAdapter({ network }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [network]
  );
  return (
    <ConnectionProvider endpoint={endpoint} config={config}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <QueryClientProvider client={queryClient}>
            <Component {...pageProps} />
            <Toaster position="bottom-center" />
          </QueryClientProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
