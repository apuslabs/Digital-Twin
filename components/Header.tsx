import React from "react";
import WalletConnector from "./WalletConnector";

const Header: React.FC = () => {
  return (
    <header className="bg-white backdrop-blur-sm py-4 border-b border-border sticky top-0 z-20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <img
            src="/resources/Twin_Logo.svg"
            width="75"
            height="24"
            alt="Digital Twin logo"
            className="select-none"
          />

          <div className="flex-1 flex justify-end">
            <WalletConnector />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
