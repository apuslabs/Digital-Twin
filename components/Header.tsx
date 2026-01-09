import React from "react";

const Header: React.FC<{ onLogoClick?: () => void; isHomePage?: boolean }> = ({ 
  onLogoClick,
  isHomePage = false
}) => {
  return (
    <header className="bg-white backdrop-blur-sm py-4 border-b border-border sticky top-0 z-20">
      <div className={`mx-auto px-4 ${
        isHomePage ? "max-w-[2000px]" : "container"
      }`}>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onLogoClick}
            className="select-none focus:outline-none hover:opacity-70 active:opacity-50 active:scale-95 transition-[transform, opacity] duration-150 ease-out-quart cursor-pointer"
            aria-label="Go to home"
            title="Home"
          >
            <img
              src="/resources/Twin_Logo.svg"
              width="75"
              height="24"
              alt="Digital Twin logo"
            />
          </button>

          <div className="flex-1 flex justify-end">
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
