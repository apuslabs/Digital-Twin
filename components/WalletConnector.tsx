import React from 'react';
import { useConnection, useActiveAddress } from '@arweave-wallet-kit/react';
import { ConnectButton } from '@arweave-wallet-kit/react'; // Import the button

export default function WalletConnector() {
  const { connected } = useConnection();
  const activeAddress = useActiveAddress();

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 rounded-lg p-3 min-w-[200px]">
      <ConnectButton profileModal={true} showBalance={false} />
      {connected && (
        <div className="mt-2 text-xs text-slate-300">
          <p className="truncate">
            <span className="text-slate-400">Address:</span> {activeAddress?.substring(0, 8)}...{activeAddress?.substring(activeAddress.length - 4)}
          </p>
        </div>
      )}
    </div>
  );
}