import React from "react";
import ArweaveOrbit from "../common/ArweaveOrbit";

interface EnterCompetitionButtonProps {
  onClick: () => void;
}

export const EnterCompetitionButton: React.FC<EnterCompetitionButtonProps> = ({
  onClick,
}) => {
  return (
    <div className="absolute bottom-4 right-4 md:bottom-8 md:left-8 z-30 flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={onClick}
        className="relative flex items-center gap-1.5 md:gap-3 px-3 py-1.5 md:px-6 md:py-3 border border-border/20 text-white hover:opacity-90 active:scale-95 transition-[opacity,transform] duration-150"
        aria-label="Enter Competition"
      >
        {/* Corner brackets */}
        <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-white"></div>
        <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-white"></div>
        <div className="absolute bottom-0 left-0 w-1 h-1 border-b border-l border-white"></div>
        <div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-white"></div>

        <ArweaveOrbit />
        <span className="text-[10px] md:text-sm ">1000 $AR Prize Pool</span>
      </button>
    </div>
  );
};
