import { BlockfrostProvider, KoiosProvider } from "@meshsdk/core";

export function getProvider(network: number) {
  return new BlockfrostProvider(
      "preprodk84mo9IAoHcr1Ts2kKL1Qu2RVAZxYUlk"
  );
}
