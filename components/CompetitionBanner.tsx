import React from "react";

interface CompetitionBannerProps {
  onNavigate: () => void;
}

const CompetitionBanner: React.FC<CompetitionBannerProps> = ({
  onNavigate,
}) => {
  return (
    <div
      className="flex flex-col relative overflow-hidden p-8 cursor-context-menu
      ring-1 ring-white/10 bg-white border border-border transition-transform duration-150 ease-out-quart hover:scale-[1.01] animate-fade-in gap-8"
      onClick={onNavigate}
    >
      <div className="absolute top-0 left-0 w-full z-10">
        <img
          src="/resources/UI_loop.gif"
          className="h-[300px] w-full object-cover object-[20%_65%] opacity-20 invert"
          aria-label="Twin animation"
        />
      </div>
      <div className="mb-24 z-20">
        <div className="flex justify-between gap-6 w-full">
          <div>
            <h2 className="font-bold scale-y-125 text-lg">
              AI-Judged Data Competition
            </h2>
            <p className="mt-1 max-w-lg">
              Submit data contributions judged by advanced AI agents.
              Top-quality submissions permanently stored on Arweave earn APUS
              token rewards.
            </p>
          </div>

          <button
            className="inline-flex items-center justify-center shrink-0 border border-border px-5 py-2.5
          bg-neutral-100
          ring-1 ring-inset ring-white/20
          backdrop-blur
          transition-colors duration-200 ease-out-quart rounded-full"
          >
            Contribute Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompetitionBanner;
