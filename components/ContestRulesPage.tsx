import React, { useEffect, useMemo, useState } from "react";
import { CATEGORY_METADATA, ShareCategory } from "../types";
import { FIGURES } from "../constants";
import { TagOption } from "../types/app";
import Modal from "./dialog/Modal";
import { XPostMock } from "./XPostMock";

type ContestRulesPageProps = {
  onBackHome?: () => void;
  onStartRandom?: () => void;
};

const timeline = [
  {
    title: "Submissions open",
    detail: "Live during the competition window.",
  },
  {
    title: "Daily judging",
    detail: "AI agents score and highlight standout chats in real time.",
  },
  {
    title: "Winners posted",
    detail: "Top out-of-context moments published on twin.ar.io/outofcontext.",
  },
];

const ContestRulesPage: React.FC<ContestRulesPageProps> = ({
  onBackHome,
  onStartRandom,
}) => {
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

  const tagOptions = useMemo<TagOption[]>(() => {
    return Object.values(ShareCategory).map((category) => {
      const meta = CATEGORY_METADATA[category];
      return {
        emoji: meta.emoji,
        label: meta.label,
        color: meta.color,
      };
    });
  }, []);

  return (
    <div className="sm:mx-auto max-w-2xl animate-fade-in text-neutral-900 px-0 py-0 sm:px-4">
      <div className="relative overflow-hidden sm:border sm:border-border bg-white pt-2 pb-4 px-4 sm:p-6 md:p-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg,#000 0px,#000 1px,transparent 1px,transparent 10px),repeating-linear-gradient(-45deg,#000 0px,#000 1px,transparent 1px,transparent 10px)",
            backgroundSize: "14px 14px, 14px 14px",
          }}
        />

        <div className="relative flex flex-col gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <img
              src="/resources/Twin_Logo.svg"
              alt="Twin"
              className="h-4 w-auto"
            />
            <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
              OUT OF CONTEXT
            </span>
          </div>
        </div>

        <div className="relative mt-4 sm:mt-8">
          <div>
            <div className="flex items-center gap-2 text-[10px] sm:text-[11px] uppercase tracking-wide text-neutral-600">
              <span className="ph ph-[sparkle] text-sm sm:text-base"></span>
              How to enter
            </div>
            <h2 className="mt-2 text-base sm:text-lg font-semibold">
              SHARE YOUR OUT OF CONTEXT MOMENTS ON X.
            </h2>
            <p className="mt-2 text-xs sm:text-xs text-neutral-700">
              AI judges score entries, category winners get highlighted, and the
              best posts live forever on Arweave.
            </p>

            {/* Step-by-step guide */}
            <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-5">
              {/* Step 1: Chat with a twin */}
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px] sm:text-xs font-semibold mt-0.5">
                  1
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-neutral-900 font-medium mb-2 sm:mb-3">
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
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px] sm:text-xs font-semibold mt-0.5">
                  2
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-neutral-900 font-medium mb-2 sm:mb-3">
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
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px] sm:text-xs font-semibold mt-0.5">
                  3
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-neutral-900 font-medium mb-2 sm:mb-3">
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

            <div className="mt-4 grayscale hover:grayscale-0 transition-all duration-300">
              <XPostMock
                tagOptions={tagOptions}
                onClick={() => {
                  // Handler is managed inside XPostMock component
                }}
              />
            </div>
          </div>
        </div>

        <div className="relative mt-4 sm:mt-10">
          <div className="flex justify-center mb-4 sm:mb-6">
            <p className="text-center text-xl sm:text-2xl md:text-3xl font-quote font-normal text-neutral-700 max-w-lg">
              &ldquo;Before AI takes over the world, please read through this
              checklist. Trust us, they&rsquo;re already watching.&rdquo;
            </p>
          </div>
          <div className="border border-border bg-white/70 p-4 md:p-5 shadow-sm backdrop-blur-sm">
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => {
                  setExpandedItem(expandedItem === 1 ? null : 1);
                }}
                className="group relative flex items-center min-h-[44px] gap-3 border border-border bg-white p-4 sm:p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] cursor-pointer text-left overflow-hidden hover:bg-neutral-50 active:bg-neutral-50 touch-manipulation hover:border-neutral-300 active:border-neutral-300 transition-[background-color,border-color] duration-200 ease focus-visible:outline-2 focus-visible:outline-neutral-400 focus-visible:outline-offset-2"
              >
                <div
                  className={`flex h-8 w-8 sm:h-6 sm:w-6 shrink-0 items-center justify-center transition-[color,transform] duration-200 ease-out will-change-transform group-hover:-translate-y-0.5 group-hover:scale-110 group-active:scale-105 ${
                    expandedItem === 1 ? "text-red-500" : "text-neutral-600"
                  }`}
                >
                  <span className="ph ph-[eye-slash] text-[16px] sm:text-[18px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-[11px] uppercase tracking-wide text-neutral-500">
                    Redact sensitive info
                  </p>
                  <div
                    className={`grid overflow-hidden will-change-[grid-template-rows,opacity,filter] ${
                      expandedItem === 1
                        ? "opacity-100 blur-0"
                        : "opacity-0 blur-[2px]"
                    }`}
                    style={{
                      gridTemplateRows: expandedItem === 1 ? "1fr" : "0fr",
                      transition:
                        "grid-template-rows 200ms cubic-bezier(.165, .84, .44, 1), opacity 200ms cubic-bezier(.165, .84, .44, 1), filter 100ms cubic-bezier(.165, .84, .44, 1)",
                    }}
                  >
                    <div className="min-h-0 pt-2 border-t border-neutral-200">
                      <p className="text-xs sm:text-xs text-neutral-600 leading-relaxed">
                        Use image editing tools or blur features to cover up any
                        wallet addresses, transaction IDs, or other personally
                        identifiable information. This protects your privacy and
                        keeps submissions safe for public viewing.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center min-w-[24px] min-h-[24px] sm:min-w-0 sm:min-h-0">
                  <svg
                    className={`w-5 h-5 sm:w-4 sm:h-4 transition-transform ${
                      expandedItem === 1 ? "rotate-180" : ""
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

              <button
                type="button"
                onClick={() => {
                  setExpandedItem(expandedItem === 2 ? null : 2);
                }}
                className="group relative flex items-center min-h-[44px] gap-3 border border-border bg-white p-4 sm:p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] cursor-pointer text-left overflow-hidden hover:bg-neutral-50 active:bg-neutral-50 touch-manipulation hover:border-neutral-300 active:border-neutral-300 transition-[background-color,border-color] duration-200 ease focus-visible:outline-2 focus-visible:outline-neutral-400 focus-visible:outline-offset-2"
              >
                <div
                  className={`flex h-8 w-8 sm:h-6 sm:w-6 shrink-0 items-center justify-center transition-[color,transform] duration-200 ease-out will-change-transform group-hover:-translate-y-0.5 group-hover:scale-110 group-active:scale-105 ${
                    expandedItem === 2 ? "text-blue-500" : "text-neutral-600"
                  }`}
                >
                  <span className="ph ph-[info] text-[16px] sm:text-[18px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-[11px] uppercase tracking-wide text-neutral-500">
                    Tag your moment
                  </p>
                  <div
                    className={`grid overflow-hidden will-change-[grid-template-rows,opacity,filter] ${
                      expandedItem === 2
                        ? "opacity-100 blur-0"
                        : "opacity-0 blur-[2px]"
                    }`}
                    style={{
                      gridTemplateRows: expandedItem === 2 ? "1fr" : "0fr",
                      transition:
                        "grid-template-rows 200ms cubic-bezier(.165, .84, .44, 1), opacity 200ms cubic-bezier(.165, .84, .44, 1), filter 100ms cubic-bezier(.165, .84, .44, 1)",
                    }}
                  >
                    <div className="min-h-0 pt-2 border-t border-neutral-200">
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        Include the name of the Digital Twin you were chatting
                        with (e.g., "Satoshi", "Obama", "Ayn Rand"). Select the
                        category tag that best matches the moment—whether
                        it&apos;s unhinged, wholesome, oddly specific, cursed,
                        advice, or out of character. This helps judges quickly
                        understand your submission.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center min-w-[24px] min-h-[24px] sm:min-w-0 sm:min-h-0">
                  <svg
                    className={`w-5 h-5 sm:w-4 sm:h-4 transition-transform ${
                      expandedItem === 2 ? "rotate-180" : ""
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

              <button
                type="button"
                onClick={() => {
                  setExpandedItem(expandedItem === 3 ? null : 3);
                }}
                className="group relative flex items-center min-h-[44px] gap-3 border border-border bg-white p-4 sm:p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] cursor-pointer text-left overflow-hidden hover:bg-neutral-50 active:bg-neutral-50 touch-manipulation hover:border-neutral-300 active:border-neutral-300 transition-[background-color,border-color] duration-200 ease focus-visible:outline-2 focus-visible:outline-neutral-400 focus-visible:outline-offset-2"
              >
                <div
                  className={`flex h-8 w-8 sm:h-6 sm:w-6 shrink-0 items-center justify-center transition-[color,transform] duration-200 ease-out will-change-transform group-hover:-translate-y-0.5 group-hover:scale-110 group-active:scale-105 ${
                    expandedItem === 3 ? "text-amber-500" : "text-neutral-600"
                  }`}
                >
                  <span className="ph ph-[sparkle] text-[16px] sm:text-[18px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-[11px] uppercase tracking-wide text-neutral-500">
                    One moment per entry
                  </p>
                  <div
                    className={`grid overflow-hidden will-change-[grid-template-rows,opacity,filter] ${
                      expandedItem === 3
                        ? "opacity-100 blur-0"
                        : "opacity-0 blur-[2px]"
                    }`}
                    style={{
                      gridTemplateRows: expandedItem === 3 ? "1fr" : "0fr",
                      transition:
                        "grid-template-rows 200ms cubic-bezier(.165, .84, .44, 1), opacity 200ms cubic-bezier(.165, .84, .44, 1), filter 100ms cubic-bezier(.165, .84, .44, 1)",
                    }}
                  >
                    <div className="min-h-0 pt-2 border-t border-neutral-200">
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        Focus on quality over quantity. Each submission should
                        highlight a single standout moment from your
                        conversation. If you have multiple great moments, submit
                        them separately. This makes judging easier and gives
                        each moment its best chance to shine.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center min-w-[24px] min-h-[24px] sm:min-w-0 sm:min-h-0">
                  <svg
                    className={`w-5 h-5 sm:w-4 sm:h-4 transition-transform ${
                      expandedItem === 3 ? "rotate-180" : ""
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

              <button
                type="button"
                onClick={() => {
                  setExpandedItem(expandedItem === 4 ? null : 4);
                }}
                className="group relative flex items-center min-h-[44px] gap-3 border border-border bg-white p-4 sm:p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] cursor-pointer text-left overflow-hidden hover:bg-neutral-50 active:bg-neutral-50 touch-manipulation hover:border-neutral-300 active:border-neutral-300 transition-[background-color,border-color] duration-200 ease focus-visible:outline-2 focus-visible:outline-neutral-400 focus-visible:outline-offset-2"
              >
                <div
                  className={`flex h-8 w-8 sm:h-6 sm:w-6 shrink-0 items-center justify-center transition-[color,transform] duration-200 ease-out will-change-transform group-hover:-translate-y-0.5 group-hover:scale-110 group-active:scale-105 ${
                    expandedItem === 4 ? "text-emerald-500" : "text-neutral-600"
                  }`}
                >
                  <span className="ph ph-[smiley] text-[16px] sm:text-[18px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-[11px] uppercase tracking-wide text-neutral-500">
                    Keep it fun and clean
                  </p>
                  <div
                    className={`grid overflow-hidden will-change-[grid-template-rows,opacity,filter] ${
                      expandedItem === 4
                        ? "opacity-100 blur-0"
                        : "opacity-0 blur-[2px]"
                    }`}
                    style={{
                      gridTemplateRows: expandedItem === 4 ? "1fr" : "0fr",
                      transition:
                        "grid-template-rows 200ms cubic-bezier(.165, .84, .44, 1), opacity 200ms cubic-bezier(.165, .84, .44, 1), filter 100ms cubic-bezier(.165, .84, .44, 1)",
                    }}
                  >
                    <div className="min-h-0 pt-2 border-t border-neutral-200">
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        This competition is meant to be fun and entertaining.
                        Keep submissions lighthearted and respectful. Any
                        content that includes hate speech, harassment, doxxing,
                        or other harmful material will be disqualified.
                        Let&apos;s keep the community positive and enjoyable for
                        everyone.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center min-w-[24px] min-h-[24px] sm:min-w-0 sm:min-h-0">
                  <svg
                    className={`w-5 h-5 sm:w-4 sm:h-4 transition-transform ${
                      expandedItem === 4 ? "rotate-180" : ""
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

              <button
                type="button"
                onClick={() => {
                  setExpandedItem(expandedItem === 5 ? null : 5);
                }}
                className="group relative flex items-center min-h-[44px] gap-3 border border-border bg-white p-4 sm:p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] cursor-pointer text-left overflow-hidden hover:bg-neutral-50 active:bg-neutral-50 touch-manipulation hover:border-neutral-300 active:border-neutral-300 transition-[background-color,border-color] duration-200 ease focus-visible:outline-2 focus-visible:outline-neutral-400 focus-visible:outline-offset-2"
              >
                <div
                  className={`flex h-8 w-8 sm:h-6 sm:w-6 shrink-0 items-center justify-center transition-[color,transform] duration-200 ease-out will-change-transform group-hover:-translate-y-0.5 group-hover:scale-110 group-active:scale-105 ${
                    expandedItem === 5 ? "text-indigo-500" : "text-neutral-600"
                  }`}
                >
                  <span className="ph ph-[target] text-[16px] sm:text-[18px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-[11px] uppercase tracking-wide text-neutral-500">
                    What counts in the competition
                  </p>
                  <div
                    className={`grid overflow-hidden will-change-[grid-template-rows,opacity,filter] ${
                      expandedItem === 5
                        ? "opacity-100 blur-0"
                        : "opacity-0 blur-[2px]"
                    }`}
                    style={{
                      gridTemplateRows: expandedItem === 5 ? "1fr" : "0fr",
                      transition:
                        "grid-template-rows 200ms cubic-bezier(.165, .84, .44, 1), opacity 200ms cubic-bezier(.165, .84, .44, 1), filter 100ms cubic-bezier(.165, .84, .44, 1)",
                    }}
                  >
                    <div className="min-h-0 pt-2 border-t border-neutral-200">
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        Screenshots or snippets from your Twin chats that feel
                        out-of-context, unhinged, eerily accurate, or just
                        hilariously wrong.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center min-w-[24px] min-h-[24px] sm:min-w-0 sm:min-h-0">
                  <svg
                    className={`w-5 h-5 sm:w-4 sm:h-4 transition-transform ${
                      expandedItem === 5 ? "rotate-180" : ""
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

              <button
                type="button"
                onClick={() => {
                  setExpandedItem(expandedItem === 6 ? null : 6);
                }}
                className="group relative flex items-center min-h-[44px] gap-3 border border-border bg-white p-4 sm:p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] cursor-pointer text-left overflow-hidden hover:bg-neutral-50 active:bg-neutral-50 touch-manipulation hover:border-neutral-300 active:border-neutral-300 transition-[background-color,border-color] duration-200 ease focus-visible:outline-2 focus-visible:outline-neutral-400 focus-visible:outline-offset-2"
              >
                <div
                  className={`flex h-8 w-8 sm:h-6 sm:w-6 shrink-0 items-center justify-center transition-[color,transform] duration-200 ease-out will-change-transform group-hover:-translate-y-0.5 group-hover:scale-110 group-active:scale-105 ${
                    expandedItem === 6 ? "text-purple-500" : "text-neutral-600"
                  }`}
                >
                  <span className="ph ph-[gavel] text-[16px] sm:text-[18px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-[11px] uppercase tracking-wide text-neutral-500">
                    How judging works
                  </p>
                  <div
                    className={`grid overflow-hidden will-change-[grid-template-rows,opacity,filter] ${
                      expandedItem === 6
                        ? "opacity-100 blur-0"
                        : "opacity-0 blur-[2px]"
                    }`}
                    style={{
                      gridTemplateRows: expandedItem === 6 ? "1fr" : "0fr",
                      transition:
                        "grid-template-rows 200ms cubic-bezier(.165, .84, .44, 1), opacity 200ms cubic-bezier(.165, .84, .44, 1), filter 100ms cubic-bezier(.165, .84, .44, 1)",
                    }}
                  >
                    <div className="min-h-0 pt-2 border-t border-neutral-200">
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        AI judges evaluate for originality, entertainment, and
                        alignment with the chosen category. Winners are pinned
                        during the event.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center min-w-[24px] min-h-[24px] sm:min-w-0 sm:min-h-0">
                  <svg
                    className={`w-5 h-5 sm:w-4 sm:h-4 transition-transform ${
                      expandedItem === 6 ? "rotate-180" : ""
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
            </div>
          </div>
        </div>

        <div className="relative mt-10">
          <div>
            <div className="flex items-center gap-2 text-[10px] sm:text-[11px] uppercase tracking-wide text-neutral-600">
              <span className="ph ph-[calendar] text-sm sm:text-base"></span>
              Timeline
            </div>
            <div className="mt-4 relative">
              <div>
                {timeline.map((item, index) => {
                  const isFirst = index === 0;
                  const isLast = index === timeline.length - 1;

                  return (
                    <div
                      key={item.title}
                      className={`relative pl-8 sm:pl-10 ${
                        !isLast ? "pb-2 sm:pb-3" : ""
                      }`}
                    >
                      {/* Rail segments (stop at the center of first/last marker) */}
                      {!isFirst && (
                        <div className="absolute left-[8px] sm:left-[10px] top-0 h-[20px] sm:h-[26px] w-px bg-border z-0" />
                      )}
                      {!isLast && (
                        <div className="absolute left-[8px] sm:left-[10px] top-[20px] sm:top-[26px] bottom-0 w-px bg-border z-0" />
                      )}

                      {/* Step marker (small square) */}
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
          </div>
        </div>

        <div className="relative mt-10">
          <button
            type="button"
            onClick={() => onStartRandom?.()}
            className="relative flex min-h-[60px] sm:min-h-[auto] w-full items-center gap-3 border border-neutral-800 bg-neutral-900 p-4 sm:p-4 cursor-pointer text-left hover:bg-neutral-800 active:bg-neutral-800 touch-manipulation hover:shadow-lg hover:shadow-neutral-900/20 active:scale-[0.98] transition-[background-color,box-shadow,transform] duration-300 ease-out-circ overflow-hidden"
          >
            <img
              src="/resources/UI_loop.gif"
              className="absolute inset-0 w-full h-full object-cover object-[20%_65%] opacity-50 pointer-events-none"
              aria-hidden="true"
              alt=""
            />
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/60 via-neutral-900/50 to-neutral-900/60" />
            <div className="relative z-10 flex h-8 w-8 sm:h-6 sm:w-6 shrink-0 items-center justify-center text-white">
              <span className="ph ph-[rocket-launch] text-[16px] sm:text-[18px]" />
            </div>
            <div className="relative z-10 min-w-0 flex-1">
              <p className="text-xs sm:text-[11px] uppercase tracking-wide text-white">
                Start competition
              </p>
              <p className="mt-1 text-xs sm:text-xs text-neutral-200 leading-relaxed">
                Chat with a Digital Twin to generate your Out of Context card.
              </p>
            </div>
            <div className="relative z-10 flex items-center min-w-[24px] min-h-[24px] sm:min-w-0 sm:min-h-0 text-white">
              <span className="ph ph-[arrow-up-right] text-[16px] sm:text-[18px]" />
            </div>
          </button>
        </div>

        <div className="relative mt-4">
          <button
            type="button"
            onClick={() => setIsLegalOpen(true)}
            className="group relative flex min-h-[60px] sm:min-h-[auto] gap-3 border border-border bg-neutral-50 p-4 sm:p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] cursor-pointer text-left w-full hover:bg-neutral-100 active:bg-neutral-100 touch-manipulation hover:border-neutral-300 active:border-neutral-300 active:scale-[0.98] transition-[background-color,border-color,transform] duration-300 ease-out-circ"
          >
            <div className="flex h-8 w-8 sm:h-6 sm:w-6 shrink-0 items-center justify-center text-neutral-600">
              <span className="ph ph-[scales] text-[16px] sm:text-[18px]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-[11px] uppercase tracking-wide text-neutral-500">
                Legal requirements
              </p>
              <p className="mt-1 text-xs sm:text-xs text-neutral-700 leading-relaxed">
                Review terms and conditions before submitting.
              </p>
            </div>
            <div className="flex items-center min-w-[24px] min-h-[24px] sm:min-w-0 sm:min-h-0 text-neutral-600">
              <span className="ph ph-[arrow-up-right] text-[16px] sm:text-[18px]" />
            </div>
          </button>
        </div>

        <Modal
          isOpen={isLegalOpen}
          onClose={() => setIsLegalOpen(false)}
          title="Legal"
        >
          <div className="space-y-3 text-xs text-neutral-800">
            <p className="text-neutral-700">
              Placeholder legal requirements. Replace with final terms before
              launch.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-neutral-700">
              <li>
                By submitting content, you confirm you have the rights to share
                it and that it doesn&apos;t violate others&apos; rights.
              </li>
              <li>
                Do not submit personal data (including wallet addresses) or
                confidential information. You are responsible for redaction.
              </li>
              <li>
                Submissions may be reviewed, scored, and publicly displayed as
                part of the competition.
              </li>
              <li>
                Submissions must comply with applicable laws and must not
                include harassment, hate speech, or illegal content.
              </li>
              <li>
                The competition is provided &quot;as is&quot; without
                warranties. Organizers may modify rules or disqualify entries at
                any time.
              </li>
            </ul>
            <p className="text-[11px] text-neutral-500">
              Note: This copy is a mock. Add your official terms, privacy
              policy, eligibility, and licensing language.
            </p>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ContestRulesPage;
