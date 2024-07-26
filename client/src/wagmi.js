import { http, createConfig } from 'wagmi';
import { avalancheFuji } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import {rpcUrl} from "./constants/constants.js";

export const config = createConfig({
  chains: [avalancheFuji],
  connectors: [ injected() ],
  transports: {
    [avalancheFuji.id]: http(rpcUrl),
  },
});