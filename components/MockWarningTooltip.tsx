import React from "react";
import { createPortal } from "react-dom";
import { useTooltipPosition } from "../hooks/useTooltipPosition";

interface MockWarningTooltipProps {
  show: boolean;
  anchorRef: React.RefObject<HTMLElement>;
}

export const MockWarningTooltip: React.FC<MockWarningTooltipProps> = ({
  show,
  anchorRef,
}) => {
  const position = useTooltipPosition(anchorRef, show);

  if (!show || !position) return null;

  const tooltipContent = (
    <div
      data-popup="mock-warning"
      className="fixed z-[9999] pointer-events-none animate-fade-in"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: "translate(-50%, -100%)",
      }}
    >
      <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg border-2 border-red-600 whitespace-nowrap relative mb-2">
        <p className="text-sm font-semibold">
          Hey twin this is a mock and not real, keep reading
        </p>
        {/* Arrow pointing down */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-full w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-red-500" />
      </div>
    </div>
  );

  // Render tooltip in a portal at document.body level
  return createPortal(tooltipContent, document.body);
};
