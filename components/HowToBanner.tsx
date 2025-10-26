import React from "react";

interface HowToBannerProps {
  onStartRandom: () => void;
}

const HowToBanner: React.FC<HowToBannerProps> = ({ onStartRandom }) => {
  return (
    <div
      className="flex flex-col relative overflow-hidden p-8
      ring-1 ring-white/10 bg-white border border-border transition-transform duration-150 ease-out-quart animate-fade-in gap-8"
    >
      <div className="absolute top-0 left-0 w-full z-10">
        <img
          src="/resources/UI_loop.gif"
          className="h-[400px] w-full object-cover object-[20%_65%] opacity-20 invert"
          aria-label="Twin animation"
        />
      </div>
      {/* Right-side overlay image occupying half of the banner */}
      <div className="absolute right-8 top-0 w-1/2 z-20 pointer-events-none">
        <img
          src="/resources/screens_share.png"
          alt="Screens preview"
          className="w-full h-full object-contain"
          aria-hidden="true"
        />
      </div>
      {/* Bottom-left action button */}
      <div className="absolute bottom-4 left-4 z-30">
        <button
          type="button"
          aria-label="Start Talking to Twin"
          className="inline-flex items-center gap-2 border border-border bg-black text-white px-4 py-2 text-xs sm:text-sm ring-1 ring-inset ring-white/20 hover:opacity-90 active:scale-95 transition"
          onClick={(e) => {
            e.stopPropagation();
            onStartRandom();
          }}
        >
          <span className="ph ph-[paper-plane-tilt]" aria-hidden></span>
          <span>Start Talking to Twin</span>
        </button>
      </div>
      <div className="mb-48 z-20">
        <div className="flex justify-between gap-6 w-full">
          <div>
            <h2 className="font-bold scale-y-125 text-lg">
              Chat with a Twin and Share your Social Card
            </h2>
            <p className="mt-1 max-w-lg">
              Start a chat, and share your social card online. Everything
              transparent and onchain. Consciousness spread at scale.
            </p>
          </div>

          {/* <div
            className="absolute top-0 right-0 inline-flex items-center justify-center shrink-0 border border-border px-5 py-2.5
          bg-black text-white text-xs
          ring-1 ring-inset ring-white/20
          backdrop-blur
          transition-colors duration-200 ease-out-quart"
          >
            <span className="ph ph-[arrow-up-right] mr-2" aria-hidden></span>
            Choose your Twin.
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default HowToBanner;
