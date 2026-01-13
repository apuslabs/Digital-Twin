import React from "react";
import { TagOption } from "../types/app";
import { XPostMock } from "./XPostMock";
import { EnterCompetitionButton } from "./EnterCompetitionButton";

const dreamVideoUrl = new URL(
  "../resources/videos/Main_Web-banner-alt.mp4",
  import.meta.url
).href;

interface ContestBannerProps {
  tagOptions: TagOption[];
  onNavigateToCompetition: () => void;
}

export const ContestBanner: React.FC<ContestBannerProps> = ({
  tagOptions,
  onNavigateToCompetition,
}) => {
  return (
    <div
      className="group flex flex-col relative overflow-hidden p-4 md:p-8
      ring-1 ring-white/10 bg-black border border-border transition-transform duration-150 ease-out-quart animate-fade-in gap-4 md:gap-8"
    >
      <div className="absolute top-0 left-0 w-full z-[11]">
        <video
          src={dreamVideoUrl}
          autoPlay
          muted
          loop
          playsInline
          className="h-[180px] md:h-[360px] w-full object-cover object-left opacity-30 grayscale scale-150"
          aria-label="Network is dreaming"
        />
      </div>
      <EnterCompetitionButton onClick={onNavigateToCompetition} />
      {/* Mock X Post - Hidden on mobile */}
      <div
        className="hidden md:block absolute top-8 right-8 z-[15] pointer-events-none overflow-hidden w-[600px] 2xl:w-[660px] transition-[filter,transform,opacity] duration-300 ease-out scale-[0.64] opacity-80 grayscale group-hover:grayscale-0 lg:scale-[0.77] lg:opacity-90 xl:scale-[0.91] xl:opacity-95 2xl:scale-100 origin-left"
        style={{
          maskImage: `
            linear-gradient(to right, transparent 0%, black 1.5%, black 98.5%, transparent 100%),
            linear-gradient(to bottom, transparent 0%, black 1%, black 99%, transparent 100%)
          `,
          WebkitMaskImage: `
            linear-gradient(to right, transparent 0%, black 1.5%, black 98.5%, transparent 100%),
            linear-gradient(to bottom, transparent 0%, black 1%, black 99%, transparent 100%)
          `,
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      >
        <XPostMock tagOptions={tagOptions} />
      </div>
      <div className="mb-20 md:mb-40 z-20">
        <div className="flex flex-col md:flex-row md:justify-between gap-4 md:gap-6 w-full">
          <div className="text-white">
            <h2 className="font-bold scale-y-125 text-sm sm:text-lg xl:text-2xl">
              Out of Context Contest
            </h2>
            <p className="mt-4 text-xs sm:text-sm max-w-lg">
              Chat with a Digital Twin and share your most out of context
              moments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
