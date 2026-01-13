import React from "react";
import { FIGURES } from "../../../constants";
import { TagOption } from "../../../types/app";

interface StepGuideProps {
  tagOptions: TagOption[];
}

export const StepGuide: React.FC<StepGuideProps> = ({ tagOptions }) => {
  return (
    <div className="mt-8 sm:mt-6 space-y-6 sm:space-y-8">
      {/* Step 1: Chat with a twin */}
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px] sm:text-xs font-semibold mt-0.5">
          1
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-neutral-900 font-medium mb-3 sm:mb-4">
            Chat with a twin
          </p>
          <div className="flex items-center -space-x-1.5 sm:-space-x-2">
            {FIGURES.slice(0, 6).map((figure, index) => (
              <div
                key={figure.id}
                className="relative w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full border-2 border-white overflow-hidden"
                style={{ zIndex: 10 - index }}
              >
                <img
                  src={figure.imageUrl}
                  alt={figure.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step 2: Download Out of Context card */}
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px] sm:text-xs font-semibold mt-0.5">
          2
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-neutral-900 font-medium mb-3 sm:mb-4">
            Download your Out of Context card
          </p>
          <div className="inline-block max-w-full">
            <button
              type="button"
              disabled
              className="relative flex gap-1.5 sm:gap-2 items-center py-1.5 sm:py-2 px-3 sm:px-4 border border-border bg-black text-white ring-1 ring-white/10 text-[10px] sm:text-xs md:text-sm pointer-events-none"
            >
              <div className="ph ph-[sparkle--duotone] text-white text-xs sm:text-sm flex-shrink-0" />
              <span className="whitespace-normal sm:whitespace-nowrap">
                Share Your Out of Context Card
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Step 3: Share to X with hashtags */}
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px] sm:text-xs font-semibold mt-0.5">
          3
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-neutral-900 font-medium mb-3 sm:mb-4">
            Share to X with one of the correct hashtags
          </p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {tagOptions.slice(0, 4).map((tag) => {
              const compact = tag.label
                .toUpperCase()
                .replace(/[^A-Z0-9]+/g, "");
              return (
                <span
                  key={tag.label}
                  className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs bg-neutral-100 border border-neutral-300 rounded"
                >
                  <span className="font-mono text-neutral-700 break-all">
                    #{tag.emoji}
                    {compact}
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
