import "../styles/globals.css";
import { ChainId, ThirdwebProvider } from "@thirdweb-dev/react";

const activeChainId = ChainId.Rinkeby;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThirdwebProvider desiredChainId={activeChainId}>
          {children}
        </ThirdwebProvider>
      </body>
    </html>
  );
}
