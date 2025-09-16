
import React from 'react';
import WalletConnector from './WalletConnector';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-900/50 backdrop-blur-sm py-4 border-b border-slate-700/50 sticky top-0 z-20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex-1"></div>
          <h1 className="text-2xl sm:text-3xl font-bold text-center flex-1">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Digital Twins Playground
            </span>
          </h1>
          <div className="flex-1 flex justify-end">
            <WalletConnector />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
