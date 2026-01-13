import React from "react";

interface TimelineItem {
  title: string;
  detail: string;
}

interface TimelineSectionProps {
  items: TimelineItem[];
}

export const TimelineSection: React.FC<TimelineSectionProps> = ({ items }) => {
  return (
    <div className="mt-4 relative">
      <div>
        {items.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === items.length - 1;

          return (
            <div
              key={item.title}
              className={`relative pl-8 sm:pl-10 ${
                !isLast ? "pb-2 sm:pb-3" : ""
              }`}
            >
              {/* Rail segments */}
              {!isFirst && (
                <div className="absolute left-[8px] sm:left-[10px] top-0 h-[20px] sm:h-[26px] w-px bg-border z-0" />
              )}
              {!isLast && (
                <div className="absolute left-[8px] sm:left-[10px] top-[20px] sm:top-[26px] bottom-0 w-px bg-border z-0" />
              )}

              {/* Step marker */}
              <div className="absolute left-0 top-3 sm:top-4 z-10 flex h-5 w-5 sm:h-5 sm:w-5 items-center justify-center bg-neutral-900 text-[9px] sm:text-[10px] font-semibold text-white">
                {index + 1}
              </div>

              <div className="border border-border bg-white/80 p-3 sm:p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
                <p className="text-xs sm:text-xs font-semibold text-neutral-900 leading-tight">
                  {item.title}
                </p>
                <p className="mt-1 text-xs sm:text-xs text-neutral-700">
                  {item.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
