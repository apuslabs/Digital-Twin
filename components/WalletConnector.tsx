import React from "react";
import { useConnection, useActiveAddress } from "@arweave-wallet-kit/react";
import { ConnectButton } from "@arweave-wallet-kit/react"; // Import the button

export default function WalletConnector() {
  const { connected } = useConnection();
  const activeAddress = useActiveAddress();

  return (
    <div className="flex gap-2">
      <ConnectButton
        profileModal={true}
        showBalance={false}
        style={{
          padding: 0,
          backgroundColor: "white",
          border: "1px solid #e0e0e0",
          color: "black",
        }}
      />
    </div>
  );
}
