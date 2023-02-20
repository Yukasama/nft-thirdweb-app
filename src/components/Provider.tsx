"use client";

import { ChainId, ThirdwebProvider } from "@thirdweb-dev/react";
import { Toaster } from "react-hot-toast";

type Props = {
  children: React.ReactNode;
};

export default function Provider({ children }: Props) {
  return (
    <ThirdwebProvider activeChain={ChainId.Goerli}>
      <Toaster position="top-right" />
      {children}
    </ThirdwebProvider>
  );
}
