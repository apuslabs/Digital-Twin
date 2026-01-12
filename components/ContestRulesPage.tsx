import React, { useState } from "react";
import { CATEGORY_METADATA, ShareCategory } from "../types";
import Modal from "./dialog/Modal";

type ContestRulesPageProps = {
  onBackHome?: () => void;
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

const ContestRulesPage: React.FC<ContestRulesPageProps> = ({ onBackHome }) => {
  const [isLegalOpen, setIsLegalOpen] = useState(false);

  return (
    <div className="container mx-auto animate-fade-in text-neutral-900">
      <div className="relative overflow-hidden border border-border bg-white p-6 md:p-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg,#000 0px,#000 1px,transparent 1px,transparent 10px),repeating-linear-gradient(-45deg,#000 0px,#000 1px,transparent 1px,transparent 10px)",
            backgroundSize: "14px 14px, 14px 14px",
          }}
        />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2 max-w-3xl">
            <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
              Twin Out of Context
            </p>
            <h1 className="text-2xl font-semibold">Competition Rules</h1>
            <p className="text-xs text-neutral-700">
              Share the most outrageous, unexpected, or perfectly on-brand
              moments from your Digital Twin chats. AI judges score entries,
              category winners get highlighted, and the best clips live forever
              on Arweave.
            </p>
          </div>
          <div className="relative flex flex-col items-end gap-2 shrink-0">
            <a
              href="https://twin.ar.io"
              className="inline-flex items-center gap-2 border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs uppercase tracking-wide text-white hover:opacity-80 transition-colors"
            >
              <span className="ph ph-[arrow-up-right]"></span>
              Start Competition
            </a>
          </div>
        </div>

        <div className="relative mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="border border-border bg-white/80 p-4">
            <p className="text-[11px] uppercase tracking-wide text-neutral-500 flex items-center gap-2">
              <span className="ph ph-[target]"></span>
              What counts
            </p>
            <p className="mt-2 text-xs text-neutral-800">
              Screenshots or snippets from your Twin chats that feel
              out-of-context, unhinged, eerily accurate, or just hilariously
              wrong.
            </p>
          </div>
          <div className="border border-border bg-white/80 p-4">
            <p className="text-[11px] uppercase tracking-wide text-neutral-500 flex items-center gap-2">
              <span className="ph ph-[share-network]"></span>
              How to share
            </p>
            <p className="mt-2 text-xs text-neutral-800">
              Capture the moment, redact sensitive info, and post the quote or
              screenshot. Include the category tag that fits best.
            </p>
          </div>
          <div className="border border-border bg-white/80 p-4">
            <p className="text-[11px] uppercase tracking-wide text-neutral-500 flex items-center gap-2">
              <span className="ph ph-[gavel]"></span>
              How judging works
            </p>
            <p className="mt-2 text-xs text-neutral-800">
              AI judges evaluate for originality, entertainment, and alignment
              with the chosen category. Winners are pinned during the event.
            </p>
          </div>
        </div>

        <div className="relative mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-neutral-600">
              <span className="ph ph-[calendar]"></span>
              Timeline
            </div>
            <h2 className="mt-2 text-lg font-semibold">
              Quick schedule for the competition window.
            </h2>
            <div className="mt-4 space-y-8 border-l-2 border-border pl-4 relative">
              {timeline.map((item) => (
                <div key={item.title} className="relative">
                  <div
                    className="absolute top-[0.5rem] h-2 w-2 bg-neutral-900 -translate-x-1/2"
                    style={{ left: "calc(-1rem - 1px)" }}
                  />
                  <p className="text-xs font-semibold text-neutral-900 leading-tight">
                    {item.title}
                  </p>
                  <p className="text-xs text-neutral-700 mt-1">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-neutral-600">
              <span className="ph ph-[sparkle]"></span>
              Categories
            </div>
            <h2 className="mt-2 text-lg font-semibold">
              Tag each entry so judges can find it fast.
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Object.values(ShareCategory).map((category) => {
                const meta = CATEGORY_METADATA[category];
                return (
                  <div
                    key={category}
                    className="flex flex-col gap-2 border border-border bg-white/80 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-neutral-900">
                        {meta.label}
                      </span>
                      <span className="text-lg" aria-hidden>
                        {meta.emoji}
                      </span>
                    </div>
                    <div
                      className="h-1 w-full"
                      style={{ backgroundColor: meta.color }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="relative mt-10">
          <div className="border border-border bg-white/70 p-4 md:p-5 shadow-sm backdrop-blur-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-neutral-600">
                <span className="ph ph-[check-circle]"></span>
                Quick checklist
              </div>
              <p className="text-[11px] text-neutral-500">
                Keep submissions clean and easy to judge.
              </p>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="group relative flex h-full gap-3 border border-border bg-white p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] transition-all hover:border-neutral-400 hover:shadow-md">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-neutral-900 text-[11px] font-semibold text-white">
                  1
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-neutral-900">
                    Redact sensitive info
                  </p>
                  <p className="mt-1 text-xs text-neutral-700 leading-relaxed">
                    Remove wallet addresses or personal details before sharing.
                  </p>
                </div>
              </div>

              <div className="group relative flex h-full gap-3 border border-border bg-white p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] transition-all hover:border-neutral-400 hover:shadow-md">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-neutral-900 text-[11px] font-semibold text-white">
                  2
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-neutral-900">
                    Add context
                  </p>
                  <p className="mt-1 text-xs text-neutral-700 leading-relaxed">
                    Mention the twin name and choose the best-fitting category.
                  </p>
                </div>
              </div>

              <div className="group relative flex h-full gap-3 border border-border bg-white p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] transition-all hover:border-neutral-400 hover:shadow-md">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-neutral-900 text-[11px] font-semibold text-white">
                  3
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-neutral-900">
                    One moment per entry
                  </p>
                  <p className="mt-1 text-xs text-neutral-700 leading-relaxed">
                    Submit one clip/snippet at a time—pick your strongest one.
                  </p>
                </div>
              </div>

              <div className="group relative flex h-full gap-3 border border-border bg-white p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] transition-all hover:border-neutral-400 hover:shadow-md">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-neutral-900 text-[11px] font-semibold text-white">
                  4
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-neutral-900">
                    Keep it playful
                  </p>
                  <p className="mt-1 text-xs text-neutral-700 leading-relaxed">
                    No hate speech, harassment, or doxxing.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsLegalOpen(true)}
                className="group relative flex h-full gap-3 border border-border bg-white p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] transition-all hover:border-neutral-400 hover:shadow-md cursor-pointer text-left"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-neutral-900 text-[11px] font-semibold text-white">
                  5
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-neutral-900">
                    Legal requirements
                  </p>
                  <p className="mt-1 text-xs text-neutral-700 leading-relaxed">
                    Review terms and conditions before submitting.
                  </p>
                </div>
              </button>
            </div>
          </div>
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
