import React, { useMemo, useState } from "react";
import {ConnectionProvider, WalletProvider} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import {WalletModalProvider} from "@solana/wallet-adapter-react-ui";
import Navbar from './components/layout/header';
import App from './App'
import {idl, network as rpc} from './rpc_config';


// Default styles that can be overridden by your app
require("@solana/wallet-adapter-react-ui/styles.css");

//WORKS!!!
const Dashboard = () => {
  const [balance, setBalance] = useState(null)
  const network = WalletAdapterNetwork.Devnet;
  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const customRPC = rpc;

  const wallets = useMemo(() => [new PhantomWalletAdapter()], [network]);

  return (
    <ConnectionProvider endpoint={customRPC}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
            <div className="App">
              <Navbar balance={balance} setBalance={setBalance}/>
              <App balance={balance} setBalance={setBalance}/>
            </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
export default Dashboard;
