import React from "react";

interface ChecklistItemProps {
  id: number;
  icon: string;
  iconColor: string;
  title: string;
  description: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export const ChecklistItem: React.FC<ChecklistItemProps> = ({
  icon,
  iconColor,
  title,
  description,
  isExpanded,
  onToggle,
}) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="group relative flex items-center min-h-[44px] gap-3 border border-border bg-white p-4 sm:p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] cursor-pointer text-left overflow-hidden hover:bg-neutral-50 active:bg-neutral-50 touch-manipulation hover:border-neutral-300 active:border-neutral-300 transition-[background-color,border-color] duration-200 ease focus-visible:outline-2 focus-visible:outline-neutral-400 focus-visible:outline-offset-2"
    >
      <div
        className={`flex h-8 w-8 sm:h-6 sm:w-6 shrink-0 items-center justify-center transition-[color,transform] duration-200 ease-out will-change-transform group-hover:-translate-y-0.5 group-hover:scale-110 group-active:scale-105 ${
          isExpanded ? iconColor : "text-neutral-600"
        }`}
      >
        <span className={`ph ${icon} text-[16px] sm:text-[18px]`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] sm:text-[11px] uppercase tracking-wide text-neutral-500">
          {title}
        </p>
        <div
          className={`grid overflow-hidden will-change-[grid-template-rows,opacity,filter] ${
            isExpanded ? "opacity-100 blur-0" : "opacity-0 blur-[2px]"
          }`}
          style={{
            gridTemplateRows: isExpanded ? "1fr" : "0fr",
            transition:
              "grid-template-rows 200ms cubic-bezier(.165, .84, .44, 1), opacity 200ms cubic-bezier(.165, .84, .44, 1), filter 100ms cubic-bezier(.165, .84, .44, 1)",
          }}
        >
          <div className="min-h-0 pt-2 border-t border-neutral-200">
            <p className="text-xs text-neutral-600 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center min-w-[24px] min-h-[24px] sm:min-w-0 sm:min-h-0">
        <svg
          className={`w-5 h-5 sm:w-4 sm:h-4 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </button>
  );
};
