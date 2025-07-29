import { http, createConfig, injected } from "wagmi";
import { baseSepolia, morphHolesky } from "wagmi/chains";

export const wagmiConfig = createConfig({
  chains: [morphHolesky],
  connectors: [injected()],
  transports: {
    [morphHolesky.id]: http(),
  },
});
