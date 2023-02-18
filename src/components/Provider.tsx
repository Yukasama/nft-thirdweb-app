"use client";

import { ChainId, ThirdwebProvider } from "@thirdweb-dev/react";

type Props = {
  children: React.ReactNode;
};

export default function Provider({ children }: Props) {
  return (
    <ThirdwebProvider desiredChainId={ChainId.Rinkeby}>
      {children}
    </ThirdwebProvider>
  );
}
