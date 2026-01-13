import React from "react";

interface EnterCompetitionButtonProps {
  onClick: () => void;
}

export const EnterCompetitionButton: React.FC<EnterCompetitionButtonProps> = ({
  onClick,
}) => {
  return (
    <div className="absolute bottom-4 right-4 md:bottom-8 md:left-8 z-30">
      <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-1.5 md:gap-3 px-3 py-1.5 md:px-6 md:py-3 bg-white text-black border border-border hover:opacity-90 active:scale-95 transition-all shadow-lg"
        aria-label="Enter Competition"
      >
        <div className="coin-container">
          <div className="w-5 h-5 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-white to-gray-400 border-2 border-gray-300 shadow-md animate-spin-coin"></div>
        </div>
        <span className="text-[10px] md:text-sm font-semibold">
          Enter Competition
        </span>
      </button>
    </div>
  );
};
