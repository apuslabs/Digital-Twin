import React from "react";
import ArweaveOrbit from "../common/ArweaveOrbit";

interface EnterCompetitionButtonProps {
  onClick: () => void;
}

export const EnterCompetitionButton: React.FC<EnterCompetitionButtonProps> = ({
  onClick,
}) => {
  return (
    <div className="max-md:w-full max-md:mt-4 md:absolute bottom-4 right-4 lg:bottom-8 lg:left-8 z-30 flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={onClick}
        className="relative flex items-center gap-1.5 max-md:w-full lg:gap-3 px-3 py-1.5 lg:px-6 lg:py-3 bg-white/20 border border-border/20 text-white hover:opacity-90 active:scale-95 transition-[opacity,transform] duration-150"
        aria-label="Enter Competition"
      >
        {/* Corner brackets */}
        <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-white"></div>
        <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-white"></div>
        <div className="absolute bottom-0 left-0 w-1 h-1 border-b border-l border-white"></div>
        <div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-white"></div>

        <ArweaveOrbit />
        <span className="text-[10px] lg:text-sm ">
          Enter for a chance at $1300 in $AR
        </span>
      </button>
    </div>
  );
};
