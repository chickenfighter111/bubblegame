import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './walletProvider';
import { MoralisProvider } from "react-moralis";

import 'bootstrap/dist/css/bootstrap.min.css';


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <MoralisProvider
      initializeOnMount={true}
      appId="86ha91JwUR7VM6lfPRFQkNXJtzN7o281WJ5Os1Ms"
      serverUrl="https://hes2okeagzok.usemoralis.com:2053/server"
    >
     <App />
    </MoralisProvider>
  </React.StrictMode>
);