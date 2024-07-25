import './App.scss'
import Navbar from "./components/Navbar/Navbar.jsx";
import Home from './pages/Home/Home.jsx'
import '@rainbow-me/rainbowkit/styles.css';
import {
    getDefaultConfig,
    RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { avalancheFuji } from 'wagmi/chains';
import {
    QueryClientProvider,
    QueryClient,
} from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const queryClient = new QueryClient();

function App() {
    const config = getDefaultConfig({
        appName: 'dNFTs | Nex Labs',
        projectId: '2d25ad86fa4e211e6690a3e7a1ca454e',
        chains: [avalancheFuji]
    });

    return (
      <WagmiProvider config={config}>
          <Navbar />
          <QueryClientProvider client={queryClient}>
              <RainbowKitProvider>
                  <Home />
                  <ToastContainer
                      position="bottom-right"
                      autoClose={5000}
                      hideProgressBar={false}
                      newestOnTop={true}
                      closeOnClick
                      rtl={false}
                      pauseOnFocusLoss={false}
                      draggable
                      pauseOnHover
                      theme="dark"
                  />
              </RainbowKitProvider>
          </QueryClientProvider>
      </WagmiProvider>
    )
}

export default App
